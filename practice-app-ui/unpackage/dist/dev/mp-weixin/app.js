"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/home/index.js";
  "./pages/questions/index.js";
  "./pages/questions/detail.js";
  "./pages/records/index.js";
  "./pages/profile/index.js";
}
const _sfc_main = {
  onLaunch() {
    common_vendor.index.__f__("log", "at App.vue:4", "Practice App UI launched");
  },
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:7", "Practice App UI shown");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:10", "Practice App UI hidden");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
