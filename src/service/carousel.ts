import { http } from '@/utils/http';

export default function () {

    /**
     * 添加菜篮子
     */
    async function getCarouselList() {
        const res = await http({
            method: 'GET',
            url: '/carousel/get'
        })
        return res
    }

    return { getCarouselList }
}