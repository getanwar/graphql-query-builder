export const isValidInitialString =
  /^(mutation|query)(?:\s+)?{|^(?!mutation|query)\w+(?:\s+)?(?:{|\()/i;

export const isEmpty = (obj) => Object.keys(obj).length === 0;

export const inSingleLine = (query) =>
  query
    .trim()
    .replace(/\n/g, " ")
    // It is necessary to keep two separate replacements
    .replace(/\s{2,}/g, " ");
