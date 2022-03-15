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
        <span class="input-group-text">{{ item.pid }}</span>
        <input class="form-control" :value="item.cmd" disabled>
        <button class="btn btn-outline-danger" @click="del(item.pid)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <input type="file" style="display: none" ref="file" @input="selectInput">
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'Source',
  data () {
    return {
      cmd: '/Users/ziyihuang/source/test_c/a.out',
      sourcesArray: []
    }
  },
  async mounted () {
    ipcRenderer.on('updateSource', (event, sourcesArray) => {
      this.sourcesArray = sourcesArray
    })
    this.sourcesArray = await ipcRenderer.invoke('getSource')
  },
  methods: {
    add (e) {
      e.preventDefault()
      ipcRenderer.invoke('addSource', this.cmd)
    },
    del (pid) {
      ipcRenderer.invoke('delSource', pid)
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
