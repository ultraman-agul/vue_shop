<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 运用插槽，scope.row可以获取当前行的数据 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 添加用户表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed()">
      <span>修改用户</span>
      <!-- 修改用户表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配用户角色对话框 -->
   <el-dialog
  title="分配角色
  "
  :visible.sync="allotRolesDialogVisible"
  width="50%" @close="allotRolesDialogClosed()">
    <p>当前用户名: {{userInfo.username}}</p>
    <p>当前角色: {{userInfo.role_name}}</p>
    <p>分配角色:
       <el-select v-model="selectRoleId" placeholder="请选择">
        <el-option
          v-for="item in roleList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
    </p>
    <span slot="footer" class="dialog-footer">
      <el-button @click="allotRolesDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRole()">确 定</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
    data() {
        // 邮箱校验规则
        var checkEmail = (rule, value, cb) => {
           const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (reg.test(value)) {
                // 合法
                return cb()
            }
            // 不合法
            cb(new Error('请输入合法的邮箱'))
        }
        // 手机号校验规则
        var checkMobile = (rule, value, cb) => {
             const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
             if (reg.test(value)) {
                 // 合法
                 return cb()
             }
             // 不合法
             cb(new Error('请输入合法的手机号'))
        }
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userList: [],
            total: 0,
            addDialogVisible: false,
            // 添加用户的表单
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加用户表单的校验规则
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 15, message: '用户名长度在3~15个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 15, message: '密码长度在3~15个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 显示与隐藏编辑用户的对话框
            editDialogVisible: false,
            // 查询到的正在编辑的用户
            editForm: {},
            // 验证规则
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                     { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 分配角色对话框的显示和隐藏
            allotRolesDialogVisible: false,
            // 当前分配角色的用户信息
            userInfo: {},
            // 所有角色列表
            roleList: [],
            // 选中角色的id
            selectRoleId: ''
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        // 获取用户列表
        async getUserList() {
            const { data: res } = await this.$http.get('users', {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
            this.userList = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 改变页面大小
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 改变当前页码
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 更改用户状态
        async userStateChanged(userinfo) {
            console.log(userinfo)
            const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更改用户状态失败！')
            }
            this.$message.success('更改用户状态成功')
        },
        // 重置添加用户对话框的内容
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 添加用户
        addUser() {
            // 表单预校验
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) return false
                // 可以发起网络请求
                const { data: res } = await this.$http.post('/users', this.addForm)
                // 添加失败
                if (res.meta.status !== 201) {
                    this.$message.error('用户添加失败!')
                }
                // 添加成功
                this.$message.success('用户添加成功')
                this.addDialogVisible = false
                this.getUserList()
            })
        },
        // 显示编辑用户的对话框
        async showEditDialog(id) {
            console.log(id)
            const { data: res } = await this.$http.get('/users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询用户信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 编辑用户对话框关闭时清除验证结果
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 表单预校验和提交用户信息
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) {
                    return this.$message.error('验证不合法，修改失败')
                }
                // 用户提交
                const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                // 隐藏对话框
                this.editDialogVisible = false
                // 刷新用户列表
                this.getUserList()
                // 提示信息
                if (res.meta.status !== 200) {
                    return this.$message.error('修改用户信息失败！')
                }
                this.$message.success('修改用户信息成功')
            })
        },
        // 根据用户id删除用户
        async deleteUserById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }
        ).catch(err => err)
        // 如果用户点击取消，则返回字符串cancel
        // 如果用户点击确认，则返回字符串confirm
            // console.log(confirmResult)
        if (confirmResult === 'cancel') {
            return this.$message.info('已取消删除')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败')
        }
        this.getUserList()
        this.$message.success('删除用户成功')
        },
        // 展示分配角色对话框
        async setRoles(userinfo) {
          console.log(userinfo)
          this.userInfo = userinfo
          const { data: res } = await this.$http.get('roles')
          if (res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败!')
          }
          this.roleList = res.data
          console.log(this.roleList)
          this.allotRolesDialogVisible = true
        },
        // 提交分配的角色
        async allotRole() {
          const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
          if (res.meta.status !== 200) {
            return this.$message.error('分配角色失败!')
          }
          this.allotRolesDialogVisible = false
          this.getUserList()
          this.$message.success('分配角色成功')
        },
        // 监听分配角色对话框关闭事件
        allotRolesDialogClosed () {
          this.selectRoleId = ''
          this.userInfo = {}
        }
    }
}
</script>

<style lang="less" scoped>
</style>
