<script setup lang="ts">
import { useUserStore } from '@/store'
import { taskList } from '@/api/pages-mine/Points'
import { taskWriteoffCode, saveTaskRunData } from '../../utils/common'
import {
  TASK_ID_OLD_USER_REGISTER,
  TASK_ID_SHARE_WINERY,
  TASK_ID_SHARE_PRODUCT,
  TASK_ID_SIGN_IN,
} from '@/common/BusinessIds'
const { proxy } = getCurrentInstance()

const doTasks = ref([])
async function gettaskList() {
  const data = await taskList()
  if (!proxy.$LJSbase.fieldCheck(data)) {
    data.forEach((item) => {
      // 一次性
      if (item.taskType == 1) {
        // 老用户，未补注册记录，前端需要禁用按钮
        if (item.id === TASK_ID_OLD_USER_REGISTER) {
          item.completed = item.completed ? item.completed : useUserStore().hasWxMobile
        }
      }
      // 每日
      else if (item.taskType == 2) {
        item.completed = false
        // 分享酒庄
        if (item.id === TASK_ID_SHARE_WINERY) {
          saveTaskRunData(item.id, [item.todayCompletedCount, item.maxDailyCount])
          item.click = async () => {
            proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex', {
              source: 'wxShare',
              curTabBarName: 'IndexMenu2',
              WineProducingIndex: 1,
            })
          }
        }
        // 分享酒品
        else if (item.id === TASK_ID_SHARE_PRODUCT) {
          saveTaskRunData(item.id, [item.todayCompletedCount, item.maxDailyCount])
          item.click = async () => {
            proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex', {
              source: 'wxShare',
              curTabBarName: 'IndexMenu2',
              WineProducingIndex: 0,
            })
          }
        }
      }
      // 自定义
      else if (item.taskType == 3) {
      }
    })
    doTasks.value = data
  }
}

onMounted(async () => {
  await gettaskList()
})
// 暴露给父组件调用的分享方法（替代原有的onShareAppMessage）
const handleShare = async (res) => {
  let title = 'LJS小程序'
  let path = `/pages/home/HomeIndex`
  if (res.from === 'button') {
    // 获取核销数据
    useUserStore().setComLoadingState({
      open: true,
    })
    const row = res.target.dataset.row
    title = `LJS小程序-${row.taskName}`

    const taskConfigId = row.id // 邀请好友
    const { invitationId = null } = await taskWriteoffCode(taskConfigId)
    if (!proxy.$LJSbase.fieldCheck(invitationId)) {
      path += `?source=taskWriteoff_SHARE&taskConfigId=${taskConfigId}&invitationId=${invitationId}`
    }
    if (row.todayCompletedCount < row.maxDailyCount) gettaskList() // 更新次数
    useUserStore().setComLoadingState({
      open: false,
    })
    const shareObj = {
      title,
      path,
    }
    return shareObj
  }
  return {
    title,
    path,
  }
}
defineExpose({ handleShare })
</script>

<template>
  <view class="pointsTaskList">
    <view class="item" v-for="(item, i) in doTasks" :key="i">
      <view class="icon iconfont" :class="item.taskImagesUrl"></view>
      <view class="info">
        <!-- 任务名称 -->
        <view class="t">{{ item.taskName }}</view>
        <!-- 任务描述 -->
        <view class="dis">
          <text v-if="!$LJSbase.fieldCheck(item.taskDescription)">{{ item.taskDescription }}</text>
          <template v-if="item.taskType != 1">
            <text v-if="!$LJSbase.fieldCheck(item.taskDescription)">，</text>
            <text v-if="item.rewardType === '1'">您可获得{{ item.points }}积分</text>
            <text v-else-if="item.rewardType === '2'">您可获得{{ item.rewardItemsName }} x {{ item.rewardItemsNum }}</text>
          </template>
        </view>
        <!-- 任务时效 -->
        <view class="validityDate" v-if="!$LJSbase.fieldCheck(item.startTime) && !$LJSbase.fieldCheck(item.endTime)">
          <text class="iconfont icon-shijian"></text>
          <text>{{ $LJSdate.formatTime(item.startTime, '{y}-{m}-{d}') }} ~ {{ $LJSdate.formatTime(item.endTime, '{y}-{m}-{d}') }}</text>
        </view>
        <!-- 任务规则 -->
        <view class="rule">
          <view class="iconfont icon-jifen"></view>
          <view class="ruleDis" v-if="item.taskType == 1">+{{ item.points }}积分</view>
          <template v-else-if="item.taskType != 1">
            <view class="ruleDis" v-if="!$LJSbase.fieldCheck(item.maxDailyCount)">
              （{{ item.todayCompletedCount }}/{{ item.maxDailyCount }}）{{ item.taskName.slice(0, 2) }}次数
            </view>
            <view class="ruleDis" v-else>不限次数</view>
          </template>
        </view>
      </view>
      <template v-if="!$LJSbase.fieldCheck(item.validity) && item.validity !== 1">
        <view class="but finish">{{ item.validity === 0 ? '未开始' : '已结束' }}</view>
      </template>
      <template v-else>
        <template
          v-if="
            item.taskType === '1'
              ? !item.completed
              : (!$LJSbase.fieldCheck(item.maxDailyCount) && Number(item.todayCompletedCount) < Number(item.maxDailyCount)) ||
                $LJSbase.fieldCheck(item.maxDailyCount)
          "
        >
          <!-- 邀请好友 -->
          <!-- <template v-if="item.id === TASK_ID_SIGN_IN"> -->
          <!-- 测试 -->
          <template
            v-if="
              item.id === TASK_ID_SIGN_IN ||
              item.id === '8be919cf51f8a7f8a95976dbecb3dce6' ||
              item.id === '24d4dec0d895f1280d08eff71ef0fa3e' ||
              item.id === 'e1475f6ffaa87da8b92230eae3017b6e'
            "
          >
            <button open-type="share" :data-row="item" class="but">
              {{ item.buttonName }}
            </button>
          </template>
          <template v-else>
            <view class="but" @click="!$LJSbase.fieldCheck(item.click) ? item.click() : () => {}">{{ item.buttonName }}</view>
          </template>
        </template>
        <template v-else>
          <view class="but finish">已完成</view>
        </template>
      </template>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use './index';
</style>

<!-- 
// 核验：true - 获取核验码；false - 完成任务；
useUserStore().setComLoadingState({
  open: true,
})
const taskConfigId = TASK_ID_SHARE_WINERY
const { invitationId = null } = await taskWriteoffCode(taskConfigId)
if (!proxy.$LJSbase.fieldCheck(invitationId)) {
  useUserStore().setTaskData({
    hxData: {
      taskConfigId,
      invitationId,
    },
  })
}
useUserStore().setComLoadingState({
  open: false,
})
-->

<!-- 
// 执行的任务次数处理：初始化、taskWriteoffCode接口调用时需变更。
useUserStore().setTaskData({
  runData: {
    [`task_${TASK_ID_SHARE_PRODUCT}`]: [item.todayCompletedCount, item.maxDailyCount],
  },
})
-->

<!-- 
// 获取带有核销的地址
const path = taskWriteoffPath(`/pages-wineProducing/DetailsWinery/DetailsWinery`, {
  id: baseData.value.id,
})
-->

<!-- 
// 主动核销
taskWriteoff(options.taskConfigId, options.invitationId)
-->
