import { http } from '@/utils/http'

/**
 * 用户资料接口
 *
 * 注：wxUserInfo 的返回结构较复杂（含头像/昵称/标签等多组字段），
 * 且调用方把它和多个 getDict 结果混在 PromiseAll 里按索引分发，
 * 无法从单点反推精确结构，故用 Record<string, any> 兜底（方案 A2）。
 * 若后续需要精确类型，可按后端返回补齐字段后替换。
 */

/** 用户资料（结构待补充，当前为宽松类型） */
export type WxUserProfile = Record<string, any>

// 查询
export function wxUserInfo() {
  return http.get<WxUserProfile>('/api/user/profile/wx/get')
}

// 修改
export function wxUserEdit(query?: Record<string, any>) {
  return http.post<{ success?: boolean; [key: string]: any }>('/api/user/profile/wx/update', query)
}
