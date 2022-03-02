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
        <button class="btn btn-outline-dark" type="button" @click="$emit('clear')">
          <i class="fas fa-broom"></i>
        </button>
      </div>
    </form>
    <div class="flex-grow-1 border rounded overflow-scroll" ref="text">
      <pre>{{ text }}</pre>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Message',
  props: {
    sources: Array,
    text: String
  },
  data () {
    return {
      input: '',
      messageTo: '-1'
    }
  },
  methods: {
    send (e) {
      e.preventDefault()
      if (this.input === '') {
        return
      }
      this.$emit('send', { to: this.messageTo, text: this.input })
      this.input = ''
    }
  },
  updated () {
    this.$refs.text.scrollTo({ left: 0, top: this.$refs.text.scrollHeight })
  }
}
</script>

<style scoped>

</style>
