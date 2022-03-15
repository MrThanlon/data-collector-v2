<template>
  <div class="w-100 d-flex flex-column">
    <form @submit="send">
      <div class="input-group mb-1">
        <input type="text"
               ref="input"
               class="form-control"
               placeholder="Message to..."
               v-model="input">
        <select class="form-select" style="width: 5%" v-model="messageTo">
          <option value="-1" selected>All</option>
          <option v-for="(source, idx) in sources" :value="idx">
            {{ source[0]+':'+source[1].cmd }}
          </option>
        </select>
        <button class="btn btn-outline-dark" type="submit">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn btn-outline-dark" type="button" @click="text=''">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </form>
    <pre ref="text">{{ text }}</pre>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'Message',
  props: {
    sources: Array
  },
  data () {
    return {
      input: '',
      messageTo: '-1',
      text: ''
    }
  },
  methods: {
    send (e) {
      e.preventDefault()
      if (this.input === '') {
        return
      }
      ipcRenderer.invoke('sendSource', this.messageTo, this.input)
      this.input = ''
    }
  },
  mounted () {
    ipcRenderer.on('data', (event, { text }) => {
      this.text += text
    })
  },
  updated () {
    // FIXME
    // this.$refs.text.scrollToBottom()
  }
}
</script>

<style scoped>

</style>
