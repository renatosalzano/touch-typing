const isOperation = (str: string) => {};

const MATCH_ASSIGNAMENT_OPERATOR =
  /(\++|--|delete)(this\.)+[a-z0-9\[\]]*|(this\.)+[a-z0-9\[\]]*(\++|--){2}|(this\.)+[a-z0-9\[\]]*(.\={1,3})|(this\.)+[a-z0-9\[\]]*(\.push|map|splice|reverse|sort|pop|shift)/gi;

const IS_COMPARISON_OPERATOR = /(?:([!<>])[=]{1}|[=]{2,3})/g;

function parseFunction(func: any) {
  func = func.toString();
  func = func.substring(func.indexOf("{") + 1, func.lastIndexOf("}"));
  func = func.replaceAll(/\s/g, "");
  return func as string;
}

export const getActionDependencies = (func: Function) => {
  const dependencies: string[] = [];
  const funcBody = parseFunction(func);

  const match = funcBody.match(MATCH_ASSIGNAMENT_OPERATOR);
  if (match) {
    match.forEach((dep) => {
      if (!IS_COMPARISON_OPERATOR.test(dep)) {
        const regex = /\bthis.\b[a-z0-9]*/gi;
        regex.test(dep);
        const fristIndex = dep.indexOf(".") + 1;
        const lastIndex = regex.lastIndex;
        dep = dep.substring(fristIndex, lastIndex);
        if (!dependencies.includes(dep)) {
          dependencies.push(dep);
        }
      }
    });
  }
  console.log(dependencies);

  return dependencies;
};

export const getComputedDependencies = (func: Function) => {};
