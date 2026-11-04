# ljs-mini-program

LJS 体系的小程序端框架：**uni-app + Vue3 + TypeScript + Vite5 + UnoCSS**，内置 7 个自研 `ljs-*` 组件套件。开箱即用，不是空壳模板。

> English: A cross-platform mini program framework built on uni-app + Vue3 + TypeScript. Ships with 7 self-built `ljs-*` component suites, convention-based routing, request layer, interceptors, GM crypto and a JS-SDK toolkit — not an empty scaffold.

---

## 这个仓库是什么

LJS 体系分四层，本仓库是**移动端**那一层：

```
ljs-tools         工具层    Web 工具库 + 组件（npm 包）
ljs-vue3          Web 框架   若依系中后台，5 个模板
create-ljs        脚手架     一条命令生成 Web 工程
ljs-mini-program  移动端     ← 你在这里
```

基于开源模板 [unibest](https://github.com/codercup/unibest) 搭建工程底座，但**核心资产是自研的 7 个 `ljs-*` 套件**，不是 unibest 的默认能力。

---

## 技术栈

| 项 | 选型 |
| --- | --- |
| 框架 | uni-app（Vue 3 + `<script setup>`） |
| 语言 | **TypeScript**（LJS 体系里唯一的 TS 项目） |
| 构建 | Vite 5 |
| 样式 | UnoCSS + SCSS |
| 状态 | Pinia（setup 语法） |
| UI | **自研 `ljs-*` 套件 + uni-app 原生组件** |
| 包管理 | **pnpm**（`preinstall` 强制，npm / yarn 会被拦截） |

---

## 内置的 7 个组件套件

全部放在 `src/uni_modules/`，遵循 uni-app 插件规范，可独立分发。

| 套件 | 版本 | 说明 |
| --- | --- | --- |
| **`ljs-sdk`** | 1.3.3 | **核心 JS-SDK**：10 个工具模块（见下） |
| `ljs-top-vue3` | 1.3.1 | 顶部导航 / Banner 状态栏，支持自定义返回 |
| `ljs-tabs-vue3` | 1.5.0 | 标签页，样式可自定义 |
| `ljs-dialog-vue3` | 1.1.0 | 弹窗，灵活好用 |
| `ljs-xf-dialog-vue3` | 1.1.1 | 吸附式弹出层（半屏 / 续费场景） |
| `ljs-dragImages-vue3` | 1.0.7 | 可拖拽排序的图片上传 |
| `ljs-radio-slider` | 1.0.3 | 滑块选择，样式可自定义 |

### `ljs-sdk` 的 10 个工具模块

与 `ljs-tools` 命名同源，Web 端开发者可直接上手：

| 模块 | 用途 |
| --- | --- |
| `LJSbase` | 判空（`fieldCheck`）、深拷贝、树查找 |
| `LJSdate` | 日期格式化、区间计算 |
| `LJSnum` | 数字处理、千分位 |
| `LJSstorage` | 本地存储封装 |
| `LJSrun` | 页面跳转（含 tabBar / 重定向） |
| `LJSmsg` | 统一提示（toast / modal） |
| `LJSurl` | URL 参数处理 |
| `LJSprivacy` | 隐私授权 |
| `LJSfc` | 格式化 |
| `LJSanimation` | 动画辅助 |

全局注入后直接用 `this.$LJSbase`，也可局部 import。

---

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/LJS-Y/ljs-mini-program.git
cd ljs-mini-program

# 2. 安装（必须 pnpm）
pnpm install

# 3. 配置本地环境变量（见下节）
cp env/.env.example env/.env.local

# 4. 开发
pnpm dev:mp-weixin   # 微信小程序
pnpm dev:h5          # H5 预览

# 5. 构建
pnpm build:mp-weixin
pnpm build:h5
```

**微信开发者工具**：导入 `dist/dev/mp-weixin`（开发）或 `dist/build/mp-weixin`（构建产物）。

> ⚠️ 注意 `dev` 和 `build` 输出到**两个不同目录**，改了 `env` 后要重启 dev 进程并清掉 `dist/dev` 才会生效。

---

## 本地配置

仓库里不含任何真实环境信息（appid、接口地址、资源域名都是占位值），需要你在本地填。

### 环境变量机制

| 文件 | 是否提交 | 用途 |
| --- | --- | --- |
| `env/.env` | ✅ 提交 | 公开占位值，供参考 |
| `env/.env.example` | ✅ 提交 | 配置模板，含每一项的获取方式 |
| `env/.env.local` | ❌ 不提交（被 `.gitignore` 忽略）| **你的真实值放这里** |

Vite 的加载优先级是 `.env` → `.env.local`，后者覆盖前者。

### 最小配置

```bash
cp env/.env.example env/.env.local
```

然后编辑 `env/.env.local`，至少填以下几项：

| 变量 | 说明 |
| --- | --- |
| `VITE_UNI_APPID` | DCloud AppID（App 端需要），[DCloud 开发者中心](https://dev.dcloud.net.cn/)获取 |
| `VITE_WX_APPID` | 微信小程序 AppID，[微信公众平台](https://mp.weixin.qq.com/)获取 |
| `VITE_API_BASE_URL_DEV` | 开发环境后端地址，如 `http://localhost:8081` |
| `VITE_APP_OSS_BASE` | 图片 / 字体 / 图标的 OSS 根地址 |

### 静态资源地址

图片、图标、字体统一走工具函数拼接，不要在 `.scss` 里写死远程地址：

```ts
import { ossUrl } from '@/utils/base'

// TS
const icon = ossUrl('/weapp/mine/icon.png')

// 模板
// <image :src="ossUrl('/weapp/mine/icon.png')" />

// 行内背景图（SCSS 里读不到环境变量，所以写在 :style 上）
// :style="{ 'background-image': `url(${ossUrl('/weapp/bg.png')})` }"
```

> `VITE_APP_OSS_BASE` 留空时 `ossUrl()` 返回空串，远程图片不显示。

### 改了 env 之后

环境变量在进程启动时读入，**热更新不会重读**：

```bash
# Ctrl+C 停掉原进程
rm -rf dist/dev
pnpm dev:mp-weixin
```

---

## 工程能力

| 能力 | 实现 |
| --- | --- |
| **页面路由** | `vite-plugin-uni-pages` 约定式扫描 `src/pages/**`，自动生成 `pages.json` |
| **页面级配置** | `.vue` 顶部 `<route>` 块（json5），声明首页 / 自定义导航栏 |
| **分包** | `pages-mine/`（我的）、`pages-other/`（其他），在 `pages.json` 的 `subPackages` 登记 |
| **请求封装** | `src/utils/http.ts`：`http.get / post / del / upload` + 统一错误处理 |
| **请求拦截** | `src/interceptors/request.ts`：token 注入、401 统一跳登录 |
| **类型系统** | `src/typings.ts` + `src/types/`，接口泛型 `<IUserInfo>` 全程有类型 |
| **状态管理** | Pinia，`src/store/` 按域分模块 |
| **国密加密** | `src/utils/smExecute.ts`（SM2 / SM3 / SM4） |
| **样式** | UnoCSS 原子类 + `uni.scss` 主题变量 |

---

## 目录结构

```
src/
  main.ts              入口：createSSRApp + store + 拦截器 + ljs-sdk
  pages/               主包页面（约定式，自动扫描）
  pages-mine/          分包：我的
  pages-other/         分包：其他
  layouts/             布局
  components/          业务组件
  api/                 接口层（按域分文件）
  store/               Pinia
  interceptors/        请求拦截
  utils/               http / base / smExecute / platform
  uni_modules/         7 个 ljs-* 套件
  typings.ts           全局类型
pages.config.ts        页面全局配置
manifest.config.ts     打包配置（appid 等）
vite.config.ts         构建配置
```

> ⚠️ `src/pages.json` 与 `src/manifest.json` 是**生成产物**，
> 源头分别是 `pages.config.ts` 和 `manifest.config.ts`。不要手改产物。

---

## 与 unibest 的关系

本项目基于 [unibest](https://github.com/codercup/unibest) 搭建工程底座，但做了以下调整：

| 项 | 说明 |
| --- | --- |
| **UI** | 移除 wot-design-uni / z-paging 依赖，改用自研 `ljs-*` 套件 |
| **组件** | 新增 7 个 `ljs-*` 套件（导航、标签、弹窗、拖拽上传、滑块、JS-SDK） |
| **SDK** | `ljs-sdk` 提供 10 个工具模块，与 `ljs-tools` 命名对齐 |
| **业务** | 补充订单、积分商城、收货地址、用户反馈等页面结构 |

> `pages.config.ts` 里仍保留 `wd-*` / `z-paging` 的 easycom 路径配置，属历史遗留，
> 对应包未安装、代码零使用。**新页面请勿使用。**

---

## 相关仓库

| 仓库 | 说明 |
| --- | --- |
| [ljs-tools](https://github.com/LJS-Y/LJSTools) | Web 端工具库与组件 |
| [ljs-vue3](https://github.com/LJS-Y/ljs-vue3) | Web 中后台框架，5 个模板 |
| [create-ljs](https://github.com/LJS-Y/create-ljs) | 一条命令生成 Web 工程 |
| 10 个独立 npm 插件 | [npm @9mountain](https://www.npmjs.com/~9mountain) |

## 文档

- **Web 端 API 文档**：[ljs-y.github.io/ljs-vue3](https://ljs-y.github.io/ljs-vue3)
- **AI 协作者约定**：见仓库根目录 `AGENTS.md`（或 `CLAUDE.md`，内容一致）

---

## License

MIT
