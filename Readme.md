# Tome

A simple, markdown-based wiki, backed by sqlite. It's designed to work for small to medium sized sites, and meet the
needs of anything from an individual to a development group. It has a basic, hierarchical page structure and permission
system, where sub-pages inherit from their parent pages.

In terms of "size", Tome should be usable for anything even up to Wikipedia sizes; assuming that your sqlite db file 
doesn't grow beyond the limits of your filesystem. Practically, however, you'll want to keep the DB down around the 
tens of gigabytes range.

Tome's real limitation is concurrent users. By default it's just a single node process, running a single sqlitedb. It 
would be entirely possible to scale (and even to swap sqlite for any other DB supported by [knex.js][knex] with json 
support) and actually handle Wikipedia levels of traffic... but that is not what the goal of the project is. The 
technology is all there, and it'd even be straight forward to deploy as such... but there are already solutions that 
fill that need.

Tome's core strength is in being lightweight, portable, and trivial to deploy.

## Features

To see the current list of features and their progress, please check out issue [#1][issue-1].

## Getting Started

The initial database setup is in `migrations`, just run `npm start` to start the
server and kick off the migrations. The database lives at `server/db/tome.db`
for now.

## Contributing

Contributions are welcome. I ask that you follow the same formatting as the rest of the project. You will need to 
ensure all tests pass before I will look at your merge request.

## TODO:

This is just a rough list of things to do while I get the project going.

* [X] Move over to sqlite for the database
    * [X] Permissions checks in the db
* [X] Add Unit Tests for the rest api
* [X] Switch to bootstrap-vue for the ui
* [X] Switch to ~~webpack~~parceljs
* [ ] Use socket.io to inform users when a page they're working on has been edited
* [ ] Use socket.io to update comments when a new one is posted.

[issue-1]: https://gitlab.com/skewed-aspect/tome/issues/1
[knex]: https://knexjs.org

