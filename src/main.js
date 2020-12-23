import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element-ui
import './plugins/element.js'
// 导入全局样式表
import './assets/css/globle.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'
// 配置axios请求的基础路径
axios.defaults.baseURL = 'http://localhost:7777/'
// axios请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象添加 token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 全局组件注册axios
Vue.prototype.$http = axios

// 导入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 全局组件注册vue-table-with-tree-grid
Vue.component('tree-table', TreeTable)

// 导入vue-quill-editor 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 全局组件注册vue-quill-editor
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
