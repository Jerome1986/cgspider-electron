// 主进程处理拖拽逻辑的函数
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export interface startDragResult {
  success: boolean
  dragFile?: string | null
  tempIcon?: string
  error?: string
}

// app.isPackaged --当前环境  false开发环境  true 生产环境

export const startDrag = (basePath: string, fileType: string, txtFile: string): startDragResult => {
  console.log(`准备拖拽操作: 路径 ${basePath}, 类型 ${fileType}, 数据文件 ${txtFile}`)
  console.log('当前环境', app.isPackaged)

  const scriptsDir = resolveScriptsDir()
  console.log('获取脚本目录', scriptsDir)

  let dragFile: string | null = '' // 最终拖拽的文件
  let txtFilePath = '' // 资源路径文本文件

  switch (fileType) {
    case 'maps': {
      // if (!textureFile) return { success: false, error: '未找到图片文件' }
      dragFile = fs.statSync(basePath).isDirectory() ? findTextureFile(basePath) : basePath
      break
    }

    case 'model':
      dragFile = path.join(scriptsDir, 'Mol.ms')
      txtFilePath = path.join(scriptsDir, 'moldata.txt')
      break

    case 'material':
      dragFile = path.join(scriptsDir, 'Mat.ms')
      txtFilePath = path.join(scriptsDir, 'matdata.txt')
      break

    case 'lighting':
      dragFile = path.join(scriptsDir, 'ies.ms')
      txtFilePath = path.join(scriptsDir, 'iesdata.txt')
      break
  }

  if (txtFilePath) {
    // 如果 basePath 是目录，对应文件路径写入 txt
    let realPath = basePath
    if (fileType === 'model' || fileType === 'material' || fileType === 'lighting') {
      // 你可以根据需要在这里处理 basePath -> 具体文件路径
      // 简单写成 basePath 即可
      realPath = basePath.replace(/[\\/]/g, '\\') // Windows 路径规范
    }
    fs.writeFileSync(txtFilePath, realPath + '\n', 'utf8')
    console.log('写入路径成功', dragFile)
  }

  const tempIcon = path.join(scriptsDir, 'icon.png') // 可用空白图

  return {
    success: true,
    dragFile,
    tempIcon
  }
}

// ========================
// 获取 scripts 目录
// ========================
function resolveScriptsDir(): string {
  let scriptsDir = ''
  if (!app.isPackaged) {
    // 开发模式
    scriptsDir = path.join(process.cwd(), 'resources', 'scripts')
  } else {
    // 打包模式
    scriptsDir = path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'scripts')
  }

  if (!fs.existsSync(scriptsDir)) console.warn('Scripts 目录不存在:', scriptsDir)
  return scriptsDir
}

// ========================
// 查找 texture 文件
// ========================
function findTextureFile(dir: string): string | null {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null
  const files = fs.readdirSync(dir)
  const exts = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.gif']
  const file = files.find((f) => exts.includes(path.extname(f).toLowerCase()))
  return file ? path.join(dir, file) : null
}
