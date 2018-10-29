<!--------------------------------------------------------------------------------------------------------------------->
<!-- Comment Page
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<b-container id="comment-page">
		<div v-if="loading">
			<h4 class="text-center">Loading...</h4>
			<b-progress :value="100" variant="primary" :animated="true"></b-progress>
		</div>
		<div v-else-if="notFound">
			<h4 class="text-center">Page Not Found</h4>
			<p class="text-center">
				The page at path <code>{{ path }}</code> was not found. Comments can't be loaded.
			</p>
		</div>
		<div v-else-if="noPerm">
			<h4 class="text-center">Comment Permissions Error</h4>
			<b-alert v-if="account" show variant="danger" class="text-center">
				The user <code>{{ account.username }}</code> does not have permission to view comments for the page at path <code>{{ path }}</code>.
			</b-alert>
			<b-alert v-else show variant="danger" class="text-center">
				The user <code>anonymous</code> does not have permission to view comments for the page at path <code>{{ path }}</code>.
			</b-alert>
		</div>
		<div v-else-if="errorMessage">
			<h4 class="text-center">Comment Error</h4>
			<p class="text-center">
				The comments for the page at path <code>{{ path }}</code> encountered an error while loading:
			</p>
            <b-alert show variant="danger">
                <pre class="mb-0"><code>{{ errorMessage }}</code></pre>
            </b-alert>
		</div>
        <div v-else>
            <header>
                <b-dropdown id="comment-sort-order" class="float-right"
                    :text="`Date ${ sort === 'asc' ? 'Ascending' : 'Descending' }`" class="m-md-2" size="sm" right>
                    <b-dropdown-item :active="sort === 'asc'" @click="sort = 'asc'">Date Ascending</b-dropdown-item>
                    <b-dropdown-item :active="sort === 'desc'" @click="sort = 'desc'">Date Descending</b-dropdown-item>
                </b-dropdown>

                <h4>Comments</h4>
                <hr class="mt-0 mb-3">
            </header>

            <h3 v-if="comments.length === 0" class="text-center mt-4">No Comments.</h3>
            <ul v-else class="list-unstyled">
                <b-media tag="li" class="comment-block mt-3" v-for="comment in sortedComments" :key="comment.id">
                    <template slot="aside">
                        <div class="text-center">
                            <b-img class="img-thumbnail" :src="comment.account.avatar" blank-color="#aaa" width="96" alt="placeholder"></b-img>
                            <h6 class="m-0"><small>{{ comment.account.username }}</small></h6>
                            <small class="text-muted" v-b-tooltip.html.hover :title="formatDate(comment.created)">{{ fromNow(comment.created) }}</small>
                        </div>
                    </template>
                    <div class="body-container pl-3">
                        <div class="edited float-right" v-if="isEdited(comment)">
                            <small class="text-muted" v-b-tooltip.html.hover :title="formatDate(comment.edited)">Edited {{ fromNow(comment.edited) }}</small>
                        </div>
                        <h5 class="mt-0 mb-1">{{ comment.title }}</h5>
                        <markdown :text="comment.body"></markdown>
                    </div>
                </b-media>
            </ul>
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

    // Components
    import markdown from '../components/ui/markdown.vue';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
		    markdown
		},
		data()
		{
			return {
				loading: true,
				notFound: false,
				noPerm: false,
				errorMessage: undefined,
                sort: 'asc'
			};
		},
		computed: {
			path()
			{
				let path = _.get(this.$route, 'params.path', '/');
				return wikiMan.normalizePath(path);
			},
            sortedComments()
            {
                return _.orderBy(this.comments, 'created', [this.sort]);
            }
		},
		methods: {
		    isEdited(comment)
            {
                return comment.created !== comment.edited;
            },
			selectPage()
			{
				return commentMan.selectPage(this.path)
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
            fromNow(date)
            {
                return moment(date).fromNow();
            },
            formatDate(date)
            {
                return moment(date).format('MMMM Do YYYY,<br> h:mm a');
            }
		},
		// watch: {
		// 	'$route'(to, from)
		// 	{
		// 		if(to.path !== from.path || !_.isEqual(to.query, from.query))
		// 		{
		// 			this.clearPageVars();
		// 			if(to.name === 'comment')
		// 			{
		// 				this.selectPage();
		// 			} // end if
		// 		} // end if
		// 	}
		// },
		subscriptions: {
			account: authMan.account$,
			comments: commentMan.currentComments$
		},
		mounted()
        {
			this.selectPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
