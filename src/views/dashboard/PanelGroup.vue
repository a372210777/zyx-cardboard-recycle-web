<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月入库
          </div>
          <count-to
            :start-val="0"
            :end-val="monthIn"
            :duration="2600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('messages')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月出库
          </div>
          <count-to
            :start-val="0"
            :end-val="monthOut"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月收入
          </div>
          <count-to
            :start-val="0"
            :end-val="monthIncome"
            :duration="3200"
            :decimals="2"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="shopping" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月开销
          </div>
          <count-to
            :start-val="0"
            :end-val="monthExpendicture"
            :duration="3600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from "vue-count-to";

import { expenseStatics } from "@/api/report/expendictureStat";

import { stockOutMoney, stockIn, stockOut } from "@/api/dashboard/index";
const monthToDay = {
  "01": "31",
  "02": "28",
  "03": "31",
  "04": "30",
  "05": "31",
  "06": "30",
  "07": "31",
  "08": "31",
  "09": "30",
  "10": "31",
  "11": "30",
  "12": "31"
};
let year = new Date().getFullYear();
let month = new Date().getMonth() + 1;
if (String(month).length < 2) {
  month = "0" + month;
}
let beginDate = `${year}-${month}-01`;
let endDate = `${year}-${month}-${monthToDay[month]}`;

export default {
  components: {
    CountTo
  },
  data() {
    return {
      monthExpendicture: 0, //本月开销
      monthIncome: 0, //本月收入
      monthIn: 0, //当月入库
      monthOut: 0 //当月出库
    };
  },
  mounted() {
    this.requestExpense();
    this.reqeustStockOutMoney();
    this.reqeustStockIn();
    this.reqeustStockOut();
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit("handleSetLineChartData", type);
    },
    //请求当月入库
    reqeustStockIn() {
      let params = {
        beginDate: beginDate,
        endDate: endDate
      };
      stockIn(params)
        .then(res => {
          let temp = 0;
          (res.seriesData || []).forEach(arr => {
            arr.forEach(ele => {
              temp += ele;
            });
          });
          console.log(res, temp);
          this.monthIn = temp;
        })
        .catch(() => {});
    },
    //当月出库数据
    reqeustStockOut() {
      let params = {
        beginDate: beginDate,
        endDate: endDate
      };
      stockOut(params)
        .then(res => {
          let temp = 0;
          (res.seriesData || []).forEach(arr => {
            arr.forEach(ele => {
              temp += ele;
            });
          });
          this.monthOut = temp;
        })
        .catch(() => {});
    },
    //请求当月收入
    reqeustStockOutMoney() {
      let params = {
        beginDate: beginDate,
        endDate: endDate
      };
      stockOutMoney(params)
        .then(res => {
          let temp = 0;
          (res.seriesData || []).forEach(arr => {
            arr.forEach(ele => {
              temp += ele;
              console.log('shouru===',ele)
            });
          });
          this.monthIncome = temp;
          console.log('当月收入===',temp)
        })
        .catch(() => {});
    },

    //请求当月开销
    requestExpense() {
      let params = {
        beginDate: beginDate,
        endDate: endDate,
        reportType: "summary"
      };
      expenseStatics(params)
        .then(res => {
          let temp = 0;
          (res.content || []).forEach(item => {
            temp += item.money;
          });
          this.monthExpendicture = temp;
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
