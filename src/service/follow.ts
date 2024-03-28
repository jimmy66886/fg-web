import { http } from '@/utils/http';

export default function () {
    /**
     * 获取粉丝
     */
    async function getFans(userId: number) {
        const res = await http({
            method: 'GET',
            url: '/followers/getFans',
            data: {
                userId
            }
        })
        return res
    }

    /**
     * 获取关注列表
     */
    async function getFollowList(userId: number) {
        const res = await http({
            method: 'GET',
            url: '/followers/getList',
            data: {
                userId
            }
        })
        return res
    }

    /**
     * 查询是否关注用户
     */
    async function getFollowed(authorId: number) {
        const res = await http({
            method: 'GET',
            url: '/followers/getFollowed',
            data: {
                authorId
            }
        })
        return res
    }

    /**
     * 添加关注
     */
    async function addFollow(followingId: number) {
        const res = await http({
            method: 'POST',
            url: '/followers/insert',
            data: {
                followingId
            }
        })
        return res
    }

    /**
     * 取消关注
     */
    async function deleteFollow(followingId: number) {
        const res = await http({
            method: 'GET',
            url: '/followers/delete',
            data: {
                followingId
            }
        })
        return res
    }

    return { getFans, getFollowList, getFollowed, addFollow, deleteFollow }
}