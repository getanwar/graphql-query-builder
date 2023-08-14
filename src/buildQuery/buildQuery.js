import isObject from "../util/isObject";
import { inSingleLine, isEmpty, isValidInitialString } from "../util/utils";

function typeOf(value) {
  let type = typeof value;

  if (isObject(value)) {
    if (value.type) return value.type;
    type = typeof value.value;
  }

  return {
    number: "Int",
    string: "String",
    boolean: "Boolean",
  }[type];
}

function processArgsList(argsList) {
  const variables = {};
  const queryStrings = [];
  const argsStrings = argsList.map((args, idx) => {
    const argsString = [];

    for (let key in args) {
      const value = args[key];
      const type = typeOf(value);
      const variableName = `${idx}_${key}`;

      if (!type) {
        throw new Error(`\`type\` is not defined for \`${key}\` property`);
      }

      variables[variableName] = value;
      queryStrings.push(`$${variableName}: ${type}`);
      argsString.push(`${key}: $${variableName}`);
    }

    return argsString.join(", ");
  });

  return {
    variables,
    argsStrings,
    varString: queryStrings.join(", "),
  };
}

function constructString(strings, argsStrings) {
  const resultString = strings
    .map((string, position) => {
      return string + (argsStrings[position] || "");
    })
    .join("");

  const firstPartPat = /^(mutation|query)\s+{/;
  if (firstPartPat.test(strings[0].trim())) {
    return resultString.replace(firstPartPat, "").replace(/}$/, "");
  }
  return resultString;
}

export function buildQuery(strings, ...argsList) {
  const initialString = strings[0].trim();

  if (!isValidInitialString.test(initialString)) {
    throw new Error("The query string is not valid");
  }

  const isMutation = /^mutation\s+{/.test(initialString);
  const queryType = isMutation ? "mutation" : "query";
  const { variables, argsStrings, varString } = processArgsList(argsList);
  const queryString = varString ? `my_${queryType}(${varString})` : "";
  const query = `${queryType} ${queryString} {
    ${constructString(strings, argsStrings)}
  }`;

  const result = { query: inSingleLine(query) };
  if (!isEmpty(variables)) result.variables = variables;

  return result;
}
