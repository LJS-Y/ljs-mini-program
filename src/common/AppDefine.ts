/**
 * 接口基础地址
 * 从环境变量读取，见 env/.env.example
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
