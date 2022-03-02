<template>
  <div class="charts" :style="{width: width+'px', height: height+'px'}" ref="charts" id="charts">
    <svg :width="svgWidth" :height="height">
      <path v-for="p in data" :d="path(p)" stroke="black" fill="transparent" stroke-width="2"></path>
    </svg>
  </div>
</template>

<script>
function scale (x, x1, x2, y1, y2) {
  return (x - x1) / (x2 - x1) * (y2 - y1) + y1
}

export default {
  name: 'charts',
  props: {
    data: Array,
    labels: Array,
    height: Number,
    width: Number,
    step: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
    }
  },
  watch () {
  },
  updated () {
    this.$refs.charts.scroll({ top: 0, left: this.svgWidth })
  },
  computed: {
    maxNum () {
      return this.data.reduce((acc, cur) => {
        return Math.max(acc, Math.max.apply(null, cur))
      }, -Infinity)
    },
    minNum () {
      return this.data.reduce((acc, cur) => {
        return Math.min(acc, Math.min.apply(null, cur))
      }, Infinity)
    },
    svgWidth () {
      return Math.max(this.width, this.step * this.data.reduce((acc, cur) => {
        return Math.max(acc, cur.length)
      }, 0))
    }
  },
  methods: {
    path (p) {
      if (p.length === 0) {
        return ''
      }
      const x1 = this.minNum || 0
      const x2 = this.maxNum || 1
      const y1 = this.height - 30
      const y2 = 30
      return `M0 ${scale(p[0], x1, x2, y1, y2)} ` + p.reduce((acc, cur, idx) => {
        acc += `L${idx * this.step} ${scale(cur, x1, x2, y1, y2)} `
        return acc
      }, '')
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.charts {
  overflow-y: scroll;
}
</style>
