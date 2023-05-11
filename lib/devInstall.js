const inquirer = require("inquirer");
const { platform } = process;
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const templates = ["vue", "react", "none"];
const default_template = "none";
const style_processors = ["less", "sass", "none(css)"];
const default_style_processor = "sass";
const default_need_ts = true;
const default_use_eslint = true;
const default_need_babel = false;

const webpack_installs = [
  "webpack",
  "webpack-cli",
  "html-webpack-plugin",
  "webpack-dev-server",
];

const style_installs = ["style-loader", "css-loader"];
const babel_installs = [];
const ts_installs = [];
let dev_installs = [];

module.exports = async function (options) {
  const {
    cwd,
    logUtils: { log, info },
    launch_options,
  } = options;
  let userOptions = await inquirer.prompt([
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
    // {
    //   type: "confirm",
    //   name: "is_electron",
    //   message: "是否开发electron app",
    //   default: false,
    // },
  ]);

  const {
    // is_electron,
    template,
    style_processor,
    need_typescript,
    need_babel,
    need_eslint,
  } = userOptions;

  switch (style_processor) {
    case "less": {
      style_installs.push("less-loader", "less");
      break;
    }

    case "sass": {
      style_installs.push("sass-loader", "sass");
      break;
    }

    default:
      break;
  }

  //https://blog.csdn.net/iamxuqianqian/article/details/116067093
  if (need_babel) {
    babel_installs.push("@babel/core", "@babel/cli", "@babel/preset-env");
    if (need_typescript) {
      babel_installs.push("@babel/preset-typescript");
    }
    if (template == "react") {
      babel_installs.push("@babel/preset-react");
    }
  } else if (need_typescript) {
    ts_installs.push("typescript", "ts-loader");
  }

  dev_installs = webpack_installs.concat(
    style_installs,
    babel_installs,
    ts_installs
  );

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

  await createDirIfNotExist(cwd);
  await createDirIfNotExist(path.resolve(cwd, "src"));

  if (!(await existFile(path.resolve(cwd, "package.json")))) {
    await runNpm(["init", "-y"]);
  }
  await runNpm(
    [
      "install",
      "--save-dev",
      launch_options.registry && `--registry=${launch_options.registry}`,
    ]
      .filter(Boolean)
      .concat(dev_installs)
  );

  return userOptions;
};
