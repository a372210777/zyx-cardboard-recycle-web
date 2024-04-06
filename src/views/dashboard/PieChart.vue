<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

export default {
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "300px"
    },
    chartData: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.initChart();
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 100);
    window.addEventListener("resize", this.__resizeHandler);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHandler);
    this.chart.dispose();
    this.chart = null;
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        let chartData = this.generateChartData(val);
        this.$nextTick(() => {
          this.setOptions(chartData);
        });
      }
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      let chartData = this.generateChartData(this.chartData);
      this.setOptions(chartData);
    },
    generateChartData(data) {
      let obj = {};
      obj.legend = data.legendData || [];
      obj.data = [];
      (data.seriesData || []).forEach((arr, index) => {
        let temp = { value: 0, name: obj.legend[index] };
        arr.forEach(item => {
          temp.value += item;
        });
        obj.data.push(temp);
      });
      return obj;
    },
    setOptions(data) {
      this.chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          left: "center",
          bottom: "10",
          // data: ["Industries", "Technology", "Forex", "Gold", "Forecasts"]
          data: data.legend
        },
        calculable: true,
        series: [
          {
            name: this.title,
            type: "pie",
            roseType: "radius",
            radius: [15, 95],
            center: ["50%", "38%"],
            data: data.data,
            // data: [
            //   { value: 320, name: "Industries" },
            //   { value: 240, name: "Technology" },
            //   { value: 149, name: "Forex" },
            //   { value: 100, name: "Gold" },
            //   { value: 59, name: "Forecasts" }
            // ],
            animationEasing: "cubicInOut",
            animationDuration: 2600
          }
        ]
      });
    }
  }
};
</script>
