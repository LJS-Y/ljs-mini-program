<script setup lang="ts">
import { getDict } from '@/api/commonApi'
import { ossUrl } from '@/utils/base'
const props = defineProps({
  modelValue: [String, Number],
})
const emit = defineEmits(['update:modelValue'])

const { proxy } = getCurrentInstance()

const receivingFunData = ref([])
onMounted(async () => {
  const data1 = await getDict('receiving_fun_dict')
  if (!proxy.$LJSbase.fieldCheck(data1)) {
    receivingFunData.value = data1
  }
})

function clickItem(row, index) {
  emit('update:modelValue', row.dictValue)
}
</script>

<template>
  <view class="StoreShow">
    <view class="t">发货方式</view>
    <view class="c" v-if="receivingFunData.length > 0">
      <ljs-tabs-vue3
        :data="receivingFunData"
        :limit="0"
        :opts="{
          itemPadding: '20rpx 12rpx',
          fontColor: '#1A1A1A',
          fontActiveColor: '#9A244B',
          fontSize: '28rpx',
          fontActiveSize: '28rpx',
          lineImg: ossUrl('/weapp/pages-mine/Order/order_tabsBg.png'),
          lineWidth: '33rpx',
          lineHeight: '6rpx',
        }"
        @clickItem="clickItem"
      >
        <template #default="{ row }">
          <view class="item">
            <view class="title">{{ row.dictLabel }}</view>
          </view>
        </template>
      </ljs-tabs-vue3>
      <!-- <view class="one" v-for="(item, i) in receivingFunData" :key="i">
        {{ item.dictLabel }}
      </view> -->
    </view>
  </view>
</template>

<style scoped lang="scss">
@use './index';
</style>
