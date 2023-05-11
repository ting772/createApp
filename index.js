#! node

const path = require("path");
const { program } = require("commander");
program
  .name("create-app")
  .usage("[options] projectName")
  .description(
    "创建webpack、javascript/vue/react、less/scss、typescript、babel、eslint相关项目基础，\n省去了项目搭建的一些重复安装步骤、配置文件等"
  )
  .version(require("./package.json").version)
  .option(
    "-r, --registry <url>",
    "设置npm下载镜像源,默认：https://registry.npm.taobao.org",
    "https://registry.npm.taobao.org"
  )
  .argument("<appName>", "待创建项目的名称")
  .action(async (appName, options) => {
    const { default: chalk } = await import("chalk");

    const cwd = path.resolve(process.cwd(), appName);

    const log = console.log.bind(console);
    const info = (...args) => {
      console.log(chalk.green(...args));
    };
    const error = (...args) => {
      console.error(chalk.red(...args));
    };

    const logUtils = {
      log,
      info,
      error,
    };

    async function run() {
      //根据用户查询下载npm dev包
      const userOptions = await require("./lib/devInstall")({
        cwd,
        logUtils,
        launch_options: options,
      });
      //添加各种配置文件
      await require("./lib/config")({
        cwd,
        logUtils,
        userOptions,
      });
      await require("./lib/addScripts")({ cwd, logUtils });
    }

    try {
      await run();
    } catch (e) {
      error(e);
    }
  });
program.parse();
