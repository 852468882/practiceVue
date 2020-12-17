<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--头部警告条-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!--选择商品分类区域-->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader v-model="selectedCategoryIds" :options="categoryDataList" :props="cascaderProps"
                       @change="categoryChange"></el-cascader>
        </el-col>
      </el-row>
      <!--Tabs 标签区域-->
      <el-tabs v-model="activeName" @tab-click="getParamsData">
        <!--添加动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible = true">
            添加参数
          </el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--展开行的标签-->
                <el-tag v-for="(item, i) in scope.row.vals" :key="i" closable
                        @close="tagClose(i,scope.row)">{{ item }}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">添加属性值
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParam(scope.row.id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible = true">
            添加属性
          </el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--展开行的标签-->
                <el-tag v-for="(item, i) in scope.row.vals" :key="i" closable
                        @close="tagClose(i,scope.row)">{{ item }}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">添加属性值
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParam(scope.row.id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数/属性对话框-->
    <el-dialog :title="'添加' + dialogTitle" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
        <el-form-item :label="formLabel" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑参数/属性对话框-->
    <el-dialog :title="'修改' + dialogTitle" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
        <el-form-item :label="formLabel" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  created () {
    this.getCateList()
  },
  data () {
    return {
      /*级联选择器*/
      // 选中的分类的Id数组
      selectedCategoryIds: [],
      // 数据源
      categoryDataList: [],
      // 配置属性
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        disabled: 'deleted',
      },
      /*Tabs 标签*/
      // 默认选中的Tabs 标签名称
      activeName: 'many',
      /*表格区域*/
      // 动态参数
      manyTableData: [],
      // 静态属性
      onlyTableData: [],
      /*添加对话框*/
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 表单数据对象
      addForm: {
        name: ''
      },
      // 表单验证规则
      addFormRules: {
        name: [
          {
            required: true,
            message: `请输入参数!`,
            trigger: 'blur'
          }
        ]
      },
      /*编辑对话框*/
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 表单数据对象
      editForm: {},
      // 表单验证规则
      editFormRules: {
        name: [
          {
            required: true,
            message: `请输入参数!`,
            trigger: 'blur'
          }
        ]
      },
      /*展开后的标签*/
    }
  },
  methods: {
    /*数据初始化*/
    // 获取分类列表
    getCateList () {
      this.$http.get('categories').then(resp => {
        if (resp.data.status === 200) {
          this.categoryDataList = resp.data.data.list
        } else {
          this.$message.error('获取分类列表失败！')
        }
      })
    },
    // 获取表格内容
    getParamsData () {
      const categoryId = this.categoryId
      if (categoryId) {
        this.$http.get(`categories/attributes/${categoryId}`, {
          params: { sel: this.activeName }
        }).then(resp => {
          if (resp.data.status === 200) {
            resp.data.data.forEach(item => {
              item.vals = item.vals ? item.vals.split(',') : []
              // 控制文本的显示与隐藏
              item.inputVisible = false
              // 文本框输入的值
              item.inputValue = ''
            })
            if (this.activeName === 'many') {
              this.manyTableData = resp.data.data
            } else {
              this.onlyTableData = resp.data.data
            }
          } else {
            this.$message.error('获取失败！')
          }
        }).catch(err => {
          console.log(err)
          this.$message.error('获取失败！请联系管理员！')
        })
      }
    },
    /*级联选择器*/
    // 选择项发生变化触发函数
    categoryChange () {
      if (this.selectedCategoryIds.length !== 3) {
        this.selectedCategoryIds = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        this.getParamsData()
      }
    },
    /*添加*/
    // 关闭时的调用函数
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 发送添加请求
    addParams () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this.$http.post(`categories/attributes/${this.selectedCategoryIds[2]}`, {
            name: this.addForm.name,
            sel: this.activeName
          }).then(resp => {
            if (resp.data.status === 201) {
              this.$message.success('添加成功')
              this.getParamsData()
              this.addDialogVisible = false
            } else {
              this.$message.error('添加失败！')
            }
          })
        }
      })
    },
    /*编辑*/
    // 显示编辑的对话框
    showEditDialog (id) {
      this.editDialogVisible = true
      this.$http.get(`categories/attributes/${this.categoryId}/${id}`, {
        params: { sel: this.activeName }
      }).then(resp => {
        if (resp.data.status === 200) {
          this.editForm = resp.data.data
        }
      })
    },
    // 关闭时的调用函数
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 发送编辑请求
    editParams () {
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          this.$http.put(`categories/attributes/${this.categoryId}/${this.editForm.id}`, this.editForm).then(resp => {
            if (resp.data.status === 203) {
              this.$message.success('修改成功')
              this.getParamsData()
              this.editDialogVisible = false
            } else {
              this.$message.error('修改失败！')
            }
          })
        }
      })
    },
    /*删除*/
    removeParam (id) {
      this.$confirm(`此操作将永久删除该${this.dialogTitle}, 是否继续?`, `删除${this.dialogTitle}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/attributes/${this.categoryId}/${id}`).then(resp => {
          if (resp.data.status === 204) {
            this.$message.success(`删除${this.dialogTitle}成功!`)
            this.getParamsData()
          } else {
            this.$message.error(`删除${this.dialogTitle}失败!`)
          }
        })
      }).catch(() => this.$message.info('已取消删除'))
    },
    /*展开后的标签*/
    // 当按下回车或失去焦点时触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
      } else {
        row.vals.push(row.inputValue.trim())
        row.inputValue = ''
        this.editAttribute(row)
      }
      row.inputVisible = false
    },
    // 编辑提交参数
    editAttribute (row) {
      this.$http.put(`categories/attributes/${this.categoryId}/${row.id}`, {
        name: row.name,
        sel: row.sel,
        vals: row.vals.join(',')
      }).then(resp => {
        if (resp.data.status === 203) {
          this.$message.success('修改参数项成功！')
        } else {
          this.$message.success('修改参数项失败！')
        }
      })
    },
    // 展示输入框
    showInput (row) {
      console.log(row)
      row.inputVisible = true
      // $nextTick的作用：当页面元素被重新渲染之后，会触发该函数
      this.$nextTick(_ => {
        // 获取文本框，使文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    tagClose (i, row) {
      this.$confirm(`您确定删除该${this.dialogTitle}的属性吗?`, `删除${this.dialogTitle}的属性`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.vals.splice(i, 1)
        this.editAttribute(row)
      }).catch(() => this.$message.info('已取消删除'))
    }
  },
  /*计算属性*/
  computed: {
    // 如果 添加动态参数/静态属性 按钮需要被禁用，则返回 true
    isButtonDisabled () {
      return this.selectedCategoryIds.length !== 3
    },
    // 当前选中的三级分类ID，如果没有返回null
    categoryId () {
      if (this.selectedCategoryIds.length === 3) {
        return this.selectedCategoryIds[2]
      } else {
        return null
      }
    },
    // 添加/修改 对话框的动态标题
    dialogTitle () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
    // 表单动态label
    formLabel () {
      return this.activeName === 'many' ? '动态参数名称' : '静态属性名称'
    }
  }
}
</script>

<style scoped lang="less">
.el-row {
  margin: 15px 0;
}

.el-tag {
  margin: 7px;
}

.button-new-tag {
  width: 120px;
}

.input-new-tag {
  width: 120px;
}
</style>
