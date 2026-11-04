# 简介
ljs-tabs-vue3，tabs组件。可自定义tab样式及内部展示元素。

### 使用 uni_modules 安装（推荐）
使用 uni_modules 方式安装组件库，可以直接通过插件市场导入，通过右键菜单快速更新组件，不需要引用、注册，直接在页面中使用 ljs-tabs-vue3组件。

### 主参数

 参数  | 类型| 必填项 | 默认值 | 说明
 ---- | ----- | ------ | ------  | ------ 
 data | Array | √ |  | 数据
 activeShow | Boolean | × | true | 是否显示选中下划线。
 initActiveIndex | Number | × | 0 | 初始选中的项索引值。
 limit | Number | × | 6 | 小于等于多少处理为一屏，超过则滚动。可为0，此时为超过则滚动，未超过自动排列。
 opts | Object | × |  | 菜单样式参数
 
### opts参数

 参数  | 类型| 必填项 | 默认值 | 说明
 ---- | ----- | ------ | ------  | ------ 
 fontColor | String | × | #333 | 字体颜色。
 fontActiveColor | String | × | #5c70fe | 选中字体颜色。
 fontSize | String | × | 20rpx | 字体大小。
 fontActiveSize | String | × | 28rpx | 选中字体大小。fontSize存在，fontActiveSize不存在时，会自动同步fontSize到fontActiveSize，小程序会有轻微的抖动，谨慎使用。
 fontActiveWeight | Number | × | 400 | 选中字体粗细。
 lineWidth | String | × | 40rpx | 下滑线宽度。
 lineHeight | String | × | 4rpx | 下滑线高度。
 lineActiveColor | String | × | #5c70fe | 选中线颜色。
 lineBorderRadius | String | × | 0rpx | 选中线的圆角。
 lineImg | String | × | null | 选中线的图片。如果传值，则使用图片，宽高按照lineWidth、lineHeight显示。
 lineHeightDefault | String | × | 30rpx | 文字tab时默认的行高。
 itemPadding | String | × | 20rpx 30rpx | 项的padding值。
 
### 方法

参数  | 类型| 解释
---- | ----- | :------ 
@clickItem(row, index) | 点击回调 | row所点击的对象，index为所点击的对象的索引。
 
### 插槽default

 参数  | 类型| 说明
 ---- | ----- | ------
 row | Object | 所点击的对象。
 index | Number | 当前项的索引值。
 activeIndex | Number | 选中项的索引值。
 
### 快速应用

###### 示例1
```vue
<ljs-tabs-vue3
	:data="data"
	:opts="{
		fontActiveColor: 'red',
	}"
	@clickItem="clickItem">
	<template #default="{row}">
		<view class="item">
			<view class="title">{{ row.title }}</view>
		</view>
	</template>
</ljs-tabs-vue3>
```
```js
export default {
	data() {
		return {
			data: [
				{
					title: '关注',
				},
				{
					title: '推荐',
				},
				{
					title: '科技',
				},
				{
					title: '音乐',
				},
				{
					title: '美食',
				},
				{
					title: '文化',
				},
				{
					title: '经济',
				},
				{
					title: '体育',
				},
				{
					title: '娱乐',
				},
			]
		},
		methods: {
			clickItem(row, index) {
				console.log('点击', row, index);
			},
		}
	}
}
```

###### 示例2
```vue
<ljs-tabs-vue3
	:data="data"
	:opts="{
		fontActiveColor: 'red',
	}"
	@clickItem="clickItem">
	<template #default="{row}">
		<view class="item">
			<view class="title">{{ row.title }}</view>
			<view class="num" v-if="scope.row.num > 0">{{ scope.row.num }}</view>
		</view>
	</template>
</ljs-tabs-vue3>
```
```js
export default {
	data() {
		return {
			data: [
				{
					title: '关注',
					num: 0,
				},
				{
					title: '推荐',
					num: 9,
				},
				{
					title: '科技',
					num: 0,
				},
				{
					title: '音乐',
					num: 0,
				},
				{
					title: '美食',
					num: 0,
				},
				{
					title: '文化',
					num: 0,
				},
			]
		},
		methods: {
			clickItem(row, index) {
				console.log('点击', row, index);
			},
		}
	}
}
```
```css
.item{
	display: flex;
	align-items: center;
	justify-content: center;
	.num{
		width: 30upx;
		height: 30upx;
		background-color: red;
		border-radius: 50%;
		color: #FFF;
		font-size: 20upx;
		margin-left: 6upx;
	}
}
```

# 贡献代码
龙九山。有任何问题，请在平台留言，在手头宽裕得情况下，我会尽快修复问题。

---

# 方便您的同时，请五星、收藏，让好的东西照亮更多深渊中负重前行的代码人。
# 创作不易，在您方便之际，赞赏作者，我们会更有动力继续下去。
