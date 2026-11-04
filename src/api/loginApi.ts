/**
 * 登录和手机号等通用API
 */
import { http } from '@/utils/http'
import type { ILoginResult, IWxLoginBean } from '@/types/hope-common-type'

// 微信登录
export function postWxLoginByCode(data: IWxLoginBean) {
  return http.post<ILoginResult>('/api/unauthorized/wx', data)
}
