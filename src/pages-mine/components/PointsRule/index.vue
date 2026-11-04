<script setup lang="ts">
import { ruleInstructions } from '@/api/commonApi'

const ruleInfo = ref(null)
function getpointsRule() {
  ruleInstructions({
    type: '签到规则',
  }).then((data) => {
    data.content = data.content.replace(/<p/g, '<p class="p"').replace(/<span/g, '<span class="span"').replace(/<img/g, '<img class="img"')
    ruleInfo.value = data.content
  })
}
onMounted(() => {
  getpointsRule()
})
</script>

<template>
  <view class="ruleBoxTc" v-html="ruleInfo"></view>
</template>

<style scoped lang="scss">
@use './index';
</style>
