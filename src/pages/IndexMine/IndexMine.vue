<script setup lang="ts">
import { useUserStore } from '@/store'
import { idForFile, fastCopy, clearAllCache, ossUrl } from '@/utils/base'

defineOptions({
  name: 'IndexMine',
})
const { proxy } = getCurrentInstance()
const emit = defineEmits(['phoneAuthorizeMine', 'contactCustomerServiceChange'])

// 无 props
defineProps()

// 用户信息、统计数据等可后续从接口获取
const userInfo = ref(null)

const hasWxMobile = ref(false)
watch(
  () => useUserStore().hasWxMobile,
  (newValue, oldValue) => {
    hasWxMobile.value = useUserStore().hasWxMobile
    userInfoChange()
  },
  { immediate: true },
)

const stats = ref([
  {
    label: '业务1',
    value: 0,
    click: () => {},
  },
  {
    label: '业务2',
    value: 0,
    click: () => {},
  },
  {
    label: '业务3',
    value: 0,
    click: () => {},
  },
])

const commonList = ref([
  {
    icon: ossUrl('/weapp/mine/mine-fuke.png'),
    title: '用户反馈',
    click: () => {
      pointsMallPower('/pages-mine/UserFeedback/UserFeedback', '为了提供更好的服务，请您先完成授权')
    },
  },
  {
    icon: ossUrl('/weapp/mine/mine-privacy.png'),
    title: '隐私保护指引',
    click: () => {
      proxy.$LJSrun.gp_navigateTo('/pages-other/PhoneAuthorizeAgreement/PhoneAuthorizeAgreement')
    },
  },
  {
    icon: ossUrl('/weapp/mine/mine-version.png'),
    title: '清除缓存',
    click: () => {
      useUserStore().setComLoadingState({
        open: true,
      })
      clearAllCache()
        .then(() => {
          proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
        })
        .catch((error) => {
          console.error(error)
          proxy.$LJSmsg.msg('清理失败')
        })
        .finally(() => {
          useUserStore().setComLoadingState({
            open: false,
          })
        })
    },
  },
  {
    icon: ossUrl('/weapp/mine/mine-version.png'),
    title: '版本',
    value: `v${proxy.$LJSbase.getAppBaseInfo().appVersion}`,
    moreState: false,
    click: () => {
      click5GetToken()
    },
  },
])

const topStateHeight = ref(0)
onMounted(async () => {
  useUserStore().setComLoadingState({
    open: true,
  })
  topStateHeight.value = uni.getWindowInfo().statusBarHeight
  userInfoChange()
  useUserStore().setComLoadingState({
    open: false,
  })
})

// 用户信息处理
function userInfoChange() {
  const user = proxy.$LJSbase.deepCopy(useUserStore().wxUser)
  user.nickName = !proxy.$LJSbase.fieldCheck(user.nickName) ? user.nickName : '前端好友'
  user.userNumber = !proxy.$LJSbase.fieldCheck(user.userNumber) ? user.userNumber : '-'
  user.userName = !proxy.$LJSbase.fieldCheck(user.userName) ? user.userName : null
  user.sex = !proxy.$LJSbase.fieldCheck(user.sex) ? user.sex : null
  user.phoneNumber = !proxy.$LJSbase.fieldCheck(user.phoneNumber) ? user.phoneNumber : null
  user.avatar_url = !proxy.$LJSbase.fieldCheck(user.avatarUrl)
    ? idForFile(user.avatarUrl)
    : ossUrl('/weapp/mine/mine-user-icon.png')

  userInfo.value = user
}

/**
 * 连续点击计数（用于隐藏功能：5 秒内连点 5 次复制 token）
 *
 * 注：原 reset 里多写了一个 getToken 字段（只赋值、从未读取），
 * 与初始化结构不一致导致类型报错，已移除。若将来需要「是否已获取」标记，
 * 请在初始化处一并声明再使用，保持两处结构一致。
 */
type Click5TokenState = {
  /** 超过该次数可获取 token */
  max: number
  /** 累计点击次数 */
  num: number
  /** 上次点击时间戳，未点击过为 null */
  time: number | null
}
const click5Token = ref<Click5TokenState>({
  max: 5, // 超过5次，可获取token
  num: 0, // 累计点击次数
  time: null, // 上次点击时间
})
function click5GetToken() {
  if (click5Token.value.num > 0) {
    const nowT = Date.now()
    if (click5Token.value.time === null || nowT - click5Token.value.time > 300) {
      click5GetTokenReset()
      return
    }
  }
  click5Token.value.num++

  if (click5Token.value.num >= click5Token.value.max) {
    fastCopy(useUserStore().userInfo.token)
    click5GetTokenReset()
    return
  }
  click5Token.value.time = Date.now()
}
function click5GetTokenReset() {
  click5Token.value = {
    max: 5, // 超过5次，可获取token
    num: 0, // 累计点击次数
    time: null, // 上次点击时间
  }
}

// 需要授权可访问
function pointsMallPower(url = '/pages-mine/Points/MakePointsIndex', msg = '积分系统需要您授权手机号') {
  if (useUserStore().hasWxMobile) {
    proxy.$LJSrun.gp_navigateTo(url)
  } else {
    emit('phoneAuthorizeMine', true)
    proxy.$LJSmsg.msg(msg)
  }
}

