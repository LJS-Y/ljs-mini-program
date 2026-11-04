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
import { receivingAddressAdd, receivingAddressInfo } from '@/pages-mine/api/ReceivingAddress'
import { appBottomSafeHeight, appMode } from '@/utils/base'
import { controlSwitch } from '@/api/commonApi'
defineOptions({
  name: 'ReceivingAddressForm ',
})
const { proxy } = getCurrentInstance()

/**
 * 收货地址表单数据
 *
 * 表单初始化时必须给齐字段（输入框要有初始值），所以这里声明为必填；
 * 但接口 ReceivingAddressInfo 的字段是可选的，回填时会做一次补空处理
 * （见 getInfo），保证 form.data 始终满足必填约束。
 * id 用于区分新增/修改（模板里 fieldCheck(form.data.id) 判断标题），新增时为 undefined。
 */
type AddressForm = {
  /** 地址主键；新增时为 undefined */
  id?: string | number
  /** 收货人 */
  name: string
  /** 手机号 */
  mobile: string
  /** 所在地区（省市区级联选择） */
  area: any[]
  /** 详细地址 */
  address: string
  /** 是否默认地址 */
  isDefault: boolean
  [key: string]: any
}

const form = ref<{
  data: AddressForm
  butLoading: boolean
}>({
  // 数据
  data: {
    name: '',
    mobile: '',
    area: [], // 所在地区
    address: '', // 详细地址
    isDefault: true,
  },
  // 节流阀
  butLoading: false,
})
function areaChange(e) {
  const { code, postcode, value } = e.detail
  form.value.data.area = value
}

function clear() {
  form.value.data.name = ''
  form.value.data.mobile = ''
  form.value.data.area = []
  form.value.data.address = ''
}
// 微信导入
function importAddress() {
  uni.chooseAddress({
    success(res) {
      form.value.data.name = res.userName
      form.value.data.mobile = res.telNumber
      form.value.data.area = [res.provinceName, res.cityName, res.countyName]
      form.value.data.address = res.detailInfo
    },
    fail(error) {
      console.log(error)
    },
    complete(res) {},
  })
}
function isDefaultClick() {
  form.value.data.isDefault = !form.value.data.isDefault
}
function save() {
  const query = proxy.$LJSbase.deepCopy(form.value.data)
  if (proxy.$LJSbase.fieldCheck(query.name)) {
    proxy.$LJSmsg.msg('请输入收件人名字')
    return
  }
  if (proxy.$LJSbase.fieldCheck(query.mobile)) {
    proxy.$LJSmsg.msg('请输入手机号码')
    return
  } else {
    if (query.mobile.toString().length < 11 || !/^1(3|4|5|6|7|8|9)\d{9}$/.test(query.mobile)) {
      proxy.$LJSmsg.msg('请输入正确的手机号')
      return
    }
  }
  if (query.area.length === 0) {
    proxy.$LJSmsg.msg('请选择省市区')
    return
  }
  if (proxy.$LJSbase.fieldCheck(query.address)) {
    proxy.$LJSmsg.msg('请输入详细地址')
    return
  }
  useUserStore().setComLoadingState({
    open: true,
  })
  form.value.butLoading = true
  receivingAddressAdd(query).then(({ data }) => {
    // proxy.$LJSmsg.msg_success('新增成功')
    proxy.$LJSrun.gp_navigateBack(
      1,
      {
        code: 200,
        msg: proxy.$LJSbase.fieldCheck(query.id) ? '新增成功' : '修改成功',
      },
      'ljsGpBackF',
    )
    useUserStore().setComLoadingState({
      open: false,
    })
  })
}

function getInfo(id) {
  receivingAddressInfo(id).then((data) => {
    // 接口字段均为可选，这里补空保证 form.data 满足必填约束，
    // 避免输入框出现 undefined 受控告警。
    form.value.data = {
      id: data?.id,
      name: data?.name ?? '',
      mobile: data?.mobile ?? '',
      area: data?.area ?? [],
      address: data?.address ?? '',
      isDefault: data?.isDefault ?? false,
      ...data,
    }
  })
}

const bottomSafeHeight = ref(0)
const topStateHeight = ref(0)
onLoad(async (o) => {
  await getShowApi()
  if (!PointsMallShowTag.value) {
    proxy.$LJSrun.gp_reLaunch('/pages/home/HomeIndex')
    return
  }
  if (!proxy.$LJSbase.fieldCheck(o.id)) {
    getInfo(o.id)
  }
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
</script>

<template>
  <ljs-top-vue3
    :title="`${$LJSbase.fieldCheck(form.data.id) ? '新增' : '修改'}收货地址`"
    backgroundColor="#F1F3F5"
    titleColor="#000"
    :back="{
      ...$topBack,
      imgTag: '000',
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
      <view class="formBox">
        <view class="item">
          <view class="title">收件人</view>
          <view class="inputBox">
            <input
              class="input paddR_150"
              v-model="form.data.name"
              maxlength="20"
              placeholder="请输入收件人名字"
              placeholder-class="comPlaceholder-address"
            />
            <view class="wxBut" @click="importAddress">
              <text class="iconfont icon-wechat-fill"></text>
              <text>微信导入</text>
            </view>
          </view>
        </view>
        <view class="item">
          <view class="title">手机号码</view>
          <view class="inputBox">
            <input
              class="input"
              v-model="form.data.mobile"
              @input="$LJSfc.numCheck(form.data, 'mobile')"
              maxlength="11"
              placeholder="11位手机号码"
              placeholder-class="comPlaceholder-address"
            />
            <view
              v-if="form.data.mobile.length > 0"
              @click="form.data.mobile = ''"
              class="closeIcon iconfont icon-dengluzhuceguanbi"
            ></view>
          </view>
        </view>
        <view class="item">
          <view class="title">所在地区</view>
          <view class="inputBox">
            <picker mode="region" class="picker" @change="areaChange" :value="form.data.area">
              <view v-if="form.data.area.length > 0" class="pickerCon">{{ form.data.area.toString().replaceAll(',', ' ') }}</view>
              <view v-else class="pickerCon comPlaceholder-address">请选择省市区</view>
            </picker>
            <view class="rightIcon iconfont icon-youjiantou"></view>
          </view>
        </view>
        <view class="item">
          <view class="title">详细地址</view>
          <view class="inputBox">
            <textarea
              class="textarea"
              v-model="form.data.address"
              maxlength="200"
              auto-height
              placeholder="请输入详细地址"
              placeholder-class="comPlaceholder-address"
            ></textarea>
            <view
              v-if="form.data.address.length > 0"
              @click="form.data.address = ''"
              class="closeIcon iconfont icon-dengluzhuceguanbi"
            ></view>
          </view>
        </view>
        <view class="defaultAddr" :class="{ active: form.data.isDefault }" @click="isDefaultClick">
          <text class="iconfont icon-duigou-cu"></text>
          <text>{{ !form.data.isDefault ? '设为' : '' }}默认地址</text>
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
      <view class="submit" @click="!form.butLoading ? save() : () => {}">保存收货地址</view>
      <view class="clear" @click="clear" v-if="!form.butLoading">清空</view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use './ReceivingAddress';
@use './ReceivingAddressForm';
</style>
