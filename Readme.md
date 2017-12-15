# Tome

A simple, markdown-based wiki, backed by sqlite. It's designed to work for small to medium sized sites, and meet the
needs of anything from an individual to a development group. It has a basic, hierarchical page structure and permission
system, where sub-pages inherit from their parent pages.

## Features

Most of these are planned, any that have been checked off have been implemented.

* [X] Google federated login
* [X] Server
    * [X] Hierarchical wiki pages
    * [X] Hierarchical wiki page permissions
    * [X] Comments on pages
    * [X] Page History
    * [X] Full Text Search
* [ ] UI
    * [ ] Hierarchical wiki pages
    * [ ] Hierarchical wiki page permissions
    * [ ] Comments on pages
    * [ ] Page History
    * [ ] Full Text Search
* [ ] Image Upload/embedding
* [ ] File Attachments (maybe)
* [ ] Branding and Theming
* [ ] Ability to run as a library

## Getting Started

The initial database setup is in `migrations`, just run `npm start` to start the
server and kick off the migrations. The database lives at `server/db/tome.db`
for now.

## TODO:

This is just a rough list of things to do while I get the project going.

* [X] Move over to sqlite for the database
    * [X] Permissions checks in the db
* [X] Add Unit Tests for the rest api
* [ ] Switch to bootstrap-vue for the ui
* [ ] Switch to webpack
* [ ] Use socket.io to inform users when a page they're working on has been edited
* [ ] Use socket.io to update comments when a new one is posted.
