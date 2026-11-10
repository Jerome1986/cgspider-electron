/** 服务端授权文件，供渲染进程与原生下载进程共同使用。 */
export interface AuthorizedFile {
  /** 认证下载路径 */
  path: string
  /** 保存文件名 */
  name: string
}
/** 原生下载任务返回结果。 */
export type DownloadResult =
  | { /** 是否全部保存成功 */ ok: true; /** 实际本机目录 */ directory: string }
  | { /** 是否全部保存成功 */ ok: false; /** 失败原因 */ message: string }
