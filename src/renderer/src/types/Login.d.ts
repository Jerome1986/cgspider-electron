// 登录/注册表单类型
export interface RuleForm {
  username: string
  password: string
  captcha?: string
}

// 注册表单类型
export interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
}
