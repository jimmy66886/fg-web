<template>
  <view class="userInfoBox">
    <image v-if="avatarUrl" @tap="chooseAvatar" :src="avatarUrl" mode="aspectFill"></image>
    <text style="color: grey;">点击更换头像</text>

    <view class="nickNameBox">
      <text>昵称</text><input placeholder="请输入昵称" v-model="nickName" />
    </view>

    <view class="line"></view>

    <view class="bioBox">
      <text>个人介绍</text><textarea placeholder="请输入个人简介" v-model="bio"></textarea>
    </view>
    <button class="saveButton" @tap="save">保存</button>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import user from '@/service/user';

const { updateUserInfo, get } = user()

let nickName = ref('')
let avatarUrl = ref('')
let bio = ref('')

onLoad(() => {
  // 初始化一下头像url
  updateInfo()
})


const updateInfo = async () => {
  const res = await get()
  nickName.value = res.data.nickName
  avatarUrl.value = res.data.avatarUrl
  bio.value = res.data.bio
}

const save = async () => {
  const res = await updateUserInfo({
    nickName: nickName.value,
    avatarUrl: avatarUrl.value,
    bio: bio.value
  })
  console.log('更新成功')
  uni.switchTab({ url: '/pages/my/my' })
}

// 上传头像
function chooseAvatar() {
  // 调用拍照/选择图片的api
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    success: (res) => {
      // 获取文件本地路径
      const { tempFilePath } = res.tempFiles[0]
      // 文件上传
      uni.uploadFile({
        url: 'http://192.168.137.1:8080/upload',
        name: 'file',
        filePath: tempFilePath,
        success: (res) => {
          console.log(JSON.parse(res.data).data.fileUrl)
          avatarUrl.value = JSON.parse(res.data).data.fileUrl
        }
      })
    }
  })
}

</script>

<style scoped>
.userInfoBox {
  margin: 40rpx 37.5rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.saveButton{
  width: 100%;
}

.userInfoBox image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
}

.userInfoBox input {
  height: 100rpx;
}

.nickNameBox {
  margin-top: 50rpx;
  display: flex;
  width: 100%;
  height: 100rpx;
  align-items: center;
}

.nickNameBox text {
  margin-right: 120rpx;
}

.bioBox {
  height: 400rpx;
  display: flex;
}

.bioBox text {
  width: 150rpx;
  margin-right: 30rpx;
}

.bioBox textarea {
  height: 400rpx;
  width: 500rpx;
}

.line {
  height: 1px;
  background-color: #ccc;
  width: 100%;
  margin: 0 auto;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}
</style>