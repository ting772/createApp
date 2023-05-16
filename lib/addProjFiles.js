const path = require("path");
const webpackConfigGenerate = require("./generateWebpackConfig");
const eslintConfigGenerate = require("./generateEslintConfig");
const generateMain = require("./generateVueMain");
const { VUE3_STATE_MANAGE_VUEX } = require("../configs/commons");

module.exports = async function (options) {
  const {
    userOptions: {
      template,
      need_eslint,
      need_babel,
      need_typescript,
      vue2_need_vuex,
      vue2_need_router,

      vue3_need_router,
      vue3_state_manage,
    },
    cwd,
    utils: { createDirIfNotExist, generateProjFiles },
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

  let dirsToCreate = ["src/components"];

  const isReact = template == "react";
  const isVue = template.includes("vue");
  const isVue2 = template == "vue2";

  if (template == "none") {
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
  } else if (isReact) {
    files_to_copy.push(
      {
        from: "../templates/index_with_placeholder.html",
        to: "index.html",
      },
      {
        from: "../templates/main.jsx",
        to: need_typescript ? "src/main.tsx" : "src/main.jsx",
      }
    );
  } else if (isVue) {
    if (vue2_need_router || vue3_need_router) dirsToCreate.push("src/router");
    if (vue2_need_vuex || vue3_state_manage == VUE3_STATE_MANAGE_VUEX) {
      dirsToCreate.push("src/store");
      files_to_copy.push({
        from: `../templates/vue/store//index.vue${isVue2 ? "2" : "3"}.js`,
        to: "src/store/index.js",
      });
    }
    dirsToCreate = dirsToCreate.map((name) => path.resolve(cwd, name));
    files_to_copy.push(
      {
        from: "../templates/index_with_placeholder.html",
        to: "index.html",
      },
      {
        from: "../templates/vue/components/Hello.vue",
        to: "src/components/Hello.vue",
      },
      {
        from: `../templates/vue/App.vue${isVue2 ? "2" : "3"}.vue`,
        to: "src/App.vue",
      },
      {
        generate: () => generateMain(options.userOptions),
        to: "src/main.js",
      }
    );
    if (vue3_need_router || vue2_need_router) {
      files_to_copy.push({
        from: `../templates/vue/router/index.${isVue2 ? "vue2" : "vue3"}.js`,
        to: "src/router/index.js",
      });
    }
  } else {
    throw Error(`未识别的模板类型:${template}`);
  }

  if (need_eslint) {
    files_to_copy.push(
      {
        generate: () => eslintConfigGenerate(options.userOptions),
        to: ".eslintrc.js",
      },
      {
        from: "../templates/.eslintignore",
        to: ".eslintignore",
      }
    );
  }

  if (need_babel) {
    files_to_copy.push({
      generate: () => ({
        presets: [
          [
            "@babel/preset-env",
            {
              useBuiltIns: "usage",
            },
          ],
          isReact && "@babel/preset-react",
          need_typescript && [
            "@babel/preset-typescript",
            {
              isTsx: isReact,
            },
          ],
        ].filter(Boolean),
        targets: "defaults",
      }),
      to: "babel.config.json",
    });
  } else {
    //need_typescript:true 此时被webpack：ts-loader处理
  }

  files_to_copy.push({
    generate: () => {
      return need_typescript
        ? {
            compilerOptions: {
              ...(isReact && { jsx: "react" }),
              target: "es6",
              module: "ES6",
              noImplicitAny: true,
              removeComments: true,
              preserveConstEnums: true,
              sourceMap: true,
              moduleResolution: "node",
              allowSyntheticDefaultImports: true,
              baseUrl: "./",
              paths: {
                "@/*": ["src/*"],
              },
            },
            exclude: ["node_modules"],
            include: ["src/**/*"],
          }
        : {
            compilerOptions: {
              baseUrl: "./",
              paths: {
                "@/*": ["src/*"],
              },
            },
            exclude: ["node_modules"],
            include: ["src/**/*"],
          };
    },
    to: need_typescript ? "tsconfig.json" : "jsconfig.json",
  });

  files_to_copy.push({
    generate: () => webpackConfigGenerate(options.userOptions),
    to: "webpack.config.js",
  });

  for (let dirPath of dirsToCreate) {
    await createDirIfNotExist(dirPath);
  }

  for (let obj of files_to_copy.map((item) => {
    return {
      ...item,
      ...(item.from && { from: path.resolve(__dirname, item.from) }),
      to: path.resolve(cwd, item.to),
    };
  })) {
    await generateProjFiles(obj);
  }
};
