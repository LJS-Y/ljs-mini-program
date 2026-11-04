import { CustomRequestOptions } from '@/interceptors/request'
import type { IResData } from '@/typings'
import { useUserStore } from '@/store'
import { MAIN_API_PATH } from '@/common/AppDefine'
import { LJSbase, LJSrun, LJSmsg } from '@/uni_modules/ljs-sdk/js_sdk/index.js'
import { requestEncrypt, responeDecrypt } from './smExecute'

/** 跳过登录模式 */
const isSkipLoginMode = () => import.meta.env.VITE_APP_SKIP_LOGIN === 'true'

export const http = <T>(
  options: CustomRequestOptions,
  getFileTag: boolean = false,
  completeResTag: boolean = false,
  timeoutHandleTag: boolean = false,
) => {
  // 1. 返回 Promise 对象
  return new Promise<T>((resolve, reject) => {
    requestEncrypt(options)
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: !getFileTag ? 'json' : 'arraybuffer',
      // #endif
      // 响应成功
      success(res) {
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (getFileTag) {
            // 下载/上传场景返回原始响应体（string | AnyObject | ArrayBuffer），
            // 与 T 无法静态对齐，此处按约定断言，调用方自行声明期望类型。
            resolve(res.data as unknown as T)
          } else {
            responeDecrypt(res, options)
            // 2.1 提取核心数据 res.data
            parseRestfulData(options, resolve, reject, res.data as IResData<T>, completeResTag)
            // resolve(res.data as IResData<T>)
          }
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          // 跳过登录：静默放行
          if (isSkipLoginMode()) {
            resolve({} as T)
            return
          }
          !options.hideErrorToast &&
            uni.showToast({
              icon: 'none',
              title: (res.data as IResData<T>).msg || '系统异常，请稍后重试',
            })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        if (!timeoutHandleTag) {
          // {errMsg: "request:fail timeout", errno: undefined}
          // 跳过登录：不弹网络错误
          if (!isSkipLoginMode()) {
            uni.showToast({
              icon: 'none',
              title: '网络错误，换个网络试试',
            })
          }
        }
        useUserStore().setComLoadingState({
          open: false,
        })
        if (isSkipLoginMode()) {
          resolve({} as T)
          return
        }
        reject(err)
      },
    })
  })
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @param getFileTag 是否为文件，默认false
 * @param completeResTag false 正常流程 true 不处理数据直接返回，由业务自行处理
 * @param timeout 超时时间
 * @param timeoutHandleTag false 正常流程 true 不处理fail数据直接返回，由业务自行处理
 * @returns
 * 
 * timeoutHandleTag 示例： 
  return http.get('/api/exhibition/wx/getExhibitionBannerManagerList', query, false, false, 10, true)
  
  try {
    const data = await middBanner({
      type: 'index',
    })
    if (!proxy.$LJSbase.fieldCheck(data)) {
      data.forEach((item) => {
        item.bannerImg_url = idForFile(item.bannerImg)
      })
      middBannerData.value = data
    }
  } catch (e) {
    proxy.$LJSmsg.msg('活动有点火爆，请稍后再试', 3000)
  }
 */
/**
 * GET 请求
 *
 * completeResTag 会改变返回值形态（见 parseRestfulData）：
 *   false（默认）→ 拦截器解包，返回 T（业务数据本身）
 *   true        → 不解包，返回完整 IResData<T>（{ code, msg, data, rows }）
 * 下方用重载表达这个差异，避免调用方拿 T 当完整响应去取 code。
 */
