//----------------------------------------------------------------------------------------------------------------------
// Setups up a default role
//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

const body = `# Welcome

Congratulations, you've successfully setup your Tome wiki!

Here is some markdown examples to get you started:

---

# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

## Links

Here we have an example of a [wiki link](/foobar), followed by an [external link](https://gitlab.com) in the same sentence.

### Wiki Links

Creating a wiki link is fairly easy. It works exactly the same as any normal markdown link (all versions of the link syntax are 
supported), but the url will start with either \`'/wiki'\` or simply \`'/'\`.

Ex:

\`\`\`markdown
Here is some text containing a [wiki link](/some-page). This [also](/wiki/some-other-page) works. As does [this][].

However, [this link](example.com) is an external one. Also [this one][].

[this]: /some-other-other-page
[this one]: https://google.com
\`\`\`

## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as \`1.\`

Start numbering with offset:

57. foo
1. bar
`;

//----------------------------------------------------------------------------------------------------------------------

exports.seed = function(knex, Promise)
{
    return Promise.join(
        knex('page').del(),
        knex('revision').del()
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
                            body
                        });
                });
        });
};

//----------------------------------------------------------------------------------------------------------------------
