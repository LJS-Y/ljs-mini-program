import {
	sm2,
	sm3,
	sm4
} from 'sm-crypto'

// ====================== sm2 非对称加密/签名/验签 ======================
export const SM2Util = {
	// 生成 sm2 密钥对（公钥+私钥）
	generateKeyPair() {
		return sm2.generateKeyPairHex()
	},

	// 公钥加密； 1 - C1C3C2，0 - C1C2C3，默认为1
	encrypt(data, publicKey, cipherMode = 1) {
		return sm2.doEncrypt(data, publicKey, cipherMode)
	},

	// 私钥解密
	decrypt(encryptedData, privateKey, cipherMode = 1) {
		return sm2.doDecrypt(encryptedData, privateKey, cipherMode)
	},

	// 私钥签名（常用：交易签名、身份认证）
	sign(data, privateKey) {
		return sm2.sign(sm3.digest(data), privateKey, 'base64')
	},

	// 公钥验签
	verify(data, signature, publicKey) {
		return sm2.verify(sm3.digest(data), signature, publicKey, 'base64')
	}
}

// ====================== sm3 哈希摘要 ======================
export const SM3Util = {
	// 计算数据摘要（指纹）
	digest(data) {
		return sm3.digest(data, 'utf8', 'hex')
	}
}

// ====================== sm4 对称加密/解密 ======================
export const SM4Util = {
	// 生成随机16位密钥（sm4固定128位）
	generateKey() {
		const chars = '0123456789abcdef'
		let key = ''
		for (let i = 0; i < 32; i++) {
			key += chars[Math.floor(Math.random() * 16)]
		}
		return key
	},

	// 加密（传输/存储用）
	encrypt(data, hexKey) {
		return sm4.encrypt(data, hexKey)
	},

	// 解密
	decrypt(encryptedData, key) {
		return sm4.decrypt(encryptedData, key)
	}
}


/**
 * 
 * 最终实现流程（完全对应你的要求）
后端提供 sm2 公钥
前端随机生成 sm4 发送密钥 A、接收密钥 B
前端用后端 sm2 公钥加密 A+B
传给后端
后端用 sm2 私钥解密得到 A、B
前端→后端：密钥 A 加密
后端→前端：密钥 B 解密
 * 
 */
export default {
	SM2Util,
	SM3Util,
	SM4Util,
}