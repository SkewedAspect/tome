<!--------------------------------------------------------------------------------------------------------------------->
<!-- History Page                                                                                                       -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<b-container id="history-page">
		<div v-if="loading">
			<h4 class="text-center">Loading...</h4>
			<b-progress :value="100" variant="primary" :animated="true"></b-progress>
		</div>
		<div v-else-if="notFound">
			<h4 class="text-center">Page Not Found</h4>
			<p class="text-center">
				No wiki page found at path <code>{{ path }}</code>.
			</p>
		</div>
		<div v-else-if="noPerm">
			<h4 class="text-center">Page Permissions Error</h4>
			<b-alert v-if="account" show variant="danger" class="text-center">
				The user <code>{{ account.username }}</code> does not have permission to view page history at path <code>{{ path }}</code>.
			</b-alert>
			<b-alert v-else show variant="danger" class="text-center">
				The user <code>anonymous</code> does not have permission to view page history at path <code>{{ path }}</code>.
			</b-alert>
		</div>
		<div v-else-if="errorMessage">
			<h4 class="text-center">History Error</h4>
			<p class="text-center">
				The page history at path <code>{{ path }}</code> encountered an error while loading:
			</p>
            <b-alert show variant="danger">
                <pre class="mb-0"><code>{{ errorMessage }}</code></pre>
            </b-alert>
		</div>
        <div v-else>
            <header>
                <b-dropdown id="comment-sort-order" class="float-right"
                    :text="`${ sort === 'asc' ? 'Ascending' : 'Descending' }`" class="m-md-2" size="sm" right>
                    <b-dropdown-item :active="sort === 'asc'" @click="sort = 'asc'">Ascending</b-dropdown-item>
                    <b-dropdown-item :active="sort === 'desc'" @click="sort = 'desc'">Descending</b-dropdown-item>
                </b-dropdown>

                <h4>Page History</h4>
                <hr class="mt-0 mb-3">
            </header>
            <b-list-group>
                <history-item v-for="(revision, index) in sortedRevisions"
                    :revision="revision"
                    :prev-revision="getPrevRev(index)">
                </history-item>
            </b-list-group>
        </div>
	</b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#history-page {
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';

	// Managers
	import authMan from '../api/managers/auth';
	import historyMan from '../api/managers/history';

    // Utils
    import pathUtils from '../api/utils/path';

    // Components
    import HistoryItem from '../components/history/historyItem.vue';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
		    HistoryItem
		},
		data()
		{
			return {
				loading: true,
				notFound: false,
				noPerm: false,
				errorMessage: undefined,
                sort: 'desc',
			};
		},
		computed: {
			path()
			{
				let path = _.get(this.$route, 'params.path', '/');
				return pathUtils.normalizePath(path);
			},
            sortedRevisions()
            {
                return _(this.pageHistory.revisions)
                    .orderBy('revision_id', ['asc'])
                    .map((rev, index) =>
                    {
                        rev.revNumber = index + 1;
                        return rev;
                    })
                    .orderBy('revision_id', [ this.sort ])
                    .value();
            }
		},
		methods: {
		    getPrevRev(index)
            {
                if(this.sort === 'desc')
                {
                    return this.sortedRevisions[ index + 1 ];
                }
                else
                {
                    return this.sortedRevisions[ index - 1 ];
                } // end if
            },
			selectPage()
			{
				return historyMan.selectPage(this.path)
					.catch({ code: 'ERR_NOT_FOUND' }, () =>
					{
						this.loading = false;
                        this.notFound = true;
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
		subscriptions: {
			account: authMan.account$,
			pageHistory: historyMan.currentPageHistory$
		},
		mounted()
		{
			this.selectPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
