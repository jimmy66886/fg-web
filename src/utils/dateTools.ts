/**格式化时间 */
/**
 *  data 为目标时间的日期
 */
export default function () {
    function timeFormate(inputDate: Date) {
        // 将输入日期字符串转换为日期对象
        const inputDateTime = new Date(inputDate);

        // 获取当前日期对象
        const currentDate = new Date();

        // 获取昨天日期对象
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);

        // 比较日期是否为昨天
        const isYesterday = (inputDateTime.getFullYear() === yesterdayDate.getFullYear() &&
            inputDateTime.getMonth() === yesterdayDate.getMonth() &&
            inputDateTime.getDate() === yesterdayDate.getDate());

        // 比较日期是否为今天
        const isToday = (inputDateTime.getFullYear() === currentDate.getFullYear() &&
            inputDateTime.getMonth() === currentDate.getMonth() &&
            inputDateTime.getDate() === currentDate.getDate());

        // 如果是昨天的日期
        if (isYesterday) {
            return '昨天 ' + inputDateTime.getHours() + '时' + inputDateTime.getMinutes() + '分';
        }

        // 如果是今天的日期
        if (isToday) {
            return '今天 ' + inputDateTime.getHours() + '时' + inputDateTime.getMinutes() + '分';
        }

        // 如果不是昨天或今天的日期，则直接返回原日期
        return inputDate;

    }
    return { timeFormate }
}