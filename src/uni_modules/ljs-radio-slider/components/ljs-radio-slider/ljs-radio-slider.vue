<template>
	<view
		class="ljs-radio-slider-vue3"
		:style="{
			'background': valueTag ? bgColor[0] : bgColor[1],
			height: checkNum(height) ? `${height}rpx` : height,
			'border-radius': checkNum(height) ? `${Number(height) / 2}rpx` : `calc(${height} / 2)`,
		}"
		@click="sliderClick">
		<view class="ljs-radio-slider-vue3-text" :class="{
			'ljs-radio-slider-vue3-left': valueTag,
			'ljs-radio-slider-vue3-right': !valueTag,
		}"
		:style="{
			color: valueTag ? fontColor[0] : fontColor[1],
			'line-height': checkNum(height) ? `${height}rpx` : height,
			'font-size': checkNum(fontSize) ? `${fontSize}rpx` : fontSize,
			width: `${textMaxLength * fontSize + padding * 2}rpx`,
		}">{{ valueTag ? texts[0] : texts[1] }}</view>
		<view class="ljs-radio-slider-vue3-bar" :class="{
			'ljs-radio-slider-vue3-left': !valueTag,
			'ljs-radio-slider-vue3-right': valueTag,
		}" :style="{
			background: barColor,
			'box-shadow': barShadow,
			width: checkNum(height) ? `${height - margin * 2}rpx` : `calc(${height} - ${margin} * 2rpx)`,
			height: checkNum(height) ? `${height - margin * 2}rpx` : `calc(${height} - ${margin} * 2rpx)`,
			margin: `${margin}rpx`,
		}"></view>
	</view>
</template>

<script>
	import index from './index.js'
	export default index
</script>

<style lang="scss" scoped>
	@import "./index.scss";
</style>
