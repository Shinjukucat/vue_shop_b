<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> -->
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible='true'">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe>
        <!-- index一般情况下就是索引的意思 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 下面的作用域插槽会覆盖状态的prop，所以状态的prop已经不起作用了 -->
          <template slot-scope="scope">
            <!-- scope.row可以获取到所有的数据 -->
            <el-switch v-model="scope.row.mg_state" @change="userInfoChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改用户对话框内容主体区域 -->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if(regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return callback()
      }

      callback(new Error('请输入合法的手机号'))
    }

    return {
      // data里面放的是当前组件的私有对象，只有放在这里面的对象才能被上面的组件调用
      // 获取用户列表的参数对象，queryInfo里面的数据通过get请求传入
      queryInfo: {
        // query就是搜索关键字，在实现搜索功能时起作用
        query: "",
        // 当前的页数 1是默认在第一页
        pagenum: 1,
        // 当前每页展示的数据数 2是默认一页展示两条数据
        pagesize: 2,
      },
      // 保存请求到的数据
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      // 根据id查询到的用户信息对象
      editForm: {},
      // 修改用户信息表单验证规则对象
      editFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      // 你把现在每页的数据数同步到data里后还要重新请求一次数据
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage;
      // 让页码数也同步改变
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userInfoChange(userinfo) {
      console.log(userinfo);
      // 下面这条代码实现向数据库发送修改请求  修改状态后向服务器再次发送一次请求，修改使用put请求，请求成功的话就会修改状态
      const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
      if(res.meta.status !== 200) {
        userinfo.mg_state = ! userinfo.mg_state;
        this.$message.error('更新用户状态失败!');
      }
      this.$message.success('更新用户状态成功!');
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      // 添加用户的预验证功能
      this.$refs.addFormRef.validate(async valid => {
        // 表单验证为false，就是表单填写错误
        if(!valid)  return;

        // 表单验证成功
        // 可以发起添加用户的网络请求，请求路径是users，传入用户填写的表单数据
        const {data: res} = await this.$http.post('users', this.addForm);
        
        if(res.meta.status !== 201){
          this.$message.error('添加用户失败!');
        }

        this.$message.success('添加用户成功!');
        // 隐藏添加对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据/刷新
        this.getUserList()
      })
    },
    // 展示修改用户对话框
    async showEditDialog(userid) {
      const {data: res} = await this.$http.get(`users/${userid}`);
      // 将查询到的信息保存到一个对象里面，下面再将这个对象里的数据渲染到dialog里面
      this.editForm = res.data;
      this.editDialogVisible = true
    },
    // 监听修改用户信息对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定修改用户信息
    editUserInfo() {
      // 修改用户信息的预验证功能
      this.$refs.editFormRef.validate(async valid => {
        // 表单验证失败
        if(!valid)  return;

        // 表单验证成功，可以发起修改用户信息的请求，put里面的第一个数据时请求地址，第二个数据是请求数据要传入的参数
        const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email, mobile: this.editForm.mobile
        })

        // 对请求的返回结果进行操作
        if(res.meta.status !== 200) return this.$message.error('修改用户信息失败!');

        // 隐藏修改用户信息对话框
        this.editDialogVisible = false;
        // 刷新数据
        this.getUserList()
        // 提示修改用户信息成功
        this.$message.success('修改用户信息成功!');
      })
    },
    // 点击删除按钮，通过id删除用户信息
    async deleteUserById(userid) {
      // 弹框询问是否确定删除该用户信息
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err;
        })

        // 如果用户确定删除，则返回一个字符串 confirm，如果用户取消删除，则返回一个字符串 cancel
        // console.log(confirmResult)

        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除');   
        }
        // 用户点击了确定，可以发起请求
        const {data: res} = await this.$http.delete(`users/${userid}`);
          

        // 请求结果
        if(res.meta.status !== 200){
          return this.$message.error('删除用户失败!');
        }
        this.$message.success('删除用户成功!');
        
        // 刷新页面
        this.getUserList();
    }
  }
}
</script>

<style lang="less" scoped>
</style>