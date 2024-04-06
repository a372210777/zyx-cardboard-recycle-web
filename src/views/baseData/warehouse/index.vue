<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">仓库名称</label>
        <el-input
          v-model="query.name"
          clearable
          placeholder="仓库名称"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
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
          <el-form-item label="仓库名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="仓库地址" prop="address">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="仓库面积（平方米）" prop="area">
            <el-input v-model="form.area" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="form.contact" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="仓库状态" prop="status">
            <el-select v-model="form.status" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.warehouse_status"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="仓库编码" />
        <el-table-column prop="name" label="仓库名称" />
        <el-table-column prop="address" label="仓库地址" />
        <el-table-column prop="area" label="仓库面积（平方米）" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="status" label="仓库状态">
          <template slot-scope="scope">
            {{ dict.label.warehouse_status[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column
          v-if="
            checkPer(['admin', 'basicWarehouse:edit', 'basicWarehouse:del'])
          "
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation
              disabledDle
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudBasicWarehouse from "@/api/baseData/warehouse";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

const defaultForm = {
  id: null,
  name: null,
  address: null,
  area: null,
  contact: null,
  phone: null,
  status: null,
  deleted: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
};
export default {
  name: "BasicWarehouse",
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ["warehouse_status"],
  cruds() {
    let optShow = {
      add: true,
      edit: true,
      del: false,
      download: true,
      reset: true
    };
    return CRUD({
      optShow,
      title: "基础数据：仓库",
      url: "api/basicWarehouse",
      idField: "id",
      sort: "id,desc",
      crudMethod: { ...crudBasicWarehouse }
    });
  },
  data() {
    return {
      permission: {
        add: ["admin", "basicWarehouse:add"],
        edit: ["admin", "basicWarehouse:edit"],
        del: ["admin", "basicWarehouse:del"]
      },
      rules: {
        name: [
          { required: true, message: "仓库名称不能为空", trigger: "blur" }
        ],
        address: [
          { required: true, message: "仓库地址不能为空", trigger: "blur" }
        ],
        area: [
          {
            required: true,
            message: "仓库面积（平方米）不能为空",
            trigger: "blur"
          }
        ],
        contact: [
          { required: true, message: "联系人不能为空", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "联系电话不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "仓库状态不能为空", trigger: "blur" }
        ]
      },
      queryTypeOptions: [{ key: "name", display_name: "仓库名称" }]
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
