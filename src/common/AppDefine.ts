/**
 * 接口基础地址配置
 *
 * 真实环境地址不放源码里，统一从环境变量读取（见 env/.env.example）：
 *   VITE_API_BASE_URL_DEV   开发环境
 *   VITE_API_BASE_URL_TEST  测试环境
 *   VITE_API_BASE_URL_PROD  生产环境
 *
 * 取值优先级：环境变量 > 空字符串（空则请求走同域/拦截器默认路径）。
 * 切换环境：改下面 MAIN_API_PATH 指向哪个，或直接注入对应环境变量。
 */

const apiMap = {
  // 本地 / 开发环境
  development: import.meta.env.VITE_API_BASE_URL_DEV || '',

  // 测试环境
  test: import.meta.env.VITE_API_BASE_URL_TEST || '',

  // 生产环境
  production: import.meta.env.VITE_API_BASE_URL_PROD || '',
}

// 当前使用哪个环境：'development' | 'test' | 'production'
// 本地联调改这里；发布前切成 production
const CURRENT_ENV: keyof typeof apiMap = 'test'

export const MAIN_API_PATH = apiMap[CURRENT_ENV]

export default apiMap
