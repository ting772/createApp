const fs = require("fs");
const path = require("path");
const webpackConfigGenerate = require("./webpackConfig");

module.exports = async function (options) {
  const {
    userOptions: { template },
    cwd,
    logUtils: { log, info, error },
  } = options;

  const files_t1 = [
    {
      from: "../templates/.editorconfig",
      to: ".editorconfig",
    },
    {
      from: "../templates/.gitignore",
      to: ".gitignore",
    },
  ];

  let files_t2 = [];
  switch (template) {
    case "none":
      files_t2.push(
        {
          from: "../templates/plain/index.html",
          to: "index.html",
        },
        {
          from: "../templates/plain/main.js",
          to: "src/main.js",
        },
        {
          name: "webpack.config.js",
          from: async () => {
            //认为是需要动态生成，然后再复制到dst处的文件
            return await webpackConfigGenerate(options);
          },
          to: "webpack.config.js",
        }
      );

      break;

    default:
      throw Error("还没有实现其他的模板类型");
  }

  for (let obj of files_t1.concat(files_t2)) {
    const { from, to } = obj;
    let dst = path.resolve(cwd, to);

    //文件复制
    if (typeof from == "string") {
      let name = path.basename(from);
      log(`copy file ${name} to ${dst}`);
      fs.copyFile(path.resolve(__dirname, from), dst, (err) => {
        if (err) {
          error(`copy file ${name} to ${dst} failed,reason:${err}`);
          return;
        }
        info(`file ${name} copied to ${dst}`);
      });
    } else {
      let code = await from();
      fs.writeFile(dst, code, (err) => {
        if (err) {
          error(`write file ${obj.name} to ${dst} failed,reason:${err}`);
          return;
        }
        info(`file ${obj.name} copied to ${dst}`);
      });
    }
  }
};
