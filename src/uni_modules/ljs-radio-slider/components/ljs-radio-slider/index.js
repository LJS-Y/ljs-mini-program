export default {
	data() {
		return {
			textMaxLength: 0,
			valueTag: null,
		}
	},
	props: {
		modelValue: [Boolean, String, Number],
		// 高度，Number类型单位为rpx
		height: {
			type: [String, Number],
			default: 38,
		},
		// 字号，Number类型单位为rpx
		fontSize: {
			type: [String, Number],
			default: 22,
		},
		// 圆点于边界的距离，单位为rpx
		margin: {
			type: Number,
			default: 4,
		},
		// 文字左右两边的空间距离，单位为rpx
		padding: {
			type: Number,
			default: 10,
		},
		// 文字，v-model是true时使用索引0，为false时使用索引1
		texts: {
			type: Array,
			default: ['是', '否'],
		},
		// 背景颜色，v-model是true时使用索引0，为false时使用索引1
		bgColor: {
			type: Array,
			default: ['#2350DF', '#F7F6FC'],
		},
		// 文字颜色，v-model是true时使用索引0，为false时使用索引1
		fontColor: {
			type: Array,
			default: ['#FFF', '#333'],
		},
		// value的值的数组，v-model需于valueTypes对应类型
		valueTypes: {
			type: Array,
			default: [true, false],
		},
		// bar的颜色
		barColor: {
			type: String,
			default: '#FFF',
		},
		// bar的阴影
		barShadow: {
			type: String,
			default: '0 0 2upx 3upx rgba(0, 0, 0, .1)',
		},
		// radio点击事件。状态变更前的控制函数，返回true状态可正常切换，返回false则阻止切换状态
		radioClick: {
			type: Function,
			default: () => {
				return () => {
					return true
				}
			},
		},
	},
	watch: {
		modelValue: {
			handler(val) {
				if (Object.prototype.toString.call(this.modelValue) !== '[object Boolean]') {
					this.valueTag = this.valueTypes.indexOf(this.modelValue) === 0 ? true : false;
				} else {
					this.valueTag = this.modelValue;
				}
			},
			immediate: true,
		},
	},
	async mounted() {
		this.textMaxLength = this.texts[0].length > this.texts[1].length ? this.texts[0].length : this.texts[1].length;
	},
	methods: {
		async sliderClick() {
			if (!await this.radioClick()) {
				console.warn('阻止切换');
				return
			}
			const oldValue = this.valueTag ? this.valueTypes[0] : this.valueTypes[1];
			this.valueTag = !this.valueTag;
			const newValue = this.valueTag ? this.valueTypes[0] : this.valueTypes[1];
			this.$emit('update:modelValue', this.valueTag ? this.valueTypes[0] : this.valueTypes[1]);
			this.$emit('radioChange', oldValue, newValue);
		},
		
		checkNum (value) {
		  const type = typeof value;
		  if (type === 'number' || (type === 'string' && !isNaN(Number(value, 10)))) {
		    return true;
		  }
		  return false;
		}
	}
}