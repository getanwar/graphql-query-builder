import isObject from "./util/isObject";
/**
 * @typedef {Object} Args
 * @property {any} value
 * @property {String} type
 * @property {String} [key]
 *
 * @typedef {Object} Options
 * @property {Object<Args>} [args] args can be an object of values or an object of `Args` type which contains value, type and key properties
 * @property {String} [select]
 * @property {String} queryName
 *
 * @param {Array<Options>|Options} options
 * @param {Boolean} [mutation]
 */
const buildQuery = (options, mutation = false) => {
  const multiQueryOptions = isObject(options) ? [options] : options;
  const queryType = mutation ? `mutation ` : `query `;
  let variableStack = multiQueryOptions.reduce(
    (stack, next) => Object.assign(stack, next.args),
    {}
  );
  const typeArgs = Object.entries(variableStack)
    .map(makeQueryTypeString)
    .filter((v) => v != null) // to filter out null and undefined values
    .join(", ");
  const typeArgsWrap = typeArgs ? `(${typeArgs})` : "";

  // Regenerating variable if value is provided in `Args` format
  variableStack = regenarateVariables(Object.entries(variableStack));
  const groupQueryName = multiQueryOptions
    .map((obj) => obj.queryName)
    .join("_");

  const queries = multiQueryOptions
    .map((obj) => {
      const { queryName, args = {}, select } = obj;
      const queryFilters = Object.entries(args)
        .map(makeQueryParamString)
        .filter((v) => v != null) // to filter out null and undefined values
        .join(", ");
      return generateQueryString(queryName, queryFilters, select);
    })
    .join("\n");

  // finally creating the query string
  const query = `${queryType}${groupQueryName}${typeArgsWrap} {
        ${queries}
    }`;
  return { query, variables: variableStack };
};

/**
 * Regenerates graphQL variables
 * This funciton helps if value is provided as an object format
 * where two keys must present: type and value
 * `type` represents the type of a param
 * `value` represents the value of a param
 * @param {Array} entries
 */
function regenarateVariables(entries) {
  const formatKeyVal = ([prop, entry]) => {
    if (entry === undefined) return;
    if (isObject(entry)) {
      const { key, value } = entry;
      if (value === undefined) return;
      return typeof key === "string" ? [key, value] : [prop, value];
    }
    return [prop, entry];
  };
  const result = {};
  entries
    .map(formatKeyVal)
    .filter((val) => val)
    .forEach(([prop, val]) => (result[prop] = val));
  return result;
}

function makeQueryParamString([prop, entry]) {
  let key = prop;
  if (entry == null) return "";
  if (isObject(entry)) {
    if (entry.value == null) return "";
    key = typeof entry.key == "string" ? entry.key : prop;
  }
  return `${prop}: $${key}`;
}

/**
 * Determine the type of provided value for graphql param
 * @param {*} value
 * @returns {String}
 */
function getType(value) {
  if (typeof value === "number") {
    return "Int";
  } else if (typeof value === "string") {
    return "String";
  } else if (typeof value === "boolean") {
    return "Boolean";
  } else if (Array.isArray(value)) {
    let arrayItemType = getType(value[0]);
    return `[${arrayItemType}]`;
  }
  return "";
}

function makeQueryTypeString([prop, value]) {
  if (value == null) return "";
  let argTypeString = getType(value);
  let key = prop;
  if (isObject(value)) {
    if (value.value == null) return "";
    argTypeString = value.type;
    key = typeof value.key == "string" ? value.key : prop;
  }
  if (argTypeString) {
    argTypeString = `$${key}: ${argTypeString}`;
  }
  return argTypeString;
}

function generateQueryString(queryName, queryFilters, returns) {
  const filterArgsWrap = queryFilters ? `(${queryFilters})` : "";
  const returnWrap = returns ? `{ ${returns} }` : "";
  return `${queryName}${filterArgsWrap} ${returnWrap}`;
}

export default buildQuery;