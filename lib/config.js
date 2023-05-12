const fs = require("fs");
const path = require("path");
const webpackConfigGenerate = require("./generateWebpackConfig");
const jsonfile = require("jsonfile");

module.exports = async function (options) {
  const {
    userOptions: { template, need_eslint, need_babel, need_typescript },
    cwd,
    logUtils: { log, info, error },
  } = options;

  const files_to_copy = [
    {
      from: "../templates/.editorconfig",
      to: ".editorconfig",
    },
    {
      from: "../templates/.gitignore",
      to: ".gitignore",
    },
  ];

  switch (template) {
    case "none":
      files_to_copy.push(
        {
          from: "../templates/index.html",
          to: "index.html",
        },
        {
          from: "../templates/main.js",
          to: need_typescript ? "src/main.ts" : "src/main.js",
        }
      );

      break;

    default:
      throw Error("还没有实现其他的模板类型");
  }

  if (need_eslint) {
    files_to_copy.push(
      {
        from: "../templates/.eslintrc.js",
        to: ".eslintrc.js",
      },
      {
        from: "../templates/.eslintignore",
        to: ".eslintignore",
      }
    );
  }

  const jsonFmt = { spaces: 2, EOL: "\r\n" };
  if (need_babel) {
    files_to_copy.push({
      writeFile: ({ dst }) => {
        jsonfile.writeFile(
          dst,
          {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                },
              ],
              template == "react" && "@babel/preset-react",
              need_typescript && [
                "@babel/preset-typescript",
                {
                  isTsx: template == "react",
                },
              ],
            ].filter(Boolean),
            targets: "defaults",
          },
          jsonFmt
        );
      },
      to: "babel.config.json",
    });
  } else {
    //need_typescript:true 此时被webpack：ts-loader处理
  }

  files_to_copy.push({
    writeFile: ({ dst }) => {
      jsonfile.writeFile(
        dst,
        {
          compilerOptions: {
            target: "es6",
            module: "commonjs",
            noImplicitAny: true,
            removeComments: true,
            preserveConstEnums: true,
            sourceMap: true,
          },
          exclude: ["node_modules"],
          include: ["src/**/*"],
        },
        jsonFmt
      );
    },
    to: need_typescript ? "tsconfig.json" : "jsconfig.json",
  });

  files_to_copy.push({
    writeFile: async ({ dst }) => {
      //认为是需要动态生成，然后再复制到dst处的文件
      let code = await webpackConfigGenerate(options);
      log("开始生成webpack.config.js...");
      fs.writeFile(dst, code, (err) => {
        if (err) {
          error(`webpack.config.js内容写入文件${dst}失败,reason:${err}`);
          return;
        }
        info(`webpack.config.js内容生成到${dst}`);
      });
    },
    to: "webpack.config.js",
  });

  for (let obj of files_to_copy) {
    const { from, to, writeFile } = obj;
    let dst = path.resolve(cwd, to);

    //文件复制
    if (from) {
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
      writeFile({ dst });
    }
  }
};
