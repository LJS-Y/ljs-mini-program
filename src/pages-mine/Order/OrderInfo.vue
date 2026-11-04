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
import { idForFile, appBottomSafeHeight, appPlatform, fastCopy, comPreviewImage, openTxMap, ossUrl } from '@/utils/base'
import { orderInfo, confirmReceipt } from '@/pages-mine/api/Order'
import { dataType } from './order'
import { getDict } from '@/api/commonApi'
import StoreShow from '../components/StoreShow/index.vue'
import SubmitOrder from '../components/SubmitOrder/index.vue'
defineOptions({
  name: 'OrderInfo ',
})
const { proxy } = getCurrentInstance()

const typeData = ref(dataType)
const typeIndex = ref(0)

// 基础数据
const baseData = ref({
  id: null,
})
const info = ref(null)
const delivery_company = ref([])
const receiving_fun_dict = ref([])
const appPlatformStr = ref(false) // 是否为ios或安卓

async function initData() {
  useUserStore().setComLoadingState({
    open: true,
  })
  const data1 = await getDict('delivery_company')
  if (!proxy.$LJSbase.fieldCheck(data1)) {
    delivery_company.value = data1
  }
  const data2 = await getDict('receiving_fun_dict')
  if (!proxy.$LJSbase.fieldCheck(data2)) {
    receiving_fun_dict.value = data2
  }
  getInfo()
  const appPlat = await appPlatform()
  appPlatformStr.value = appPlat === 'ios' || appPlat === 'android'
}
async function getInfo() {
  const data = await orderInfo(baseData.value.id)
  if (!proxy.$LJSbase.fieldCheck(data)) {
    data.qrCode_url = idForFile(data.qrCode)
    if (!proxy.$LJSbase.fieldCheck(data.pointsMall)) {
      data.pointsMall.coverImages_url = idForFile(data.pointsMall.coverImages)
    }
    info.value = data
    useUserStore().setComLoadingState({
      open: false,
    })
  }
  useUserStore().setComLoadingState({
    open: false,
  })
}

const exchangeBoxTc = ref({
  // 是否显示弹出层
  open: false,
  row: null, // 订单关联的积分商品
  info: null, // 订单完整数据
  num: 1,
})
function exchangeBoxTcOpen(row) {
  exchangeBoxTc.value.row = info.value.pointsMall
  exchangeBoxTc.value.info = info.value
  exchangeBoxTc.value.open = true
}
function exchangeBoxTcClose() {
  exchangeBoxTc.value.open = false
}

const infoUpdate = ref(false)
function infoChange() {
  infoUpdate.value = true
  getInfo()
}

const confirmReceiptTc = ref({
  // 弹出层标题
  title: '',
  // 是否显示弹出层
  open: false,
  row: null,
})
// 确认收货 - 弹窗 - 打开
function confirmReceiptTcOpen(row) {
  confirmReceiptTc.value.row = row
  confirmReceiptTc.value.open = true
}
// 确认收货 - 弹窗 - 关闭
function confirmReceiptTcClose() {
  confirmReceiptTc.value.row = null
  confirmReceiptTc.value.open = false
}
// 确认收货 - 弹窗 - 操作
function saveConfirmReceipt() {
  confirmReceipt({ id: confirmReceiptTc.value.row.id })
    .then((data) => {
      if (!proxy.$LJSbase.fieldCheck(data)) {
        proxy.$LJSmsg.msg_success('确认收货')
        getInfo()
      } else {
        proxy.$LJSmsg.msg_error('确认失败')
      }
    })
    .finally(() => {
      confirmReceiptTcClose()
      useUserStore().setComLoadingState({
        open: false,
      })
    })
}

const bottomSafeHeight = ref(0)
const topStateHeight = ref(0)
onLoad((o) => {
  if (!proxy.$LJSbase.fieldCheck(o.index)) {
    typeIndex.value = Number(o.index)
  }
  if (!proxy.$LJSbase.fieldCheck(o.id)) {
    baseData.value.id = o.id
    initData()
  } else {
    proxy.$LJSrun.gp_navigateBack()
  }
})
onReady(async () => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
  // 底部安全距离
  bottomSafeHeight.value = await appBottomSafeHeight()
})
</script>

