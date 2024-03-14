import { http } from '@/utils/http';

export default function () {

    // 条件分页查询菜谱列表,条件可以为菜谱标题和分类名称
    // async function getRecipeByContional(recipeDto: RecipeDto) {
    //     const res = await http({
    //         method: 'POST',
    //         url: '/recipe/getList',
    //         data: {
    //             page: recipeDto.page,
    //             pageSize: recipeDto.pageSize,
    //             title: recipeDto.title,
    //             orderBy: recipeDto.orderBy
    //         }
    //     })
    //     return res
    // }

    /**
     * 展示全部分类
     * 格式为：大类下包含小类
     */
    async function getAllCategory() {
        const res = await http({
            method: 'GET',
            url: '/category/getAllCategory',

        })
        return res
    }

    return { getAllCategory }
}