<template>
  <div class="w-100 d-flex justify-content-between" style="height: 100vh">
    <div class="col-5 p-1" style="padding-right: 0!important;">
      <Source class="h-50 pb-1"></Source>
      <Message class="h-50"></Message>
    </div>
    <div class="col-7 p-1">
      <Plot class="rounded border"></Plot>
    </div>
  </div>
</template>

<script>
import Message from '@/components/Message'
import Plot from '@/components/Plot'
import Source from '@/components/Source'

export default {
  name: 'App',
  components: {
    Message, Plot, Source
  }
}
</script>

<style>
</style>
