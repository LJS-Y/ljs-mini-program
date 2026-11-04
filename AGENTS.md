# AGENTS.md — mini-program-vue3-version 项目约定（v1，2026-11）

> 本文件是写给 AI 协作者的项目约定包。四层验收：能发现、能理解、能正确调用、能直接接入。
> 怎么读：先看第 0 章；做任务查第 5 章；下笔前过一遍第 6/7 章红线。

## 0 阅读指引

- 本文件只写**稳定原则**（第 1/2/3/6/7 章）。易变细节（组件参数表、API 清单）外置到各自 README / `uni_modules/*/README.md`，本文件只给入口。
- 改约定的顺序：先改代码 → 再同步本文件 → 同步 CLAUDE.md（两文件内容必须完全一致）。
- 本文件与代码不一致时：**先报告、不擅自行动**，以实际代码行为为准。

## 1 项目速览

- **定位**：LJS 体系的小程序端框架，基于开源模板 **unibest** 改造，核心是 7 个自研 `ljs-*` 组件套件。面向微信小程序 + 多端（H5 / App）。
- **技术栈**：uni-app（Vue 3）+ **TypeScript** + Vite 5 + UnoCSS + Pinia。
- **UI 组件：以自研 `ljs-*` 为主 + uni-app 原生组件**（`<scroll-view>` / `<web-view>` 等）。
  > ⚠️ **注意**：`pages.config.ts` / `pages.json` 的 `easycom.custom` 里仍配着 `wd-*`（wot-design-uni）与 `z-paging` 的路径，但：
  > ① 这两个包**既不在 `package.json` 依赖里，也不在 `node_modules`**；
  > ② 全部页面**没有一处使用**（实测 grep 为 0）。
  > 这是从 unibest 继承的**遗留配置**。写新页面**不要用** `wd-*` / `z-paging`，会直接报错找不到组件。
- **命令**：
  - `pnpm dev:mp-weixin`（微信小程序开发）
  - `pnpm dev:h5`（H5 开发）
  - `pnpm dev`（默认，等同 `uni`）
  - `pnpm build:mp-weixin` / `pnpm build:h5`（构建）
  - `pnpm uvm`（升级 uni-app 版本）
- **包管理器：pnpm**。`package.json` 有 `preinstall: npx only-allow pnpm`，**用 npm/yarn 安装会被直接拦截**。
- **页面路由：全自动生成，分两级配置**
  1. **主包页面（`src/pages/**`）**：`vite-plugin-uni-pages` 自动扫描，无需任何配置，建 `.vue` 即可。
  2. **分包（`src/pages-mine/` / `src/pages-other/`）**：需要在 **`vite.config.ts`** 的 `UniPages({ subPackages: [...] })` 里**声明分包目录**（本项目已配好两个）：

     ```ts
     // vite.config.ts
     UniPages({
       subPackages: ['src/pages-mine', 'src/pages-other'],
     })
     ```

     **声明后重新运行 `pnpm dev:mp-weixin` / `build:mp-weixin`**，插件会扫描该目录下的 `.vue` 并写入 `pages.json` 的 `subPackages`。
     **新增一个分包 = 在 `vite.config.ts` 的数组里加一项 + 重启**，不要手改 `pages.json`。

  两者最终都产出 `src/pages.json`（生成物，不要手改）。实测：手工删掉 `pages.json` 的 `subPackages` 后重新构建，插件会**完整重建**，内容与原来一致。
- **页面级配置用 `<route>` 块**（`lang="json5"`），写在 `.vue` 文件顶部：

  ```vue
  <route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'custom',
      navigationBarTitleText: '首页',
    },
  }
  </route>
  ```

  `type="home"` 指定首页；`style` 覆盖 `globalStyle`。项目现有 12 个页面用此方式。

## 2 目录约定

```
src/
  main.ts               入口：createSSRApp + store + requestInterceptor + ljsSDK
  App.vue               应用根组件
  pages.json            [生成物] 由 pages.config.ts + 页面扫描产出，勿手改
  manifest.json         小程序/App 打包配置（appid、平台参数）
  pages/                主包页面（约定式路由，一个目录一个页面）
  pages-mine/           分包（我的相关）
  pages-other/          分包（其他）
  layouts/              布局（tabbar 等）
  components/           业务组件
  api/                  接口层（按域分文件，如 userApi.ts / commonApi.ts）
  store/                Pinia（index.ts 出口 + 按域分模块，如 user.ts）
  interceptors/         请求拦截器（index.ts 装配 + request.ts 实现）
  utils/
    http.ts             封装 http / httpGet / httpPost / httpDelete / httpUpload
    base.ts             业务工具（initShare / webView / appMode / 定位 / 复制…）
    smExecute.ts        国密加解密
    platform.ts         平台判断
    common.ts / index.ts
  common/               运行时管理类（如 AppManager）
  types/ typings.ts     TS 类型定义
  uni_modules/          **7 个自研 ljs-* 组件套件（本项目的核心资产）**
  static/               静态资源（含 iconfont）
  style/                SCSS
pages.config.ts         页面全局配置（globalStyle / easycom）
manifest.config.ts      打包配置（TS 版）
uno.config.ts           UnoCSS 配置
```

