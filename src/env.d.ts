/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * 环境变量类型声明
 *
 * 值的来源见 env/ 目录：
 *   env/.env          公共默认值（提交）
 *   env/.env.example  私有配置模板（提交）
 *   env/.env.local    私有真实值（不提交，优先级最高）
 */
interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 公司 / 作者标识 */
  readonly VITE_APP_COMPANY_OWNER: string
  /** H5 开发端口 */
  readonly VITE_APP_PORT: string
  /** DCloud AppID（App 端打包用） */
  readonly VITE_UNI_APPID: string
  /** 微信小程序 AppID */
  readonly VITE_WX_APPID: string
  /** H5 部署 base */
  readonly VITE_APP_PUBLIC_BASE: string
  /** 服务端基础地址 */
  readonly VITE_SERVER_BASEURL: string
  /** H5 是否需要代理 */
  readonly VITE_APP_PROXY: 'true' | 'false'
  /** H5 代理前缀，一般是 /api */
  readonly VITE_APP_PROXY_PREFIX: string
  /** 是否清除 console（生产建议 true） */
  readonly VITE_DELETE_CONSOLE: string
  /** 是否生成 sourcemap */
  readonly VITE_SHOW_SOURCEMAP: string
  /** 正式环境 H5 站点地址 */
  readonly VITE_APP_H5_URL_ZS: string
  /** 体验版 H5 站点地址 */
  readonly VITE_APP_H5_URL_TEST: string
  /** 开发环境后端地址 */
  readonly VITE_API_BASE_URL_DEV: string
  /** 测试环境后端地址 */
  readonly VITE_API_BASE_URL_TEST: string
  /** 生产环境后端地址 */
  readonly VITE_API_BASE_URL_PROD: string
  /** WebView 加载的 AI 页面地址 */
  readonly VITE_APP_AI_WEBVIEW_URL: string
  /** 静态资源（图片 / 图标 / 字体）的 OSS 存储根地址，不带结尾斜杠 */
  readonly VITE_APP_OSS_BASE: string
  /**
   * 是否跳过登录校验（字符串布尔）
   * - 'true'：不调后端登录，直接进入主界面，接口失败静默处理
   * - 'false'：走正常微信登录流程
   */
  readonly VITE_APP_SKIP_LOGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
