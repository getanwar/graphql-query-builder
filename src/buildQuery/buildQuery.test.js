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
    const input = { id: 1, status: { value: "ACTIVE", type: "StatusEnum!" } };
    const body = buildQuery`user(${input}){}`;
    expect(body.variables).toStrictEqual({ "0_id": 1, "0_status": "ACTIVE" });
  });

  it("should throw an error for invalid input", async () => {
    const input = { id: 1, status: [1, 2], fn: function () {} };

    expect(() => buildQuery`user(${input}){}`).toThrow(
      "The value is not in acceptable format for status"
    );
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

  it("should return query with multiple args", () => {
    const input = { id: 1, name: "John" };
    const body = buildQuery`user(${input}){}`;
    expect(body.query).toBe(
      "query my_query($0_id: Int, $0_name: String) { user(id: $0_id, name: $0_name){} }"
    );
    expect(body.variables).toEqual({ "0_id": 1, "0_name": "John" });
  });

  it("should throw an error for invalid initial string", () => {
    expect(() => {
      buildQuery`invalid query`;
    }).toThrow("The query string is not valid");
  });

  it("should return mutation with multiple args", () => {
    const input = { id: 1, name: "John" };
    const body = buildQuery`mutation { updateUser(${input}) }`;
    expect(body.query).toBe(
      "mutation my_mutation($0_id: Int, $0_name: String) { updateUser(id: $0_id, name: $0_name) }"
    );
  });

  it("should return mutation with nested arguments", () => {
    const input = {
      id: 1,
      profile: {
        type: "UserProfileInput",
        value: { age: 30, email: "john@example.com" },
      },
    };
    const body = buildQuery`mutation { updateUser(${input}) }`;
    expect(body.query).toBe(
      "mutation my_mutation($0_id: Int, $0_profile: UserProfileInput) { updateUser(id: $0_id, profile: $0_profile) }"
    );
    expect(body.variables).toEqual({
      "0_id": 1,
      "0_profile": { age: 30, email: "john@example.com" },
    });
  });

  it("should return mutation with multiple nested arguments", () => {
    const input = {
      id: 1,
      profile: {
        type: "UserProfileInput",
        value: { age: 30, email: "john@example.com" },
      },
      address: {
        type: "AddressInput",
        value: { city: "New York", country: "USA" },
      },
    };
    const body = buildQuery`mutation { updateUser(${input}) }`;
    expect(body.query).toBe(
      "mutation my_mutation($0_id: Int, $0_profile: UserProfileInput, $0_address: AddressInput) { updateUser(id: $0_id, profile: $0_profile, address: $0_address) }"
    );

    expect(body.variables).toEqual({
      "0_id": 1,
      "0_profile": { age: 30, email: "john@example.com" },
      "0_address": { city: "New York", country: "USA" },
    });
  });
});
