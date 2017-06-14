//----------------------------------------------------------------------------------------------------------------------
// Unit Test Model Manager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const models = require('../server/models');

//----------------------------------------------------------------------------------------------------------------------
// Testing Models
//----------------------------------------------------------------------------------------------------------------------

const globalAdmin = {
    avatar: "http://placehold.it/80x80",
    created: Date.now(),
    email: "fake-admin@test.com",
    googleID:  "9991",
    id:  "globalAdmin",
    settings: { },
    displayName:  "globalAdmin",
    groups: [ 'admins' ],
    permissions: [ '*/*' ]
};

const groupAdmin = {
    admin: false,
    avatar: "http://placehold.it/80x80",
    created: Date.now(),
    email: "fake-user@test.com",
    googleID:  "9992",
    id:  "groupAdmin",
    settings: { },
    displayName:  "groupAdmin",
    permissions: [ ],
    groups: [ 'admins' ]
};

const normalUser = {
    admin: false,
    avatar: "http://placehold.it/80x80",
    created: Date.now(),
    email: "normal-user@test.com",
    googleID:  "9993",
    id:  "normalUser",
    settings: { },
    displayName:  "normalUser",
    permissions: [ ],
    groups: [ ]
};

const groupUser = {
    admin: false,
    avatar: "http://placehold.it/80x80",
    created: Date.now(),
    email: "group-user@test.com",
    googleID:  "9994",
    id:  "groupUser",
    settings: { },
    displayName:  "groupUser",
    permissions: [ ],
    groups: [ 'specials' ]
};

const specialUser = {
    admin: false,
    avatar: "http://placehold.it/80x80",
    created: Date.now(),
    email: "special-user@test.com",
    googleID:  "9995",
    id:  "specialUser",
    settings: { },
    displayName:  "specialUser",
    permissions: [ 'wiki/special' ],
    groups: [ ]
};

// ---------------------------------------------------------------------------------------------------------------------

const adminGroup = {
    id: 'adminGroup',
    name: 'admins',
    description: 'Admins only. No boys allowed.',
    permissions: [ '*/*' ]
};

const specialGroup = {
    id: 'specialGroup',
    name: 'specials',
    description: 'Special group for special people.',
    permissions: [ 'wiki/special' ]
};

//----------------------------------------------------------------------------------------------------------------------

const normalPage = {
    id: 'normalPage',
    title: 'Normal Wiki Page',
    path: '/normal',
    revisions: [{
        id: 'rev1',
        content: "This is a _normal_ wiki page.",
        user: globalAdmin.email
    }],
    actions: {
        create: 'inherit',
        view: 'inherit',
        update: 'inherit',
        delete: 'inherit',
        comment: 'inherit'
    }
};

const normalSubPage = {
    id: 'normalSubPage',
    title: 'Sub Wiki Page',
    path: '/normal/sub',
    revisions: [{
        id: 'rev1',
        content: "This is a _normal_ wiki sub page.",
        user: globalAdmin.email
    }],
    actions: {
        create: 'inherit',
        view: 'inherit',
        update: 'inherit',
        delete: 'inherit',
        comment: 'inherit'
    }
};

const permSubPage = {
    id: 'permSubPage',
    title: 'Perm Sub Wiki Page',
    path: '/normal/sub/perm',
    revisions: [{
        id: 'rev1',
        content: "This is a _perm_ wiki sub page.",
        user: globalAdmin.email
    }],
    actions: {
        create: 'wiki/special',
        view: 'wiki/special',
        update: 'wiki/special',
        delete: 'wiki/special',
        comment: 'wiki/special'
    }
};

const inheritedPermSubPage = {
    id: 'inheritedPermSubPage',
    title: 'Inherited Perm Sub Wiki Page',
    path: '/normal/sub/perm/inherited',
    revisions: [{
        id: 'rev1',
        content: "This is an inherited _perm_ wiki sub page.",
        user: globalAdmin.email
    }],
    actions: {
        create: 'inherit',
        view: 'inherit',
        update: 'inherit',
        delete: 'inherit',
        comment: 'inherit'
    }
};

//----------------------------------------------------------------------------------------------------------------------

class ModelManager
{
    constructor()
    {
        this.modelInstances = {};
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------

    $buildAccounts()
    {
        return Promise.join(
            this.buildModel(models.Account, globalAdmin),
            this.buildModel(models.Account, groupAdmin),
            this.buildModel(models.Account, normalUser),
            this.buildModel(models.Account, groupUser),
            this.buildModel(models.Account, specialUser)
        );
    } // end $buildAccounts

    $buildGroups()
    {
        return Promise.join(
            this.buildModel(models.Group, adminGroup),
            this.buildModel(models.Group, specialGroup)
        );
    } // end $buildGroups

    $buildPages()
    {
        return Promise.join(
            this.buildModel(models.Page, normalPage),
            this.buildModel(models.Page, normalSubPage),
            this.buildModel(models.Page, permSubPage),
            this.buildModel(models.Page, inheritedPermSubPage)
        );
    } // end $buildPages

    //------------------------------------------------------------------------------------------------------------------

    get(instanceID)
    {
        return this.modelInstances[instanceID];
    } // end get

    buildModel(Model, data)
    {
        const inst = new Model(data);
        return inst.save().then(() => { this.modelInstances[inst.id] = inst; });
    } // end buildModel

    buildModels()
    {
        return this.deleteModels()
            .then(() =>
            {
                return Promise.join(
                    this.$buildAccounts(),
                    this.$buildGroups(),
                    this.$buildPages()
                );
            });
    } // end buildModels

    deleteModels()
    {
        return Promise.map(_.values(this.modelInstances), (inst) =>
            {
                return inst.delete();
            })
            .then(() => { this.modelInstances = {}; });
    } // end deleteModels
} // end ModelManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new ModelManager();

//----------------------------------------------------------------------------------------------------------------------
