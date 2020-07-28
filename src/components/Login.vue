<template>
  <div class="login_container">
    <!-- 登录框 -->
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <el-form-item prop="username">
          <!-- 用户名 -->
          <el-input prefix-icon="el-icon-s-custom" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <!-- 密码 -->
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="login_btn">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="info" @click="loginFormReset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 重置功能
    loginFormReset() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 表单预验证
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登陆失败！')
        this.$message.success('登陆成功')
        // console.log(res)
        // 将登录成功后的token保存到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 通过编程式导航跳转到主页面
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  height: 300px;
  width: 450px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); // 向左上方位移半个宽度和高度
  border-radius: 5px;

  .avatar_box {
    height: 130px;
    width: 130px;
    // border:1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
    .login_btn {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
