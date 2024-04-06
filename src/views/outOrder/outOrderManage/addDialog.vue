<template>
  <div class="out-order-container">
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="addDialogVisible"
      width="90%"
      title="新增出库单"
      custom-class="out-order-dialog"
    >
      <h3 class="panel-title">出库物料</h3>
      <el-form
        ref="addForm"
        :model="formInline"
        :rules="rules"
        size="small"
        :inline="true"
        label-width="80px"
      >
        <el-form-item label="仓库" prop="warehouse">
          <el-select
            v-model="formInline.warehouse"
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
        </el-form-item>
        <el-form-item label="采购商" prop="warehouse">
          <el-select
            v-model="formInline.buyer"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in buyerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="承运商" prop="carrier">
          <el-select
            v-model="formInline.carrier"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in carrierList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库时间" prop="stockOutTime">
          <el-date-picker
            v-model="formInline.stockOutTime"
            type="date"
            clearable
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="物料" prop="material">
          <el-select
            v-if="isPaper"
            v-model="formInline.material"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in paperMaterialList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-select
            v-else
            v-model="formInline.material"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in notPaperMaterialList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input
            v-model="formInline.quantity"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select
            v-model="formInline.unit"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in dict.unit_of_weight"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input
            v-model="formInline.unitPrice"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            maxlength="500"
            v-model="formInline.remark"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="" prop="">
          <el-button size="mini" type="primary" @click="addToList"
            >添加</el-button
          >
          <el-button size="mini" type="warning" @click="reset('addForm')"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <div>
        <el-table ref="table" :data="addData" size="small" style="width: 100%;">
          <el-table-column prop="materialName" label="物料名称" />
          <el-table-column prop="quantity" label="数量（kg）" />
          <el-table-column prop="unitPrice" label="单价（元）" />
          <el-table-column v-if="!isPaper" label="总金额（元）">
            <template slot-scope="scope">
              {{ (scope.row.unitPrice * scope.row.quantity).toFixed(3) }}
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" />
          <el-table-column prop="warehouseName" label="仓库" />
          <el-table-column prop="stockOutTime" label="出库时间" />
          <el-table-column prop="buyerName" label="采购商" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column
            label="操作"
            width="100px"
            fixed="right"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="delAddData(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="isPaper">
        <h3 class="panel-title">质检单</h3>
        <div>
          <el-form
            ref="checkForm"
            :model="checkForm"
            :rules="checkFormRules"
            size="small"
            :inline="true"
            label-width="80px"
          >
            <el-form-item label="物料" prop="material">
              <el-select
                v-if="isPaper"
                v-model="checkForm.material"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in paperMaterialList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
              <el-select
                v-else
                v-model="checkForm.material"
                clearable
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in notPaperMaterialList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="毛重" prop="grossWeight">
              <el-input
                placeholder="请输入"
                v-model="checkForm.grossWeight"
                clearable
              />
            </el-form-item>
            <el-form-item label="皮重" prop="tareWeight">
              <el-input
                placeholder="请输入"
                v-model="checkForm.tareWeight"
                clearable
              />
            </el-form-item>
            <el-form-item label="净重" prop="netWeight">
              <el-input
                placeholder="请输入"
                v-model="checkForm.netWeight"
                clearable
              />
            </el-form-item>
            <el-form-item label="扣重" prop="deductWeight">
              <el-input
                placeholder="请输入"
                v-model="checkForm.deductWeight"
                clearable
              />
            </el-form-item>
            <el-form-item label="水分比例" prop="waterPercent">
              <el-input
                placeholder="请输入"
                v-model="checkForm.waterPercent"
                clearable
              />
            </el-form-item>
            <el-form-item label="杂物比例" prop="impurityPercent">
              <el-input
                placeholder="请输入"
                v-model="checkForm.impurityPercent"
                clearable
              />
            </el-form-item>
            <el-form-item label="杂纸比例" prop="incidentalPaperPercent">
              <el-input
                placeholder="请输入"
                v-model="checkForm.incidentalPaperPercent"
                clearable
              />
            </el-form-item>
            <el-form-item label="综合折率" prop="totalDeductPercent">
              <el-input
                placeholder="请输入"
                v-model="checkForm.totalDeductPercent"
                clearable
              />
            </el-form-item>
            <el-form-item label="折合重量" prop="actualWeight">
              <el-input
                placeholder="请输入"
                v-model="checkForm.actualWeight"
                clearable
              />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                placeholder="请输入"
                v-model="checkForm.remark"
                clearable
                type="textarea"
                maxlength="500"
              />
            </el-form-item>
            <el-row type="flex" justify="center">
              <el-button size="mini" type="primary" @click="addToCheckList"
                >添加</el-button
              >
              <el-button size="mini" type="warning" @click="reset('checkForm')"
                >重置</el-button
              >
              <el-button
                v-permission="['admin', 'storage:add']"
                class="filter-item"
                size="mini"
                type="primary"
                icon="el-icon-upload"
                @click="uploadCheckAttach"
                >上传质检单
              </el-button>
              <fileIcon
                v-if="!isEmptyObj(checkAttachRes)"
                :file="checkAttachRes"
                @removeFile="removeCheckAttach"
              ></fileIcon>
              <el-button
                v-permission="['admin', 'storage:add']"
                class="filter-item"
                size="mini"
                type="primary"
                icon="el-icon-upload"
                @click="uploadWeightAttach"
                >上传称重单
              </el-button>
              <fileIcon
                v-if="!isEmptyObj(weightAttachRes)"
                :file="weightAttachRes"
                @removeFile="removeWeightAttach"
              ></fileIcon>
            </el-row>
          </el-form>
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
            <el-table-column prop="waterPercent" label="水分比例" />
            <el-table-column prop="impurityPercent" label="杂物比例" />
            <el-table-column prop="incidentalPaperPercent" label="杂纸比例" />
            <el-table-column prop="totalDeductPercent" label="综合折率" />
            <el-table-column prop="actualWeight" label="折合重量" />
            <el-table-column label="称重单附件">
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
            <el-table-column
              label="操作"
              width="100px"
              fixed="right"
              align="center"
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="delCheckData(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <h3 class="panel-title">托运单</h3>
          <el-form
            ref="transForm"
            :model="transForm"
            :rules="transFormRules"
            size="small"
            :inline="true"
            label-width="80px"
          >
            <el-form-item label="托运车数" prop="consignmentVehicles">
              <el-input
                placeholder="请输入"
                v-model.number="transForm.consignmentVehicles"
                clearable
              />
            </el-form-item>
            <el-form-item label="单车价格" prop="pricePerVehicle">
              <el-input
                placeholder="请输入"
                v-model="transForm.pricePerVehicle"
                clearable
              />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                placeholder="请输入"
                v-model="transForm.remark"
                clearable
                type="textarea"
                maxlength="500"
              />
            </el-form-item>

            <el-form-item label="" prop="">
              <el-button size="mini" type="warning" @click="reset('transForm')"
                >重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="addDialogVisible = false"
          >取消</el-button
        >
        <el-button :loading="loading" type="primary" @click="save"
          >确认</el-button
        >
      </div>
    </el-dialog>
    <uploadFile
      @success="uploadCheckSuccess"
      ref="uploadCheckFile"
    ></uploadFile>
    <uploadFile
      @success="uploadWeightSuccess"
      ref="uploadWeightFile"
    ></uploadFile>
  </div>
