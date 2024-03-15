<template>
  <view v-if="isLogin" class="main">
    <view class="settings">
      <image @tap="setting" src="http://47.109.139.173:9000/food.guide/settingssssss.png" mode="aspectFill" />
    </view>
    <view class="userBasicInfo">
      <image :src="avatarUrl" mode="aspectFit"></image>
      <view>{{ nickName }}</view>
    </view>
    <view class="line"></view>
    <!-- other信息 -->
    <view class="other">
      <view v-if="createTime">{{ createTime.split('-')[0] }}&nbsp;&nbsp;加入
      </view>
      <view>bio:&nbsp;&nbsp;&nbsp;{{ bio }}</view>
    </view>

  </view>

  <view class="loginBox" v-if="!isLogin">
    <image src="../../../static/images/icon.png" mode="aspectFit"></image>
    <view>欢迎登录</view>
    <button @tap="wxLoing">微信登录</button>
  </view>
</template>

<script lang="ts" setup>

import { useUserStore } from '@/stores'
import { http } from '@/utils/http'
import { ref } from 'vue';

import { onLoad } from '@dcloudio/uni-app';

const userStore = useUserStore()

let nickName = ref('')
let avatarUrl = ref('')
let bio = ref('')
let createTime = ref()
let isLogin = ref(false)

function setting() {
  uni.showActionSheet({
    itemList: ['编辑个人资料', '退出账号'],
    success: (res) => {
      if (!res.cancel) {
        const selectedIndex = res.tapIndex
        // 退出登录
        if (1 === selectedIndex) {
          // 清除本地用户数据
          uni.showModal({
            title: '提示',
            content: '确定退出?',
            showCancel: true,
            success: (res) => {
              // 确定
              if (res.confirm) {
                uni.removeStorage({
                  key: 'user'
                })
              }
              userStore.clearProfile()
              // 回到登录界面
              isLogin.value = false
            }
          })
        }

        // 编辑个人资料
        if (0 === selectedIndex) {
          uni.navigateTo({
            url: '/pages/my/basicInfo/basicInfo',
          })
        }

      }
    }
  })
}

// 读取本地缓存中的头像和昵称信息,如果存在则直线显示,不展示微信登陆的按钮
function getUserProfile() {
  uni.getStorage({
    key: 'user',
    success: (res) => {
      const userData = JSON.parse(res.data)
      nickName.value = userData.profile.nickName
      avatarUrl.value = userData.profile.avatarUrl
      bio.value = userData.profile.bio
      createTime.value = userData.profile.createTime
      isLogin.value = true
    },
  })
}

getUserProfile()

interface userLoginVo {
  nickName: string,
  token: string,
  account: string,
  openid: string,
  avatarUrl: string,
  bio: string,
  createTime: Date
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
            bio.value = res.data.bio
            createTime.value = res.data.createTime
            isLogin.value = true
            userStore.setProfile({
              avatarUrl: (res.data as userLoginVo).avatarUrl,
              account: (res.data as userLoginVo).account,
              token: (res.data as userLoginVo).token,
              nickName: (res.data as userLoginVo).nickName,
              openid: (res.data as userLoginVo).openid,
              bio: (res.data as userLoginVo).bio,
              createTime: (res.data as userLoginVo).createTime
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
.settings {
  width: 100%;
  height: 70rpx;
  margin: 100rpx 0;
}

.settings image {
  width: 70rpx;
  height: 70rpx;
}

.loginBox {
  margin: 100rpx 37.5rpx;
}

.loginBox view {
  font-size: 50rpx;
  color: #5DB298;
  margin-bottom: 30rpx;
}

.loginBox button {
  background-color: #5DB298;
  color: white;
}

.other {
  margin-top: 40rpx;
  /* display: flex; */
}

.userBasicInfo {
  display: flex;
  position: relative;
  align-items: center;
}

.userBasicInfo image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
}

.userBasicInfo view {
  position: absolute;
  right: 0rpx;
  font-size: 40rpx;
}

.main {
  margin: 100rpx 37.5rpx;
}

.line {
  height: 1px;
  background-color: #ccc;
  margin: 0 auto;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}
</style>