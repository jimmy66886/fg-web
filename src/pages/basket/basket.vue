<template>
  <view v-if="basketList.length > 0" class="basket">
    <view v-for="(item, index) in basketList" :key="item.basketId" class="basketItem">
      <view @tap="toRecipeInfo(item.recipeId)" class="title landr">
        <view>{{ item.basketName }}</view>
        <image v-if="item.recipeId" src="http://47.109.139.173:9000/food.guide/进入箭头.png" mode="aspectFill" />
      </view>
      <!-- 操作按钮 -->
      <view class="basketCtrl landr">
        <view @tap="addMaterial(index)">+添加用料</view>
        <view @tap="deleteOne(index)">删除这个清单</view>
      </view>
      <!-- 用料列表 -->
      <view @tap="finished(index, idx)" v-for="(i, idx) in item.basketMaterialList" class="materialItem landr">
        <image v-if="!i.isFinised" class="selectButton" src="http://47.109.139.173:9000/food.guide/未选中weixuanhzong.png"
          mode="aspectFill" />
        <image v-else class="selectButton" src="http://47.109.139.173:9000/food.guide/选中youshizuo.png"
          mode="aspectFill" />
        <view :class="{ finished: i.isFinised }">{{ i.name }}</view>
        <view class="amount">{{ i.amount }}</view>
      </view>
      <view style="background-color: #EEEEEE; height: 40rpx; width: 100%;"></view>
    </view>

    <image @tap="moreCtrl" class="floadButton" src="http://47.109.139.173:9000/food.guide/有食做更多实心.png"
      mode="aspectFill" />

  </view>
  <view v-else style="text-align: center; margin-top: 100rpx;">
    <view>暂无数据,快去看看有没有想做的菜吧</view>
  </view>

  <uni-popup ref="popup" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">

    <view style="margin: 20rpx 37.5rpx; font-size: 40rpx;">添加用料到: {{ recipeTitle }}</view>
    <view class="addBox">
      <view>用料名</view>
      <input type="text" placeholder="输入用料名" v-model="addObj.name">
    </view>
    <view class="addBox">
      <view>数目|备注</view>
      <input type="text" placeholder="输入数目,备注等" v-model="addObj.amount">
    </view>
    <view @tap="saveChange" class="save">保存</view>

  </uni-popup>

  <uni-popup ref="popup2" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">

    <view style="margin: 20rpx 37.5rpx; font-size: 40rpx;">新建清单</view>
    <view class="addBox">
      <view>清单名</view>
      <input type="text" placeholder="输入用料名" v-model="addBasketName">
    </view>
    <view @tap="addBasket" class="save">保存</view>

  </uni-popup>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import recipe from '@/service/recipe'

const { getByRecipeId } = recipe()

let basketList = ref()
let recipeTitle = ref('')
let popup = ref()
let popup2 = ref()
let addObj = ref({
  name: '',
  amount: ''
})
let addIndex = ref()
let addBasketName = ref()

function addBasket() {
  basketList.value.unshift(
    {
      basketName: addBasketName.value,
      basketMaterialList: []
    }
  )
  // 写入缓存
  uni.setStorage({
    key: 'basketList',
    data: JSON.stringify(basketList.value),
    success: (result) => { },
    fail: (error) => { }
  })
  popup2.value.close()
}

function moreCtrl() {
  uni.showActionSheet({
    itemList: ['新增清单', '清空菜篮子'],
    success: (res) => {
      if (!res.cancel) {
        const selectedIndex = res.tapIndex

        if (1 === selectedIndex) {
          uni.showModal({
            title: '提示',
            content: '您确定要将菜篮子清空吗',
            showCancel: true,
            success: ({ confirm, cancel }) => {
              if (confirm) {
                // 清空菜篮子
                basketList.value = []
                uni.removeStorage({
                  key: 'basketList',
                  success: (result) => {
                    uni.showToast({
                      title: '清空成功',
                      icon: 'success',
                      mask: true
                    })
                  },
                  fail: (error) => { }
                })
              }
            }
          })
        }

        if (0 === selectedIndex) {
          // 新增清单
          addBasketName.value = ''
          popup2.value.open()
        }

      }
    }
  })
}

