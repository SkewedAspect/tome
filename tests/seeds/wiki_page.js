//----------------------------------------------------------------------------------------------------------------------
// Wiki Page Seeds
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
                knex('page').insert({ page_id: 1, path: '/', title: 'Home', action_view: '*', action_modify: '*' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "Home page.", revision_id: 1 })),
                knex('page').insert({ page_id: 2, path: '/perm', title: 'Perm Wiki Page', action_view: 'special', action_modify: 'special' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _permissioned_ wiki page.", revision_id: 2 })),
                knex('page').insert({ page_id: 3, path: '/normal', title: 'Normal Wiki Page' })
                    .then(([ page_id ]) =>
                    {
                        return knex('revision').insert({ page_id, body: "This is a _normal_ wiki page. First Revision.", revision_id: 3 })
                            .delay(20)
                            .then(() => knex('revision').insert({ page_id, body: "This is a _normal_ wiki page. Second Revision", revision_id: 4 }))
                            .delay(20)
                            .then(() => knex('revision').insert({ page_id, body: "This is a _normal_ wiki page.", revision_id: 5 }));
                    }),
                knex('page').insert({ page_id: 4, path: '/normal/sub', title: 'Sub Wiki Page' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _normal_ wiki sub page.", revision_id: 6 })),
                knex('page').insert({ page_id: 5, path: '/normal/sub/perm', title: 'Perm Sub Wiki Page', action_view: 'special', action_modify: 'special' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is a _perm_ wiki sub page.", revision_id: 7 })),
                knex('page').insert({ page_id: 6, path: '/normal/sub/perm/inherited', title: 'Inherited Perm Sub Wiki Page' })
                    .then(([ page_id ]) => knex('revision').insert({ page_id, body: "This is an inherited _perm_ wiki sub page.", revision_id: 8 })),
            );
        });
};

//----------------------------------------------------------------------------------------------------------------------
