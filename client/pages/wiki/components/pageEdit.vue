<!--------------------------------------------------------------------------------------------------------------------->
<!-- pageEdit                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="page-edit" v-if="page">
		<b-form @submit.prevent="save()" @reset.prevent="reset()" :validated="formValidated" novalidate>
			<b-form-group id="pageTitleGroup"
						  label="Title"
						  label-for="pageTitle">
				<b-form-input id="pageTitle"
							  type="text"
							  v-model="page.title"
							  required
							  placeholder="Some page title...">
				</b-form-input>
			</b-form-group>
			<b-form-group id="pageBodyGroup"
						  label="Body"
						  label-for="pageBody">
				<b-card no-body>
					<code-mirror
						id="pageBody"
						v-model="page.body"
						:options="cmOptions">
					</code-mirror>
				</b-card>
			</b-form-group>
			<b-form-group id="permissionsGroup" label="Permissions">
				<b-form-row>
					<b-form-group horizontal
								  class="col"
								  label="View"
								  label-class="text-sm-right"
								  label-for="viewPerm">
						<b-form-input id="viewPerm"
									  type="text"
									  v-model="page.actions.wikiView"
									  required
									  placeholder="inherited">
						</b-form-input>
					</b-form-group>
					<b-form-group horizontal
								  class="col"
								  label="Modify"
								  label-class="text-sm-right"
								  label-for="modifyPerm">
						<b-form-input id="modifyPerm"
									  type="text"
									  v-model="page.actions.wikiModify"
									  required
									  placeholder="inherited">
						</b-form-input>
					</b-form-group>
				</b-form-row>
			</b-form-group>
			<div class="text-right mb-3">
				<b-button type="reset" variant="secondary">
					<font-awesome-icon icon="times"/>
					Cancel
				</b-button>
				<b-button type="reset" variant="danger">
					<font-awesome-icon icon="undo"/>
					Reset
				</b-button>
				<b-button type="submit" variant="success">
					<font-awesome-icon icon="save"/>
					Save
				</b-button>
			</div>
		</b-form>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #page-edit {
		.CodeMirror {
			height: 100%;
		}
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

	// Codemirror
	import 'codemirror/addon/mode/overlay';
	import 'codemirror/mode/xml/xml';
	import 'codemirror/mode/markdown/markdown';
	import 'codemirror/mode/gfm/gfm';
	import 'codemirror/mode/javascript/javascript';
	import 'codemirror/mode/css/css';
	import 'codemirror/mode/htmlmixed/htmlmixed';
	import 'codemirror/mode/clike/clike';
	import 'codemirror/mode/meta';

	// Managers
	import pageMan from '../../../api/managers/page';

	// Components
	import CodeMirror from 'vue-cm'

    //------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			CodeMirror
		},
        data()
        {
            return {
            	formValidated: false,
				cmOptions: {
					mode: {
						name: "gfm",
						gitHubSpice: false,
						tokenTypeOverrides: {
							emoji: "emoji"
						}
					},
					lineNumbers: true,
					theme: "default"
				}
			};
		},
		methods: {
        	save()
			{
				this.formValidated = true;
				return pageMan.savePage(this.page)
					.then(() => {
						this.formValidated = false;
						this.$router.push({ query: {} });
					});
			},
			reset()
			{
				this.page.reset();
			}
		},
		subscriptions: {
			page: pageMan.currentPage$
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
