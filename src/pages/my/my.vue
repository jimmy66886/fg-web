<template>
  <view v-if="isLogin" class="main">
    <view class="settings">
      <image @tap="setting" src="http://47.109.139.173:9000/food.guide/settingssssss.png" mode="aspectFill" />
    </view>
    <view class="userBasicInfo">
      <image :src="avatarUrl" mode="aspectFill"></image>
      <view>{{ nickName }}</view>
    </view>
    <view class="line"></view>
    <!-- other信息 -->
    <view class="other">
      <view v-if="createTime">{{ createTime.split('-')[0] }}&nbsp;&nbsp;加入
      </view>
      <view>bio:&nbsp;&nbsp;&nbsp;{{ bio }}</view>
    </view>

    <view class="fff">
      <view @tap="toFollowOrFan('follow')" class="ff">
        <view>{{ followList.length }}</view>
        <view>关注</view>
      </view>
      <view @tap="toFollowOrFan('fan')" class="ff">
        <view>{{ fans.length }}</view>
        <view>粉丝</view>
      </view>
      <view class="basket" @tap="toBasketPage">菜篮子</view>
    </view>

    <view>
      <view style="font-size: 40rpx;">我的菜谱</view>
      <!-- 搜索结果展示区 -->
      <view class="result" v-for="item in recipeList" :key="item.recipeId">
        <view @tap="toRecipeInfo(item.recipeId)" class="recipeItem">
          <image :src="item.imageUrl" mode="aspectFill" />
          <view class="basicInfo">
            <view style="font-size: 40rpx; font-weight: bold;">{{ item.title }}</view>
            <!-- 浏览量和收藏量以及点赞量放到一行 -->
            <view class="otherInfo">
              <view>{{ item.views }}看过</view>
              <view>{{ item.favoriteNumber }}收藏</view>
              <view>{{ item.likeNumber }}赞过</view>
            </view>
            <view style="font-size: 30rpx; color: gray;">{{ item.nickName }}</view>
          </view>
        </view>
      </view>
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
import { onActivated, ref } from 'vue';
import user from '@/service/user';
import recipe from '@/service/recipe';
import follow from '@/service/follow';
import basket from '@/service/basket'
import { onLoad, onShow } from '@dcloudio/uni-app';

const { get } = user()
const { getByRecipeId, getByUserId } = recipe()
const { getFollowList, getFans } = follow()
const { getAllBasket } = basket()

const userStore = useUserStore()

let nickName = ref('')
let avatarUrl = ref('')
let bio = ref('')
let createTime = ref()
let isLogin = ref(false)

let recipeList = ref([])

let followList = ref([])
let fans = ref([])

/**
 * 跳转至菜篮子界面
 */
const toBasketPage = async () => {
  // 换个思路,菜篮子接口存前端实现,脱离后端
  uni.navigateTo({ url: '/pages/basket/basket' })
}

/**
 * 根据本地缓存中的数据判断要展示的是粉丝还是关注
 * @param fof 是关注还是粉丝
 */
const toFollowOrFan = async (fof: string) => {
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  const followRes = await getFollowList(-1)
  followList.value = followRes.data
  const fanRes = await getFans(-1)
  fans.value = fanRes.data
  uni.hideLoading()
  if (fof === 'follow') {
    uni.setStorage({
      key: 'followList',
      data: JSON.stringify(followList.value),
      success: (result) => {
        uni.navigateTo({ url: '/pages/userInfo/follow/follow' })
      },
      fail: (error) => { }
    })
  } else if (fof === 'fan') {
    uni.setStorage({
      key: 'fans',
      data: JSON.stringify(fans.value),
      success: (result) => {
        uni.navigateTo({ url: '/pages/userInfo/follow/follow' })
      },
      fail: (error) => { }
    })
  }
}

const toRecipeInfo = async (recipeId: number) => {
  const res = await getByRecipeId(recipeId)
  uni.setStorage({
    key: 'recipe',
    data: JSON.stringify(res.data)
  })
  uni.navigateTo({
    url: '/pages/recipe/recipe',
  })
}

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
    fail: (fail) => {
      isLogin.value = false
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

const updateInfo = async () => {
  const res = await get()
  nickName.value = res.data.nickName
  avatarUrl.value = res.data.avatarUrl
  bio.value = res.data.bio
}

const getByUserIdData = async () => {
  const res = await getByUserId(-1)
  recipeList.value = res.data
  console.log('@@@', recipeList.value)
}

onShow(() => {

  // 防止登录过期后加载不出登录界面
  console.log('防止登录过期后加载不出登录界面')
  uni.getStorage({
    key: 'user',
    success: ({ data }) => { },
    fail: (error) => {
      isLogin.value = false
    }
  })

  uni.showLoading({
    title: '加载中',
    mask: true
  })
  // 每次进入这个页面都要请求一次后端,获取最新的用户数据
  updateInfo()
  getByUserIdData()
  // 获取数据,并不跳转
  toFollowOrFan('none')
  clearFF()




})
function clearFF() {
  console.log('移除本地缓存')
  uni.removeStorage({
    key: 'fans',
    success: (result) => { },
    fail: (error) => { }
  })
  uni.removeStorage({
    key: 'followList',
    success: (result) => { },
    fail: (error) => { }
  })
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
        uni.showLoading({
          title: '登陆中',
          mask: true
        })
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
            uni.hideLoading()
            uni.showToast({
              title: '登录成功',
              icon: 'success',
            })
            const followRes = await getFollowList(-1)
            followList.value = followRes.data
            const fanRes = await getFans(-1)
            fans.value = fanRes.data
            getByUserIdData()
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
.basket {
  position: absolute;
  right: 0;
  width: 150rpx;
  height: 80rpx;
  background-color: #5DB298;
  line-height: 80rpx;
  text-align: center;
  color: white;
  border-radius: 10rpx;
}

.ff {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 100rpx;
}

.fff {
  display: flex;
  position: relative;
  margin-top: 50rpx;
  margin-bottom: 50rpx;
}

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

.result {
  margin: 10rpx 0rpx;
}

.basicInfo {
  /* 用于将介绍信息垂直分开 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recipeItem {
  /* 用于将图片和介绍信息水平分成两份 */
  display: flex;
  margin-bottom: 30rpx;
}

.recipeItem image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  margin-right: 30rpx;
}

.otherInfo {
  /* 用于将点赞,收藏,浏览量水平分开 */
  display: flex;
  width: 350rpx;
  font-size: 30rpx;
  color: rgb(43, 41, 41);
  justify-content: space-between;
}
</style>