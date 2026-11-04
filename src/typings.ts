// 全局要用的类型放到这里

export type IResData<T> = {
  code: number
  msg: string
  data: T
  rows: Array<T>
  /** 列表接口的总条数；parseRestfulData 会据此判断是否走分页返回 */
  total?: number
}

/**
 * 使用了mongoPlus的分页请求
 */
type IPageMongoPlusRequest = {
  pageNum?: number
  pageSize?: number
  str?: string
}

/**
 * 使用了mongoPlus的分页相应
 */
type IPageMongoPlusPageResponse<T> = {
  timestamp: string
  message: string
  code: number
  data: {
    pageNum: number
    pageSize: number
    totalSize: number
    totalPages: number
    contentData?: Array<T>
  }
}

// uni.uploadFile文件上传参数
type IUniUploadFileOptions = {
  file?: File
  files?: UniApp.UploadFileOptionFiles[]
  filePath?: string
  name?: string
  formData?: any
}

export type IUserInfo = {
  token?: string
  systemUser?: SysUserInfo
  wxUser?: WxUserInfo
}

export type SysUserInfo = {
  account: string
  id: string
  role: string
  userName: string
  phoneNumber?: string
}
export type WxUserInfo = {
  id: string

  /**
   * appId
   */
  appId: string

  /**
   * openId
   */
  openId: string

  /**
   * unionId
   */
  unionId: string

  /**
   * 昵称
   */
  nickName: string

  /**
   * 用户名
   */
  userName: string

  /**
   * 性别
   */
  sex: string

  /**
   * 头像
   */
  avatarUrl: string

  /**
   * 手机号
   */
  phoneNumber: string

  /**
   * system_user_id
   */
  userId: string
}

/**
 * 登录溯源APP信息
 */
export type ILoginAppInfo = {
  // 系统
  appName: string
  // 小程序版本
  appVersion: string
}

/**
 * 登录终端信息
 */
export type IDeviceInfo = {
  // 系统
  clientSystemOs: string
  // 手机操作系统版本
  clientSystemOsVersion: string
  // 小程序引擎版本
  clientAppVersion: string
  // 手机型号
  clientAgent: string
  // 屏宽
  clientScreenWidth: number
  // 屏高
  clientScreenHeight: number
}

/**
 * 绑定微信手机号
 */
export type WxWeappBindMobileVo = {
  /**
   * 微信appId
   */
  wxAppid: string

  /**
   * 微信openid
   */
  wxOpenid: string

  /**
   * 微信授权的手机号code
   */
  wxPhoneCode: string

  /**
   * 微信角色
   */
  channel: string
}

/**
 *
 * 在 TypeScript 中，使用 Function 作为类型是不推荐的。
 * 原因是 Function 类型接受任何类函数值，这会导致在调用函数时没有类型安全性，从而成为常见的错误来源。
 * 它还接受类声明等内容，而这些内容在运行时会抛出错误，因为它们不会使用 new 调用。
 */
export type CallbackFunction = () => void

/**
 * model基类
 */
export interface BaseMongoEntity {
  /**
   * 主键
   */
  id?: string

  /**
   * 数据状态
   */
  state?: string

  /**
   * 创建时间
   */
  createDate?: string

  /**
   * 修改时间
   */
  updateDate?: string

  /**
   * 创建人
   */
  createUser?: string

  /**
   * 修改人
   */
  updateUser?: string
}

/**
 * 过期时间
 */
export type LoginExpireModel = {
  // 过期时间
  expireDatetime: string
  // 过期时间戳
  expireTimestamp: number
  // 过期剩余秒
  expireTimeOutSec: number
}
