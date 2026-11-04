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
import UserManager from '@/common/UserManager'
import { ossUrl } from '@/utils/base'
import PointsRule from '../components/PointsRule/index.vue'
import PointsDetails from '../components/PointsDetails/index.vue'
import PointsTaskList from '../components/PointsTaskList/index.vue'
import { useUserStore } from '@/store'
import { pointsSignIn, calendarSignIn, totalSignIn, signInRule, setSignInRemind, getSignInRemind } from '@/api/pages-mine/Points'
import { wxSubscribeMessage } from '@/utils/base'
import { pointUse } from '../utils/common'

/**
 * 签到提醒模板 ID（示例）
 * 请替换为自己申请的模板
 */
const SUBSCRIBE_TMPL_SIGN_IN_REMIND = 'TMPL_ID_REPLACE_WITH_YOURS_SIGN_IN_REMIND'

defineOptions({
  name: 'MakePointsIndex',
})
const instance = getCurrentInstance()
const { proxy } = getCurrentInstance()

const calendar_weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const calendar = ref({
  ruleDate: null, // 标尺日期。Date类
  now: null, // 当前时间
  showMY: null, // 显示的年月
  days: [],
})
// 初始化日期数据
// ruleD: Date类，标尺日期
function calendarInit(ruleD = null) {
  const oneDay = 3600 * 1000 * 24
  const date = new Date(proxy.$LJSdate.formatTime(Date.now(), '{y}-{m}-{d}'))
  calendar.value.now = date.getTime()
  calendar.value.ruleDate = proxy.$LJSbase.fieldCheck(ruleD) ? date : ruleD // 标尺日期
  const ruleDate = calendar.value.ruleDate
  calendar.value.showMY = proxy.$LJSdate.formatTime(ruleDate.getTime(), '{y}-{m}')
  calendar.value.days = []
  const startDate = proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{y}-{m}-01')
  const startDateWeek = new Date(startDate).getDay()

  let endYear = Number(proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{y}'))
  let endMonth = Number(proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{m}'))
  if (endMonth + 1 > 12) {
    endMonth = 1
    endYear++
  } else {
    endMonth++
  }
  const endDateTime = new Date(`${endYear}-${proxy.$LJSnum.numberB0(endMonth)}-01`).getTime() - oneDay
  const endDate = proxy.$LJSdate.formatTime(endDateTime, '{y}-{m}-{d}')

  const startDay = Number(proxy.$LJSdate.formatTime(startDate, '{d}'))
  const endDay = Number(proxy.$LJSdate.formatTime(endDate, '{d}'))

  for (let i = 0; i < startDateWeek; i++) {
    calendar.value.days.push({
      dayStr: null, // 日期值
      // activity: [], // 该日期的活动数据
    })
  }
  for (let i = startDay; i <= endDay; i++) {
    const dayStr = proxy.$LJSdate.formatTime(startDate, '{y}-{m}-') + proxy.$LJSnum.numberB0(i)
    calendar.value.days.push({
      dayStr, // 日期值
      signIn: false, // 是否签到
    })
  }
}
// 月份切换箭头
function calendarMonthC(tag) {
  let nextYear = Number(proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{y}'))
  let nextMonth = Number(proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{m}'))
  if (nextMonth + tag > 12) {
    nextMonth = 1
    nextYear++
  } else if (nextMonth + tag < 1) {
    nextMonth = 12
    nextYear--
  } else {
    nextMonth += tag
  }
  const ruleDate = `${nextYear}-${proxy.$LJSnum.numberB0(nextMonth)}-01`

  calendarInit(new Date(ruleDate))
  getcalendarSignIn()
}
function calendarItemClass({ dayStr, signIn }) {
  return {
    now: proxy.$LJSdate.formatTime(calendar.value.now, '{y}-{m}-{d}') === dayStr,
    grey: calendar.value.now > new Date(dayStr).getTime(),
    overDaySignIn: calendar.value.now > new Date(dayStr).getTime() && signIn,
  }
}

// 获取日历签到数据
async function getcalendarSignIn() {
  const yearMonth = proxy.$LJSdate.formatTime(calendar.value.ruleDate, '{y}-{m}')
  const data = await calendarSignIn({
    yearMonth,
  })
  // 判断今日是否签到
  if (data.indexOf(proxy.$LJSdate.formatTime(new Date().getTime(), '{y}-{m}-{d}')) > -1) {
    signInTag.value = true
  }
  data.forEach((item) => {
    for (const day of calendar.value.days) {
      if (item === day.dayStr) {
        day.signIn = true
        break
      }
    }
  })
}
// 获取累计天数
async function gettotalSignIn() {
  const data = await totalSignIn()
  minePoint.value.signInDays = data
}

const signInRuleData = ref([])
// 连续签到规则
async function getsignInRule() {
  const data = await signInRule()
  signInRuleData.value = []
  data.forEach((item) => {
    if (item.ruleType != 3) {
      signInRuleData.value.push(item)
    }
  })
}

const signInTag = ref(false)
/**
 * 签到成功弹层状态
 * point 在签到成功后由 data.checkinData.totalPoints 赋值，弹层里展示「积分 +N」
 */
const signInSuccess = ref<{
  /** 弹出层标题 */
  title: string
  /** 是否显示弹出层 */
  open: boolean
  /** 本次获得积分 */
  point?: number
}>({
  // 弹出层标题
  title: '',
  // 是否显示弹出层
  open: false,
})
const qdRemindTag = ref<boolean>(false)
// 签到提醒状态
async function getPointSignInRemind() {
  try {
    const { code, data } = await getSignInRemind()
    if (code === 200 && !proxy.$LJSbase.fieldCheck(data)) {
      // 0/1 转 boolean
      qdRemindTag.value = !!data
    }
  } catch (e) {
    proxy.$LJSmsg.msg('签到提醒状态异常，请联系管理员')
    return false
  }
}
async function qdRemindTagClick() {
  const key = SUBSCRIBE_TMPL_SIGN_IN_REMIND
  return new Promise(async (resolve, reject) => {
    useUserStore().setComLoadingState({
      open: true,
    })
    const res = await qdRemindTagAPI(!qdRemindTag.value)
    useUserStore().setComLoadingState({
      open: false,
    })
    if (res) {
      if (!qdRemindTag.value) {
        wxSubscribeMessage([key])
          .then((res) => {
            // 用户同意
            if (res[key] === 'accept') {
              resolve(true)
            } else {
              qdRemindTagAPI(qdRemindTag.value)
              resolve(false)
            }
          })
          .catch(() => {
            qdRemindTagAPI(qdRemindTag.value)
            resolve(false)
          })
      } else {
        resolve(true)
      }
    } else {
      resolve(false)
    }
  })
}
function qdRemindTagAPI(isSignInRemind) {
  return new Promise((resolve, reject) => {
    setSignInRemind({
      isSignInRemind,
    })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

function signInOpen() {
  useUserStore().setComLoadingState({
    open: true,
  })
  pointsSignIn()
    .then((data) => {
      if (data.checkinStatus) {
        signInTag.value = true
        signInSuccess.value.open = true
        signInSuccess.value.point = data.checkinData.totalPoints
        minePoint.value.signInDays++
        getcalendarSignIn()
        useUserStore().updateNowPoints()
      } else {
        signInTag.value = true
        proxy.$LJSmsg.msg('今日已签')
      }
    })
    .finally(() => {
      useUserStore().setComLoadingState({
        open: false,
      })
    })
}
function signInClose() {
  signInSuccess.value.open = false
}
function signInAgain() {
  const key = SUBSCRIBE_TMPL_SIGN_IN_REMIND
  uni.requestSubscribeMessage({
    tmplIds: [key],
    success(res) {
      // 用户同意
      if (res[key] === 'accept') {
        proxy.$LJSmsg.msg('明天见~')
        qdRemindTag.value = true
        qdRemindTagAPI(true)
      }
    },
    fail() {
      proxy.$LJSmsg.msg('失败，请手动授权')
      signInTag.value = false
    },
    complete() {
      signInClose()
    },
  })
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
  myRewardTc.value.title = '奖励记录'
  myRewardTc.value.open = true
}

const minePoint = ref({
  point: computed(() => useUserStore().nowPoints), // 当前积分
  signInDays: 0, // 连续签到多少天
})

function getSignInButTop() {
  return new Promise((resolve) => {
    uni
      .createSelectorQuery()
      .select('#signInBut')
      .boundingClientRect((data) => {
        // 兼容单节点与数组
        const rect = Array.isArray(data) ? data[0] : data
        resolve(rect?.top) // 返回距离视口顶部的距离（滚动会影响此值）
      })
      .exec()
  })
}
// 签到按钮是否在屏幕内
const signInButPosition = ref(true)
async function calcSignInButPosition() {
  await nextTick()
  const top = await getSignInButTop()
  if (top >= winHeight.value) {
    signInButPosition.value = false
  } else {
    signInButPosition.value = true
  }
}

const comMainScrollTimer = ref(null)
// comMain滚动监听
function comMainScroll(e) {
  // const scrollTop = e.target.scrollTop
  if (!proxy.$LJSbase.fieldCheck(comMainScrollTimer.value)) {
    clearTimeout(comMainScrollTimer.value)
  }
  comMainScrollTimer.value = setTimeout(() => {
    calcSignInButPosition()
  }, 200)
}
const topStateHeight = ref(0)
const winHeight = ref(0)
const checkLoginState = ref(false) // 登录检测
onLoad(async (o) => {
  checkLoginState.value = await UserManager.getInstance().checkLoginFunc()
  useUserStore().setComLoadingState({
    open: true,
  })
  useUserStore().updateNowPoints()
  calendarInit()
  await getcalendarSignIn()
  await gettotalSignIn()
  await getsignInRule()
  await getPointSignInRemind()
  useUserStore().setComLoadingState({
    open: false,
  })
  useUserStore().setDomeBg('#d3fcec')

  calcSignInButPosition()
})
onReady(async () => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
  winHeight.value = winInfo.screenHeight
})
onShow(() => {
  useUserStore().setDomeBg('#d3fcec')
})
onBeforeUnmount(() => {
  useUserStore().setDomeBg()
})
// 分享
const pointsTaskList = ref(null) // 子组件引用
onShareAppMessage(async (res) => {
  // 情况1：点击子组件的分享按钮（from=button），调用子组件的分享逻辑
  if (res.from === 'button' && res.target) {
    // 调用子组件的分享方法并返回结果
    if (pointsTaskList.value && typeof pointsTaskList.value.handleShare === 'function') {
      return await pointsTaskList.value.handleShare(res)
    }
  }
  const title = 'LJS小程序'
  const path = `/pages/home/HomeIndex`
  return {
    title,
    path,
  }
})
</script>

<template>
  <ljs-top-vue3
    title="每日签到"
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
  <scroll-view
    scroll-y
    class="comMain"
    :style="{
      height: `calc(100vh - 80rpx - ${topStateHeight}px)`,
    }"
    @scroll="comMainScroll"
  >
    <view class="information">
      <view class="name">我的积分</view>
      <view class="points">
        <text class="iconfont icon-jifen"></text>
        <text
          class="num"
          :class="{
            w4: $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).num.toString().split('.')[0].length >= 4,
          }"
        >
          <text>{{ $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).num }}</text>
          <text class="unit">{{ $LJSnum.longNumText({ value: minePoint.point, isMerge: false, ws: 2 }).unit }}</text>
        </text>
        <text class="but" @click="pointUse">去兑换</text>
      </view>
      <!-- <image lazy-load class="pic" :src="ossUrl('/weapp/_mock/pages-aVine/pointsMall/yang.png')" /> -->
    </view>

    <view class="calendar">
      <view class="title">
        <view class="bg" :style="{
          'background-image': `url(${ossUrl('/weapp/_mock/pages-aVine/pointsMall/calendar_titleBg.png')})`
        }"></view>
        <view class="t">
          <view @click="calendarMonthC(-1)" class="jt iconfont icon-zuojiantou"></view>
          <text class="num">
            {{
              $LJSdate.formatTime(calendar.showMY, '{m}') === '01'
                ? $LJSdate.formatTime(calendar.showMY, '{y}年{m}月')
                : $LJSdate.formatTime(calendar.showMY, '{m}月')
            }}
          </text>
          <view @click="calendarMonthC(1)" class="jt iconfont icon-youjiantou1"></view>
        </view>
        <view class="rightBut" @click="myRewardTcOpen">
          <image
            lazy-load
            class="icon"
            :src="ossUrl('/weapp/_mock/pages-aVine/pointsMall/calendar_gift_icon.png')"
          />
          <view class="name">我的奖励</view>
          <view class="jt iconfont icon-youjiantou"></view>
        </view>
      </view>
      <view class="con">
        <view class="other">
          <view class="weeks">
            <view class="item" v-for="(item, i) in calendar_weeks" :key="i">{{ item }}</view>
          </view>
          <view class="days">
            <view class="item" :class="calendarItemClass(item)" v-for="(item, i) in calendar.days" :key="i">
              <view class="bg" v-if="item.dayStr !== null">
                <view class="day">
                  {{ Number($LJSdate.formatTime(item.dayStr, '{d}')) }}
                </view>
                <view class="signIn">
                  <view class="iconfont icon-duigou" v-if="item.signIn">
                    <view class="trueMove"></view>
                  </view>
                  <view class="addNum" v-else-if="new Date(item.dayStr).getTime() < calendar.now">-</view>
                  <view class="addNum" v-else>+1</view>
                </view>
              </view>
              <view v-else class="null"></view>
            </view>
          </view>
        </view>
        <view class="signInRewards">
          <view class="t">
            <view class="name">连续签到领奖励</view>
            <view class="dis">
              <text>已连续签到</text>
              <text class="day">{{ minePoint.signInDays }}天</text>
            </view>
          </view>
          <view class="c" v-if="signInRuleData.length > 0">
            <ljs-tabs-vue3
              :data="signInRuleData"
              :limit="4"
              :activeShow="false"
              :opts="{
                itemPadding: '0rpx 10rpx',
              }"
            >
              <template #default="{ row }">
                <view
                  class="item"
                  :class="{
                    signIn:
                      row.ruleType == 1
                        ? Number(minePoint.signInDays) >= Number(row.continuityDays)
                        : Number(minePoint.signInDays) >= Number(row.continuityDays) + 30,
                  }"
                >
                  <view class="iconfont icon-jifen"></view>
                  <view class="add">+{{ row.rewardPoints }}积分</view>
                  <view class="addCondition">
                    {{ row.ruleType == 1 ? '首签' : '连续' }}{{ row.ruleType != 1 ? 'N x ' : '' }}{{ row.continuityDays }}天
                  </view>
                </view>
              </template>
            </ljs-tabs-vue3>
          </view>
          <view class="signInButZw" id="signInBut"></view>
          <view
            class="but"
            :class="{
              signInButPositionState: !signInButPosition,
            }"
          >
            <view class="button success" v-if="signInTag">
              <view class="iconfont icon-duigou">
                <view class="trueMove"></view>
              </view>
              <text>今日已签到</text>
            </view>
            <view class="button un-occurred" v-else @click="signInOpen">
              <text>立即签到</text>
              <text class="dis">每日签到可得奖励</text>
            </view>
          </view>
          <view class="remind">
            <view class="qdBut">
              <text class="text">签到提醒</text>
              <ljs-radio-slider
                v-model="qdRemindTag"
                :padding="20"
                :texts="['开', '关']"
                :bgColor="['#227351', '#F7F6FC']"
                :radioClick="qdRemindTagClick"
              ></ljs-radio-slider>
            </view>
            <!-- <view class="expand">
              <text>查看本月签到情况</text>
              <view class="iconfont icon-jiantouxia"></view>
            </view> -->
          </view>
        </view>
      </view>
    </view>

    <view class="doTasks">
      <view class="title">
        <view class="text">做任务得积分</view>
        <view class="rightBut" @click="myRewardTcOpen">
          <image
            lazy-load
            class="icon"
            :src="ossUrl('/weapp/_mock/pages-aVine/pointsMall/calendar_gift_icon.png')"
          />
          <view class="name">我的奖励</view>
          <view class="jt iconfont icon-youjiantou"></view>
        </view>
      </view>
      <PointsTaskList v-if="checkLoginState" ref="pointsTaskList"></PointsTaskList>
    </view>
    <!-- 占位 -->
    <view
      class="seatBox bottom noBgColor"
      :style="{
        height: signInButPosition ? 'calc(var(--window-bottom) + 40rpx)' : 'calc(var(--window-bottom) + 170rpx)',
      }"
    ></view>
  </scroll-view>

  <!-- 签到成功 - 弹窗 -->
  <ljs-dialog-vue3
    v-model="signInSuccess.open"
    class="signInSuccessTc"
    :headerShow="false"
    width="630rpx"
    background="transparent"
    zIndex="1000"
  >
    <view class="signInSuccess" :style="{
      'background-image': `url(${ossUrl('/weapp/subscribeAVine/pointsMall/signInBg.png')})`
    }">
      <view class="text">恭喜您获得以下奖励</view>
      <view class="box">
        <view class="iconfont icon-jifen"></view>
        <view class="num">积分 +{{ signInSuccess.point }}</view>
        <view class="but" @click="$LJSrun.gp_redirectTo('/pages-mine/Points/PointsMallIndex', {}, {})">去使用</view>
      </view>
      <view class="close iconfont icon-dengluzhuceguanbi" @click="signInClose"></view>
      <view class="signInAgain" @click="signInAgain">明日提醒我签到</view>
    </view>
  </ljs-dialog-vue3>

  <!-- 规则及规则弹窗 -->
  <view class="ruleBox" @click="ruleBoxTcOpen">
    <text>规</text>
    <text>则</text>
  </view>
  <ljs-xf-dialog-vue3 :title="ruleBoxTc.title" v-model="ruleBoxTc.open" :titleFontSize="34" background="#EEFDF7" height="70%">
    <PointsRule v-if="checkLoginState && ruleBoxTc.open" />
  </ljs-xf-dialog-vue3>

  <!-- 积分明细 -->
  <ljs-xf-dialog-vue3 :title="myRewardTc.title" v-model="myRewardTc.open" :titleFontSize="34" background="#EEFDF7" height="70%">
    <PointsDetails v-if="checkLoginState && myRewardTc.open" addOrIns="add" />
  </ljs-xf-dialog-vue3>
</template>

<style scoped lang="scss">
@use './MakePointsIndex';
</style>
