<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { initShare, getH5Url } from '@/utils/base'

import UserManager from '@/common/UserManager'

import HomeIndexTabBar from '@/pages/home/components/HomeIndexTabBar.vue'
import IndexHome from '@/pages/IndexHome/IndexHome.vue'
import IndexMenu2 from '@/pages/IndexMenu2/IndexMenu2.vue'
import IndexMenu3 from '@/pages/IndexMenu3/IndexMenu3.vue'
import IndexMenu4 from '@/pages/IndexMenu4/IndexMenu4.vue'
import IndexMine from '@/pages/IndexMine/IndexMine.vue'

import PhoneAuthorize from '@/components/PhoneAuthorize/PhoneAuthorize.vue'

defineOptions({
  name: 'HomeIndex',
})
const { proxy } = getCurrentInstance()

const curTabBarName = ref(null)

// options 临时存储
const pageOptions = ref(null)

// pageTag: 1 品鉴签到码未执行记录。2 options参数解析未执行。3 token过期。4 入场码，需要授权手机号。
const pageTag = ref(null)

// 手机授权是否开启
const phoneAuthorize = ref(false)

watch(
  () => phoneAuthorize.value,
  (newValue, oldValue) => {
    if (!phoneAuthorize.value && pageTag.value === 2) {
      pageTag.value = null
      optionsHandle()
    }
  },
)

const checkLoginState = ref(false) // 登录检测
onLoad(async (options) => {
  checkLoginState.value = await UserManager.getInstance().checkLoginFunc()
  pageOptions.value = options

  curTabBarName.value = 'IndexHome'
  optionsHandle()
})
onReady(async () => {})

// 页面参数处理方法
async function optionsHandle() {
  let options = pageOptions.value

  // 微信 - 普通链接二维码地址
  if (!proxy.$LJSbase.fieldCheck(options.scancode_time)) {
    const q = decodeURIComponent(options.q) // 获取到二维码原始链接内容
    // const scancode_time = parseInt(options.scancode_time) // 获取用户扫码时间 UNIX 时间戳
    const allParameter = proxy.$LJSurl.getUrlAllParameter(q)
    if (allParameter.length === 2) {
      options = allParameter[1]
      pageOptions.value = options
    }
  }

  // 页面接收到参数需要在此处理
  if (!proxy.$LJSbase.fieldCheck(options)) {
    // 存在来源
    if (!proxy.$LJSbase.fieldCheck(options.source)) {
      // 来自于web-view的分享
      if (options.source === 'wxWebviewShare') {
        proxy.$LJSrun.gp_navigateTo('/pages-other/WebView/WebView', {
          share: '1',
          url: options.url,
          queryStr: proxy.$LJSbase.fieldCheck(options.queryStr) ? JSON.stringify({}) : options.queryStr,
        })
      }
      // 内部页面跳转首页某个底部菜单页
      else if (options.source === 'insideRouter') {
        curTabBarName.value = options.curTabBarName
      }
      // 通用跳转：general
      // 酒码 - 品鉴填写问卷

      // 场景1：H5中转页 - 跳转小程序H5
      // 场景2：H5中转页 - 跳转小程序原生页
      // source：跳转来源
      // pagePath：C端前往的页面。H5端生成断链时使用，到达C端无该参数。
      // pageType：跳转类型，h5、app
      // url：pagePath为/pages-other/WebView/WebView时必填
      // share：1可转发，0不可转发；pagePath为/pages-other/WebView/WebView时有效

      // 案例1：https://your-h5.example.com/h5FromWx/?source=general&wxXcxPage=pages/home/HomeIndex&pageType=h5&url=https://your-h5.example.com/ai/index&share=1&id=1&type=2
      // 案例1：可跳转webview
      // 案例2：https://your-h5.example.com/h5FromWx/?source=general&wxXcxPage=pages-wineProducing/DetailsWine/DetailsWine&pageType=app&id=xxx
      // 案例2：可跳转原生
      else if (options.source === 'general') {
        // 需要授权
        if (!proxy.$LJSbase.fieldCheck(options.PhoneAuthorize) && options.PhoneAuthorize === '1') {
          const phoneTag = checkPhoneNumber() // 检测授权，返回 true 需授权 false 无需授权
          if (phoneTag) {
            pageTag.value = 5
            phoneAuthorize.value = true
            return
          }
        }
        if (!proxy.$LJSbase.fieldCheck(options.pageType) && options.pageType === 'h5') {
          const tempO = proxy.$LJSbase.deepCopy(options)
          delete tempO.source
          delete tempO.pageType
          delete tempO.url
          delete tempO.share

          const h5Url = getH5Url(options.url) // url没有域名，根据环境补全

          proxy.$LJSrun.gp_navigateTo('/pages-other/WebView/WebView', {
            share: proxy.$LJSbase.fieldCheck(options.share) ? '1' : options.share,
            url: h5Url,
            queryStr: JSON.stringify(tempO),
          })
        } else if (!proxy.$LJSbase.fieldCheck(options.pageType) && options.pageType === 'app') {
          const tempO = proxy.$LJSbase.deepCopy(options)
          delete tempO.source
          delete tempO.pageType
          delete tempO.url
          delete tempO.share

          proxy.$LJSrun.gp_navigateTo(options.url + '?' + proxy.$LJSurl.formatParamsByAscii(tempO))

          // 进入首页的某个模块
          if (!proxy.$LJSbase.fieldCheck(options?.curTabBarName)) {
            curTabBarName.value = options.curTabBarName
          }
        }
      }
    }
  }
  initShare()
}

onShareAppMessage((res) => {
  const title = 'LJS小程序'
  const path = `/pages/home/HomeIndex`

  return {
    title,
    path,
  }
})

// 手机号授权检测
function checkPhoneNumber() {
  if (!useUserStore().hasWxMobile) {
    phoneAuthorize.value = !useUserStore().hasWxMobile
  }

  return phoneAuthorize.value
}

watch(
  () => useUserStore().hasWxMobile,
  (newValue, oldValue) => {
    const phoneTag = checkPhoneNumber() // 检测授权，返回 true 需授权 false 无需授权
    // 授权后再次执行业务
    if (!phoneTag) {
      // 入场券
      if (pageTag.value === 4) {}
      // 品鉴签到码
      else if (pageTag.value === 1) {}
      // source === 'general'
      else if (pageTag.value === 5) {}
      // 积分商品 - 吊牌绑定
      else if (pageTag.value === 11) {}
    }
  },
)

defineExpose({})
</script>

<template>
  <view class="home-index-container">
    <IndexHome v-if="curTabBarName === 'IndexHome'" />
    <IndexMenu2 v-else-if="curTabBarName === 'IndexMenu2'" />
    <IndexMenu3 v-else-if="curTabBarName === 'IndexMenu3'" />
    <IndexMenu4 v-else-if="curTabBarName === 'IndexMenu4'" />
    <IndexMine v-else-if="curTabBarName === 'IndexMine'" />

    <home-index-tab-bar v-model:value="curTabBarName" v-if="checkLoginState" />

    <PhoneAuthorize v-model="phoneAuthorize" />
  </view>
</template>

<style scoped lang="scss">
@use './HomeIndex';
</style>
