<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";

export default {
  mixins: [resize],
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
      default: "350px"
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
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
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    //系列数据
    generateChartData(data = {}) {
      let colors = [
        "#FF005A",
        "#3888fa",
        "#2ec7c9",
        "#b6a2de",
        "#ffb980",
        "#c9c0cb",
        "#95706d",
        "#c14089",
        "#9cc140"
      ];
      let result = {};
      result.series =
        (data.seriesData || []).map((item, index) => {
          let temp = {
            name: data.legendData[index],
            itemStyle: {
              normal: {
                color: colors[index],
                lineStyle: {
                  color: colors[index],
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            data: item,
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          };
          return temp;
        }) || [];
      result.legend = data.legendData || [];
      result.xData = data.xData || [];
      return result;
    },
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      let chartData = this.generateChartData(this.chartData);
      this.setOptions(chartData);
    },
    setOptions({ xData, legend, series } = {}) {
      this.chart.setOption({
        xAxis: {
          data: xData,
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false //不显示坐标轴上的文字
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: legend
        },
        series: series
      });
    }
  }
};
</script>
