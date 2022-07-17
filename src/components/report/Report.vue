<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <div ref="chart" style="width: 750px; height: 450px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import _ from 'lodash'
export default {
  data() {
    return {
      // 折线图的鼠标跟随效果
        options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
    }
  },
  // 将图标的渲染放在mountedoption属性中，mounted会在页面上所有的元素渲染完毕后才会开始执行，就是等其他的元素都渲染我完毕后再来渲染这个图表
  async mounted() {
    // 基于准备好的dom，初始化echarts实例，这句绑定图表渲染的位置
    var myChart = echarts.init(this.$refs.chart);

    const {data: res} = await this.$http.get('reports/type/1');
    if(res.meta.status !== 200)
      return this.$message.error('获取折线图数据失败！');
    
    // 准备数据和配置项
    const result = _.merge(res.data, this.options)

    // 绘制图表
    myChart.setOption(result);
  },
}
</script>

<style lang="less" scoped>

</style>