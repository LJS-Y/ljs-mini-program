<script setup lang="ts">
import { timeControl } from '@/utils/base'
defineOptions({
  name: 'SeatLight',
})
const props = defineProps({
  time: {
    type: Number,
    default: 30000,
  },
  borderRadius: {
    type: String,
    default: '0',
  },
  opacity: {
    type: Number,
    default: 1,
  },
})

onLoad(() => {})
const state = ref(true)
onReady(async () => {
  await timeControl(props.time)
  state.value = false
})
</script>

<template>
  <view
    class="seatLight"
    v-if="state"
    :style="{
      borderRadius,
      opacity,
    }"
  >
    <view class="seatLight_1"></view>
    <view class="seatLight_2"></view>
  </view>
</template>

<style scoped lang="scss">
@use './SeatLight';
</style>
