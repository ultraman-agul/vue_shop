<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>角色管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 三层for循环 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1===0 ? 'bdtop' : '', 'vcenter']">
                            <el-col :span="5" >
                                <el-tag closable @close="deleteRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2===0 ? '' : 'bdtop', 'vcenter']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="deleteRightsById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" :class="[i3===0 ? '' : 'bdtop']" closable @close="deleteRightsById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- <pre>
                            {{ scope.row }}
                        </pre> -->
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
            <!-- 添加角色表单 -->
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 修改角色的对话框 -->
        <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed()">
        <span>修改角色</span>
        <!-- 修改角色表单 -->
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
            <el-form-item label="角色名称">
            <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改角色的对话框结束 -->
        <!-- 设置权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="50%" @close="setRightsDialogClosed()">
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rolesList: [],
            addDialogVisible: false,
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '角色名称长度在2~10个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 3, max: 15, message: '密码长度在3~15个字符之间', trigger: 'blur' }
                ]
            },
             // 编辑角色的表单
            editForm: {},
            editFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '角色名称长度在2~10个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                     { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 4, max: 15, message: '角色描述长度在4~15个字符之间', trigger: 'blur' }
                ]
            },
            editDialogVisible: false,
            setRightsDialogVisible: false,
            rightsList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中节点的id值数组
            defKeys: [],
            // 存储分配权限时需要的角色id
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        // 获取角色列表
        async getRolesList() {
            const { data: res } = await this.$http.get('/roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.rolesList = res.data
        },
        // 重置添加角色对话框的内容
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 添加角色
        addRole() {
            // 表单预校验
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) return false
                // 可以发起网络请求
                const { data: res } = await this.$http.post('/roles', this.addForm)
                // 添加失败
                if (res.meta.status !== 201) {
                    this.$message.error('角色添加失败!')
                }
                // 添加成功
                this.$message.success('角色添加成功')
                this.addDialogVisible = false
                this.getRolesList()
            })
        },
        // 显示编辑角色的对话框
        async showEditDialog(id) {
            const { data: res } = await this.$http.get('/roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询角色信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 编辑用户对话框关闭时清除验证结果
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 编辑功能的表单预校验和提交用户信息
        editRoleInfo() {
            this.$refs.editFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) {
                    return this.$message.error('验证不合法，修改失败')
                }
                // 用户提交
                const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc
                })
                // 隐藏对话框
                this.editDialogVisible = false
                // 刷新用户列表
                this.getRolesList()
                // 提示信息
                if (res.meta.status !== 200) {
                    return this.$message.error('修改角色信息失败！')
                }
                this.$message.success('修改角色信息成功')
            })
        },
        // 通过id删除角色
        async deleteRoleById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示',
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
            const { data: res } = await this.$http.delete('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除角色失败')
            }
            this.getRolesList()
            this.$message.success('删除角色成功')
        },
        // 通过id删除角色下的指定权限
        async deleteRightsById(role, rightId) {
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(error => error)
            if (confirmResult === 'cancel') {
                return this.$message.error('已取消删除')
            }
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败')
            }
            role.children = res.data
        },
        //  显示设置权限的对话框
        async showSetRightsDialog(role) {
            this.roleId = role.id
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！')
            }
            this.rightsList = res.data
            // 递归获取三级节点id
            this.getLeafKeys(role, this.defKeys)
            this.setRightsDialogVisible = true
        },
        // 通过递归，将角色下三级权限的id保存到defKeys数组中
        getLeafKeys(node, arr) {
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => this.getLeafKeys(item, arr))
        },
        // 关闭设置权限的对话框时清除数组
        setRightsDialogClosed() {
            this.defKeys = []
        },
        // 点击为角色分配权限
        async allotRights() {
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
            console.log(keys)
            const idStr = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) {
                return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.setRightsDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee
    }

    .bdbottom {
        border-bottom: 1px solid #eee
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>