### uni_modules 里的 7 个套件

| 套件 | 版本 | 用途 |
| --- | --- | --- |
| `ljs-sdk` | 1.3.3 | **核心**：JS-SDK、路由守卫、`LJSbase` 等工具 |
| `ljs-top-vue3` | 1.3.1 | 顶部导航栏 |
| `ljs-tabs-vue3` | 1.5.0 | 标签页 |
| `ljs-dialog-vue3` | 1.1.0 | 弹窗 |
| `ljs-xf-dialog-vue3` | 1.1.1 | 弹窗（续费/特殊场景变体）|
| `ljs-dragImages-vue3` | 1.0.7 | 图片拖拽排序 |
| `ljs-radio-slider` | 1.0.3 | 滑动选择 |

> **这些套件是本项目最有价值的部分**，各自有 `package.json`，遵循 uni_modules 规范，可独立分发。

## 3 核心编码约定

### 3.1 页面写法（Vue 3 `<script setup>` + TS）

```vue
<script setup lang="ts">
import { ref, onLoad } from '@dcloudio/uni-app'
const list = ref<Item[]>([])

onLoad(() => { /* 页面参数在 onLoad */ })
</script>
```

- **页面生命周期用 `@dcloudio/uni-app` 导出的钩子**（`onLoad` / `onShow` / `onReachBottom`），**不是 Vue 的 `onMounted`**。两者可共存但要分清职责。
- 组件优先用**自研 `ljs-*` 套件**（`ljs-top-vue3` / `ljs-tabs-vue3` / `ljs-dialog-vue3` 等，见第 2 章表格）与 uni-app 原生组件（`scroll-view` / `web-view` / `image` 等）。
  `ljs-*` 走 `uni_modules` 自动注册，直接用标签，无需 import。
- 新增页面：在 `src/pages/<目录>/<页面>.vue` 建文件即可，`uni-pages` 自动扫描注册。页面级配置用 `<route>` 块（见第 1 章）。

### 3.2 接口层

- `src/api/<域>Api.ts`，从 `@/utils/http` 引 `http`。

```ts
import { http } from '@/utils/http'
import type { IUserInfo } from '@/typings'

export function getCurrentUserInfo() {
  return http.get<IUserInfo>('/api/user/current')
}
```

- 泛型 `<IUserInfo>` **必须写**，这是 TS 项目相对 JS 项目的核心收益。类型定义放 `src/typings.ts` 或 `src/types/`。
- 响应结构由拦截器统一处理（`src/interceptors/request.ts`），页面拿到的已不是原始 axios 响应；**不要在页面里再解一层 `res.data.data`**，先读拦截器确认。

### 3.3 状态管理（Pinia）

- `src/store/index.ts` 是出口，按域分模块（`user.ts` 等）。
- 用 **setup 语法**写 store（`ref` + `defineStore`），与项目现状一致。
- 用户态、token 在 `store/user.ts`；**不要新建第二套登录态存储**。

### 3.4 请求拦截与登录校验

- 拦截器在 `src/interceptors/`，`main.ts` 里 `app.use(requestInterceptor)` 装配。
- 登录过期、401 处理在这里统一做；页面**不要重复写跳登录逻辑**。

### 3.5 样式

- **UnoCSS**（原子类）+ `src/style/index.scss`（全局）+ 页面 `scoped`。
- 优先用 UnoCSS 原子类；复杂布局再写 scoped 样式。
- 主题色走 `uni.scss` 变量，**不要硬编码色值**。

### 3.6 国密

- `src/utils/smExecute.ts`。与 Web 端（ljs-vue3）保持一致的处理原则：
  登录接口收到国密密钥对且开关开启，才做加解密。

### 3.7 组件套件（uni_modules）使用

- 已安装即用，`easycom` 自动注册。**不要重复安装**同名套件。
- 改动 `uni_modules/ljs-*` 内部代码是**高风险操作**：它们是独立分发的资产，改了要同步版本号与 changelog。**改动前先报告。**

## 4 关键工具入口

| 需要什么 | 去哪 |
| --- | --- |
| HTTP 请求 | `@/utils/http` → `http.get` / `http.post` / **`http.del`** / `http.upload`（**注意是 `del` 不是 `delete`，且没有 `put`**）；也可具名导入 `httpGet/httpPost/httpDelete/httpUpload` |
| 业务工具（分享/复制/定位/预览图片）| `@/utils/base` |
| LJS 基础工具 | `@/uni_modules/ljs-sdk/js_sdk/index.js` 的 `LJSbase` |
| 平台判断 | `@/utils/platform` |
| 国密 | `@/utils/smExecute` |
| 用户态 / token | `@/store/user` |
| 全局返回顶部配置 | `main.ts` 的 `$topBack`（`show` / `homePath`）|

## 5 常见任务操作手册

### 5.1 加一个页面

1. 建 `src/pages/<目录>/<页面名>.vue`；
2. 用 `<script setup lang="ts">`，生命周期从 `@dcloudio/uni-app` 导入；
3. 需要进 tabBar 或自定义导航的，改 `pages.config.ts`（**不要改 `pages.json`**）；
4. 自检：`pnpm dev:mp-weixin` → 开发者工具里能看到并进入该页面。

