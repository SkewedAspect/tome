<!--------------------------------------------------------------------------------------------------------------------->
<!-- Wiki Page                                                                                                       -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<div id="wiki-page">
		<!-- Breadcrumb and Action Bar -->
		<md-toolbar class="md-dense" md-theme="secondary">
			<breadcrumbs :path="$route.path" theme="secondary"></breadcrumbs>
			<div class="action-bar">
				<md-button v-if="!editing" class="md-icon-button">
					<md-icon>insert_comment</md-icon>
				</md-button>

				<md-button v-if="editing" @click="cancel()">Cancel</md-button>
			</div>
		</md-toolbar>

		<!-- Page Content -->
		<page-edit v-if="editing" :page="page"></page-edit>
		<page-display :page="page" @edit="edit()" v-else></page-display>

		<!-- Main Page Action -->
		<md-button v-if="editing" class="md-fab md-fab-bottom-right md-primary" @click="save()">
			<md-icon>save</md-icon>
		</md-button>
		<md-button class="md-fab md-fab-bottom-right" @click="edit()" v-else>
			<md-icon>edit</md-icon>
		</md-button>
	</div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#wiki-page {
		.md-fab {
			position: fixed;
		}

		.action-bar {
            flex: 1;
			text-align: right;
		}
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';

	import pageSvc from '../../services/wikiPage';

	import Breadcrumbs from '../../components/breadcrumbs.vue';
	import PageDisplay from './components/display.vue';
	import PageEdit from './components/edit.vue';

	//------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			Breadcrumbs,
			PageDisplay,
			PageEdit
		},
		inject: ['state'],
		computed: {
		    page(){ return this.state.currentPage; }
		},
        data()
        {
            return {
				editing: false,
			};
		},
		methods: {
			loadPage()
			{
				this.editing = false;
				const path = this.$route.path.replace(/^\/wiki/, '') || '/';

				return pageSvc.loadPage(path);
			},
			edit()
			{
			    this.editing = true;
			},
			save()
			{
			    //TODO: Actually save!
			    this.editing = false;
			},
			cancel()
			{
			    this.page.revert();
				this.editing = false;
			}
		},
		watch: {
			'$route': 'loadPage'
		},
		created()
		{
			this.loadPage();
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
