<script setup lang="ts">
import { useUserStore } from '@/store'
defineOptions({
  name: 'HomeIndexTabBar',
})

const props = defineProps({
  value: {
    type: String,
    required: false,
  },
})

const parseClass = computed(() => {
  return (label: string) => {
    return props.value === label ? `active` : ''
  }
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const safeBottom = computed(() => {
  return {
    bottom: `${safeAreaInsets.bottom + 10}rpx`,
  }
})
/**
 * 底部 tabBar 配置
 * 自实现 tabBar，非 pages.json 原生
 * 渲染见 HomeIndex.vue 的 v-if 切换
 * 增减 tab 需同步改 HomeIndex.vue
 */
const tabList = ref([
  {
    label: '首页',
    curTabBarName: 'IndexHome',
    svg: 'index',
  },
  {
    label: '菜单2',
    curTabBarName: 'IndexMenu2',
    svg: 'IndexMenu2',
  },
  {
    label: '菜单3',
    curTabBarName: 'IndexMenu3',
    svg: 'IndexMenu3',
  },
  {
    label: '菜单4',
    curTabBarName: 'IndexMenu4',
    svg: 'IndexMenu4',
  },
  {
    label: '我',
    curTabBarName: 'IndexMine',
    svg: 'mine',
  },
])

onMounted(async () => {})

const emit = defineEmits(['update:value'])

function onClick(curTabBarName: string) {
  emit('update:value', curTabBarName)
}
</script>

<template>
  <view class="bar" :style="safeBottom">
    <view class="nav shadow-2xl">
      <view class="tab-box">
        <view
          v-for="(tab, i) in tabList"
          :key="i"
          class="tab-item"
          :class="parseClass(tab.curTabBarName)"
          @click="onClick(tab.curTabBarName)"
        >
          <view class="tab-item-content">
            <view class="tab-icon">
              <image v-show="tab.curTabBarName !== value" :src="'/static/svg/tab/' + tab.svg + '_off.png'" />
              <image v-show="tab.curTabBarName === value" :src="'/static/svg/tab/' + tab.svg + '_on.png'" />
              <!-- <text class="but iconfont icon-shanchu3"></text> -->
            </view>
            <text class="tab-text" v-show="tab.curTabBarName !== value">{{ tab.label }}</text>
          </view>
        </view>

        <view
          class="indicator"
          :style="{
            width: `calc(${(1 / tabList.length) * 100}% - 20rpx)`,
          }"
        ></view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.bar {
  position: fixed;
  z-index: 2000;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  .nav {
    /* 对导航栏位置进行定位处理，方便后续的图标位置的设置 */
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 670rpx;
    height: 112rpx;
    background: #ffffff;
    border-radius: 56px;
    .tab-box {
      box-sizing: border-box;
      display: flex;
      width: 100%;
      height: 112rpx;
      .tab-item {
        position: relative;
        z-index: 2;
        box-sizing: border-box;
        display: flex;
        flex: 1;
        justify-content: center;
        height: 112rpx;
        .tab-item-content {
          /* 进行定位，使之通过tab-item-content元素带动矢量图标进行水平垂直到中心位置 */
          position: relative;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 120rpx;
          height: 112rpx;
          border-radius: 50%;
          /* 设置动画过度事件以及延迟 */
          transition: 0.5s;
          transition-delay: 0s;

          &::before {
            position: absolute;
            top: 10px;
            left: 0;
            width: 100%;
            height: 100%;
            content: '';
            filter: blur(40px);
            border-radius: 50%;
            opacity: 0;
            transition: 0.5s;
            transition-delay: 0s;
          }

          &::before {
            color: black;
            opacity: 0.5;
            transition-delay: 0.25s;
          }

          .tab-icon {
            width: 48rpx;
            height: 48rpx;
          }
          .tab-text {
            margin-top: 4rpx;
            font-size: 20rpx;
            line-height: 28rpx;
            color: #59618c;
          }
          /* 下面是针对选中效果做的样式处理 */
          //.tab-item.active .tab-item-content .tab-icon {
          //transform: translateY(-10rpx) scaleX(1.1) scaleY(1.1);
          //}
          /* 这里将i元素设置的颜色显示出来 这两个样式块中都使用了 background: var(--clr); 属性，可以将背景颜色设置为
 --clr 变量所表示的值。这种使用自定义变量的方式，可以在代码中统一定义颜色值，以便在需要时进行统一更改。*/
          /* 背景圆设置 */
          //.indicator {
          //  /* 这里进行了定位，并且设置了背景圆的位置，同时将圆的背景颜色与背景颜色设为一致，会形成那种向下突兀的圆形，并且加入了动画 */
          //  position: absolute;
          //  top: -65rpx;
          //  left: 70rpx;
          //  z-index: 1;
          //  width: 160rpx;
          //  height: 160rpx;
          //  background: #eeeeee;
          //  border-radius: 50%;
          //  transition: 0.5s;
          //}
        }
        /* 下面是针对选中效果做的样式处理 */
        &.active {
          .tab-item-content {
            //color: white;
            color: white;
            /* 设置了一开始的背景颜色，后面会被取代，设置了点击的时候会向上移动 */
            transition-delay: 0.25s;
            //transform: translateY(-27px);
            .tab-icon {
              transform: scale(1.2, 1.2);
            }
          }
          /* 设置平移 */
          &:nth-child(1).active ~ .indicator {
            transform: translateX(calc(134rpx * 0));
            //animation: moveAndSquash1 0.5s forwards;
          }

          &:nth-child(2).active ~ .indicator {
            transform: translateX(calc(134rpx * 1));
            //animation: moveAndSquash2 0.5s forwards;
          }

          &:nth-child(3).active ~ .indicator {
            transform: translateX(calc(134rpx * 2));
            //animation: moveAndSquash2 0.5s forwards;
          }

          &:nth-child(4).active ~ .indicator {
            transform: translateX(calc(134rpx * 3));
            //animation: moveAndSquash2 0.5s forwards;
          }

          &:nth-child(5).active ~ .indicator {
            transform: translateX(calc(134rpx * 4));
            //animation: moveAndSquash2 0.5s forwards;
          }
        }
      }
      /* 背景圆设置 */
      .indicator {
        /* 这里进行了定位，并且设置了背景圆的位置，同时将圆的背景颜色与背景颜色设为一致，会形成那种向下突兀的圆形，并且加入了动画 */
        position: absolute;
        top: 10rpx;
        left: 10rpx;
        z-index: 1;
        width: 114rpx;
        height: 92rpx;
        background: #872846;
        border-radius: 46rpx;
        transition: 0.5s;
      }
    }
  }
}
</style>
