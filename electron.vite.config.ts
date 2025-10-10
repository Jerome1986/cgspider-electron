import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    base: './',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] })
    ],
    server: {
      proxy: {
        '/api': {
          target: 'https://etnrve3alw.gzg.sealos.run',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '') // 移除 /api 前缀
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/variables.scss" as *;\n@use "@/assets/mixins.scss" as *;\n`
        }
      }
    }
  }
})
