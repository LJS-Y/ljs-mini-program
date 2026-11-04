export default {
	data() {
		return {
			useData: [],
			allWidth: 0, // 组件可滚动总宽度
			listBoxHeight: 0, // 组件高度
			activeIndex: this.initActiveIndex,
			useOpts: {
				fontColor: '#333', // 字体颜色
				fontActiveColor: '#5c70fe', // 选中字体颜色
				lineActiveColor: '#5c70fe', // 选中线颜色
				lineImg: null, // 选中线的图片
				lineBorderRadius: '0rpx', // 选中线的圆角
				fontSize: '28rpx', // 字体大小
				fontActiveSize: '28rpx', // 选中字体大小
				fontActiveWeight: 400, // 选中字体粗细
				itemPadding: '20rpx 30rpx', // 项的padding值
				lineWidth: '40rpx', // 下滑线宽度
				lineHeight: '4rpx', // 下滑线高度
				lineHeightDefault: '30rpx', // 文字tab时默认的行高
			},
		}
	},
	props: {
		// 数据
		data: Array,
		// 是否显示选中条
		activeShow: {
			type: Boolean,
			default: true
		},
		// 初始选中的项索引值
		initActiveIndex: {
			type: Number,
			default: 0
		},
		// 小于等于多少处理为一屏，超过则滚动。可为0，此时为超过则滚动，未超过自动排列。
		limit: {
			type: Number,
			default: 6
		},
		// opts参数
		opts: {
			type: Object,
			default: () => {
				return {};
			}
		},
	},
	watch: {
		data: {
			handler(val) {
				if (this.data.length > 0) {
					this.initOpts();
					this.initData();
				}
			},
			deep: true,
			immediate: true,
		},
		opts: {
			handler(val) {
				this.initOpts();
			},
			deep: true,
		},
		initActiveIndex: {
			handler(val) {
				this.activeIndex = this.initActiveIndex;
			},
			immediate: true,
		},
	},
	async mounted() {
	},
	methods: {
		async clickItem(row, index) {
			this.activeIndex = index;
			this.$emit('clickItem', row, index);
			await this.$nextTick();
			this.calcDomWH();
		},
		initOpts() {
			for (let key in this.opts) {
				this.useOpts[key] = this.opts[key];
			}
			// fontSize存在，fontActiveSize不存在时需要同步fontSize到fontActiveSize；
			if (('fontSize' in this.opts) && !('fontActiveSize' in this.opts)) {
				this.useOpts['fontActiveSize'] = this.opts['fontSize'];
			}
		},
		async initData() {
			this.useData = JSON.parse(JSON.stringify(this.data));
			await this.$nextTick();
			this.calcDomWH();
		},
		calcDomWH() {
			setTimeout(() => {
				// #ifdef MP || APP
				if (this.useData.length <= this.limit) {
					uni.createSelectorQuery().in(this)
					  .select("#listBox")
					  .boundingClientRect((data) => {
						this.allWidth = data.width;
						this.listBoxHeight = data.height
					  })
					  .exec();
				} else {
					let allWidth = 0;
					this.useData.forEach((item, i) => {
						uni.createSelectorQuery().in(this).select('#ljs-tabs-' + i).boundingClientRect((data) => {
							const width = data.width;
							item.width = width;
							if (this.activeIndex === i || (this.activeIndex === null && i === 0)) {
								// 获取高度
								this.listBoxHeight = data.height;
							}
							if (i === 0) {
								item.left = `calc(${width / 2}px - ${this.useOpts.lineWidth} / 2)`;
							} else {
								item.left = `calc(${allWidth - this.useData[0].width / 2 + width / 2}px)`;
							}
							allWidth += width;
							if (i === this.useData.length - 1) {
								this.allWidth = allWidth;
							}
						  })
						  .exec();
					});
				}
				// #endif
				// #ifdef H5
				if (this.useData.length <= this.limit) {
					this.allWidth = this.$refs.listBox.$el.offsetWidth;
					this.listBoxHeight = this.$refs.listBox.$el.offsetHeight
				} else {
					this.allWidth = 0;
					this.useData.forEach((item, i) => {
						// const width = this.$refs['ljs-tabs-' + i][0].$el.offsetWidth;
						// offsetWidth获取的像素值不包括小数位，问题处理
						const el = this.$refs['ljs-tabs-' + i][0].$el;
						const style = window.getComputedStyle(el);
						const width = Math.ceil(parseFloat(style.width) * 100) / 100; // 转换为数字，并可能包含小数
						item.width = width;
						if (this.activeIndex === i || (this.activeIndex === null && i === 0)) {
							// 获取高度
							const height = Math.ceil(parseFloat(style.height) * 100) / 100;
							this.listBoxHeight = height;
						}
						if (i === 0) {
							// 索引0时的偏移
							item.left = `calc(${width / 2}px - ${this.useOpts.lineWidth} / 2)`;
						} else {
							item.left = `calc(${this.allWidth - this.useData[0].width / 2 + width / 2}px)`;
						}
						this.allWidth += width;
					});
				}
				// #endif
			}, 0)
		}
	}
}