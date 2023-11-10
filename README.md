# Hilton Reservation App (keystone + apollo)
## Introduction
When I came across the Keystone stack, I found it intriguing. After exploring the documentation website, my interest only deepened. I have decided to utilize this tech stack for revamping the reservation app.

On one hand, the concept of this headless CMS is fascinating, and I am eager to delve into every aspect of it.

On the other hand, considering it's Hilton's choice, seizing this opportunity will allow me to acquaint myself with the tech stack beforehand.

While the app may not be flawless, it demonstrates my ability to navigate and work with this tech stack effectively.

## Tech Stack Overview
- Backend: keystone6 (https://keystonejs.com/)
- Frontend: Remix (https://remix.run/)
- Database: sqlite
- Monorepos Tool: Lerna (https://lerna.js.org/)

## Functions
- Staffs can manage restaurants (keystone admin UI, Only) ✅.
- Staffs can manage tables (keystone admin UI, Only) ✅.
- Staffs can manage reservations (keystone admin UI, Only) ✅.
- Staffs can manage guests (keystone admin UI, Only) ✅.
- Guests can see own reservations (webapp) ✅.
- Guests can create new reservations (webapp) ✅.
- Guests can update exist reservations (webapp) ✅.

## TODO
- A jwt auth should be integrated.
- Staffs can manage the reservation status on the webapp.
- Guests can manage the reservation status on the webapp.
- Loading animation.
- Error handling.

## Start to develop
### Install dependencies
```shell
npm i
```
### Run the backend app
```shell
npm run keystone:dev
```
- graph server: http://localhost:3000/api/graphql
- admin UI: http://localhost:3000

#### Developing the backend
1. Open the file `/packages/keystone/schema.ts`.
2. Follow the document website to update the list in this file.
3. The framework will auto generate everything it needs.
4. Visit the admin UI to verify your work.

### Run the frontend app
```shell
npm run remix:dev
```
- url: http://localhost:3003

#### Developing the frontend
1. Find the page you need to update in `/packages/remix/app/routee/`.
2. Follow the React guidance to develop your imagination.
3. Visit the webapp url on browser to check your work.
