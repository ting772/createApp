const { parse } = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const fs = require("fs");

//https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-basics
//https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md

module.exports = function (file) {
  const code = fs.readFileSync(file, { encoding: "utf8" });
  const ast = parse(code);
  return new Promise((resolve, reject) => {
    try {
      traverse(ast, {
        MemberExpression(path) {
          let node = path.node;
          //module.exports
          if (node.object.name == "module" && node.property.name == "exports") {
            resolve({
              ast,
              target: path.parent.right,
            });
          }
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};
