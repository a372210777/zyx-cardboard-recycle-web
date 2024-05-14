<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 详情 -->
      <el-dialog title="编辑" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false">
        <div>
          <div>
            <div>单据明细</div>
            <div>
              <el-form
                ref="editForm"
                :model="form"
                :rules="rules"
                size="small"
                :inline="true"
                label-width="80px"
              >
                <el-form-item label="仓库" prop="stockId">
                  <el-select v-model="form.stockId" filterable placeholder="请选择">
                    <el-option
                      v-for="item in warehouseList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="供应商" prop="supplier">
                  <el-select v-model="form.supplier" filterable placeholder="请选择">
                    <el-option
                      v-for="item in supplierList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="入库时间" prop="stockInTime">
                  <el-date-picker
                    v-model="form.stockInTime"
                    type="date"
                    :picker-options="pickerOptions"
                    clearable
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                  />
                </el-form-item>
              </el-form>

              <!-- <label class="el-form-item-label">物料</label>
                            <el-select v-model="form.materialId" clearable filterable placeholder="请选择">
                                <el-option v-for="item in materialList" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select> -->
            </div>
          </div>
          <div>
            <span>物料明细</span>
            <div>
              <el-table ref="table" :data="orderItems" size="small" style="width: 100%;">
                <el-table-column prop="materialName" width="150" label="物料">
                  <template slot-scope="scope">
                    <span v-if="scope.row.isEdit">

                      <el-select
                        v-model="scope.row.tempMaterialId"
                        filterable
                        placeholder="请选择"
                        @change="materialChange(scope.row);"
                      >
                        <el-option
                          v-for="item in materialList"
                          :key="'material-' + item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                      </el-select>
                    </span>
                    <span v-else>
                      {{ scope.row.material.name }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" width="150" label="数量（kg）">
                  <template slot-scope="scope">
                    <span v-if="scope.row.isEdit">
                      <el-input v-model="scope.row.quantity" placeholder="请输入内容" clearable />
                    </span>
                    <span v-else>
                      {{ scope.row.quantity }}
                    </span>
                  </template>

                </el-table-column>
                <el-table-column prop="unitPrice" width="150" label="单价（元）">

                  <template slot-scope="scope">
                    <span v-if="scope.row.isEdit">
                      <el-input v-model="scope.row.unitPrice" placeholder="请输入内容" clearable />
                    </span>
                    <span v-else>
                      {{ scope.row.unitPrice }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="总金额（元）" width="100">
                  <template slot-scope="scope">
                    {{ calcuteTotal(scope.row) }}
                  </template>
                </el-table-column>
                <el-table-column prop="unit" label="单位" />
                <el-table-column prop="remark" label="备注">
                  <template slot-scope="scope">
                    <span v-if="scope.row.isEdit">
                      <el-input v-model="scope.row.remark" placeholder="请输入内容" clearable />
                    </span>
                    <span v-else>
                      {{ scope.row.remark }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200px" align="center">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" @click="delEvent(scope.row)">刪除</el-button>
                    <el-button size="mini" type="primary" @click="editEvent(scope.row)">编辑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="add">新增</el-button>
          <el-button type="primary" @click="save">保存</el-button>

        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>

import { queryMaterial, queryWarehouse, querySupplier } from '@/api/common'

import { generateRandom, deepClone, dateFormat } from '@/utils/index'
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
export default {
  name: 'StockInOrderItem',
  components: {},
  data() {
    return {
      dialogVisible: false,
      orderItems: [],
      backupOrderItems: [], // 备份原始数据
      inOrderData: {}, // 完整的入库单数据
      warehouseList: [],
      supplierList: [], // 供应商列表
      materialList: [],
      form: {
        supplier: '',
        stockId: '',
        stockInTime: ''
      },
      rules: {
        stockInTime: [
          { required: true, message: '入库时间不能为空', trigger: 'change' },
          { required: true, validator: checkInTime, trigger: 'change' }
        ],

        supplier: [
          { required: true, message: '供应商不能为空', trigger: 'blur' }
        ],
        stockId: [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ],
        material: [
          { required: true, message: '物料不能为空', trigger: 'blur' }
        ]

      },
      permission: {
        add: ['admin', 'stockInOrderItem:add'],
        edit: ['admin', 'stockInOrderItem:edit'],
        del: ['admin', 'stockInOrderItem:del']
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
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
        this.form.supplier = this.supplierList[0].id
      }
    })
    queryMaterial(params).then(res => {
      this.materialList = res.content
      // if (this.materialList.length) {
      //     this.form.materialId = this.materialList[0].id;
      // }
    })
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content
      if (this.warehouseList.length) {
        this.form.stockId = this.warehouseList[0].id
      }
    })
  },
  methods: {
    // 参数2为完整的数据
    showDialog(data = [], inOrderData) {
      this.dialogVisible = true
      this.orderItems = data
      this.orderItems.forEach(element => {
        element.materialName = element.material.name
      })
      this.backupOrderItems = deepClone(this.orderItems)
      this.inOrderData = inOrderData
      this.form.stockInTime = this.inOrderData.stockInTime
    },
    hideDialog() {
      this.dialogVisible = false
      this.orderItems = []
    },
    calcuteTotal(row) {
      return (row.quantity * row.unitPrice).toFixed(3)
    },

    delEvent(data = {}) {
      let index = -1
      this.orderItems.forEach((item, i) => {
        if (item.id == data.id) {
          index = i
        }
      })
      if (index != -1) {
        this.orderItems.splice(index, 1)
      }
    },
    editEvent(data = {}) {
      data.isEdit = !data.isEdit
      console.log('test====', data)
    },
    reset() {
      this.orderItems = deepClone(this.backupOrderItems)
      this.form.stockInTime = this.inOrderData.stockInTime
    },
    save() {
      if (this.orderItems.length == 0) {
        this.$message({
          message: '至少要有一条入库物料',
          type: 'warning'
        })
        return
      }
      this.$refs['editForm'].validate((valid) => {
        if (!valid) {
          this.$message({
            message: '单据明细表单校验失败',
            type: 'error'
          })
          return false
        }
        let hasError = false
        let index = -1
        let errorMsg = ''
        for (let i = 0; i < this.orderItems.length; i++) {
          if (!this.orderItems[i].tempMaterialId) {
            index = i
            errorMsg = '第' + (i + 1) + '行物料不能为空'
            hasError = true
            break
          }
          if (!this.orderItems[i].quantity) {
            index = i
            errorMsg = '第' + (i + 1) + '行物料数量不能为空'
            hasError = true
            break
          }
        }
        if (hasError) {
          this.$message({
            message: errorMsg,
            type: 'error'
          })
          return false
        }
        const commitParam = {
          orderItems: this.orderItems,
          orderId: this.inOrderData.id,
          supplier: this.form.supplier,
          stockId: this.form.stockId,
          stockInTime: this.form.stockInTime
        }
        console.log('提交的数据===', commitParam)
        this.$confirm(`确认保存是吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.hideDialog()
        }).catch(() => {
        })
      })
    },
    add() {
      const temp = {
        id: new Date().getTime(),
        material: {},
        quantity: 0,
        remark: '',
        isEdit: true,
        isNew: true,
        unit: 'Kg',
        unitPrice: 0,
        tempMaterialId: ''
      }
      this.orderItems.push(temp)
    },
    // 物料下拉切换
    materialChange(row) {
      console.log('trigger change===', row)
      // 找到物料元数据
      const temp = this.materialList.find((item) => {
        return item.id == row.tempMaterialId
      })
      row.materialName = temp.name
      row.material = temp
      console.log('material change===', temp, row)
      // if (temp) {
      //     let index = -1;
      //     let obj = {};
      //     this.orderItems.forEach((item, i) => {
      //         if (item.material.id == materialId) {
      //             index = i;
      //             obj = deepClone(item);
      //         }
      //     })
      //     obj.material = temp;
      //     obj.materialName = temp.name;
      //     if (index != -1) {
      //         console.log('替换元素')
      //         // this.orderItems.splice(index,1,obj)
      //     }
      // }
    }

  }
}
</script>

<style scoped></style>
