<template>
  <image @tap="uploadCoverImg" class="coverImg" :src="recipe.imageUrl" mode="aspectFill" />
  <input class="titleInput" v-model="recipe.title" placeholder="添加菜谱标题" placeholder-class="input-placeholder" />
  <textarea class="introInput" v-model="recipe.intro" placeholder="输入这道美食背后的故事"
    placeholder-class="input-placeholder"></textarea>

  <view style="margin-left: 37.5rpx; font-size: 40rpx; margin-bottom: 30rpx;">用料</view>
  <!-- 用料输入框 -->
  <view class="materilasInputBox" v-for="item in materials">
    <input type="text" v-model="item.name" placeholder="食材: 如鸡蛋">
    <input type="text" v-model="item.amount" placeholder="用量: 如1个">
  </view>
  <!-- 用料操作按钮 -->
  <view class="materialsCtrlBox">
    <view @tap="manageMaterials">调整用料</view>
    <view @tap="addMaterialsLength">再增加一行</view>
  </view>

  <view style="margin-left: 37.5rpx; font-size: 40rpx; margin-bottom: 30rpx; margin-top: 40rpx;">步骤</view>

  <view class="stepItem" v-for="(item, index) in recipeStep">
    <view>步骤{{ item.stepNumber }}</view>
    <!-- 将步骤数也传入,就是数组的下标,便于赋值 -->
    <image @tap="uploadStepImg(index)" :src="item.img" mode="aspectFill" />
    <input type="text" v-model="item.content" placeholder="添加步骤说明">
  </view>

  <!-- 步骤操作按钮 -->
  <view class="materialsCtrlBox">
    <view @tap="manageStep">调整步骤</view>
    <view @tap="addStepLength">再增加一步</view>
  </view>

  <view class="pubsub" @tap="uploadRecipe">发布这个菜谱</view>

</template>

<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app';
import user from '@/service/user';
import { ref } from 'vue';
import recipeAPI from '@/service/recipe';

const { upload } = recipeAPI()

let recipe = ref({
  imageUrl: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-17_17-10-28.png',
  title: '',
  intro: '',
  materialsList: [],
  recipeStepList: []
})

let showFlag = ref(false)

// 声明一个菜谱用料数组
// 用户点击"再增加一行",就将该数组长度加一
let materials = ref([{
  // 用料名
  name: '',
  // 用量
  amount: '',
}])

// 声明一个菜谱步骤数组
// 用户点击"再增加一步",就将该数组长度加一
let recipeStep = ref([{
  // 步骤数,从一开始,以此类推
  stepNumber: 1,
  // 步骤图
  img: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-19_13-13-33.png',
  // 步骤介绍
  content: ''
}])

const { get } = user()

const uploadRecipe = async () => {

  // 先进性校验
  if (recipe.value.title === '') {
    uni.showToast({
      title: '请输入菜谱标题',
      icon: 'error',
      mask: true
    })
    return
  }

  // 介绍
  if (recipe.value.intro === '') {
    uni.showToast({
      title: '请输入菜谱介绍',
      icon: 'error',
      mask: true
    })
    return
  }

  recipe.value.materialsList = materials.value
  recipe.value.recipeStepList = recipeStep.value
  const res = await upload(recipe.value)
  uni.showToast({
    title: '发布成功',
    icon: 'success',
    mask: true
  })
  // 清空数据
  recipe.value = {
    imageUrl: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-17_17-10-28.png',
    title: '',
    intro: '',
    materialsList: [],
    recipeStepList: []
  }

  materials.value = [{
    name: '',
    amount: '',
  }]

  recipeStep.value = [{
    stepNumber: 1,
    img: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-19_13-13-33.png',
    content: ''
  }]

  uni.removeStorage({
    key: 'recipe',
    success: (result) => {},
    fail: (error) => {}
  })

  uni.removeStorage({
    key: 'recipeStep',
    success: (result) => {},
    fail: (error) => {}
  })

  uni.removeStorage({
    key: 'materials',
    success: (result) => {},
    fail: (error) => {}
  })

  uni.navigateBack({ delta: 1 })
}

function manageMaterials() {
  console.log(materials.value)
  // 将该数组传递给目标组件
  uni.setStorage({
    key: 'materials',
    data: JSON.stringify(materials.value),
    success: (result) => {
      uni.navigateTo({ url: '/pages/uploadRecipe/manageMaterials/manageMaterials' })
    },
    fail: (error) => { }
  })
  // 跳转至调整用料界面
}

