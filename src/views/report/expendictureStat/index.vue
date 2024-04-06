<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <label class="el-form-item-label">开销分类</label>
        <el-select
          v-model="form.category"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in dict.expense_category"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">开销日期</label>
        <el-date-picker
          v-model="date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @change="dateChange"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
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
        <el-table-column prop="category" label="开销分类">
          <template slot-scope="scope">
            {{ dict.label.expense_category[scope.row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="money" label="开销总金额" />
        <el-table-column prop="date" label="开销日期" />
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
import { expenseStatics } from "@/api/report/expendictureStat";
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
  dicts: ["expense_category", "report_type"],
  data() {
    return {
      loading: false,
      tableData: [],
      date: [beginDateStr, endDateStr],
      pickerOptions: this.$store.state.settings.defaultPickerOptions,
      form: {
        category: "",
        beginDate: beginDateStr,
        endDate: endDateStr,
        reportType: ""
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
  methods: {
    dateChange(val) {
      if (val && val.length) {
        this.form.beginDate = val[0];
        this.form.endDate = val[1];
      }
    },
    queryData() {
      this.loading = true;
      let param = deepClone(this.form);
      param.pageSize = this.page.pageSize;
      param.pageNumber = this.page.pageNumber;
      expenseStatics(param)
        .then(res => {
          this.tableData = res.content;
          this.page.total = res.totalElements;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    reset() {
      this.form.category = "";
      this.date = [beginDateStr, endDateStr];
      this.form.beginDate = beginDateStr;
      this.form.endDate = endDateStr;
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
    }
  }
};
</script>

<style scoped></style>
