# runWRLD

## Description

A full-stack track discovery application for athletes looking for nearby tracks for workouts. This application
will allow users to find track and field stadiums based on city, state or zip code, view if the track is public or private, and allow users to save the track to their account. Details about the track can be updated based on user feedback.

## Tech Stack

- **Frontend**: React, Vite, Tailwind, Apollo Client
- **Backend**: Node.js, Express, Apollo Server, GraphQL
- **Database**: MongoDB, Mongoose
- **APIs**: Geoapify (Search), Leaflet (Map Visuals)
- **Auth**: JSON Web Token (JWT)

## Key Features

- **Dynamic Track Discovery**: Integration with Geoapify to fetch local tracks based on user location.
- **GraphQL API**: A custom-built handling "Find or Create" logic to prevent duplicate database entries.
- **Personalized Profiles**: Secure user accounts where athletes can save verified tracks to their personal dashboard.
- **Responsive UI**: Mobile-first design inspired by modern fitness apps like Strava.

## Technical Deep Dive

One of the primary engineering challenges was preventing duplicate database entries when multiple users "saved" the same location from the Geoapify results.

A "Find or Create" logic was implemented within the `addTrack` mutation. Before a new track document is generated, the server performs a coordinate-based lookup. This ensures that the `$addToSet` operator in MongoDB always receives a consistent Object ID, maintaining a clean and efficient database.
