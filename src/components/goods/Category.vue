<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <!--
      tree-table 组件
      API: https://github.com/yourcandy/vue-table-with-tree-grid
      -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index index-text="#"
        border>
        <!--是否有效-->
        <template slot="isDeleted" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="option" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row)"
                     v-if="!scope.row.deleted">删除
          </el-button>
          <el-button type="success" icon="el-icon-refresh" size="mini" @click="deleteCate(scope.row)"
                     v-if="scope.row.deleted">恢复
          </el-button>
        </template>
      </tree-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类的对话框-->
    <el-dialog title="添加分类" :visible.sync="addCategoryDialogVisible" width="50%" :close-on-click-modal="false"
               @closed="closeAddCateDialog">
      <!--添加分类的表单-->
      <el-form ref="addCategoryFormRef" :model="addCategoryForm" label-width="80px" :rules="addCategoryFormRule">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addCategoryForm.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--
          v-model: 必须绑定数组，不能是一个具体的值或对象
          options: 用来指定数据源
          props: 用来配置cascader
          -->
          <el-cascader
            v-model="selectedCategoryPids"
            :options="parentCategoryDataList"
            :props="cascaderProps"
            @change="parentCategoryChange"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑分类的对话框-->
    <el-dialog title="编辑分类" :visible.sync="editCategoryDialogVisible" width="50%" :close-on-click-modal="false"
               @closed="closeEditCateDialog">
      <el-form ref="editCategoryFormRef" :model="editCategoryForm" label-width="80px" :rules="editCategoryFormRule">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editCategoryForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Category',
  created () {
    this.getCateList()
  },
  data () {
    return {
      // 默认查询条件
      queryInfo: {
        type: 3,
        pageNum: 1,
        pageSize: 5
      },
      // 商品分类的默认列表
      cateList: [],
      // 商品分类数据总数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'isDeleted'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'option'
        },
      ],
      /*添加商品分类*/
      // 添加商品分类对话框展示与隐藏
      addCategoryDialogVisible: false,
      // 添加商品分类数据
      addCategoryForm: {
        // 分类名称
        name: '',
        // 父级分类ID，默认为0
        pid: 0,
        // 分类层级，默认为0（一级分类）
        level: 0
      },
      // 校验添加商品分类数据
      addCategoryFormRule: {
        name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 1、2级分类数据
      parentCategoryDataList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        disabled: 'deleted',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedCategoryPids: [],
      /*编辑分类*/
      // 编辑商品分类对话框展示与隐藏
      editCategoryDialogVisible: false,
      // 编辑商品分类数据
      editCategoryForm: {
        id: '',
        name: ''
      },
      // 校验编辑商品分类数据
      editCategoryFormRule: {
        name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 获取商品分类数据
    getCateList () {
      this.$http.get(`categories`, { params: this.queryInfo }).then(resp => {
        if (resp.data.status === 200) {
          // console.log(resp.data.data)
          this.total = resp.data.data.total
          this.cateList = resp.data.data.list
        } else {
          this.$message.error('获取商品分类信息失败！')
        }
      }).catch(err => {
        console.log(err)
        this.$message.error('获取商品分类信息失败！请联系管理员！')
      })
    },
    /*分页区域*/
    // pageSize改变后触发的事件
    handleSizeChange (newPageSize) {
      this.queryInfo.pageSize = newPageSize
      this.getCateList()
    },
    // 当前页改变后触发的事件
    handleCurrentChange (newCurrentPage) {
      this.queryInfo.pageNum = newCurrentPage
      this.getCateList()
    },
    /*添加分类*/
    // 展示添加商品分类对话框
    showAddCateDialog () {
      this.addCategoryDialogVisible = true
      this.$http.get('categories', { params: { type: 2 } }).then(resp => {
        if (resp.data.status === 200) {
          this.parentCategoryDataList = resp.data.data.list
        } else {
          this.$message.error('获取商品分类信息失败！')
        }
      }).catch(err => {
        console.log(err)
        this.$message.error('获取商品分类信息失败！请联系管理员！')
      })
    },
    // 隐藏添加商品分类对话框
    closeAddCateDialog () {
      // 清空input框
      this.$refs.addCategoryFormRef.resetFields()
      // 清空cascader级联选择器
      this.selectedCategoryPids = []
      // 清空表单数据
      this.addCategoryForm.level = 0
      this.addCategoryForm.pid = 0
    },
    // 父级分类的选择项发生变化触发函数
    parentCategoryChange () {
      // 如果 selectedCategoryPids 的 length > 0 说明该分类有父级分类，需要为 pid 设值； 反之 重置为 0
      if (this.selectedCategoryPids.length > 0) {
        this.addCategoryForm.pid = this.selectedCategoryPids[this.selectedCategoryPids.length - 1]
        this.addCategoryForm.level = this.selectedCategoryPids.length
      } else {
        this.addCategoryForm.pid = 0
        this.addCategoryForm.level = 0
      }
    },
    // 发送添加分类请求
    addCategory () {
      this.$refs.addCategoryFormRef.validate().then(() => {
        this.$http.post('categories', this.addCategoryForm).then(resp => {
          if (resp.data.status === 201) {
            this.$message.success('创建成功！')
            this.addCategoryDialogVisible = false
            this.getCateList()
          } else {
            this.$message.error('创建失败！')
          }
        }).catch(err => {
          this.$message.error(err.data)
        })
      }).catch(() => this.$message.error('请输入合法的信息！'))
    },
    /*删除分类*/
    deleteCate (row) {
      const id = row.id
      const isDelete = !row.deleted
      const message = isDelete ? '删除' : '恢复'
      this.$confirm(`您确定${message}该分类吗？`, `${message}分类`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/${id}/${isDelete}`).then(resp => {
          if (resp.data.status === 200) {
            this.$message.success(`${message}成功！`)
            this.getCateList()
          } else {
            this.$message.error(`${message}失败！`)
          }
        })
      }).catch(() => this.$message.info(`已取消${message}`))
    },
    /*编辑分类*/
    // 展示编辑商品分类对话框
    showEditCateDialog (row) {
      this.editCategoryDialogVisible = true
      this.editCategoryForm.id = row.id
      this.editCategoryForm.name = row.name
    },
    // 隐藏编辑商品分类对话框
    closeEditCateDialog () {
      this.$refs.addCategoryFormRef.resetFields()
    },
    // 发送修改分类请求
    editCategory () {
      this.$refs.editCategoryFormRef.validate().then(() => {
        this.$http.put(`categories/${this.editCategoryForm.id}`, { name: this.editCategoryForm.name }).then(resp => {
          if (resp.data.status === 203) {
            this.$message.success('修改成功！')
            this.editCategoryDialogVisible = false
            this.getCateList()
          } else {
            this.$message.error('修改失败！')
          }
        }).catch(err => {
          this.$message.error(err.data)
        })
      }).catch(() => this.$message.error('请输入合法的信息！'))
    }
  }
}
</script>

<style scoped lang="less">
.el-cascader {
  width: 100%;
}
</style>
