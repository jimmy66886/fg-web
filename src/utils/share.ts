export default {
    data() {
        return {}
    },
    //1.配置发送给朋友
    onShareAppMessage() {
        return {
            title: '有食做',                //分享的标题
            path: 'pages/index/index',      //点击分享链接之后进入的页面路径
            imageUrl: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-24_12-23-19.png' //分享发送的链接图片地址
        };
    },
    //2.配置分享到朋友圈
    onShareTimeline() {
        return {
            title: '有食做',                //分享的标题
            query: 'pages/index/index',     //点击分享链接之后进入的页面路径
            imageUrl: 'http://47.109.139.173:9000/food.guide/Snipaste_2024-03-24_12-23-19.png' //分享发送的链接图片地址
        }
    },
}