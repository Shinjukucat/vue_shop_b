<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 商品分类区域 -->
      <tree-table class="tree-table" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="">
        <!-- 第二列是否列 -->
        <template slot="isOk" slot-scope="scope"> 
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightGreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 第三列排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 第四列操作列 -->
        <template slot="opera" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRolesById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

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

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed">
        <!-- 内容主体区域 -->
          <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
              <!-- options用来指定数据源 -->
              <!-- props用来指定配置对象 -->
              <el-cascader
                v-model="selectedKeys"
                @change="parentCateChange"
                :options="parentCateList"
                :props="cascaderProps" clearable></el-cascader>
              </el-form-item>
          </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogClosed">
        <!-- 内容主体区域 -->
          <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
          </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表的参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // tree-table的每一列的对象
      columns: [
        // 第一列
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // 第二列
        {
          label: '是否有效',
          // 该列使用template自定义模板列
          type: 'template',
          // 使用的模板名称是isOk
          template: 'isOk'
        },
        // 第三列
        {
          label: '排序',
          // 该列使用template自定义模板列
          type: 'template',
          // 使用的模板名称是order
          template: 'order'
        },
        // 第四列
        {
          label: '操作',
          // 该列使用template自定义模板列
          type: 'template',
          // 使用的模板名称是opera
          template: 'opera'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级默认添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象  value指定选中的是哪个属性，label指定选中属性的名称，children指定父子的链接方式
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 被选中的父级分配的id数组
      selectedKeys: [],
      // 监听编辑分类对话框的显示与关闭
      editCateDialogVisible: false,
      // 编辑分类表单的数据对象
      editCateForm: {},
      // 编辑分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo});
    if(res.meta.status !== 200)
      return this.$message.error('获取商品分类数据失败！');

    console.log(res.data);
    // 把数据列表赋值给cataList
    this.cateList = res.data.result;
    // 将总数据条数赋值给total
    this.total = res.data.total;
    },

    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList()
    },
    // 监听页码值pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList()
    },
    // 点击添加分类按钮
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      // 再打开对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {
        params: {type: 2}
      });

      if(res.meta.status !== 200)
        return this.$message.error('获取父级数据失败！');

      console.log(res.data);
      this.parentCateList = res.data;
    },
    // 监听添加分类对话框的关闭
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      // 将选中的数据清空
      this.selectedKeys = [];
      // 将添加表单数据的值清空
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 选择项发生改变时触发这个方法
    parentCateChange() {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组的长度，说明我们选了父级分类
      // 否则，说明我们没有选择父级分类
      if(this.selectedKeys.length > 0){
        // 父级分类的id，数组里面的最后一个的id就是父级的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级赋值，数组的长度值就是就是添加商品的等级值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 如果没有选父级分类的话那他就是一级分类，父亲分类的id就是0
        // 父级分类的id
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定按钮，确定添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid)
          return;
        const {data: res} = await this.$http.post('categories', this.addCateForm);
        if(res.meta.status !== 201){
          console.log(res);
          return this.$message.error('添加分类失败！');
        }
        this.$message.success('添加分类成功！');
        this.getCateList();
        this.addCateDialogVisible = false;
      })
    },

    // 点击删除按钮删除分类
    async deleteRolesById(cateId) {
      // 弹框询问是否确定删除该用户信息
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).catch(err => {
          return err;
        })
      
      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！');
      }
      const {data: res} = await this.$http.delete(`categories/${cateId}`);
      if(res.meta.status !== 200){
        return this.$message.error('删除分类失败！');
      }
        
      this.$message.success('删除分类成功！');
      this.getCateList();
    },

    // 点击编辑按钮显示编辑对话框
    async showEditDialog(cateId) {
      const {data: res} = await this.$http.get(`categories/${cateId}`);
      if(res.meta.status !== 200)
        return this.$message.error('获取分类信息失败！');
      this.editCateForm = res.data;
      this.editCateDialogVisible = true
    },

    // 监听编辑分类对话框的关闭事件
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    
    // 点击确定按钮确定编辑分类
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid)
          return;
        const {data: res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {cat_name: this.editCateForm.cat_name});
        if(res.meta.status !== 200)
          return this.$message.error('更新分类失败！');
        this.$message.success('更新分类成功！');
        this.getCateList();
        this.editCateDialogVisible = false;
      })
    }
  },
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
