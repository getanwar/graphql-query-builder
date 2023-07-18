import isObject from "./util/isObject";
import { isValidInitialString } from "./util/utils";

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
    queryString: queryStrings.join(", "),
  };
}

function constructString(strings, argsStrings) {
  const initialString = strings[0].trim().replace(/^(mutation|query)\s+{/, "");
  return strings
    .map(
      (string, position) =>
        (position === 0 ? initialString : string) +
        (argsStrings[position] || "")
    )
    .join("");
}

export function buildQuery(strings, ...argsList) {
  const initialString = strings[0].trim();

  if (!isValidInitialString.test(initialString)) {
    throw new Error("The query string is not valid");
  }

  const isMutation = /^mutation\s+{/.test(initialString);
  const queryType = isMutation ? "mutation" : "query";
  const { variables, argsStrings, queryString } = processArgsList(argsList);
  const query = `${queryType} my_${queryType}(${queryString}) {
    ${constructString(strings, argsStrings)}
  }`;

  return { query, variables };
}

// test data
const userInput = {
  page: { value: 1 },
  perPage: "0",
};
const siteInput = {
  page: { value: "2" },
  perPage: "2",
};

var queryString = buildQuery`a(${userInput}) {
      id
      name
      sites(${siteInput}) {
          id
          domain
      }
  }}`;

console.log(queryString);
