//----------------------------------------------------------------------------------------------------------------------
// Setups up a default role
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
                knex('account').insert({ username: 'globalAdmin', email: 'fake-admin@test.com', permissions: JSON.stringify([ '*/*' ]) }),
                knex('account').insert({ username: 'groupAdmin', email: 'fake-admin2@test.com' }),
                knex('account').insert({ username: 'normalUser', email: 'normal-user@test.com' }),
                knex('account').insert({ username: 'groupUser', email: 'group-user@test.com' }),
                knex('account').insert({ username: 'specialUser', email: 'special-user@test.com', permissions: JSON.stringify([ 'wikiView/special', 'wikiModify/special' ]) }),
                knex('role').insert({ name: 'Admins', permissions: JSON.stringify([ '*/*' ]) }),
                knex('role').insert({ name: 'Special', permissions: JSON.stringify([ 'wikiView/special', 'wikiModify/special' ]) })
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
