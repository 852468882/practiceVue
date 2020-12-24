<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="searchCondition.query" placeholder="请输入内容" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="number"></el-table-column>
        <el-table-column label="订单价格" prop="price" width="90px"></el-table-column>
        <el-table-column label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.payStatus === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="isSend" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="createTime" width="180px"></el-table-column>
        <el-table-column label="订单操作" width="120px">
          <template slot-scope="scope">
            <el-tooltip content="修改地址" placement="top-end" :enterable="false">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditAddressDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看物流信息" placement="top-start" :enterable="false">
              <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="pageSizeChange"
        @current-change="currentPageChange"
        :current-page="searchCondition.pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="searchCondition.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--修改地址对话框-->
    <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible" width="50%" @closed="closeEditAddressDialog">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader v-model="addressForm.address" :options="cityData"></el-cascader>
        </el-form-item>
      </el-form>
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model="addressForm.addressDetail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改地址对话框-->
    <el-dialog title="查看物流进度" :visible.sync="progressDialogVisible" width="50%">
      <h3>你看个P！</h3>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '@/components/order/citydata'

export default {
  name: 'Order',
  created () {
    this.getOrderList()
  },
  data () {
    return {
      searchCondition: {
        query: '',
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      orderList: [],
      editAddressDialogVisible: false,
      addressForm: {
        address: [],
        addressDetail: ''
      },
      addressFormRules: {
        address: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur'
          }
        ],
        addressDetail: [
          {
            required: true,
            message: '请填写详细地址',
            trigger: 'blur'
          }
        ]
      },
      cityData,
      orderId: 0,
      progressDialogVisible: false,
    }
  },
  methods: {
    getOrderList () {
      this.$http.get('orders', { params: this.searchCondition }).then(resp => {
        if (resp.data.status === 200) {
          // console.log(resp.data.data)
          this.total = resp.data.data.total
          this.orderList = resp.data.data.list
        }
      })
    },
    /*分页区域*/
    // 页面容量改变
    pageSizeChange (newPageSize) {
      this.searchCondition.pageSize = newPageSize
      this.getOrderList()
    },
    // 当前页改变
    currentPageChange (newCurrentPage) {
      this.searchCondition.pageNum = newCurrentPage
      this.getOrderList()
    },
    /*编辑区域*/
    // 展示修改地址对话框
    showEditAddressDialog (id) {
      this.editAddressDialogVisible = true
      this.orderId = id
    },
    // 对话框关闭
    closeEditAddressDialog () {
      this.$refs.addressFormRef.resetFields()
    },
    // 修改地址确定
    editAddress () {
      const newAddress = this.addressForm.address.join('') + this.addressForm.addressDetail
      this.$http.post(`updateAddress/${this.orderId}`, newAddress).then(resp => {
        if (resp.data.status === 203) {
          this.editAddressDialogVisible = false
          this.$message.success('修改地址成功！')
        } else {
          this.$message.error('修改地址失败!')
        }
      }).catch(() => this.$message.error('修改地址失败!请联系管理员!'))
    },
    // 查看物流进度对话框
    showProgressDialog(id){
      this.progressDialogVisible = true
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
