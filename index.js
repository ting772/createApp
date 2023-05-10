const path = require("path");

(async function () {
  const { default: chalk } = await import("chalk");

  const cwd = path.resolve(__dirname, "test");

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
    const userOptions = await require("./lib/devInstall")({ cwd, logUtils });

    //添加各种配置文件
    await require("./lib/config")({
      cwd,
      logUtils,
      userOptions,
    });

    await require("./lib/addScripts");
  }

  try {
    await run();
  } catch (e) {
    error(e);
  }
})();