function saveChange() {
  basketList.value[addIndex.value].basketMaterialList.unshift(addObj.value)
  popup.value.close()
  // 重写缓存
  uni.setStorage({
    key: 'basketList',
    data: JSON.stringify(basketList.value),
    success: (result) => { },
    fail: (error) => { }
  })
}

const toRecipeInfo = async (recipeId: number) => {

  if (recipeId !== undefined) {
    const res = await getByRecipeId(recipeId)
    uni.setStorage({
      key: 'recipe',
      data: JSON.stringify(res.data)
    })
    uni.navigateTo({
      url: '/pages/recipe/recipe',
    })
  }

}

const deleteOne = async (index: number) => {
  uni.showModal({
    title: '提示',
    content: '确认删除?',
    showCancel: true,
    success: ({ confirm, cancel }) => {
      if (confirm) {
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          mask: true
        })
        // 删除数组的这一项
        basketList.value.splice(index, 1)

        // 更新本地缓存
        uni.setStorage({
          key: 'basketList',
          data: JSON.stringify(basketList.value),
          success: (result) => { },
          fail: (error) => { }
        })
      }
    }
  })
}

function addMaterial(index: number) {

  recipeTitle.value = basketList.value[index].basketName
  addObj.value = {
    name: '',
    amount: ''
  }
  addIndex.value = index
  popup.value.open()
}

/**
 * 完成后是要发送请求的,所以这个用料还要加上一个是否完成的标识
 * 但是发请求,太麻烦了,所以直接使用本地存储吧,不过要在进入页面时,先检验是否存在,如果存在,则不要进行再次查询
 * 保持一致性:每次前端进行修改,都要对本地存储进行更新,
 * 或者说,后端只记录有没有这些菜篮子,而前端记录菜篮子中的每条记录,包括是否完成
 */
function finished(index: number, idx: number) {
  // 取反
  basketList.value[index].basketMaterialList[idx].isFinised = !basketList.value[index].basketMaterialList[idx].isFinised
  // 重写缓存
  uni.setStorage({
    key: 'basketList',
    data: JSON.stringify(basketList.value),
    success: (result) => { },
    fail: (error) => { }
  })
}

function getBasketList() {
  uni.getStorage({
    key: 'basketList',
    success: ({ data }) => {
      basketList.value = JSON.parse(data)
    },
    fail: (error) => { }
  })
}

getBasketList()

</script>

<style scoped>
.save {
  margin: 10rpx 37.5rpx;
  height: 100rpx;
  margin-bottom: 500rpx;
  border: 1rpx solid #5DB298;
  text-align: center;
  line-height: 100rpx;
  border-radius: 20rpx;
}

.addBox {
  margin: 10rpx 37.5rpx;
  display: flex;
  position: relative;
  height: 100rpx;
  line-height: 100rpx;
  font-size: 35rpx;
}

.addBox input {
  height: 100rpx;
  position: absolute;
  right: 130rpx;
}

.finished {
  text-decoration: line-through;
}

.amount {
  position: absolute;
  right: 150rpx;
}

.selectButton {
  margin: 0 20rpx;
  width: 60rpx;
  height: 60rpx;
  margin-top: 10rpx;
}

.materialItem {
  position: relative;
  display: flex;
  justify-content: left;
  background-color: #F8F8F8;
  height: 80rpx;
  line-height: 80rpx;
  margin-bottom: 10rpx;
}

.basketCtrl {
  display: flex;
  margin-bottom: 20rpx;
}

.basketCtrl view {
  height: 60rpx;
  line-height: 60rpx;
  padding-left: 10rpx;
  padding-right: 10rpx;
  border: 1rpx solid #5DB298;
  border-radius: 10rpx;
  margin-right: 20rpx;
  color: #5DB298;
}

.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  font-size: 40rpx;
  margin-top: 20rpx;
}

.title image {
  width: 60rpx;
  height: 60rpx;
}

.landr {
  margin-right: 37.5rpx;
  margin-left: 37.5rpx;
}

.floadButton {
  position: fixed;
  bottom: 100rpx;
  right: 20rpx;
  width: 100rpx;
  height: 100rpx;
}
</style>