export function httpGet<T>(
  url: string,
  query: Record<string, any> | undefined,
  getFileTag: boolean | undefined,
  completeResTag: true,
  timeout?: number,
  timeoutHandleTag?: boolean,
): Promise<IResData<T>>
export function httpGet<T>(
  url: string,
  query?: Record<string, any>,
  getFileTag?: boolean,
  completeResTag?: false,
  timeout?: number,
  timeoutHandleTag?: boolean,
): Promise<T>
export function httpGet<T>(
  url: string,
  query?: Record<string, any>,
  getFileTag: boolean = false,
  completeResTag: boolean = false,
  timeout?: number,
  timeoutHandleTag: boolean = false,
) {
  return http<T>(
    {
      url,
      query,
      method: 'GET',
      timeout,
    },
    getFileTag,
    completeResTag,
    timeoutHandleTag,
  )
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求参数
 * @param query 未使用
 * @param timeout 超时时间
 * @param timeoutHandleTag false 正常流程 true 不处理fail数据直接返回，由业务自行处理
 * @returns
 */
export const httpPost = <T>(
  url: string,
  data?: Record<string, any>,
  query?: Record<string, any>,
  timeout?: number,
  timeoutHandleTag: boolean = false,
) => {
  // 注：timeoutHandleTag 是 http() 的第 4 个参数，不属于请求配置（CustomRequestOptions）。
  // 原实现误放进 options 对象，类型上不报错是因为当时 options 被断言，实际未生效。
  return http<T>(
    {
      url,
      query,
      data,
      method: 'POST',
      timeout,
    },
    false,
    false,
    timeoutHandleTag,
  )
}

/**
 * DELETE 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数
 * @returns
 */
export const httpDelete = <T>(url: string, data?: Record<string, any>, query?: Record<string, any>) => {
  return http<T>({
    url,
    query,
    data,
    // 注：原为 'Delete'，uni.request 只认全大写 'DELETE'，
    // 小写会导致方法不被识别（服务端按 GET 处理）。已修正。
    method: 'DELETE',
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数，post请求也支持query，很多微信接口都需要
 * @returns
 */
/**
 * 文件上传
 *
 * 注意与 http() 的差异：这里**不经过** parseRestfulData 解包，
 * 直接把后端返回的 JSON 原样交给调用方，所以拿到的仍是完整 { code, msg, data }，
 * 调用方需自行判断 code。下面用 IResData 表达这个形态。
 */
export const httpUpload = (
  filePath: string,
  url: string = '/api/file/upload',
  name: string = 'file',
  timeout: number = 60000,
) => {
  const userStore = useUserStore()
  const token = computed(() => userStore.userInfo?.token || '')

  return new Promise<IResData<{ id: string; url?: string; [key: string]: any }>>((resolve, reject) => {
    uni.uploadFile({
      url: `${MAIN_API_PATH}${url}`,
      filePath,
      name,
      timeout,
      header: {
        Authorization: token.value,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(res.data))
        } else {
          // 跳过登录：不弹提示
          if (!isSkipLoginMode()) {
            uni.showToast({
              icon: 'none',
              title: '上传失败',
            })
          }
          // 失败时返回的不是标准结构，用 as 收敛到同一类型，由调用方按 code 判断
          resolve(res as unknown as IResData<{ id: string; url?: string; [key: string]: any }>)
        }
      },
      fail: (error) => {
        if (isSkipLoginMode()) {
          resolve({} as IResData<{ id: string; url?: string; [key: string]: any }>)
          return
        }
        reject(error)
      },
    })
  })
}

http.get = httpGet
http.post = httpPost
http.del = httpDelete
http.upload = httpUpload
// 兼容别名（2026-11-02）：
// 原封装只挂了 del，缺 delete / put，按常规习惯写 http.delete() / http.put() 会报「不是函数」。
// 这里补别名以降低误用成本：
//   http.delete → 与 http.del 同一实现（保留 del 不破坏既有调用）
//   http.put    → 复用 httpPost（本项目底层 uni.request 未区分 put 语义，
//                 如将来后端确需 PUT 语义，应单独实现 httpPut 并替换此处别名）
http.delete = httpDelete
http.put = httpPost
const http401 = {
  tag: false, // true 请求 401
  time: 0,
}

/**
 * 二次解析返回数据
 * @param options
 * @param resolve
 * @param reject
 * @param httpData
 */
function parseRestfulData<T>(
  options: CustomRequestOptions,
  resolve: any,
  reject: any,
  httpData: IResData<T>,
  completeResTag: boolean = false,
) {
  if (httpData.code >= 200 && httpData.code < 300) {
    // completeResTag: 不处理数据直接返回，由业务自行处理
    if (completeResTag) {
      return resolve(httpData)
    } else {
      if (!LJSbase.fieldCheck(httpData.data)) {
        return resolve(httpData.data)
      } else if (!LJSbase.fieldCheck(httpData.rows) && !LJSbase.fieldCheck(httpData.total)) {
        return resolve({
          rows: httpData.rows,
          total: httpData.total,
        })
      } else {
        return resolve({
          ...httpData,
          httpRes200_data_null: true, // 标记：code = 200, data = null
        })
      }
      // return resolve(httpData.data || httpData.rows || httpData.data == 0 ? httpData.data : false || httpData)
    }
  } else if (httpData.code === 401 || httpData.code === 403) {
    // 跳过登录：401 静默放行
    if (isSkipLoginMode()) {
      return resolve({} as T)
    }
    console.error('报错接口：', `${MAIN_API_PATH}${options.url}`)
    console.error('错误信息：', httpData.msg)
    // 原版处理，返回reject，检测机制会调用登录接口，等待登录完成后处理业务
    // 用户操作过程中刚好token失效，的业务不处理，微乎其微。
    // 于后端确认token有效期的机制：
    // 1.登录获得token 24小时；
    // 2.访问接口，接口会检测token，进入最后4小时，会重新更新token的有效期，从访问接口的时间点开始，延长24小时。
    return reject(httpData.msg)
    // 401 token 失效影响 积分页面、酒款详情、酒庄详情
    // 以下机制处理： token 失效，清除token，返回首页，重新获取token
    // 未失效的token，可正常进入页面，执行相关业务
    // if (!http401.tag) {
    //   // 401导致onLoad收到的参数未被使用就消失
    //   let onLoadOptions = uni.getStorageSync('onLoadOptions')
    //   let query = ''
    //   if (!LJSbase.fieldCheck(onLoadOptions)) {
    //     onLoadOptions = JSON.parse(onLoadOptions)
    //     query = formatParamsByAscii(onLoadOptions)
    //   }

    //   http401.tag = true
    //   http401.time = Date.now()
    //   useUserStore().reset()
    //   LJSrun.gp_reLaunch('/pages/home/HomeIndex?' + query)
    //   // LJSmsg.msg('用户数据失效，重新载入中...')
    //   setTimeout(() => {
    //     http401.tag = false
    //     http401.time = 0
    //   }, 5000)
    // }
  } else {
    // 跳过登录：静默放行
    if (isSkipLoginMode()) {
      return resolve({} as T)
    }
    console.error('报错接口：', `${MAIN_API_PATH}${options.url}`)
    console.error('错误信息：', httpData.msg)
    // token失效禁止提示窗消息
    if (!options.hideErrorToast && options.url !== '/api/unauthorized/login/check') {
      uni.showToast({
        icon: 'none',
        title: httpData.msg,
      })
    }
    return reject(httpData.msg)
  }
}
