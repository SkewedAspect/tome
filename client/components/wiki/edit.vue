<!--------------------------------------------------------------------------------------------------------------------->
<!-- Edit Wiki Pages
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="page-edit" v-if="page">
        <!-- TODO: Finish implementing error handling. -->
		<b-alert variant="danger">
			<font-awesome-icon icon="exclamation-triangle"/>
			Unable to save. (For some reason or another. Who knows. Gremlins, maybe?)
		</b-alert>

        <!-- Edit Page Form -->
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

            <b-tabs @input="cmRefresh">
                <b-tab title="Markdown" class="p-3">
                    <b-card no-body style="overflow: hidden">
                        <code-mirror
                            id="pageBody"
                            ref="editor"
                            v-model="pageBody"
                            :options="cmOptions">
                        </code-mirror>
                    </b-card>
                </b-tab>
                <b-tab title="Preview" class="p-3">
                    <markdown class="page-preview" style="margin-bottom: 2px;" :text="pageBody"></markdown>
                </b-tab>
            </b-tabs>

            <!-- Advanced Editing -->

            <hr>

            <div class="float-right">
                <b-btn variant="outline-secondary" class="mt-1" v-b-toggle.advCollapse style="width: 107px">
                    <span class="when-opened">
                        <font-awesome-icon icon="compress-alt"></font-awesome-icon>
                        Collapse
                    </span>
                    <span class="when-closed">
                        <font-awesome-icon icon="expand-alt"></font-awesome-icon>
                        Expand
                    </span>
                </b-btn>
            </div>

            <h4>Advanced settings</h4>
            <p class="text-responsive">
                Perform advanced options, such as changing page permissions, moving or removing this page.
            </p>

            <b-collapse id="advCollapse">

                <!-- Permissions -->
                <b-card bg-variant="light" class="mb-3">
                    <h5>Permissions</h5>
                    <b-form-row>
                        <b-col>
                            <b-form-group
                                label="View"
                                label-for="viewPerm">
                                <b-form-input id="viewPerm"
                                    type="text"
                                    v-model="page.actions.wikiView"
                                    required
                                    placeholder="inherited">
                                </b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group
                                label="Modify"
                                label-for="modifyPerm">
                                <b-form-input id="modifyPerm"
                                    type="text"
                                    v-model="page.actions.wikiModify"
                                    required
                                    placeholder="inherited">
                                </b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-form-row>
                </b-card>

                <!-- Move Page -->
                <b-card bg-variant="light" class="mb-3">
                    <h5 class="text-warning">Move Page</h5>
                    <p class="text-muted text-responsive">
                        Moving a page <b>does not</b> alter the links referencing it. You will have to manually edit
                        links to this page to point to the new url.
                    </p>

                    <b-form-group
                        label="Path"
                        label-for="movePage">
                        <b-form-input id="movePage"
                            type="text"
                            v-model="page.path"
                            required>
                        </b-form-input>
                    </b-form-group>

                    <b-btn variant="warning">
                        Move Page
                    </b-btn>
                </b-card>

                <!-- Delete Page -->
                <b-card bg-variant="light">
                    <h5 class="text-danger">Delete Page</h5>
                    <p class="text-muted text-responsive">
                        Deleting the page will make it appear that there never was a page at this url. However, it
                        <i>is</i> possible to recover by going to the page history, and reverting the delete revision.
                    </p>

                    <b-btn variant="danger">
                        Delete Page
                    </b-btn>
                </b-card>
            </b-collapse>

            <hr>

            <!-- Page Controls -->

            <b-form-row>
                <b-col sm="12" md="6" offset-md="6" class="mb-3 d-flex">
                    <b-button class="w-100 mr-2" type="reset" variant="secondary" :to="{ query: {} }">
                        <font-awesome-icon icon="times"/>
                        Cancel
                    </b-button>
                    <b-button class="w-100 mr-2" type="reset" variant="danger" @click="reset()">
                        <font-awesome-icon icon="undo"/>
                        Reset
                    </b-button>
                    <b-button class="w-100" type="submit" variant="success" @click="save()">
                        <font-awesome-icon icon="save"/>
                        Save
                    </b-button>
                </b-col>
            </b-form-row>
		</b-form>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #page-edit {
        .text-responsive {
            @media (max-width: 991px) {
                font-size: 0.85rem;
            }
        }

        .collapsed > .when-opened,
        :not(.collapsed) > .when-closed {
            display: none;
        }

        .page-preview,
		.CodeMirror {
			height: calc(100vh - 455px);

			@media (max-width: 991px) {
				height: calc(100vh - 470px);
			}

			.CodeMirror-scroll {
				min-height: calc(100vh - 455px);

				@media (max-width: 991px) {
					min-height: calc(100vh - 470px);
				}
			}
		}
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';

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
	import pageMan from '../../api/managers/page';

	// Components
	import CodeMirror from 'vue-cm'
    import Markdown from "../ui/markdown.vue";

    //------------------------------------------------------------------------------------------------------------------

    export default {
		components: {
			CodeMirror,
            Markdown
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
        computed: {
		    pageBody: {
		        get()
                {
                    return _.get(this.page, 'body', '');
                },
                set(val)
                {
                    this.$set(this.page, 'body', val);
                }
            }
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
			},
            cmRefresh()
            {
                this.$nextTick(() =>
                {
                    this.$refs.editor.getCodeMirror().refresh();
                });
            }
		},
		subscriptions: {
			page: pageMan.currentPage$
		},
		beforeDestroy() {
			this.$root.$off('page reset', this.reset);
			this.$root.$off('page save', this.save);
		},
		created()
		{
			this.$root.$on('page reset', this.reset);
			this.$root.$on('page save', this.save);
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
