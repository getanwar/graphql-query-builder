# GraphQL Query Builder 

This package for your client application that communicate with a GraphQL server. You can write `gql` flovored syntax for graphql query without having to depend on `graphql` package. It will help to reduce the bundle size.

## Usage

### Installation

To install the package you have to have `.npmrc` file in your project root that contains the following line:
```shell 
@getanwar:registry=https://npm.pkg.github.com
```

Then install: 

```shell
npm install --save @getanwar/graphql-query-builder
```
or 
```shell
yarn add @getanwar/graphql-query-builder
```

### Example
```js
import { buildQuery } from "@getanwar/graphql-query-builder";

const body = buildQuery`query users {
    id name email
}`
// Output 
/*
body = {
    query: `query {
        users {
            id name email
        }
    }`
}
*/
```

The above example is for the most simple graphql query. But you can use this package to create the most complex graphql query/mutation.

```js
import { buildQuery } from "@getanwar/graphql-query-builder";

const input = { id: 1 };
const filter = {
    status: { value: "PUBLISHED", type: "TodoEnum!" }
};
const body = buildQuery`query user(${input}) {
    id
    email
    todos(${filter}) {
        id title
    }
}`
// Output 
/*
body = {
    query: `query my_query($0_id: Int, $1_status: TodoEnum!) {
        user(id: $0_id) {
            id
            email
            todos(status: $1_status) {
                id title
            }
        }
    }`,
    variables: { "0_id": 1,  "1_status": "PUBLISHED" }
}
*/
```

## Syntax

To write graphql query using this package all you need to understand is the syntax. I will go through it here

### Tagged Template
`buildQuery` is a tagged templates function that is exported by this package. You can call this function same way as you would call any tagged template function (eg: `buildQuery`\`\`). 

### Query Arguments
When you need to pass arguments to your query, wrap them into a plain JS object and insert into the template literal. The package will generate variables, create necessary graphql query strings using the variables, and inject them into appropriate place in the final query string. In the result you will receive an object that you can send to your server using any http client.
```js
const body = buildQuery`YOUR_QUERY_STRING`;
const result = await fetch('/graphql', {
    method: "POST",
    body: JSON.stringify(body)
})
```

### Function Returns
The function returns an object of the following properties
```ts
{
    query: string,
    variables: { [key: string]: any }
} 
```
- `query` contains a generated query/mutation string for the graphql server
- `variables` contains all the variables needed for the query/mutation

### Variables
The variables are generated from your input object. You don't need to worry about the number prefixes to the variables, it is added by the package so that it can generate unique variable keys for all your inputs. 

### Input Type
By default the type is inferred from the value of your input if it is a primitive value. You can provide a suitable type for your value. Rather than assigning the value directly to the property, you can assigned an object with the signature `{ value: "VALUE", type: "TYPE" }`

```js
const filter = {
    title: { value: "Task", type: "String!" },
    status: { value: "PUBLISHED", type: "TodoEnum!" },
};
const body = buildQuery`query todos(${filter}) {
    id title
}
```

## Legacy Version - 0.1.0

The API and syntax for legacy version is totally different from current major version (1.0.0). The package won't remove the support for the legacy version, but documentation may not be updated