<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'UserInfo',
  },
}
</route>
<script setup lang="ts">
import { useUserStore } from '@/store'
import { getDict, fileUpload } from '@/api/commonApi'
import { wxUserInfo, wxUserEdit } from '@/pages-mine/api/UserInfo'
import { PromiseAll, idForFile, ossUrl } from '@/utils/base'
defineOptions({
  name: 'UserInfo',
})
const { proxy } = getCurrentInstance()
const form = ref({
  nickName: null, // 昵称
  avatarList: [], // 头像
  realName: null, // 真实姓名
  sex: '2', // 性别
  identityTag: null, // 我的身份
  birthdayNull: '2000-01-01', // 生日
  birthday: null, // 生日
  regionTag: [], // 城市
  tasteProfile: [], // 味觉档案
})
onLoad((o) => {
  initData()
})
onReady(() => {
  winW.value = uni.getWindowInfo().screenWidth
  topStateHeight.value = uni.getWindowInfo().statusBarHeight
})
const sys_user_sex = ref([])
const exhibition_user_identity_tag = ref([])
const user_tag_taste_archive = ref([])

async function initData() {
  try {
    const apiList = [getDict('sys_user_sex'), getDict('exhibition_user_identity_tag'), wxUserInfo(), getDict('user_tag_taste_archive')]
    const results = await PromiseAll(apiList)

    results.forEach((res, i) => {
      if (i === 0) {
        if (!proxy.$LJSbase.fieldCheck(res)) {
          sys_user_sex.value = res
        }
      } else if (i === 1) {
        if (!proxy.$LJSbase.fieldCheck(res)) {
          exhibition_user_identity_tag.value = res
        }
      } else if (i === 2) {
        if (!proxy.$LJSbase.fieldCheck(res)) {
          for (const key in res) {
            if (key === 'avatar') {
              form.value.avatarList.push({
                url: idForFile(res.avatar),
              })
            } else if (key === 'birthday') {
              form.value.birthdayNull = !proxy.$LJSbase.fieldCheck(res.birthday) ? res.birthday : '2000-01-01'
              form.value.birthday = !proxy.$LJSbase.fieldCheck(res.birthday) ? res.birthday : null
            } else if (key === 'regionTag') {
              form.value.regionTag = !proxy.$LJSbase.fieldCheck(res.regionTag) ? res.regionTag.split(',') : []
            } else if (key === 'tasteProfile') {
              form.value.tasteProfile = !proxy.$LJSbase.fieldCheck(res.tasteProfile) ? res.tasteProfile.split(',') : []
            } else {
              form.value[key] = res[key]
            }
          }
        }
      } else if (i === 3) {
        if (!proxy.$LJSbase.fieldCheck(res)) {
          user_tag_taste_archive.value = res
        }
      }
    })
  } catch (e) {
    console.error(e)
  }
}

function tasteProfileChange(item) {
  const index = form.value.tasteProfile.indexOf(item.dictValue)
  if (index > -1) {
    form.value.tasteProfile.splice(index, 1)
  } else {
    form.value.tasteProfile.push(item.dictValue)
  }
}
function identityTagChange(item) {
  form.value.identityTag = item.dictValue
}
function sexChange(item) {
  form.value.sex = item.dictValue
}
function birthdayChange(e) {
  form.value.birthday = e.detail.value
  form.value.birthdayNull = e.detail.value
}
function regionTagChange(e) {
  form.value.regionTag = e.detail.value
}

// 上传
async function upload(files) {
  // console.log(files)
  form.value.avatarList = files
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
  if (proxy.$LJSbase.fieldCheck(query.nickName)) {
    proxy.$LJSmsg.msg('请输入昵称')
    return
  }

  useUserStore().setComLoadingState({
    open: true,
  })
  const imageUrls = []

  for (const file of form.value.avatarList) {
    // getUrlAllParameter 返回 [路径, 参数对象]，url 为空时返回 null。
    // JS 实现无类型标注，TS 推不出元组结构，这里按实际返回断言。
    // 注：本段是业务逻辑（用 URL 里是否带 Authorization 参数区分「已上传」与「待上传」），
    // 具体字段含义以后端实际返回为准。
    const allParameter = proxy.$LJSurl.getUrlAllParameter(file.url) as unknown as
      | [string, Record<string, any>]
      | null

    if (proxy.$LJSbase.fieldCheck(allParameter?.[1]?.Authorization)) {
      const res = await fileUpload(file.url)
      if (res.code === 200) {
        imageUrls.push(res.data.id)
      }
    } else {
      const urls = allParameter[0].split('/')
      const id = urls[urls.length - 1]
      imageUrls.push(id)
    }
  }
  query.avatar = imageUrls.toString()
  delete query.avatarList
  query.regionTag = query.regionTag.toString()

  query.tasteProfile = query.tasteProfile.toString()

  wxUserEdit(query).then((data) => {
    let msg = ''
    if (!proxy.$LJSbase.fieldCheck(data)) {
      useUserStore().updateWxUser({
        avatarUrl: query.avatar,
        nickName: query.nickName,
      })
      msg = '修改成功'
    } else {
      msg = '修改失败'
    }
    useUserStore().setComLoadingState({
      open: false,
    })
    proxy.$LJSrun.gp_navigateBack(
      1,
      {
        code: 200,
        data: 'updateWxUser',
        msg,
      },
      'ljsGpBackF',
    )
  })
}

