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
            return knex('page')
                .insert({
                    path: '/',
                    title: 'Welcome to Tome',
                    action_view: '*',
                    action_modify: '*'
                })
                .then(([ page_id ]) =>
                {
                    return knex('revision')
                        .insert({
                            page_id,
                            body: "Congratulations, you've successfully setup your Tome wiki!" +
                            "\n\n" +
                            "Here is some markdown examples to get you started:" +
                            "\n\n" +
                            "---" +
                            "\n\n" +
                            "# h1 Heading\n" +
                            "## h2 Heading\n" +
                            "### h3 Heading\n" +
                            "#### h4 Heading\n" +
                            "##### h5 Heading\n" +
                            "###### h6 Heading\n" +
                            "\n\n" +
                            "## Emphasis" +
                            "\n\n" +
                            "**This is bold text**" +
                            "\n\n" +
                            "__This is bold text__" +
                            "\n\n" +
                            "*This is italic text*" +
                            "\n\n" +
                            "_This is italic text_" +
                            "\n\n" +
                            "~~Strikethrough~~\n" +
                            "\n\n" +
                            "## Blockquotes" +
                            "\n\n" +
                            "> Blockquotes can also be nested...\n" +
                            ">> ...by using additional greater-than signs right next to each other...\n" +
                            "> > > ...or with spaces between arrows.\n" +
                            "\n\n" +
                            "## Lists" +
                            "\n\n" +
                            "Unordered" +
                            "\n\n" +
                            "+ Create a list by starting a line with `+`, `-`, or `*`\n" +
                            "+ Sub-lists are made by indenting 2 spaces:\n" +
                            "  - Marker character change forces new list start:\n" +
                            "    * Ac tristique libero volutpat at\n" +
                            "    + Facilisis in pretium nisl aliquet\n" +
                            "    - Nulla volutpat aliquam velit\n" +
                            "+ Very easy!" +
                            "\n\n" +
                            "Ordered" +
                            "\n\n" +
                            "1. Lorem ipsum dolor sit amet\n" +
                            "2. Consectetur adipiscing elit\n" +
                            "3. Integer molestie lorem at massa\n" +
                            "\n\n" +
                            "1. You can use sequential numbers...\n" +
                            "1. ...or keep all the numbers as `1.`" +
                            "\n\n" +
                            "Start numbering with offset:" +
                            "\n\n" +
                            "57. foo\n" +
                            "1. bar"
                        })
                });
        });
};

//----------------------------------------------------------------------------------------------------------------------
