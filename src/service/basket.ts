import { http } from '@/utils/http';

export default function () {

    /**
     * 添加菜篮子
     */
    async function insertBasket(basketDto) {
        const res = await http({
            method: 'POST',
            url: '/vegetableBasket/add',
            data: basketDto
        })
        return res
    }

    /**
     * 查询用户所有的菜篮子
     */
    async function getAllBasket() {
        const res = await http({
            method: 'GET',
            url: '/vegetableBasket/getAll',
        })
        return res
    }

    /**
     * 删除指定菜篮子
     */
    async function deleteById(basketId) {
        const res = await http({
            method: 'POST',
            url: '/vegetableBasket/delete',
            data: basketId
        })
        return res
    }

    return { insertBasket, getAllBasket, deleteById }
}