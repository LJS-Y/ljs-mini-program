<script setup lang="ts">
import { useUserStore } from '@/store'
import { pointsRecord } from '@/api/pages-mine/Points'
import { pointUse } from '../../utils/common'
const { proxy } = getCurrentInstance()

const props = defineProps({
  addOrIns: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['myRewardTcClose'])

/**
 * 常规列表 - 开始
 */
// 列表 - 搜索条件
const search = ref({
  pageNum: 1,
  pageSize: 10,
  addOrIns: props.addOrIns, // add/ins/空
})
const list = ref({
  data: [],
  total: 0,
})
// 列表
function getList() {
  const query = proxy.$LJSbase.deepCopy(search.value)
  pointsRecord(query).then(async (data) => {
    if (!proxy.$LJSbase.fieldCheck(data)) {
      list.value.data = list.value.data.concat(data.rows)
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
// 注：原实现重建 search 时只给了 pageNum/pageSize，把 addOrIns 丢了，
// 导致重置后积分明细变成「全部」而不是当前 tab（加/扣）的明细。已补回。
function resetQuery() {
  search.value = {
    pageNum: 1,
    pageSize: 10,
    addOrIns: props.addOrIns, // add/ins/空
  }
  handleQuery()
}
// 搜索
function handleQuery() {
  useUserStore().setComLoadingState({
    open: true,
  })
  list.value.data = []
  search.value.pageNum = 1
  getList()
}
/**
 * 常规列表 - 结束
 */

onMounted(() => {
  handleQuery()
})
</script>

<template>
  <view class="myRewardTc">
    <view class="item" v-for="(item, i) in list.data" :key="i">
      <view class="iconfont icon-jifen"></view>
      <view class="info">
        <!-- addOrIns字段区分'add'/'ins' 代表加积分还是扣积分 -->
        <view class="num">
          积分
          <text
            :class="{
              green: !$LJSbase.fieldCheck(item.addOrIns) && item.addOrIns === 'ins',
              red: $LJSbase.fieldCheck(item.addOrIns) || item.addOrIns === 'add',
            }"
          >
            {{ !$LJSbase.fieldCheck(item.addOrIns) ? (item.addOrIns === 'add' ? '+' : '-') : '+' }}{{ item.points }}
          </text>
        </view>
        <view class="source">来源: {{ item.source }}</view>
        <view class="date">{{ item.createTime }}</view>
      </view>
      <view
        v-if="$LJSbase.fieldCheck(item.addOrIns) || item.addOrIns === 'add'"
        class="but"
        @click="
          pointUse(() => {
            emit('myRewardTcClose')
          })
        "
      >
        去使用
      </view>
    </view>
    <view class="comListMore">
      <view class="but more" @click="moreList" v-if="search.pageNum * search.pageSize < list.total">加载更多</view>
      <view class="but null" v-else>{{ list.total === 0 ? '暂无数据' : '没有更多啦~~' }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use './index';
</style>
