const jsonfile = require("jsonfile");
const path = require("path");

module.exports = async function (options) {
  const { cwd, logUtils } = options;
  const file = path.resolve(cwd, "package.json");
  let obj = await new Promise((resolve, reject) => {
    jsonfile.readFile(file, (err, obj) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(obj);
    });
  });
  obj.scripts.start = `webpack serve`;
  obj.scripts["build:dev"] = `webpack`;
  obj.scripts["build:prod"] = `webpack --env prod`;
  logUtils.log("开始添加npm.script.start命令");
  logUtils.log("开始添加npm.script.build:dev命令");
  logUtils.log("开始添加npm.script.build:prod命令");
  await new Promise((resolve, reject) => {
    jsonfile.writeFile(file, obj, { spaces: 2, EOL: "\r\n" }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};
