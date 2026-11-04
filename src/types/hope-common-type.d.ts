import type { IDeviceInfo, ILoginAppInfo } from '@/typings'

export type IWxLoginBean = {
  appId: string
  code: string
  appInfo: ILoginAppInfo
  deviceInfo: IDeviceInfo
  channel: string
}

/**
 * 登录成功后获取信息
 */
export type ILoginResult = {
  token: string
  expireDatetime: string
  expireTimestamp: number
  success: boolean
  /**
   * 国密密钥对。后端在登录接口下发，前端写入本地存储供 smExecute 加解密使用。
   * 与 Web 端（ljs-vue3）保持同一套命名：KPAPu / KPBPr → ljs_a / ljs_b。
   * 开关关闭或不返回时该字段可能缺省，使用前须判空。
   */
  encryptKeys?: {
    /** 公钥 */
    KPAPu?: string
    /** 私钥 */
    KPBPr?: string
  }
}