</template>
<script>
import crudStockOutOrder from "@/api/outOrder/outOrderManage";
import {
  queryMaterial,
  queryWarehouse,
  queryCarrier,
  queryBuyer
} from "@/api/common";
import uploadFile from "@/components/uploadFile";
import {
  generateRandom,
  deepClone,
  isEmptyObj,
  dateFormat,
  fixedDigit
} from "@/utils/index";
import fileIcon from "@/components/uploadFile/fileIcon";
import { mapGetters } from "vuex";
export default {
  name: "addDialog",
  components: {
    uploadFile,
    fileIcon
  },
  dicts: ["unit_of_weight"],
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
    let checkQuantity = (rule, value, callback) => {
      if (Number(value) <= 0) {
        callback(new Error("数量不能小于等于0"));
      } else {
        callback();
      }
    };
    let checkOutTime = (rule, value, callback) => {
      if (new Date(value).getTime() > new Date().getTime()) {
        callback(new Error("出库时间不能大于今天"));
      } else {
        callback();
      }
    };
    return {
      mode: "", //paper(纸类出库单),other(非纸类出库单)
      addDialogVisible: false,
      detailDialog: false,
      addData: [], //新增table物料数据
      warehouseList: [], //仓库列表
      materialList: [], //物料数据
      buyerList: [], //采购商列表
      carrierList: [], //承运商列表
      loading: false,
      checkLoading: false,
      isEmptyObj: isEmptyObj,
      checkData: [], //质检单table数据
      formInline: {
        buyer: "", //采购商id
        warehouse: "", //仓库ID
        carrier: "", //承运商id
        stockOutTime: dateFormat(new Date(), "yyyy-MM-dd"), //出库时间
        material: "", //物料id
        materialName: "",
        quantity: 0,
        price: "",
        remark: "",
        warehouseName: "",
        unit: ""
      },
      //质检单
      checkForm: {
        material: "", //物料id
        grossWeight: "", //毛重 （纸+车）
        tareWeight: "", //皮重（车重）
        netWeight: "", //净重（纸重）
        deductWeight: "0", //扣重
        impurityPercent: "0", //杂物比列
        totalDeductPercent: "0", //综合折率
        waterPercent: "0", //水分比列
        incidentalPaperPercent: "0", //杂纸比例
        actualWeight: "0", //折合重量（扣除杂质后的可算钱的纸重）
        weighingAttachment: {}, //称重单附件
        attachment: {}, //质检单附件
        remark: "" //备注
      },
      weightAttachRes: "", //称重单附件
      checkAttachRes: "", //质检单附件
      //托运单
      transForm: {
        consignmentVehicles: "", //托运车数
        pricePerVehicle: "800", //单车价格
        remark: ""
      },
      transFormRules: {
        consignmentVehicles: [
          { required: true, message: "托运车数不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        pricePerVehicle: [
          { required: true, message: "单车价格不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ]
      },
      checkFormRules: {
        material: [
          { required: true, message: "物料不能为空", trigger: "blur" }
        ],
        grossWeight: [
          { required: true, message: "毛重不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        tareWeight: [
          { required: true, message: "皮重不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        netWeight: [
          { required: true, message: "净重不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        deductWeight: [
          { required: true, message: "扣重不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        actualWeight: [
          { required: true, message: "折合重量不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        waterPercent: [
          { required: true, message: "水分比例不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        impurityPercent: [
          { required: true, message: "杂物比例不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        incidentalPaperPercent: [
          { required: true, message: "杂纸比例不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        totalDeductPercent: [
          { required: true, message: "综合折率不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ]
      },
      rules: {
        stockOutTime: [
          { required: true, message: "出库时间不能为空", trigger: "change" },
          { required: true, validator: checkOutTime, trigger: "change" }
        ],

        buyer: [{ required: true, message: "采购商不能为空", trigger: "blur" }],
        warehouse: [
          { required: true, message: "仓库不能为空", trigger: "blur" }
        ],
        carrier: [
          { required: true, message: "承运商不能为空", trigger: "blur" }
        ],
        material: [
          { required: true, message: "物料不能为空", trigger: "blur" }
        ],
        quantity: [
          { required: true, message: "数量不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" },
          { required: true, validator: checkQuantity, trigger: "blur" }
        ],
        unitPrice: [
          { required: true, message: "单价不能为空", trigger: "blur" },
          { required: true, validator: checkNumber, trigger: "blur" }
        ],
        unit: [{ required: true, message: "单位不能为空", trigger: "blur" }]
      }
    };
  },
  watch: {
    "dict.unit_of_weight": {
      handler(val) {
        if (val && val.length) {
          this.formInline.unit = val[0].value;
        }
      },
      immediate: true
    },
    "checkForm.grossWeight": {
      handler(val) {
        if (val && /^[0-9]+(.[0-9]+)?$/.test(val)) {
          if (
            this.checkForm.tareWeight &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.tareWeight)
          ) {
            this.checkForm.netWeight = fixedDigit(
              this.checkForm.grossWeight - this.checkForm.tareWeight
            );
          }
        }
      }
    },
    "checkForm.tareWeight": {
      handler(val) {
        if (val && /^[0-9]+(.[0-9]+)?$/.test(val)) {
          if (
            this.checkForm.tareWeight &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.tareWeight)
          ) {
            this.checkForm.netWeight = fixedDigit(
              this.checkForm.grossWeight - this.checkForm.tareWeight
            );
          }
        }
      }
    },
    "checkForm.totalDeductPercent": {
      handler(val) {
        if (val && /^[0-9]+(.[0-9]+)?$/.test(val)) {
          if (
            this.checkForm.netWeight &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.netWeight)
          ) {
            this.checkForm.deductWeight = fixedDigit(
              (this.checkForm.netWeight * val) / 100
            );
          }
        }
      }
    },
    "checkForm.netWeight": {
      handler(val) {
        if (val && /^[0-9]+(.[0-9]+)?$/.test(val)) {
          if (
            this.checkForm.totalDeductPercent &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.totalDeductPercent)
          ) {
            this.checkForm.deductWeight = fixedDigit(
              (this.checkForm.netWeight * this.checkForm.totalDeductPercent) /
                100
            );
          }
          if (
            this.checkForm.deductWeight &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.deductWeight)
          ) {
            this.checkForm.actualWeight = fixedDigit(
              val - this.checkForm.deductWeight
            );
          }
        }
      }
    },
    "checkForm.deductWeight": {
      handler(val) {
        if (val && /^[0-9]+(.[0-9]+)?$/.test(val)) {
          if (
            this.checkForm.netWeight &&
            /^[0-9]+(.[0-9]+)?$/.test(this.checkForm.netWeight)
          ) {
            this.checkForm.actualWeight = this.checkForm.netWeight - val;
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(["baseApi", "fileUploadApi"]),
    isPaper() {
      return this.mode == "paper";
    },
    //黄版类物料
    paperMaterialList() {
      return (
        this.materialList.filter(item => {
          return item.category.indexOf("paper") > -1;
        }) || []
      );
    },
    //非黄版张类物料
    notPaperMaterialList() {
      return (
        this.materialList.filter(item => {
          return item.category.indexOf("paper") == -1;
        }) || []
      );
    }
  },
  mounted() {
    let params = {
      page: 0,
      size: 100
    };
    queryBuyer(params).then(res => {
      this.buyerList = res.content;
      if (this.buyerList.length) {
        this.formInline.buyer = this.buyerList[0].id;
      }
    });
    queryMaterial(params).then(res => {
      this.materialList = res.content;
    });
    queryWarehouse(params).then(res => {
      this.warehouseList = res.content;
      if (this.warehouseList.length) {
        this.formInline.warehouse = this.warehouseList[0].id;
      }
    });
    queryCarrier(params).then(res => {
      this.carrierList = res.content;
      if (this.carrierList.length) {
        this.formInline.carrier = this.carrierList[0].id;
      }
    });
  },
  methods: {
    //添加质检单
    addToCheckList() {
      this.$refs["checkForm"].validate(valid => {
        if (valid) {
          let materialItem = this.materialList.find(
            item => item.id == this.checkForm.material
          );
          //质检单得物料得包含再addData已添加得物料中
          let isMaterialInAddList = false;
          this.addData.forEach(item => {
            if (item.material == this.checkForm.material) {
              isMaterialInAddList = true;
            }
          });
          if (!isMaterialInAddList) {
            this.$message.warning("质检单得物料必须包含再入库物料中");
            return;
          }
          this.checkForm.materialName = materialItem.name;
          this.checkForm.randomId = generateRandom();
          let copy = deepClone(this.checkForm);
          if (this.checkAttachRes) {
            copy.attachment = deepClone(this.checkAttachRes);
          } else {
            delete copy.attachment;
          }
          if (this.weightAttachRes) {
            copy.weighingAttachment = deepClone(this.weightAttachRes);
          } else {
            delete copy.weighingAttachment;
          }
          this.checkData.push(copy);
          this.weightAttachRes = "";
          this.checkAttachRes = "";
          this.checkForm.weighingAttachment = {};
          this.checkForm.attachment = {};
        }
      });
    },
    //删除质检数据
    delCheckData(data) {
      this.checkData = this.checkData.filter(item => {
        return item.randomId != data.randomId;
      });
    },
    //上传称重单
    uploadWeightAttach() {
      this.$refs.uploadWeightFile.show();
    },
    //上传质检单
    uploadCheckAttach() {
      this.$refs.uploadCheckFile.show();
    },
    //上传质检单成功
    uploadCheckSuccess(res) {
      this.checkAttachRes = res;
    },
    //上传称重单单成功
    uploadWeightSuccess(res) {
      this.weightAttachRes = res;
    },
    getFilePath(data = {}) {
      return this.baseApi + "/file/" + data.type + "/" + data.realName;
    },
    getFileName(data = {}) {
      return data.name;
    },
    showDialog(mode) {
      this.addDialogVisible = true;
      this.mode = mode;
      this.reset("addForm");
      this.reset("checkForm");
    },
    hideDialog() {
      this.addDialogVisible = false;
    },
    //物料添加
    addToList(data) {
      this.$refs["addForm"].validate(valid => {
        if (valid) {
          let warehouseItem = this.warehouseList.find(
            item => item.id == this.formInline.warehouse
          );
          let materialItem = this.materialList.find(
            item => item.id == this.formInline.material
          );
          let buyerItem = this.buyerList.find(
            item => item.id == this.formInline.buyer
          );
          let carrierItem = this.carrierList.find(
            item => item.id == this.formInline.carrier
          );

          //禁止重复添加相同得物料
          let isAddSameMaterial = false;
          this.addData.forEach(item => {
            if (this.formInline.material == item.material) {
              isAddSameMaterial = true;
            }
          });
          if (isAddSameMaterial) {
            this.$message.warning("已添加过该物料，如需添加请先删除");
            return;
          }
          let stockOutTimeArr = this.addData.map(item => {
            return item.stockOutTime;
          });
          stockOutTimeArr.push(this.formInline.stockOutTime);
          if (new Set(stockOutTimeArr).size > 1) {
            this.$message.warning("物料的出库时间必须一致");
            return;
          }
          this.formInline.materialName = materialItem.name;
          this.formInline.warehouseName = warehouseItem.name;
          this.formInline.buyerName = buyerItem.name;
          this.formInline.carrierName = carrierItem.name;
          this.formInline.randomId = generateRandom();
          this.addData.push(Object.assign({}, this.formInline));
        }
      });
    },
    delAddData(data) {
      this.addData = this.addData.filter(item => {
        return item.randomId != data.randomId;
      });
      //物料删除后，删除对应质检单
      this.checkData = this.checkData.filter(item => {
        return item.material != data.material; //id
      });
    },
    reset(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    //移除质检单附件
    removeCheckAttach() {
      this.checkAttachRes = "";
    },
    //移除称重单附件
    removeWeightAttach() {
      this.weightAttachRes = "";
    },
    // 非纸类保存
    saveMetal() {
      if (!this.addData.length) {
        this.$message.warning("请先添加出库物料数据");
        return;
      }
      this.$confirm("确定要保存数据吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading = true;
        let firstEle = this.addData[0];
        let submitData = {
          stockOutTime: firstEle.stockOutTime,
          orderItems: [],
          buyer: {
            id: firstEle.buyer
          },
          carrier: {
            id: firstEle.carrier
          },
          warehouse: {
            id: firstEle.warehouse
          }
        };
        submitData.orderItems = deepClone(this.addData) || []; //入库单下的物料
        submitData.orderItems.forEach(item => {
          item.material = {
            id: item.material
          };
        });
        crudStockOutOrder
          .add(submitData)
          .then(res => {
            this.loading = false;
            this.addDialogVisible = false;
            this.addData = [];
            this.checkData = [];
            this.reset("addForm");
            this.$parent.crud.refresh();
          })
          .catch(() => {
            this.loading = false;
            this.addDialogVisible = false;
          });
      });
    },
    //纸类保存
    savePaper() {
      if (!this.addData.length) {
        this.$message.warning("请先添加出库物料数据");
        return;
      }
      if (!this.checkData.length) {
        this.$message.warning("请先添加质检数据");
        return;
      }
      let isTransFormValid = false;
      this.$refs["transForm"].validate(valid => {
        isTransFormValid = valid;
      });
      if (!isTransFormValid) {
        this.$message.warning("托运单校验异常，请检查");
        return;
      }
      this.$confirm("确定要保存数据吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading = true;
        let firstEle = this.addData[0];
        let submitData = {
          stockOutTime: firstEle.stockOutTime,
          orderItems: [],
          buyer: {
            id: firstEle.buyer
          },
          carrier: {
            id: firstEle.carrier
          },
          warehouse: {
            id: firstEle.warehouse
          },
          waybills: []
        };
        submitData.waybills.push(deepClone(this.transForm));
        submitData.orderItems = deepClone(this.addData) || []; //入库单下的物料
        submitData.orderItems.forEach(item => {
          //过滤出属于该物料的质检单
          let tempArr =
            this.checkData.filter(ele => {
              return ele.material == item.material;
            }) || [];
          item.material = {
            id: item.material
          };
          item.qualityCheckCerts = deepClone(tempArr) || [];
        });
        crudStockOutOrder
          .add(submitData)
          .then(res => {
            this.loading = false;
            this.addData = [];
            this.checkData = [];
            this.reset("addForm");
            this.reset("checkForm");
            this.$parent.crud.refresh();
            this.addDialogVisible = false;
          })
          .catch(() => {
            this.loading = false;
            this.addDialogVisible = false;
          });
      });
    },
    save() {
      if (this.isPaper) {
        this.savePaper();
      } else {
        this.saveMetal();
      }
    }
  }
};
</script>
<style lang="scss">
.out-order-container {
  .out-order-dialog {
    .el-dialog__body {
      max-height: 550px;
      overflow-y: scroll;
    }
  }
}
</style>
