import { http } from '@/utils/http';

export default function () {
    /**
     * 查询用户是否点赞过该评论
     */
    async function getLiked(recipeId: number) {
        const res = await http({
            method: 'GET',
            url: '/likes/getLiked',
            data: {
                recipeId
            }
        })
        return res
    }

    /**
     * 添加菜谱点赞
     */
    async function addByRecipeId(recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/likes/add',
            data: {
                recipeId
            }
        })
        return res
    }

    /**
     * 取消菜谱点赞
     */
    async function cancelLike(recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/likes/delete',
            data: {
                recipeId
            }
        })
        return res
    }

    return { getLiked, addByRecipeId, cancelLike }
}