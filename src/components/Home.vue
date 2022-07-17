<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../assets/images/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="loginOut">退出</el-button>
      </el-header>

      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏区域 -->
        <el-aside :width="isCollapse ? '64px' : '200px'" >
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <!-- 下面后三个属性要求都是bool值，所以需要添加绑定事件 :  -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath"
          >
            <!-- 一级菜单区域 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>

              <!-- 二级菜单区域 -->
              <!-- 把每个二级菜单的路径绑定到index上 -->
              <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/' + subitem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{subitem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>

        <!-- 右侧内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  // 设置一个组件私有数据
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 菜单栏的折叠与展开
      isCollapse: false,
      // 定义一个数据保存激活链接的地址
      activePath: ''
    }
  },
  // 生命周期函数
  created() {
    this.getMenuList(),
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取所有侧边栏菜单
    async getMenuList() {
      const {data: res} = await this.$http.get('menus');
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res)
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

/* elementui组件的名称就可以当做它的类名 */
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  /* 下面这句让按钮垂直居中，这是flex布局的侧轴控制 */
  align-items: center;
  /* 用下面的方法表示el-header下面的div */
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  > .el-menu {
    border-right: 0;
  }
}

.toggle-button {
  height: 24px;
  line-height: 24px;
  background-color: #4a5064;
  color: #fff;
  font-size: 14px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}
</style>
