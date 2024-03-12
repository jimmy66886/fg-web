import { http } from '@/utils/http';
import { ref } from 'vue';
import type { Recipe } from '@/types/index'

export default function () {

    // 分页查询菜谱列表
    async function getRecipeList() {
        const res = await http({
            method: 'POST',
            url: '/recipe/getList',
            data: {
                page: 1,
                pageSize: 10
            }
        })
        return res
    }

    // 获取菜谱详细信息
    async function getByRecipeId(recipeId: number) {
        const res = await http({
            method: 'GET',
            url: '/recipe/getById',
            data: {
                recipeId,
            }
        })
        return res
    }
    return { getRecipeList, getByRecipeId }
}