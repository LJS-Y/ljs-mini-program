<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '收货地址',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { receivingAddressList, receivingAddressDel, receivingAddressAdd } from '@/pages-mine/api/ReceivingAddress'
import { appBottomSafeHeight, appMode, ossUrl } from '@/utils/base'
import { controlSwitch } from '@/api/commonApi'
defineOptions({
  name: 'ReceivingAddressIndex ',
})
const { proxy } = getCurrentInstance()

const addressData = ref([])
function isDefaultClick(row) {
  const query = proxy.$LJSbase.deepCopy(row)
  useUserStore().setComLoadingState({
    open: true,
  })
  query.isDefault = !query.isDefault
  receivingAddressAdd(query).then((data) => {
    getList()
  })
}
function del(row, index) {
  uni.showModal({
    title: '温馨提示',
    content: '是否删除该地址？',
    success: (res) => {
      if (res.confirm) {
        useUserStore().setComLoadingState({
          open: true,
        })
        receivingAddressDel(row.id).then(async (data) => {
          addressData.value.splice(index, 1)
          proxy.$LJSmsg.msg_success('已删除')
          useUserStore().setComLoadingState({
            open: false,
          })
        })
      }
    },
  })
}

function getList() {
  useUserStore().setComLoadingState({
    open: true,
  })
  receivingAddressList().then((data) => {
    addressData.value = data
    useUserStore().setComLoadingState({
      open: false,
    })
  })
}

function updateAddress() {
  return () => {
    for (const item of addressData.value) {
      // item.isDefault &&
      if (!proxy.$LJSbase.fieldCheck(chooseId.value) ? item.id === chooseId.value : item.isDefault) {
        useUserStore().setDefaultAddress(item)
        return true
      }
    }
    useUserStore().setDefaultAddress(null)
    return true
  }
}

const chooseId = ref(null)

const bottomSafeHeight = ref(0)
const topStateHeight = ref(0)
const source = ref(null)
onLoad(async (o) => {
  await getShowApi()
  if (!PointsMallShowTag.value) {
    proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
    return
  }
  if (!proxy.$LJSbase.fieldCheck(o.source)) {
    source.value = o.source
    if (!proxy.$LJSbase.fieldCheck(o.id)) {
      chooseId.value = o.id
    }
  }
  getList()
})
onReady(async () => {
  const winInfo = uni.getWindowInfo()
  topStateHeight.value = winInfo.statusBarHeight
  // 底部安全距离
  bottomSafeHeight.value = await appBottomSafeHeight()
})

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

function chooseAddress(row) {
  chooseId.value = chooseId.value !== row.id ? row.id : null
}

function ljsGpBackF(res) {
  if (res.code === 200) {
    proxy.$LJSmsg.msg_success(res.msg)
    getList()
  }
}
defineExpose({
  ljsGpBackF,
})
</script>

<template>
  <ljs-top-vue3
    title="收货地址"
    backgroundColor="#F1F3F5"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
      beforeCallback: updateAddress(),
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
      class="mainBox"
      :style="{
        height: `calc(100% - ${bottomSafeHeight}px - 104rpx)`,
      }"
    >
      <view class="nullBox" v-if="addressData.length === 0">
        <image class="pic" :src="ossUrl('/weapp/pages-mine/ReceivingAddress/null.png')" />
      </view>
      <view class="list" v-else>
        <view
          class="item"
          v-for="(item, i) in addressData"
          :key="i"
          @click.stop="source === 'pointMallChooseAddress' ? chooseAddress(item) : () => {}"
        >
          <view class="title">
            <view class="defaultAddr" :class="{ active: item.id === chooseId }" v-if="source === 'pointMallChooseAddress'">
              <text class="iconfont icon-duigou-cu"></text>
              <!-- <text>{{ !item.isDefault ? '设为' : '' }}默认地址</text> -->
            </view>
            <view class="titleText">{{ item.name }}｜{{ $LJSprivacy.desensitizationPhone(item.mobile.toString()) }}</view>
          </view>
          <view class="address">{{ item.area.toString().replaceAll(',', '') }}{{ item.address }}</view>
          <view class="bottom">
            <view class="defaultAddr" :class="{ active: item.isDefault }" @click.stop="isDefaultClick(item)">
              <text class="iconfont icon-duigou-cu"></text>
              <text>{{ !item.isDefault ? '设为' : '' }}默认地址</text>
            </view>
            <view class="operateBut">
              <view @click.stop="del(item, i)" class="del iconfont icon-lujing1"></view>
              <view
                @click.stop="
                  $LJSrun.gp_navigateTo('/pages-mine/ReceivingAddress/ReceivingAddressForm', {
                    id: item.id,
                  })
                "
                class="edit iconfont icon-bianji"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view
      class="but"
      :style="{
        height: `calc(${bottomSafeHeight}px + 104rpx)`,
        'padding-bottom': `${bottomSafeHeight}px`,
      }"
    >
      <view class="submit" @click="$LJSrun.gp_navigateTo('/pages-mine/ReceivingAddress/ReceivingAddressForm')">新增收货地址</view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use './ReceivingAddress';
@use './ReceivingAddressIndex';
</style>
