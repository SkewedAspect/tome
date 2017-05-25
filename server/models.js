//----------------------------------------------------------------------------------------------------------------------
// Database models for PokemonGoCompanion
//
// @module models
//----------------------------------------------------------------------------------------------------------------------

const base62 = require('base62');
const uuid = require('uuid');

const connect = require('thinky');
const config = require('../config');

//----------------------------------------------------------------------------------------------------------------------

const thinky = connect(config.rethink);
const type = thinky.type;
const r = thinky.r;

const db = { r, type, errors: thinky.Errors };

//----------------------------------------------------------------------------------------------------------------------

// This generates nice, short ids (ex: 'HrILY', '2JjA9s') that are as unique as a uuid.
function shortID()
{
    return base62.encode(new Buffer(uuid.v4(null, [])).readUInt32LE(0));
} // end shortID

//----------------------------------------------------------------------------------------------------------------------

db.Account = thinky.createModel('accounts', {
    id: type.string().default(shortID),
    displayName: type.string(),
    name: type.string(),
    givenName: type.string(),
    avatar: type.string(),
    email: type.string(),
    googleID: type.string(),
    created: type.date().default(() => new Date()),
    permissions: type.array().schema(type.string()).default([]),
    groups: type.array().schema(type.string()).default([]),
    settings: type.object().default({})
});

db.Account.ensureIndex('googleID');
db.Account.ensureIndex('displayName');
db.Account.ensureIndex('email');

//----------------------------------------------------------------------------------------------------------------------

db.Group = thinky.createModel('groups', {
    id: type.string().default(shortID),
    name: type.string().required(),
    description: type.string(),
    permissions: type.array().schema(type.string()).required()
}, { enforce_extra: "remove" });

db.Group.ensureIndex('name');

//----------------------------------------------------------------------------------------------------------------------

db.Comments = thinky.createModel('comments', {
    id: type.string().default(shortID),
    title: type.string().required(),
    pageID: type.string().required(),
    content: type.string().required(),
    replies: [{
        id: type.string().default(shortID),
        content: type.string().required(),
        created: type.date().default(() => new Date()),
        edited: type.date(),
        user: type.string().required()
    }],
    actions: {
        reply: type.string().default('inherit')
    },
    created: type.date().default(() => new Date()),
    edited: type.date(),
    user: type.string().required()
}, { enforce_extra: "remove" });

db.Comments.ensureIndex('pageID');
db.Comments.ensureIndex('title');

//----------------------------------------------------------------------------------------------------------------------

db.Page = thinky.createModel('pages', {
    id: type.string().default(shortID),
    title: type.string().required(),
    path: type.string().required(),
    revisions: [{
        id: type.string().default(shortID),
        content: type.string(),
        user: type.string().required(),
        created: type.date().default(() => new Date())
    }],
    actions: {
        create: type.string().default('inherit'),
        view: type.string().default('inherit'),
        update: type.string().default('inherit'),
        delete: type.string().default('inherit'),
        comment: type.string().default('inherit')
    },
    created: type.date().default(() => new Date())
}, { enforce_extra: "remove" });

db.Page.ensureIndex('path');
db.Page.ensureIndex('title');
db.Page.ensureIndex('recent', (doc) => doc('revisions')('0')('created'), { multi: true });

db.Page.hasMany(db.Comments, 'comments', 'id', 'pageID');

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------
