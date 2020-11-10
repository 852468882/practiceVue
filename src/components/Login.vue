<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区-->
      <div class="avatar_box">
        <img src="../assets/imgs/touxiang.jpg" alt="">
      </div>
      <!--登录表单区域-->
      <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginFromRules">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            placeholder="请输入账号"
            v-model="loginForm.username"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            placeholder="请输入密码"
            v-model="loginForm.password"
            show-password></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      // 登录表单的数据绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单的验证规则
      loginFromRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
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
    // 重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录按钮
    login () {
      this.$refs.loginFormRef.validate((valid, obj) => {
        // valid: 验证结果，true或false
        // obj: 表单对象，说不清，可以打印一下看看
        if (valid) {
          this.$http.post('login', this.loginForm).then(
            resp => {
              if (resp.data.status === 200) {
                this.$message.success('登录成功')
                // 1. 将登录成功后的 token 保存到客户端的 sessionStorage 中
                //  1.1 项目中除了登录之外的其他 API 接口，必须在登录成功后才能访问
                //  1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中

                window.sessionStorage.setItem('token', resp.data.msg)

                // 2. 通过编程式导航跳转到主页，路由是 /home
                this.$router.push('/home')
              } else if (resp.data.status === 400) {
                return this.$message.error('用户名密码不匹配')
              } else {
                return this.$message.error('登录失败')
              }
            }
          )
        }
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
  width: 450px;
  height: 300px;
  background-color: #ffffff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.avatar_box {
  width: 100px;
  height: 100px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 0 5px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 25px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}

</style>
