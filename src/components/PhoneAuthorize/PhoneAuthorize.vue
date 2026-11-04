<script setup lang="ts">
import UserManager from '@/common/UserManager'
import { ossUrl } from '@/utils/base'
defineOptions({
  name: 'PhoneAuthorize',
})
type Props = {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const term = ref('0')
function termChange(e) {
  term.value = term.value === '0' ? '1' : '0'
}
const phoneTc = ref({
  title: '授权',
})
function getPhoneNumberMask() {
  if (term.value === '0') {
    uni.showModal({
      title: '系统提示',
      content: `已阅读并同意《隐私保护指引》`,
      confirmText: '同意',
      cancelText: '不同意',
      success: (modalRes) => {
        if (modalRes.confirm) {
          term.value = '1'
        }
      },
    })
  } else {
    term.value = '1'
  }
}
function getPhoneNumber(e) {
  if (UserManager.getInstance().bindUserMobile(e.detail.code)) {
    close()
  }
}
function close() {
  emit('update:modelValue', false)
}

onMounted(() => {})
</script>

<template>
  <ljs-xf-dialog-vue3 :title="phoneTc.title" v-model="modelValue" :headerShow="false" height="100%" :zIndex="3000">
    <view class="phone-authorize">
      <ljs-top-vue3 title="登录授权" class="comTop" backgroundColor="transparent" titleColor="#333">
        <view class="closeBox iconfont icon-jiantou-zuo" @click="close"></view>
      </ljs-top-vue3>

      <view class="bg">
        <view class="left"></view>
        <view class="right"></view>
      </view>

      <view class="main">
        <image class="logo" :src="ossUrl('/weapp/common/PhoneAuthorize_logo.png')" />
        <view class="text1">即将授权官方溯源平台</view>
        <view class="text2">请确认是否为本人操作</view>
        <view class="butMask" v-if="term === '0'" @click="getPhoneNumberMask">授权登录</view>
        <button class="but" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" v-else>开始授权</button>
        <!-- <view class="cancel" @click="close">取消登录</view> -->

        <view class="termBox">
          <view class="iconBox" @click="termChange">
            <view class="iconfont icon-duigou-cu" :class="{ active: term === '1' }"></view>
          </view>
          <view class="text" @click="termChange">
            <text>我已阅读并同意</text>
            <text class="blue" @click.stop="$LJSrun.gp_navigateTo('/pages-other/PhoneAuthorizeAgreement/PhoneAuthorizeAgreement')">
              《隐私保护指引》
            </text>
          </view>
        </view>
      </view>
    </view>
  </ljs-xf-dialog-vue3>
</template>

<style scoped lang="scss">
@use './PhoneAuthorize';
</style>
