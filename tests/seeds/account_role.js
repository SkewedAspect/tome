//----------------------------------------------------------------------------------------------------------------------
// Account Seeds
//----------------------------------------------------------------------------------------------------------------------

exports.seed = function(knex, Promise)
{
    return Promise.join(
            knex('account').del(),
            knex('account_role').del(),
            knex('role').del()
        )
        .then(() =>
        {
            return Promise.join(
                knex('account').insert({ account_id: 1, username: 'globalAdmin', email: 'fake-admin@test.com', permissions: JSON.stringify([ '*/*' ]) }),
                knex('account').insert({ account_id: 2, username: 'groupAdmin', email: 'fake-admin2@test.com' }),
                knex('account').insert({ account_id: 3, username: 'normalUser', email: 'normal-user@test.com' }),
                knex('account').insert({ account_id: 4, username: 'groupUser', email: 'group-user@test.com' }),
                knex('account').insert({ account_id: 5, username: 'specialUser', email: 'special-user@test.com', permissions: JSON.stringify([ 'wikiView/special', 'wikiModify/special' ]) }),
                knex('role').insert({ role_id: 1, name: 'Admins', permissions: JSON.stringify([ '*/*' ]) }),
                knex('role').insert({ role_id: 2, name: 'Special', permissions: JSON.stringify([ 'wikiView/special', 'wikiModify/special' ]) })
            );
        })
        .then(() =>
        {
            return Promise.join(
                knex('account_role').insert({ account_id: 2, role_id: 1 }),
                knex('account_role').insert({ account_id: 4, role_id: 2 }),
            );
        });
};

//----------------------------------------------------------------------------------------------------------------------
