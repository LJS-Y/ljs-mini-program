<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '订单',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { idForFile, appBottomSafeHeight, appMode, ossUrl } from '@/utils/base'
import { orderList } from '@/pages-mine/api/Order'
import { dataType } from './order'
import { controlSwitch } from '@/api/commonApi'
defineOptions({
  name: 'OrderIndex ',
})
const { proxy } = getCurrentInstance()

const typeData = ref(dataType)
const typeIndex = ref(0)
function typeDataClickItem(row) {
  search.value.exchangeStatus = row.value
  handleQuery()
}

/**
 * 常规列表 - 开始
 */
// 列表 - 搜索条件
const search = ref({
  pageNum: 1,
  pageSize: 10,
  exchangeStatus: null,
})
const list = ref({
  data: [],
  total: 0,
})
// 列表
function getList() {
  const query = proxy.$LJSbase.deepCopy(search.value)

  useUserStore().setComLoadingState({
    open: true,
  })
  orderList(query).then(async (data) => {
    if (!proxy.$LJSbase.fieldCheck(data)) {
      for (const item of data.rows) {
        if (!proxy.$LJSbase.fieldCheck(item.pointsMall)) {
          item.pointsMall.coverImages_url = idForFile(item.pointsMall.coverImages)
        }
        list.value.data.push(item)
      }
      list.value.total = data.total
    }
    useUserStore().setComLoadingState({
      open: false,
    })
  })
}
// 更多
function moreList() {
  search.value.pageNum++
  getList()
}
// 重置
// 注：原实现重建 search 时只给了 pageNum/pageSize，把 exchangeStatus 丢了，
// 导致重置后订单列表不按当前 tab 的兑换状态过滤。已补回。
function resetQuery() {
  search.value = {
    pageNum: 1,
    pageSize: 10,
    exchangeStatus: null,
  }
  handleQuery()
}
// 搜索
function handleQuery() {
  list.value.data = []
  search.value.pageNum = 1
  getList()
}
/**
 * 常规列表 - 结束
 */

function getStateColor(exchangeStatus) {
  return proxy.$LJSbase.selectDictLabel(typeData.value, exchangeStatus, 'color', 'value')
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

const bottomSafeHeight = ref(0)
const topStateHeight = ref(0)
onLoad(async (o) => {
  await getShowApi()
  if (!PointsMallShowTag.value) {
    proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
    return
  }
  if (!proxy.$LJSbase.fieldCheck(o.index)) {
    typeIndex.value = Number(o.index)
    search.value.exchangeStatus = o.index
  }
  handleQuery()
})
onReady(async () => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
  // 底部安全距离
  bottomSafeHeight.value = await appBottomSafeHeight()
})

// info更新，刷新列表
function ljsTopBackInfoUpdate(res) {
  if (!proxy.$LJSbase.fieldCheck(res) && res.code === 200) {
    resetQuery()
  }
}
defineExpose({
  ljsTopBackInfoUpdate,
})
</script>

<template>
  <ljs-top-vue3
    title="订单"
    backgroundColor="#F1F3F5"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
    }"
  >
    <view class="comRefresh" @click="handleQuery"><text class="iconfont icon-a-ziyuan16"></text></view>
  </ljs-top-vue3>
  <scroll-view
    scroll-y
    class="comMain"
    :style="{
      height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
    }"
  >
    <view class="types">
      <ljs-tabs-vue3
        :data="typeData"
        :initActiveIndex="typeIndex"
        :opts="{
          itemPadding: '20rpx 6rpx 30rpx',
          fontColor: '#1A1A1A',
          fontActiveColor: '#1A1A1A',
          fontActiveWeight: 600,
          fontSize: '30rpx',
          fontActiveSize: '30rpx',
          lineImg: ossUrl('/weapp/pages-mine/Order/order_tabsBg.png'),
          lineWidth: '60rpx',
          lineHeight: '11rpx',
        }"
        @clickItem="typeDataClickItem"
      >
        <template #default="{ row, index, activeIndex }">
          <view
            class="item"
            :class="{
              active: index === activeIndex,
            }"
          >
            {{ row.lable }}
          </view>
        </template>
      </ljs-tabs-vue3>
    </view>
    <view class="list">
      <view
        class="item"
        v-for="(item, i) in list.data"
        :key="i"
        @click="
          $LJSrun.gp_navigateTo('/pages-mine/Order/OrderInfo', {
            id: item.id,
          })
        "
      >
        <view class="title">
          <view class="no">订单号：{{ item.orderNumber }}</view>
          <view
            class="state"
            :style="{
              color: getStateColor(item.exchangeStatus),
            }"
            v-if="!$LJSbase.fieldCheck(item.confirmExchange) && item.confirmExchange === '0'"
          >
            任务奖励，待确认
          </view>
          <view
            class="state"
            :style="{
              color: getStateColor(item.exchangeStatus),
            }"
            v-else
          >
            {{ $LJSbase.selectDictLabel(typeData, item.exchangeStatus, 'lable', 'value') }}
          </view>
        </view>
        <view class="con" v-if="!$LJSbase.fieldCheck(item.pointsMall)">
          <image lazy-load class="pic" :src="item.pointsMall.coverImages_url" />
          <view class="info">
            <view class="t">{{ item.pointsMall.coverTitle }}</view>
            <view
              class="point"
              v-if="
                $LJSbase.fieldCheck(item.confirmExchange) &&
                !$LJSbase.fieldCheck(item.pointsMall.payFun) &&
                item.platform.indexOf('99') === -1
              "
            >
              <template v-if="item.pointsMall.payFun === 1 || item.pointsMall.payFun === 3">
                <text class="num">{{ item.pointsMall.points }}</text>
                <text>积分</text>
              </template>
              <template v-if="item.pointsMall.payFun === 3">
                <text>+</text>
              </template>
              <template v-if="item.pointsMall.payFun === 2 || item.pointsMall.payFun === 3">
                <text>￥</text>
                <text class="num">{{ item.pointsMall.amount }}</text>
              </template>
            </view>
          </view>
        </view>
        <view class="line"></view>
        <view class="bottom">
          <text class="t">共{{ item.number }}件商品</text>
          <template v-if="$LJSbase.fieldCheck(item.confirmExchange)">
            <text>&nbsp;合计：</text>
            <text class="point" v-if="!$LJSbase.fieldCheck(item.pointsMall.payFun) && item.platform.indexOf('99') === -1">
              <template v-if="item.pointsMall.payFun === 1 || item.pointsMall.payFun === 3">
                <text class="num">{{ item.consumePoints }}</text>
                <text>积分</text>
              </template>
              <template v-if="item.pointsMall.payFun === 3">
                <text>+</text>
              </template>
              <template v-if="item.pointsMall.payFun === 2 || item.pointsMall.payFun === 3">
                <text>￥</text>
                <text class="num">{{ item.consumeAmount }}</text>
              </template>
            </text>
          </template>
        </view>
      </view>
      <view class="comListMore">
        <view class="but more" @click="moreList" v-if="search.pageNum * search.pageSize < list.total">加载更多</view>
        <view class="but null" v-else>{{ list.total === 0 ? '暂无数据' : '没有更多啦~~' }}</view>
      </view>
      <!-- 占位 -->
      <view class="seatBox bottom noBgColor"></view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use './OrderIndex';
</style>
