import { http } from '@/utils/http'
import type { ReceivingAddressInfo } from '@/api/pages-mine/Points'

/**
 * 收货地址接口
 *
 * 泛型按调用方实际取用字段推断。
 */

// 列表（调用方直接赋给列表，是数组）
export function receivingAddressList(query?: Record<string, any>) {
  return http.get<ReceivingAddressInfo[]>('/api/activities/and/points/wx/getAllReceivingAddresss', query)
}

// 新增/修改
export function receivingAddressAdd(query?: Record<string, any>) {
  return http.post<{ success?: boolean; [key: string]: any }>(
    '/api/activities/and/points/wx/saveOrUpdateReceivingAddress',
    query,
  )
}

// 删除
export function receivingAddressDel(id: string | number) {
  return http.del<{ success?: boolean; [key: string]: any }>(
    '/api/activities/and/points/wx/deleteReceivingAddressById/' + id,
  )
}

// 详情（调用方整体赋给 form.data）
export function receivingAddressInfo(id: string | number) {
  return http.get<ReceivingAddressInfo>('/api/activities/and/points/wx/getReceivingAddressById/' + id)
}
