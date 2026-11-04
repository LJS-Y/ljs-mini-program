/**
 * 用户信息相关api
 */
import { http } from '@/utils/http'
import type { IUserInfo, LoginExpireModel } from '@/typings'

// 获取用户信息
export function getCurrentUserInfo() {
  return http.get<IUserInfo>('/api/user/current')
}

// 检查是否登录过期
export function getCheckLogin() {
  return http.get<LoginExpireModel>('/api/unauthorized/login/check')
}
