<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--显示每行的数据，并用 pre 标签格式化-->
            <!--<pre>
              {{ scope.row }}
            </pre>-->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <!--渲染二级权限-->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--渲染三级权限-->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                            @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"/>
        <el-table-column label="角色名称" prop="roleName" show-overflow-tooltip/>
        <el-table-column label="角色描述" prop="roleDesc" show-overflow-tooltip/>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSettingRoleDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="35%" @closed="closeAddRoleDialog">
      <!--添加角色表单区域-->
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑角色对话框-->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="45%" @closed="closeEditRoleDialog">
      <!--编辑角色表单区域-->
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="30%" @closed="closeSetRoleDialog">
      <!--树形控件-->
      <el-tree :data="rightsTree" :props="rightsTreeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  created () {
    this.getRoleList()
  },
  data () {
    return {
      // 所有角色列表
      roleList: [],
      /*添加角色*/
      // 添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色的数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单的验证规则
      addRoleRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      },
      /*编辑角色*/
      // 编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 编辑角色的数据
      editRoleForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色表单的验证规则
      editRoleRules: {
        roleName: [
          {
            required: true,
            message: '角色名称不能为空',
            trigger: 'blur'
          }
        ]
      },
      /*分配权限*/
      // 分配权限对话框的显示与隐藏
      setRightsDialogVisible: false,
      // 权限树型结构
      rightsTree: [],
      // 权限树形结构对应关系
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选择的权限节点
      defKeys: [],
      // 展开分配权限对话框后保存roleId，供角色授权使用
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表
    getRoleList () {
      this.$http.get('roles').then(
        resp => {
          if (resp.data.status === 200) {
            // console.log(resp.data.data)
            this.roleList = resp.data.data
          } else {
            this.$message.error('获取角色列表失败！')
          }
        }
      )
    },
    /*添加角色*/
    // 添加角色对话框关闭
    closeAddRoleDialog () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    createRole () {
      this.$refs.addRoleFormRef.validate(valid => {
        if (valid) {
          this.$http.post('roles', this.addRoleForm).then(
            resp => {
              if (resp.data.status === 201) {
                this.addRoleDialogVisible = false
                this.$message.success('添加角色成功！')
                this.getRoleList()
              } else {
                this.$message.error('添加角色失败！')
              }
            }
          )
        }
      })
    },
    /*编辑角色*/
    // 编辑角色对话框关闭
    closeEditRoleDialog () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 根据ID查询角色详情，展示编辑角色的对话框
    showEditRoleDialog (id) {
      this.$http.get('roles/' + id).then(resp => {
        if (resp.data.status === 200) {
          this.editRoleForm = resp.data.data
          this.editRoleDialogVisible = true
        } else {
          this.$message.error('获取角色信息失败!')
        }
      })
    },
    // 编辑角色
    editRole () {
      // 预验证
      this.$refs.editRoleFormRef.validate(valid => {
        if (valid) {
          this.$http.put('roles', this.editRoleForm).then(resp => {
            if (resp.data.status === 203) {
              this.editRoleDialogVisible = false
              this.$message.success('编辑成功！')
              this.getRoleList()
            } else {
              this.$message.error('编辑失败！')
            }
          })
        }
      })
    },
    /*删除角色*/
    // 删除角色
    deleteRole (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('roles/' + id).then(resp => {
          if (resp.data.status === 204) {
            this.$message.success('删除成功!')
            this.getRoleList()
          } else {
            this.$message.error('删除失败')
          }
        })
      }).catch(() => this.$message.info('已取消删除'))
    },
    /*表格展开区域*/
    // 删除权限
    removeRightById (role, rightId) {
      // 弹框提示是否要进行删除
      this.$confirm('此操作将永久删除该角色的权限, 是否继续?', '删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(resp => {
          role.children = resp.data.data
        }).catch(err => {
          this.$message.error('删除失败！请联系管理员')
        })
      }).catch(() => this.$message.info('已取消删除'))
    },
    /*分配权限*/
    // 展示分配权限的对话框
    showSettingRoleDialog (role) {
      // 获取所有权限数据
      this.$http.get('rights/tree').then(resp => {
        if (resp.data.status === 200) {
          this.rightsTree = resp.data.data
          // 为默认选择的节点数组赋值
          this.getLeafKeys(role, this.defKeys)
          this.setRightsDialogVisible = true
          this.roleId = role.id
        } else {
          this.$message.error('获取角色信息失败!')
        }
      })
    },
    // 通过递归的形式，获取角色下所有三级权限的ID，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 分配权限对话框关闭
    closeSetRoleDialog () {
      // 清空当前默认选择的节点数组
      this.defKeys.splice(0, this.defKeys.length)
    },
    // 发送分配权限请求
    allotRights () {
      // 把选择的节点id存在数组里
      const keys = [
        // ... ：展开运算符
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 把数组以 "," 为间隔拆分成数组
      const idStr = keys.join(',')
      console.log(idStr)
      this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr }).then(resp => {
        // console.log(resp.data)
        if (resp.data.status === 203){
          this.$message.success('分配角色权限成功！')
          this.setRightsDialogVisible = false
          this.getRoleList()
        } else {
          this.$message.error('分配角色权限失败!')
        }
      }).catch(err => {
        this.$message.error('分配角色权限失败!')
      })
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
