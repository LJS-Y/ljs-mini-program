import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'LJS小程序',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    // 注意：原 unibest 模板在此配置了 wot-design-uni（wd-*）与 z-paging 的解析路径，
    // 但本项目已改为自研 ljs-* 套件：
    //   ① 两个包均未在 package.json 声明，node_modules 中也不存在；
    //   ② 全项目零使用（<wd- 与 z-paging 的 grep 命中均为 0）。
    // 保留会导致按配置写 <wd-xxx> 时直接报「找不到组件」，故已移除（2026-11-02）。
  },
})
