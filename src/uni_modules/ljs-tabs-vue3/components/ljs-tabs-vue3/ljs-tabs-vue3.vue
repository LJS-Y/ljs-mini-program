<template>
	<view class="ljs-tabs-vue3-hidden-scrollBar" :style="{
		height: listBoxHeight + 'px'
	}">
		<view class="ljs-tabs-vue3">
			<view class="ljs-tabs-listBox" ref="listBox" id="listBox"
				:style="{
					'display': useData.length <= limit ? 'flex' : 'inherit',
					width: useData.length <= limit ? '100%' : allWidth + 'px',
				}">
				<view
					v-for="(item, i) in useData"
					:key="'ljs-tabs-' + i"
					:ref="'ljs-tabs-' + i"
					:id="'ljs-tabs-' + i"
					class="ljs-tabs-listBox-item"
					:style="{
						'line-height': useOpts.lineHeightDefault,
						'color': activeIndex === i ? useOpts.fontActiveColor : useOpts.fontColor,
						fontSize: activeIndex === i ? useOpts.fontActiveSize : useOpts.fontSize,
						fontWeight: activeIndex === i ? useOpts.fontActiveWeight : 400,
						'padding': useOpts.itemPadding,
						'width': useData.length <= limit ? 'calc(100% / '+useData.length+')' : 'auto',
					}"
					@click="clickItem(item, i)">
					<slot :row="item" :activeIndex="activeIndex" :index="i"></slot>
				</view>
				<view class="ljs-tabs-listBox-line"
					v-if="activeShow"
					:style="{
						'background-color': useOpts.lineImg === null ? useOpts.lineActiveColor : 'none',
						'border-radius': useOpts.lineBorderRadius,
						width: useOpts.lineWidth,
						height: useOpts.lineHeight,
						left: useData.length <= limit ? `calc((${allWidth}px / ${useData.length} - ${useOpts.lineWidth}) / 2)` : `${useData[0].left}`,
						transform: useData.length <= limit ? `translateX(calc(${allWidth}px / ${useData.length} * ${activeIndex}))` : `translateX(${activeIndex === 0 ? '0px' : useData[activeIndex].left})`,
					}">
					<image class="img" :src="useOpts.lineImg"></image>
				</view>																							<!-- (${useData[activeIndex - 1].width / 2}px) + (${useData[activeIndex].width / 2}px) -->
			</view>
		</view>
	</view>
</template>

<script>
	import index from './index.js'
	export default index
</script>

<style lang="scss" scoped>
	@import "./index.scss";
</style>
