import { MAIN_API_PATH } from '@/common/AppDefine'
import { useUserStore } from '@/store'
import { LJSbase, LJSrun, LJSurl, LJSmsg } from '@/uni_modules/ljs-sdk/js_sdk/index.js'
import { smConfigCheck } from '@/utils/smExecute'

/**
 *
 * @param id 文件ID
 * @returns 返回可获取的文件地址
 */
export const idForFile = (id: string) => {
  const userStore = useUserStore()
  const token = computed(() => userStore.userInfo?.token || '')
  if (!LJSbase.fieldCheck(id)) {
    return `${MAIN_API_PATH}/api/file/download/${id}?Authorization=${token.value}`
  }
  return null
}

/**
 * 拼接静态资源（图片 / 图标 / 字体）的完整 OSS 地址
 *
 * OSS 根域名来自环境变量 VITE_APP_OSS_BASE（见 env/.env.example），
 * 不写死在源码里，便于开源与多环境切换。
 *
 * - 传完整 URL（以 http:// 或 https:// 开头）时原样返回，不做拼接
 * - 传相对路径（如 '/weapp/mine/icon.png'）时拼到 OSS 根地址后面
 * - 根地址未配置时返回空字符串，此时远程图片不显示（本地可放 public/ 占位图）
 *
 * @param path 资源相对路径，建议以 / 开头
 * @returns 完整可访问的资源地址
 * @example ossUrl('/weapp/mine/mine-fuke.png')
 */
