import { LJSbase, LJSrun, LJSurl } from '@/uni_modules/ljs-sdk/js_sdk/index.js'
import { useUserStore } from '@/store'

import { taskRun, taskCode } from '@/api/pages-mine/Points'

/**
 * 积分使用按钮跳转积分商城
 */
export function pointUse(closeTc = () => {}) {
  const pages = getCurrentPages() // 获取当前页面栈的实例，数组
  const currentPage = pages[pages.length - 1] // 获取数组的最后一个元素，即当前页面实例
  const nowPath = currentPage.route // 获取当前页面的路径
  const afterPage = pages[pages.length - 2] // 获取数组的倒数第二元素

  const afterPath = afterPage.route
  if (nowPath !== 'pages-mine/Points/PointsMallIndex') {
    if (!LJSbase.fieldCheck(afterPage) && afterPath === 'pages-mine/Points/PointsMallIndex') {
      LJSrun.gp_navigateBack(
        1,
        {
          code: '商城',
        },
        'ljsRunBackF',
      )
    } else {
      LJSrun.gp_redirectTo(
        '/pages-mine/Points/PointsMallIndex',
        {},
        {
          code: '商城',
        },
        'ljsRunBackF',
      )
    }
  } else {
    closeTc()
  }
}

/**
 * 任务核销
 * @param taskConfigId 任务ID
 * @param invitationId 核销ID
 */
export async function taskWriteoff(taskConfigId, invitationId = null) {
  const data = await taskRun({ taskConfigId, invitationId })
  if (data.success) {
    useUserStore().updateNowPoints()
  }
}

/**
 * 1.创建任务记录
 * 2.获取核销码 - needVerify === 1 会有 invitationId
 * @param time taskConfigId
 */
export function taskWriteoffCode(taskConfigId: string | number) {
  // 泛型用 any：resolve 的是 taskCode 的返回（{ invitationId?, qrCode? ... }），
  // 调用方按需解构，不收紧以免与业务字段变化冲突。
  return new Promise<any>((resolve, reject) => {
    taskCode({ taskConfigId }).then((data) => {
      resolve(data)
    })
  })
}

/**
 * 获取核验数据的path
 * @param taskConfigId 任务ID
 * @param path 跳转的地址
 * @param query 额外的参数
 */
export function taskWriteoffPath(taskConfigId, path, query = {}) {
  if (useUserStore().taskData.hxData !== null) {
    // 获取核销数据
    useUserStore().setComLoadingState({
      open: true,
    })
    path += `?${LJSurl.formatParamsByAscii({
      ...query,
      ...taskWriteoffData(taskConfigId),
    })}`
    useUserStore().setComLoadingState({
      open: false,
    })
  }
  return path
}

/**
 * 获取核验数据
 * @param taskConfigId 任务ID
 * @param query 额外的参数
 */
export function taskWriteoffData(taskConfigId) {
  if (useUserStore().taskData.hxData !== null) {
    return useUserStore().taskData.hxData['hxDataOne_' + taskConfigId]
  }
  return null
}

/**
 * 存储核验数据，等待时机
 * @param options 参数数据
 */
export function saveTaskWriteoffData(options) {
  const { taskConfigId, invitationId, source = 'taskWriteoff_SHARE' } = options
  const hxDataOne = {}
  hxDataOne['hxDataOne_' + taskConfigId] = {
    source,
    taskConfigId,
    invitationId,
  }
  useUserStore().setTaskData({ hxData: hxDataOne })
}

/**
 * 获取运行次数数据
 * @param taskConfigId 任务ID
 * @param query 额外的参数
 */
export function getTaskRunData(taskConfigId) {
  if (useUserStore().taskData.runData !== null) {
    return useUserStore().taskData.runData['task_' + taskConfigId]
  }
  return null
}

/**
 * 存储任务运行次数数据，等待时机
 * @param options 参数数据
 */
export function saveTaskRunData(taskConfigId, runData = [0, 0]) {
  const runDataOne = {}
  runDataOne['task_' + taskConfigId] = runData
  useUserStore().setTaskData({ runData: runDataOne })
}

// 是否授权手机号
// 注：gp_reLaunch(url, parms, res) 第二参是 URL 查询参数对象，内部用 getUrl(url, parms) 拼接；
// 原实现手工拼在 url 里只传一个参数，与签名不符，且丢失 res 回传能力。
export function isAuthorization({ path = '/pages/home/HomeIndex', otherObj = {} }) {
  const hasWxMobile = useUserStore().hasWxMobile
  if (!hasWxMobile) {
    const tempO = {
      source: 'general',
      pageType: 'app',
      PhoneAuthorize: '1',
      ...otherObj,
    }
    LJSrun.gp_reLaunch(path, tempO, {})
    return true
  }
  return false
}

/**
 * 获取酒庄名称
 * @param {Object} wineryObj 酒庄对象
 * @param {Boolean} allName 是否显示全称
 * @return 酒庄名称
 */
export function getWineryName(wineryObj = null, allName = false) {
  if (wineryObj === null) return null
  if (allName) {
    return wineryObj.wineryChineseName
  }
  return !LJSbase.fieldCheck(wineryObj.wineryShortName) ? wineryObj.wineryShortName : wineryObj.wineryChineseName
}