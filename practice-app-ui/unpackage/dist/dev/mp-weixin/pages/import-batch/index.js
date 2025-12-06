"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  (_easycom_uni_icons2 + _easycom_uni_tag2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_tag)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const step = common_vendor.ref("input");
    const inputText = common_vendor.ref(`1.驾驶人有下列哪种违法行为一次记6分
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:D
解析:请仔细阅读交规 (若无解析本行可不填)
2.驾驶人有下列哪种违法行为一次记6分?
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:ABCD
解析:请仔细阅读交规 (若无解析本行可不填)
3.国际象棋起源于英国吗?
答案:对
解析:无 (若无解析本行可不填)
4.我国古典四大名著是 () () () ()
答案:红楼梦|水浒传|三国演义|西游记
解析:无 (若无解析本行可不填)
5.如何保持身体健康?
答案:规律饮食、坚持锻炼，早睡早起，定期体检。
解析:无 (若无解析本行可不填)`);
    const selectedChapterName = common_vendor.ref("");
    common_vendor.ref("");
    const difficultyOptions = [
      { label: "容易", value: "EASY" },
      { label: "中等", value: "MEDIUM" },
      { label: "困难", value: "HARD" }
    ];
    const selectedDifficulty = common_vendor.ref("EASY");
    const selectedDifficultyLabel = common_vendor.computed(() => {
      const opt = difficultyOptions.find((o) => o.value === selectedDifficulty.value);
      return opt ? opt.label : "容易";
    });
    const parsedList = common_vendor.ref([]);
    const currentFilter = common_vendor.ref("all");
    const filterTabs = [
      { key: "all", label: "全部" },
      { key: "SINGLE", label: "单选题" },
      { key: "MULTIPLE", label: "多选题" },
      { key: "TRUE_FALSE", label: "判断题" },
      { key: "FILL", label: "填空题" },
      { key: "SHORT_ANSWER", label: "简答题" }
    ];
    const smartParse = () => {
      common_vendor.index.showLoading({ title: "解析中..." });
      setTimeout(() => {
        parseText();
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "解析完成", icon: "success" });
      }, 500);
    };
    const showExample = () => {
      inputText.value = `1.驾驶人有下列哪种违法行为一次记6分
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:D
解析:请仔细阅读交规 (若无解析本行可不填)`;
    };
    const clearInput = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空输入区吗？",
        success: (res) => {
          if (res.confirm) {
            inputText.value = "";
          }
        }
      });
    };
    const openChapterSelect = () => {
      common_vendor.index.showToast({ title: "请先在单题录入中管理章节", icon: "none" });
    };
    const manageChapters = () => {
      common_vendor.index.navigateTo({ url: "/pages/questions/category" });
    };
    const onDifficultyChange = (e) => {
      const index = e.detail.value;
      selectedDifficulty.value = difficultyOptions[index].value;
    };
    const parseText = () => {
      const text = inputText.value;
      if (!text) {
        parsedList.value = [];
        return;
      }
      const questions = [];
      const blocks = text.split(/\n(?=\d+[.、])/g);
      blocks.forEach((block) => {
        if (!block.trim())
          return;
        const lines = block.split("\n").map((l) => l.trim()).filter((l) => l);
        if (lines.length === 0)
          return;
        const question = {
          title: "",
          options: [],
          answer: "",
          analysis: "",
          type: "SINGLE"
          // Default
        };
        question.title = lines[0].replace(/^\d+[.、]\s*/, "");
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (/^[A-H][.、]/.test(line)) {
            question.options.push(line.replace(/^[A-H][.、]\s*/, ""));
          } else if (line.startsWith("答案:") || line.startsWith("答案：")) {
            question.answer = line.replace(/^答案[:：]\s*/, "");
          } else if (line.startsWith("解析:") || line.startsWith("解析：")) {
            question.analysis = line.replace(/^解析[:：]\s*/, "");
          } else if (question.options.length === 0 && !question.answer) {
            question.title += "\n" + line;
          }
        }
        if (question.options.length > 0) {
          if (question.answer.length > 1 && !["对", "错", "正确", "错误"].includes(question.answer)) {
            question.type = "MULTIPLE";
          } else {
            question.type = "SINGLE";
          }
        } else {
          if (["对", "错", "正确", "错误"].includes(question.answer)) {
            question.type = "TRUE_FALSE";
          } else if (question.answer.includes("|")) {
            question.type = "FILL";
          } else if (question.title.includes("()") || question.title.includes("（）")) {
            question.type = "FILL";
          } else {
            question.type = "SHORT_ANSWER";
          }
        }
        questions.push(question);
      });
      parsedList.value = questions;
    };
    const goPreview = () => {
      parseText();
      if (parsedList.value.length === 0) {
        common_vendor.index.showToast({ title: "未能识别到题目，请检查格式", icon: "none" });
        return;
      }
      step.value = "preview";
      common_vendor.index.setNavigationBarTitle({ title: "上传预览" });
    };
    const getCount = (key) => {
      if (key === "all")
        return parsedList.value.length;
      return parsedList.value.filter((q) => q.type === key).length;
    };
    const filteredList = common_vendor.computed(() => {
      if (currentFilter.value === "all")
        return parsedList.value;
      return parsedList.value.filter((q) => q.type === currentFilter.value);
    });
    const getTypeName = (type) => {
      const map = {
        "SINGLE": "单选题",
        "MULTIPLE": "多选题",
        "TRUE_FALSE": "判断题",
        "FILL": "填空题",
        "SHORT_ANSWER": "简答题"
      };
      return map[type] || "未知";
    };
    const getOptionLabel = (index) => {
      return String.fromCharCode(65 + index);
    };
    const editQuestion = (index) => {
      common_vendor.index.showToast({ title: "编辑功能开发中", icon: "none" });
    };
    const deleteQuestion = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除该题目吗？",
        success: (res) => {
          if (res.confirm) {
            parsedList.value.splice(index, 1);
          }
        }
      });
    };
    const submitUpload = () => {
      common_vendor.index.showLoading({ title: "上传中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "上传成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 1e3);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: step.value === "input"
      }, step.value === "input" ? {
        b: common_vendor.o(smartParse),
        c: common_vendor.o(showExample),
        d: common_vendor.o(clearInput),
        e: -1,
        f: inputText.value,
        g: common_vendor.o(($event) => inputText.value = $event.detail.value),
        h: common_vendor.t(selectedChapterName.value || "请选择"),
        i: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        j: common_vendor.o(openChapterSelect),
        k: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        l: common_vendor.o(manageChapters),
        m: common_vendor.t(selectedDifficultyLabel.value),
        n: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        o: difficultyOptions,
        p: common_vendor.o(onDifficultyChange),
        q: common_vendor.o(goPreview)
      } : step.value === "preview" ? common_vendor.e({
        s: common_vendor.f(filterTabs, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.label),
            b: common_vendor.t(getCount(tab.key)),
            c: currentFilter.value === tab.key
          }, currentFilter.value === tab.key ? {} : {}, {
            d: index,
            e: currentFilter.value === tab.key ? 1 : "",
            f: common_vendor.o(($event) => currentFilter.value = tab.key, index)
          });
        }),
        t: common_vendor.f(filteredList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: "d89638c2-3-" + i0,
            c: common_vendor.p({
              text: getTypeName(item.type),
              size: "mini",
              type: "primary"
            }),
            d: common_vendor.o(($event) => editQuestion(), index),
            e: "d89638c2-4-" + i0,
            f: common_vendor.o(($event) => deleteQuestion(index), index),
            g: "d89638c2-5-" + i0,
            h: common_vendor.t(item.title),
            i: item.options && item.options.length
          }, item.options && item.options.length ? {
            j: common_vendor.f(item.options, (opt, optIdx, i1) => {
              return {
                a: common_vendor.t(getOptionLabel(optIdx)),
                b: common_vendor.t(opt),
                c: optIdx
              };
            })
          } : {}, {
            k: common_vendor.t(item.answer),
            l: item.analysis
          }, item.analysis ? {
            m: common_vendor.t(item.analysis)
          } : {}, {
            n: index
          });
        }),
        v: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#2563eb"
        }),
        w: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#ef4444"
        }),
        x: filteredList.value.length === 0
      }, filteredList.value.length === 0 ? {} : {}, {
        y: common_vendor.o(submitUpload)
      }) : {}, {
        r: step.value === "preview"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d89638c2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/import-batch/index.js.map
