/**
 * 首页-广告区域数据类型
 */
export type Recipe = {
    recipeId: string,
    title: string,
    intro: string,
    nickName: string,
    likeNumber: number,
    favoriteNumber: number,
    views: number
}

export type RecipeDto = {
    title: string,
    orderBy: string
    page: number,
    pageSize: number
}