### 5.2 加一个接口

1. `src/api/<域>Api.ts` 加函数，`http.get<T>('/api/xxx')`，**写泛型**；
2. 类型加到 `src/typings.ts`；
3. 页面 `onLoad` 里调用，注意拦截器已处理错误提示，页面不重复弹。

### 5.3 加分包页面

1. 在**已在 `vite.config.ts` 声明过的**分包目录下（本项目为 `src/pages-mine/` 或 `src/pages-other/`）建 `.vue`；
2. **重启开发服务**（`pnpm dev:mp-weixin`），`uni-pages` 会扫描到新页面并写入 `pages.json`；
3. 分包内页面**不要反向引用主包的重资源**；
4. 自检：开发者工具里能进入该分包页面，且主包体积未超限。

**新增一个全新分包目录**（如 `src/pages-wine/`）：

1. 在 `vite.config.ts` 的 `UniPages({ subPackages: [...] })` 数组里加 `'src/pages-wine'`；
2. 重启开发服务；
3. 之后该目录下的页面同样自动扫描。

> 关键：**分包目录必须在 `vite.config.ts` 声明**，否则该目录下的 `.vue` 不会被路由扫描到。

> 注意：主包页面（`src/pages/`）是自动扫描的，**不要**去 `pages.json` 手工加；
> 分包页面**必须**手工登记。这两者规则不同。

### 5.4 用或改 ljs-* 套件

- 用：直接写标签，easycom 自动注册。
- 改：**先报告**。改完要同步该套件 `package.json` 的 version 与 README 更新说明，因为它可能被别的项目引用。

## 6 禁止事项红线

1. **不要用 npm / yarn 安装依赖** —— `preinstall` 会拦截，本项目强制 pnpm。
2. **不要手改 `pages.json` 的 `pages` / `subPackages`** —— 两者都由 `uni-pages` 生成：
   主包页面来自 `src/pages/**` 扫描，分包来自 `vite.config.ts` 的 `subPackages` 数组 + 目录扫描。
   手改会在下次生成时被冲掉。要加分包目录，改 `vite.config.ts` 后重启。
3. **不要搞混 `manifest.json` 与 `manifest.config.ts`**：`manifest.config.ts` 是源，`src/manifest.json` 是 `vite-plugin-uni-manifest` 生成的产物。改打包配置改 `.ts`。同理 `pages.config.ts` → `pages.json`（主包部分）。
4. **不要在页面里重复处理 401 / 跳登录** —— 拦截器已统一处理。
5. **不要混用 npm 包与 uni_modules** 装同一个组件 —— 小程序端优先 `uni_modules`（工具链兼容）。
6. **不要用 `wd-*` / `z-paging` 组件** —— 二者未安装、全项目零使用，只是 unibest 遗留的 easycom 配置。用自研 `ljs-*` 或 uni-app 原生组件。
7. **不要改 `uni_modules/ljs-*` 而不升版本号** —— 这些是独立分发资产。
8. **不要引入 Options API 写新页面** —— 本项目统一 `<script setup>` + TS。
9. **不要用 `http.delete` 或 `http.put`** —— 挂载名是 **`http.del`**（见 `utils/http.ts` 第 193 行 `http.del = httpDelete`），且**没有 put 方法**。需要 PUT 语义时用 `http.post` 或在 `utils/http.ts` 补齐（补齐要同步本文件）。

## 7 不要模仿清单（历史教训）

> 本文件建立时（2026-11）项目已是可用状态，以下是从 unibest 继承或历史遗留、**不要照抄**的模式。

1. **README 仍是 unibest 原文**：`README.md` 通篇讲 unibest 的功能，**没有一句说本项目改了什么**。这是待修复项，新写的文档不要沿用这种「复制上游 README 充当自己文档」的做法。

2. **包名含中文**：`package.json` 的 `name` 是 `"LJS小程序"`。
   **npm 拒绝中文包名**（实测 `EINVALIDTAGNAME`），导致无法以 npm 包形式分发。
   教训：**包名从第一天就要用 URL-safe 字符**（小写字母、数字、`-`、`_`、`.`）。

3. **组件套件与业务代码耦合**：7 个 `ljs-*` 套件埋在 `src/uni_modules/` 里随工程走，没有独立版本线。
   教训：独立资产要独立 `package.json` + 独立 README + 独立 changelog（现状已有 package.json，缺后两者）。

4. **`pages.json` 可能被手改过**：生成物一旦被手工修改，下次生成会被覆盖且难排查。
   教训：见红线 2。

## 附则

- **CLAUDE.md 双写**：本文件与根目录 `CLAUDE.md` 内容必须**完全一致**；改本文件后立即同步（复制即可）。
- **一次写对门禁**：验收方式 = 给 AI 本文件，令其完成「加页面 / 加接口 / 加分包 / 用 wd- 组件」各一例，产出符合第 3 章约定即通过；不达标补文档、不迁就。
- 版本：v1（2026-11，mini-program-vue3-version）。
