export function padZero(num: number): string {
  return num < 10 ? '0' + num : String(num)
}

// 格式化时间
export type DateFormatType = 1 | 2
export function formatTimestamp(timestamp: number | string | Date, type: DateFormatType = 1): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  // 非法时间戳返回空字符串，避免异常
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1) // 月份是从0开始的，所以需要+1
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())

  // 默认返回年月日
  if (type === 1) return `${year}-${month}-${day}`
  // 如果不是1 就返回到秒
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
