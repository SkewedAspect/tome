//----------------------------------------------------------------------------------------------------------------------
// Comment Seeds
//----------------------------------------------------------------------------------------------------------------------

exports.seed = function(knex)
{
    return Promise.all([ knex('comment').del() ])
        .then(() =>
        {
            return Promise.all([
                knex('comment').insert({ comment_id: 1, page_id: 3, title: 'First Topic', body: 'This is a comment.', account_id: 3 }),
                knex('comment').insert({ comment_id: 2, page_id: 3, title: 'Second Topic', body: 'This is a second comment.', account_id: 3 }),
                knex('comment').insert({ comment_id: 3, page_id: 3, title: 'Third Topic', body: 'This is a comment.', account_id: 4 }),
                knex('comment').insert({ comment_id: 4, page_id: 5, title: 'Other Topic', body: 'This is a comment.', account_id: 5 }),
                knex('comment').insert({ comment_id: 5, page_id: 5, title: 'Another Topic', body: 'This is a comment.', account_id: 3 }),
                knex('comment').insert({ comment_id: 6, page_id: 6, title: 'Other Topic', body: 'This is a comment.', account_id: 5 }),
                knex('comment').insert({ comment_id: 7, page_id: 6, title: 'Another Topic', body: 'This is a comment.', account_id: 3 })
            ]);
        });
};

//----------------------------------------------------------------------------------------------------------------------
