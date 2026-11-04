<script setup lang="ts">
import { useUserStore } from '@/store'
import { dfAddress, exchange, taskSubmit } from '@/api/pages-mine/Points'
import StoreShow from '../StoreShow/index.vue'
import ReceivingFun from '../ReceivingFun/index.vue'
import SelfPickupLocation from '../SelfPickupLocation/index.vue'
import { appBottomSafeHeight } from '@/utils/base'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: Boolean,
  // 积分商品
  row: {
    type: Object,
    default: () => {
      return null
    },
  },
  // 订单完整数据，来源：发放奖励
  info: {
    type: Object,
    default: () => {
      return null
    },
  },
  // 来源。默认： pointsMall ，积分商城； taskReward ，任务奖励确认。
  source: {
    type: String,
    default: 'pointsMall',
  },
  // 来源=taskReward 有效。商品数量
  num: {
    type: Number,
    default: 1,
  },
  // 来源=taskReward 有效。记录ID
  id: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'infoChange'])

const minePoint = ref({
  point: computed(() => useUserStore().nowPoints), // 当前积分
})

const exchangeBoxTc = ref({
  // 是否显示弹出层
  open: false,
  num: 1,
  form: {
    receivingFun: '0', // 发货方式，默认 邮寄
    sendPointId: null, // 自提点ID
  },
})
function exchangeBoxTcReset() {
  exchangeBoxTc.value.form = {
    receivingFun: '0', // 发货方式，默认 邮寄
    sendPointId: null, // 自提点ID
  }
}
function exchangeBoxTcClose() {
  exchangeBoxTc.value.open = false
  emit('update:modelValue', false)
  exchangeBoxTc.value.num = 1
}
function goodsCarCalc(num) {
  if (exchangeBoxTc.value.num + num < 1) {
    proxy.$LJSmsg.msg('最少选择1件')
    return
  } else if (props.row.isPurchaseRestriction && exchangeBoxTc.value.num + num > props.row.purchaseRestriction) {
    proxy.$LJSmsg.msg(`最多选择${props.row.purchaseRestriction}件`)
    return
  } else if (props.row.singleIsPurchaseRestriction === true && exchangeBoxTc.value.num + num > props.row.singlePurchaseRestriction) {
    proxy.$LJSmsg.msg(`单次兑换最多选择${props.row.singlePurchaseRestriction}件`)
    return
  }
  exchangeBoxTc.value.num += num
}

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    exchangeBoxTc.value.open = props.modelValue
    if (exchangeBoxTc.value.open) {
      exchangeForm.value.data.number = props.num
      // 重置表单所有数据
      exchangeBoxTcReset()
    }
  },
  // 注：原为 { mmediate: true }，拼写漏了开头的 i，导致 immediate 从未生效
  // （watch 在初始化时不会立即执行一次）。已修正为 immediate。
  { immediate: true },
)
// 底部吸附组件遮罩多层嵌套，状态未能更新到最外层，通过watch修复
watch(
  () => exchangeBoxTc.value.open,
  (newValue, oldValue) => {
    if (!exchangeBoxTc.value.open) {
      emit('update:modelValue', false)
    }
  },
)

const defaultAddress = ref(null)
async function getdefaultAddress() {
  defaultAddress.value = useUserStore().defaultAddress
  if (proxy.$LJSbase.fieldCheck(defaultAddress.value)) {
    const { code, data } = await dfAddress()
    if (code === 200 && !proxy.$LJSbase.fieldCheck(data)) {
      defaultAddress.value = data
      useUserStore().setDefaultAddress(defaultAddress.value)
    }
  }
}
watch(
  () => useUserStore().defaultAddress,
  (newValue, oldValue) => {
    defaultAddress.value = useUserStore().defaultAddress
  },
  { deep: true, immediate: true },
)

