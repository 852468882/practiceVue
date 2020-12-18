<template>
  <el-container>
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/imgs/logo.png" alt="">
        <span>H O M E</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--中部区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '240px'">
        <!--导航菜单栏-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">
          <el-menu-item index="/welcome">
            <i class="el-icon-sunny"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          <!--一级菜单-->
          <el-submenu :index="first.id + ''" v-for="first in menuList" :key="first.id">
            <!--一级菜单模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[first.id]"></i>
              <!--文本-->
              <span slot="title">{{ first.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="urlObj[second.authName]" v-for="second in first.children" :key="second.id"
                          @click="saveNavState(second.authName)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span slot="title">{{ second.authName }}</span>
              </template>
              <!--<el-menu-item :index="third.id + ''" v-for="third in second.children" :key="third.id">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span slot="title">{{ third.authName }}</span>
                </template>
              </el-menu-item>-->
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--主体区-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      //左侧菜单栏数据
      menuList: [],
      //左侧菜单栏的图标
      iconsObj: {
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '103': 'iconfont icon-tijikongjian',
        '125': 'iconfont icon-user',
        '145': 'iconfont icon-baobiao'
      },
      //设置菜单栏的展开折叠效果
      isCollapse: false,
      //菜单的路由地址
      urlObj: {
        '商品列表': '/goods',
        '商品分类': '/categories',
        '分类参数': '/params',
        '订单列表': '/orders',
        '角色列表': '/roles',
        '权限列表': '/rights',
        '用户列表': '/users',
        '数据报表': '/reports',
      },
      //被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    logout () {
      this.$confirm('确定退出吗？', '退出登录').then(
        () => {
          window.sessionStorage.clear()
          this.$router.push('/login')
        }
      ).catch(
        () => {
        }
      )
    },
    // 获取菜单
    getMenuList () {
      this.$http.get('menus').then(
        resp => {
          // console.log(resp.data)
          if (resp.data.status === 200) {
            this.menuList = resp.data.data
          } else {
            this.$message.error(resp.data.msg)
          }
        }
      )
    },
    //展开与折叠导航菜单栏
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (authName) {
      const activePath = this.urlObj[authName]
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }

}
</script>

<style lang="less" scoped>
/*ElementUI中 标签名就是它的类名*/

/*实现布局全屏*/
.el-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 2px;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    > span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

/*设置菜单导航栏图标与文字之间的间距*/
.iconfont {
  margin-right: 10px;
}

/*菜单栏的折叠展开*/
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.el-icon-sunny{
  margin-left: -4px;
}
</style>
