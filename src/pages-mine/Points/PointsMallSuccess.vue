<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '收货地址',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { controlSwitch } from '@/api/commonApi'
import { appMode } from '@/utils/base'
defineOptions({
  name: 'PointsMallSuccess ',
})
const { proxy } = getCurrentInstance()

function backPointsMall() {
  useUserStore().updateNowPoints()
  proxy.$LJSrun.gp_reLaunch('/pages-mine/Points/PointsMallIndex')
}

// 红酒 - 积分商城
const PointsMallShowTag = ref(false)
async function getShowApi() {
  const data = await controlSwitch({ moduleName: '0,pointsMallWine' })
  if (!proxy.$LJSbase.fieldCheck(data) && data.length > 0) {
    for (const item of data) {
      if (item.moduleName === 'pointsMallWine') {
        PointsMallShowTag.value =
          appMode() === 'release' || proxy.$LJSbase.fieldCheck(item.appTrialMode) ? item.switchFlag : item.appTrialMode
      }
    }
  }
}

const topStateHeight = ref(0)
onLoad(async (o) => {
  await getShowApi()
  if (!PointsMallShowTag.value) {
    proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
    return
  }
  useUserStore().updateNowPoints()
})
onReady(() => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
})
</script>

<template>
  <ljs-top-vue3
    title="支付结果"
    backgroundColor="#F1F3F5"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
    }"
  ></ljs-top-vue3>
  <scroll-view
    scroll-y
    class="comMain"
    :style="{
      height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
    }"
  >
    <view class="zw120"></view>
    <view class="stateBox">
      <view class="iconfont icon-duigou"></view>
      <view class="text">兑换成功</view>
    </view>
    <view class="but">
      <view class="item" @click="$LJSrun.gp_redirectTo('/pages-mine/Order/OrderIndex', {}, {})">查看订单</view>
      <view class="item" @click="backPointsMall">返回商城</view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use './PointsMallSuccess';
</style>