export const ossUrl = (path: string): string => {
  if (!path) return ''
  // 已经是完整地址，直接用
  if (/^https?:\/\//.test(path)) return path
  const base = (import.meta.env.VITE_APP_OSS_BASE || '').replace(/\/+$/, '')
  if (!base) return ''
  return base + (path.startsWith('/') ? path : `/${path}`)
}

/**
 * 分享相关业务 
 * 
const wineProducingShareIndex = ref(0)
onShareAppMessage((res) => {
  let path = `/pages/home/HomeIndex?source=wxShare&curTabBarName=${curTabBarName.value}`
  if (curTabBarName.value === 'IndexMenu2') {
    path += `&WineProducingIndex=${wineProducingShareIndex.value}`
  }
  return {
    title: curTabBarName.value,
    path,
  }
})
 */
/**
 * 开启转发菜单
 * @param menus 需要显示的转发按钮名称列表
 *   - 'shareAppMessage' 转发给好友（默认）
 *   - 'shareTimeline'  分享到朋友圈
 */
export function initShare(
  menus: UniNamespace.ShowShareMenuOptionsMenu[] = ['shareAppMessage'],
) {
  uni.showShareMenu({
    withShareTicket: true,
    menus, // 开启转发好友和转发朋友圈按钮
  })
}

/**
 * web-view组件地址处理
 * @param options web-view组件onLoad接收的参数
 * @param options.share 是否为可转发、分享的页面，1可转发，0不可转发
 * @param options.url web-view url属性值
 * @param options.queryStr web-view url属性值对应的参数
 * @returns 返回一个url地址
 */
export function webView(options) {
  let url = null
  if (!LJSbase.fieldCheck(options.url)) {
    const userStore = useUserStore()
    const token = computed(() => userStore.userInfo?.token || '')
    const newUrl = decodeURIComponent(options.url)
    const queryStr = JSON.parse(decodeURIComponent(!LJSbase.fieldCheck(options.queryStr) ? options.queryStr : JSON.stringify({})))
    queryStr.token = token.value
    queryStr._v = LJSbase.getAppBaseInfo().appVersion
    queryStr.app_mode = appMode()
    const smSwitch = smConfigCheck()
    queryStr.smSwitch = smSwitch ? '1' : '0'
    if (smSwitch) {
      const a = uni.getStorageSync('ljs_a')
      const b = uni.getStorageSync('ljs_b')
      queryStr.ljs_a = a
      queryStr.ljs_b = b
    }
    const result = LJSrun.getUrl(newUrl, queryStr)
    url = result
    if (!LJSbase.fieldCheck(options.share) && options.share === '1') {
      // 注：此处原为 initShare('/pages-other/WebView/WebView?url=' + url)，
      // 把 URL 当成了 menus 数组传入，与 initShare(menus) 的签名不符（历史笔误）。
      // initShare 的参数是「要显示的转发按钮名称列表」，与页面地址无关，故改为默认调用。
      initShare()
    }
    return url
  } else {
    LJSrun.gp_navigateBack(1, {})
  }
  return null
}

/**
 * banner类跳转通用处理
 * @param jumpType 类型:参考字典jump_type 内部(pages) - inner , 内部(H5) - outer , 内部(视频) - HLSVideo , 外部 - wxApp
 * @param jumpUrl 地址
 * @param shareText 分享title
 * @param shareImg 分享图片
 * @param jumpQuery 参数key数组，用于从原数据对象中获取数据，并将其放入参数中传入。在jumpType = inner或outer时有效
 * @returns 返回可获取的文件地址
 */
export function comBannerClick(
  params: Record<string, any>,
  jumpQuery: string[] = [],
  otherCallback: (params?: Record<string, any>) => void = () => {},
) {
  const { jumpType = 'outer', jumpUrl, shareText, shareImg } = params
  if (LJSbase.fieldCheck(jumpType) || LJSbase.fieldCheck(jumpUrl)) {
    return
  }
  // 类型:inner:内部跳转,outer:外部跳转
  if (jumpType === 'inner') {
    const queryStr = {}
    if (jumpQuery.length > 0) {
      for (const key of jumpQuery) {
        queryStr[key] = params[key]
      }
    }
    // 注：原实现用 formatParamsByAscii 手工拼 query 字符串，
    // 但 gp_navigateTo(url, parms) 的 parms 就是参数对象，内部自行 getUrl 拼接，
    // 手工拼接会导致参数被编码两次。改为直接传对象。
    LJSrun.gp_navigateTo(jumpUrl, queryStr, {})
  } else if (jumpType === 'outer') {
    const queryStr = {}
    if (jumpQuery.length > 0) {
      for (const key of jumpQuery) {
        queryStr[key] = params[key]
      }
    }

    // getUrlAllParameter 返回 [路径, 参数对象]，参数为空时返回 null。
    // JS 实现无类型标注，TS 只能推断出 string，此处经 unknown 中转按实际结构断言。
    const allParameter = LJSurl.getUrlAllParameter(jumpUrl) as unknown as
      | [string, Record<string, any>]
      | null
    if (allParameter && allParameter.length === 2) {
      const obj = allParameter[1]
      for (const key in obj) {
        queryStr[key] = obj[key]
      }
    }
    // 如果地址存在域名，则不处理，如果不存在域名，则拼接域名前缀
    const h5Url = getH5Url(allParameter ? allParameter[0] : jumpUrl)

    const obj = {
      page: '/pages-other/WebView/WebView',
      query: {
        share: '1',
        url: h5Url,
        shareText: !LJSbase.fieldCheck(shareText) ? shareText : '',
        shareImg: !LJSbase.fieldCheck(shareImg) ? shareImg : '',
        queryStr: JSON.stringify(queryStr),
      },
    }
    LJSrun.gp_navigateTo(obj.page, !LJSbase.fieldCheck(obj.query) ? obj.query : {}, {})
  } else if (jumpType === 'wxApp') {
    const jumpUrls = jumpUrl.split(',')
    if (jumpUrls.length === 2) {
      uni.navigateToMiniProgram({
        appId: jumpUrls[0],
        path: jumpUrls[1],
        success(res) {
          // 打开成功
        },
        fail(err) {
          console.log(err)
        },
      })
      // 京东地址： wx91d27dbf599dff74,/pages/shop/index/index?shopId=714888
      // 外部小程序： wxc34afd2aaafa8f57,/pages/home/HomeIndex
    } else if (jumpUrls.length === 3 && jumpUrls[2] === 'halfScreen') {
      uni.openEmbeddedMiniProgram({
        appId: jumpUrls[0],
        path: jumpUrls[1],
        extraData: {
          // data1: 'test',
        },
        success(res) {
          // 打开成功
          console.log(res)
        },
        fail(err) {
          console.log(err)
        },
      })
    } else {
      LJSmsg.msg('跳转失败，请稍后重试。')
    }
  } else if (jumpType === 'HLSVideo') {
    otherCallback(params)
  }
}

/**
 * 获得H5的完整地址
 * @param url H5跳转地址
 */
export function getH5Url(url = '') {
  // 如果地址存在域名，则不处理，如果不存在域名，则拼接域名前缀
  const tempUrl = url
  let h5Url = ''
  if (tempUrl.indexOf('http://') === -1 && tempUrl.indexOf('https://') === -1) {
    // 注：原实现用「MAIN_API_PATH 是否等于某个写死的生产域名」来判断环境，
    // 既把客户域名写进了源码（不便开源），又容易随配置变更失效。
    // 改为按小程序运行版本判断：
    //   release（正式版）→ 正式 H5 地址
    //   develop / trial（开发版 / 体验版）→ 体验版 H5 地址
    const baseUrl =
      appMode() === 'release'
        ? (import.meta.env.VITE_APP_H5_URL_ZS as string)
        : (import.meta.env.VITE_APP_H5_URL_TEST as string)
    h5Url = (baseUrl || '') + tempUrl
  } else {
    h5Url = tempUrl
  }
  return h5Url
}

/**
 * 时间控制器
 * @param time 需要控制的时间长度，毫秒。
 */
export function timeControl(time = 200) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * 程序的类型：生产和体验版
 * @param time 需要控制的时间长度，毫秒。
 */
export function appMode() {
  // 'develop' - 开发版, 'trial' - 体验版, 'release' - 正式版
  try {
    const accountInfo = uni.getAccountInfoSync()
    return accountInfo.miniProgram.envVersion
  } catch (error) {
    console.error('获取环境信息失败:', error)
    // 降级处理，假设为正式版
    return 'release'
  }
}

// 复制
export function fastCopy(val = null) {
  if (val === null) {
    console.error('复制数据异常')
    return
  }
  uni.setClipboardData({
    data: val,
    success: () => {
      LJSmsg.msg_success('复制成功！')
    },
  })
}

// 是否为：朋友圈内打开“单页模式”
export function pyqMode() {
  // 全局获取启动参数（包含scene）
  const launchOptions = uni.getLaunchOptionsSync()
  const scene = launchOptions.scene // 这里能拿到场景值（1154对应朋友圈）
  const isFromTimeline = scene === 1154
  return isFromTimeline
}

// 获取运行的 - 设备系统
export async function appPlatform() {
  const res = await new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: ({ osName: platform }) => {
        resolve(platform)
      },
    })
  })
  return res
}

