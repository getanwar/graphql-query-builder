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
  const variableStack = multiQueryOptions.reduce(
    (stack, next) => Object.assign(stack, ...getVarEntries(next.args)),
    {}
  );
  const queries = multiQueryOptions.map(makeSingleQuery).join("\n");
  const variables = regenarateVariables(Object.entries(variableStack));
  const typeArgs = Object.entries(variableStack)
    .map(makeQueryTypeString)
    .filter((v) => v != null) // to filter out null and undefined values
    .join(", ");
  const typeArgsWrap = typeArgs ? `(${typeArgs})` : "";

  // Regenerating variable if value is provided in `Args` format
  const groupQueryName = multiQueryOptions
    .map((obj) => obj.queryName)
    .join("_");

  // finally creating the query string
  const query = `${queryType}${groupQueryName}${typeArgsWrap} {
        ${queries}
    }`;
  return { query, variables };
};

export default buildQuery;

function makeSingleQuery(option) {
  const { args = {}, ...restOfArgs } = option;
  const queryFilters = Object.entries(args)
    .map(makeQueryParamString)
    .filter((v) => v != null) // to filter out null and undefined values
    .join(", ");
  return generateQueryString({ queryFilters, ...restOfArgs });
}

function getVarEntries(args) {
  return Object.entries(args).map(([prop, value]) => {
    if (isObject(value) && value.key) {
      const nextValue = { ...value };
      const { key } = nextValue;
      delete nextValue.key;
      return { [key]: nextValue };
    }

    return { [prop]: value };
  });
}

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
  if (Array.isArray(value)) {
    const [firstItem] = value;
    return `[${getType(firstItem)}]`;
  }

  const type = {
    number: "Int",
    string: "String",
    boolean: "Boolean",
  }[typeof value];

  return type;
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

function generateQueryString({ queryName, alias, queryFilters, select }) {
  alias = alias ? `${alias}:` : "";
  const filterArgsWrap = queryFilters ? `(${queryFilters})` : "";
  const returnWrap = select ? `{ ${select} }` : "";
  return `${alias}${queryName}${filterArgsWrap} ${returnWrap}`;
}
