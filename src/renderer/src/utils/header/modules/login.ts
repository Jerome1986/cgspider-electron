import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'
import router from '@/router' // 用已创建的路由实例，别用 useRouter()

export const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true,
    customClass: 'custom-message-box'
  }).then(() => {
    const userStore = useUserStore() // 放到函数内部获取
    userStore.clearToken()
    router.push('/login')
    ElMessage({ message: '退出成功', type: 'success', duration: 2000 })
  })
}
