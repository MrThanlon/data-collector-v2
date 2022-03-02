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

/**
 * @param date {Date}
 * @return {String}
 */
function dateFormat (date) {
  function format (num, length) {
    return (Array(length).join('0') + num).slice(-length)
  }
  return `${format(date.getHours(), 2)}:${format(date.getMinutes(), 2)}:${format(date.getSeconds(), 2)}.${format(date.getMilliseconds(), 3)}`
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
      this.text += '<<' + dateFormat(new Date()) + ':' + message + '\n'
      const regex = /(?:([a-z_-]*)[^a-z0-9_-]+)?(-?\d+(?:\.\d*)?)/ig
      const result = []
      let m
      let idx = 1
      while ((m = regex.exec(message)) !== null) {
        result.push({ tag: m[1] || `channel ${idx}`, data: parseFloat(m[2]) })
        idx += 1
      }
      this.plotOnData(result)
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
