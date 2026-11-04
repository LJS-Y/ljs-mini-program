import icon_close from './images/close.png';
export default {
	name: 'ljs-xf-dialog-vue3',
	props: {
		modelValue: Boolean,
		// 弹窗标题。headerShow为true时有效。
		title: String,
		// 弹窗标题栏高度，单位upx。默认90，最小为90。headerShow为true时有效。
		setTitleHeight: {
			type: Number,
			default: 90,
		},
		// 标题位置
		titleAlign: {
			type: String,
			default: 'left',
		},
		// 标题字体大小，单位rpx
		titleFontSize: {
			type: Number,
			default: 28,
		},
		// 标题字重
		titleFontWeight: {
			type: Number,
			default: 600,
		},
		// 吸附方式。默认为bottom。方式：top, bottom, left, right。
		absorbType: {
			type: String,
			default: 'bottom',
		},
		// 弹窗宽度。absorbType为top、bottom时，此值为宽；absorbType为left、right时，此值为高。
		width: {
			type: String,
			default: '100%',
		},
		// 弹窗高度。absorbType为top、bottom时，此值为高；absorbType为left、right时，此值为宽。
		height: {
			type: String,
			default: '60%',
		},
		// 裸露圆角值
		borderRadius: {
			type: Number,
			default: 20,
		},
		// 弹框背景
		background: {
			type: String,
			default: '#FFF',
		},
		// 遮罩背景
		shadeBackground: {
			type: String,
			default: 'rgba(0, 0, 0, .6)',
		},
		// 点击遮罩是否关闭弹窗
		shadeClose: {
			type: Boolean,
			default: true,
		},
		// z-index
		zIndex: {
			type: [Number, String],
			default: 100,
		},
		// 是否显示头部区域
		headerShow: {
			type: Boolean,
			default: true,
		},
		// 是否显示关闭按钮
		closeButShow: {
			type: Boolean,
			default: true,
		},
		// 关闭按钮图片
		closeImg: {
			type: String,
			default: icon_close,
		},
	},
	data() {
		return {
			box_h: 'auto',
			overflow_y: 'auto',
			contentH: 'auto',
			contentMaxH: 'auto',
			titleHeight: 90,
			animation: null,
			animationData: {},
		};
	},
	watch: {
		modelValue: {
			handler(val) {
				if (this.modelValue) {
					this.init();
				}
			},
			deep: true,
			immediate: true
		}
	},
	created() {},
	methods: {
		init() {
			if (this.setTitleHeight > 90) {
				this.titleHeight = this.setTitleHeight;
			}
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.ljs-xf-dialog-vue3-box').boundingClientRect(data => {
					if (data) {
						const real_h = data.height;
						const win_h = uni.getWindowInfo().screenHeight;
						let box_h = win_h;
						if (box_h > real_h) {
							box_h = real_h;
							this.overflow_y = 'hidden';
						}
						this.box_h = box_h + 'px';
						this.rotateAndScale();
					}
				}).exec();
			});
		},
		close() {
			this.$emit('closeBefore');
			this.$emit('update:modelValue', false);
			setTimeout(() => {
				this.$emit('closeAfter');
			}, 0)
		},
		rotateAndScale() {
			this.animation = uni.createAnimation({
				duration: 300,
				timingFunction: 'ease',
			})
			// 旋转同时放大
			this.animation.opacity(1).step()
			this.animationData = this.animation.export()
		},
	}
};