<template>
  <ljs-top-vue3
    :title="
      !$LJSbase.fieldCheck(info)
        ? !$LJSbase.fieldCheck(info.confirmExchange) && info.confirmExchange === '0'
          ? '奖励详情'
          : $LJSbase.selectDictLabel(typeData, info.exchangeStatus, 'lable', 'value')
        : '详情'
    "
    backgroundColor="#F1F3F5"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
      backFTag: !infoUpdate,
      backFunName: 'ljsTopBackInfoUpdate',
      msg: {
        code: 200,
      },
    }"
  ></ljs-top-vue3>
  <scroll-view
    scroll-y
    class="comMain"
    :style="{
      height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
    }"
  >
    <view
      class="info"
      v-if="!$LJSbase.fieldCheck(info)"
      :style="{
        'padding-bottom':
          !$LJSbase.fieldCheck(info) && info.exchangeStatus === '3' && info.receivingFun === '0' && appPlatformStr
            ? `calc(${bottomSafeHeight}px + 104rpx)`
            : '0',
      }"
    >
      <view class="zw10"></view>
      <view class="stateInfo" v-if="!$LJSbase.fieldCheck(info.confirmExchange) && info.confirmExchange === '0'">待确认</view>
      <view class="stateInfo" v-else>
        {{ !$LJSbase.fieldCheck(info) ? $LJSbase.selectDictLabel(typeData, info.exchangeStatus, 'dis', 'value') : '-' }}
      </view>
      <template
        v-if="
          info.receivingFun === '0' &&
          ($LJSbase.fieldCheck(info.confirmExchange) || (!$LJSbase.fieldCheck(info.confirmExchange) && info.confirmExchange === '1'))
        "
      >
        <view class="delivery" v-if="!$LJSbase.fieldCheck(info.pointsMall) && info.pointsMall.category === 'goods'">
          <view class="title">配送地址</view>

          <view class="con">
            <view class="icon iconfont icon-map-pin-line"></view>
            <view class="address yes">
              <view class="user">
                <text class="t">{{ info.receivingName }}｜{{ $LJSprivacy.desensitizationPhone(info.receivingMobile) }}</text>
                <!-- <text class="jt iconfont icon-youjiantou"></text> -->
              </view>
              <view class="addr">{{ info.area.toString().replaceAll(',', '') }}{{ info.address }}</view>
            </view>
          </view>
        </view>
      </template>
      <view class="store" v-if="!$LJSbase.fieldCheck(info.pointsMall) && info.pointsMall.category === 'coupon'">
        <StoreShow :data="!$LJSbase.fieldCheck(info.winery) ? info.winery : []" />
      </view>
      <view class="goods" v-if="!$LJSbase.fieldCheck(info.pointsMall)">
        <image lazy-load class="pic" :src="info.pointsMall.coverImages_url" />
        <view class="info">
          <view class="t">{{ info.pointsMall.coverTitle }}</view>
          <view class="point">
            <template v-if="$LJSbase.fieldCheck(info.confirmExchange)">
              <template
                v-if="
                  $LJSbase.fieldCheck(info.confirmExchange) &&
                  !$LJSbase.fieldCheck(info.pointsMall.payFun) &&
                  info.platform.indexOf('99') === -1
                "
              >
                <template v-if="info.pointsMall.payFun === 1 || info.pointsMall.payFun === 3">
                  <text class="num">{{ info.pointsMall.points }}</text>
                  <text>积分</text>
                </template>
                <template v-if="info.pointsMall.payFun === 3">
                  <text>+</text>
                </template>
                <template v-if="info.pointsMall.payFun === 2 || info.pointsMall.payFun === 3">
                  <text>￥</text>
                  <text class="num">{{ info.pointsMall.amount }}</text>
                </template>
              </template>
            </template>
            <template v-else>&nbsp;</template>
          </view>
          <view class="number">
            <text class="iconfont icon-chenghao"></text>
            <text>{{ info.number }}</text>
          </view>
        </view>
      </view>
      <view class="orderInfo">
        <view class="item">
          <view class="text">订单编号</view>
          <view class="value">{{ info.orderNumber }}</view>
        </view>
        <view class="item" v-if="$LJSbase.fieldCheck(info.confirmExchange)">
          <view class="text">支付</view>
          <view class="value">
            <template v-if="info.pointsMall.payFun === 1 || info.pointsMall.payFun === 3">
              {{ info.consumePoints }}积分
            </template>
            <template v-if="info.pointsMall.payFun === 3">+</template>
            <template v-if="info.pointsMall.payFun === 2 || info.pointsMall.payFun === 3">￥{{ info.pointsMall.consumeAmount }}</template>
          </view>
        </view>
        <view class="item">
          <view class="text">下单时间</view>
          <view class="value">{{ info.createTime }}</view>
        </view>
        <template v-if="!$LJSbase.fieldCheck(info.pointsMall) && info.pointsMall.category === 'coupon'">
          <view class="item" v-if="info.pointsMall.isValidity === true">
            <view class="text">有效期</view>
            <view class="value">{{ info.pointsMall.startTime }}~{{ info.pointsMall.endTime }}</view>
          </view>
          <view class="item" v-if="info.pointsMall.disableWeekends === true">
            <view class="text">禁用日期</view>
            <view class="value">{{ info.pointsMall.disabledDates.toString() }}</view>
          </view>
        </template>
        <template v-if="info.receivingFun === '1'">
          <view class="item">
            <view class="text">发货方式</view>
            <view class="value">
              {{ $LJSbase.selectDictLabel(receiving_fun_dict, !$LJSbase.fieldCheck(info.receivingFun) ? info.receivingFun : '0') }}
            </view>
          </view>
          <view class="item">
            <view class="text">自提点</view>
            <view class="value" @click="openTxMap(info.coordinates, info.pointName)">
              <text>{{ info.pointName }}</text>
              <text class="addr iconfont icon-map-pin-line"></text>
            </view>
          </view>
        </template>
        <template v-if="!$LJSbase.fieldCheck(info.pointsMall)">
          <template v-if="info.pointsMall.category === 'coupon' && info.exchangeStatus === '2'">
            <view class="item">
              <view class="text">核销码</view>
            </view>
            <view class="erWm">
              <view class="bg" :style="{
                'background-image': `url(${ossUrl('/weapp/pages-mine/Order/erWmBg.png')})`
              }">
                <image class="pic" :src="info.qrCode_url" @click="comPreviewImage([info.qrCode_url])" />
              </view>
              <view class="dis">轻点上图可放大查看</view>
              <view class="codeStr" v-if="!$LJSbase.fieldCheck(info.verifyCode)">
                <text>点击复制</text>
                <text class="code" @click="fastCopy(info.verifyCode)">{{ info.verifyCode }}</text>
              </view>
            </view>
          </template>
          <template v-else-if="info.pointsMall.category === 'goods' && info.exchangeStatus === '3' && info.receivingFun === '1'">
            <view class="item">
              <view class="text">自提码</view>
            </view>
            <view class="erWm">
              <view class="bg" :style="{
                'background-image': `url(${ossUrl('/weapp/pages-mine/Order/erWmBg.png')})`
              }">
                <image class="pic" :src="info.qrCode_url" @click="comPreviewImage([info.qrCode_url])" />
              </view>
              <view class="dis">轻点上图可放大查看</view>
              <view class="codeStr" v-if="!$LJSbase.fieldCheck(info.verifyCode)">
                <text>点击复制</text>
                <text class="code" @click="fastCopy(info.verifyCode)">{{ info.verifyCode }}</text>
              </view>
            </view>
          </template>
        </template>
      </view>
      <view class="orderInfo" v-if="!$LJSbase.fieldCheck(info.expressCompany) && (info.exchangeStatus == 3 || info.exchangeStatus == 4)">
        <view class="item">
          <view class="text">快递公司</view>
          <view class="value">{{ $LJSbase.selectDictLabel(delivery_company, info.expressCompany) }}</view>
        </view>
        <view class="item">
          <view class="text">快递单号</view>
          <view class="value">{{ info.expressNumber }}</view>
        </view>
      </view>
      <view class="orderBut" v-if="!$LJSbase.fieldCheck(info.confirmExchange) && info.confirmExchange === '0'">
        <view class="item" @click="exchangeBoxTcOpen">我来确认</view>
      </view>
      <!-- 占位 -->
      <view class="seatBox bottom noBgColor"></view>
    </view>
    <view
      class="but"
      :style="{
        height: `calc(${bottomSafeHeight}px + 104rpx)`,
        'padding-bottom': `${bottomSafeHeight}px`,
      }"
      v-if="!$LJSbase.fieldCheck(info) && info.exchangeStatus === '3' && info.receivingFun === '0' && appPlatformStr"
    >
      <view class="submit" @click="confirmReceiptTcOpen(info)">确认收货</view>
    </view>
  </scroll-view>

  <SubmitOrder
    v-model="exchangeBoxTc.open"
    :row="exchangeBoxTc.row"
    :info="exchangeBoxTc.info"
    source="taskReward"
    :num="!$LJSbase.fieldCheck(info) ? Number(info.number) : 0"
    :id="!$LJSbase.fieldCheck(info) ? info.id : null"
    @infoChange="infoChange"
  ></SubmitOrder>

  <!-- 确认收货 - 弹窗 -->
  <ljs-dialog-vue3
    :title="confirmReceiptTc.title"
    v-model="confirmReceiptTc.open"
    width="calc(100% - 96rpx * 2)"
    background="linear-gradient(180deg, #57f4ab 0%, #f7fcf2 23%, #f7fcf2 100%)"
    :closeButShow="false"
    :headerShow="false"
    zIndex="2001"
  >
    <view class="comOtherTc">
      <view class="title">确认收货</view>
      <view class="dis">您要确认已经收到货品了吗？</view>
      <view class="butBox">
        <view class="but green1" @click="confirmReceiptTcClose">取消</view>
        <view class="but" @click="saveConfirmReceipt">确定</view>
      </view>
    </view>
  </ljs-dialog-vue3>
</template>

<style scoped lang="scss">
@use './OrderInfo';
</style>
