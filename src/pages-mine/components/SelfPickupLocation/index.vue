<script setup lang="ts">
import { SelfPickupLocation } from '@/pages-mine/api/common'
import { openTxMap } from '@/utils/base'
const props = defineProps({
  modelValue: [String, Number],
  mallId: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue'])

const { proxy } = getCurrentInstance()

const selfPickupLocationData = ref([])
onMounted(async () => {
  const { rows } = await SelfPickupLocation(props.mallId)
  if (!proxy.$LJSbase.fieldCheck(rows)) {
    console.log(rows)

    selfPickupLocationData.value = rows
  }
})

function clickItem(row) {
  emit('update:modelValue', row.pointId)
}
</script>

<template>
  <view class="StoreShow">
    <view class="t">自提点</view>
    <view class="c" v-if="selfPickupLocationData.length > 0">
      <view
        class="one"
        :class="{
          active: modelValue === item.pointId,
        }"
        v-for="(item, i) in selfPickupLocationData"
        :key="i"
        @click="clickItem(item)"
      >
        <view class="name">{{ item.pointName }}</view>
        <text @click.stop="openTxMap(item.coordinates, item.pointName)" class="iconfont icon-map-pin-line"></text>
      </view>
    </view>
    <view class="c" v-else><text class="null">暂无可用</text></view>
  </view>
</template>

<style scoped lang="scss">
@use './index';
</style>
