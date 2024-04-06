<template>
  <div>
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="'上传文件'"
      width="500px"
    >
      <el-form ref="form" :model="form" size="small" label-width="80px">
        <el-form-item label="文件名">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <!--   上传文件   -->
        <el-form-item label="上传">
          <el-upload
            ref="upload"
            :limit="1"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :action="imagesUploadApi + '?name=' + form.name"
          >
            <div class="eladmin-upload">
              <i class="el-icon-upload" /> 添加文件
            </div>
            <div slot="tip" class="el-upload__tip">
              可上传任意格式文件，且不超过100M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="upload"
          >确认</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from "@/utils/auth";

import { mapGetters } from "vuex";
export default {
  name: "uploadFile",
  props: {},
  data() {
    return {
      loading: false,
      dialogVisible: false,

      headers: { Authorization: getToken() },
      form: { name: "" }
      //   fileUploadApi: ""
    };
  },
  computed: {
    ...mapGetters(["baseApi", "imagesUploadApi"])
  },
  methods: {
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
    },

    cancel() {
      this.hide();
    },
    // 上传文件
    upload() {
      this.$refs.upload.submit();
    },
    beforeUpload(file) {
      let isLt2M = true;
      isLt2M = file.size / 1024 / 1024 < 100;
      if (!isLt2M) {
        this.loading = false;
        this.$message.error("上传文件大小不能超过 100MB!");
      }
      this.form.name = file.name;
      return isLt2M;
    },
    handleSuccess(response, file, fileList) {
      this.$notify({
        title: "上传成功",
        type: "success",
        duration: 2500
      });
      this.$emit("success", response);
      this.$refs.upload.clearFiles();
      this.hide();
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message);
      this.$notify({
        title: msg.message,
        type: "error",
        duration: 2500
      });
      this.loading = false;
    }
  }
};
</script>
