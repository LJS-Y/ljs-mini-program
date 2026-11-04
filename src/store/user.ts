import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IDeviceInfo, ILoginAppInfo, IUserInfo, LoginExpireModel, WxWeappBindMobileVo } from '@/typings'
import AppManager from '@/common/AppManager'
import { postBindUserPhoneNumber, controlSwitch } from '@/api/commonApi'
import { postWxLoginByCode } from '@/api/loginApi'
import type { IWxLoginBean } from '@/types/hope-common-type'
import { getCheckLogin, getCurrentUserInfo } from '@/api/userApi'
import { pointsGetNow, taskRun } from '@/api/pages-mine/Points'
import { LJSbase } from '@/uni_modules/ljs-sdk/js_sdk/index.js'
import { TASK_ID_OLD_USER_REGISTER, TASK_ID_SIGN_IN } from '@/common/BusinessIds'
// 默认登录角色
const DEFAULT_USER_ROLE = '溯源小程序用户'

/**
 * 初始态
 */
const initState: Record<string, any> = {
  token: undefined,
  systemUser: {
    account: undefined,
    id: undefined,
    role: undefined,
    channel: undefined,
    userName: undefined,
    phoneNumber: undefined,
  },
  wxUser: {
    id: undefined,
    appId: undefined,
    openId: undefined,
    unionId: undefined,
    nickName: undefined,
    userName: undefined,
    sex: undefined,
    avatarUrl: undefined,
    phoneNumber: undefined,
    userId: undefined,
  },
}

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<IUserInfo>({ ...initState })
    const loginExpireModel = ref<LoginExpireModel>(undefined)

    const isLogin = computed(() => !!userInfo.value.token)
    const hasMobile = computed(() => !!userInfo.value.systemUser.phoneNumber)
    const hasWxMobile = computed(() => !!userInfo.value.wxUser.phoneNumber)
    const openId = computed(() => !!userInfo.value.wxUser.openId)
    const userId = computed(() => !!userInfo.value.systemUser.id)
    const userName = computed(() => !!userInfo.value.systemUser.userName)
    const systemUser = computed(() => userInfo.value.systemUser)
    const wxUser = computed(() => userInfo.value.wxUser)
    // 全局的葡萄动画状态器
    const comWineState = ref({
      open: false,
      text: '加载中...',
    })

    // time: 在obj.open为true时有效
    const setComLoadingState = (obj: Object, time: number = 500) => {
      const temp = {
        open: false,
        text: '加载中...',
      }
      for (const key in obj) {
        temp[key] = obj[key]
      }
      if (temp.open) {
        comWineState.value = temp
      } else {
        setTimeout(() => {
          comWineState.value = temp
        }, time)
      }
    }

    // 更新用户信息
    const updateWxUser = (wxUser: object) => {
      for (const key in wxUser) {
        userInfo.value.wxUser[key] = wxUser[key]
      }
    }

    // dome模版背景颜色
    const domeBg = ref('transparent')
    const setDomeBg = (bg: string = 'transparent') => {
      domeBg.value = bg
    }

    // 用户默认地址
    const defaultAddress = ref(null)
    const setDefaultAddress = (address: object = null) => {
      defaultAddress.value = address
    }

    // 积分
    const nowPoints = ref(0)
    const updateNowPoints = async () => {
      const { code, data } = await pointsGetNow()
      if (code === 200 && !LJSbase.fieldCheck(data)) {
        nowPoints.value = data
      } else {
        nowPoints.value = 0
      }
    }

    /**
     * 任务数据: 跨页面任务，记录相关数据。
     *
     * hxData / runData 的 key 是动态拼接的（如 `hxDataOne_<taskConfigId>`），
     * 所以用 Record<string, any> 而非固定字段。
     */
    const taskData = ref<{
      hxData: Record<string, any>
      runData: Record<string, any>
    }>({
      hxData: {}, // 核销接口需要的临时数据
      runData: {}, // 正在运行的任务数据。记录次数，控制在使用时是否调用相应接口。
    })
    const setTaskData = ({ hxData = null, runData = null }) => {
      if (hxData !== null) {
        for (const key in hxData) {
          taskData.value.hxData[key] = {
            source: 'taskWriteoff_SHARE',
            ...hxData[key],
          }
        }
      }
      // 清空
      else {
        taskData.value.hxData = {}
      }
      if (runData !== null) {
        for (const key in runData) {
          taskData.value.runData[key] = runData[key]
        }
      }
      // 清空
      else {
        taskData.value.runData = {}
      }
    }
    // 清除某一个
    const removeTaskData = ({ hxDataKey = null, runDataKey = null }) => {
      if (hxDataKey !== null) {
        delete taskData.value.hxData[hxDataKey]
      }
      if (runDataKey !== null) {
        delete taskData.value.runData[runDataKey]
      }
    }

    /**
     * 开关
     */
    const isWineSM = ref(false) // 国密开关
    const updateControlSwitch = async () => {
      const data = await controlSwitch({ moduleName: '0,wine_sm' })
      if (!LJSbase.fieldCheck(data) && data.length > 0) {
        for (const item of data) {
          if (item.moduleName === 'wine_sm') {
            isWineSM.value = appMode() === 'release' || LJSbase.fieldCheck(item.appTrialMode) ? item.switchFlag : item.appTrialMode
          }
        }
      }
    }
    function appMode() {
      // 'develop' - 开发版, 'trial' - 体验版, 'release' - 正式版
      try {
        const accountInfo = uni.getAccountInfoSync()
        return accountInfo.miniProgram.envVersion
      } catch (error) {
        console.error('获取环境信息失败:', error)
        // 降级处理，假设为正式版
        return 'release'
      }
    }

    const setUserInfo = (val: IUserInfo) => {
      userInfo.value = val
    }

    const clearUserInfo = () => {
      userInfo.value = initState
    }
    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      userInfo.value = { ...initState }
    }

    /**
     * 判断token是否还在有效期
     */
    const checkTokenIsActive = async () => {
      // 判断token是否还能用
      // 走个啥接口(用户信息获取或者更轻巧的)
      try {
        const loginExpireReq = await getCheckLogin()
        loginExpireModel.value = loginExpireReq
        await updateControlSwitch()
        return true
      } catch (e) {
        return false
      }
    }

    /**
     * 登录和获取用户信息一把梭
     */
    const doLoginAndGetUserInfo = async (wxLoginCode: string) => {
      // 系统信息
      const systemInfo = uni.getSystemInfoSync()
      // app信息(特么的这里的appId不对,是uniapp的appId)
      const appInfo = AppManager.getInstance().getAppInfo()

      const loginAppInfo = {
        // 系统
        appName: appInfo.appName,
        // 小程序版本
        appVersion: appInfo.appVersion,
      } as ILoginAppInfo

      const loginDeviceInfo = {
        // 系统
        clientSystemOs: systemInfo.system,
        // 手机操作系统版本
        clientSystemOsVersion: systemInfo.system,
        // 小程序引擎版本
        clientAppVersion: systemInfo.version,
        // 手机型号
        clientAgent: systemInfo.model,
        // 屏宽
        clientScreenWidth: systemInfo.screenWidth,
        // 屏高
        clientScreenHeight: systemInfo.screenHeight,
      } as IDeviceInfo

      const loginPost = {
        appId: AppManager.getInstance().getAppId(),
        code: wxLoginCode,
        appInfo: loginAppInfo,
        deviceInfo: loginDeviceInfo,
        channel: DEFAULT_USER_ROLE,
        // role: '庄主小程序用户',
      } as IWxLoginBean

      try {
        const loginRsp = await postWxLoginByCode(loginPost)
        if (!loginRsp.success) {
          return false
        }

        userInfo.value.token = loginRsp.token
        const userInfoReq = await getCurrentUserInfo()
        userInfo.value.systemUser = userInfoReq.systemUser
        userInfo.value.wxUser = userInfoReq.wxUser
        // 秘钥
        if (
          !LJSbase.fieldCheck(loginRsp.encryptKeys) &&
          !LJSbase.fieldCheck(loginRsp.encryptKeys.KPAPu) &&
          !LJSbase.fieldCheck(loginRsp.encryptKeys.KPBPr)
        ) {
          uni.setStorageSync('ljs_a', loginRsp.encryptKeys.KPAPu)
          uni.setStorageSync('ljs_b', loginRsp.encryptKeys.KPBPr)
        }

        await updateControlSwitch()
        return true
      } catch (e) {
        console.error('登录错误:', e)
        // 清掉登录信息
        reset()
        return false
      }
    }

    /**
     * 绑定手机号更新用户信息一把梭
     */
    const doBindUserPhoneNumber = async (wxPhoneCode: string) => {
      setComLoadingState({
        open: true,
      })
      const post = {
        wxPhoneCode,
        wxAppid: AppManager.getInstance().getAppId(),
        wxOpenid: userInfo.value.wxUser.openId,
        // wxOpenid: openId,
        channel: DEFAULT_USER_ROLE,
        taskId: TASK_ID_OLD_USER_REGISTER, // 积分任务接口（老用户补注册任务）
      } as WxWeappBindMobileVo

      try {
        // 绑定手机号和获取用户信息一起
        const userInfoReq = await postBindUserPhoneNumber(post)
        userInfo.value.systemUser = userInfoReq.systemUser
        userInfo.value.wxUser = userInfoReq.wxUser
        userInfo.value.token = userInfoReq.token

        await updateNowPoints()
        // 邀请好友 - 受邀 - 任务存在，核销任务。
        const hxDataObj = taskData.value.hxData[`hxDataOne_${TASK_ID_SIGN_IN}`]
        if (!LJSbase.fieldCheck(hxDataObj)) {
          taskWriteoff(hxDataObj.taskConfigId, hxDataObj.invitationId)
        }
        setComLoadingState({
          open: false,
        })
        return true
      } catch (e) {
        console.error('手机号绑定错误:', e)
        setComLoadingState({
          open: false,
        })
        return false
      }
    }
    const taskWriteoff = async (taskConfigId, invitationId = null) => {
      const data = await taskRun({ taskConfigId, invitationId })
      if (data.success) {
        useUserStore().updateNowPoints()
      }
    }

    return {
      userInfo,
      loginExpireModel,
      isLogin,
      hasMobile,
      hasWxMobile,
      openId,
      userId,
      userName,
      systemUser,
      wxUser,
      isWineSM,
      comWineState,
      domeBg,
      defaultAddress,
      nowPoints,
      taskData,
      updateControlSwitch,
      setTaskData,
      removeTaskData,
      updateNowPoints,
      setDefaultAddress,
      setDomeBg,
      setComLoadingState,
      setUserInfo,
      clearUserInfo,
      reset,
      checkTokenIsActive,
      doLoginAndGetUserInfo,
      doBindUserPhoneNumber,
      updateWxUser,
    }
  },
  {
    persist: true,
  },
)
