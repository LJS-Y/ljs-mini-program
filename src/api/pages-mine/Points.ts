import { http } from '@/utils/http'

/**
 * 积分 / 签到 / 积分商城接口
 * 默认解包返回 data 本身
 */

// ===== 类型 =====

/** 签到记录（日历用）：后端返回的是日期字符串数组，如 ['2025-06-09', ...] */
export type SignInDateStr = string

/** 连续签到规则项 */
export type SignInRuleItem = {
  /** 规则类型，3 表示不展示 */
  ruleType?: number
  [key: string]: any
}

/** 任务配置项 */
export type TaskConfigItem = {
  id?: string
  /** 任务类型，1 为一次性任务 */
  taskType?: number
  /** 是否已完成 */
  completed?: boolean
  /** 奖励积分 */
  points?: number
  [key: string]: any
}

/** 积分记录项 */
export type PointsRecordItem = {
  /** add=加积分，ins=扣积分 */
  addOrIns?: string
  /** 变动积分 */
  points?: number
  [key: string]: any
}

/** 积分商城商品项 */
export type PointsGoodsItem = {
  id?: string
  /** 封面图文件 id（后端返回单个 id 字符串，页面经 idForFile 转成 coverImages_url） */
  coverImages?: string
  [key: string]: any
}

/** 收货地址（后端返回值，字段可能为空，故全部可选） */
export type ReceivingAddressInfo = {
  id?: string | number
  name?: string
  mobile?: string
  area?: any[]
  address?: string
  isDefault?: boolean
  [key: string]: any
}

/** 分页返回（拦截器 code=2xx 且 data 为空、rows+total 有值时返回的形态） */
export type PageResult<T> = {
  rows: T[]
  total: number
}

/** 通用操作结果 */
export type OperationResult = {
  success?: boolean
  code?: number
  msg?: string
  [key: string]: any
}

// ===== 接口 =====

// 签到 - 当前积分
// 注：第 4 参 completeResTag=true，拦截器不解包，返回完整 { code, msg, data }，
// 调用方需自行判断 code。故泛型写业务数据类型，外层仍由 IResData 包裹。
export function pointsGetNow(query?: Record<string, any>) {
  return http.get<number>('/api/activities/and/points/wx/getUserPoints', query, false, true)
}

// 签到
export function pointsSignIn(query?: Record<string, any>) {
  return http.post<OperationResult>('/api/activities/and/points/wx/dailyCheckin', query)
}

// 签到 - 日历
// 后端返回该月已签到日期字符串数组，调用方用 indexOf(日期字符串) 判断是否已签到。
export function calendarSignIn(query?: Record<string, any>) {
  return http.get<SignInDateStr[]>('/api/activities/and/points/wx/getUserCheckinDatesByMonth', query)
}

// 签到 - 提醒 - 改
export function setSignInRemind(query?: Record<string, any>) {
  return http.get<OperationResult>('/api/activities/and/points/wx/getSignInRemind', query)
}

// 签到 - 提醒 - 查
// 注：第 4 参 completeResTag=true，返回完整 IResData，调用方用 { code, data } 解构。
export function getSignInRemind(query?: Record<string, any>) {
  return http.get<number>('/api/activities/and/points/wx/getSignInRemindStatus', query, false, true, 6000, true)
}

// 签到 - 连续签到天数（调用方直接赋给 signInDays，是数字）
export function totalSignIn(query?: Record<string, any>) {
  return http.get<number>('/api/activities/and/points/wx/calculateContinuityDays', query)
}

// 签到 - 连续签到规则（调用方 data.forEach，是数组）
export function signInRule(query?: Record<string, any>) {
  return http.get<SignInRuleItem[]>('/api/activities/and/points/wx/getEnabledRules', query)
}

// 签到 - 获得的积分记录（分页）
export function pointsRecord(query?: Record<string, any>) {
  return http.get<PageResult<PointsRecordItem>>('/api/activities/and/points/wx/getUserPointsRecordPage', query)
}

// 签到 - 任务列表（调用方 data.forEach，是数组）
export function taskList(query?: Record<string, any>) {
  return http.get<TaskConfigItem[]>('/api/activities/and/points/wx/getAllTaskConfigs', query)
}

// 任务核销码
export function taskCode(query?: Record<string, any>) {
  return http.get<{ invitationId?: string; qrCode?: string; [key: string]: any }>(
    '/api/activities/and/points/wx/generateShareInvitation',
    query,
  )
}

// 任务核销
// 注：拦截器 parseRestfulData 在 code 为 2xx 时已解包，此处拿到的是 data 本身，
// 故泛型写业务数据结构而非 IResData<T>。
export function taskRun(query: Record<string, any>) {
  return http.post<{ success: boolean }>('/api/activities/and/points/wx/doTask', query)
}

// 地址 - 获取默认地址
// 注：第 4 参 completeResTag=true，返回完整 IResData，调用方用 { code, data } 解构。
export function dfAddress(query?: Record<string, any>) {
  return http.get<ReceivingAddressInfo>('/api/activities/and/points/wx/getDefaultReceivingAddress', query, false, true)
}

// 积分商城 - 商品（分页，调用方解构 { rows, total }）
export function pointGoods(query?: Record<string, any>) {
  return http.get<PageResult<PointsGoodsItem>>('/api/activities/and/points/wx/pointsMallPage', query)
}

// 积分商城 - 商品详情
export function pointGoodsInfo(id: string | number) {
  return http.get<PointsGoodsItem>('/api/activities/and/points/wx/getExhibitionCouponById?id=' + id)
}

// 积分商城 - 立即兑换
export function exchange(query?: Record<string, any>) {
  return http.post<OperationResult>('/api/activities/and/points/wx/exchangeProduct', query)
}

// 任务奖励 - 确认
export function taskSubmit(query?: Record<string, any>) {
  return http.post<OperationResult>('/api/activities/and/points/wx/confirmTaskRewardExchange', query)
}
