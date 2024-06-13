<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">出库单号</label>
        <el-input
          v-model="query.id"
          clearable
          placeholder="出库单号"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">出库时间</label>
        <el-date-picker
          v-model="query.stockOutTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          unlink-panels
          :picker-options="pickerOptions"
        />
        <label class="el-form-item-label">仓库</label>
        <el-select
          v-model="query.warehouseId"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
          @click="showAddDialog('paper')"
        >新建黄板纸出库单</el-button>
        <el-button
          slot="left"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="showAddDialog('other')"
        >新建非黄板纸出库单</el-button>
      </crudOperation>
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          size="small"
          label-width="80px"
        >
          <el-form-item label="出库单号">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="采购商" prop="buyerId">
            <el-input v-model="form.buyerId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="承运商" prop="carrierId">
            <el-input v-model="form.carrierId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="仓库" prop="warehouseId">
            <el-input v-model="form.warehouseId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="出库时间" prop="stockOutTime">
            <el-input v-model="form.stockOutTime" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            :loading="crud.status.cu === 2"
            type="primary"
            @click="crud.submitCU"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        :max-height="$store.state.settings.maxTableHeight"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="出库单号" />
        <el-table-column prop="buyerId" label="采购商">
          <template
            slot-scope="scope"
          >{{ scope.row.buyer.name }}
          </template>
        </el-table-column>
        <el-table-column prop="carrierId" label="承运商">
          <template
            slot-scope="scope"
          >{{ scope.row.carrier.name }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouseId" label="仓库">
          <template
            slot-scope="scope"
          >{{ scope.row.warehouse.name }}
          </template>
        </el-table-column>
        <el-table-column prop="stockOutTime" label="出库时间" />
        <el-table-column label="物料明细" width="150px">
          <template slot-scope="scope">
            {{ getOrderDetail( scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="制单人" />
        <el-table-column prop="createTime" label="制单时间" />
        <el-table-column
          v-if="checkPer(['admin', 'stockOutOrder:edit', 'stockOutOrder:del'])"
          label="操作"
          width="250px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation
              disabled-edit
              :data="scope.row"
              :permission="permission"
            >
              <el-button
                size="mini"
                type="primary"
                @click="showDetailDialog(scope.row)"
              >详情</el-button>
            </udOperation>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>

    <detailDialog ref="detailDialog" />
    <addDialog ref="addDialog" />
  </div>
</template>

<script>
import crudStockOutOrder from '@/api/outOrder/outOrderManage'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import detailDialog from './detailDialog'
import addDialog from './addDialog'
import { queryWarehouse } from '@/api/common'
const defaultForm = {
  id: null,
  buyerId: null,
  carrierId: null,
  warehouseId: null,
  createBy: null,
  createTime: null,
  stockOutTime: null,
  updateBy: null,
  updateTime: null,
  deleted: null
}
export default {
  name: 'StockOutOrder',
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    detailDialog,
    addDialog
  },
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
      title: '出库单',
      url: 'api/stockOutOrder',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudStockOutOrder }
    })
  },
  data() {
    return {
      warehouseList: [],
      pickerOptions: this.$store.state.settings.defaultPickerOptions,
      permission: {
        add: ['admin', 'stockOutOrder:add'],
        edit: ['admin', 'stockOutOrder:edit'],
        del: ['admin', 'stockOutOrder:del']
      },
      rules: {
        buyerId: [
          { required: true, message: '采购商不能为空', trigger: 'blur' }
        ],
        carrierId: [
          { required: true, message: '承运商不能为空', trigger: 'blur' }
        ],
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ],
        stockOutTime: [
          { required: true, message: '出库时间不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'id', display_name: '出库单号' },
        { key: 'warehouseId', display_name: '仓库' }
      ]
    }
  },
  mounted() {
    const params = {
      page: 0,
      size: 100
    }
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content || []
      if (this.warehouseList.length) {
        this.query.warehouseId = this.warehouseList[0].id
      }
    })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    showDetailDialog(data = {}) {
      this.$refs.detailDialog.showDialog(data)
    },
    showAddDialog(mode = 'paper') {
      this.$refs.addDialog.showDialog(mode)
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
