# AI.md — ljs-mini-program 机器可读说明

> 面向 AI 编码助手：判断本项目是否适用、如何一次写对代码。
> 对应版本锚点：`ljs-mini-program@1.0.0`（2026-11）。与源码冲突时以源码为准。
> 人类向文档见 [README.md](./README.md)；仓库内 AI 协作者约定见 [AGENTS.md](./AGENTS.md)。

---

## 1 一句话定位

**uni-app + Vue3 + TypeScript + Vite5 + UnoCSS + Pinia 的微信小程序框架，内置 7 个自研 `ljs-*` 组件套件与 1 个工具库 `ljs-sdk`。**

基于开源模板 [unibest](https://github.com/codercup/unibest) 搭建工程底座，但核心资产是自研套件，不是 unibest 的默认能力。

### LJS 体系中的位置

```
ljs-tools         工具层    Web 工具库 + 组件（npm 包）
ljs-vue3          Web 框架   若依系中后台，5 个模板
create-ljs        脚手架     一条命令生成 Web 工程
ljs-mini-program  移动端     ← 本项目
```

---

## 2 何时用 / 何时不用

### 适合

- 要做**微信小程序**，且需要 TS 类型安全 + 约定式路由 + 现成组件套件
- 需要**一套代码编到 H5 / App / 多端**（本项目支持 `dev:h5`、`build:app`）
- 后端是**若依系**或类似「RESTful + token + 分页 rows/total」结构
- 想要**约定优于配置**：建 `.vue` 即生成路由，不用手写 `pages.json`

### 不适合

| 场景 | 原因 / 替代方向 |
| --- | --- |
| 纯 H5 项目 | 用 `ljs-vue3`（Web 框架，功能更全）|
| 需要 Element Plus / ant-design 等桌面 UI | 小程序端不适用，用 `ljs-vue3` |
| 鸿蒙原生 / 快应用深度定制 | uni-app 各端支持度不一，需先验证 |
| 只要一个纯组件 | 直接引 `npm` 上的独立包（`ljs-s-timeline` / `moving-numbers-vue3` 等）|
| 团队强制用 npm/yarn | **不可行**：`preinstall` 有 `only-allow pnpm`，会被拦截 |

---

## 3 安装与启动

```bash
# 1. 克隆
git clone https://github.com/LJS-Y/ljs-mini-program.git
cd ljs-mini-program

# 2. 安装（必须 pnpm）
pnpm install

# 3. 配置环境变量（真实值不入库）
cp env/.env.example env/.env.local
# 编辑 env/.env.local 填入 appid / 接口地址 / OSS 域名

# 4. 开发
pnpm dev:mp-weixin    # 微信小程序
pnpm dev:h5           # H5

# 5. 构建
pnpm build:mp-weixin
pnpm build:h5
```

### 环境变量机制（务必理解）

| 文件 | 是否提交 | 用途 |
| --- | --- | --- |
| `env/.env` | ✅ | 公开占位值 |
| `env/.env.example` | ✅ | 配置模板 |
| `env/.env.local` | ❌ 被忽略 | **真实值放这里** |

加载优先级：先 `.env`，再 `.env.local`；后者覆盖前者。

**改了 env 必须重启**（环境变量在进程启动时读入，热更新不重读）：

```bash
rm -rf dist/dev && pnpm dev:mp-weixin
```

### 关键环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_UNI_APPID` | DCloud AppID（App 端需要）|
| `VITE_WX_APPID` | 微信小程序 AppID |
| `VITE_API_BASE_URL_DEV/TEST/PROD` | 后端地址 |
| `VITE_APP_OSS_BASE` | 图片 / 字体 / 图标的 OSS 根地址 |
| `VITE_APP_SKIP_LOGIN` | `'true'` 跳过登录校验（调试用，见 §8）|

### 构建产物的两个目录（常见误解）

| 命令 | 产物目录 | 用途 |
| --- | --- | --- |
| `pnpm dev:mp-weixin` | `dist/dev/mp-weixin` | 本地开发，微信开发者工具导入这个 |
| `pnpm build:mp-weixin` | `dist/build/mp-weixin` | 上传发布，小程序后台用这个 |

**两者独立，构建一个不影响另一个。**

---

## 4 目录约定

```
src/
├── pages/               主包页面（自动扫描，建 .vue 即生成路由）
├── pages-mine/          分包：我的
├── pages-other/         分包：其他（WebView 等）
├── uni_modules/         7 个自研 ljs-* 套件 + ljs-sdk
├── api/                 全局接口（loginApi / userApi / commonApi）
├── store/               Pinia（user.ts 为主）
├── utils/
│   ├── http.ts          请求封装（get/post/del/upload）
│   ├── base.ts          ossUrl / idForFile 等
│   └── platform.ts      平台判断
├── interceptors/        请求拦截器
├── common/
│   ├── AppDefine.ts     环境判断 / MAIN_API_PATH
│   ├── UserManager.ts   登录态管理
│   └── BusinessIds.ts   业务配置 ID 常量
├── style/index.scss     全局样式
└── types/               类型声明
env/                     环境变量（.env / .env.local）
```

### 路由规则

- **主包**（`src/pages/**`）：`vite-plugin-uni-pages` 自动扫描，**不用配 `pages.json`**
- **分包**（`pages-mine/` / `pages-other/`）：需在 `vite.config.ts` 的 `UniPages({ subPackages: [...] })` 里**声明目录**，已配好两个
- 页面级配置写在 `.vue` 顶部的 `<route>` 块（json5）

---

## 5 7 个组件套件 + ljs-sdk

全部在 `src/uni_modules/`，**自动 easycom 注册，无需 import 组件**。

| 套件 | 版本 | 能力 |
| --- | --- | --- |
| `ljs-sdk` | 1.3.3 | 工具库（见下），全局挂 `$LJS*` |
| `ljs-tabs-vue3` | 1.5.0 | 标签页 |
| `ljs-top-vue3` | 1.3.1 | 自定义导航栏 |
| `ljs-dialog-vue3` | 1.1.0 | 弹窗 |
| `ljs-xf-dialog-vue3` | 1.1.1 | 复杂弹窗 |
| `ljs-radio-slider` | 1.0.3 | 滑动选择器 |
| `ljs-dragImages-vue3` | 1.0.7 | 拖拽上传图片 |

### ljs-sdk 的 10 个工具模块

| 挂载名 | 能力 |
| --- | --- |
| `$LJSbase` | 判空 `fieldCheck`、深拷贝 `deepCopy`、`getAppBaseInfo` |
| `$LJSdate` | 日期格式化 |
| `$LJSnum` | 数字处理 |
| `$LJSfc` | 表单校验 |
| `$LJSmsg` | 轻提示 `msg()` |
| `$LJSrun` | 路由跳转 `gp_navigateTo` / `gp_reLaunch` |
| `$LJSanimation` | 动画 |
| `$LJSurl` | URL 处理 |
| `$LJSprivacy` | 隐私协议 |
| `$LJSstorage` | 存储 |

**用法**（`setup` 内）：

```ts
const { proxy } = getCurrentInstance()

// 判空（约定：true 表示为空）
if (!proxy.$LJSbase.fieldCheck(data)) { /* data 有值 */ }

// 跳转
proxy.$LJSrun.gp_navigateTo('/pages-other/PhoneAuthorizeAgreement/PhoneAuthorizeAgreement')

// 提示
proxy.$LJSmsg.msg('操作成功')
```

> ⚠️ **`fieldCheck` 的判定范围**：只认 `undefined` / `null` / `''` / `'<Undefined>'` 为空。
> **空数组 `[]` 和空对象 `{}` 会返回 `false`（视为有值）**——判列表是否为空请用 `data.length`。

**另有 3 个模块不挂全局、按需直接引入**：

| 模块 | 路径 | 能力 |
| --- | --- | --- |
| `cryptoJs` | `@/uni_modules/ljs-sdk/js_sdk/utils/cryptoJs` | AES 等常规加解密 |
| `smCrypto` | `@/uni_modules/ljs-sdk/js_sdk/utils/smCrypto` | 国密 SM2 / SM3 / SM4 |
| `request` | `@/uni_modules/ljs-sdk/js_sdk/utils/request` | 底层请求（**项目已用 `@/utils/http` 封装，一般不用它**）|

---

## 6 接口层写法（照抄即可）

### 6.1 定义接口

```ts
// src/pages-mine/api/Order.ts
import { http } from '@/utils/http'

export function orderList(query?: Record<string, any>) {
  return http.get<PageResult<OrderItem>>('/api/xxx/list', query)
}

export function orderInfo(id: string | number) {
  return http.get<OrderDetail>('/api/xxx/detail?id=' + id)
}
```

### 6.2 页面调用

```ts
const data = await orderList({ pageNum: 1, pageSize: 10 })
// 分页结构：{ rows, total }
list.value = data.rows
total.value = data.total
```

### 6.3 请求封装的能力

`src/utils/http.ts` 提供（`T` 为返回数据类型）：

```ts
http.get<T>(url, query?, getFileTag?, completeResTag?, timeout?, timeoutHandleTag?)
http.post<T>(url, data?, query?, timeout?)
http.del<T>(url, data?, query?)
http.upload(filePath, url?, name?, timeout?)
```

**多数场景只需前两个参数**：

```ts
const list = await http.get<PageResult<Item>>('/api/xxx/list', { pageNum: 1 })
const ret  = await http.post<{ id: string }>('/api/xxx/add', { name: 'test' })
await http.del('/api/xxx/delete?id=' + id)
```

**自动处理**：baseURL 拼接、token 注入（`Authorization` 头）、业务码判断（200-299 视为成功）、错误 toast、国密加解密。

> `http.put` 是 `httpPost` 的别名，底层不区分 PUT 语义。

---

## 7 静态资源（重要：不要写死在 SCSS）

**问题**：SCSS 读不到环境变量。用 `additionalData` 注入 `$ossBase` 只在 `.vue` 的 `<style>` 生效，**独立 `.scss` 会报 `Undefined variable`**。

**正确做法**：统一走 `ossUrl()`，背景图写在模板内联 style。

```ts
import { ossUrl } from '@/utils/base'

// TS
const icon = ossUrl('/weapp/mine/icon.png')
```

```vue
<!-- 模板绑定 -->
<image :src="ossUrl('/weapp/mine/icon.png')" />

<!-- 背景图：写在 :style 上，不要写进 .scss -->
<view :style="{ 'background-image': `url(${ossUrl('/weapp/bg.png')})` }" />
```

`VITE_APP_OSS_BASE` 为空时 `ossUrl()` 返回空串（图片不显示）。

**特性**：传完整 URL（`http://` / `https://` 开头）时**原样返回、不拼接**，可安全用于「接口返回的绝对地址」；传相对路径时才拼 OSS 根地址。

---

## 8 登录与跳过登录

### 正常流程

`UserManager.checkLoginFunc()` → 无 token 则 `weappLogin()` → `uni.login` 取 code → 后端换 token → 存 store。

### 跳过登录（调试用）

```bash
# env/.env.local
VITE_APP_SKIP_LOGIN = 'true'
```

开启后：
- `checkLoginFunc()` 直接放行，不调后端登录接口
- 所有接口错误**静默处理**：不弹 toast、不打红字，失败按空数据 resolve
- 底面菜单（tabBar）正常显示

**适用**：后端未就绪 / appid 与后端绑定的小程序不一致 / 截图演示。

> 注意：跳过登录后**页面数据是空的**（接口调不通），这是预期行为。

---

## 9 tabBar 说明（自实现，不是 pages.json）

**本项目没有用原生 tabBar**，`pages.json` 里没有 `tabBar` 配置。

底部菜单是组件：`src/pages/home/components/HomeIndexTabBar.vue`

渲染逻辑在 `src/pages/home/HomeIndex.vue`：按 `curTabBarName` 用 `v-if` 切换 5 个页面组件。

```
IndexHome   → src/pages/IndexHome/IndexHome.vue        真实首页
IndexMenu2  → src/pages/IndexMenu2/IndexMenu2.vue      ⚠️ 占位页
IndexMenu3  → src/pages/IndexMenu3/IndexMenu3.vue      ⚠️ 占位页
IndexMenu4  → src/pages/IndexMenu4/IndexMenu4.vue      ⚠️ 占位页
IndexMine   → src/pages/IndexMine/IndexMine.vue        真实「我的」页
```

**改 tabBar**：改 `HomeIndexTabBar.vue` 的 `tabList`（label / svg 图标名），图标放 `src/static/svg/tab/`，命名 `<name>_on.png` / `<name>_off.png`。

**增删 tab**：同步改 `tabList` 与 `HomeIndex.vue` 的 `v-if` 分支。**直接删 `IndexMenuX.vue` 会导致对应 tab 白屏。**

---

## 10 典型错误对照（AI 最容易犯）

| 错误写法 | 正确写法 | 原因 |
| --- | --- | --- |
| `background-image: url('#{$ossBase}/bg.png')` 写在 `.scss` | 写在模板 `:style` 用 `ossUrl()` | SCSS 读不到环境变量，构建报 `Undefined variable` |
| 手写 `pages.json` 加路由 | 建 `.vue` 文件即可（主包）；分包在 `vite.config.ts` 声明 | 路由自动生成，手改会被覆盖 |
| 在 `pages.json` 配 `tabBar` | 改 `HomeIndexTabBar.vue` 的 `tabList` | 本项目 tabBar 是自实现组件 |
| 用 `wd-*` / `z-paging` 组件 | 用 `ljs-*` 或 uni-app 原生组件 | 这两个包依赖里没有，`easycom` 也已移除解析配置，用了会报找不到组件 |
| `npm install` / `yarn` | `pnpm install` | `preinstall` 有 `only-allowed pnpm` 拦截 |
| 改 env 后直接热更新 | 重启 dev 进程 + 清 `dist/dev` | env 启动时读入，热更新不重读 |
| 在 `dev` 目录看到旧代码却跑了 `build` | 确认打开的是 `dist/dev` 还是 `dist/build` | 两个产物目录独立 |
| 直接引 `import http from 'ljs-sdk'` | `import { http } from '@/utils/http'` | 项目用自己的封装，不走 sdk 的 request |

---

## 11 已知限制与坑

| 项 | 说明 |
| --- | --- |
| **`wd-*` / `z-paging` 不可用** | 原 unibest 模板的 UI 库已移除（依赖缺失、`easycom` 配置已删），写页面**不要用** |
| **占位页** | `IndexMenu2/3/4` 内容只有「菜单2/3/4」，是新项目要替换的 |
| **业务接口** | 示例接口指向具体业务（积分商城等），接自己后端需替换 |
| **`BusinessIds.ts`** | 里的 ID 是示例占位，需替换为你后端的真实 ID |
| **国密** | 登录接口收到密钥对且 `PUBLIC_SM_CRYPTO` 开启才做加解密 |
| **TypeScript** | 类型检查 `pnpm type-check`（vue-tsc），当前 0 错误 |
| **无单测** | 仓库无单元测试，改动靠类型检查 + 手工验证 |

---

## 12 让 AI 一次写对的检查清单

写页面前：

- [ ] 确认是主包（`src/pages/`）还是分包（`pages-mine/` / `pages-other/`）
- [ ] 分包需在 `vite.config.ts` 的 `subPackages` 里已有声明
- [ ] 接口定义放 `src/*/api/` 下，用 `http.get/post`
- [ ] 图片用 `ossUrl()`，**背景图写 `:style` 不写 `.scss`**
- [ ] 组件用 `ljs-*` 或 uni-app 原生，**不用 `wd-*`**
- [ ] 工具方法用 `proxy.$LJS*`，先 `getCurrentInstance()`
- [ ] 页面级配置写 `<route>` 块
- [ ] 改完跑 `pnpm type-check`

---

## 13 相关资源

| 资源 | 地址 |
| --- | --- |
| 本仓库 | https://github.com/LJS-Y/ljs-mini-program |
| Web 框架 | https://github.com/LJS-Y/ljs-vue3 |
| 工具库（私有）| https://github.com/LJS-Y/LJSTools |
| 脚手架 | https://github.com/LJS-Y/create-ljs |
| 工程底座 | https://github.com/codercup/unibest |
