<template>
  <el-container class="homeContainer">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/agul.jpg" alt width="60" height="60" />
        <span>agulCulb后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 主体区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="btn-onoff" @click="openCollapse()">|||</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#0598FA"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
          >
          <!-- 一级菜单 -->
          <el-submenu :index="'/' + item.path" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavStatus('/' + subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单列表
      menulist: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 当前激活链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录，清空token，跳转到登录页面
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 展开/缩小侧边栏
    openCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接激活状态
    saveNavStatus(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.homeContainer {
  height: 100%;
}
.el-header {
  background-color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 22px;
  > div {
    display: flex;
    align-items: center;
    color: #fff;
    > img {
      padding-right: 20px;
    }
  }
}
.el-aside {
  background-color: #888;
  .el-menu {
    border-right: 0;
  }
  .btn-onoff {
    width: 100%;
    background-color: #475163;
    height:30px;
    color: #fff;
    font-size: 16px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
}
.el-main {
  background-color: #eee;
}
.iconfont {
  margin-right: 10px;
}
</style>
