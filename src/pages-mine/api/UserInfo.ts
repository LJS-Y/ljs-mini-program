import { http } from '@/utils/http'

/**
 * 用户资料接口
 * 结构复杂，暂用宽松类型
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
