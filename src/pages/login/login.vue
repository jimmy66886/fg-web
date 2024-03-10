<template>
  <image src="../../../static/images/icon.png" />
  <view class="title-box">
    <view class="title">欢迎登录</view>
  </view>

  
</template>

<script lang="ts" setup>
import useLogin from '@/service/useLogin'

const { disableBtn, second, getCode, code, password, email, isCode, isEmail, activeButton, codeOption, emailOption, toRegister, login } = useLogin()

</script>

<style scoped>
.input-button { 
  display: flex;
  width: 83%;
  margin: 0 auto;
}

.input-button input {
  border: 1px solid #5DB298;
  border-radius: 10px;
  padding-left: 10px;
  height: 40px;
  width: 60%;
  margin-bottom: 10px;
}

.register{
  position: absolute;
  right: 32px;
}

.input-button button {
  border: 1px solid #5DB298;
  border-radius: 10px;
  height: 42px;
  margin-left: 5px;
  font-size: 12px;
  width: 40%;
  line-height: 42px;
}

.active {
  background-color: #5DB298;
  color: #fff !important;
}

.title-box {
  display: flex;
  margin-left: 38px;
  position: relative;
}

.title {
  font-size: 24px;
  color: #5DB298;
  margin-bottom: 20px;
}
image {
  margin-left: 175rpx;
  width: 400rpx;
  height: 400rpx;
}
</style>
