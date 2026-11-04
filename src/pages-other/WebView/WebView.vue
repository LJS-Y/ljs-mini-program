<route lang="json5">
{
  layout: 'LJS小程序',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'LJS小程序',
    navigationBarBackgroundColor: '#FFF',
    navigationBarTextStyle: 'black',
  },
}
</route>

<script setup lang="ts">
import { webView, idForFile } from '@/utils/base'
defineOptions({
  name: 'WebView',
})
const { proxy } = getCurrentInstance()
const url = ref(null)
const optionsBackups = ref(null)

function getH5Message(e) {
  const data = e.detail.data
  console.log(data)

  // 判断H5要扫码
  if (data.some((item) => item.type === 'scanCode')) {
    // this.startScan()
  }
}

onLoad((options) => {
  optionsBackups.value = options
  // 展会入场券（source = 'inTicket'）（2025.6.9~2025.6.11有效），已过期，直接进入首页。
  // 新的码直接跳转首页进行业务处理。
  if (options.source === 'inTicket') {
    proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
    return
  }
  url.value = webView(options)
  console.log(url.value)
})

onShareAppMessage((res) => {
  const title = !proxy.$LJSbase.fieldCheck(optionsBackups.value.shareText) ? optionsBackups.value.shareText : import.meta.env.VITE_APP_TITLE
  const urlAndQuery = proxy.$LJSurl.getUrlAllParameter(url.value)
  const imageUrl = !proxy.$LJSbase.fieldCheck(optionsBackups.value.shareImg) ? idForFile(optionsBackups.value.shareImg) : null
  let path = `/pages/home/HomeIndex`
  if (!proxy.$LJSbase.fieldCheck(urlAndQuery)) {
    path = `/pages/home/HomeIndex?source=wxWebviewShare&share=1&url=${urlAndQuery[0]}&queryStr=${JSON.stringify(urlAndQuery[1])}`
  }
  return {
    title,
    imageUrl,
    path,
  }
})
</script>
<template>
  <web-view
    :src="url"
    :webview-styles="{
      height: '100vh',
    }"
    bindmessage="getH5Message"
  />
</template>

<style lang="scss" scoped></style>

<!-- 
使用示例：
obj: {
  page: '/pages-other/WebView/WebView',
  query: {
    share: '0',
    url: 'https://example.com/ai/index', // 替换为你的 H5 页面地址
    queryStr: JSON.stringify({
      // token: userInfo.token, // token不需要额外添加
      id: 1
    }),
  },
}

proxy.$LJSrun.gp_navigateTo(obj.page, !proxy.$LJSbase.fieldCheck(obj.query) ? obj.query : {})
-->
