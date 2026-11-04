import { useUserStore } from '@/store'
import { timeControl } from '@/utils/base'
import HopePhoneCheckDialog from '@/components/common/HopePhoneCheckDialog.vue'

/**
 * 用户的总管理器(单例实例)
 */
class UserManager {
  private static instance: UserManager

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  /**
   * 绑定手机号的对话框
   */
  public bindPhoneDialog = ref<InstanceType<typeof HopePhoneCheckDialog> | null>(null)

  /**
   * 执行登录中(防止重复登录)
   * @private
   */
  private isLoginIng = false

  /**
   * 小程序登录
   * @private
   *
   */
  public async weappLogin(retryCount: number = 3) {
    useUserStore().setComLoadingState({
      open: true,
    })
    if (this.isLoginIng && retryCount >= 3) {
      // 防止同时调用(保证永远只有一处正在调,类似一个线程锁)
      return false
    }

    // 重试登录次数减1
    const nextRetryCount = retryCount - 1

    // 登录超出失败次数,彻底登录失败
    if (nextRetryCount < 0) {
      // useUserStore().setNotLogin();
      this.isLoginIng = false
      return false
    }
    this.isLoginIng = true

    // 获取微信code
    const wxLoginReq = await uni.login()
    const wxLoginCode = wxLoginReq.code

    if (!wxLoginCode) {
      return this.weappLogin(nextRetryCount)
    }

    // 登录和获取用户信息一把梭
    // 指定小程序id和角色登录

    const loginIsSuccess = await useUserStore().doLoginAndGetUserInfo(wxLoginCode)

    // TODO 这里doLogin等接口,你们商户的角色也好appid也好和我用户的不太一样

    // 登录失败,递归登录
    if (!loginIsSuccess) {
      return this.weappLogin(nextRetryCount)
    }

    useUserStore().setComLoadingState({
      open: false,
    })
    // 登录成功,缓存用户信息也顺便缓存了

    // 关闭登录中状态
    this.isLoginIng = false
    return true
  }

  /**
   * 检查是否登录
   */
  public checkLogin() {
    return useUserStore().isLogin
  }

  /**
   * 检查是否需要登录后执行的动作
   */
  public async checkLoginFunc(func: Function = () => {}) {
    // token是否存在
    if (this.checkLogin()) {
      // 检查token是否有效
      const isSuccess = await useUserStore().checkTokenIsActive()
      // const isSuccess = false // 模拟token失效

      // const isSuccess = false
      if (!isSuccess) {
        // token失效重新登录
        const isLoginSuccess = await this.weappLogin()
        if (!isLoginSuccess) {
          // 还是登录失败
          return false
        }
      }
      func()
      return true
    }
    const isLoginSuccess = await this.weappLogin()
    // const isLoginSuccess = false
    if (!isLoginSuccess) {
      // 还是登录失败
      return false
    }
    func()
    return true
  }

  /**
   * 绑定用户手机号
   * @param phoneCode
   */
  public async bindUserMobile(phoneCode: string) {
    if (useUserStore().hasWxMobile) {
      // 已绑定 无需绑定
      return true
    }

    const isBindSuccess = await useUserStore().doBindUserPhoneNumber(phoneCode)

    if (isBindSuccess) {
      useUserStore().setComLoadingState({
        open: true,
        text: '手机号绑定成功',
      })
      await timeControl(2000)
      useUserStore().setComLoadingState({
        open: false,
      })
      return true
    } else {
      useUserStore().setComLoadingState({
        open: true,
        text: '手机号绑定失败',
      })
      await timeControl(2000)
      useUserStore().setComLoadingState({
        open: false,
      })
      return false
    }
  }

  /**
   * 检查绑定手机号
   */
  public async checkBindMobileFunc(func: any) {
    if (useUserStore().hasWxMobile) {
      func()
      return true
    }

    // 弹出绑定手机号的dialog,这个dialog执行完成后进入对应方法

    await this.bindPhoneDialog.value.checkBindPhoneDoFunc(func)
  }

  /**
   * 获取手机号
   */
  public getPhoneNumber() {
    if (useUserStore().hasWxMobile) {
      return useUserStore().userInfo.systemUser.phoneNumber
    }
    return ''
  }
}

export default UserManager
