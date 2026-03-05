import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: import.meta.env.DEV ? "/graphql" : "http://localhost:4000/graphql",

  headers: {
    authorization: localStorage.getItem("id_token")
      ? `Bearer ${localStorage.getItem("id_token")}`
      : "",
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
