import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANL378k3RiZHWx5AfJqdH9xRNBmD9wGD\n' +
  '2iRe41HdTNF8RUhNnHit5NpMNtGL0NPTSSpPjjI1kJfVorRvaQerUgkCAwEAAQ=='

// const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCdFszDz3xLIQ5GZKdrOV6u46UkjEXgW+K7MMx9KAynHWrgy3zeQZCfMj9KRaZqgmh+rYkO/QENBuSrBDloEZxrGZFVnsjP3foBWnRaCMPtrCR8U8pYYZaDPnD1uhc9vUs9VBw1CXrV7UV8EDxa38wr52TAEKou9MnplQcK0q0U+wIDAQAB'


// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

