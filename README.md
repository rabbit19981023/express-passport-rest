# Express Passport RESTful

Auth example using Express, Passport, Passport-Local, Prisma, Redis, etc.

## Setup

1. install dependencies:

```bash
$ npm install
```

2. create `.env` file:

```bash
$ cp .env.example .env
```

3. apply migrations to database:

```bash
$ npm run migrate:dev
```

4. run app:

```bash
$ npm run start
```

- run app in watch mode:

```bash
$ npm run dev
```


- lint code:

```bash
$ npm run lint
```

## Usage

- create roles (user | admin):

```bash
$ curl -X POST --data "role=<user | admin>" localhost/api/v1/auth/roles
```

- login (user | admin):

```bash
$ curl -X POST --data "username=<username>&password=<password>" localhost/api/v1/auth/login/<user | admin>
```

- signup (user | admin):

```bash
$ curl -X POST --data "username=<username>&password=<password>" localhost/api/v1/auth/signup/<user | admin>
```

- logout:

```bash
$ curl -X POST localhost/api/v1/auth/logout
```
