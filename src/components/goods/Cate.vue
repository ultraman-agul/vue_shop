<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card>
            <el-row>
                <el-col :span="6">
                   <el-button type="primary" @click="showAddCateDialog()">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table :data="cateList" :columns="columns" show-index index-text="#" border :show-row-hover="false" :selection-type="false" :expand-type="false" class="tableSty">
                <!-- 是否有效 -->
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <template slot="operation" slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCate(scope.row)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
            <!-- 添加分类对话框 -->
            <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClosed()"
            >
            <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- 级联选择器 -->
                    <!-- options 指定数据源 -->
                    <!-- porps 指定配置对象 -->
                    <el-cascader
                    expandTrigger='hover'
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="selectedKeysChange"
                    style="width:100%" clearable change-on-select>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate()">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 编辑分类的对话框 -->
            <el-dialog
            title="编辑分类"
            :visible.sync="editDialogVisible"
            width="50%"
            >
            <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="80px">
                <el-form-item label="分类id">
                    <el-input v-model="editCateForm.cat_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate()">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类数据列表,默认为空
            cateList: [],
            // 总数据条数
            total: 0,
            // 为表格指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 设置当前列为模板列
                    type: 'template',
                    // 表示当前列使用模板名称
                    template: 'isOk'
                },
                {
                    label: '排序',
                    // 设置当前列为模板列
                    type: 'template',
                    // 表示当前列使用模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 设置当前列为模板列
                    type: 'template',
                    // 表示当前列使用模板名称
                    template: 'operation'
                }
            ],
            // 添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类表单
            addCateForm: {
                // 将要添加的分类名称
                cat_name: '',
                // 父级分类的id
                cat_pid: 0,
                // 默认为一级分类
                cat_level: 0
            },
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类的数据列表
            parentCateList: [],
            // 被选中的父级分类
            selectedKeys: [],
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover'
            },
            // 编辑分类对话框显示和隐藏
            editDialogVisible: false,
            // 编辑分类表单数据
            editCateForm: {},
            // 编辑分类验证规则
            editCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类数据列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: this.queryInfo
                })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类列表失败!')
            }
            // 商品分类数据列表赋值
            this.cateList = res.data.result
            // 总数赋值
            this.total = res.data.total
        },
        // 页面大小改变时
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 页码改变时
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 显示添加分类对话框
        showAddCateDialog() {
            // 先获取父级分类的数据列表
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: {
                        type: 2
                    }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表失败!')
            }
            this.parentCateList = res.data
        },
        // 选中的值改变时
        selectedKeysChange() {
            // 数组大于零则选择了父级分类
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 提交添加分类
        async addCate() {
            const { data: res } = await this.$http.post('categories', this.addCateForm)
            if (res.meta.status !== 201) {
                return this.$message.error('添加分类失败！')
            }
            this.getCateList()
            this.addCateDialogVisible = false
            this.$message.success('添加分类成功')
            console.log(this.addCateForm)
        },
        // 关闭添加分类对话框时重置表单数据
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        showEditCate(cate) {
            this.editDialogVisible = true
            this.editCateForm = cate
            console.log(cate.cat_id)
        },
        // 提交编辑分类表单
        async editCate() {
            const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, this.editCateForm)
            if (res.meta.status !== 200) {
                this.$message.error('编辑分类失败！')
            }
            this.getCateList()
            this.editDialogVisible = false
            this.$message.success('编辑分类成功')
        },
        // 提示是否确定删除，确定则删除
        async deleteCate(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(error => error)
            if (confirmResult === 'cancel') {
                return this.$message.info('已取消删除该分类')
            }
            const { data: res } = await this.$http.delete('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除分类失败！')
            }
            this.getCateList()
            this.$message.success('删除分类成功')
        }
    }
}
</script>

<style lang="less" scope>
    .tableSty {
        margin-top: 15px
    }
</style>
