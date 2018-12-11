<!--------------------------------------------------------------------------------------------------------------------->
<!-- Wiki Page                                                                                                       -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<b-container id="wiki-page">
		<div v-if="loading">
			<h4 class="text-center">Loading...</h4>
			<b-progress :value="100" variant="primary" :animated="true"></b-progress>
		</div>
		<div v-else-if="notFound">
			<h4 class="text-center">Page Not Found</h4>
			<p class="text-center">
				The page at path <code>{{ path }}</code> was not found. Would you like to
				<router-link :to="{ query: { edit: null } }">create it</router-link>?
			</p>
		</div>
		<div v-else-if="noPerm">
			<h4 class="text-center">Page Permissions Error</h4>
			<b-alert v-if="account" show variant="danger" class="text-center">
				The user <code>{{ account.username }}</code> does not have permission to view the page at path <code>{{ path }}</code>.
			</b-alert>
			<b-alert v-else show variant="danger" class="text-center">
				The user <code>anonymous</code> does not have permission to view the page at path <code>{{ path }}</code>.
			</b-alert>
		</div>
		<div v-else-if="errorMessage">
			<h4 class="text-center">Page Error</h4>
			<p class="text-center">
				The page at path <code>{{ path }}</code> encountered an error while loading:
			</p>
            <b-alert show variant="danger">
                <pre class="mb-0"><code>{{ errorMessage }}</code></pre>
            </b-alert>
		</div>
		<component :is="pageComponent" v-else></component>
	</b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#wiki-page {
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';

	// Managers
	import authMan from '../api/managers/auth';
	import wikiMan from '../api/managers/wiki';

    // Utils
    import pathUtils from '../api/utils/path';

	// Components
	import PageDisplay from '../components/wiki/display.vue';
	import PageEdit from '../components/wiki/edit.vue';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			PageDisplay,
			PageEdit
		},
		data()
		{
			return {
				loading: true,
				notFound: false,
				noPerm: false,
				errorMessage: undefined,
				mode: 'display'
			};
		},
		computed: {
			path()
			{
				let path = _.get(this.$route, 'params.path', '/');
				return pathUtils.normalizePath(path);
			},
			pageComponent(){ return this.mode === 'edit' ? 'page-edit' : 'page-display' }
		},
		methods: {
			selectPage()
			{
				return wikiMan.selectPage(this.path)
					.catch({ code: 'ERR_NOT_FOUND' }, () =>
					{
						this.loading = false;

						if(this.mode === 'edit')
						{
							return wikiMan.createPage(this.path);
						}
						else
						{
							this.notFound = true;
						} // end if
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
		beforeRouteUpdate (to, from, next)
		{
			if(this.mode === 'edit' && this.page.dirty)
			{
				//FIXME: Change this to a toast with an undo system, a la: http://alistapart.com/article/neveruseawarning
				const answer = window.confirm('Do you really want to leave? You have unsaved changes!');
				if(answer)
				{
					this.page.reset();
					next();
				}
				else
				{
					next(false);
				} // end if
			}
			else
			{
				next();
			} // end if
		},
		beforeRouteLeave (to, from, next)
		{
			if(this.mode === 'edit' && this.page.dirty)
			{
				//FIXME: Change this to a toast with an undo system, a la: http://alistapart.com/article/neveruseawarning
				const answer = window.confirm('Do you really want to leave? You have unsaved changes!');
				if(answer)
				{
					this.page.reset();
					next();
				}
				else
				{
					next(false);
				} // end if
			}
			else
			{
				next();
			} // end if
		},
		watch: {
			'$route'(to, from)
			{
				if(_.includes(_.keys(to.query), 'edit'))
				{
					this.mode = 'edit';
				}
				else
				{
					this.mode = 'display';
				} // end if

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
			page: wikiMan.currentPage$
		},
		mounted()
		{
			if(_.includes(_.keys(this.$route.query), 'edit'))
			{
				this.mode = 'edit';
			}
			else
			{
				this.mode = 'display';
			} // end if

			this.selectPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
