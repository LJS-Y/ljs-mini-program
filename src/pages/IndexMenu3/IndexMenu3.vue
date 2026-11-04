<!--
  ⚠️ 占位页：内容仅为「菜单3」，供 tabBar 演示用。
  这是自实现 tabBar 的 tab 容器（见 src/pages/home/HomeIndex.vue），
  删除会导致对应 tab 白屏。新项目请把本页内容换成真实业务。
-->
<script setup lang="ts">
import { useUserStore } from '@/store'
import { appPlatform } from '@/utils/base'

defineOptions({
  name: 'IndexMenu3',
})
const { proxy } = getCurrentInstance()

// 无 props；原先写成 defineProps({}) 传空对象字面量，
// 会让 vue-tsc 推导出与父组件调用不兼容的 props 类型，故改为无参写法。
defineProps()

async function initData() {
  // useUserStore().setComLoadingState({
  //   open: true,
  // })
  
  // useUserStore().setComLoadingState({
  //   open: false,
  // })
}

const winW = ref(0) // 屏幕宽度
const topHeight = ref(80) // 顶部top高度
const topStateHeight = ref(0)
// 处理IOS下拉空白问题 - 开始
const comMainTouch = ref({
  start: 0,
  move: 0,
  touch: false,
  os: null,
})
// 处理IOS下拉空白问题 - 结束
onMounted(async () => {
  winW.value = uni.getWindowInfo().screenWidth
  topStateHeight.value = uni.getWindowInfo().statusBarHeight
  comMainTouch.value.os = await appPlatform()
  initData()
})

function pxToRpx(value) {
  return (750 / winW.value) * value
}

// 处理IOS下拉空白问题 - 开始
function comMainTouchstart(e) {
  if (comMainTouch.value.os === 'ios' && !comMainTouch.value.touch) {
    comMainTouch.value.start = e.touches[0].clientY
    comMainTouch.value.touch = true
  }
}
function comMainTouchmove(e) {
  if (comMainTouch.value.os === 'ios') {
    const move = pxToRpx(e.touches[0].clientY - comMainTouch.value.start) / 3
    // if (move > 200) move = 200
    comMainTouch.value.move = move
  }
}
function comMainTouchend(e) {
  comMainTouch.value.move = 0
  comMainTouch.value.touch = false
}
// 处理IOS下拉空白问题 - 开始
</script>

<template>
  <ljs-top-vue3 title="LJS小程序" class="comTop" :topHeight="topHeight"></ljs-top-vue3>

  <scroll-view
    scroll-y
    class="comMain"
    :style="{
      height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
      'margin-top': `calc(-1 * (${topHeight}rpx - 80rpx))`,
      'background-color': `rgba(238, 238, 238, 1)`,
    }"
    @touchstart="comMainTouchstart"
    @touchmove="comMainTouchmove"
    @touchend="comMainTouchend"
  >
    菜单3
    <!-- 占位 -->
    <view class="menuSeatBox"></view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use './IndexMenu3';
</style>
