<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '隐私保护指引',
  },
}
</route>
<script setup lang="ts">
// import HTMLBox from '@/components/HTMLBox/index.vue'

onMounted(() => {})
</script>
<template>
  <view class="comFrame">
    <ljs-top-vue3 title="隐私保护指引" backgroundColor="#D2A784" :back="$topBack"></ljs-top-vue3>
    <view
      class="comMain"
      :style="{
        height: 'calc(100% - 80rpx - ' + $LJSbase.getTopStateHeight() + 'px)',
      }"
    >
      <!-- <HTMLBox :content="ruleInfo"></HTMLBox> -->
      暂无
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use './PhoneAuthorizeAgreement';
</style>