// 获取运行的 - 设备底部安全距离
export async function appBottomSafeHeight() {
  const winInfo = uni.getWindowInfo()
  const bottomSafeHeight = winInfo.screenHeight - winInfo.safeArea.bottom

  switch (await appPlatform()) {
    case 'ios':
      return bottomSafeHeight
    case 'android':
      return bottomSafeHeight + 20
    case 'windows':
      return bottomSafeHeight + 20
    case 'mac':
      return bottomSafeHeight
    default:
      return bottomSafeHeight + 20
  }
}

// 图片预览
export function comPreviewImage(urls = null, showmenu = false) {
  if (urls === null) {
    console.error('图片数据异常')
    return
  }
  return new Promise((resolve, reject) => {
    uni.previewImage({
      urls,
      showmenu,
      longPressActions: {
        itemList: ['发送给朋友', '保存图片', '收藏'],
        success: function (data) {
          resolve(data)
        },
        fail: function (err) {
          reject(err)
        },
      },
    })
  })
}

// 订阅消息 - 授权
export function wxSubscribeMessage(tmplIds = null) {
  if (tmplIds === null) {
    console.error('订阅模版ids异常')
    return
  }
  return new Promise((resolve, reject) => {
    uni.requestSubscribeMessage({
      tmplIds,
      success(res) {
        resolve(res)
      },
      fail(error) {
        reject(error)
      },
    })
  })
}

