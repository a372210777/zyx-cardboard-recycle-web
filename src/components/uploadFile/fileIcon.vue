<template>
  <div class="fileIcon-container">
    <span>
      <a
        slot="reference"
        :href="getFilePath()"
        class="el-link--primary"
        style="word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color: #1890ff;font-size: 13px;"
        target="_blank"
      >
        {{ getFileName() }}
      </a>
      <i
        class="el-icon-error"
        style="cursor:pointer;color:#1890ff;position:relative;top:1px"
        @click="remove"
      />
    </span>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "fileIcon",
  props: {
    file: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    ...mapGetters(["baseApi", "fileUploadApi"])
  },
  methods: {
    getFilePath() {
      return (
        this.baseApi + "/file/" + this.file.type + "/" + this.file.realName
      );
    },
    getFileName() {
      return this.file.name;
    },
    remove() {
      console.log("trigger remove");
      this.$emit("removeFile", this.file);
      console.log("trigger remove2");
    }
  }
};
</script>
<style scoped>
.fileIcon-container {
  display: flex;
  margin: 0 10px;
  align-items: center;
}
</style>
