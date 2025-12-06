"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const questionTypes = [
      { value: "SINGLE", text: "单选题" },
      { value: "MULTIPLE", text: "多选题" },
      { value: "JUDGE", text: "判断题" },
      { value: "FILL", text: "填空题" }
    ];
    const difficultyOptions = [
      { value: "EASY", text: "简单" },
      { value: "MEDIUM", text: "中等" },
      { value: "HARD", text: "困难" }
    ];
    const instance = common_vendor.getCurrentInstance();
    const mode = common_vendor.ref("single");
    const showStemToolbar = common_vendor.ref(false);
    const stemEditorCtx = common_vendor.ref(null);
    const bulkPopup = common_vendor.ref(null);
    const bulkText = common_vendor.ref("");
    const formats = common_vendor.ref({});
    const form = common_vendor.ref({
      type: "SINGLE",
      // SINGLE, MULTIPLE, JUDGE, FILL
      stemHtml: "",
      options: createDefaultOptions(4),
      answers: [],
      blanks: [{ id: Date.now(), text: "" }],
      analysis: "",
      categoryName: "",
      difficulty: ""
      // 截图里默认可能为空
    });
    const typeLabel = common_vendor.computed(() => {
      const t = questionTypes.find((i) => i.value === form.value.type);
      return t ? t.text : "请选择";
    });
    const isChoice = common_vendor.computed(() => ["SINGLE", "MULTIPLE", "JUDGE"].includes(form.value.type));
    const isSingle = common_vendor.computed(() => ["SINGLE", "JUDGE"].includes(form.value.type));
    const canRemoveOption = common_vendor.computed(() => form.value.options.length > 2 && form.value.type !== "JUDGE");
    const optionsDisabled = common_vendor.computed(() => form.value.options.length >= 8 || form.value.type === "JUDGE");
    common_vendor.onLoad((query) => {
      mode.value = query.mode || "single";
    });
    function createDefaultOptions(count = 4) {
      return Array.from({ length: count }).map((_, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: ""
      }));
    }
    function openTypeSelect() {
      common_vendor.index.showActionSheet({
        itemList: questionTypes.map((t) => t.text),
        success: (res) => {
          handleTypeChange(questionTypes[res.tapIndex].value);
        }
      });
    }
    function handleTypeChange(val) {
      form.value.type = val;
      form.value.answers = [];
      if (val === "JUDGE") {
        form.value.options = [
          { label: "A", text: "正确" },
          { label: "B", text: "错误" }
        ];
      } else if (val === "FILL") {
        if (!form.value.blanks || form.value.blanks.length === 0) {
          form.value.blanks = [{ id: Date.now(), text: "" }];
        }
      } else {
        const isJudgeData = form.value.options.length === 2 && form.value.options[0].text === "正确" && form.value.options[1].text === "错误";
        if (isJudgeData || form.value.options.length === 0) {
          form.value.options = createDefaultOptions(4);
        }
      }
    }
    function onStemReady(e) {
      common_vendor.index.createSelectorQuery().in(instance).select("#stemEditor").context((res) => {
        stemEditorCtx.value = res.context;
      }).exec();
    }
    function handleStemInput(e) {
      form.value.stemHtml = e.detail.html;
    }
    function onStatusChange(e) {
      formats.value = e.detail;
    }
    function handleStemToolbar(name, value) {
      if (stemEditorCtx.value) {
        stemEditorCtx.value.format(name, value);
      }
    }
    function insertImage() {
      if (!stemEditorCtx.value)
        return;
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          stemEditorCtx.value.insertImage({ src: res.tempFilePaths[0], width: "80%" });
        }
      });
    }
    function addOption() {
      if (optionsDisabled.value)
        return;
      const nextLabel = String.fromCharCode(65 + form.value.options.length);
      form.value.options.push({ label: nextLabel, text: "" });
    }
    function removeOption(index) {
      if (!canRemoveOption.value)
        return;
      const removed = form.value.options.splice(index, 1)[0];
      form.value.answers = form.value.answers.filter((a) => a !== removed.label);
      form.value.options.forEach((item, idx) => {
        item.label = String.fromCharCode(65 + idx);
      });
    }
    function toggleAnswer(label) {
      if (isSingle.value) {
        form.value.answers = [label];
      } else {
        const idx = form.value.answers.indexOf(label);
        if (idx > -1) {
          form.value.answers.splice(idx, 1);
        } else {
          form.value.answers.push(label);
        }
      }
    }
    function openBulkPopup() {
      bulkText.value = "";
      bulkPopup.value.open();
    }
    function applyBulkOptions() {
      const lines = bulkText.value.split("\n").filter((s) => s.trim());
      let currentIdx = 0;
      while (currentIdx < form.value.options.length && lines.length > 0) {
        if (!form.value.options[currentIdx].text) {
          form.value.options[currentIdx].text = lines.shift();
        }
        currentIdx++;
      }
      while (lines.length > 0 && !optionsDisabled.value) {
        const nextLabel = String.fromCharCode(65 + form.value.options.length);
        form.value.options.push({ label: nextLabel, text: lines.shift() });
      }
      bulkPopup.value.close();
    }
    function addBlank() {
      form.value.blanks.push({ id: Date.now(), text: "" });
    }
    function removeBlank(index) {
      form.value.blanks.splice(index, 1);
    }
    function chooseCategory() {
      common_vendor.index.showToast({ title: "打开章节选择器", icon: "none" });
    }
    function openDifficulty() {
      common_vendor.index.showActionSheet({
        itemList: difficultyOptions.map((d) => d.text),
        success: (res) => {
          form.value.difficulty = difficultyOptions[res.tapIndex].value;
        }
      });
    }
    function renderDifficulty(val) {
      const t = difficultyOptions.find((d) => d.value === val);
      return t ? t.text : "";
    }
    function submit() {
      common_vendor.index.__f__("log", "at pages/import-question/index.vue:388", "Submit:", form.value);
      if (!form.value.stemHtml && !form.value.stemText) {
        return common_vendor.index.showToast({ title: "请输入题干", icon: "none" });
      }
      if (isChoice.value && form.value.answers.length === 0) {
        return common_vendor.index.showToast({ title: "请勾选正确答案", icon: "none" });
      }
      common_vendor.index.showToast({ title: "添加成功", icon: "success" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(typeLabel.value),
        b: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        c: common_vendor.o(openTypeSelect),
        d: showStemToolbar.value
      }, showStemToolbar.value ? {
        e: formats.value.bold ? 1 : "",
        f: common_vendor.o(($event) => handleStemToolbar("bold")),
        g: formats.value.italic ? 1 : "",
        h: common_vendor.o(($event) => handleStemToolbar("italic")),
        i: formats.value.underline ? 1 : "",
        j: common_vendor.o(($event) => handleStemToolbar("underline")),
        k: formats.value.script === "sub" ? 1 : "",
        l: common_vendor.o(($event) => handleStemToolbar("script", "sub")),
        m: formats.value.script === "sup" ? 1 : "",
        n: common_vendor.o(($event) => handleStemToolbar("script", "sup")),
        o: common_vendor.o(insertImage),
        p: common_vendor.p({
          type: "image",
          size: "20"
        })
      } : {}, {
        q: common_vendor.o(onStemReady),
        r: common_vendor.o(onStatusChange),
        s: common_vendor.o(($event) => showStemToolbar.value = true),
        t: common_vendor.o(($event) => showStemToolbar.value = false),
        v: common_vendor.o(handleStemInput),
        w: isChoice.value
      }, isChoice.value ? {
        x: common_vendor.f(form.value.options, (item, index, i0) => {
          return common_vendor.e(canRemoveOption.value ? {
            a: "3e7c1569-2-" + i0,
            b: common_vendor.p({
              type: "minus-filled",
              color: "#dd524d",
              size: "24"
            }),
            c: common_vendor.o(($event) => removeOption(index), item.label)
          } : {
            d: "3e7c1569-3-" + i0,
            e: common_vendor.p({
              type: "minus-filled",
              size: "24"
            })
          }, {
            f: common_vendor.t(item.label),
            g: item.text,
            h: common_vendor.o(($event) => item.text = $event.detail.value, item.label),
            i: form.value.answers.includes(item.label)
          }, form.value.answers.includes(item.label) ? {} : {}, {
            j: form.value.answers.includes(item.label) ? 1 : "",
            k: common_vendor.o(($event) => toggleAnswer(item.label), item.label),
            l: item.label
          });
        }),
        y: canRemoveOption.value,
        z: common_vendor.p({
          type: "plus-filled",
          color: "#007aff",
          size: "22"
        }),
        A: common_vendor.o(addOption),
        B: optionsDisabled.value ? 1 : "",
        C: common_vendor.o(openBulkPopup)
      } : form.value.type === "FILL" ? {
        E: common_vendor.p({
          type: "plus-filled",
          color: "#007aff",
          size: "20"
        }),
        F: common_vendor.o(addBlank),
        G: common_vendor.f(form.value.blanks, (blank, index, i0) => {
          return common_vendor.e(form.value.blanks.length > 1 ? {
            a: "3e7c1569-6-" + i0,
            b: common_vendor.p({
              type: "minus-filled",
              color: "#dd524d",
              size: "24"
            }),
            c: common_vendor.o(($event) => removeBlank(index), blank.id)
          } : {}, {
            d: common_vendor.t(index + 1),
            e: blank.text,
            f: common_vendor.o(($event) => blank.text = $event.detail.value, blank.id),
            g: blank.id
          });
        }),
        H: form.value.blanks.length > 1
      } : {}, {
        D: form.value.type === "FILL",
        I: form.value.analysis,
        J: common_vendor.o(($event) => form.value.analysis = $event.detail.value),
        K: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        L: common_vendor.o(chooseCategory),
        M: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        N: form.value.difficulty
      }, form.value.difficulty ? {
        O: common_vendor.t(renderDifficulty(form.value.difficulty)),
        P: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        })
      } : {
        Q: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        })
      }, {
        R: common_vendor.o(openDifficulty),
        S: common_vendor.o(submit),
        T: bulkText.value,
        U: common_vendor.o(($event) => bulkText.value = $event.detail.value),
        V: common_vendor.o(applyBulkOptions),
        W: common_vendor.o(($event) => bulkPopup.value.close()),
        X: common_vendor.p({
          mode: "input",
          title: "批量添加选项",
          placeholder: "一行一个选项，自动填充",
          ["before-close"]: true
        }),
        Y: common_vendor.sr(bulkPopup, "3e7c1569-11", {
          "k": "bulkPopup"
        }),
        Z: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3e7c1569"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/import-question/index.js.map
