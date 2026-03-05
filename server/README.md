# runWRLD Server

A **GraphQL API** for the runWRLD app: running tracks, users, and reviews. The server uses **Apollo Server**, **MongoDB** (via Mongoose), and **JWT** for authentication.

---

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Entry Point (`index.js`)](#entry-point-indexjs)
- [TypeDefs (Schema)](#typedefs-schema)
- [Resolvers](#resolvers)
- [Request Flow](#request-flow)
- [Project Structure](#project-structure)
- [Environment & Running](#environment--running)

---

## High-Level Architecture

```
Client (React)  →  Apollo Server (GraphQL)  →  Resolvers  →  Mongoose Models  →  MongoDB
                        ↑
                  context (user from JWT)
```

- **GraphQL** defines one API surface: types, queries, and mutations.
- **Resolvers** implement each field and operation (they talk to the DB).
- **TypeDefs** are the schema: they describe what the API exposes and what clients can request.

---

## Entry Point (`index.js`)

The entry point wires everything together and starts the server.

### What it does

1. **Loads environment**  
   `dotenv.config()` loads variables from `.env` (e.g. `MONGODB_URI`, `PORT`, `JWT_SECRET`).

2. **Connects to the database**  
   `connectDB()` (from `config/db.js`) connects to MongoDB. The actual `mongoose.connect()` call happens again in the startup chain so that the server only listens after the DB is ready.

3. **Builds the Apollo Server**  
   - **typeDefs** – merged schema from `graphql/typedefs.js`.  
   - **resolvers** – merged resolvers from `graphql/resolvers.js`.  
   - **cors: true** – allows browser clients on other origins to call the API.  
   - **context** – runs on every request:
     - Reads `Authorization` header (JWT).
     - Calls `authMiddleware(token)` to verify the token and decode the payload (e.g. `{ id: userId }`).
     - Puts the result in `context.user` (or `null` if no/invalid token). Resolvers use this for “current user” and auth checks.

4. **Starts listening**  
   - Connects to MongoDB.  
   - On success, starts the Apollo Server (default port 4000).  
   - On failure, logs the error (and does not start the server).

So: **env → DB connection → Apollo (schema + resolvers + auth context) → listen**.

---

## TypeDefs (Schema)

TypeDefs define the **GraphQL schema**: types, inputs, and the operations (queries and mutations) the API supports. They live under `graphql/` and are merged in `graphql/typedefs.js`.

### Why split by domain?

TypeDefs are split by **domain** (users, tracks, reviews) so that:

- Each domain owns its own types and operations.
- The schema stays maintainable as the app grows.
- You can reason about “everything about tracks” in one place (tracks typedefs + track resolvers).

### Base schema (`graphql/typedefs.js`)

GraphQL requires at least one `Query` and one `Mutation` type. The **base** schema defines empty placeholders:

```graphql
type Query {
  _empty: String
}
type Mutation {
  _empty: String
}
```

Domain modules **extend** these with `extend type Query` and `extend type Mutation`. Apollo merges all of them into a single schema. The `_empty` field is never used; it only satisfies the requirement that `Query` and `Mutation` exist before any `extend`.

### Domain typedefs

- **`users/user.typedefs.js`**  
  - `User`, `AuthPayload`, `RegisterInput`.  
  - Extends `Query` with `me`.  
  - Extends `Mutation` with `register`, `login`, `updateProfile`, `updatePassword`, `logout`, `deleteUser`.

- **`tracks/track.typedefs.js`**  
  - Types: `Coordinates`, `Location`, `Track`, `TrackStatusUpdate`, `TrackPhoto`, `VerifiedInfo`.  
  - Inputs: `AddTrackInput`, `UpdateTrackInput`.  
  - Extends `Query` with `track`, `tracks`, `tracksNearby`, `searchTracks`.  
  - Extends `Mutation` with `addTrack`, `updateTrack`, `addTrackPhoto`, `addStatusUpdate`.

- **`reviews/review.typedefs.js`**  
  - `Review`, `AddReviewInput`, `UpdateReviewInput`.  
  - Extends `Track` with `reviews`, `averageRating`; extends `User` with `reviews`.  
  - Extends `Query` with `review`, `trackReviews`.  
  - Extends `Mutation` with `addReview`, `updateReview`, `deleteReview`.

### Reasoning for specific type choices

- **`Location` with `coordinates: [Float]!`** – Matches GeoJSON order `[longitude, latitude]` used by MongoDB’s `2dsphere` index and `$near` queries.  
- **Input types (`AddTrackInput`, etc.)** – Group mutation arguments into a single input so the API is clear and easy to extend.  
- **References like `User`, `Track` in types** – Allow the client to request nested data (e.g. `addedBy { username }`); resolvers then implement those nested fields (see [Resolvers](#resolvers)).

The **merged** schema is the array:  
`[baseTypeDefs, userTypeDefs, trackTypeDefs, reviewTypeDefs]` exported from `graphql/typedefs.js`.

---

## Resolvers

Resolvers are **functions that implement** each field and operation in the schema. They run when the client sends a query or mutation and are responsible for loading/updating data (usually via Mongoose) and enforcing auth.

### Merging in `graphql/resolvers.js`

Apollo expects one resolver map. This project builds it by merging domain resolver objects:

- **Query** – spread: `userResolvers.Query`, `trackResolvers.Query`, `reviewResolvers.Query`.
- **Mutation** – same idea for `Mutation`.
- **Type resolvers (field resolvers)** – `Track`, `User`, `Review` each get their fields from the corresponding domain (e.g. `Track.addedBy`, `Track.reviews`, `Track.averageRating` from track and review resolvers).

So one logical “resolver map” is composed from users, tracks, and reviews.

### Resolver signature and context

A resolver typically receives:

- **First argument (`parent`)** – The parent object (for field resolvers on `Track`, `User`, `Review`); unused for root `Query`/`Mutation`.
- **Second argument (`args`)** – Arguments for the field (e.g. `id`, `input`, `trackId`).
- **Third argument (`context`)** – The object built in `index.js`; always includes `context.user` (decoded JWT or `null`).

Example: `addTrack(_, { input }, context)` uses `context.user` to require login and to set `addedBy`.

### Query resolvers

- **tracks, track, tracksNearby, searchTracks** – Implemented in `track.resolvers.js`.  
  - `tracksNearby` uses Mongoose `$near` with a `2dsphere` index and converts miles to meters.  
  - `searchTracks` uses a case-insensitive regex on `name`.
- **me** – In `user.resolvers.js`; returns the current user from `context.user.id` or `null`.
- **review, trackReviews** – In `review.resolvers.js`; fetch one review or all reviews for a track.

### Mutation resolvers

- **Auth**: `register`, `login` – Create/find user, hash password (User model pre-save), compare with bcrypt, return JWT + user.
- **Tracks**: `addTrack`, `updateTrack`, `addTrackPhoto`, `addStatusUpdate` – All require `context.user`; they create/update the Track document or embedded arrays (e.g. `photos`, `statusUpdates`).
- **Reviews**: `addReview`, `updateReview`, `deleteReview` – Require auth; update/delete also check that `review.user` matches `context.user.id`.

Protected mutations throw if `!context.user` (e.g. `"Authentication required"`).

### Type (field) resolvers

When the client asks for nested fields, Apollo calls the right type resolver:

- **Track**  
  - `addedBy` → load `User` by `parent.addedBy`.  
  - `reviews` → load `Review` where `track === parent.id`.  
  - `averageRating` → same reviews, then compute average (rounded).
- **Review**  
  - `user` → load `User` by `review.user`.  
  - `track` → load `Track` by `review.track`.
- **User**  
  - `reviews` (from review typedefs) → load `Review` where `user === parent.id`.

So the **schema** says “a Track has `addedBy: User`”; the **resolver** says “to get `addedBy`, fetch the User by `parent.addedBy`.” That’s how typedefs and resolvers work together.

---

## Request Flow

1. Client sends an HTTP request to the Apollo endpoint (e.g. `POST /graphql`) with a GraphQL body and optional `Authorization: Bearer <JWT>`.
2. Apollo parses the query/mutation and builds a context (including `authMiddleware(token)` → `context.user`).
3. For each field in the selection set, Apollo looks up the resolver (Query/Mutation for roots, then type resolvers for nested fields).
4. Resolvers run: they can use `context.user`, call Mongoose (e.g. `Track.find()`, `User.findById()`), and return data or throw.
5. Apollo assembles the result and returns JSON.

So: **HTTP → context (auth) → resolvers → models → MongoDB → response**.

---

## Project Structure

```
server/
├── index.js                 # Entry point: env, DB, Apollo Server, context, listen
├── config/
│   └── db.js                # MongoDB connection (used at startup)
├── middleware/
│   └── auth.js              # JWT verification → { id } or null
├── models/
│   ├── User.js              # User schema + password hashing
│   ├── Track.js             # Track schema + 2dsphere index
│   └── Review.js            # Review schema + unique (user, track)
└── graphql/
    ├── typedefs.js          # Merges base + user + track + review typedefs
    ├── resolvers.js         # Merges Query, Mutation, Track, User, Review resolvers
    ├── index.js             # Re-exports typeDefs + resolvers (optional entry)
    ├── users/
    │   ├── user.typedefs.js
    │   └── user.resolvers.js
    ├── tracks/
    │   ├── track.typedefs.js
    │   └── track.resolvers.js
    └── reviews/
        ├── review.typedefs.js
        └── review.resolvers.js
```

- **Entry point** = `index.js`.  
- **Schema** = merged typedefs (base + domains).  
- **Behavior** = merged resolvers (roots + type resolvers).  
- **Persistence** = Mongoose models and MongoDB.

---

## Environment & Running

- **.env** (create from example): `MONGODB_URI`, `PORT`, `JWT_SECRET`.
- **Start**: `npm run start` (or `npm run dev` with nodemon).

GraphQL Playground (or any GraphQL client) can target `http://localhost:4000` (or your `PORT`) to run queries and mutations. Send the JWT in the `Authorization` header for protected operations.
