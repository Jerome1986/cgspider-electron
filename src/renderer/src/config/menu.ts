export interface MenuItem {
  id: string
  name: string
  en_name: string
  path: string
  icon: string
  activeIcon: string
}

export const menuList: MenuItem[] = [
  {
    id: 'model',
    name: '模型',
    en_name: 'model',
    path: '/model',
    icon: 'icon-bg-model',
    activeIcon: 'icon-model'
  },
  {
    id: 'maps',
    name: '贴图',
    en_name: 'maps',
    path: '/maps',
    icon: 'icon-tietu1',
    activeIcon: 'icon-tietu2'
  },
  {
    id: 'lighting',
    name: '灯光',
    en_name: 'lighting',
    path: '/lighting',
    icon: 'icon-dengguang',
    activeIcon: 'icon-dengguang'
  },
  {
    id: 'material',
    name: '材质',
    en_name: 'material',
    path: '/material',
    icon: 'icon-caizhi',
    activeIcon: 'icon-caizhi1'
  },
  {
    id: 'vip',
    name: '会员',
    en_name: 'vip',
    path: '/vipProduct',
    icon: 'icon-huiyuan1',
    activeIcon: 'icon-huiyuan'
  }
]
