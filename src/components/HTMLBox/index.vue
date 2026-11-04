<script setup lang="ts">
defineOptions({
  name: 'HTMLBox',
})
type Props = {
  /** 富文本内容，通过 v-html 渲染 */
  content: string
  /** 文本行数（-webkit-line-clamp） */
  rows: number
  /** 视频地址列表，模板中每项直接作为 <video :src> */
  videoList: string[]
}
const props = defineProps<Props>()

onLoad(() => {})
onReady(() => {})
</script>

<template>
  <view
    class="html"
    v-html="content"
    :style="{
      '-webkit-line-clamp': rows,
    }"
  ></view>
  <video v-for="(item, index) in videoList" :key="index" :src="item" controls style="width: 100%; height: 420rpx; margin: 20rpx 0"></video>
</template>

<style scoped lang="scss">
@use './index';
</style>
