/**
 * 登录和手机号等通用API
 */
import { http } from '@/utils/http'
import type { IUserInfo, WxWeappBindMobileVo } from '@/typings'

// 绑定用户手机号
export function postBindUserPhoneNumber(data: WxWeappBindMobileVo) {
  return http.post<IUserInfo>('/api/wx/weapp/bind/mobile', data)
}

/** 字典项（/system/dict/data/type/{code} 返回） */
export type DictItem = {
  dictLabel?: string
  dictValue?: string
  dictType?: string
  [key: string]: any
}

/** 规则说明（含富文本 content） */
export type RuleInfo = {
  /** 规则正文，HTML 字符串 */
  content: string
  [key: string]: any
}

// 获取字典（返回数组，调用方直接赋给列表）
export function getDict(dictTypeCode: string) {
  return http.get<DictItem[]>('/system/dict/data/type/' + dictTypeCode)
}

// 控制开关 - info
// tagFalse 透传到 httpGet 的 completeResTag：
//   不传 / false → 拦截器解包，返回开关数组本身
//   true         → 返回完整 IResData，调用方自行判断 code
// 下方按 tagFalse 分支做类型断言，保证调用方拿到的是「解包后的数组」。
export function controlSwitch<T = ModuleSwitchItem[]>(
  query?: Record<string, any>,
  tagFalse?: boolean,
) {
  const res = http.get<T>('/api/module/switch/getModuleSwitch', query, false, tagFalse as false)
  return res
}

/** 模块开关项（/api/module/switch/getModuleSwitch 返回元素） */
export type ModuleSwitchItem = {
  moduleName: string
  /** 开关状态 */
  switchFlag: boolean
  /** 试用模式，release 环境外生效 */
  appTrialMode?: boolean | null
}

// 控制开关 - 控制
export function controlSwitchImp(query?: Record<string, any>) {
  return http.get<{ success?: boolean; [key: string]: any }>('/api/exhibition/wx/moduleSwitch/save', query)
}

// 规则说明（调用方 data.content 做正则替换后展示）
export function ruleInstructions(query?: Record<string, any>) {
  return http.get<RuleInfo>('/api/activities/and/points/wx/getRulesInfo', query)
}

// 文件上传
export function fileUpload(filePath: string) {
  return http.upload(filePath)
}
