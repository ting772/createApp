const { platform } = process;
const { spawn } = require("child_process");
const path = require("path");

module.exports = async function (options) {
  const {
    cwd,
    utils: { log, existFile, createDirIfNotExist },
    launch_options,
    userOptions,
  } = options;

  let dev_installs = require("./generateDevInstalls")(userOptions);
  const installs = require("./generateInstalls")(userOptions);

  const runNpm = async (args) => {
    log(`执行：npm ${args.join(" ")}`);
    if (launch_options.dryRun) {
      return;
    }
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
