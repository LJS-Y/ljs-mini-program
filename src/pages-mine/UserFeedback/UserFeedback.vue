<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'UserFeedback',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { getDict, fileUpload } from '@/api/commonApi'
import { feedbackAdd } from '@/pages-mine/api/UserFeedback'
import { ossUrl } from '@/utils/base'
defineOptions({
  name: 'UserFeedback',
})
const { proxy } = getCurrentInstance()
const questionType = ref([])
const form = ref({
  businessType: null, // 业务来源
  businessId: null, // 业务ID
  type: null, // 问题类型
  describe: '', // 问题描述
  imgs: [], // 问题图片
  imageUrl: '', // 问题图片
  contactInformation: proxy.$LJSbase.fieldCheck(useUserStore().wxUser.phoneNumber) ? '' : useUserStore().wxUser.phoneNumber, // 联系方式
})
onLoad((o) => {
  if (!proxy.$LJSbase.fieldCheck(o.businessType) && !proxy.$LJSbase.fieldCheck(o.businessId)) {
    form.value.businessType = o.businessType
    form.value.businessId = o.businessId
  }

  initData()
})
onReady(() => {
  winW.value = uni.getWindowInfo().screenWidth
  topStateHeight.value = uni.getWindowInfo().statusBarHeight
})
async function initData() {
  const data1 = await getDict('feedback_type')
  if (!proxy.$LJSbase.fieldCheck(data1)) {
    questionType.value = data1
    if (data1.length > 0) {
      form.value.type = data1[0].dictValue
    }
  }
}
// 问题类型切换
function questionTypeChange(item) {
  form.value.type = item.dictValue
}
// 上传
async function upload(files) {
  // console.log(files)
  form.value.imgs = files
  // const imageUrls = form.value.imageUrl.split(',')
  // for (const file of files) {
  //   const res = await fileUpload(file.url)
  //   if (res.code === 200) {
  //     imageUrls.push(res.data.id)
  //   }
  // }
  // console.log(imageUrls)
  // form.value.imageUrl = imageUrls.toString()
}
// 确定提交
async function save() {
  const query = proxy.$LJSbase.deepCopy(form.value)
  if (proxy.$LJSbase.fieldCheck(query.type)) {
    proxy.$LJSmsg.msg('请选择问题类型')
    return
  }
  if (proxy.$LJSbase.fieldCheck(query.describe)) {
    proxy.$LJSmsg.msg('请输入问题描述')
    return
  }

  useUserStore().setComLoadingState({
    open: true,
  })
  const imageUrls = []
  for (const file of form.value.imgs) {
    const res = await fileUpload(file.url)
    if (res.code === 200) {
      imageUrls.push(res.data.id)
    }
  }
  const formQuery = {
    businessType: query.businessType, // 业务来源
    businessId: query.businessId, // 业务ID
    feedbackType: query.type, // 问题类型
    content: query.describe, // 问题描述
    imageUrl: imageUrls.toString(), // 问题图片
    contactInformation: query.contactInformation, // 联系方式
    source: 1, // 来源
  }
  feedbackAdd(formQuery).then((data) => {
    let msg = ''
    if (!proxy.$LJSbase.fieldCheck(data)) {
      msg = '反馈成功'
    } else {
      msg = '反馈失败'
    }
    useUserStore().setComLoadingState({
      open: false,
    })
    proxy.$LJSrun.gp_navigateBack(
      1,
      {
        code: 200,
        msg,
      },
      'ljsGpBackF',
    )
  })
}

const winW = ref(0)
const topHeight = ref(360)
const topStateHeight = ref(0)
const scrollOpacity = ref(1)

async function comMainScroll(e) {
  const scrollTop = e.target.scrollTop
  const rpx = Math.ceil(pxToRpx(scrollTop))
  const opacity = rpx / 256
  const errorVal = 0.01
  if (opacity < errorVal) {
    scrollOpacity.value = 1
  } else if (opacity >= errorVal && opacity <= 1 - errorVal) {
    scrollOpacity.value = 1 - opacity
  } else {
    scrollOpacity.value = 0
  }
}
function comMainScrollTop() {
  setTimeout(() => {
    scrollOpacity.value = 1
  }, 0)
}

function pxToRpx(value) {
  return (750 / winW.value) * value
}
</script>

<template>
  <view class="comFrame">
    <ljs-top-vue3
      title="意见反馈"
      :titleOpacity="1 - scrollOpacity"
      class="comTop"
      backgroundColor="linear-gradient(180deg, #BED6FB 45%, #F3F6FF 100%)"
      titleColor="#000"
      :topHeight="topHeight"
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
        'margin-top': `calc(-1 * (${topHeight - 80}rpx))`,
      }"
      @scroll="comMainScroll"
      @scrolltoupper="comMainScrollTop"
    >
      <view class="title1">意见反馈</view>
      <view class="title2">Hi, 请给出您的小建议~</view>
      <view class="box">
        <view class="questionType">
          <view class="text">
            <text>选择问题类型</text>
            <text class="red">*</text>
          </view>
          <view class="con type">
            <view
              class="item"
              :class="{ active: form.type === item.dictValue }"
              v-for="(item, i) in questionType"
              :key="i"
              @click="questionTypeChange(item)"
            >
              {{ item.dictLabel }}
            </view>
          </view>
        </view>
        <view class="questionType">
          <view class="text">
            <text>问题描述</text>
            <text class="red">*</text>
            <text class="length">({{ form.describe.length }}/500)</text>
          </view>
          <view class="con">
            <textarea
              class="textarea"
              v-model="form.describe"
              maxlength="500"
              placeholder="请您在此输入详细问题或意见"
              placeholder-class="comPlaceholder"
            ></textarea>
            <ljs-dragImages-vue3
              class="dragImages"
              v-model="form.imgs"
              :touchTarg="false"
              :colCount="5"
              :imgHeight="120"
              :imgMargin="16"
              :imgRadius="20"
              imgBorder="0"
              :addButtonImage="ossUrl('/weapp/pages-mine/icon_imageUpload.png')"
              :delButtonImage="ossUrl('/weapp/pages-mine/icon_close.png')"
              @uploadFile="upload"
            ></ljs-dragImages-vue3>
            <view class="tip">上传问题截图可以让问题快速解决哦！</view>
          </view>
        </view>
        <view class="contactInformation">
          <view class="text">联系方式</view>
          <input
            class="input"
            v-model="form.contactInformation"
            placeholder="手机号、 QQ、邮箱，以便我们回复您"
            placeholder-class="comPlaceholder"
            maxlength="50"
          />
        </view>
        <view class="help">
          <text>咨询或客诉请联系</text>
          <text class="blue">帮助中心</text>
        </view>
        <view @click="save" class="submit">确定提交</view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
@use './UserFeedback';
</style>
