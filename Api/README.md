# GamesWithFriends Api

## install prisma
- brew tap prisma/prisma
- brew install prisma

## install docker

## fire up the container
- nav to the code directory
- docker-compose up -d

it's now running and hosting the db via http://localhost:4466


## editing the db schema
when you make a change, you have to deploy it to prisma and then ask prisma to generate the new mutations and queries:
- make the change in the schema file
- prisma deploy
- prisma generate

