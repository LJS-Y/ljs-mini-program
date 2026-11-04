# 简介
ljs-radio-slider，radio滑块组件。可灵活自定义滑块样式。

### 使用 uni_modules 安装（推荐）
使用 uni_modules 方式安装组件库，可以直接通过插件市场导入，通过右键菜单快速更新组件，不需要引用、注册，直接在页面中使用 ljs-radio-slider组件。

### 主参数

 参数  | 类型| 必填项 | 默认值 | 说明
 ---- | ----- | ------ | ------  | ------ 
 v-model | Boolean, String, Number | √ |  | 滑块值
 height | String, Number | × | 38 | 高度，Number类型单位为rpx。
 fontSize | String, Number | × | 22 | 字号，Number类型单位为rpx。
 margin | Number | × | 4 | 圆点于边界的距离，单位为rpx。
 padding | Number | × | 10 | 文字左右两边的空间距离，单位为rpx。
 texts | Array | × | ['是', '否'] | 文字，v-model是true时使用索引0，为false时使用索引1。
 bgColor | Array | × | ['#2350DF', '#F7F6FC'] | 背景颜色，v-model是true时使用索引0，为false时使用索引1。
 fontColor | Array | × | ['#FFF', '#333'] | 文字颜色，v-model是true时使用索引0，为false时使用索引1。
 valueTypes | Array | × | [true, false] | value的值的数组，v-model需于valueTypes对应类型。
 barColor | String | × | #FFF | bar的颜色。
 barShadow | String | × | 0 0 2upx 3upx rgba(0, 0, 0, .1) | bar的阴影。
 radioClick | Function | × | | radio点击事件。状态变更前的控制函数，返回true状态可正常切换，返回false则阻止切换状态。

### 方法

参数  | 类型| 解释
---- | ----- | :------ 
@radioChange(oldValue, newValue) | 点击回调 | oldValue为点击前的值，newValue为点击后的值。
 
### 快速应用

###### 示例1
```vue
<ljs-radio-slider
	v-model="tag"
	height="68"
	fontSize="42"
	:margin="10"
	:padding="20"
	@radioChange="radioChange">
</ljs-radio-slider>
```
```js
export default {
	data() {
		return {
			tag: true,
		}
	},
	watch: {
		tag: {
			handler(val) {
				console.log(this.tag);
			},
			deep: true,
			immediate: true
		}
	},
	onLoad() {
	},
	methods: {
		radioChange(oldValue, newValue) {
			console.log(oldValue, newValue);
		},
	}
}
```

# 贡献代码
龙九山。有任何问题，请在平台留言，在手头宽裕得情况下，我会尽快修复问题。

---

# 方便您的同时，请五星、收藏，让好的东西照亮更多深渊中负重前行的代码人。
# 创作不易，在您方便之际，赞赏作者，我们会更有动力继续下去。
