<template>
  <div class="app-container out-order-detail-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 详情 -->
      <el-dialog
        title="单据明细"
        :visible.sync="dialogVisible"
        width="90%"
        :close-on-click-modal="false"
        custom-class="detail-dialog"
      >
        <h3>出库物料</h3>
        <el-table
          ref="table"
          :data="orderItems"
          size="small"
          style="width: 100%;"
        >
          <el-table-column prop="materialName" label="物料" />
          <el-table-column prop="quantity" label="出库数量（kg）" />
          <el-table-column prop="actualWeight" label="扣减后重量（kg）" />
          <el-table-column prop="unitPrice" label="单价（元）" />
          <el-table-column
            v-if="isPaperOrder"
            prop="discountPrice"
            label="折后单价（元）"
          />
          <el-table-column label="总金额（元）">
            <template slot-scope="scope">
              {{ (scope.row.unitPrice * scope.row.actualWeight).toFixed(3) }}
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <div v-if="isPaperOrder">
          <h3>质检单</h3>
          <el-table
            ref="table"
            :data="checkData"
            size="small"
            style="width: 100%;"
          >
            <el-table-column prop="materialName" label="物料" />
            <el-table-column prop="grossWeight" label="毛重" />
            <el-table-column prop="tareWeight" label="皮重" />
            <el-table-column prop="netWeight" label="净重" />
            <el-table-column prop="deductWeight" label="扣重" />
            <el-table-column prop="actualWeight" label="折合重量" />
            <el-table-column prop="waterPercent" label="水分比例" />
            <el-table-column prop="impurityPercent" label="杂物比例" />
            <el-table-column prop="incidentalPaperPercent" label="杂纸比例" />
            <el-table-column prop="totalDeductPercent" label="综合折率" />
            <el-table-column prop="weighingAttachment" label="称重单附件">
              <template slot-scope="scope">
                <el-popover
                  :content="getFilePath(scope.row.weighingAttachment)"
                  placement="top-start"
                  title="路径"
                  width="200"
                  trigger="hover"
                >
                  <a
                    slot="reference"
                    :href="getFilePath(scope.row.weighingAttachment)"
                    class="el-link--primary"
                    style="word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color: #1890ff;font-size: 13px;"
                    target="_blank"
                  >
                    {{ getFileName(scope.row.weighingAttachment) }}
                  </a>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="质检单附件">
              <template slot-scope="scope">
                <el-popover
                  :content="getFilePath(scope.row.attachment)"
                  placement="top-start"
                  title="路径"
                  width="200"
                  trigger="hover"
                >
                  <a
                    slot="reference"
                    :href="getFilePath(scope.row.attachment)"
                    class="el-link--primary"
                    style="word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color: #1890ff;font-size: 13px;"
                    target="_blank"
                  >
                    {{ getFileName(scope.row.attachment) }}
                  </a>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
          <h3>托运单</h3>
          <div>
            托运车数：{{ wayBill.consignmentVehicles }} 单车价格：{{
              wayBill.pricePerVehicle
            }}
            备注：{{ wayBill.remark }}
          </div>
        </div>
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
import { mapGetters } from "vuex";
export default {
  name: "StockInOrderItem",
  components: {},

  data() {
    return {
      mode: "", //paper:纸类出库单 ，other:非纸类出库单
      dialogVisible: false,
      rowData: {}, //行数
      wayBill: {}, //托运单
      orderItems: [],
      checkData: [], //质检单
      permission: {
        add: ["admin", "stockInOrderItem:add"],
        edit: ["admin", "stockInOrderItem:edit"],
        del: ["admin", "stockInOrderItem:del"]
      }
    };
  },
  computed: {
    ...mapGetters(["baseApi", "fileUploadApi"]),
    isPaperOrder() {
      return this.mode == "paper";
    }
  },
  methods: {
    resetData() {
      this.checkData = [];
      this.orderItems = [];
    },
    showDialog(data = {}) {
      this.dialogVisible = true;
      this.resetData();
      this.checkOrderType(data);
      this.rowData = data;
      this.orderItems = data.orderItems;
      this.orderItems.forEach(element => {
        element.materialName = element.material.name;
        element.discountPrice = element.unitPrice;
        //物料的重量
        let totalWeight = 0;
        //物料的折后重量（扣除水分，杂质后的重量）
        let actualWeight = 0;
        if (element.qualityCheckCerts && element.qualityCheckCerts.length) {
          element.qualityCheckCerts.forEach(item => {
            item.materialName = element.materialName;
            totalWeight += item.netWeight;
            actualWeight += item.actualWeight;
          });
          element.discountPrice =
            (actualWeight / totalWeight) * element.unitPrice;
          element.discountPrice = element.discountPrice.toFixed(3);
          element.actualWeight = actualWeight;
        }

        this.checkData = this.checkData.concat(element.qualityCheckCerts || []);
      });
      this.wayBill =
        data.waybills && data.waybills.length ? data.waybills[0] : {};
    },
    //检查出库单类型
    checkOrderType(data = {}) {
      let temp = data.orderItems;
      //如果有一个元素得物料类型是paper就是黄板纸类出库单
      let result = temp.find(element => {
        return element.material.name.indexOf("黄板") > -1;
      });
      if (result) {
        this.mode = "paper";
      } else {
        this.mode = "other";
      }
    },
    hideDialog() {
      this.dialogVisible = false;
      this.orderItems = [];
    },
    getFilePath(data = {}) {
      return this.baseApi + "/file/" + data.type + "/" + data.realName;
    },
    getFileName(data = {}) {
      return data.name;
    }
  }
};
</script>

<style lang="scss">
.out-order-detail-container {
  .detail-dialog {
    .el-dialog__body {
      max-height: 550px;
      overflow-y: scroll;
    }
  }
}
</style>
