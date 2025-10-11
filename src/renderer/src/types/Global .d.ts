// 新增返回类型
export interface addResult {
  insertedId: string
}

// 删除返回类型
export interface deleteResult {
  deletedCount: number
}

// 更新返回类型
export interface editResult {
  matchedCount: number
  modifiedCount: number
}
