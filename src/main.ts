import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'
import { requestInterceptor } from './interceptors'
import 'virtual:uno.css'
import '@/static/fonts/iconfont/iconfont.css'
import '@/style/index.scss'
// 全局注入公共JS-SDK
import ljsSDK from './uni_modules/ljs-sdk/js_sdk/index.js'

export function createApp() {
  const app = createSSRApp(App)
  app.config.globalProperties.$topBack = {
    show: true,
    homePath: '/pages/home/HomeIndex',
  }
  app.use(ljsSDK, {
    beforeEachTag: false,
  })
  app.use(store)
  app.use(requestInterceptor)
  return {
    app,
  }
}