// 获取用户定位
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02', // 返回可以用于uni.openLocation的经纬度
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        resolve([latitude, longitude])
      },
      fail: () => {
        reject([])
      },
    })
  })
}

// 清除缓存
export function clearAllCache() {
  return new Promise((resolve, reject) => {
    const tasks = [clearStorage(), clearSavedFile()]
    Promise.all(tasks)
      .then((res) => {
        resolve(res)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
async function clearStorage() {
  return new Promise((resolve, reject) => {
    // 1. 清理业务缓存
    try {
      // uni.clearStorageSync()
      useUserStore().reset()
      resolve(true)
    } catch (err) {
      reject(err)
    }
  })
}
async function clearSavedFile() {
  return new Promise((resolve, reject) => {
    uni.getSavedFileList({
      success: (res) => {
        res.fileList.forEach((file) => {
          uni.removeSavedFile({ filePath: file.filePath })
        })
        resolve(true)
      },
      fail: () => {
        resolve(false)
      },
    })
  })
}

/**
 * 计算两个经纬度之间的距离（单位：米 / 千米）
 * @param {Object} lat1 第一个点纬度
 * @param {Number} lng1 第一个点经度
 * @param {Number} lat2 第二个点纬度
 * @param {Number} lng2 第二个点经度
 * @param {Boolean} isKm 是否返回千米（默认false，返回米）
 * @return 距离数值
 */
export function getDistance(point1 = [], point2 = [], isKm = false) {
  if (point1.length !== 2 || point2.length !== 2) return null
  const lat1 = point1[0]
  const lng1 = point1[1]
  const lat2 = point2[0]
  const lng2 = point2[1]

  // 地球半径（米）
  const EARTH_RADIUS = 6378137.0

  // 经纬度转弧度
  const radLat1 = (lat1 * Math.PI) / 180.0
  const radLat2 = (lat2 * Math.PI) / 180.0
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0

  // 哈维正弦公式
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))

  s = s * EARTH_RADIUS
  s = Math.round(s * 100) / 100 // 保留两位小数

  // 是否返回千米
  if (isKm) {
    return (s / 1000).toFixed(2)
  }
  return s
}

/**
 * 地图点位点击
 * @param {String} location 点位经纬度（经度,纬度）
 * @param {String} title 点位名称
 * @return 距离数值
 */
export function openTxMap(location = '', title = '未知') {
  const locations = location.split(',')
  if (locations.length !== 2) {
    LJSmsg.msg('暂无位置信息')
    return
  }
  uni.openLocation({
    latitude: Number(locations[1]),
    longitude: Number(locations[0]),
    name: title,
    success: function () {},
    fail: function (e) {
      console.log('内置map调用失败', e)
    },
  })
}

/**
 * 并发执行一组 Promise，返回各结果组成的数组（顺序与入参一致）
 *
 * 注：入参通常是不同类型的请求（如 [getDict(...), wxUserInfo(), ...]），
 * 所以结果数组元素类型只能保守地用 any[]，由调用方按索引自行收窄。
 */
export function PromiseAll(pList: Promise<any>[] = []): Promise<any[]> {
  return new Promise<any[]>(function (resolve, reject) {
    if (!LJSbase.fieldCheck(pList) && pList.length > 0) {
      Promise.all(pList)
        .then((res) => {
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    } else {
      reject({ code: 500, msg: 'pList null' })
    }
  })
}
