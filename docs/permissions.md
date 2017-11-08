# Permissions

Permissions are on a per `object` basis. The object has a list of `actions` that can be performed on it, and the
required permission to perform that action. For example, a `page` object will have the actions:

* `create`
* `view`
* `update`
* `delete`
* `comment`

Assuming we page a page `/foo` that has the following actions:

* `create: NULL`
* `view: 'special perm 1'`
* `update: 'special perm 1'`
* `delete: NULL`
* `comment: 'special perm 1'`

This means that anyone can create a child page under `/foo`, and anyone can delete `/foo`, but only someone with
`special perm 1` can view, update, or comment on the page.

## Accounts

An account has a list of permissions it has been explicitly granted, and it also has a list of roles that it is a member
of.

## Role

A role simple has a name, and a list of permissions that it has been granted.

## Wiki Objects

The following is a list of the wiki objects, and what actions they have, and any special permission logic that they
require.

### Page

Wiki `pages`, like in the example above, have the following actions:

* `create`
* `view`
* `update`
* `delete`
* `comment`

In addition, they support the special permission `'inherit'`. This permission means that the page needs to look at it's
parent page to find the correct permission requirement.

### Comment

A `comment` has the following actions:

* `update`
* `delete`

A comment also has the concept of an 'owner'. The owner inherently has all permissions on the comment.