const exchangeForm = ref({
  data: {
    pointsMallId: null, // 商品ID
    number: null, // 数量
    receivingAddressId: null, // 收获地址id
  },
  loading: false,
})
// 立即兑换
function pointExchange() {
  if (
    props.row.category === 'goods' &&
    exchangeBoxTc.value.form.receivingFun === '0' &&
    (proxy.$LJSbase.fieldCheck(defaultAddress.value) || proxy.$LJSbase.fieldCheck(defaultAddress.value.id))
  ) {
    proxy.$LJSmsg.msg('请选择地址')
    return
  }
  if (proxy.$LJSbase.fieldCheck(exchangeBoxTc.value.num)) {
    proxy.$LJSmsg.msg('请添加数量')
    return
  }
  // 实物 - 自提
  if (props.row.category === 'goods' && exchangeBoxTc.value.form.receivingFun === '1') {
    if (proxy.$LJSbase.fieldCheck(exchangeBoxTc.value.form.sendPointId)) {
      proxy.$LJSmsg.msg('请选择自提点')
      return
    }
  }
  if (proxy.$LJSbase.fieldCheck(props.row) || proxy.$LJSbase.fieldCheck(props.row.id)) {
    proxy.$LJSmsg.msg('物品异常，请稍后再试')
    return
  }
  useUserStore().setComLoadingState({
    open: true,
  })
  exchangeForm.value.loading = true
  const query = {
    pointsMallId: props.row.id, // 商品ID
    number: exchangeBoxTc.value.num, // 数量
    receivingAddressId: props.row.category === 'goods' && exchangeBoxTc.value.form.receivingFun === '0' ? defaultAddress.value.id : null, // 收获地址id
    receivingFun: exchangeBoxTc.value.form.receivingFun, // 发货方式，默认 邮寄
    sendPointId: exchangeBoxTc.value.form.sendPointId, // 自提点ID
  }

  exchange(query)
    .then((data) => {
      if (data.exchangeProductStatus) {
        proxy.$LJSrun.gp_navigateTo('/pages-mine/Points/PointsMallSuccess')
        emit('update:modelValue', false)
      } else {
        proxy.$LJSmsg.msg(data.exchangeProductMsg)
      }
      exchangeForm.value.loading = false
      useUserStore().setComLoadingState({
        open: false,
      })
    })
    .catch(() => {
      exchangeForm.value.loading = false
      useUserStore().setComLoadingState({
        open: false,
      })
    })
}

// 确认
function taskExchange() {
  if (
    props.row.category === 'goods' &&
    (proxy.$LJSbase.fieldCheck(defaultAddress.value) || proxy.$LJSbase.fieldCheck(defaultAddress.value.id))
  ) {
    proxy.$LJSmsg.msg('请选择地址')
    return
  }
  useUserStore().setComLoadingState({
    open: true,
  })
  exchangeForm.value.loading = true
  const query = {
    id: props.id, // 记录ID
    receivingAddressId: props.row.category === 'goods' ? defaultAddress.value.id : null, // 收获地址id
  }
  taskSubmit(query)
    .then(({ code, data }) => {
      if (code === 200) {
        exchangeBoxTcClose()
        emit('infoChange')
      }
      exchangeForm.value.loading = false
      useUserStore().setComLoadingState({
        open: false,
      })
    })
    .catch(() => {
      exchangeForm.value.loading = false
      useUserStore().setComLoadingState({
        open: false,
      })
    })
}

const bottomSafeHeight = ref(0)
onMounted(async () => {
  // 底部安全距离
  bottomSafeHeight.value = await appBottomSafeHeight()
  getdefaultAddress()
})
</script>

