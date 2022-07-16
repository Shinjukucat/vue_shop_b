<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加分类 -->
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="600px"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="130px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="130px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time"  width="200px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表的参数对象，queryInfo里面的数据通过get请求传入
      queryInfo: {
        // query就是搜索关键字，在实现搜索功能时起作用
        query: "",
        // 当前的页数 1是默认在第一页
        pagenum: 1,
        // 当前每页展示的数据数 2是默认一页展示两条数据
        pagesize: 10,
      },
      // 所有商品列表
      goodsList: [],
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods',
      {params: this.queryInfo});
      if(res.meta.status !== 200)
        return this.$message.error('获取商品列表失败！');

      this.$message.success('获取商品列表成功！');
      console.log(res);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },

    // 监听每页条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 监听现在页数的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 删除商品按钮
    async deleteGoodsById(goodsId) {
      // 弹框询问是否确定删除该用户信息
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err;
        })

      if(confirmResult !== 'confirm')
        return this.$message.info('已取消删除商品！');
      const {data: res} = await this.$http.delete(`goods/${goodsId}`);
      if(res.meta.status !== 200)
        return this.$message.error('删除商品失败！');
      this.$message.success('成功删除商品！');
      this.getGoodsList();
    },
    // 添加商品按钮
    addGoods() {
      this.$router.push('goods/add');
    }
  },
};
</script>

<style lang="less" scoped>
</style>