/**
 * 「我的」入口项
 * icon 为 null 时显示积分数值
 */
type MineEntryItem = {
  /** 显示文字 */
  name: string
  /** iconfont 类名；null 表示不显示图标，改显示 point */
  icon: string | null
  /** 数值，来自 store 的 computed；仅「积分」项有 */
  point?: any
  /** 点击回调 */
  click: () => void
}

const dlShop = ref<MineEntryItem[]>([
  {
    name: '积分',
    icon: null,
    point: computed(() => useUserStore().nowPoints),
    click: () => {
      pointsMallPower()
    },
  },
  {
    name: '订单',
    icon: 'icon-archive-2-line',
    click: () => {
      proxy.$LJSrun.gp_navigateTo('/pages-mine/Order/OrderIndex')
    },
  },
  {
    name: '待发货',
    icon: 'icon-archive-2-line-2',
    click: () => {
      proxy.$LJSrun.gp_navigateTo('/pages-mine/Order/OrderIndex', {
        index: 1,
      })
    },
  },
  {
    name: '地址',
    icon: 'icon-map-pin-line',
    click: () => {
      pointsMallPower('/pages-mine/ReceivingAddress/ReceivingAddressIndex', '为了提供更好的服务，请您先完成授权')
    },
  },
])
</script>

<template>
  <view class="comPage">
    <ljs-top-vue3 title="" class="comTop" backgroundColor="transparent">
      <view class="logo"></view>
    </ljs-top-vue3>

    <view class="mine-image-container">
      <image
        lazy-load
        class="image-logo"
        :src="ossUrl('/weapp/mine/bg-image-logo.png')"
        mode="aspectFill"
        :style="{
          top: `calc(80rpx + ${topStateHeight}px)`,
        }"
      />
    </view>
    <view
      class="mine-container"
      :style="{
        height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
      }"
      v-if="!$LJSbase.fieldCheck(userInfo)"
    >
      <!-- 头像和昵称 -->
      <view class="profile" @click="$LJSrun.gp_navigateTo('/pages-mine/UserInfo/UserInfo')">
        <image lazy-load class="avatar" :src="userInfo.avatar_url" />
        <view class="info">
          <view class="nickname">{{ userInfo.nickName }}</view>
          <view class="userid">编号. {{ userInfo.userNumber }}</view>
          <!-- <view class="tag">{{ userInfo.tag }}</view> -->
        </view>
      </view>
      <!-- 统计 -->
      <view class="stats-bg">
        <view v-for="item in stats" :key="item.label" class="stat-item" @click="item.click">
          <view class="stat-value">{{ item.value }}</view>
          <view class="stat-label">{{ item.label }}</view>
        </view>
      </view>

      <view class="mainBox">
        <view class="section-container">
          <!-- 商城 -->
          <view class="section-bg">
            <view class="section-title">
              <text>商城</text>
              <view class="more" @click="pointsMallPower('/pages-mine/Points/PointsMallIndex')">
                <text>前往商城</text>
                <text class="iconfont icon-youjiantou"></text>
              </view>
            </view>
            <view class="dlShop">
              <view class="item" v-for="(item, i) in dlShop" :key="i" @click="item.click()">
                <view class="icon iconfont" :class="item.icon" v-if="item.icon !== null"></view>
                <view
                  class="number"
                  :class="{
                    w4: $LJSnum.longNumText({ value: item.point, isMerge: false, ws: 2 }).num.toString().split('.')[0].length >= 4,
                  }"
                  v-else
                >
                  <text>{{ $LJSnum.longNumText({ value: item.point, isMerge: false, ws: 2 }).num }}</text>
                  <text class="unit">{{ $LJSnum.longNumText({ value: item.point, isMerge: false, ws: 2 }).unit }}</text>
                </view>
                <view class="text">{{ item.name }}</view>
              </view>
            </view>
          </view>
          <!-- 授权 -->
          <view class="section-bg" v-if="!hasWxMobile">
            <view class="section-title">隐私授权</view>
            <view class="section-group">
              <view class="item" @click="emit('phoneAuthorizeMine', true)">
                <image lazy-load :src="ossUrl('/weapp/mine/mine-fuke.png')" class="cell-icon" />
                <view class="text">去授权</view>
                <view class="iconfont icon-youjiantou"></view>
              </view>
            </view>
          </view>
          <!-- 常用功能 -->
          <view class="section-bg">
            <view class="section-title">常用功能</view>
            <view class="section-group">
              <template v-for="(item, i) in commonList" :key="i">
                <view class="item" @click="item.click">
                  <image lazy-load :src="item.icon" class="cell-icon" />
                  <view class="text">{{ item.title }}</view>
                  <view class="value" v-if="item.moreState === false">{{ item.value }}</view>
                  <view class="iconfont icon-youjiantou" v-if="item.moreState !== false"></view>
                </view>
                <view class="line" v-if="i < commonList.length - 1"></view>
              </template>
            </view>
          </view>
          <!-- 占位 -->
          <view class="menuSeatBox"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use './IndexMine';
</style>
