// Manual Test

import buildQuery from "../query";

var a = buildQuery([
  {
    queryName: "a",
    alias: "abul",
    args: { id: { value: 1, type: "Int" }, perPage: 1 },
  },
  {
    queryName: "a",
    alias: "billal",
    args: { id: { value: 2, type: "Int" }, site: 2 },
  },
]);

console.log("ANWARN", a);
