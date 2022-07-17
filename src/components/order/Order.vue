<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-input
        placeholder="请输入内容"
        v-model="queryInfo.query"
        clearable
        @clear="getOrderList"
        class="el-input-top"
      >
        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
      </el-input>

      <!-- 订单列表区域 -->
      <el-table :data="orderList" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="450px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="130px"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="130px">
          <template slot-scope="scope">
            <el-button type="success" plain size="mini" v-if="scope.row.pay_status === '1'">已付款</el-button>
            <el-button type="danger" plain size="mini" v-else>未付款</el-button>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="130px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="210px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDialog(scope.row.goods_id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" @click="orderProgressDialog()"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
      >
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <!-- <el-input v-model="addressForm.address1"></el-input> -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- addressForm.address1 被选中的商品的id值会自动保存到这个数组中，id通过cascaderProps中的cate_id赋值 -->
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="cascaderProps" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2" width="100%">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 订单物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <div class="radio">
        <!-- 排序： -->
        <!-- <el-radio-group v-model="reverse">
          <el-radio :label="true">倒序</el-radio>
          <el-radio :label="false">正序</el-radio>
        </el-radio-group> -->
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      queryInfo: {
        // query就是搜索关键字，在实现搜索功能时起作用
        query: "",
        // 当前的页数 1是默认在第一页
        pagenum: 1,
        // 当前每页展示的数据数 2是默认一页展示两条数据
        pagesize: 10,
      },
      // 请求到的订单列表数据
      orderList: [],
      total: 0,
      addressVisible: false,
      addressForm: {
        // 级联选择器中被选中的元素的id会以数组形式保存在v-model绑定的对象上
        address1: [],
        address2: ''
      },
      // 指定级联选择器的配置对象  value指定选中的是哪个属性，label指定选中属性的名称，children指定父子的链接方式
      cascaderProps: {
        expandTrigger: 'hover',
        // value: 'order_id',
        // label: 'order_number',
        // children: 'children',
      },
      addressFormRules: {
        address1: [
          {required: true, message: '请选择省市区/县', trigger: 'blur'},
        ],
        address2: [
          {required: true, message: '请填写详细地址', trigger: 'blur'},
        ]
      },
      cityData,
      progressVisible: false,
      // 将请求到的订单物流信息以数组形式保存
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表信息
    async getOrderList() {
      const {data: res} = await this.$http.get('orders', 
      {params: this.queryInfo});
      if(res.meta.status !== 200)
        return this.$message.error(res.meta.msg);
      console.log(res);
      this.$message.success('获取订单列表成功！');
      this.orderList = res.data.goods;
      this.total = res.data.total
    },
    
    // 监听每页条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 监听现在页数的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    showAddressDialog(row) {
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async orderProgressDialog() {
      const {data: res} = await this.$http.get('/kuaidi/1106975712662');
      if(res.meta.status !== 200)
        return this.$message.error(res.meta.msg);
      this.$message.success('获取订单物流信息成功！');
      this.progressInfo = res.data;
      console.log(this.progressInfo)
      this.progressVisible = true
    }
  },
}
</script>

<style style="less" scoped>
.el-input-top {
  width: 350px;
}

.el-cascader {
  width: 100%;
}


</style>