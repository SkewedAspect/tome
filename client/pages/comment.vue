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
            <i>Page Comments goes here...</i>
        </div>
    </b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#comment-page {
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';

	// Managers
	import authMan from '../api/managers/auth';
	import pageMan from '../api/managers/page';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
		},
		data()
		{
			return {
				loading: true,
				notFound: false,
				noPerm: false,
				errorMessage: undefined
			};
		},
		computed: {
			path()
			{
				let path = _.get(this.$route, 'params.path', '/');
				return pageMan.normalizePath(path);
			}
		},
		methods: {
			selectPage()
			{
				return pageMan.selectPage(this.path)
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
			}
		},
		watch: {
			'$route'(to, from)
			{
				if(to.path !== from.path || !_.isEqual(to.query, from.query))
				{
					this.clearPageVars();
					if(to.name === 'wiki')
					{
						this.selectPage();
					} // end if
				} // end if
			}
		},
		subscriptions: {
			account: authMan.account$,
			page: pageMan.currentPage$
		},
		mounted()
        {
			this.selectPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
