#! node

const path = require("path");
const { program } = require("commander");
const fs = require("fs");
const generateUserOptions = require("./lib/generateUserOptions");
const install = require("./lib/install");
const jsonfile = require("jsonfile");

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
  .option("--dry-run", "查看哪些文件将会被创建，哪些npm包将会被下载")
  .argument("<appName>", "待创建项目的名称")
  .action(async (appName, launch_options) => {
    const { default: chalk } = await import("chalk");

    const cwd = path.resolve(process.cwd(), appName);
    const log = console.log.bind(console);
    const success = (...args) => console.log(chalk.green(...args));
    const error = (...args) => console.error(chalk.red(...args));

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
        if (!launch_options.dryRun)
          await fs.promises.mkdir(dir, { recursive: true });
        success(`创建目录${dir}`);
      }
    };

    const generateProjFiles = async (obj) => {
      const { from, to, generate } = obj;

      if (launch_options.dryRun) {
        if (from) {
          success(`复制文件${from}->${to}`);
        } else if (generate) {
          let content = await generate();
          if (typeof content == "object")
            content = JSON.stringify(content, null, "  ");
          success(`\n生成文件内容到${to}\n\n${content}\n`);
        } else {
          throw Error("不支持的文件生成方式");
        }
        return;
      }

      //文件复制
      if (from) {
        let name = path.basename(from);
        log(`copy file ${from} to ${to}`);
        fs.copyFile(from, to, (err) => {
          if (err) {
            error(`copy file ${name} to ${to} failed,reason:${err}`);
            return;
          }
          success(`file ${from} copied to ${to} successfully`);
        });
      } else if (generate) {
        let content = await generate();

        if (to.endsWith(".json")) {
          jsonfile.writeFile(to, content, { spaces: 2, EOL: "\r\n" });
        } else {
          fs.writeFile(to, content, (err) => {
            if (err) {
              error(`文件${to}生成失败,失败原因：${err}`);
              return;
            }
            success(`文件${to}生成成功`);
          });
        }
      } else {
        throw Error("不支持的文件生成方式");
      }
    };

    const utils = {
      log,
      success,
      error,
      existFile,
      createDirIfNotExist,
      generateProjFiles,
    };

    async function run() {
      //获取用户选项
      const userOptions = await generateUserOptions();
      log("user options:", userOptions);

      //安装npm包
      await install({
        cwd,
        utils,
        launch_options,
        userOptions,
      });

      //添加项目/配置文件
      await require("./lib/addProjFiles.js")({
        cwd,
        utils,
        userOptions,
      });

      //添加package.json scripts
      await require("./lib/addScripts")({ cwd, utils, launch_options });
    }

    try {
      if (await existFile(cwd)) {
        throw Error(`项目${cwd}已存在，无法创建`);
      }

      await run();
    } catch (e) {
      error(e);
    }
  });
program.parse();
