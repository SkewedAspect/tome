<!--------------------------------------------------------------------------------------------------------------------->
<!-- Wiki Page                                                                                                       -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<div id="wiki-page">
		<div v-if="loading">
			<h2 class="text-center">Loading Page...</h2>
			<spinner :color="'#FF9800'"></spinner>
		</div>
		<div v-else>
			<!-- Display -->
			<div v-if="!editing">
                <div v-if="page">
                    <h1>{{ page.title }}</h1>
                    <div v-html="content"></div>
                </div>
				<div v-else-if="error">
					<h2 class="text-center">Page error: '{{ error.data.name }}'</h2>
					<p class="text-center">
						The page <code>'{{ path }}'</code> failed to load. Error message was: <br>
					</p>
					<p class="text-center">
						<code>{{ error.data.message }}</code>
					</p>
				</div>
                <div v-else>
                    <h2 class="text-center">Page not found.</h2>
                    <p class="text-center">
                        The page <code>'{{ path }}'</code> does not exist. Would you like to <a @click="editPage()">create</a> it?
                    </p>
                </div>
			</div>

			<!-- Edit -->
			<div v-else>
				<h1>EDIT MODE</h1>
				<md-card>
					<codemirror v-model="currentRevision.content" :options="editorOptions"></codemirror>
				</md-card>
				<md-button class="md-primary md-raised" @click="savePage()">
					Save
				</md-button>
			</div>
		</div>
	</div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style rel="stylesheet/scss" lang="sass">
	#wiki-page {
		padding: 16px;
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';
	import $http from 'axios';
	import marked from 'marked';

	import stateSvc from '../services/state';
	import spinkit from '../components/spinkit';

	import VueCode from 'vue-code';
	import 'codemirror/mode/markdown/markdown';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			spinner: spinkit.wave,
			codemirror: VueCode
		},
        data: function()
        {
            return {
            	state: stateSvc.state,
				loading: false,
				page: undefined,
				error: undefined,

				editorOptions: {
					tabSize: 4,
//					lineNumbers: false,
					mode: 'markdown'
				}
			};
		},
		computed: {
			path()
			{
				return this.$route.path.replace('/wiki', '') || '/';
			},
			currentRevision()
			{
				if(this.page)
				{
					return _.last(this.page.revisions);
				} // end if
			},
			content:
			{
				get()
				{
					if(this.page)
					{
						return marked(this.currentRevision.content);
					} // end if
				},
				set(val)
				{
					if(this.page)
					{
						this.currentRevision.content = val;
					} // end if
				}
			}
		},
		methods: {
			loadPage()
			{
				this.loading = true;

				return $http.get(this.$route.path)
					.get('data')
					.then((page) =>
					{
						this.error = undefined;
						this.page = page;
                        this.loading = false;
					})
					.catch((error) =>
					{
						if(error.response.status !== 404)
						{
							console.error('Error getting page:', error.response);
						} // end if

						this.error = error.response;
						this.page = undefined;
                        this.loading = false;
					});
			},
			editPage()
			{
				// Enter edit mode
				this.$router.push({ query: { edit: null } });
			},
			savePage()
			{
				// Exit edit mode
				this.$router.push({ query: {} });
			}
		},
		watch: {
			'$route': 'loadPage',
			'$route.query': function()
			{
				this.editing = this.$route.query.edit !== undefined;
			}
		},
		created()
		{
			this.editing = this.$route.query.edit !== undefined;
			this.loadPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
