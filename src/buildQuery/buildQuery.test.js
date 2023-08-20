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
    expect(body.query).toBe(`query my_query($id_0: Int) { user(id: $id_0){} }`);
  });

  it("should return variables", async () => {
    const input = { id: 1, status: { value: "ACTIVE", type: "StatusEnum!" } };
    const body = buildQuery`user(${input}){}`;
    expect(body.variables).toStrictEqual({ id_0: 1, status_0: "ACTIVE" });
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
      `mutation my_mutation($name_0: String) { createUser(name: $name_0){ id name } }`
    );
  });

  it("should return mutation without selection string", async () => {
    const input = { name: "my name" };
    const body = buildQuery`mutation { createUser(${input}) }`;

    expect(body.query).toBe(
      `mutation my_mutation($name_0: String) { createUser(name: $name_0) }`
    );
  });

  it("should return query with multiple args", () => {
    const input = { id: 1, name: "John" };
    const body = buildQuery`user(${input}){}`;
    expect(body.query).toBe(
      "query my_query($id_0: Int, $name_0: String) { user(id: $id_0, name: $name_0){} }"
    );
    expect(body.variables).toEqual({ id_0: 1, name_0: "John" });
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
      "mutation my_mutation($id_0: Int, $name_0: String) { updateUser(id: $id_0, name: $name_0) }"
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
      "mutation my_mutation($id_0: Int, $profile_0: UserProfileInput) { updateUser(id: $id_0, profile: $profile_0) }"
    );
    expect(body.variables).toEqual({
      id_0: 1,
      profile_0: { age: 30, email: "john@example.com" },
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
      "mutation my_mutation($id_0: Int, $profile_0: UserProfileInput, $address_0: AddressInput) { updateUser(id: $id_0, profile: $profile_0, address: $address_0) }"
    );

    expect(body.variables).toEqual({
      id_0: 1,
      profile_0: { age: 30, email: "john@example.com" },
      address_0: { city: "New York", country: "USA" },
    });
  });
});
