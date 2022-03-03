<template>
  <div class="w-100 h-100 d-flex flex-wrap align-content-between position-relative">
    <div class="w-100 h-100" ref="chart"></div>
    <div class="position-absolute" style="right: 0;top: 0">
      <button class="btn btn-outline-dark m-1" @click="clear">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

let chart
let xAxisData = []
const maxLength = 100
const series = []
const labelIndex = {}
export default {
  name: 'Plot',
  created () {
    this.$emit('dataFunction', this.onData)
  },
  methods: {
    clear () {
      xAxisData = []
      for (const ser of series) {
        ser.data = []
      }
      chart.setOption({
        xAxis: {
          data: xAxisData
        },
        series
      })
    },
    onData ({ result, dateStr }) {
      // processing
      xAxisData.push(dateStr)
      if (xAxisData.length > maxLength) {
        xAxisData.splice(0, 1)
      }
      result.forEach(({ tag, data }) => {
        if (tag in labelIndex) {
          const ser = series[labelIndex[tag]]
          ser.data.push(data)
          if (ser.data.length > maxLength) {
            ser.data.splice(0, 1)
          }
        } else {
          // new series
          labelIndex[tag] = series.length
          series.push({
            name: tag,
            type: 'line',
            smooth: false,
            symbol: 'none',
            data: [...Array(xAxisData.length - 1), data]
          })
        }
      })
      // set chart
      chart.setOption({
        xAxis: {
          data: xAxisData
        },
        series
      })
    }
  },
  async mounted () {
    chart = echarts.init(this.$refs.chart)
    chart.setOption({
      xAxis: {
        data: []
      },
      yAxis: {},
      series: []
    })
  }
}
</script>

<style scoped>

</style>
