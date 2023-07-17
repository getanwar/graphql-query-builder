function typeOf(value) {
  const type = typeof value;
  const types = [
    ["number", "Int"],
    ["string", "String"],
  ];
  const typeMap = new Map(types);
  return typeMap.get(type);
}

function buildQuery(strings, ...argsList) {
  function processArgsList(argsList) {
    const variables = {};
    const queryStrings = [];
    const argsStrings = argsList.map((args, idx) => {
      const argsString = [];

      for (let key in args) {
        const value = args[key];
        const type = typeOf(value);
        const variableName = `${idx}_${key}`;

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

  const { variables, argsStrings, queryString } = processArgsList(argsList);

  const validQueryOrMutationSyntax = /^(?:mutation|query)\s?{/;
  console.log(validQueryOrMutationSyntax.test(strings[0]));

  const query = `query my_query(${queryString}) {
          ${strings.map((str, idx) => str + (argsStrings[idx] || "")).join("")}
      }`;

  console.log({ query, variables });
}

// test data
const userInput = {
  page: 0,
  perPage: 0,
};

const siteInput = {
  page: 1,
  perPage: 1,
};

const userInput2 = {
  page: 2,
  perPage: 2,
};

const siteInput2 = {
  page: 3,
  perPage: 3,
};

var queryString = buildQuery`query { 
    users(${userInput}) {
      id
      name
      sites {
          id
          domain
      }
  }}`;
