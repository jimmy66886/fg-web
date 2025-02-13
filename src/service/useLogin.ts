import { http } from '@/utils/http';
import { ref } from 'vue';
import { useUserStore } from '@/stores'
export default function () {
    const userStore = useUserStore()

    let password = ref('')
    let email = ref('')
    let code = ref('')

    let isCode = ref(true)
    let isEmail = ref(false)
    let activeButton = ref(1)

    let disableBtn = ref(false)
    let timer = ref()
    let second = ref(60)

    let emailRule = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


    interface userLoginVo {
        nickName: string,
        token: string,
        account: string,
        email: string
    }

    function codeOption() {
        isCode.value = true
        isEmail.value = false
        activeButton.value = 1
        // 将另外一个字段置空
        password.value = ''
    }

    function emailOption() {
        isEmail.value = true
        isCode.value = false
        activeButton.value = 2
        // 将另外一个字段置空
        code.value = ''
    }

    function toRegister() {
        uni.navigateTo({ url: '/pages/register/register' })
    }


    function countdown() { // 倒计时方法
        disableBtn.value = true; // 禁用按钮
        timer.value = setInterval(() => {
            if (second.value <= 0) {
                clearInterval(timer.value); // 清除定时器
                disableBtn.value = false; // 启用按钮
                second.value = 60; // 重置倒计时时长
            } else {
                second.value--; // 减少倒计时时间
            }
        }, 1000)
    }

    async function getCode() {
        if (email.value == '' || !emailRule.test(email.value)) {
            uni.showToast({
                title: '请输入正确的邮箱',
                icon: 'none',
            })
            return
        }

        countdown() // 调用计时器

        const res = await http({
            method: 'POST',
            url: '/user/getCode',
            data: {
                // 登陆用的验证码，需要加上isRegister: false
                email: email.value,
                isRegister: false
            }
        })
    }

    async function login() {
        if (email.value == '' || !emailRule.test(email.value)) {
            uni.showToast({
                title: '请输入正确的邮箱',
                icon: 'none',
            })
            return
        }

        if (password.value == '' && code.value == '') {
            uni.showToast({
                title: '请输入完整的登录信息',
                icon: 'none',
            })
            return
        }

        const res = await http({
            method: 'POST',
            url: '/user/login',
            data: {
                // 不管是什么登录，发过去就完了
                email: email.value,
                password: password.value,
                code: code.value
            }
        })

        // 将返回的token封装到请求头中
        userStore.setProfile({
            account: (res.data as userLoginVo).account,
            email: (res.data as userLoginVo).email,
            token: (res.data as userLoginVo).token,
            nickName: (res.data as userLoginVo).nickName,
        })

        console.log(userStore.profile)
        // 登录成功
        uni.showToast({
            title: '登录请求',
            icon: 'success',
        })
    }

    return { disableBtn, second, getCode, code, password, email, isCode, isEmail, activeButton, codeOption, emailOption, toRegister, login }
}