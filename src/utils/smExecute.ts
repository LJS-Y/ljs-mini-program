import { useUserStore } from '@/store'
import { LJSbase, LJSrun, LJSmsg } from '@/uni_modules/ljs-sdk/js_sdk/index.js'
import { SM2Util, SM4Util } from '@/uni_modules/ljs-sdk/js_sdk/utils/smCrypto.js'

// 加密白名单
const whitelistEncrypt = ['/api/unauthorized/wx', '/api/file/upload']
// request 加密
export function requestEncrypt(config = null) {
  if (!smConfigCheck()) return
  const { url: apiUrl, method } = config
  if (whitelistCheck(whitelistEncrypt, apiUrl)) return // apiUrl 白名单不拦截
  if (LJSbase.fieldCheck(config)) return
  const a = uni.getStorageSync('ljs_a')
  if (LJSbase.fieldCheck(a)) return
  const { data: tempData } = config
  // PUT POST
  if (apiUrl.startsWith('/api/') && (method === 'POST' || method === 'PUT')) {
    const sm4Key = SM4Util.generateKey()
    const newData = !LJSbase.fieldCheck(tempData) ? SM4Util.encrypt(JSON.stringify(tempData), sm4Key) : null
    config.data = {
      sm4Key: SM2Util.encrypt(sm4Key, a),
      data: newData,
    }
  }
}

// 解密白名单
const whitelistDecrypt = ['/api/unauthorized/wx', '/api/file/upload']
// respone 解密
export function responeDecrypt(response = null, config = null) {
  if (!smConfigCheck()) return
  if (LJSbase.fieldCheck(response) || LJSbase.fieldCheck(config)) return
  let {
    data,
    data: { encrypted, sm4Key: sm4KeySecret },
  } = response
  const { url: apiUrl, method } = config
  if (whitelistCheck(whitelistDecrypt, apiUrl)) return // apiUrl 白名单不拦截
  const b = uni.getStorageSync('ljs_b')
  if (LJSbase.fieldCheck(b)) return
  // sm-crypto 需要小写
  if (!LJSbase.fieldCheck(sm4KeySecret)) {
    sm4KeySecret = sm4KeySecret.toLowerCase()
    // 移除开头04前缀（Hutool自带，sm-crypto内部自动补04，重复会解析失败）
    if (sm4KeySecret.startsWith('04')) sm4KeySecret = sm4KeySecret.slice(2)
  }

  // 需要解密
  if (apiUrl.startsWith('/api/') && encrypted === true && (method === 'POST' || method === 'PUT')) {
    const sm4Key = SM2Util.decrypt(sm4KeySecret, b)
    const dataDecrypt = !LJSbase.fieldCheck(data.data) ? JSON.parse(SM4Util.decrypt(data.data, sm4Key)) : null
    // 把接口多余的一层去掉，塞回上一层
    if (!LJSbase.fieldCheck(dataDecrypt)) {
      for (const key in dataDecrypt) {
        data[key] = dataDecrypt[key]
      }
      delete data.sm4Key
      delete data.encrypted
    }
    // console.log('解密后端：sm4Key', sm4Key);
    // console.log('解密后端：data.data', dataDecrypt);
    // 可能存在疑问，dataDecrypt解密后是否需要JSON.p
    response.data = data
  }
}

// 检测是否在白名单中
function whitelistCheck(whitelist, apiUrl) {
  for (const one of whitelist) {
    if (one === apiUrl) {
      return true
    }
  }
  return false
}

// 检测是否打开国密配置
export function smConfigCheck() {
  const userStore = useUserStore()
  const smCryptoOpen = computed(() => userStore.isWineSM || false)
  // console.log('smCryptoOpen', smCryptoOpen.value)

  // if (!smCryptoOpen.value) {
  //   uni.removeStorageSync('ljs_a')
  //   uni.removeStorageSync('ljs_b')
  // }
  return smCryptoOpen.value
}
