import { request } from '@/utils/request'
import { MaterialLoveResult, MaterialPageResult } from '@/types/Material'

/**
 * 综合筛选素材
 * /material-filterGet
 * @param type - 页面类型
 * @param top_id - 一级分类ID
 * @param sub_id - 二级分类ID
 * @param third_id - 三级分类ID
 * @param aittributeTags - 所选择的属性标签ID
 * @param colorTags - 所选择的颜色标签ID
 * @param isDownloaded - 是否勾选了已下载
 * @param isLoved - 是否勾选了已收藏
 * @param user_id - 当前用户ID
 * @param pageNum - 页码
 * @param pageSize - 条数
 */
export const materialListGetApi = (
  type: string,
  top_id: string,
  sub_id: string,
  third_id: string,
  aittributeTags: string[],
  colorTags: string[],
  isDownloaded: boolean,
  isLoved: boolean,
  user_id: string,
  pageNum: number = 1,
  pageSize: number = 10
) => {
  return request<MaterialPageResult>({
    method: 'GET',
    url: '/material-filterGet',
    params: {
      type,
      top_id,
      sub_id,
      third_id,
      aittributeTags,
      colorTags,
      isDownloaded,
      isLoved,
      user_id,
      pageNum,
      pageSize
    }
  })
}

/**
 * 收藏素材接口
 * /user-loveList-add
 * @param user_id
 * @param material_id
 */
export const materialListLoveApi = (user_id: string, material_id: string) => {
  return request<MaterialLoveResult | null>({
    method: 'POST',
    url: '/user-loveList-add',
    data: { user_id, material_id }
  })
}

/**
 * 获取用户的收藏列表
 * @param user_id - 当前用户ID
 */
export const materialListLoveGetApi = (user_id: string) => {
  return request<MaterialLoveResult[]>({
    method: 'GET',
    url: '/user-loveList-get',
    params: { user_id }
  })
}
