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

    /**
     * 根据用户id查询用户信息
     */
    async function getById(userId: number) {
        const res = await http({
            method: 'GET',
            url: '/user/getById',
            data: {
                userId
            }
        })
        return res
    }

    /**
     * 搜索用户
     */
    async function searchByNickName(nickName: string) {
        const res = await http({
            method: 'POST',
            url: '/user/search',
            data: {
                nickName
            }
        })
        return res
    }

    return { searchByNickName, getById, updateUserInfo, get }
}