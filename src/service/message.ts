import { http } from '@/utils/http';

export default function () {
    /**
     * 查询用户收到的系统消息
     */
    async function getMessage() {
        const res = await http({
            method: 'GET',
            url: '/message/get'
        })
        return res
    }

    return { getMessage }
}