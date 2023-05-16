const rx = require("rxjs");
const inquirer = require("inquirer");
const { VUE3_STATE_MANAGE } = require("../configs/commons");

const templates = ["vue2", "vue3", "react", "none"];
const default_template = "none";
const style_processors = ["less", "sass", "none(css)"];
const default_style_processor = "sass";
const default_need_ts = true;
const default_use_eslint = true;
const default_need_babel = false;

module.exports = function () {
  const questions = [
    {
      type: "list",
      name: "template",
      message: "选择模板",
      default: default_template,
      choices: templates.map((name) => ({
        name,
        value: name,
        short: name,
      })),
    }, //框架
    {
      type: "list",
      name: "style_processor",
      message: "选择样式预处理器",
      default: default_style_processor,
      choices: style_processors.map((name) => ({
        name,
        value: name,
        short: name,
      })),
    }, //样式预处理
    {
      type: "confirm",
      name: "need_typescript",
      message: "是否需要typescript?",
      default: default_need_ts,
    }, //typescript
    {
      type: "confirm",
      name: "need_eslint",
      message: "开启eslint",
      default: default_use_eslint,
    },
    {
      type: "confirm",
      name: "need_babel",
      message: "是否需要babel",
      default: default_need_babel,
    }, //babel
  ];

  return new Promise((resolve, reject) => {
    const prompts = new rx.Subject();
    const answers = {};

    const onEachAnswer = ({ name, answer }) => {
      Object.assign(answers, { [name]: answer });
      if (name == "template") {
        switch (answer) {
          case "react":
            questions.unshift(
              {
                type: "list",
                name: "react_state_manage",
                message: "选择状态管理",
                choices: ["mobx", "redux"],
              },
              {
                type: "confirm",
                name: "react_need_router",
                message: "是否需要路由",
                default: true,
              }
            );
            break;

          case "vue2":
            questions.unshift(
              {
                type: "confirm",
                name: "vue2_need_vuex",
                message: "是否使用vuex3状态管理",
                default: true,
              },
              {
                type: "confirm",
                name: "vue2_need_router",
                message: "是否需要vue-router3路由",
                default: true,
              }
            );
            break;

          case "vue3": {
            questions.unshift(
              {
                type: "list",
                name: "vue3_state_manage",
                message: "选择状态管理",
                choices: VUE3_STATE_MANAGE.map((name) => ({
                  name: name,
                  value: name,
                  short: name,
                })),
                default: "vuex",
              },
              {
                type: "confirm",
                name: "vue3_need_router",
                message: "是否需要vue-router4路由",
                default: true,
              }
            );
            break;
          }

          default:
            break;
        }
      }
      askQuestion();
    };

    const onError = (err) => {
      reject(err);
    };

    const onComplete = () => {
      resolve(answers);
    };

    inquirer
      .prompt(prompts)
      .ui.process.subscribe(onEachAnswer, onError, onComplete);

    const askQuestion = () => {
      if (questions.length > 0) {
        let question = questions.shift();

        if (
          question.name == "need_typescript" &&
          answers.template.includes("vue")
        ) {
          question = questions.shift();
        }
        if (question) prompts.next(question);
        else prompts.complete();
      } else {
        prompts.complete();
      }
    };
    askQuestion();
  });
};
