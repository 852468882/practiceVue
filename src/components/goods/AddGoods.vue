<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--步骤条-->
      <!--active接受的是数字类型的值，activeIndex是字符串类型，activeIndex - 0就是数字类型的了-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品照片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--左侧标签 Tabs-->
      <el-form :model="addGoodsForm" :rules="addGoodsRules" ref="addGoodsFormRef" label-width="100px"
               label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClick()">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="addGoodsForm.name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="price">
              <el-input v-model="addGoodsForm.price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="number">
              <el-input v-model="addGoodsForm.number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="weight">
              <el-input v-model="addGoodsForm.weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="category">
              <el-cascader v-model="addGoodsForm.category" :options="categoryDataList" :props="cascaderProps"
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
          <el-tab-pane label="商品图片" name="3">
            <!--图片上传区域
            action：图片上传要请求的API接口地址
            on-preview：点击选择的图片名称会触发的事件
            on-remove：移除图片触发的事件
            list-type：文件列表的类型；可选值：text/picture/picture-card；默认值：text
            headers：定义请求头
            -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="requestHeader"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">选择图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addGoodsForm.introduce"></quill-editor>
            <el-button type="primary" class="addGoodsButton" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AddGoods',
  created () {
    this.getCateList()
  },
  data () {
    return {
      // 步骤条激活项，默认为0；同时绑定左侧tab，点击激活对应的步骤条
      activeIndex: '0',
      /*基本信息*/
      // 表单数据
      addGoodsForm: {
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
      // 表单验证规则
      addGoodsRules: {
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
      // 商品分类数据
      categoryDataList: [],
      // 级联选择器的配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        disabled: 'deleted',
      },
      /*商品参数*/
      // 动态参数列表数据
      manyTableData: [],
      // 选中的动态参数列表
      checkedDynamicParams: [],
      /*商品属性*/
      onlyTableData: [],
      /*上传图片*/
      // 上传地址
      uploadUrl: 'http://localhost:7777/upload',
      // 请求头信息
      requestHeader: {
        Authorization: window.sessionStorage.getItem('token')
      }
    }
  },
  methods: {
    // 获取分类列表
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
    // 级联选择器中的值发生改变时
    categoryChange () {
      if (this.addGoodsForm.category.length !== 3) {
        if (this.addGoodsForm.category.length > 0) {
          this.$message.error('请选择三级分类')
        }
        this.addGoodsForm.category = []
      }
    },
    // tab标签页切换时触发的函数; activeName：即将进入的tab；oldActiveName：离开的tab；return false可以阻止标签页的切换
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodsForm.category.length !== 3) {
        this.$message.error('请选择商品的分类')
        return false
      }
    },
    // tab标签页被点击时触发的函数
    tabClick () {
      if (this.activeIndex === '1') {
        // 点击的是获取动态参数的面板
        this.$http.get(`categories/attributes/${this.addGoodsForm.category[2]}`, {
          // this.$http.get(`categories/attributes/1193`, {
          params: { sel: 'many' }
        }).then(resp => {
          if (resp.data.status === 200) {
            this.checkedDynamicParams = []
            this.manyTableData = resp.data.data
            this.manyTableData.forEach(item => {
              item.vals = item.vals ? item.vals.split(',') : []
              const attr = {
                attrId: item.id,
                attrValue: item.vals
              }
              this.checkedDynamicParams.push(attr)
            })
          } else {
            this.$message.error('获取动态参数失败！')
          }
        }).catch(() => this.$message.error('获取动态参数失败，请联系管理员！'))
      } else if (this.activeIndex === '2') {
        // 点击的是获取静态属性的面板
        this.$http.get(`categories/attributes/${this.addGoodsForm.category[2]}`, {
          //this.$http.get(`categories/attributes/1193`, {
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
    /*图片上传*/
    // 图片预览事件
    handlePreview (file) {
      console.log(file)
    },
    // 图片移除事件；参数file, fileList。file：移除的图片；fileList：剩余的图片
    handleRemove (file) {
      // 1. 获取将要删除的图片的临时路径
      const tempPath = file.response.data.temp_path
      // 2. 从 pics 数组中，找到这个图片的临时路径对应的索引值
      const index = this.addGoodsForm.pics.findIndex(p => p.pic === file.response.data.temp_path)
      // 3. 调用数组的 splice 方法，把图片信息对象从数组中删除
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      const picInfo = { pic: response.data.temp_path }
      this.addGoodsForm.pics.push(picInfo)
    },
    /*添加商品按钮*/
    addGoods () {
      this.$refs.addGoodsFormRef.validate(valid => {
        if (valid) {
          /*深拷贝*/
          // 1. 使用JSON.parse(JSON.stringify(this.addGoodsForm)); 这种方法不可以拷贝 属性中带有函数的json
          // 2. 使用lodash 的 cloneDeep(obj)；这种方法不知道拷贝效果
          const addGoodsForm = JSON.parse(JSON.stringify(this.addGoodsForm))
          addGoodsForm.category = addGoodsForm.category.join(',')
          this.checkedDynamicParams.forEach(param => {
            const attr = {
              attrId: param.attrId,
              attrValue: param.attrValue.join(',')
            }
            addGoodsForm.attrs.push(attr)
          })
          this.onlyTableData.forEach(only => {
            const attr = {
              attrId: only.id,
              attrValue: only.vals
            }
            addGoodsForm.attrs.push(attr)
          })

          //发起请求，添加商品
          this.$http.post('goods', addGoodsForm).then(resp => {
            if (resp.data.status === 201){
              this.$message.success('商品创建成功！')
              this.$router.push('/goods')
            } else {
              this.$message.error('商品创建失败！')
            }
          }).catch(() => this.$message.error('商品创建失败！请联系管理员！'))
        } else {
          this.$message.error('请输入正确的商品信息！')
        }
      })
    }
  },
  /*计算属性*/
  computed: {
    // 当前选中的三级分类ID，如果没有返回null
    categoryId () {
      if (this.addGoodsForm.category.length === 3) {
        return this.addGoodsForm.category[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style scoped>
.el-checkbox {
  margin: 0 20px 0 0 !important;
}

.addGoodsButton {
  margin-top: 15px;
}
</style>
