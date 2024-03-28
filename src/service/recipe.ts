import { http } from '@/utils/http';
import { ref } from 'vue';
import type { Recipe, RecipeDto } from '@/types/index'

export default function () {

    // 分页查询菜谱列表
    async function getRecipeList(pageSize: number) {
        const res = await http({
            method: 'POST',
            url: '/recipe/getNormalList',
            data: {
                page: 1,
                pageSize
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

    // 获取一言
    async function getOneWord() {
        const res = await http({
            method: 'GET',
            url: '/oneWord/get'
        })
        return res
    }

    // 条件分页查询菜谱列表,条件可以为菜谱标题和分类名称
    async function getRecipeByContional(recipeDto: RecipeDto) {
        const res = await http({
            method: 'POST',
            url: '/recipe/getList',
            data: {
                page: recipeDto.page,
                pageSize: recipeDto.pageSize,
                title: recipeDto.title,
                orderBy: recipeDto.orderBy
            }
        })
        return res
    }

    // 查询用户的搜索记录
    async function getSearchHistory() {
        const res = await http({
            method: 'GET',
            url: '/searchHistory/get'
        })
        return res
    }

    // 清除用户搜索记录
    async function cleanHistory() {
        const res = await http({
            method: 'POST',
            url: '/searchHistory/deleteAll'
        })
        return res
    }

    // 根据用料集合查询菜谱
    async function getByMaterials(materials: Array<string>) {
        const res = await http({
            method: 'POST',
            url: '/recipe/getByMaterials',
            data: materials
        })
        return res
    }

    // 上传菜谱
    async function upload(recipe) {
        const res = await http({
            method: 'POST',
            url: '/recipe/add',
            data: recipe
        })
        return res
    }

    // 根据用户id获取菜谱
    async function getByUserId(userId: number) {
        const res = await http({
            method: 'GET',
            url: '/recipe/getByUserId',
            data: {
                userId
            }
        })
        return res
    }

    // 条件分页查询菜谱列表,条件可以为菜谱标题和分类名称
    async function removeById(recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/recipe/removeById',
            data: {
                page: 1,
                pageSize: 100,
                title: '',
                orderBy: '',
                recipeId: recipeId
            }
        })
        return res
    }

    return { removeById, getByMaterials, cleanHistory, getSearchHistory, getRecipeList, getByRecipeId, getOneWord, getRecipeByContional, upload, getByUserId }
}