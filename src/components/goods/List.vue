<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="searchCondition.query" @keyup.enter.native="enterKeyupSearch"
                    ref="searchInputRef" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table :data="goodsList" stripe border highlight-current-row>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="name" label="商品名称" show-overflow-tooltip header-align="center"></el-table-column>
        <el-table-column prop="price" label="商品价格（元）" width="115px" align="center"></el-table-column>
        <el-table-column prop="weight" label="商品重量" width="80px" align="center"></el-table-column>
        <el-table-column prop="addTime" label="创建时间" width="150px" align="center"></el-table-column>
        <el-table-column label="操作" width="178px" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editGoodsById(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeGoodsById(scope.row.id)">删除
            </el-button>
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
  </div>
</template>

<script>
export default {
  name: 'List',
  created () {
    // 获取商品列表
    this.getGoodsList()
  },
  data () {
    return {
      /*初始化数据*/
      // 查询条件
      searchCondition: {
        query: '',
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  methods: {
    // 获取商品列表
    getGoodsList () {
      this.$http.get('goods', { params: this.searchCondition }).then(resp => {
        if (resp.data.status === 200) {
          // console.log(resp.data.data)
          this.goodsList = resp.data.data.list
          this.total = resp.data.data.total
        } else {
          this.$message.error('获取商品列表失败！')
        }
      }).catch(() => this.$message.error('获取商品列表失败！请联系管理员！'))
    },
    // 搜索按钮按enter键触发搜索并使输入框失去焦点
    enterKeyupSearch () {
      this.getGoodsList()
      this.$refs.searchInputRef.blur()
    },
    /*分页区域*/
    // 页面容量改变
    pageSizeChange (newPageSize) {
      this.searchCondition.pageSize = newPageSize
      this.getGoodsList()
    },
    // 当前页改变
    currentPageChange (newCurrentPage) {
      this.searchCondition.pageNum = newCurrentPage
      this.getGoodsList()
    },
    /*删除商品*/
    removeGoodsById (id) {
      this.$confirm('此操作将永久删除该商品，是否继续？', '删除商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`goods/${id}`).then(resp => {
          if (resp.data.status === 204) {
            this.$message.success('删除成功！')
            this.getGoodsList()
          } else {
            this.$message.error('删除失败！')
          }
        }).catch(() => this.$message.error('删除失败，请联系管理员！'))
      }).catch(() => this.$message.info('已取消删除！'))
    },
    /*添加商品*/
    addGoods () {
      this.$router.push('/goods/add')
    },
    /*编辑商品*/
    editGoodsById (id) {
      this.$router.push({
        name: 'EditGoods',
        params: {
          goodsId: id
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