const winW = ref(0)
const topHeight = ref(360)
const topStateHeight = ref(0)
</script>

<template>
  <view class="comFrame">
    <ljs-top-vue3
      title="个人信息"
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
    >
      <view class="box">
        <view class="questionType row">
          <view class="text">
            <text>昵称</text>
            <text class="red">*</text>
          </view>
          <view class="con">
            <input v-model="form.nickName" class="input" placeholder="请输入昵称" placeholder-class="comPlaceholder" maxlength="20" />
          </view>
        </view>
        <view class="questionType row">
          <view class="text">
            <text>头像</text>
          </view>
          <view class="con">
            <ljs-dragImages-vue3
              class="dragImages"
              v-model="form.avatarList"
              :touchTarg="false"
              :count="1"
              :colCount="4"
              :imgHeight="120"
              :imgMargin="16"
              :imgRadius="20"
              imgBorder="0"
              :addButtonImage="ossUrl('/weapp/pages-mine/icon_imageUpload.png')"
              :delButtonImage="ossUrl('/weapp/pages-mine/icon_close.png')"
              @uploadFile="upload"
            ></ljs-dragImages-vue3>
          </view>
        </view>
        <view class="questionType row">
          <view class="text">
            <text>真实姓名</text>
          </view>
          <view class="con">
            <input v-model="form.realName" class="input" placeholder="请输入昵称" placeholder-class="comPlaceholder" maxlength="20" />
          </view>
        </view>
        <view class="questionType row">
          <view class="text">
            <text>性别</text>
          </view>
          <view class="con type">
            <view
              class="item"
              :class="{ active: form.sex === item.dictValue }"
              v-for="(item, i) in sys_user_sex"
              :key="i"
              @click="sexChange(item)"
            >
              {{ item.dictLabel }}
            </view>
          </view>
        </view>
        <view class="questionType">
          <view class="text">
            <text>我的身份</text>
          </view>
          <view class="con type">
            <view
              class="item"
              :class="{ active: form.identityTag === item.dictValue }"
              v-for="(item, i) in exhibition_user_identity_tag"
              :key="i"
              @click="identityTagChange(item)"
            >
              {{ item.dictLabel }}
            </view>
          </view>
        </view>
        <view class="questionType row">
          <view class="text">
            <text>生日</text>
          </view>
          <view class="con">
            <picker class="picker" mode="date" :value="form.birthdayNull" :end="Date.now()" @change="birthdayChange">
              <view class="t" v-if="!$LJSbase.fieldCheck(form.birthday)">{{ form.birthday }}</view>
              <view class="comPlaceholder" v-else>请选择</view>
            </picker>
          </view>
        </view>
        <view class="questionType row">
          <view class="text">
            <text>城市</text>
          </view>
          <view class="con">
            <picker class="picker" mode="region" :value="form.regionTag" @change="regionTagChange">
              <view class="t" v-if="!$LJSbase.fieldCheck(form.regionTag) && form.regionTag.length > 0">
                {{ form.regionTag.toString() }}
              </view>
              <view class="comPlaceholder" v-else>请选择</view>
            </picker>
          </view>
        </view>
        <view class="questionType">
          <view class="text">
            <text>味觉档案</text>
          </view>
          <view class="con type">
            <view
              class="item"
              :class="{ active: form.tasteProfile.indexOf(item.dictValue) > -1 }"
              v-for="(item, i) in user_tag_taste_archive"
              :key="i"
              @click="tasteProfileChange(item)"
            >
              {{ item.dictLabel }}
            </view>
          </view>
        </view>
        <view @click="save" class="submit">确定提交</view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
@use './UserInfo';
</style>
