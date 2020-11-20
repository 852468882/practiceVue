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
          <el-button type="primary" @click="createRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand"/>
        <el-table-column type="index" label="#"/>
        <el-table-column label="角色名称" prop="roleName" show-overflow-tooltip/>
        <el-table-column label="角色描述" prop="roleDesc" show-overflow-tooltip/>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="settingRole(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
      // 添加角色的数据
      createRoleData: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色的数据
      editRoleData: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  methods: {
    // 获取用户列表
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
    // 添加角色
    createRole () {
      /*this.$http.post('roles', this.createRoleData).then(
        resp => {

        }
      )*/
    },
    // 编辑角色
    editRole (row) {
      /*this.$http.put('roles/' + row.id, this.editRoleData).then(
          resp => {

          }
      )*/
    },
    // 删除角色
    deleteRole (id) {
      /*this.$http.delete('roles/' + id).then(
        resp => {

        }
      )*/
    },
    // 分配权限
    settingRole () {
    }
  }
}
</script>

<style scoped>

</style>
