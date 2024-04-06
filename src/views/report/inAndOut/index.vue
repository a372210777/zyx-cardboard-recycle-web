<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <label class="el-form-item-label">仓库</label>
        <el-select
          v-model="form.warehouseId"
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
        <label class="el-form-item-label">物料类别</label>
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
        </el-select>
        <label class="el-form-item-label">统计日期</label>
        <el-date-picker
          v-model="date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          unlink-panels
          @change="dateChange"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
        <label class="el-form-item-label">出入库</label>
        <el-select
          v-model="form.orderType"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in orderTypeList"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">统计方式</label>
        <el-select
          v-model="form.reportType"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in dict.report_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span>
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-search"
            @click="queryData"
            >搜索</el-button
          >
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-refresh-left"
            @click="reset"
            >重置</el-button
          >
        </span>
      </div>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="small"
        style="width: 100%;margin-top:20px"
        :maxHeight="$store.state.settings.maxTableHeight"
      >
        <el-table-column prop="orderType" label="出入库">
          <template slot-scope="scope">
            {{ getTypeName() }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库" />
        <el-table-column prop="materialName" label="物料" />
        <el-table-column prop="materialCategory" label="物料类别">
          <template slot-scope="scope">
            {{ dict.label.material_category[scope.row.materialCategory] }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="money" label="总金额（元）" />
        <el-table-column prop="date" label="日期" />
      </el-table>
      <!--分页组件-->
      <el-pagination
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
        :current-page.sync="page.pageNumber"
        style="margin-top: 8px;"
        :page-sizes="[10, 20, 30, 40, 50, 100, 200, 500]"
        :page-size="page.pageSize"
        layout="total, prev, pager, next, sizes"
        :total="page.total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { inAndOutOrderStatics } from "@/api/report/inAndOut";
import { queryMaterial, queryWarehouse } from "@/api/common";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";
import DateRangePicker from "@/components/DateRangePicker";
import { dateFormat, deepClone } from "@/utils/index";

let endDate = new Date().getTime();
let beginDate = endDate - 7 * 24 * 60 * 60 * 1000;
let endDateStr = dateFormat(endDate, "yyyy-MM-dd");
let beginDateStr = dateFormat(beginDate, "yyyy-MM-dd");

export default {
  name: "staticsExpendoture",
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    DateRangePicker
  },
  dicts: ["material_category", "report_type"],
  data() {
    return {
      loading: false,
      tableData: [],
      warehouseList: [],
      materialList: [],
      pickerOptions: this.$store.state.settings.defaultPickerOptions,
      orderTypeList: [
        {
          label: "入库单",
          value: "stockIn"
        },
        {
          label: "出库单",
          value: "stockOut"
        }
      ],
      date: [beginDateStr, endDateStr],
      form: {
        materialCategory: "",
        materialId: "",
        warehouseId: "",
        orderType: "stockIn", //入库单，出库单
        reportType: "", //统计方式
        beginDate: beginDateStr,
        endDate: endDateStr
      },
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      }
    };
  },
  watch: {
    "dict.report_type": {
      handler(val) {
        if (val && val.length) {
          this.form.reportType = val[0].value;
        }
      }
    }
  },
  mounted() {
    let params = {
      page: 0,
      size: 100
    };
    queryMaterial(params).then(res => {
      this.materialList = res.content;
      if (this.materialList.length) {
        this.form.materialId = this.materialList[0].id;
      }
    });
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content;
      if (this.warehouseList.length) {
        this.form.warehouseId = this.warehouseList[0].id;
      }
    });
  },
  methods: {
    dateChange(val) {
      if (val && val.length) {
        this.form.beginDate = val[0];
        this.form.endDate = val[1];
      }
    },
    getTypeName() {
      let ele = this.orderTypeList.find(item => {
        return item.value == this.form.orderType;
      });
      return ele ? ele.label : "";
    },
    queryData() {
      this.loading = true;
      let param = deepClone(this.form);
      param.pageSize = this.page.pageSize;
      param.pageNumber = this.page.pageNumber;
      inAndOutOrderStatics(param)
        .then(res => {
          this.tableData = res.content;
          this.page.total = res.totalElements;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 每页条数改变
    sizeChangeHandler(e) {
      this.page.pageSize = e;
      this.page.pageNumber = 1;
      this.queryData();
    },
    // 当前页改变
    pageChangeHandler(e) {
      this.page.pageNumber = e;
      this.queryData();
    },
    reset() {
      this.date = [beginDateStr, endDateStr];
      this.form.beginDate = beginDateStr;
      this.form.endDate = endDateStr;
      this.form.materialCategory = "";
      this.form.materialId = "";
      this.form.warehouseId = this.warehouseList[0].id;
      this.form.orderType = "stockIn";
      this.form.reportType = "summary";
    }
  }
};
</script>

<style scoped></style>
