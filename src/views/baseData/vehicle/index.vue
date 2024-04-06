<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">车牌号</label>
        <el-input
          v-model="query.licensePlate"
          clearable
          placeholder="车牌号"
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
          <el-form-item label="车牌号" prop="licensePlate">
            <el-input v-model="form.licensePlate" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车辆类型" prop="type">
            <el-select v-model="form.type" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.vehicle_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="司机姓名" prop="driverName">
            <el-input v-model="form.driverName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="司机电话" prop="driverPhone">
            <el-input v-model="form.driverPhone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="载重（吨）">
            <el-input v-model="form.load" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="体积">
            <el-input v-model="form.volume" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车辆状态" prop="status">
            <el-select v-model="form.status" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.vehicle_status"
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
        <el-table-column prop="id" label="自增主键ID" />
        <el-table-column prop="licensePlate" label="车牌号" />
        <el-table-column prop="type" label="车辆类型">
          <template slot-scope="scope">
            {{ dict.label.vehicle_type[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="driverName" label="司机姓名" />
        <el-table-column prop="driverPhone" label="司机电话" />
        <el-table-column prop="load" label="载重（吨）" />
        <el-table-column prop="volume" label="体积" />
        <el-table-column prop="status" label="车辆状态">
          <template slot-scope="scope">
            {{ dict.label.vehicle_status[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column
          v-if="checkPer(['admin', 'basicVehicle:edit', 'basicVehicle:del'])"
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
import crudBasicVehicle from "@/api/baseData/vehicle";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

const defaultForm = {
  id: null,
  licensePlate: null,
  type: null,
  driverName: null,
  driverPhone: null,
  load: null,
  volume: null,
  status: null,
  deleted: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
};
export default {
  name: "BasicVehicle",
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ["vehicle_type", "vehicle_status"],
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
      title: "基础数据：车辆",
      url: "api/basicVehicle",
      idField: "id",
      sort: "id,desc",
      crudMethod: { ...crudBasicVehicle }
    });
  },
  data() {
    return {
      permission: {
        add: ["admin", "basicVehicle:add"],
        edit: ["admin", "basicVehicle:edit"],
        del: ["admin", "basicVehicle:del"]
      },
      rules: {
        licensePlate: [
          { required: true, message: "车牌号不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "车辆类型不能为空", trigger: "blur" }
        ],
        driverName: [
          { required: true, message: "司机姓名不能为空", trigger: "blur" }
        ],
        driverPhone: [
          { required: true, message: "司机电话不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "车辆状态不能为空", trigger: "blur" }
        ]
      },
      queryTypeOptions: [{ key: "licensePlate", display_name: "车牌号" }]
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
