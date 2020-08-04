<template>
  <div>
      <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
        <!-- 警告区域 -->
        <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning" :closable="false">
        </el-alert>
        <!-- 商品分类区域 -->
        <el-row class="rowSty">
            <el-col>
                <span>选择商品参数：</span>
                <el-cascader
                v-model="selectedKeys"
                :options="cateList"
                :props="cascaderProps"
                @change="selectedKeysChange"
                change-on-select></el-cascader>
            </el-col>
        </el-row>
        <el-row>
            <!-- tab分栏 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyParamsList" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="tagClosed(i, scope.row)">{{item}}</el-tag>
                                <!-- 绑定到当前行的值和当前的显示 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                     <!-- 动态参数表格 -->
                    <el-table :data="onlyParamsList" border stripe>
                         <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="tagClosed(i, scope.row)">{{item}}</el-tag>
                                <!-- 绑定到当前行的值和当前的显示 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-card>
    <!-- 添加参数/属性对话框 -->
    <el-dialog
    :title="'添加' + titleText"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClosed"
    >
    <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 编辑参数对话框 -->
    <el-dialog
    :title="'编辑' + titleText"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClosed"
    >
    <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有的分类列表
            cateList: [],
            // 选中的分类，级联选择框双向绑定
            selectedKeys: [],
            // 配置对象
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover'
            },
            // 最终选中的分类，详细
            selectedCate: {},
            activeName: 'many',
            // 动态参数列表
            manyParamsList: [],
            // 静态属性列表
            onlyParamsList: [],
            // 添加参数对话框的显示与隐藏
            addDialogVisible: false,
            // 添加参数表单数据对象
            addForm: {},
            // 添加参数表单验证规则
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入分类参数名称', trigger: 'blur' }
                ]
            },
            // 编辑对话框的显示与隐藏
            editDialogVisible: false,
            // 编辑参数表单数据对象
            editForm: {},
            // 编辑表单验证规则
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入内容', trigger: 'blur' }
                ]
            },
            // 控制按钮与文本框的切换显示
            inputVisible: false,
            // 添加tag的输入文本框的值
            inputValue: '',
            saveTagInput: {}
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取所有分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表失败！')
            }
            this.cateList = res.data
            console.log(this.cateList)
        },
        // 级联选择器的选择改变时
        selectedKeysChange() {
            this.getParamsList()
        },
        // 切换tab时获取参数列表
        handleTabClick() {
            console.log(this.activeName)
            this.getParamsList()
        },
        // 获取参数列表
        async getParamsList() {
            // 如果selectedKey.length === 3 则选择为三级分类，否则不是
            if (this.selectedKeys.length !== 3) {
                this.selectedKeys = []
                // 唯有三级分类才可以有数据
                this.manyParamsList = []
                this.onlyParamsList = []
                return false
            } else {
                console.log(this.selectedKeys)
                // 获取参数列表
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: this.activeName
                    }
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品参数失败！')
                }
                console.log(res.data)
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                    // 文本框的显示
                    item.inputVisible = false
                    // 文本框输入的值
                    item.inputValue = ''
                })
                console.log(res.data)
                if (this.activeName === 'many') {
                    this.manyParamsList = res.data
                } else {
                    this.onlyParamsList = res.data
                }
            }
        },
        // 监听添加参数对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 添加参数属性
        async addParams() {
            this.$refs.addFormRef.validate(async vaild => {
                if (!vaild) return
                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数属性错误！')
                }
                this.addDialogVisible = false
                this.getParamsList()
                this.$message.success('添加成功')
            })
        },
        // 显示编辑参数对话框
        async showEditDialog(id) {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/` + id, {
                params: { attr_sel: this.activeName }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听编辑参数对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 提交编辑表单
        async editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
            if (res.meta.status !== 200) {
                return this.$message.error('提交修改失败！')
            }
            this.editDialogVisible = false
            this.getParamsList()
            this.$message.success('修改成功')
            })
        },
        // 删除参数属性
        async deleteParams(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该参数/属性, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(error => error)
            if (confirmResult === 'cancel') {
                return this.$message.info('已取消删除！')
            }
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除失败！')
            }
            this.getParamsList()
            this.$message.success('删除参数成功！')
        },
        // 添加tag标签
        handleInputConfirm(row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return false
            }
            // 如果没有return，则用户输入了内容,进行提交
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            this.saveAttrVals(row)
        },
        // 保存对参数项的修改
        async saveAttrVals(row) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: this.activeName,
                attr_vals: row.attr_vals.join(' ')
            })
            if (res.meta.status !== 200) {
                return this.$message.error('提交参数项失败！')
            }
            // this.getParamsList()
            this.$message.success('提交参数项成功')
        },
        // tag标签切换成input标签
        showInput(row) {
            row.inputVisible = true
            // 切换成input时自动获取焦点
            // $nextTick是页面重新渲染时触发里面的回调函数
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
                })
        },
        // 删除选中的参数项
        tagClosed(i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        // 如果按钮被禁用则返回true，否则返回false
        isBtnDisabled() {
            if (this.selectedKeys.length !== 3) {
                return true
            }
            return false
        },
        // 监听获取选中的分类id
        cateId() {
            if (this.selectedKeys.length === 3) {
                return this.selectedKeys[2]
            }
            return null
        },
        // 添加参数/属性文本
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style>
    .rowSty {
        margin: 15px 0;
    }
    .el-tag {
        margin: 10px;
    }
    .input-new-tag {
        width: 120px !important;
    }
</style>
