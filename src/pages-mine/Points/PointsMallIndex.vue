<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '红酒积分',
    backgroundColor: '#D3FCEC', // 页面下拉背景色
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import UserManager from '@/common/UserManager'
import { ossUrl } from '@/utils/base'
import PointsRule from '../components/PointsRule/index.vue'
import PointsDetails from '../components/PointsDetails/index.vue'
import SubmitOrder from '../components/SubmitOrder/index.vue'
import { idForFile } from '@/utils/base'
import { pointGoods, pointGoodsInfo } from '@/api/pages-mine/Points'
defineOptions({
  name: 'PointsMallIndex',
})
const { proxy } = getCurrentInstance()

const pointsExchange = ref({
  data: [],
  total: 0,
})
const pointsExchangeSearch = ref({
  pageNum: 1,
  pageSize: 6,
  platform: 1,
})
function getpointGoods() {
  pointGoods(pointsExchangeSearch.value).then(({ rows, total }) => {
    rows.forEach((item) => {
      item.coverImages_url = idForFile(item.coverImages)
      // 判断支付类型，后端处理了
      // 1 积分 2 现金 3 积分+现金
      // item.payFun = 1
      // if (!proxy.$LJSbase.fieldCheck(item.points) && item.points !== 0 && !proxy.$LJSbase.fieldCheck(item.amount) && item.amount !== 0) {
      //   item.payFun = 3
      // } else if (!proxy.$LJSbase.fieldCheck(item.points) && item.points !== 0) {
      //   item.payFun = 1
      // } else if (!proxy.$LJSbase.fieldCheck(item.amount) && item.amount !== 0) {
      //   item.payFun = 2
      // }
    })
    pointsExchange.value.data = pointsExchange.value.data.concat(rows)
    pointsExchange.value.total = total
  })
}
// 更多
function moreList() {
  pointsExchangeSearch.value.pageNum++
  getpointGoods()
}

const ruleBoxTc = ref({
  // 弹出层标题
  title: '',
  // 是否显示弹出层
  open: false,
})
function ruleBoxTcOpen() {
  ruleBoxTc.value.title = '签到规则'
  ruleBoxTc.value.open = true
}

const myRewardTc = ref({
  // 弹出层标题
  title: '',
  // 是否显示弹出层
  open: false,
})
function myRewardTcOpen() {
  myRewardTc.value.title = `积分明细`
  myRewardTc.value.open = true
}
function myRewardTcClose() {
  myRewardTc.value.open = false
  uni.pageScrollTo({
    selector: '#pointsExchange',
    duration: 500,
    success: (res) => {
      // console.log(res);
    },
  })
}

const minePoint = ref({
  point: computed(() => useUserStore().nowPoints), // 当前积分
})

const exchangeBoxTc = ref({
  // 是否显示弹出层
  open: false,
  row: null,
  num: 1,
})
function exchangeBoxTcOpen(row) {
  useUserStore().setComLoadingState({
    open: true,
  })
  pointGoodsInfo(row.id)
    .then((data) => {
      data.coverImages_url = row.coverImages_url
      exchangeBoxTc.value.num = 1
      exchangeBoxTc.value.row = data
      exchangeBoxTc.value.open = true
    })
    .finally(() => {
      useUserStore().setComLoadingState({
        open: false,
      })
    })
}
function exchangeBoxTcClose() {
  exchangeBoxTc.value.open = false
}

const topStateHeight = ref(0)
const checkLoginState = ref(false) // 登录检测
onLoad(async () => {
  useUserStore().setComLoadingState({
    open: true,
  })
  checkLoginState.value = await UserManager.getInstance().checkLoginFunc()
  useUserStore().updateNowPoints()
  getpointGoods()

  useUserStore().setDomeBg('#D3FCEC')
  useUserStore().setComLoadingState({
    open: false,
  })
})
onReady(() => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
})
onShow(() => {
  useUserStore().setDomeBg('#d3fcec')
})
onBeforeUnmount(() => {
  useUserStore().setDomeBg()
})
// 用户点击右上角分享
onShareAppMessage((res) => {
  const title = 'LJS小程序'
  const path = `/pages/home/HomeIndex?source=wxShare`
  return {
    title,
    path,
  }
})

function ljsRunBackF(res) {
  if (res.code === '商城') {
    setTimeout(() => {
      uni.pageScrollTo({
        selector: '#pointsExchange',
        duration: 500,
        success: (res) => {
          // console.log(res);
        },
      })
    }, 0)
  }
}
// watch(
//   () => props.data,
//   (newValue, oldValue) => {
//     swiper.value.data = props.data
//     swiper.value.total = props.data.length
//   },
//   { deep: true, immediate: true },
// )
defineExpose({
  ljsRunBackF,
})
</script>

