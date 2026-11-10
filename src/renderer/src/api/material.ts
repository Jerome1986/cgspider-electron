import { request } from '@/utils/request'
import { useTagStore, useMaterialStore } from '@/stores'
import type { MaterialDownLoad, MaterialLoveResult, MaterialPageResult, DownloadGrant } from '@/types/Material'

/** 将页面筛选映射为cgs-api契约，多选属性传名称，颜色传色值。 */
export const materialListGetApi = async (
  type: string,
  top_id: string,
  sub_id: string,
  third_id: string,
  attributeIds: string[],
  colors: string[],
  local: boolean,
  favorites: boolean,
  _userId: string,
  pageNum = 1,
  pageSize = 10,
  keyword = ''
) => {
  const tags = useTagStore()
    .aittributeTag.filter((tag) => attributeIds.includes(tag._id))
    .map((tag) => tag.name)
  const query = {
    pageType: type,
    cateId: third_id || sub_id || top_id || 'NEW',
    tags,
    colors,
    searchVal: keyword,
    pageNum,
    pageSize
  }
  if (local || favorites) {
    const localIds = local ? await useMaterialStore().localMaterialIds() : undefined
    return request<MaterialPageResult>({
      url: '/api/user-material-filter',
      method: 'POST',
      data: { ...query, onlyFavorites: favorites, ...(localIds ? { localIds } : {}) }
    })
  }
  return request<MaterialPageResult>({ url: '/api/filterMaterial', params: query })
}
/** 收藏设置明确目标状态；isLove沿用页面约定，true表示尚未收藏。 */
export const materialListLoveApi = (_userId: string, material_id: string) =>
  request<{ collected: boolean }>({
    url: '/api/user-loveList-add',
    method: 'POST',
    data: { material_id, collected: useMaterialStore().isLove(material_id) }
  })
export const materialListLoveGetApi = (_userId: string) =>
  request<MaterialLoveResult[]>({ url: '/api/user-loveList-get' })
export const materialDownLoadListApiGet = (_userId: string) =>
  request<MaterialDownLoad[]>({ url: '/api/user-downloadList-get' })
export const materialDownLoadListApiAdd = (_userId: string, material_id: string, _filePath: string) =>
  request({ url: '/api/user-add-download', method: 'POST', data: { material_id } })
export const downloadVerifyApi = (material_id: string) =>
  request<DownloadGrant>({ url: '/api/user-download-authorize', method: 'POST', data: { material_id } })
