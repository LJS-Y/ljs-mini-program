<template>
  <view class="frame">
    <slot></slot>
  </view>
  <Loading v-if="loading.open" :text="loading.text" />
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import Loading from '@/components/loading/Loading.vue'

const timer = ref(null)
const loading = computed(() => {
  const tag = useUserStore().comWineState
  if (tag.open) {
    timer.value = setTimeout(() => {
      useUserStore().setComLoadingState({
        open: false,
      })
    }, 1000 * 10)
  } else {
    if (timer.value !== null) {
      clearTimeout(timer.value)
    }
  }
  return tag
})

onLoad(() => {})
</script>
<style scoped lang="scss">
.frame {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100vh;
  background-color: transparent;
}
</style>