<template>
  <ljs-top-vue3
    title="商城"
    class="comTop"
    backgroundColor="#D3FCEC"
    :titleWeight="600"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
    }"
  ></ljs-top-vue3>

  <!--  -->
  <view
    scroll-y
    class="comMain"
    :style="{
      'min-height': `calc(100vh - 80rpx - ${topStateHeight}px)`,
    }"
  >
    <view class="points">
      <view class="title">
        <view class="bg" :style="{
          'background-image': `url(${ossUrl('/weapp/subscribeAVine/pointsMall/points_titleBg.png')})`
        }"></view>
        <text class="t">我的积分</text>
        <text class="tIcon iconfont icon-jifen"></text>
        <view class="rightBut">
          <view class="level">v1</view>
          <view class="name">等级权益</view>
          <view class="jt iconfont icon-youjiantou"></view>
        </view>
      </view>
      <view class="con">
        <view class="item1" :style="{
          'background-image': `url(${ossUrl('/weapp/subscribeAVine/pointsMall/points_itemBg.png')})`
        }">
          <view class="name">可用积分</view>
          <view
            class="value"
            :class="{
              w4: $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).num.toString().split('.')[0].length >= 4,
            }"
          >
            <text>{{ $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).num }}</text>
            <text class="unit">{{ $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).unit }}</text>
          </view>
        </view>
        <view class="item2" @click="$LJSrun.gp_redirectTo('/pages-mine/Points/MakePointsIndex', {}, {})">
          <view class="name">赚积分</view>
          <view class="jt iconfont icon-lujing"></view>
          <image
            lazy-load
            class="pic"
            :src="ossUrl('/weapp/subscribeAVine/pointsMall/points_zjf.png')"
          />
        </view>
        <view class="item3">
          <view class="one" @click="myRewardTcOpen">
            <image
              class="icon"
              :src="ossUrl('/weapp/subscribeAVine/pointsMall/points_icon_jfmx.png')"
            />
            <text class="t">积分明细</text>
          </view>
          <view class="one" @click="ruleBoxTcOpen">
            <image
              class="icon"
              :src="ossUrl('/weapp/subscribeAVine/pointsMall/points_icon_jfgz.png')"
            />
            <text class="t">积分规则</text>
          </view>
        </view>
      </view>
    </view>

    <view class="pointsExchange" id="pointsExchange">
      <view class="title">积分兑换</view>
      <view class="list">
        <view class="item" v-for="(item, i) in pointsExchange.data" :key="i" @click="exchangeBoxTcOpen(item)">
          <!-- 手写样式，估计用不上了 -->
          <!-- <view class="goodsBox">
            <view class="goods">
              <view class="label">{{ item.label }}</view>
              <image lazy-load class="pic" mode="heightFix" :src="item.pic" />
            </view>
          </view> -->
          <view class="goodsBox">
            <SeatLight />
            <image lazy-load class="pic" :src="item.coverImages_url" />
          </view>
          <view class="infoBox">
            <view class="name">{{ item.coverTitle }}</view>
            <view class="limit" v-if="item.isPurchaseRestriction">限购{{ item.purchaseRestriction }}份</view>
            <view class="limit null" v-else>&nbsp;</view>
            <view class="point" v-if="!$LJSbase.fieldCheck(item.payFun) && item.platform.indexOf('99') === -1">
              <template v-if="Number(item.stock) > 0">
                <template v-if="item.payFun === 1 || item.payFun === 3">
                  <text class="num">{{ item.points }}</text>
                  <text>积分</text>
                </template>
                <template v-if="item.payFun === 3">
                  <text>+</text>
                </template>
                <template v-if="item.payFun === 2 || item.payFun === 3">
                  <text>￥</text>
                  <text class="num">{{ item.amount }}</text>
                </template>
              </template>
              <template v-else>
                <text class="num">&nbsp;</text>
              </template>
            </view>
          </view>
        </view>
      </view>
      <view class="comListMore">
        <template v-if="pointsExchange.total > 0">
          <view
            class="but more"
            @click="moreList"
            v-if="pointsExchangeSearch.pageNum * pointsExchangeSearch.pageSize < pointsExchange.total"
          >
            加载更多
          </view>
          <view class="but null" v-else>没有更多啦~~</view>
        </template>
        <template v-else>
          <image class="nullImg" :src="ossUrl('/weapp/mine/pointGoodsNull.png')" />
        </template>
      </view>
    </view>
    <!-- 占位 -->
    <view class="seatBox bottom noBgColor"></view>
  </view>

  <template v-if="checkLoginState">
    <!-- 规则及规则弹窗 -->
    <ljs-xf-dialog-vue3 :title="ruleBoxTc.title" v-model="ruleBoxTc.open" :titleFontSize="34" background="#EEFDF7" height="70%">
      <PointsRule v-if="ruleBoxTc.open" />
    </ljs-xf-dialog-vue3>

    <!-- 积分明细 -->
    <ljs-xf-dialog-vue3 :title="myRewardTc.title" v-model="myRewardTc.open" :titleFontSize="34" background="#EEFDF7" height="70%">
      <PointsDetails @myRewardTcClose="myRewardTcClose" v-if="myRewardTc.open" />
    </ljs-xf-dialog-vue3>

    <!-- 立即兑换 -->
    <SubmitOrder v-model="exchangeBoxTc.open" :row="exchangeBoxTc.row"></SubmitOrder>
  </template>
</template>

<style scoped lang="scss">
@use './PointsMallIndex';
</style>
