<!--------------------------------------------------------------------------------------------------------------------->
<!-- edit.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="wiki-edit">
		<md-input-container>
			<label>Page Title</label>
			<md-input v-model="live.title"></md-input>
		</md-input-container>
		<md-input-container>
			<label>Path</label>
			<md-input v-model="live.path"></md-input>
		</md-input-container>
		<label style="color: rgba(0,0,0,0.54); font-size: 12px; margin-bottom: 8px; display: inline-block">Content</label>
		<md-card>
			<codemirror v-model="currentRevision.content" :options="editorOptions"></codemirror>
		</md-card>
		<md-card style="margin-top: 28px;">
			<md-card-expand>
				<md-card-header>
					<md-button class="md-icon-button" style="float: right" md-expand-trigger>
						<md-icon>keyboard_arrow_down</md-icon>
					</md-button>
					<div class="md-title">Permissions</div>
				</md-card-header>

				<md-card-content>
					<md-input-container>
						<label>Create</label>
						<md-input v-model="live.actions.create"></md-input>
					</md-input-container>
					<md-input-container>
						<label>View</label>
						<md-input v-model="live.actions.view"></md-input>
					</md-input-container>
					<md-input-container>
						<label>Update</label>
						<md-input v-model="live.actions.update"></md-input>
					</md-input-container>
					<md-input-container>
						<label>Delete</label>
						<md-input v-model="live.actions.delete"></md-input>
					</md-input-container>
					<md-input-container>
						<label>Comment</label>
						<md-input v-model="live.actions.comment"></md-input>
					</md-input-container>
				</md-card-content>
			</md-card-expand>
		</md-card>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #wiki-edit {
		padding: 16px;

		.CodeMirror {
			// iPhones
			height: 200px;

			// Android Phones
			@media(min-height: 668px) {
				height: 240px;
			}

			// iPad Landscape
			@media(min-height: 768px) {
				height: 275px;
			}

			// Some MDPI laptops
			@media(min-height: 800px) {
				height: 300px;
			}

			@media(min-height: 900px) {
				height: 400px;
			}

			// Some HDPI laptops, iPad portrait
			@media(min-height: 900px) {
				height: 525px;
			}

			// 1080p laptops
			@media(min-height: 1080px) {
				height: 575px;
			}

			// Really high-rez laptops
			@media(min-height: 1200px) {
				height: 700px;
			}

			// iPad Pro
			@media(min-height: 1366px) {
				height: 875px;
			}
		}
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

	import _ from 'lodash';
	import VueCode from 'vue-code';
	import 'codemirror/mode/markdown/markdown';

    //------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			codemirror: VueCode,
		},
        props: {
            page: {
                type: Object,
				required: true
			}
		},
		inject: ['state'],
		computed: {
		    live(){ return this.page.live; },
			currentRevision: {
		        get()
				{
				    if(this.page.live.revisions.length === 0)
					{
					    this.page.live.revisions.push({ content: "" });
					} // end if

					return this.page.live.revisions[0];
				},

				set(val)
				{
					if(this.page.live.revisions.length === 0)
					{
						this.page.live.revisions.push({ content: "" });
					} // end if

				    _.assign(this.page.live.revisions[0], val);
				}
			}
		},
        data()
        {
            return {
				editorOptions: {
					tabSize: 4,
//					lineNumbers: false,
					mode: 'markdown'
				}
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
