# cgs-api 接口对接说明

本次客户端为 `cgspider-electron`，服务端为相邻的 `cgs-api`。不迁移旧 `cgsweb` 的封面组件，也不调整当前封面的懒加载、并发、预览或缓存策略。CSP 仅同步当前 API 与资源域名，以允许请求新后端。

## 地址与运行

- 开发：`.env.development` 为 `http://localhost:3000`，需先启动本地 cgs-api。
- 生产：`.env.production` 为 `https://api.topcg.top`，不附加 `/api`；具体接口声明完整前缀。
- 用户令牌通过 Authorization 发送，401 只清理发出该请求时的当前身份。普通网络错误不会清理登录。
- 请求工具返回 `{code,message,data}`，失败会抛出异常；不再返回伪造的空成功对象。
- **服务端的多选 tags/colors 查询参数需一并部署**，否则旧服务端会以 HTTP 400 拒绝这些新参数；无数据库或迁移变更。
- 自定义后端地址时需同步环境变量、页面 CSP 与原生下载的可信 origin 白名单。

## 已对接契约

| 功能 | 方法与路径 | 响应或行为 |
| --- | --- | --- |
| 注册 / 登录 | POST `/user-register`、`/user-login` | 注册成功后显式登录，再读取当前资料；用户名6至12位，无空白 |
| 当前用户 | GET `/api/user-web-get`、`/api/user-download-status` | 合并 endDate、会员有效状态与 dailyUsed；不再调用 userById、vipEndTime |
| 分类 | GET `/cate-first?pageType=…`、`/cate-sub?cateId=…` | 一级为数组，子级为 `data[0].subCategories` |
| 标签 | GET `/api/attributeTag-get`、`/api/colorTag-get` | 读取 `data.list`，当前后端字典不按页面类型区分 |
| 素材 / 搜索 | GET `/api/filterMaterial` | 当前分类、类型、关键词、属性、颜色和分页统一提交 |
| 本机 / 收藏筛选 | POST `/api/user-material-filter` | onlyFavorites 与核验过的 localIds 组合筛选，空 localIds 返回空结果 |
| 收藏 | POST `/api/user-loveList-add`、GET `/api/user-loveList-get` | 明确发送 collected=true/false，不信任客户端 user_id |
| 下载授权 | POST `/api/user-download-authorize` | material_id 由服务端验证；首次扣费、重复素材复用授权 |
| 实际下载 | GET `/api/user-download-file` | 原生进程逐文件下载；跨域307只允许既定签名COS地址，不向COS转发用户令牌 |
| 下载完成 / 历史 | POST `/api/user-add-download`、GET `/api/user-downloadList-get` | 全部文件保存成功后确认历史；不上传本地文件路径 |
| 商品 | GET `/api/products-get` | data直接为数组；仅展示在售商品，购买暂未开放 |
| 水印 | GET `/api/watermark-randomGet` | data.images；不调用管理员水印列表 |

素材筛选中：多选属性ID转换为字典名称，颜色传十六进制值。新增 tags/colors 数组每组最多100项，所有选中项均须匹配；旧 tag/color 单选参数继续支持。默认最新入口使用 NEW，最多100条/页；移除旧客户端200条选项。

当前 cgs-api 素材只关联一级与二级分类，三级分类可以读取，但查询素材按已有后端行为返回空；本次未扩展数据模型。

## 本机与下载

服务端历史不证明本机文件存在。下载目录在客户端按账号保存，核验实际文件后才参与“本机有”筛选、打开和拖拽。旧服务的用户/素材ID与新服务不同，不自动把旧路径绑定到新编号，也不删除原文件。

原生下载使用临时 `.part` 文件、长度校验及可用时的SHA256校验；全部文件成功后才标记完成。ZIP在临时目录解压，拒绝越界条目及符号链接，保留原压缩包。失败不确认完成，服务端已取得的授权可在重试时复用，不再次扣费。

## 已执行验证与边界

- 客户端 main / preload 与 renderer 类型检查、改动文件 ESLint、生产构建。
- `node --test tests/api-contract.test.cjs`：5项，覆盖响应解包、组合筛选、取消收藏、注册后登录、401竞态、多文件下载与跨域令牌隔离。
- cgs-api 的素材、用户认证与用户素材契约测试：30项；隔离数据库，不写生产数据。
- `electron tests/desktop-integration.cjs`：构建后的真实 Electron renderer + 隔离模拟 API，覆盖登录、资料与额度、四类素材、标签筛选、商品和禁用购买。结果写入 `.integration-result.json`，测试配置目录与结果不进入Git或安装包。
- 线上6个公开只读接口返回HTTP200，核对分类、标签、商品、水印和100条素材列表的响应结构。

尚未执行生产账号注册、真实扣费授权、真实素材包/COS/ZIP联调或生产部署；模拟接口测试不代表这些流程已经在线验收。封面加载效果与性能由用户另行测试。
