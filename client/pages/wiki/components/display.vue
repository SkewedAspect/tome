<!--------------------------------------------------------------------------------------------------------------------->
<!-- display.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="wiki-display">
		<div v-if="loading || !page">
			<h2 class="text-center">Loading Page...</h2>
			<spinner :color="'#FF9800'"></spinner>
		</div>
		<div v-else>
            <div v-if="error">
				<h2 class="text-center">Page error: '{{ error.data.name }}'</h2>
				<p class="text-center">
					The page <code>'{{ path }}'</code> failed to load. Error message was: <br>
				</p>
				<p class="text-center">
					<code>{{ error.data.message }}</code>
				</p>
            </div>
            <div v-else-if="!page.id">
                <h2 class="text-center">Page not found.</h2>
                <p class="text-center">
                    The page <code>'{{ page.path }}'</code> does not exist. Would you like to
                    <a href="#" @click="edit()">create</a> it?
                </p>
            </div>
            <div v-else>
                <h1>{{ page.title }}</h1>
                <div v-html="renderedContent"></div>
            </div>
		</div>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #wiki-display {
		padding: 16px;
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';
	import marked from 'marked';

	import spinkit from '../../../components/spinkit';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
			spinner: spinkit.wave,
		},
        props: {
			page: {
				type: Object
			}
		},
		inject: ['state'],
		computed: {
            loading(){ return this.state.pageLoading; },
			error(){ return this.state.loadingError; },

			currentRevision(){ return _.get(this.page, 'revisions[0]'); },
			renderedContent()
			{
			    const content = _.get(this.currentRevision, 'content', '');
                return marked(content);
			}
        },
		methods: {
            edit(){ this.$emit('edit'); }
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
