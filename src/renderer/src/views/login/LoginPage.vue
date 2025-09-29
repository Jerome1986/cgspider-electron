<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { RegisterForm, RuleForm } from '@/types/Login'
import { LoginApi, registerApi } from '@/api/login'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { mousedown } from '@/utils/header/modules/mousedown'

// 定义store
const userStore = useUserStore()
// 定义路由
const router = useRouter()

// ============================
// 状态与表单模型（登录/注册）
// ============================
const isRegister = ref(false) // 是否为注册模式

// 登录表单
const form = ref<RuleForm>({
  username: '',
  password: ''
})

// 登录表单示例
const loginForm = ref<FormInstance>()

// 注册表单（需要确认密码）

const registerForm = ref<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: ''
})

// 注册表单实例
const registerFormRef = ref<FormInstance>()

// 加载态（登录/注册复用）
const loading = ref(false)

// ============================
// 表单规则（登录/注册）
// ============================
// 登录规则
const rules = ref<FormRules<RuleForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名不少于 3 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 个字符', trigger: 'blur' }
  ]
})

// 注册规则
const validateConfirm = (_: unknown, value: string, callback: (err?: Error) => void): void => {
  if (!value) return callback(new Error('请再次输入密码'))
  if (value !== registerForm.value.password) return callback(new Error('两次输入的密码不一致'))
  callback()
}

const registerRules = ref<FormRules<RegisterForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9]{5,20}$/, message: '长度为 6-21 位且英文开头加数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
})

// ============================
// 事件与函数（登录/注册切换、提交、重置）
// ============================
// 切换登录/注册
const toggleMode = (): void => {
  isRegister.value = !isRegister.value
  // 切换时重置对应表单
  loginForm.value?.resetFields()
  registerFormRef.value?.resetFields()
}

// 登录提交
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  try {
    loading.value = true
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        const res = await LoginApi(form.value.username, form.value.password)
        console.log('login submit!', res)
        if (res.code === 200) {
          //   todo  登录成功----存储用户信息----跳转主页面
          userStore.setUserInfo(res.data)
          ElMessage.success('登录成功')
          // 跳转到主页
          setTimeout(() => {
            router.push('/')
          }, 500)
        }
      } else {
        console.log('login error!', fields)
      }
    })
  } catch (error) {
    console.log('login error!', error)
  } finally {
    loading.value = false
  }
}

// 注册提交
const submitRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  try {
    loading.value = true
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        const res = await registerApi(registerForm.value.username, registerForm.value.password)
        console.log('register submit!', res, registerForm.value)
        if (res.code === 200) {
          //   todo 注册成功---存储信息---直接登录并跳转首页
          userStore.setUserInfo(res.data)
          ElMessage.success('登录成功')
          // 跳转到主页
          setTimeout(() => {
            router.push('/')
          }, 500)
        }
      } else {
        console.log('register error!', fields)
      }
    })
  } catch (error) {
    console.log('register error!', error)
  } finally {
    loading.value = false
  }
}

// 重置登录表单
const resetForm = (): void => {
  loginForm.value?.resetFields()
}

// 重置注册表单
const resetRegister = (): void => {
  registerFormRef.value?.resetFields()
}

// 鼠标按住拖动
</script>

<template>
  <div class="login" @mousedown="mousedown($event)">
    <div class="panel">
      <!-- 标题与副标题 -->
      <h1 class="title">{{ isRegister ? '用户注册' : '用户登录' }}</h1>
      <p class="subtitle">{{ isRegister ? '创建你的新账户' : '欢迎回来' }}</p>

      <!-- 登录表单 -->
      <el-form
        v-if="!isRegister"
        ref="loginForm"
        class="loginForm"
        :model="form"
        :rules="rules"
        label-width="auto"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>

        <div class="actions">
          <el-button type="primary" size="large" :loading="loading" @click="submitForm(loginForm)">登录</el-button>
          <el-button size="large" plain @click="resetForm">重置</el-button>
        </div>

        <p class="register-tip">没有账号？<span class="register-link" @click="toggleMode">去注册</span></p>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="registerFormRef"
        class="loginForm"
        :model="registerForm"
        :rules="registerRules"
        label-width="auto"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
        </el-form-item>

        <div class="actions">
          <el-button type="primary" size="large" :loading="loading" @click="submitRegister(registerFormRef)"
            >注册</el-button
          >
          <el-button size="large" plain @click="resetRegister">重置</el-button>
        </div>

        <p class="register-tip">已有账号？<span class="register-link" @click="toggleMode">去登录</span></p>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ============================
// 页面容器与背景
// ============================
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(1200px 600px at 20% 10%, #3a3a3a 0%, #1f1f1f 35%, #141414 100%);
  padding: 24px;

  // ============================
  // 面板卡片
  // ============================
  .panel {
    width: 380px;
    padding: 32px 28px 24px;
    border-radius: 12px;
    background: #2f2f2f;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);

    .title {
      color: #ffffff;
      font-size: 28px;
      margin: 0 0 8px;
      font-weight: 600;
      text-align: center;
    }

    .subtitle {
      margin: 0 0 20px;
      color: #b2b0b0;
      text-align: center;
      font-size: 14px;
    }

    // ============================
    // 表单样式（深色适配）
    // ============================
    .loginForm {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      :deep(.el-form-item__label) {
        color: #e9e9e9;
      }

      // 输入框深色适配
      :deep(.el-input__wrapper) {
        background: #3a3a3a;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
      }

      :deep(.el-input__inner::placeholder) {
        color: rgba(255, 255, 255, 0.45);
      }

      :deep(.el-input__inner) {
        color: #ffffff;
      }

      // 操作按钮区域
      .actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 8px 0 6px;

        :deep(.el-button--primary) {
          --el-button-bg-color: #427b02;
          --el-button-border-color: #427b02;
        }
      }

      // 底部提示与链接
      .register-tip {
        margin: 6px 0 0;
        color: #b2b0b0;
        text-align: center;
        font-size: 13px;

        .register-link {
          color: #427b02;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
