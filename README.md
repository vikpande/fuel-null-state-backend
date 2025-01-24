# Null State Backend

Null State Backend is a robust and scalable API built using Express.js. It leverages Prisma as the ORM for seamless database interactions with MySQL.

## Features

- RESTful API architecture
- MySQL database integration via Prisma
- Easy-to-extend codebase
- Environment-based configuration

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [MySQL](https://www.mysql.com/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vikpande/fuel-null-state-backend
   cd fuel-null-state-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory with the following content:

   ```env
   DATABASE_URL="mysql://<username>:<password>@<host>:<port>/<database-name>"
   PORT=3001
   ```

   Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database-name>` with your MySQL database credentials.

4. Initialize the database:

   Run the following command to generate and apply Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

   To view and modify the Prisma schema, check the `prisma/schema.prisma` file.

## Running the API

1. Start the development server:

   ```bash
   npm run start
   # or
   yarn start
   ```

2. The API will be available at [http://localhost:3000](http://localhost:3000) (or the port specified in the `.env` file).

## Scripts

- `npm run dev` - Start the development server with hot reload.
- `npm run build` - Build the project for production.
- `npm start` - Start the production server.
- `npx prisma studio` - Open Prisma Studio to manage your database visually.

## Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Ensure your production environment has the `.env` file properly configured.

## Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)