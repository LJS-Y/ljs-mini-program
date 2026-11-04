import { http } from '@/utils/http'

// 用户反馈 - 新增
export function feedbackAdd(query?: Record<string, any>) {
  return http.post<{ success?: boolean; [key: string]: any }>('/api/exhibition/wx/feedback/save', query)
}
