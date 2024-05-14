<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <label class="el-form-item-label">仓库</label>
        <el-select
          v-model="form.stockId"
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
        <label class="el-form-item-label">物料</label>
        <el-select
          v-model="form.materialId"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in materialList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <!-- <label class="el-form-item-label">物料类别</label>
          <el-select
            v-model="form.materialCategory"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in dict.material_category"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select> -->
        <label class="el-form-item-label">统计日期</label>
        <el-date-picker
          v-model="form.dateTime"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          @change="dateChange"
        />

        <div>
          <span>
            <el-button
              class="filter-item"
              size="mini"
              type="success"
              icon="el-icon-search"
              @click="queryData"
            >搜索</el-button>
            <el-button
              class="filter-item"
              size="mini"
              type="warning"
              icon="el-icon-refresh-left"
              @click="reset"
            >重置</el-button>
          </span>
        </div>
      </div>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="small"
        style="width: 100%;margin-top:20px"
        :max-height="$store.state.settings.maxTableHeight"
      >
        <el-table-column prop="dateTime" label="日期" />
        <el-table-column prop="stockName" label="仓库" />
        <el-table-column prop="materialName" label="物料" />
        <!-- <el-table-column prop="materialCategory" label="物料类别">
            <template slot-scope="scope">
              {{ dict.label.material_category[scope.row.materialCategory] }}
            </template>
          </el-table-column> -->
        <el-table-column prop="quantity" label="库存数量" />

      </el-table>
      <!--分页组件-->
      <el-pagination
        :current-page.sync="page.pageNumber"
        style="margin-top: 8px;"
        :page-sizes="[10, 20, 30, 40, 50, 100, 200, 500]"
        :page-size="page.pageSize"
        layout="total, prev, pager, next, sizes"
        :total="page.total"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
      />
    </div>
  </div>
</template>

<script>
import { inAndOutOrderStatics } from '@/api/report/inAndOut'
import { queryMaterial, queryWarehouse } from '@/api/common'
import { queryStockList } from '@/api/stock/stockManage'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import { dateFormat, deepClone } from '@/utils/index'

const endDate = new Date().getTime()
const endDateStr = dateFormat(endDate, 'yyyy-MM-dd')

export default {
  name: 'StockManage',
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    DateRangePicker
  },
  dicts: ['material_category', 'report_type'],
  data() {
    return {
      loading: false,
      tableData: [],
      warehouseList: [],
      materialList: [],
      pickerOptions: this.$store.state.settings.defaultPickerOptions,
      orderTypeList: [
        {
          label: '入库单',
          value: 'stockIn'
        },
        {
          label: '出库单',
          value: 'stockOut'
        }
      ],
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
      },
      form: {
        materialCategory: '',
        materialId: '',
        stockId: '',
        orderType: 'stockIn', // 入库单，出库单
        reportType: '', // 统计方式
        dateTime: endDateStr
      },
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      }
    }
  },
  watch: {
    'dict.report_type': {
      handler(val) {
        if (val && val.length) {
          this.form.reportType = val[0].value
        }
      }
    }
  },
  mounted() {
    const params = {
      page: 0,
      size: 100
    }
    queryMaterial(params).then(res => {
      this.materialList = res.content
      if (this.materialList.length) {
        this.form.materialId = this.materialList[0].id
      }
    })
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content
      if (this.warehouseList.length) {
        this.form.stockId = this.warehouseList[0].id
      }
    })
  },
  methods: {
    dateChange(val) {
      console.log('date change', val)
      this.form.dateTime = dateFormat(val, 'yyyy-MM-dd')
    },
    getTypeName() {
      const ele = this.orderTypeList.find(item => {
        return item.value == this.form.orderType
      })
      return ele ? ele.label : ''
    },
    queryData() {
      this.loading = true
      const param = deepClone(this.form)
      param.pageSize = this.page.pageSize
      param.pageNumber = this.page.pageNumber
      param.dateTime = param.dateTime + ' 23:59:59'
      console.log(param)
      this.tableData = []
      queryStockList(param)
        .then(res => {
          console.log('test===', res)

          if (res.materialId) {
            this.tableData.push(res)
          }
          // this.page.total = res.totalElements;
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 每页条数改变
    sizeChangeHandler(e) {
      this.page.pageSize = e
      this.page.pageNumber = 1
      this.queryData()
    },
    // 当前页改变
    pageChangeHandler(e) {
      this.page.pageNumber = e
      this.queryData()
    },
    reset() {
      // this.date = [beginDateStr, endDateStr];
      this.form.beginDate = beginDateStr
      this.form.endDate = endDateStr
      this.form.materialCategory = ''
      this.form.materialId = ''
      this.form.stockId = this.warehouseList[0].id
      this.form.orderType = 'stockIn'
      this.form.reportType = 'summary'
    }
  }
}
</script>

  <style scoped></style>
