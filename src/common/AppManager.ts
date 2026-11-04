/**
 * 小程序总管理器(单例实例)
 */
class AppManager {
  private static instance: AppManager

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  public static getInstance(): AppManager {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager()
    }
    return AppManager.instance
  }

  /**
   * 获取到小程序的基础信息
   */
  public getAppInfo(): UniNamespace.GetAppBaseInfoResult {
    return uni.getAppBaseInfo()
  }

  /**
   * 获取到小程序的id
   */
  public getAppId(): string {
    return import.meta.env.VITE_WX_APPID
  }
}

export default AppManager
