<!----------------------------------------------------------------------------------------------------------------------
  -- Comment Page
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <b-container id="comment-page">
        <div v-if="loading">
            <h4 class="text-center">
                Loading...
            </h4>
            <b-progress :value="100" variant="primary" :animated="true"></b-progress>
        </div>
        <div v-else-if="notFound">
            <h4 class="text-center">
                Page Not Found
            </h4>
            <p class="text-center">
                The page at path <code>{{ path }}</code> was not found. Comments can't be loaded.
            </p>
        </div>
        <div v-else-if="noPerm">
            <h4 class="text-center">
                Comment Permissions Error
            </h4>
            <b-alert v-if="account" show variant="danger" class="text-center">
                The user <code>{{ account.username }}</code> does not have permission to view comments for the page at path <code>{{ path }}</code>.
            </b-alert>
            <b-alert v-else show variant="danger" class="text-center">
                The user <code>anonymous</code> does not have permission to view comments for the page at path <code>{{ path }}</code>.
            </b-alert>
        </div>
        <div v-else-if="errorMessage">
            <h4 class="text-center">
                Comment Error
            </h4>
            <p class="text-center">
                The comments for the page at path <code>{{ path }}</code> encountered an error while loading:
            </p>
            <b-alert show variant="danger">
                <pre class="mb-0"><code>{{ errorMessage }}</code></pre>
            </b-alert>
        </div>
        <div v-else>
            <header class="clearfix m-md-1">
                <b-dropdown
                    id="comment-sort-order"
                    class="float-right"
                    :text="`Date ${ sort === 'asc' ? 'Ascending' : 'Descending' }`"
                    size="sm"
                    right
                >
                    <b-dropdown-item :active="sort === 'asc'" @click="sort = 'asc'">
                        Date Ascending
                    </b-dropdown-item>
                    <b-dropdown-item :active="sort === 'desc'" @click="sort = 'desc'">
                        Date Descending
                    </b-dropdown-item>
                </b-dropdown>

                <h4>Comments</h4>
            </header>
            <hr class="mt-0" />

            <!-- Comments List -->
            <h3 v-if="comments.length === 0" class="text-center mt-4">
                No Comments.
            </h3>
            <transition-group name="comment-transition" v-else class="list-unstyled" tag="ul">
                <b-media v-for="commentItem in sortedComments" :key="commentItem.comment_id" tag="li" class="commentItem-block mt-3">
                    <template slot="aside">
                        <div class="text-center">
                            <b-img class="img-thumbnail" :src="commentItem.account.avatar" blank-color="#aaa" width="96" alt="placeholder"></b-img>
                            <h6 class="m-0">
                                <small>{{ commentItem.account.username }}</small>
                            </h6>
                            <small v-b-tooltip.html.hover class="text-muted" :title="formatDate(commentItem.created)">{{ fromNow(commentItem.created) }}</small>
                        </div>
                    </template>
                    <div class="body-container pl-3">
                        <b-button-toolbar v-if="canEdit(commentItem)" class="float-right">
                            <b-btn size="sm" @click="edit(commentItem)">
                                <font-awesome-icon icon="edit"></font-awesome-icon>
                                Edit
                            </b-btn>
                            <b-btn class="ml-2" size="sm" @click="del(commentItem)">
                                <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                                Delete
                            </b-btn>
                        </b-button-toolbar>
                        <div v-if="isEdited(commentItem)" class="edited float-right" style="clear: right">
                            <small v-b-tooltip.html.hover class="text-muted" :title="formatDate(commentItem.edited)">Edited {{ fromNow(commentItem.edited) }}</small>
                        </div>
                        <h5 class="mt-0 mb-1">
                            {{ commentItem.title }}
                        </h5>
                        <markdown :text="commentItem.body"></markdown>
                    </div>
                </b-media>
            </transition-group>

            <!-- New Comment -->
            <hr/>
            <b-button-toolbar v-show="!showCommentComponent" class="float-right mb-4">
                <b-btn variant="success" @click="add">
                    Add Comment
                </b-btn>
            </b-button-toolbar>
            <add-edit-comment
                v-show="showCommentComponent"
                v-if="canPost()"
                :comment="comment"
                @saved="createNewComment"
                @canceled="showCommentComponent = false"
            ></add-edit-comment>

            <!-- Modal Component -->
            <b-modal id="delModal" ref="delModal" ok-variant="danger" @cancel="onCancel" @ok="onOk">
                <template slot="modal-title">
                    <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                    Delete Comment.
                </template>

                <div v-if="delComment">
                    Are you sure you want to delete the comment with the title: <i>"{{ delComment.title }}"</i>?
                </div>
                <div>
                    <small class="text-muted">This operation cannot be undone.</small>
                </div>

                <template slot="modal-ok">
                    <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                    Delete
                </template>
                <template slot="modal-cancel">
                    <font-awesome-icon icon="times"></font-awesome-icon>
                    Cancel
                </template>
            </b-modal>
        </div>
    </b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#comment-page {
        .comment-block {
            font-size: 0.85rem;
            padding-bottom: 10px;
            border-bottom: 1px solid #EEEEEE;

            .body-container {
                border-left: 1px solid #EEEEEE;

                & .markdown-block > p:last-child {
                    margin-bottom: 0;
                }
            }

            .edited {
                font-style: italic;
            }
        }
        .comment-transition-move {
            transition: transform 1s;
        }
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';
    import moment from 'moment';

    // Managers
    import authMan from '../api/managers/auth';
    import wikiMan from '../api/managers/wiki';
    import commentMan from '../api/managers/comment';

    // Utils
    import pathUtils from '../api/utils/path';

    // Components
    import Markdown from '../components/ui/markdown.vue';
    import AddEditComment from '../components/comment/addEditComment.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            AddEditComment,
            Markdown
        },
        data()
        {
            return {
                loading: true,
                notFound: false,
                noPerm: false,
                errorMessage: undefined,
                sort: 'asc',
                comment: undefined,
                delComment: undefined,
                cmOptions: {
                    mode: {
                        name: 'gfm',
                        gitHubSpice: false,
                        tokenTypeOverrides: {
                            emoji: 'emoji'
                        }
                    },
                    lineNumbers: true,
                    theme: 'default'
                },
                showCommentComponent: false
            };
        },
        computed: {
            path()
            {
                const path = _.get(this.$route, 'params.path', '/');
                return pathUtils.normalizePath(path);
            },
            sortedComments()
            {
                return _.orderBy(this.comments, 'created', [ this.sort ]);
            }
        },
        mounted()
        {
            this.selectPage();

            // Watch for changes to account.
            this.$watch('account', this.createNewComment.bind(this));
            this.createNewComment();
        },
        methods: {
            isEdited(comment)
            {
                return comment.created !== comment.edited;
            },
            onCancel()
            {
                this.delComment = undefined;
            },
            onOk()
            {
                return commentMan.deleteComment(this.delComment)
                    .then(() =>
                    {
                        this.delComment = undefined;
                    });
            },
            selectPage()
            {
                return wikiMan.selectPage(this.path)
                    .then(() =>
                    {
                        return commentMan.selectPage(this.path);
                    })
                    .catch({ code: 'ERR_NOT_FOUND' }, () =>
                    {
                        this.loading = false;
                    })
                    .catch({ code: 'ERR_PERMISSION' }, () =>
                    {
                        this.loading = false;
                        this.noPerm = true;
                    })
                    .catch((error) =>
                    {
                        this.loading = false;
                        this.errorMessage = error.message;
                        console.error('Error loading page:', error);
                    })
                    .then(() =>
                    {
                        this.loading = false;
                    });
            },
            clearPageVars()
            {
                this.loading = true;
                this.notFound = false;
                this.noPerm = false;
                this.errorMessage = undefined;
            },

            add()
            {
                if(this.comment.comment_id)
                {
                    this.createNewComment();
                }
                this.showCommentComponent = true;
            },
            edit(comment)
            {
                this.showCommentComponent = true;
                this.comment = comment;
            },
            del(comment)
            {
                this.delComment = comment;
                this.$refs.delModal.show();
            },

            canPost()
            {
                return wikiMan.canModify(this.page);
            },
            canEdit(comment)
            {
                this.account;
                return commentMan.canEdit(comment);
            },

            cmRefresh()
            {
                this.$nextTick(() =>
                {
                    this.$refs.editor.getCodeMirror().refresh();
                });
            },
            fromNow(date)
            {
                return moment(date).fromNow();
            },
            formatDate(date)
            {
                return moment(date).format('MMMM Do YYYY,<br> h:mm a');
            },
            createNewComment()
            {
                if(this.account)
                {
                    this.comment = commentMan.createComment(this.path);
                }
                else
                {
                    this.comment = undefined;
                } // end if
            }
        },
        subscriptions: {
            account: authMan.account$,
            page: wikiMan.currentPage$,
            comments: commentMan.currentComments$
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
