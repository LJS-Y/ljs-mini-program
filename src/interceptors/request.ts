/* eslint-disable no-param-reassign */
import qs from 'qs'
import { useUserStore } from '@/store'
import { platform } from '@/utils/platform'
import { MAIN_API_PATH } from '@/common/AppDefine'
import type { IUserInfo } from '@/typings'

/**
 * 请求配置
 *
 * 注：原为 `& IUniUploadFileOptions`（unibest 自定义类型，本项目从未定义）。
 * 语义是「补上 uni.uploadFile 的参数」，uni-app 官方对应类型是
 * UniNamespace.UploadFileOption，此处改用官方类型，消除未定义标识符。
 */
export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
} & Partial<UniNamespace.UploadFileOption>

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      // console.log(__VITE_APP_PROXY__)
      // if (JSON.parse(__VITE_APP_PROXY__)) {
      //   // 啥都不需要做
      // } else {
      //   options.url = baseUrl + options.url
      // }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = MAIN_API_PATH + options.url
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = options?.timeout ?? 10000 // 10s

    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    // 3. 添加 token 请求头标识
    const userStore = useUserStore()
    const { token } = userStore.userInfo as unknown as IUserInfo
    if (token) {
      options.header.Authorization = `${token}`
    }
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