<template>
  <ljs-xf-dialog-vue3
    v-model="exchangeBoxTc.open"
    :titleFontSize="34"
    background="#EEFDF7"
    height="70%"
    :headerShow="false"
    :closeButShow="false"
    zIndex="3000"
  >
    <view class="exchangeBoxTc" v-if="exchangeBoxTc.open">
      <view class="title">
        <!-- category
        物品: goods
        优惠券: coupon -->
        <template v-if="!$LJSbase.fieldCheck(row) && (row.category === 'goods' || row.category === '99')">
          <template v-if="exchangeBoxTc.form.receivingFun === '0'">
            <view class="icon iconfont icon-map-pin-line"></view>
            <view
              class="address no"
              v-if="$LJSbase.fieldCheck(defaultAddress)"
              @click="
                $LJSrun.gp_navigateTo('/pages-mine/ReceivingAddress/ReceivingAddressIndex', {
                  source: 'pointMallChooseAddress',
                })
              "
            >
              <text class="t">请选收货地址</text>
              <text class="jt iconfont icon-youjiantou"></text>
            </view>
            <view
              class="address yes"
              v-else
              @click="
                $LJSrun.gp_navigateTo('/pages-mine/ReceivingAddress/ReceivingAddressIndex', {
                  source: 'pointMallChooseAddress',
                  id: defaultAddress.id,
                })
              "
            >
              <view class="user">
                <view class="t">
                  <view class="userName comIgnore1">{{ defaultAddress.name }}</view>
                  <view>｜{{ $LJSprivacy.desensitizationPhone(defaultAddress.mobile) }}</view>
                </view>
                <view class="jt iconfont icon-youjiantou"></view>
              </view>
              <view class="addr">{{ defaultAddress.area.toString().replaceAll(',', '') }}{{ defaultAddress.address }}</view>
            </view>
          </template>
          <template v-else>
            <view class="icon iconfont icon-bianji"></view>
            <view class="address no">
              <text class="t">准备自提</text>
            </view>
          </template>
        </template>
        <template v-else-if="!$LJSbase.fieldCheck(row) && row.category === 'coupon'">
          <view class="icon iconfont icon-archive-2-line-2"></view>
          <view class="address no">
            <text class="t">优惠券</text>
          </view>
        </template>

        <view class="close iconfont icon-dengluzhuceguanbi" @click="exchangeBoxTcClose"></view>
      </view>
      <view
        class="con"
        :style="{
          height: `calc(100% - 116rpx - ${bottomSafeHeight}px - 80rpx)`,
        }"
      >
        <template v-if="!$LJSbase.fieldCheck(row)">
          <view class="zw40"></view>
          <view class="goodsBox">
            <image lazy-load class="pic" mode="heightFix" :src="row.coverImages_url" />
            <view class="point" v-if="source === 'pointsMall' && $LJSbase.fieldCheck(row.payFun) && row.platform.indexOf('99') === -1">
              <template v-if="row.payFun === 1 || row.payFun === 3">
                <text class="num">{{ row.points }}</text>
                <text>积分</text>
              </template>
              <template v-if="row.payFun === 3">
                <text>+</text>
              </template>
              <template v-if="row.payFun === 2 || row.payFun === 3">
                <text>￥</text>
                <text class="num">{{ row.amount }}</text>
              </template>
            </view>
          </view>
          <view class="name">{{ row.coverTitle }}</view>
          <view class="infoBox">
            <view class="numText">数量</view>
            <view class="goodsCar" v-if="source === 'pointsMall'">
              <view class="limit" v-if="row.isPurchaseRestriction">限购{{ row.purchaseRestriction }}份</view>
              <view class="iconfont icon-a--" @click="goodsCarCalc(-1)"></view>
              <view class="number">{{ exchangeBoxTc.num }}</view>
              <view class="iconfont icon-a-" @click="goodsCarCalc(1)"></view>
            </view>
            <view class="goodsCar" v-else-if="source === 'taskReward'">
              <view class="limit">{{ exchangeForm.data.number }}</view>
            </view>
          </view>
          <view class="store" v-if="row.category === 'coupon'">
            <view class="validityPeriod" v-if="row.isValidity === true">有效期：{{ row.startTime }}~{{ row.endTime }}</view>
            <view class="disableDate" v-if="row.disableWeekends === true">禁用日期：{{ row.disabledDates.toString() }}</view>
            <template
              v-if="
                $LJSbase.fieldCheck(info?.confirmExchange) || (!$LJSbase.fieldCheck(info?.confirmExchange) && info.confirmExchange !== '0')
              "
            >
              <StoreShow :data="!$LJSbase.fieldCheck(row.wineries) ? row.wineries : []" />
            </template>
          </view>
          <view class="store" v-else-if="row.category === 'goods'">
            <ReceivingFun v-model="exchangeBoxTc.form.receivingFun" />
            <template v-if="exchangeBoxTc.form.receivingFun === '1'">
              <SelfPickupLocation v-model="exchangeBoxTc.form.sendPointId" :mallId="row.id" />
            </template>
          </view>
        </template>
      </view>
      <view
        class="but"
        :style="{
          height: `calc(${bottomSafeHeight}px + 80rpx)`,
          'padding-bottom': `${bottomSafeHeight}px`,
        }"
      >
        <template v-if="source === 'pointsMall'">
          <template
            v-if="!$LJSbase.fieldCheck(row) && !$LJSbase.fieldCheck(row.stock) && !$LJSbase.fieldCheck(row.points) && !exchangeForm.loading"
          >
            <view
              class="butBox submit"
              v-if="Number(row.stock) > 0 && Number(minePoint.point) >= Number(row.points)"
              @click="pointExchange"
            >
              <view class="text">立即兑换</view>
            </view>
            <!-- minePoint.point -->
            <view class="butBox gray" v-else-if="Number(row.stock) <= 0">
              <view class="text">补货中....</view>
            </view>
            <view class="butBox gray" v-else-if="Number(minePoint.point) <= Number(row.points)">
              <view class="text">积分不足</view>
              <view class="dis">有{{ minePoint.point }}积分可用</view>
            </view>
          </template>
          <template v-else>
            <view class="butBox gray">
              <view class="text">兑换中...</view>
            </view>
          </template>
        </template>
        <template v-if="source === 'taskReward'">
          <view class="butBox submit" @click="taskExchange">
            <view class="text">确认</view>
          </view>
        </template>
      </view>
    </view>
  </ljs-xf-dialog-vue3>
</template>

<style scoped lang="scss">
@use './index';
</style>
