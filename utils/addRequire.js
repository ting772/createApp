module.exports = async function (ast, requireNode) {
  let index = ast.program.body.findIndex(
    (item) => item.type != "VariableDeclaration"
  );

  ast.program.body.splice(index, 0, requireNode);
};
