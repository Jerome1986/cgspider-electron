import { ref } from 'vue'

const isKeyDown = ref(false)
const dinatesX = ref(0)
const dinatesY = ref(0)
export const mousedown = (e: MouseEvent): void => {
  isKeyDown.value = true
  dinatesX.value = e.x
  dinatesY.value = e.y

  // 鼠标按住开始执行逻辑
  document.onmousemove = (ev) => {
    if (isKeyDown.value) {
      const x = ev.screenX - dinatesX.value
      const y = ev.screenY - dinatesY.value //给主进程传入坐标
      const data = {
        appX: x,
        appY: y
      }

      // 通知主进程
      window.electron.ipcRenderer.invoke('custom-adsorption', data)
    }
  }

  // 鼠标松开就停止
  document.onmouseup = () => {
    isKeyDown.value = false
  }
}
