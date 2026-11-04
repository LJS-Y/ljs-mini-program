<script setup lang="ts">
import { openTxMap } from '@/utils/base'
import { getWineryName } from '../../utils/common'
/**
 * 门店（酒庄）信息
 *
 * 字段依据本组件与 getWineryName 的实际取用：
 *   - wineryShortName / wineryChineseName：见 ../../utils/common 的 getWineryName
 *   - tencentCoordinates：腾讯地图坐标，传给 openTxMap 打开导航
 * 其余字段后端可能返回，用索引签名兜底，避免逐个补。
 */
type StoreItem = {
  /** 酒庄简称，优先展示 */
  wineryShortName?: string
  /** 酒庄中文全称 */
  wineryChineseName?: string
  /** 腾讯地图坐标，用于 openTxMap 导航 */
  tencentCoordinates?: string
  [key: string]: any
}

type Props = {
  /** 可用门店列表 */
  data: StoreItem[]
}
const props = defineProps<Props>()

onMounted(() => {})
</script>

<template>
  <view class="StoreShow">
    <view class="t">以下门店可用</view>
    <view class="c" v-if="data.length > 0">
      <view class="one" v-for="(item, i) in data" :key="i">
        <text>{{ getWineryName(item) }}</text>
        <text @click.stop="openTxMap(item.tencentCoordinates, getWineryName(item))" class="iconfont icon-map-pin-line"></text>
      </view>
    </view>
    <view class="c" v-else><text class="null">暂无可用</text></view>
  </view>
</template>

<style scoped lang="scss">
@use './index';
</style>
