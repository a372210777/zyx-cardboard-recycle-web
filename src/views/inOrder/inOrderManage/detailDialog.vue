<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 详情 -->
      <el-dialog
        title="物料明细"
        :visible.sync="dialogVisible"
        width="800px"
        :close-on-click-modal="false"
      >
        <el-table
          ref="table"
          :data="orderItems"
          size="small"
          style="width: 100%;"
        >
          <el-table-column prop="materialName" label="物料" />
          <el-table-column prop="quantity" label="数量（kg）" />
          <el-table-column prop="unitPrice" label="单价（元）" />
          <el-table-column label="总金额（元）">
            <template slot-scope="scope">
              {{ calcuteTotal(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
export default {
  name: "StockInOrderItem",
  components: {},
  data() {
    return {
      dialogVisible: false,
      orderItems: [],
      permission: {
        add: ["admin", "stockInOrderItem:add"],
        edit: ["admin", "stockInOrderItem:edit"],
        del: ["admin", "stockInOrderItem:del"]
      }
    };
  },
  methods: {
    showDialog(data = []) {
      this.dialogVisible = true;
      this.orderItems = data;
      this.orderItems.forEach(element => {
        element.materialName = element.material.name;
      });
    },
    hideDialog() {
      this.dialogVisible = false;
      this.orderItems = [];
    },
    calcuteTotal(row) {
      return (row.quantity * row.unitPrice).toFixed(3);
    }
  }
};
</script>

<style scoped></style>
