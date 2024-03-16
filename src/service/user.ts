import { http } from '@/utils/http';

export default function () {


    /**
     * 更新用户信息
     * @param user 
     * @returns 
     */
    async function updateUserInfo(user) {
        const res = await http({
            method: 'POST',
            url: '/user/update',
            data: user
        })
        return res
    }

    /**
     * 获取用户信息
     */
    async function get() {
        const res = await http({
            method: 'GET',
            url: '/user/get'
        })
        return res
    }

    return { updateUserInfo, get }
}