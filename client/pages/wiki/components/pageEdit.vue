<!--------------------------------------------------------------------------------------------------------------------->
<!-- pageEdit                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div class="page-edit">
		<b-form @submit.prevent="save()" @reset.prevent="reset()">
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
			<b-button type="submit" variant="primary">Submit</b-button>
			<b-button type="reset" variant="danger">Reset</b-button>
		</b-form>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .page-edit {
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
				return pageMan.save(this.page)
					.then(() =>
					{
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