function manageStep() {
  uni.setStorage({
    key: 'recipeStep',
    data: JSON.stringify(recipeStep.value),
    success: (result) => {
      uni.navigateTo({ url: '/pages/uploadRecipe/manageStep/manageStep' })
    },
    fail: (error) => { }
  })
}

function addMaterialsLength() {
  materials.value.push({
    name: '',
    amount: ''
  })
}

function addStepLength() {
  recipeStep.value.push({
    // 步骤数,新建的步骤的步骤数是上一项的加一
    stepNumber: recipeStep.value[recipeStep.value.length - 1].stepNumber + 1,
    // 步骤图
    img: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-19_13-13-33.png',
    // 步骤介绍
    content: ''
  })
}

const getUesrData = async () => {
  const res = await get()
  console.log(res.data)
}

function uploadStepImg(index: number) {
  showFlag.value = true
  // 调用拍照/选择图片的api
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    success: (res) => {
      // 获取文件本地路径
      const { tempFilePath } = res.tempFiles[0]
      // 文件上传
      uni.uploadFile({
        url: 'http://localhost:8080/upload',
        name: 'file',
        filePath: tempFilePath,
        success: (res) => {
          // 将该url赋值给数组指定项
          recipeStep.value[index].img = JSON.parse(res.data).data.fileUrl
        }
      })
    }
  })
}

function uploadCoverImg() {
  // 调用拍照/选择图片的api
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    success: (res) => {
      // 获取文件本地路径
      const { tempFilePath } = res.tempFiles[0]
      // 文件上传
      uni.uploadFile({
        url: 'http://localhost:8080/upload',
        name: 'file',
        filePath: tempFilePath,
        success: (res) => {
          console.log(JSON.parse(res.data).data.fileUrl)
          recipe.value.imageUrl = JSON.parse(res.data).data.fileUrl
        }
      })
    }
  })
}

onShow(() => {
  // 先请求一次用户数据,判断用户是否登录
  getUesrData()
  // 获取本地存储的materials
  uni.getStorage({
    key: 'materials',
    success: (res) => {
      if (JSON.parse(res.data).length === 0) {
        console.log('哈哈哈')
        // 等于0了,那么就初始化为空的数组
        materials.value = [{
          // 用料名
          name: '',
          // 用量
          amount: '',
        }]
      }
      else {
        // 不等于0,则表示没有删除全部的用料,就直接取值赋值
        materials.value = JSON.parse(res.data)
        console.log('嘿嘿嘿')
      }
    },
    fail: (error) => {
    }
  })
  // 获取本地存储的菜谱步骤
  if (!showFlag.value) {
    uni.getStorage({
      key: 'recipeStep',
      success: (res) => {
        if (JSON.parse(res.data).length === 0) {
          console.log('哈哈哈1111')
          // 等于0了,那么就初始化为空的数组
          recipeStep.value = [{
            // 步骤数,从一开始,以此类推
            stepNumber: 1,
            // 步骤图
            img: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-19_13-13-33.png',
            // 步骤介绍
            content: ''
          }]
        }
        else {
          console.log('哈哈哈1321313')
          console.log(showFlag.value)
          // 不等于0,则表示没有删除全部的用料,就直接取值赋值
          recipeStep.value = JSON.parse(res.data)
        }
      },
      fail: (error) => {
      }
    })
  }
  showFlag.value = false
})


</script>

<style scoped>
.pubsub {
  background-color: #5DB298;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 40rpx;
  color: white;
}


.stepItem {
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
  margin-bottom: 50rpx;
}

.stepItem image {
  width: 100%;
}

.materialsCtrlBox {
  height: 100rpx;
  display: flex;
  margin-right: 37.5rpx;
  margin-left: 37.5rpx;
  justify-content: space-between;
  margin-top: 50rpx;
}

.materialsCtrlBox view {
  width: 200rpx;
  height: 100rpx;
  background-color: #F6F6F6;
  line-height: 100rpx;
  text-align: center;
  border-radius: 50rpx;
}

.materilasInputBox {
  display: flex;
  margin-left: 37.5rpx;
  justify-content: space-between;
}

.materilasInputBox input {
  height: 80rpx;
}

.introInput {
  height: 150rpx;
  width: 100%;
  padding-left: 37.5rpx;
  margin-top: 40rpx;
}

.titleInput {
  height: 100rpx;
  font-size: 40rpx;
  padding-left: 37.5rpx;
}

.coverImg {
  width: 100%;
  height: 500rpx;
}
</style>