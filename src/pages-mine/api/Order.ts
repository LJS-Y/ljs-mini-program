import { http } from '@/utils/http'
import type { PageResult, PointsGoodsItem } from '@/api/pages-mine/Points'

/**
 * 订单（积分兑换记录）相关接口
 *
 * 泛型按调用方实际取用字段推断，未用到的字段用索引签名兜底。
 */

/** 订单项 */
export type OrderItem = {
  id?: string
  /** 关联的积分商城商品；存在时页面会给它补 coverImages_url */
  pointsMall?: PointsGoodsItem
  /** 兑换状态，用于按 tab 过滤 */
  exchangeStatus?: any
  [key: string]: any
}

/** 订单详情：比列表多 qrCode（页面据此生成 qrCode_url） */
export type OrderDetail = OrderItem & {
  /** 核销二维码文件 id */
  qrCode?: string
  [key: string]: any
}

// 列表（分页，调用方解构 data.rows / data.total）
export function orderList(query?: Record<string, any>) {
  return http.get<PageResult<OrderItem>>('/api/activities/and/points/wx/getProductExchangeRecordPage', query)
}

// 详情（调用方取 data.qrCode / data.pointsMall）
export function orderInfo(id: string | number) {
  return http.get<OrderDetail>('/api/activities/and/points/wx/getProductExchangeRecordByIdDetail?id=' + id)
}

// 确认收货
export function confirmReceipt(query?: Record<string, any>) {
  return http.post<{ success?: boolean; [key: string]: any }>(
    '/api/activities/and/points/wx/confirmTaskRewardReceive',
    query,
  )
}
