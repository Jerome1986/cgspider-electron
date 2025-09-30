/**
 * 计算会员剩余天数
 * @param expiry 会员到期时间 (Date 或字符串 或 null)
 * @returns { daysLeft: number, expired: boolean }
 */
export function calcMembershipLeft(expiry: string | Date | null) {
  if (!expiry) {
    return { daysLeft: 0, expired: true }
  }

  const now = new Date()
  const expiryDate = new Date(expiry)

  // 计算毫秒差
  const diff = expiryDate.getTime() - now.getTime()

  // 转换成天，向下取整
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24))

  return {
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    expired: diff <= 0
  }
}
