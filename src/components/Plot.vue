<template>
  <div class="w-100 h-100 d-flex flex-wrap align-content-between">
    <charts :data="data" :labels="labels" :width="592" :height="320"></charts>
    <div class="w-100 d-flex flex-row-reverse">
      <button class="btn btn-outline-dark m-1" @click="clear">Clear</button>
    </div>
  </div>
</template>

<script>
import charts from '@/components/charts'

export default {
  name: 'Plot',
  data () {
    return {
      data: [],
      labels: [],
      labelIndex: {}
    }
  },
  created () {
    this.$emit('dataFunction', this.onData)
  },
  methods: {
    clear () {
      this.data = this.data.map(v => [])
    },
    onData (data) {
      data.forEach(({ tag, data }) => {
        if (tag in this.labelIndex) {
          this.data[this.labelIndex[tag]].push(data)
        } else {
          this.labelIndex[tag] = this.labels.length
          this.labels.push(tag)
          this.data.push([data])
        }
      })
    }
  },
  async mounted () {
    /*
    ipcRenderer.on('data', (event, arg) => {
      arg.forEach(({ tag, data }) => {
        if (tag in this.labelIndex) {
          this.data[this.labelIndex[tag]].push(data)
        } else {
          this.labelIndex[tag] = this.labels.length
          this.labels.push(tag)
          this.data.push([data])
        }
      })
    }) */
  },
  components: {
    charts
  }
}
</script>

<style scoped>

</style>
