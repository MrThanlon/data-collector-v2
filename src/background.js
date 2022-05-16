'use strict'

import { app, protocol, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { spawn } from 'child_process'
import shellParser from 'shell-parser'
import readline from 'readline'
import sqlite3 from 'sqlite3'

const isDevelopment = process.env.NODE_ENV !== 'production'

let db = new sqlite3.Database(':memory:')
let insertStatement = null
db.serialize(() => {
  db.run('CREATE TABLE data (time UNSIGNED BIG INT NOT NULL, tag TEXT NOT NULL, value REAL NOT NULL)')
  db.run('CREATE INDEX time ON data (time)')
  db.run('CREATE INDEX tag ON data (tag)')
  insertStatement = db.prepare('INSERT INTO data (time, tag, value) VALUES (?, ?, ?)')
})
let dbBleedingData = []
let dbBleeding = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow

function pad0 (num, length) {
  num = num.toString()
  return '0'.repeat(length - num.length) + num
}
/**
 * @param date {Date}
 * @return {String}
 */
function dateFormat (date) {
  return `${pad0(date.getHours(), 2)}:${pad0(date.getMinutes(), 2)}:${pad0(date.getSeconds(), 2)}.${pad0(date.getMilliseconds(), 3)}`
}

// source pool
const sources = new Map()

/**
 * @param {Map} sources
 * @return {Array}
 */
function serializeSources (sources) {
  const result = []
  sources.forEach((source, pid) => {
    result.push({ pid, cmd: source.cmd })
  })
  return result
}
ipcMain.handle('addSource', (event, cmd) => {
  const arg = shellParser(cmd)
  let source
  if (process.platform === 'win32') {
    source = spawn(arg[0], arg.slice(1))
  } else {
    // unbuffered
    source = spawn('stdbuf', ['-i0', '-oL', ...arg])
  }
  if (!source.pid) {
    return false
  }
  const rl = readline.createInterface(source.stdout)
  rl.on('line', line => {
    // TODO: parse and tell render process
    const dateStr = dateFormat(new Date())
    const now = Date.now()
    const regex = /(?:([a-z_-]*)[^a-z0-9_-]+)?(-?\d+(?:\.\d*)?)/ig
    const result = []
    let m
    let idx = 1
    while ((m = regex.exec(line)) !== null) {
      const tag = m[1] || `channel ${idx}`
      const data = parseFloat(m[2])
      // insert db
      if (dbBleeding) {
        dbBleedingData.push({ time: now, tag, value: data })
      } else {
        insertStatement.run(now, tag, data)
      }
      // to window
      result.push({ tag, data })
      idx += 1
    }
    mainWindow.webContents.send('data', {
      result,
      dateStr,
      text: '<<' + dateStr + ':' + line + '\n'
    })
  })
  source.on('close', () => {
    sources.delete(source.pid)
    rl.close()
    mainWindow.webContents.send('updateSource', serializeSources(sources))
  })
  sources.set(source.pid, { source, cmd })
  mainWindow.webContents.send('updateSource', serializeSources(sources))
})
ipcMain.handle('delSource', (event, pid) => {
  sources.get(pid).source.kill()
})
ipcMain.handle('getSource', event => serializeSources(sources))
ipcMain.handle('sendSource', (event, to, message) => {
  // TODO
})

async function createWindow () {
  // menu
  const menuTemplate = [
    {
      role: 'appMenu'
    },
    {
      role: 'fileMenu',
      submenu: [
        {
          label: 'Open... (TODO)',
          accelerator: 'CommandOrControl+O',
          enabled: false,
          async click () {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: [
                'openFile', 'showHiddenFiles', 'createDirectory',
                'promptToCreate'
              ]
            })
            if (result.canceled) {
              return
            }
            const filePath = result.filePaths[0]
            console.debug(filePath)
            // TODO
          }
        },
        {
          label: 'Save',
          accelerator: 'CommandOrControl+S',
          async click () {
            const result = await dialog.showSaveDialog(mainWindow, {
              properties: ['showHiddenFiles', 'createDirectory', 'showOverwriteConfirmation']
            })
            if (result.canceled) {
              return
            }
            const filePath = result.filePath
            const backup = db.backup(filePath)
            backup.step(-1, e => {
              if (e) throw e
              backup.finish(e => {
                if (e) throw e
                // saved
                db.close()
                db = new sqlite3.Database(filePath)
                insertStatement = db.prepare('INSERT INTO data (time, tag, value) VALUES (?, ?, ?)', e => {
                  // write bleeding data
                  dbBleedingData.forEach(({ time, tag, value }) => {
                    insertStatement.run(time, tag, value)
                  })
                  dbBleedingData = []
                  dbBleeding = false
                })
              })
            })
            dbBleeding = true
          }
        },
        {
          label: 'Append saving (TODO)',
          enabled: false
          // TODO
        }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      role: 'viewMenu'
    },
    {
      role: 'windowMenu'
    },
    {
      role: 'help'
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
