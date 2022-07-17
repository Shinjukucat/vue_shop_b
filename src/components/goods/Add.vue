<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" :closable="false" show-icon center></el-alert>

      <!-- 进度条区域 -->
      <el-steps :space="200" :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tabs标签栏区域 -->
      <!-- 选择哪个tab就会把对应的name绑定到model里，也就是保存到activeStep里面 -->
      <!-- 因为六个步骤里面填写的数据都是要提交到数据库的(在发起添加请求时也需要)，所以用一个大表单将他们都包裹起来，便于一起提交表单信息 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeStep" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <span>选择商品分类：</span>
              <!-- options用来指定数据源 -->
              <!-- props用来指定配置对象 -->
              <!-- selectedCateKeys 被选中的商品的id值会自动保存到这个数组中，id通过cascaderProps中的cate_id赋值 -->
              <el-cascader
                v-model="addForm.goods_cat"
                @change="handleChange"
                :options="cateList"
                :props="cascaderProps" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyParamsData" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="value" v-for="(value, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyParamsData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handelSuccess">
              <el-button size="medium" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="preImgDialogVisible"
      width="50%">
      <img :src="previewUrl" :alt="preViewImgName" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'

export default {
  data() {
    return {
      // 处于活跃的步骤
      activeStep: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选中的商品id会保存到该数组中，这个数组也要作为表单提交到数据库
        goods_cat: [],
        // 存储图片临时路径的表单属性
        pics: [],
        // 填写在富文本编辑器里的商品详情
        goods_introduce: '',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'},
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'},
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'},
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'},
        ],
        goods_cat: [
          {required: true, message: '请选择商品分类', trigger: 'blur'},
        ]
      },
      // 商品的分类列表
      cateList: [],
      // 指定级联选择器的配置对象  value指定选中的是哪个属性，label指定选中属性的名称，children指定父子的链接方式
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 保存请求到的动态参数数据
      manyParamsData: [],
      // 保存请求到的静态属性数据
      onlyParamsData: [],
      // 上传图片保存到后台的api地址
      uploadUrl: 'http://47.108.251.106:8881/api/private/v1/upload',
      // 图片上传组件的headers请求头，给上传图片的请求添加token值
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 点击预览图片的链接
      previewUrl: '',
      // 监听图片预览对话框的显示与隐藏
      preImgDialogVisible: false,
      // 预览图片的名字
      preViewImgName: ''
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品的分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories');
      if(res.meta.status !== 200)
        return this.$message.error('获取分类数据失败！');
      // this.$message.success('获取分类数据成功！');
      this.cateList = res.data;
    },
    // 级联选择框中选项发生改变时会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat)
    },
    // 根据这个返回值判断能否进行tab栏切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页：' + oldActiveName);
      // console.log('即将打开的标签页：' + activeName);
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
        this.$message.error('请选择商品分类！');
        return false;
      }
    },
    // 监听tab栏切换操作
    async tabClicked() {
      // console.log(this.activeStep);
      // 如果点击的是切换到 商品参数 Tab模块
      if(this.activeStep === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, 
        {params: {sel: 'many'}});
      if(res.meta.status !== 200)
        return this.$message.error('获取参数列表失败！');

      // 将data中的attr_vals由字符串转换成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',');
      })
      this.manyParamsData = res.data;
      }

      if(this.activeStep === '2') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
        {params: {sel: 'only'}});
        if(res.meta.status !== 200) 
          return this.$message.error('获取属性列表失败！');
        this.onlyParamsData = res.data;
        console.log(this.onlyParamsData)
      }
    },
    // 点击预览图片的操作
    handlePreview(file) {
      // 打印一下file查看内部结构
      console.log(file);
      // 把点击预览的那张照片的地址和名字保存起来
      this.previewUrl = file.response.data.url;
      this.preViewImgName = file.name;
      this.preImgDialogVisible = true;
    },
    // 点击移除图片的操作
    handleRemove(file) {
      // console.log(file) 查看file对象的内容
      // 1.获取删除的图片的临时路径
      const filePath = file.response.data.tem_path;
      // 2.从pics数组中根据图片路径找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 3.调用数组的splice方法，把删除图片的对象从数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功事件，上传成功后就将图片的临时途经存储到表单对象中
    handelSuccess(response) {
      console.log(response);
      const temPics = {pic: response.data.tmp_path};
      this.addForm.pics.push(temPics);
      console.log(this.addForm.pics)
    },
    // 添加商品按钮
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid)
          return this.$message.error('请填写必要的表单项！');
        // 解决goods_cat参数的问题
        // 添加商品的请求参数里需要goods_cat是字符串形式，而这里如果直接将goods_cat改成字符串形式与级联选择器里的要求相反，会报错，所以用深拷贝的方式将这对象深拷贝一份再对拷贝出来的对象进行操作
        // lodash  cloneDeep(obj) 可以实现对obj的克隆深拷贝，拷贝出来的对象与原来的对象完全一样且相互独立，互补干扰
        const cloneAddForm = _.cloneDeep(this.addForm);
        cloneAddForm.goods_cat = cloneAddForm.goods_cat.join(',');
        // console.log(cloneAddForm.goods_cat);

        // 解决attrs参数问题
        // 处理动态参数
        this.manyParamsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyParamsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        cloneAddForm.attrs = this.addForm.attrs

        
      // 发起请求添加商品
      const {data: res} = await this.$http.post('goods', cloneAddForm);
      if(res.meta.status !== 201) {
        return this.$message.error(res.meta.msg);
      }
       
      this.$message.success('添加商品成功！');
      this.$router.back()
      })
    }
  },
  computed: {
    // 通过计算属性拿三级属性的id
    cateId() {
      if(this.addForm.goods_cat.length === 3)
        return this.addForm.goods_cat[2];
      return null;
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important
}

.el-upload__tip {
  margin: 10px 3px;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>