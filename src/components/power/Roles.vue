<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色 -->
      <el-button type="primary" @click="addDialogVisible='true'">添加角色</el-button>
      <!-- 用户角色列表区域 -->
      <el-table :data="rolesList" stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['el_item1_border_bottom', i1 === 0 ? 'el_item1_border_top' : '', 'align_center']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'el_item1_border_top', 'align_center']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightsById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightsById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope" stripe>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRolesById(scope.row.id)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightsDialog(scope.row)">分配权限</el-button> 
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="70px">
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
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
      <el-form-item label="名称" prop="roleName">
        <el-input v-model="editForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="roleDesc">
        <el-input v-model="editForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
    <!-- 树形组件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>
      <span slot="footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 添加角色表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加用户表单的验证规则对象
      addRolesFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          { min: 1, max: 15, message: '密码长度在 1 到 10 个字符', trigger: 'blur' }
        ],
      },

      // 控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      // 根据 id 查询到的用户信息对象
      editForm: {},
      // 修改用户信息表单验证规则对象
      editFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          { min: 1, max: 15, message: '密码长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },

      // 设置分配权限对话框默认为关闭状态
      setRightDialogVisible: false,

      // 存储请求到的权限列表
      rightsList: [],
      // 树形组件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认勾选的权限的id值组成的数组
      defaultKeys: [],
      // 保存分配权限用户的id值
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data: res} = await this.$http.get('/roles');
      if(res.meta.status !== 200)
        return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields()
    },

    // 点击按钮，添加新角色
    addRoles() {
      // 添加用户的预验证功能
      this.$refs.addRolesFormRef.validate(async valid => {
        // 表单验证为false，就是表单填写错误
        if(!valid)  return;

        // 表单验证成功
        // 可以发起添加用户的网络请求，请求路径是users，传入用户填写的表单数据
        const {data: res} = await this.$http.post('roles', this.addRolesForm);
        
        if(res.meta.status !== 201){
          this.$message.error('添加角色失败!');
        }

        this.$message.success('添加角色成功!');
        // 隐藏添加对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据/刷新
        this.getRolesList()
      })
    },

    // 展示修改用户对话框   先根据 ID 查询到角色，再在其下进行修改
    async showEditDialog(rolesid) {
      const {data: res} = await this.$http.get(`roles/${rolesid}`);
      // 将根据id查询到的信息保存到一个对象里面，下面再将这个对象里的数据渲染到dialog里面
      this.editForm = res.data;
      this.editDialogVisible = true
    },
    // 监听修改用户信息对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定修改用户信息
    editRolesInfo() {
      // 修改用户信息的预验证功能
      this.$refs.editFormRef.validate(async valid => {
        // 表单验证失败
        if(!valid)  return;

        // 表单验证成功，可以发起修改用户信息的请求，put里面的第一个数据时请求地址，第二个数据是请求数据要传入的参数
        const {data: res} = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc
        })

        // 对请求的返回结果进行操作
        if(res.meta.status !== 200) return this.$message.error('修改角色信息失败!');

        // 隐藏修改用户信息对话框
        this.editDialogVisible = false;
        // 刷新数据
        this.getRolesList()
        // 提示修改用户信息成功
        this.$message.success('修改角色信息成功!');
      })
    },
    // 点击删除按钮，通过id删除用户信息
    async deleteRolesById(rolesid) {
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
        const {data: res} = await this.$http.delete(`roles/${rolesid}`);
          

        // 请求结果
        if(res.meta.status !== 200){
          return this.$message.error('删除用户失败!');
        }
        
        this.$message.success('删除用户成功!');

        // 刷新页面
        this.getRolesList();
    },
    // 删除用户权限
    //将角色的id和点击删除的那个权限传入，角色id通过scope.row获得，角色权限因为每一个权限都有自己对应的id，所以可以通过权限id来删除对应的权限
    async removeRightsById(role, roleRight) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err;
      })

      if(confirmResult !== 'confirm')
        return this.$message.info('取消删除！')
      
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${roleRight}`)
      
      if(res.meta.status !== 200)
        return this.$message.erroe('删除角色权限失败！');
      this.$message.success('删除角色权限成功！');

      // 全局刷新的话整个页面都会刷新
      // this.getRolesList();
      // 将最新的权限数据赋给当前角色的权限数据，避免删除后整个页面刷新
      role.children = res.data;
    },

    // 展示分配权限对话框
    async showSetRightsDialog(role) {
      // 保存用户id
      this.roleId = role.id;
      // 在点击分配权限后发起请求将所有的权限的列表请求过来并存储
      const {data: res} = await this.$http.get('rights/tree');
      if(res.meta.status !== 200)
        return this.$message.error('获取权限列表失败！');
      // 请求成功的话就将请求到的数据保存到定义的数组中
      this.rightsList = res.data;
      console.log(this.rightsList);

      // 递归获取三级节点的id，递归结束后所有三级权限的id值就保存在了数组中
      this.getLeafKeys(role, this.defaultKeys);

      this.setRightDialogVisible = true;
    },

    // 通过递归的方式，获取角色下所有的三级权限的id值，并保存在defultKey数组中
    //首先将一级节点和一个空的数组传到函数里面，进入第一层遍历，对所有的一级节点进行遍历，发现一级节点有孩子，所以进入到第二层遍历，将所有二级节点进行遍历，进入一个二级节点后，进入第三层遍历，全部都是三级节点，对所有三级节点进行遍历，全部都没有孩子，一个个return到数组里面，知道最后一个三级节点后回到二级接节点，对第二个二级节点进行同样的遍历，一步步将所有三级节点的id加入到数组中
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children属性就是三级节点，就把return到数组里面，再接着遍历
      if(! node.children)
        return arr.push(node.id);

      // 不是三级节点时就在它的孩子里面再递归递归，item就是node.children里面的一个个孩子
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defaultKeys = [];
    },

    // 分配权限对话框的确定按钮
    async allocateRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const keysIdStr = keys.join(',');
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: keysIdStr});
      if(res.meta.status !== 200)
        return this.$message.error('分配角色权限失败！');
      this.$message.success('分配角色权限成功！');
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.el_item1_border_bottom {
  border-bottom: 1px solid #ccc;
}

.el_item1_border_top {
  border-top: 1px solid #ccc;
}

.align_center {
  display: flex;
  align-items: center;
}

</style>
