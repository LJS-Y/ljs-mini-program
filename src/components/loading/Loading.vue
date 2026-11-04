<script setup lang="ts">
import lottie from 'lottie-miniprogram'
import lottieLoading from '@/components/loading/lottie-loading'

defineOptions({
  name: 'HopeLoadingWidget',
})

const props = defineProps({
  text: {
    type: String,
    required: false,
  },
})

const instance = getCurrentInstance()

const anime = ref()

onReady(() => {
  const query = uni.createSelectorQuery().in(instance.proxy)

  query
    .select('#common-loading-canvas')
    .node((res) => {
      const canvas = res.node
      const context = canvas.getContext('2d')
      lottie.setup(canvas)
      anime.value = lottie.loadAnimation({
        loop: true,
        autoplay: true,
        animationData: lottieLoading,
        rendererSettings: {
          context,
        },
      })
    })
    .exec()
})
// 组件卸载时确保销毁
onUnmounted(() => {
  if (anime.value) {
    anime.value.destroy() // 关键：销毁动画实例
    anime.value = null // 清空引用
  }
})
</script>

<template>
  <view class="LJSLoading">
    <view class="LJSLoadingBox">
      <canvas class="loading-icon" id="common-loading-canvas" type="2d"></canvas>
      <view class="loading-text" v-if="text">{{ text }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.LJSLoading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 100vh;
  .LJSLoadingBox {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 300rpx;
    height: 300rpx;
    overflow: hidden;
    background-color: rgba($color: #000000, $alpha: 0.6);
    border-radius: 20px;
    transform: translate(-50%, -50%);
    .loading-icon {
      position: absolute;
      top: 20px;
      left: 50%;
      width: 200px;
      height: 100px;
      transform: translate(-50%, 0%);
    }
    .loading-text {
      position: absolute;
      bottom: 10%;
      left: 50%;
      width: 100%;
      overflow: hidden;
      font-size: 28rpx;
      line-height: 40rpx;
      color: #fff;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      transform: translateX(-50%);
    }
  }
}
</style>
