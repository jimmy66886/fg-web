/**
 * 添加拦截器
 */

import { useUserStore } from '@/stores'

// 请求基地址
const baseURL = 'http://192.168.168.1:8080/app'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 请求超时时间
    options.timeout = 20000
    // 添加小程序端请求头标识
    options.header = {
      // 保留原有的请求头参数
      ...options.header,
      'source-client': 'miniapp',
    }
    // 添加token请求头标识
    const userStore = useUserStore()
    const token = userStore.profile?.token
    if (token) {
      options.header.token = token
    }
    console.log(options)
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

// 定义一个接口,用于封装返回结果类型
interface Data<T> {
  code: number
  msg: string
  data: T
}

// 请求函数,返回promise对象
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 请求成功
      success(res) {
        // 状态码2xx为请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 响应成功,但是可能是其他错误信息
          if ((res.data as Data<T>).code == 0) {
            // 比如密码错误这种
            uni.showToast({
              title: (res.data as Data<T>).msg,
              icon: 'none',
            })
            console.log('检测到后端抛出异常：', res.data.msg)
            if (res.data.msg === '您的账户已被封禁') {
              // 单独的一种情况,账号被封了,此时要清除登录数据
              const userStore = useUserStore()
              userStore.clearProfile()
              // 直接移除掉user本地缓存得了
              uni.removeStorage({
                key: 'user',
                success: (result) => { },
                fail: (error) => { }
              })
              uni.switchTab({ url: '/pages/my/my' })
              uni.showToast({
                title: '请登录后进行操作',
                icon: 'none',
              })
            }
            reject(res)
          }
          // as... 断言类型为指定的类型
          resolve(res.data as Data<T>)
        } else if (res.statusCode == 401) {
          // 401错误
          const userStore = useUserStore()
          userStore.clearProfile()
          // 直接移除掉user本地缓存得了
          uni.removeStorage({
            key: 'user',
            success: (result) => { },
            fail: (error) => { }
          })
          uni.switchTab({ url: '/pages/my/my' })
          uni.showToast({
            title: '请登录后进行操作',
            icon: 'none',
          })
          reject(res)
        } else {
          // 其他错误
          uni.showToast({
            title: (res.data as Data<T>).msg || '请求错误',
            icon: 'none',
            mask: true,
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误,请检查网络设置',
        })
        reject(err)
      },
    })
  })
}