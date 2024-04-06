<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">开销分类</label>
        <el-select
          v-model="query.category"
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
        <!-- <label class="el-form-item-label">开销金额大于等于</label>
        <el-input
          v-model="query.money"
          clearable
          placeholder="请输入"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        /> -->
        <label class="el-form-item-label">开销日期</label>
        <date-range-picker
          v-model="query.dates"
          valueFormat="yyyy-MM-dd"
          class="date-item"
        />

        <!-- <el-date-picker
          v-model="query.dates"
          type="daterange"
          range-separator="至"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker> -->
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
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
          <el-form-item label="开销分类" prop="category">
            <el-select
              v-model="form.category"
              style="width: 215px;"
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
          </el-form-item>
          <el-form-item label="开销金额" prop="money">
            <el-input
              v-model="form.money"
              placeholder="请输入"
              style="width: 215px;"
            />
          </el-form-item>
          <el-form-item label="开销日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期时间"
              style="width: 215px;"
              unlink-panels
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              maxlength="500"
              style="width: 370px;"
              placeholder="请输入"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            :loading="crud.status.cu === 2"
            type="primary"
            @click="crud.submitCU"
            >确认</el-button
          >
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        :maxHeight="$store.state.settings.maxTableHeight"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="category" label="开销分类">
          <template slot-scope="scope">
            {{ dict.label.expense_category[scope.row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="money" label="开销金额" />
        <el-table-column prop="date" label="开销日期" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column
          v-if="checkPer(['admin', 'dailyExpense:edit', 'dailyExpense:del'])"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudDailyExpense from "@/api/billManage/expenditure";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

import DateRangePicker from "@/components/DateRangePicker";
const defaultForm = {
  id: null,
  category: null,
  money: null,
  date: null,
  remark: null,
  deleted: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
};
export default {
  name: "DailyExpense",
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    DateRangePicker
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ["expense_category"],
  cruds() {
    return CRUD({
      title: "日常开销",
      url: "api/dailyExpense",
      idField: "id",
      sort: "id,desc",
      crudMethod: { ...crudDailyExpense }
    });
  },
  data() {
    let checkNumber = (rule, value, callback) => {
      if (value && String(value).trim()) {
        if (!/^[0-9]+(.[0-9]+)?$/.test(value)) {
          callback(new Error("仅限输入数字"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      permission: {
        add: ["admin", "dailyExpense:add"],
        edit: ["admin", "dailyExpense:edit"],
        del: ["admin", "dailyExpense:del"]
      },
      rules: {
        category: [
          { required: true, message: "开销分类不能为空", trigger: "blur" }
        ],
        money: [
          { required: true, message: "开销金额不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        date: [{ required: true, message: "开销日期不能为空", trigger: "blur" }]
      },
      queryTypeOptions: [
        { key: "category", display_name: "开销分类" },
        { key: "money", display_name: "开销金额" },
        { key: "date", display_name: "开销日期" }
      ]
    };
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true;
    }
  }
};
</script>

<style scoped></style>
