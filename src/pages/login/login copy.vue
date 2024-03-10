<template>
  <image src="../../../static/images/icon.png" />
  <view class="title-box">
    <view class="title">欢迎登录</view>
    <view class="register" @tap="toRegister">注册</view>
  </view>

  <!-- 两个选项,用于切换是手机号登录还是邮箱登录 -->
  <view class="options">
    <button :class="{ active: activeButton === 1 }" @tap="codeOption">验证码</button>
    <button :class="{ active: activeButton === 2 }" @tap="emailOption">密码</button>
  </view>

  <view v-if="isCode">

    <!-- 验证码登录 -->
    <view class="input-container">
      <input class="input-style" type="text" placeholder="请输入邮箱" v-model="email" />
    </view>
    <view class="input-button">
      <input placeholder="请输入验证码" v-model="code" />
      <button :disabled="disableBtn" @tap="getCode">{{ disableBtn ? second + 's后重试' : '获取验证码' }}</button>
    </view>
  </view>

  <view v-if="isEmail">
    <!-- 密码登录 -->
    <view class="input-container">
      <input class="input-style" type="text" placeholder="请输入邮箱" v-model="email" />
    </view>
    <view class="input-container">
      <input class="input-style" placeholder="请输入密码" v-model="password" />
    </view>
  </view>

  <view class="btn-container">
    <button class="login-button" type="primary" @tap="login">登录</button>
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

.options {
  margin-left: 35px;
}

.options button {
  margin-bottom: 10px;
  height: 40px;
  margin-right: 20px;
  border-radius: 5px;
  color: #000000;
  display: inline-block;
  line-height: 40px;
  font-size: 15px;
}

image {
  margin-left: 175rpx;
  width: 400rpx;
  height: 400rpx;
}

.input-style {
  border: 1px solid #5DB298;
  border-radius: 10px;
  padding-left: 10px;
  height: 40px;
  width: 80%;
  margin-bottom: 10px;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-button {
  width: 82.5%;
  height: 42px;
  border-radius: 5px;
  background-color: #5DB298;
  color: #fff;
  border: none;
  outline: none;
  line-height: 42px;
}
</style>
