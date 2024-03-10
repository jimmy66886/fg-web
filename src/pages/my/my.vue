<template>

  <img :src="avatarUrl">
  <h1>{{ nickName }}</h1>
  <button v-show="!isLogin" @tap="wxLoing">微信登录</button>
</template>

<script lang="ts" setup>

import { useUserStore } from '@/stores'
import { http } from '@/utils/http'
import { reactive, ref } from 'vue';
const userStore = useUserStore()

let nickName = ref('')
let avatarUrl = ref('')
let isLogin = ref(false)


interface userLoginVo {
  nickName: string,
  token: string,
  account: string,
  openid: string,
}

function wxLoing() {
  console.log('微信登录：')
  // 提示用户是否要登录的弹框:
  uni.showModal({
    title: '提示',
    content: '授权微信登录可以进行后续操作',
    success: (res) => {
      if (res.confirm) {
        console.log("用户授权")
        uni.login({
          "provider": "weixin",
          "onlyAuthorize": true, // 微信登录仅请求授权认证
          success: async function (event) {
            const { code } = event
            //客户端成功获取授权临时票据（code）,向业务服务器发起登录请求。
            // 请求后端
            console.log('正在请求后端接口,获取openid,code为:', code)
            const res = await http<string>({
              method: 'POST',
              url: '/user/login',
              data: {
                code
              }
            })
            console.log('前端收到的返回结果:', res)
            nickName.value = res.data.nickName
            avatarUrl.value = res.data.avatarUrl
            userStore.setProfile({
              account: (res.data as userLoginVo).account,
              token: (res.data as userLoginVo).token,
              nickName: (res.data as userLoginVo).nickName,
              openid: (res.data as userLoginVo).openid,
            })
            uni.showToast({
              title: '登录成功',
              icon: 'success',
            })
            isLogin.value = true
          },
          fail: function (err) {
            // 登录授权失败
            // err.code是错误码
          }
        })
      }
    }
  })
}

</script>

<style scoped>
.img {
  width: 200px;
  height: 200px;
}
</style>