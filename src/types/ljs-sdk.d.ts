/**
 * ljs-sdk 的 Vue 全局属性类型声明
 *
 * 背景
 * ----
 * `src/uni_modules/ljs-sdk` 是纯 JS 实现的 uni-app 插件，在 `main.ts` 里通过
 * `app.use(ljsSDK)` 把 10 个工具模块挂到 `app.config.globalProperties` 上：
 *
 *     app.config.globalProperties[`$LJS${name}`] = entity
 *
 * 挂载名与模块对应关系（见 ljs-sdk/js_sdk/index.js 的 tools 数组）：
 *
 *     $LJSbase       ← utils/base.js        判空、深拷贝、树查找等
 *     $LJSdate       ← utils/date.js        日期格式化
 *     $LJSnum        ← utils/num.js         数字/千分位
 *     $LJSfc         ← utils/formCheck.js   表单校验
 *     $LJSmsg        ← utils/msg.js         统一提示
 *     $LJSrun        ← utils/run.js         路由跳转
 *     $LJSanimation  ← utils/animation.js   动画
 *     $LJSurl        ← utils/url.js         URL 参数处理
 *     $LJSprivacy    ← utils/privacy.js     隐私授权
 *     $LJSstorage    ← utils/storage.js     本地存储
 *
 * 为什么需要这个文件
 * ----------------
 * SDK 没有 .d.ts，也没有做 Vue 模块增强声明，导致在 .vue 文件里写
 * `proxy.$LJSbase` 时 vue-tsc 报 250+ 个「Property does not exist」。
 * 运行时完全正常，纯粹是类型层面缺声明。
 *
 * 注意
 * ----
 * - 本文件是**手写**的长期维护项，放在 src/types 下，不要与
 *   `auto-import.d.ts`（unplugin-auto-import 自动生成，会被覆盖）混在一起。
 * - 若 SDK 新增工具模块，需同步在此补充，并更新 tools 数组对应关系。
 * - 这里用 `typeof import(...)` 引用原模块，保持类型与实现同源，
 *   避免手写重复的函数签名。
 */

// SDK 各模块的类型（默认导出的是对象，直接用 typeof 取形状）
type LJSBaseModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/base')
type LJSDateModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/date')
type LJSNumModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/num')
type LJSFcModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/formCheck')
type LJSMsgModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/msg')
type LJSRunModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/run')
type LJSanimationModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/animation')
type LJSurlModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/url')
type LJSprivacyModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/privacy')
type LJSstorageModule = typeof import('@/uni_modules/ljs-sdk/js_sdk/utils/storage')

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 判空、深拷贝、树查找等基础工具 */
    $LJSbase: LJSBaseModule
    /** 日期格式化与区间计算 */
    $LJSdate: LJSDateModule
    /** 数字处理与千分位 */
    $LJSnum: LJSNumModule
    /** 表单校验 */
    $LJSfc: LJSFcModule
    /** 统一提示（toast / modal） */
    $LJSmsg: LJSMsgModule
    /** 路由跳转（gp_navigateTo / gp_reLaunch / gp_navigateBack / getUrl） */
    $LJSrun: LJSRunModule
    /** 动画辅助 */
    $LJSanimation: LJSanimationModule
    /** URL 参数处理（formatParamsByAscii / getUrlAllParameter 等） */
    $LJSurl: LJSurlModule
    /** 隐私授权 */
    $LJSprivacy: LJSprivacyModule
    /** 本地存储封装 */
    $LJSstorage: LJSstorageModule

    /**
     * 顶部返回按钮配置，在 main.ts 中直接挂载：
     *
     *     app.config.globalProperties.$topBack = {
     *       show: true,
     *       homePath: '/pages/home/HomeIndex',
     *     }
     *
     * 组件 ljs-top-vue3 会读取它决定返回行为。
     */
    $topBack: {
      /** 是否显示返回按钮 */
      show: boolean
      /** 首页路径，返回栈不足时跳这里 */
      homePath: string
    }
  }
}

export {}
