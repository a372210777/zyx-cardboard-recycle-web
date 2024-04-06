<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">物料类别</label>
        <el-input
          v-model="query.category"
          clearable
          placeholder="物料类别"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">物料名称</label>
        <el-input
          v-model="query.name"
          clearable
          placeholder="物料名称"
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
          <el-form-item label="物料类别" prop="category">
            <el-select v-model="form.category" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.material_category"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="物料名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
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
        <el-table-column prop="name" label="物料名称" />
        <el-table-column prop="id" label="物料编码">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="物料类别">
          <template slot-scope="scope">
            {{ dict.label.material_category[scope.row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="更新时间" />
        <el-table-column
          v-if="checkPer(['admin', 'basicMaterial:edit', 'basicMaterial:del'])"
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
import crudBasicMaterial from "@/api/baseData/material";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

const defaultForm = {
  id: null,
  category: null,
  deleted: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null,
  name: null
};
export default {
  name: "BasicMaterial",
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ["material_category"],
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
      title: "基础数据：物料",
      url: "api/basicMaterial",
      idField: "id",
      sort: "id,desc",
      crudMethod: { ...crudBasicMaterial }
    });
  },
  data() {
    return {
      permission: {
        add: ["admin", "basicMaterial:add"],
        edit: ["admin", "basicMaterial:edit"],
        del: ["admin", "basicMaterial:del"]
      },
      rules: {
        id: [{ required: true, message: "物料编码不能为空", trigger: "blur" }],
        category: [
          { required: true, message: "物料类别不能为空", trigger: "blur" }
        ],
        name: [{ required: true, message: "物料名称不能为空", trigger: "blur" }]
      },
      queryTypeOptions: [{ key: "category", display_name: "物料类别" }]
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
