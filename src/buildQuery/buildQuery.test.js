import { buildQuery } from "./buildQuery";

describe("buildQuery Test", () => {
  it("should return query without args", async () => {
    const body = buildQuery`user{ id name }`;
    expect(body.query).toBe(`query { user{ id name } }`);
  });

  it("should pass when query prefix is given", async () => {
    const body = buildQuery`query { 
      user{} 
    }`;
    expect(body.query).toBe(`query { user{} }`);
  });

  it("should return query with args", async () => {
    const input = { id: 1 };
    const body = buildQuery`user(${input}){}`;
    expect(body.query).toBe(`query my_query($0_id: Int) { user(id: $0_id){} }`);
  });

  it("should return variables", async () => {
    const input = { id: 1 };
    const body = buildQuery`user(${input}){}`;
    expect(body.variables).toStrictEqual({ "0_id": 1 });
  });

  it("should return mutation with args", async () => {
    const input = { name: "my name" };
    const body = buildQuery`mutation { createUser(${input}){ id name } }`;

    expect(body.query).toBe(
      `mutation my_mutation($0_name: String) { createUser(name: $0_name){ id name } }`
    );
  });

  it("should return mutation without selection string", async () => {
    const input = { name: "my name" };
    const body = buildQuery`mutation { createUser(${input}) }`;

    expect(body.query).toBe(
      `mutation my_mutation($0_name: String) { createUser(name: $0_name) }`
    );
  });
});
