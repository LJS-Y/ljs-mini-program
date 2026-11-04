import { http } from '@/utils/http'
import type { PageResult } from '@/api/pages-mine/Points'

/**
 * 自提点接口
 */

/** 自提点项（页面直接赋给列表展示，具体字段未在调用处取用，用索引签名兜底） */
export type SelfPickupPoint = Record<string, any>

// 自提点（调用方解构 { rows }）
export function SelfPickupLocation(mallId: string | number) {
  return http.get<PageResult<SelfPickupPoint>>('/api/activities/and/points/wx/getMallPointInventoryPage/' + mallId)
}
