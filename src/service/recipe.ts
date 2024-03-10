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
    return { getRecipeList }
}