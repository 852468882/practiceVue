<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-alert title="编辑商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="editGoodsForm" :rules="editGoodsRules" ref="editGoodsFormRef" label-width="100px"
               label-position="top">
        <!--左侧标签 Tabs-->
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClick()">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="editGoodsForm.name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="price">
              <el-input v-model="editGoodsForm.price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="number">
              <el-input v-model="editGoodsForm.number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="weight">
              <el-input v-model="editGoodsForm.weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="category">
              <el-cascader v-model="editGoodsForm.category" :options="categoryDataList" :props="cascaderProps"
                           @change="categoryChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="(item, index) in manyTableData" :key="item.id" :label="item.name">
              <!--复选框组-->
              <el-checkbox-group v-model="checkedDynamicParams[index].attrValue">
                <el-checkbox v-for="(vals, i) in item.vals" :label="vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.name" v-for="(item) in onlyTableData" :key="item.id">
              <el-input v-model="item.vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="3">
            <!--富文本编辑器组件-->
            <quill-editor v-model="editGoodsForm.introduce"></quill-editor>
            <el-button type="primary" class="editGoodsButton" @click="editGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EditGoods',
  created () {
    this.getGoodsId()
    this.getGoodsById()
    this.getCateList()
  },
  data () {
    return {
      goodsId: 2,
      activeIndex: '0',
      editGoodsForm: {
        name: '',
        price: 0,
        number: 0,
        weight: 0,
        // 商品所属的分类ID数组
        category: [],
        // 商品详情介绍
        introduce: '',
        // 图片数组
        pics: [],
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: [],
      },
      editGoodsRules: {
        name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        category: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      categoryDataList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        disabled: 'deleted',
      },
      manyTableData: [],
      checkedDynamicParams: [],
      onlyTableData: []
    }
  },
  methods: {
    getGoodsId () {
      if (this.$route.params.goodsId){
        this.goodsId = this.$route.params.goodsId
      } else {
        this.$router.push('/goods')
      }
    },
    getGoodsById () {
      this.$http.get(`goods/${this.goodsId}`).then(resp => {
        if (resp.data.status === 200) {
          const response = resp.data.data
          this.editGoodsForm.name = response.name
          this.editGoodsForm.price = response.price
          this.editGoodsForm.number = response.number
          this.editGoodsForm.weight = response.weight
          this.editGoodsForm.category = [response.catOneId, response.catTwoId, response.catThreeId]
          this.checkedDynamicParams = []
          response.attrs.forEach(item => {
            if (item.sel === 'many'){
              item.attrValue = item.attrValue ? item.attrValue.split(',') : []
              const attr = {
                attrId: item.id,
                attrValue: item.attrValue
              }
              this.checkedDynamicParams.push(attr)
            }
          })
        } else {
          this.$message.error('获取商品信息失败！')
        }
      }).catch((err) => {
        this.$message.error('获取商品信息失败！请联系管理员')
      })
    },
    getCateList () {
      this.$http.get('categories').then(resp => {
        if (resp.data.status === 200) {
          this.categoryDataList = resp.data.data.list
        } else {
          this.$message.error('获取分类列表失败！')
        }
      }).catch(() => {
        this.$message.error('获取分类列表失败！请联系管理员')
      })
    },
    categoryChange () {
      if (this.editGoodsForm.category.length !== 3) {
        if (this.editGoodsForm.category.length > 0) {
          this.$message.error('请选择三级分类')
        }
        this.editGoodsForm.category = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.editGoodsForm.category.length !== 3) {
        this.$message.error('请选择商品的分类')
        return false
      }
    },
    tabClick () {
      if (this.activeIndex === '1') {
        // 点击的是获取动态参数的面板
        // 获取该分类下的所有参数
        this.$http.get(`categories/attributes/${this.editGoodsForm.category[2]}`, {
          params: { sel: 'many' }
        }).then(resp => {
          if (resp.data.status === 200) {
            this.manyTableData = resp.data.data
            this.manyTableData.forEach(item => {
              item.vals = item.vals ? item.vals.split(',') : []
            })
          } else {
            this.$message.error('获取该分类下的动态参数失败！')
          }
        }).catch(() => this.$message.error('获取该分类下的动态参数失败，请联系管理员！'))
      } else if (this.activeIndex === '2') {
        // 点击的是获取静态属性的面板
        this.$http.get(`categories/attributes/${this.editGoodsForm.category[2]}`, {
          params: { sel: 'only' }
        }).then(resp => {
          if (resp.data.status === 200) {
            this.onlyTableData = resp.data.data
          } else {
            this.$message.error('获取静态属性失败！')
          }
        }).catch(() => this.$message.error('获取静态属性失败，请联系管理员！'))
      }
    },
    editGoods(){
      this.$refs.editGoodsFormRef.validate(valid => {
        if (valid) {
          const editGoodsForm = JSON.parse(JSON.stringify(this.editGoodsForm))
          editGoodsForm.category = editGoodsForm.category.join(',')
          this.checkedDynamicParams.forEach(param => {
            const attr = {
              attrId: param.attrId,
              attrValue: param.attrValue.join(',')
            }
            editGoodsForm.attrs.push(attr)
          })
          this.onlyTableData.forEach(only => {
            const attr = {
              attrId: only.id,
              attrValue: only.vals
            }
            editGoodsForm.attrs.push(attr)
          })

          //发起请求，修改商品
          this.$http.put(`goods/${this.goodsId}`, editGoodsForm).then(resp => {
            if (resp.data.status === 203){
              this.$message.success('商品修改成功！')
              this.$router.push('/goods')
            } else {
              this.$message.error('商品修改失败！')
            }
          }).catch(() => this.$message.error('商品修改失败！请联系管理员！'))
        } else {
          this.$message.error('请输入正确的商品信息！')
        }
      })
    }
  },
}
</script>

<style scoped>
.el-checkbox {
  margin: 0 20px 0 0 !important;
}

.editGoodsButton {
  margin-top: 15px;
}
</style>
