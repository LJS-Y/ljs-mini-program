<template>
	<view class="ljs-xf-dialog-vue3" v-if="modelValue" :style="{
			'background-color': shadeBackground,
			'z-index': zIndex,
		}" @click.stop="shadeClose ? close() : () => {}">
		<view @click.stop :animation="animationData" class="ljs-xf-dialog-vue3-box" :style="{
				width: absorbType === 'top' || absorbType === 'bottom' ? width : height,
				height: absorbType === 'top' || absorbType === 'bottom' ? height : width,
				'background': background,
				top: absorbType === 'top' ? '0' : 'auto',
				bottom: absorbType === 'bottom' ? '0' : 'auto',
				left: absorbType === 'left' ? '0' : 'auto',
				right: absorbType === 'right' ? '0' : 'auto',
				'border-radius':
					absorbType === 'top' ? '0 0 ' + borderRadius +'rpx ' + borderRadius +'rpx' : 
					absorbType === 'bottom' ? '' + borderRadius +'rpx ' + borderRadius +'rpx 0 0' : 
					absorbType === 'left' ? '0 ' + borderRadius +'rpx ' + borderRadius +'rpx 0' : 
					absorbType === 'right' ? '' + borderRadius +'rpx 0 0 ' + borderRadius +'rpx' : '',
			}">
			<view class="ljs-xf-dialog-vue3-title" v-if="headerShow" :style="{
				height: titleHeight + 'rpx',
				'line-height': titleHeight + 'rpx',
				'text-align': titleAlign,
				'font-weight': titleFontWeight,
				'font-size': `${titleFontSize}rpx`,
			}">
				{{ title }}
				<image @click.stop="close" class="ljs-xf-dialog-vue3-close" :src="closeImg" v-if="closeButShow" :style="{
					top: ((titleHeight - 90) / 2) + 'rpx',
				}"></image>
			</view>
			<view class="ljs-xf-dialog-vue3-content" ref="content" :style="{
					height: headerShow ? 'calc(100% - '+titleHeight+'rpx)' : '100%',
				}">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	import index from './index.js';
	export default index;
</script>

<style lang="scss" scoped>
	@import "./index.scss";
</style>