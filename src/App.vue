<template>
  <div class="w-100 d-flex justify-content-between" style="height: 100vh">
    <div class="col-5 p-1" style="padding-right: 0!important;">
      <Source class="h-50 pb-1"
              @update="sourcesArray=$event"
              @message="parseMessage"></Source>
      <Message class="h-50"
               @clear="text=''"
               @send="send"
               :text="text"
               :sources="sourcesArray"></Message>
    </div>
    <div class="col-7 p-1">
      <Plot class="rounded border" @data-function="plotOnData=$event"></Plot>
    </div>
  </div>
</template>

<script>
import Message from '@/components/Message'
import Plot from '@/components/Plot'
import Source from '@/components/Source'

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

export default {
  name: 'App',
  data () {
    return {
      sourcesArray: [],
      text: '',
      plotOnData: null
    }
  },
  methods: {
    send (message) {
      this.text += '>>' + dateFormat(new Date()) + ':' + message.text + '\n'
    },
    parseMessage (message) {
      const dateStr = dateFormat(new Date())
      this.text += '<<' + dateStr + ':' + message + '\n'
      const regex = /(?:([a-z_-]*)[^a-z0-9_-]+)?(-?\d+(?:\.\d*)?)/ig
      const result = []
      let m
      let idx = 1
      while ((m = regex.exec(message)) !== null) {
        result.push({ tag: m[1] || `channel ${idx}`, data: parseFloat(m[2]) })
        idx += 1
      }
      this.plotOnData({ result, dateStr })
    }
  },
  mounted () {
  },
  components: {
    Message, Plot, Source
  }
}
</script>

<style>
</style>
