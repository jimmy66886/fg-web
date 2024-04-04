import { http } from '@/utils/http';

export default function () {

    /**
     * 获取用户所有的收藏夹
     */
    async function getAllFavorites() {
        const res = await http({
            method: 'GET',
            url: '/favorites/getAllFavorites',
        })
        return res
    }

    /**
     * 获取用户所有的收藏菜谱
     */
    async function getAllFavorite() {
        const res = await http({
            method: 'POST',
            url: '/favorite/getAll',
            data: {
                page: 1,
                pageSize: 10
            }
        })
        return res
    }

    /**
     * 根据收藏夹id获取收藏夹里的菜谱
     */
    async function getById(favoritesId: number) {
        const res = await http({
            method: 'GET',
            url: '/favorites/getById',
            data: {
                favoritesId
            }
        })
        return res
    }

    /**
     * 根据收藏夹id获取收藏夹信息
     */
    async function getFavoritesInfo(favoritesId: number) {
        const res = await http({
            method: 'GET',
            url: '/favorites/getFavoritesInfo',
            data: {
                favoritesId
            }
        })
        return res
    }

    /**
     * 根据菜谱id查询用户是否收藏过菜谱
     */
    async function getFavorited(recipeId: number) {
        const res = await http({
            method: 'GET',
            url: '/favorite/getFavorited',
            data: {
                recipeId
            }
        })
        return res
    }

    /**
     * 根据菜谱id删除菜谱收藏
     */
    async function deleteByRecipeId(recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/favorite/delete',
            data: {
                recipeId
            }
        })
        return res
    }

    /**
     * 添加至指定的收藏夹中
     */
    async function addTo(favoritesId: number, recipeId: number) {
        const res = await http({
            method: 'POST',
            url: '/favorite/addTo',
            data: {
                favoritesId,
                recipeId
            }
        })
        return res
    }

    /**
     * 添加一个收藏夹
     */
    async function insertFavorites(favorites) {
        const res = await http({
            method: 'POST',
            url: '/favorites/insert',
            data: favorites
        })
        return res
    }

    /**
     * 修改收藏夹
     */
    async function updateFavorites(favorites) {
        const res = await http({
            method: 'POST',
            url: '/favorites/update',
            data: favorites
        })
        return res
    }

    /**
     * 批量删除菜谱收藏
     */
    async function deleteBatch(recipeIds: Array) {
        const res = await http({
            method: 'POST',
            url: '/favorite/deleteBatch',
            data: recipeIds
        })
        return res
    }

    /**
     * 删除菜谱收藏夹
     */
    async function deleteByFavoritesId(favoritesId) {
        const res = await http({
            method: 'POST',
            url: '/favorites/delete',
            data: favoritesId
        })
        return res
    }

    return { deleteByFavoritesId, deleteBatch, updateFavorites, insertFavorites, addTo, deleteByRecipeId, getFavorited, getAllFavorites, getAllFavorite, getById, getFavoritesInfo }
}