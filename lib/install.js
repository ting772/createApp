const inquirer = require("inquirer");
const { platform } = process;
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const rx = require("rxjs");

const templates = ["vue", "react", "none"];
const default_template = "none";
const style_processors = ["less", "sass", "none(css)"];
const default_style_processor = "sass";
const default_need_ts = true;
const default_use_eslint = true;
const default_need_babel = false;

const existFile = async (file) => {
  const { R_OK, W_OK } = fs.constants;
  try {
    await fs.promises.access(file, R_OK | W_OK);
    return true;
  } catch (e) {
    if (e.code == "ENOENT") {
      return false;
    }
    throw e;
  }
};

module.exports = async function (options) {
  const {
    cwd,
    logUtils: { log, info },
    launch_options,
  } = options;

  if (await existFile(cwd)) {
    // throw Error(`项目${cwd}已存在，无法创建`);
  }

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

  let userOptions = await new Promise((resolve, reject) => {
    const prompts = new rx.Subject();
    const answers = {};

    const onEachAnswer = ({ name, answer }) => {
      Object.assign(answers, { [name]: answer });
      if (name == "template") {
        if (answer == "react") {
          questions.unshift(
            {
              type: "list",
              name: "state_manage",
              message: "选择样式预处理器",
              choices: ["mobx", "redux"],
            },
            {
              type: "confirm",
              name: "need_router",
              message: "是否需要路由",
            }
          );
        }
        //todo vue
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
        prompts.next(questions.shift());
      } else {
        prompts.complete();
      }
    };
    askQuestion();
  });
  log("查询结果：", userOptions);

  let dev_installs = require("./generateDevInstalls")(userOptions);
  const installs = require("./generateInstalls")(userOptions);

  const createDirIfNotExist = async (dir) => {
    if (!(await existFile(dir))) {
      await fs.promises.mkdir(dir);
      info(`创建目录${dir}`);
    }
  };

  const runNpm = async (args) => {
    log(`npm ${args.join(" ")}`);
    let child = spawn(platform == "win32" ? "npm.cmd" : "npm", args, {
      cwd,
      stdio: "inherit",
    });
    await new Promise((resolve, reject) => {
      child.on("exit", resolve);
      child.on("error", reject);
    });
  };

  const runNpmInstall = async (installs, isDev) => {
    return await runNpm(
      [
        "install",
        isDev ? "--save-dev" : "--save",
        launch_options.registry && `--registry=${launch_options.registry}`,
      ]
        .filter(Boolean)
        .concat(installs)
    );
  };

  await createDirIfNotExist(cwd);
  await createDirIfNotExist(path.resolve(cwd, "src"));

  if (!(await existFile(path.resolve(cwd, "package.json")))) {
    await runNpm(["init", "-y"]);
  }
  await runNpmInstall(dev_installs, true);
  await runNpmInstall(installs);

  return userOptions;
};
