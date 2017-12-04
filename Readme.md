# Tome

A simple wiki.

## Getting Started

The initial database setup is in `migrations`, just run `npm start` to start the
server and kick off the migrations. The database lives at `server/db/tome.db`
for now.

## TODO:

* [] Move over to sqlite for the database
    * [] Permissions checks in the db
* [] Switch to vuetify for the ui
* [] Switch to webpack
* [] Use socket.io to inform users when a page they're working on has been edited
* [] Use socket.io to update comments when a new one is posted.
