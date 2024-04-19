## Description

Test Assignment

## Installation

```bash
$ npm install
```

## Setup
Add these environment variables
```
SLOT_DURATION=30
MAX_SLOT=5
START_TIME=9
END_TIME=18
OPERATIONAL_DAYS=monday,tuesday,wednesday,thursday,friday
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database
I choose NoSQL because I think this application will need to do lot of searching, and not a lot of dependency to other data.
The potential problem would be conflicting data write since it's using Eventually Consistency concept.