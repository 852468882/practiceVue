<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入用户姓名" v-model="param.username" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--数据表格-->
      <el-table
        :data="userList"
        style="width: 100%"
        border stripe>
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="username" label=姓名 width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="250"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="130"></el-table-column>
        <el-table-column prop="roleName" label="角色" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <!--使用作用域插槽的 slot-scope 属性来接收当前行的数据-->
          <template slot-scope="scope">
            <!--通过 scope的属性 scope.row 可以获取到当前行的数据-->
            <el-switch v-model="scope.row.status" @change="userStatusChange(scope.row)"></el-switch>
            <!--设置作用域插槽之后 会覆盖掉 prop 属性的值，prop属性不再生效-->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--修改-->
            <el-tooltip content="编辑" placement="top-end" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" circle
                         @click="showEditUserDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除-->
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" circle
                         @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <!--设置角色-->
            <el-tooltip content="设置" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" circle
                         @click="showSettingUserDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <!--@size-change：pageSize改变后触发的事件；事件函数本身会传一个 当前页面容量 的参数，函数不能写参数，会报错-->
      <!--@current-change：当前页改变后触发的事件；事件函数本身会传一个 当前页 的参数，注意事项同上-->
      <!--layout表示在页面上展示哪些插件
        total：页面总条数
        sizes：页面容量列表-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="param.pageNum"
        :page-sizes="[3, 5, 10]"
        :page-size="param.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <!--title：标题；:visible.sync：控制对话框的显示与关闭-->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible"
               width="45%"
               @closed="closeAddUserForm">
      <!--内容主体区域-->
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="addUserForm.roleId" placeholder="请选择角色" @visible-change="getRoles">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog title="编辑用户信息" :visible.sync="editUserDialogVisible" width="45%" @closed="closeEditUserForm">
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--设置角色-->
    <el-dialog title="设置角色" :visible.sync="setRoleDialogVisible" width="50%" @closed="closeSetRole">
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.roleName }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectdRoleId" placeholder="请选择角色" @visible-change="getRoles">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="settingUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    /*校验规则*/
    // 邮箱的校验规则
    var validateEmail = (rule, value, callback) => {
      var cb
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        cb = callback()
      } else {
        cb = callback(new Error('请输入合法的邮箱'))
      }
      return cb
    }
    // 手机号的校验规则
    var validateMobile = (rule, value, callback) => {
      var cb
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        cb = callback()
      } else {
        cb = callback(new Error('请输入合法的手机号'))
      }
      return cb
    }

    return {
      /*所有的用户*/
      // 发送获取用户列表请求的参数
      param: {
        username: '',
        pageNum: 1,
        pageSize: 5
      },
      // 用户数据列表
      userList: [],
      // 用户总数
      total: 0,
      /*添加用户*/
      // 控制添加用户对话框的显示与隐藏
      addUserDialogVisible: false,
      // 添加用户的表单数据
      addUserForm: {
        username: '',
        password: '123456',
        email: '123456@qq.com',
        mobile: '18333333333',
        roleId: ''
      },
      // 所有的角色
      rolesList: [],
      // 添加用户的数据验证规则
      addUserRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名在 3-10 个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '用户名在 6-15 个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: validateEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: validateMobile,
            trigger: 'blur'
          }
        ]
      },
      /*修改用户*/
      // 控制修改用户对话框的显示与隐藏
      editUserDialogVisible: false,
      // 修改用户的表单数据
      editUserForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 修改用户的数据验证规则
      editUserRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: validateEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: validateMobile,
            trigger: 'blur'
          }
        ]
      },
      /*设置角色*/
      // 控制设置角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 分配角色时的roleId
      selectdRoleId: ''
    }
  },
  methods: {
    // 获取用户列表
    getUserList () {
      this.$http.get('users', { params: this.param }).then(
        resp => {
          //console.log(resp.data)
          if (resp.data.status === 200) {
            this.total = resp.data.data.total
            this.userList = resp.data.data.list
            /*this.userList.forEach(user => {
              if (user.state === 1){
                user.state = true
              } else {
                user.state = false
              }
            })*/
          } else {
            this.$message.error('获取用户列表失败')
          }
        }
      )
    },
    /*分页区域*/
    // pageSize改变后触发的事件
    handleSizeChange (newPageSize) {
      this.param.pageSize = newPageSize
      this.getUserList()
    },
    // 当前页改变后触发的事件
    handleCurrentChange (newCurrentPage) {
      this.param.pageNum = newCurrentPage
      this.getUserList()
    },
    /*更改用户状态*/
    userStatusChange (row) {
      // console.log(row)
      const confirmMsg = row.status ? '开启' : '禁用'
      const confirmType = row.status ? 'success' : 'error'
      this.$confirm('是否' + confirmMsg + '该用户？', '更改状态', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: confirmType
      }).then(() => {
        this.$http.put(`users/${row.id}/state/${row.status}`).then(
          resp => {
            if (resp.data.status !== 200) {
              row.status = !row.status
              this.$message.error('修改失败，请检查！')
            } else {
              this.$message.success('修改成功！')
            }
          }
        )
      }).catch(() => {
        row.status = !row.status
        this.$message.info('取消' + confirmMsg)
      })
    },
    /*添加用户*/
    // 隐藏添加用户表单
    closeAddUserForm () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 获取所有角色
    getRoles (appear) {
      if (appear && this.rolesList.length === 0) {
        this.$http.get('roles/list').then(resp => {
          if (resp.data.status === 200) {
            this.rolesList = resp.data.data
          } else {
            this.$message.error('获取角色列表失败！')
          }
        })
      }
    },
    // 新增用户请求
    createUser (row) {
      /*预校验*/
      this.$refs.addUserFormRef.validate(valid => {
        if (valid) {
          /*发起添加请求*/
          this.$http.post('createUser', this.addUserForm).then(resp => {
            if (resp.data.status === 201) {
              this.addUserDialogVisible = false
              this.$message.success('添加用户成功')
              this.getUserList()
            } else {
              this.$message.error('添加用户失败')
            }
          })
        }
      })
    },
    /*编辑用户*/
    // 根据ID查询用户详情，展示编辑用户的对话框
    showEditUserDialog (id) {
      this.$http.get('users/' + id).then(resp => {
        if (resp.data.status === 200) {
          this.editUserForm = resp.data.data
          this.editUserDialogVisible = true
        } else {
          this.$message.error('获取用户信息失败')
        }
      })
    },
    // 隐藏修改用户表单
    closeEditUserForm () {
      this.$refs.editUserFormRef.resetFields()
    },
    // 编辑用户
    editUser () {
      // 预验证
      this.$refs.editUserFormRef.validate(valid => {
        if (valid) {
          this.$http.put('users', this.editUserForm).then(resp => {
            if (resp.data.status === 200) {
              this.editUserDialogVisible = false
              this.$message.success('编辑成功！')
              this.getUserList()
            } else {
              this.$message.error('编辑失败！')
            }
          })
        }
      })
    },
    /*删除用户*/
    deleteUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('users/' + id).then(resp => {
          if (resp.data.status === 200) {
            this.$message.success('删除成功!')
            this.getUserList()
          } else {
            this.$message.error('删除失败')
          }
        })
      }).catch(() => this.$message.info('已取消删除'))
    },
    /*设置角色*/
    // 展示设置角色的对话框
    showSettingUserDialog (user) {
      this.userInfo = user
      this.setRoleDialogVisible = true
    },
    // 关闭设置角色的对话框
    closeSetRole () {
      this.selectdRoleId = ''
      this.userInfo = {}
    },
    // 设置角色请求
    settingUser () {
      if (this.selectdRoleId){
        this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectdRoleId}).then(resp => {
          if (resp.data.status === 203){
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
          }else {
            this.$message.error('更新角色失败！')
          }
        })
      } else {
        this.$message.error('请选择该用户的新角色！')
      }
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style scoped>

</style>
