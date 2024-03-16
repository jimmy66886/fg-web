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

    return { getAllFavorites, getAllFavorite, getById ,getFavoritesInfo}
}