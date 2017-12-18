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
				<a href="#">create it</a>?
			</p>
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
		<page-display v-else></page-display>
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
	import pageMan from '../../api/managers/page';

	// Components
	import PageDisplay from './components/pageDisplay.vue';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			PageDisplay
		},
		data()
		{
			return {
				loading: true,
				notFound: false,
				errorMessage: undefined
			};
		},
		computed: {
			path()
			{
				let path = _.get(this.$route, 'params[0]', '/');
				if(path.length > 1)
				{
					if(path[0] !== '/')
					{
						path = `/${ path }`;
					} // end if

					if(path.substr(-1) === '/')
					{
						path = path.substr(0, path.length - 1);
					} // end if
				} // end if

				return path
			},
		},
		mounted()
		{
			pageMan.selectPage(this.path)
				.catch({ code: 'ERR_NOT_FOUND' }, () =>
				{
					this.loading = false;
					this.notFound = true;
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
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
