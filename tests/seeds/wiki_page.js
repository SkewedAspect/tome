//----------------------------------------------------------------------------------------------------------------------
// Setups up a default role
//----------------------------------------------------------------------------------------------------------------------

exports.seed = function(knex, Promise)
{
    return Promise.join(
            knex('page').del(),
            knex('revision').del(),
        )
        .then(() =>
        {
            return Promise.join(
                knex('page').insert({ path: '/', title: 'Home', action_view: '*', action_modify: '*' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "Home page." })),
                knex('page').insert({ path: '/normal', title: 'Normal Wiki Page' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _normal_ wiki page." })),
                knex('page').insert({ path: '/normal/sub', title: 'Sub Wiki Page' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _normal_ wiki sub page." })),
                knex('page').insert({ path: '/normal/sub/perm', title: 'Perm Sub Wiki Page', action_view: 'special', action_modify: 'special' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _perm_ wiki sub page." })),
                knex('page').insert({ path: '/normal/sub/perm/inherited', title: 'Inherited Perm Sub Wiki Page' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is an inherited _perm_ wiki sub page." })),
            )
        });
};

//----------------------------------------------------------------------------------------------------------------------
