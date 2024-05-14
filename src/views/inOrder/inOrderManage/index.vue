<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">入库单号</label>
        <el-input
          v-model="query.id"
          clearable
          placeholder="入库单号"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">入库时间</label>
        <el-date-picker
          v-model="query.stockInTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          unlink-panels
          :picker-options="pickerOptions"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission">
        <el-button
          slot="left"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="addDialogVisible = true"
        >新增</el-button>
      </crudOperation>
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :visible.sync="addDialogVisible" width="900px" title="新增">
        <el-form ref="addForm" :model="formInline" :rules="rules" size="small" :inline="true" label-width="80px">
          <el-form-item label="接收仓库" prop="warehouse">
            <el-select v-model="formInline.warehouse" clearable filterable placeholder="请选择">
              <el-option v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="供应商" prop="supplier">
            <el-select v-model="formInline.supplier" clearable filterable placeholder="请选择">
              <el-option v-for="item in supplierList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="入库时间" prop="stockInTime">
            <el-date-picker
              v-model="formInline.stockInTime"
              type="date"
              clearable
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="物料" prop="material">
            <el-select v-model="formInline.material" clearable filterable placeholder="请选择">
              <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" prop="quantity">
            <el-input v-model="formInline.quantity" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-select v-model="formInline.unit" clearable filterable placeholder="请选择">
              <el-option v-for="item in dict.unit_of_weight" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formInline.remark" type="textarea" maxlength="500" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button size="mini" type="primary" @click="addToList">添加</el-button>
            <el-button size="mini" type="warning" @click="reset('addForm')">重置</el-button>
          </el-form-item>
        </el-form>
        <div>
          <el-table ref="table" :data="addData" size="small" style="width: 100%;">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column label="数量" prop="quantity" />

            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="warehouseName" label="仓库" />
            <el-table-column prop="stockInTime" label="入库时间" />
            <el-table-column prop="supplierName" label="供应商" />
            <el-table-column prop="remark" label="备注" />
            <el-table-column label="操作" width="100px" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="delAddData(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="addDialogVisible = false">取消</el-button>
          <el-button :loading="loading" type="primary" @click="save">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="入库单号" />
        <el-table-column label="仓库">
          <template slot-scope="scope">
            {{ scope.row.warehouse.name }}
          </template>
        </el-table-column>
        <el-table-column prop="stockInTime" label="入库时间" />
        <el-table-column label="供应商">
          <template slot-scope="scope">
            {{ scope.row.supplier.name }}
          </template>
        </el-table-column>
        <el-table-column label="物料明细" width="150px">
          <template slot-scope="scope">
            {{ getOrderDetail(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="制单人" />
        <el-table-column prop="createTime" label="制单时间" />
        <el-table-column
          v-if="checkPer(['admin', 'stockInOrder:edit', 'stockInOrder:del'])"
          label="操作"
          width="200px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" disabled-edit :show-edit="false" :permission="permission">
              <el-button size="mini" type="primary" @click="showDetailDialog(scope.row)">详情</el-button>
              <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
            </udOperation>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
    <detailDialog ref="detailDialog" />
    <editDialog ref="editDialog" />
  </div>
</template>

<script>
import crudStockInOrder from '@/api/inOrder/inOrderManage'
import { querySupplier, queryMaterial, queryWarehouse } from '@/api/common'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import detailDialog from './detailDialog.vue'
import editDialog from './editDialog.vue'
import { generateRandom, deepClone, dateFormat } from '@/utils/index'

const defaultForm = {
  id: null,
  warehouseId: null,
  stockInTime: null,
  supplierId: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  deleted: null
}
export default {
  name: 'StockInOrder',
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    detailDialog,
    editDialog
  },
  dicts: ['unit_of_weight'],
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    const optShow = {
      add: false,
      edit: false,
      del: true,
      download: true,
      reset: true
    }
    return CRUD({
      optShow,
      title: '入库单',
      url: 'api/stockInOrder',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudStockInOrder }
    })
  },
  data() {
    const checkNumber = (rule, value, callback) => {
      if (value && String(value).trim()) {
        if (!/^[0-9]+(.[0-9]+)?$/.test(value)) {
          callback(new Error('仅限输入数字'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const checkQuantity = (rule, value, callback) => {
      if (Number(value) <= 0) {
        callback(new Error('数量不能小于等于0'))
      } else {
        callback()
      }
    }
    const checkInTime = (rule, value, callback) => {
      if (new Date(value).getTime() > new Date().getTime()) {
        callback(new Error('入库时间不能大于今天'))
      } else {
        callback()
      }
    }

    return {
      addDialogVisible: false,
      detailDialog: false,
      addData: [],
      supplierList: [], // 供应商列表
      warehouseList: [], // 仓库列表
      materialList: [], // 物料数据
      loading: false,
      pickerOptions: this.$store.state.settings.defaultPickerOptions,
      permission: {
        add: ['admin', 'stockInOrder:add'],
        edit: ['admin', 'stockInOrder:edit'],
        del: ['admin', 'stockInOrder:del']
      },
      formInline: {
        material: '', // 物料ID
        materialName: '',
        quantity: 0,
        supplier: '', // 供应商ID
        supplierName: '',
        remark: '',
        stockInTime: dateFormat(new Date(), 'yyyy-MM-dd'), // 入库时间
        warehouse: '', // 仓库ID
        warehouseName: '',
        unit: ''
      },
      rules: {
        stockInTime: [
          { required: true, message: '入库时间不能为空', trigger: 'change' },
          { required: true, validator: checkInTime, trigger: 'change' }
        ],

        supplier: [
          { required: true, message: '供应商不能为空', trigger: 'blur' }
        ],
        warehouse: [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ],
        material: [
          { required: true, message: '物料不能为空', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: '数量不能为空', trigger: 'blur' },
          { required: true, validator: checkNumber, trigger: 'blur' },
          { required: true, validator: checkQuantity, trigger: 'blur' }
        ],
        unit: [{ required: true, message: '单位不能为空', trigger: 'blur' }]
      },
      queryTypeOptions: [{ key: 'id', display_name: '入库单号' }]
    }
  },
  watch: {
    'dict.unit_of_weight': {
      handler(val) {
        if (val && val.length) {
          this.formInline.unit = val[0].value
        }
      },
      immediate: true
    }
  },
  mounted() {
    const params = {
      page: 0,
      size: 100
    }
    querySupplier(params).then(res => {
      this.supplierList = res.content
      if (this.supplierList.length) {
        this.formInline.supplier = this.supplierList[0].id
      }
    })
    queryMaterial(params).then(res => {
      this.materialList = res.content
      if (this.materialList.length) {
        this.formInline.material = this.materialList[0].id
      }
    })
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content
      if (this.warehouseList.length) {
        this.formInline.warehouse = this.warehouseList[0].id
      }
    })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    showDetailDialog(data = {}) {
      this.$refs.detailDialog.showDialog(data.orderItems)
    },
    showEditDialog(data = {}) {
      const temp = deepClone(data.orderItems)
      temp.forEach((item) => {
        if (!item.hasOwnProperty('isEdit')) {
          this.$set(item, 'isEdit', false)
        }
        this.$set(item, 'tempMaterialId', item.material.id)
      })
      console.log(data)
      this.$refs.editDialog.showDialog(temp, data)
    },
    reset(formName) {
      this.$refs[formName].resetFields()
    },
    save() {
      if (!this.addData.length) {
        this.$message.warning('请先添加数据')
        return
      }
      this.$confirm('确定要保存数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        const firstEle = this.addData[0]
        const submitData = {
          id: new Date().getTime(),
          stockInTime: firstEle.stockInTime,
          orderItems: [],
          supplier: {
            id: firstEle.supplier
          },
          warehouse: {
            id: firstEle.warehouse
          }
        }
        submitData.orderItems = deepClone(this.addData) || [] // 入库单下的物料
        submitData.orderItems.forEach(item => {
          item.material = {
            id: item.material
          }
        })
        crudStockInOrder
          .add(submitData)
          .then(res => {
            this.loading = false
            this.addData = []
            this.crud.refresh()
            this.addDialogVisible = false
          })
          .catch(() => {
            this.loading = false
            this.addDialogVisible = false
          })
      })
    },
    addToList(data) {
      this.$refs['addForm'].validate(valid => {
        if (valid) {
          const warehouseItem = this.warehouseList.find(
            item => item.id == this.formInline.warehouse
          )
          const materialItem = this.materialList.find(
            item => item.id == this.formInline.material
          )
          const supplierItem = this.supplierList.find(
            item => item.id == this.formInline.supplier
          )

          // 禁止重复添加相同得物料
          let isAddSameMaterial = false
          this.addData.forEach(item => {
            if (this.formInline.material == item.material) {
              isAddSameMaterial = true
            }
          })
          if (isAddSameMaterial) {
            this.$message.warning('已添加过该物料，如需添加请先删除')
            return
          }
          const stockInTimeArr = this.addData.map(item => {
            return item.stockInTime
          })
          stockInTimeArr.push(this.formInline.stockInTime)
          if (new Set(stockInTimeArr).size > 1) {
            this.$message.warning('物料的入库时间必须一致')
            return
          }

          this.formInline.materialName = materialItem.name
          this.formInline.warehouseName = warehouseItem.name
          this.formInline.supplierName = supplierItem.name
          this.formInline.randomId = generateRandom()
          this.addData.push(Object.assign({}, this.formInline))
        }
      })
    },
    delAddData(data) {
      console.log(data)
      this.addData = this.addData.filter(item => {
        return item.randomId != data.randomId
      })
    },
    getOrderDetail(data = {}) {
      let str = '';
      (data.orderItems || []).forEach((item, index) => {
        let temp = item.material.name + '-' + item.quantity
        if (index < data.orderItems.length - 1) {
          temp += ','
        }
        str += temp + '\n'
      })
      return str
    }
  }
}
</script>

<style scoped></style>
