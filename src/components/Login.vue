<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区 -->
      <el-form  ref="loginFormRef" :model = "loginForm" :rules="loginFormRules" class="login_form" label-width="0px">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type='password'></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type='primary' @click="login">登录</el-button>
          <el-button type='info' @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 这是登录表单的数据绑定对象
        loginForm: {
          // 添加数据属性
          username: '',
          password: ''
        },
        // 这是表单的验证规则对象
        loginFormRules: {
          // 验证用户名是否合法
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          // 验证密码是否合法
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 实现点击重置按钮，重置表单数据
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields();
      },
      login() {
        // 登录前的预验证，登录组件根据预验证判断是否向服务器发送登录请求
        //当验证用户名和密码的格式都输入正确时回调函数返回的是true，反之是false
        this.$refs.loginFormRef.validate(async valid => {
          if(!valid)  return;
          const {data: res} = await this.$http.post("login", this.loginForm);  
          //请求方式是post，请求路径是/login，请求参数是登录表单用户输入的数据，是一个对象
          //使用async和await可以简化Promise操作，进行优化，直接得到对象
          //{data: res}这句将对象里的data属性解构出来并重命名为res，对象里只有data属性是向服务器请求过来的，其他的都是axios自带的
          if(res.meta.status !== 200) this.$message.error('登录失败！');
          else  this.$message.success('登录成功！');
          // 1.将登录成功后的token保存到客户端的sessionStorage中
              // 1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
              // 1.2 token只应该在当前网站打开期间生效，所以token保存在sessionStorage中
          // sessionStorage小括号里面的参数是 键和值
          window.sessionStorage.setItem("token", res.data.token);
          // 2.通过编程式导航跳转到后台主页
          this.$router.push('/home');
        });
      }
    },
  }
</script>

<style lang='less' scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  // 用定位把盒子移到正中间，x方向上应该是向右移动页面的50%再减去盒子自身宽度的一半，y方向上同理
  position: absolute;
  left: 50%;
  top: 50%;
  // 这个盒子用absolute定位后，左50%，上50%，这50%里面还有这个盒子自身的宽高在，所以，下面的方法是减去盒子自身的一半的宽高
  // 下面的50%是这个盒子的width和height值的一半
  // 第一个值是x轴，第二个值是y轴
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    // 50%的圆角就是圆
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
      // 给图片加圆角
      border-radius: 50%;
      background-color: #eee;
    }
  }

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>