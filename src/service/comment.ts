import { http } from '@/utils/http';

export default function () {

    /**
     * 根据菜谱id查询菜谱中的顶级评论
     */
    async function getByRecipeId(recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/comment/getByRecipeId',
            data: {
                recipeId: recipeId,
                rootId: '',
                page: 1,
                pageSize: 100
            }
        })
        return res
    }

    /**
     * 根据顶级评论id分页查询顶级评论下的二级评论
     * @param 
     * @returns 
     */
    async function getByTopComment(rootId: number, recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/comment/getByTopComment',
            data: {
                recipeId: recipeId,
                rootId: rootId,
                page: 1,
                pageSize: 100
            }
        })
        return res
    }


    /**
     * 添加评论-给顶级评论
     */
    async function add(comment) {
        const res = await http({
            method: 'POST',
            url: '/comment/add',
            data: {
                recipeId: comment.recipeId,
                rootId: comment.rootId,
                content: comment.content,
                toId: comment.toId
            }
        })
        return res
    }

    /**
     * 删除评论
     */
    async function deleteComment(commentId: number) {
        const res = await http({
            method: 'POST',
            url: '/comment/delete',
            data: {
                commentId
            }
        })
        return res
    }



    return { getByRecipeId, getByTopComment, add, deleteComment }
}