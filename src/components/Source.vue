<template>
  <div class="d-flex flex-column">
    <form @submit="add">
      <div class="input-group mb-1">
        <input type="text"
               class="form-control"
               placeholder="Program command..."
               v-model="cmd">
        <button class="btn btn-outline-dark" type="button">
          <i class="fas fa-ellipsis-h" @click="select"></i>
        </button>
        <button class="btn btn-outline-dark" type="submit">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </form>
    <div class="border rounded flex-grow-1 overflow-scroll p-1">
      <div class="input-group mb-1" v-for="item in sourcesArray">
        <span class="input-group-text">{{ item[0] }}</span>
        <input class="form-control" :value="item[1].cmd" disabled>
        <button class="btn btn-outline-danger" @click="del(item[0])">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <input type="file" style="display: none" ref="file" @input="selectInput">
  </div>
</template>

<script>
import { spawn } from 'child_process'
import shellParser from 'shell-parser'
import readline from 'readline'

const sources = new Map()
export default {
  name: 'Source',
  data () {
    return {
      cmd: '/Users/ziyihuang/source/test_c/a.out',
      sourcesArray: []
    }
  },
  methods: {
    update () {
      this.sourcesArray = Array.from(sources)
      this.$emit('update', this.sourcesArray)
    },
    add (e) {
      e.preventDefault()
      const arg = shellParser(this.cmd)
      let source
      if (process.platform === 'win32') {
        source = spawn(arg[0], arg.slice(1))
      } else {
        // unbuffered
        source = spawn('stdbuf', ['-i0', '-oL', ...arg])
      }
      if (!source.pid) {
        return
      }
      const rl = readline.createInterface(source.stdout)
      rl.on('line', line => {
        console.debug(line)
        this.$emit('message', line)
      })
      source.on('close', () => {
        sources.delete(source.pid)
        rl.close()
        this.update()
      })
      sources.set(source.pid, { source, cmd: this.cmd })
      this.update()
    },
    del (pid) {
      sources.get(pid).source.kill()
    },
    select () {
      this.$refs.file.click()
    },
    selectInput () {
      this.cmd = this.$refs.file.files[0].path
    }
  }
}
</script>

<style scoped>

</style>
