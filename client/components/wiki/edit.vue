<!----------------------------------------------------------------------------------------------------------------------
  -- Edit Wiki Pages
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <div v-if="page" id="page-edit">
        <!-- TODO: Finish implementing error handling. -->
        <b-alert variant="danger">
            <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
            Unable to save. (For some reason or another. Who knows. Gremlins, maybe?)
        </b-alert>

        <!-- Edit Page Form -->
        <b-form :validated="formValidated" novalidate @submit.prevent="save()" @reset.prevent="reset()">
            <b-form-group
                id="pageTitleGroup"
                label="Title"
                label-for="pageTitle"
            >
                <b-form-input
                    id="pageTitle"
                    v-model="page.title"
                    type="text"
                    required
                    placeholder="Some page title..."
                >
                </b-form-input>
            </b-form-group>

            <b-tabs @input="cmRefresh">
                <b-tab title="Markdown" class="p-3">
                    <b-card no-body style="overflow: hidden">
                        <code-mirror
                            id="pageBody"
                            ref="editor"
                            v-model="pageBody"
                            :options="cmOptions"
                        >
                        </code-mirror>
                    </b-card>
                </b-tab>
                <b-tab title="Preview" class="p-3">
                    <markdown class="page-preview" style="margin-bottom: 2px;" :text="pageBody"></markdown>
                </b-tab>
            </b-tabs>

            <!-- Advanced Editing -->

            <hr />

            <div class="float-right">
                <b-btn v-b-toggle.adv-collapse variant="outline-secondary" class="mt-1" style="width: 107px">
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

            <b-collapse id="adv-collapse">
                <!-- Permissions -->
                <b-card bg-variant="light" class="mb-3">
                    <h5>Permissions</h5>
                    <b-form-row>
                        <b-col>
                            <b-form-group
                                label="View"
                                label-for="viewPerm"
                            >
                                <b-form-input
                                    id="viewPerm"
                                    v-model="page.action_view"
                                    type="text"
                                    required
                                    placeholder="inherited"
                                >
                                </b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group
                                label="Modify"
                                label-for="modifyPerm"
                            >
                                <b-form-input
                                    id="modifyPerm"
                                    v-model="page.action_modify"
                                    type="text"
                                    required
                                    placeholder="inherited"
                                >
                                </b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-form-row>

                    <b-btn variant="success" :disabled="permsChanged" @click="savePerms">
                        Save Permissions
                    </b-btn>
                </b-card>

                <!-- Move Page -->
                <b-card v-if="page.page_id && page.body !== null" bg-variant="light" class="mb-3">
                    <h5 class="text-warning">
                        Move Page
                    </h5>
                    <p class="text-muted text-responsive">
                        Moving a page <b>does not</b> alter the links referencing it. You will have to manually edit
                        links to this page to point to the new url.
                    </p>

                    <b-form-group
                        label="Path"
                        label-for="movePage"
                    >
                        <b-form-input
                            id="movePage"
                            v-model="page.path"
                            type="text"
                            required
                        >
                        </b-form-input>
                    </b-form-group>

                    <b-btn variant="warning" :disabled="page.path === page._ref.path" @click="movePage">
                        Move Page
                    </b-btn>
                </b-card>

                <!-- Delete Page -->
                <b-card v-if="page.page_id && page.body !== null" bg-variant="light">
                    <h5 class="text-danger">
                        Delete Page
                    </h5>
                    <p class="text-muted text-responsive">
                        Deleting the page will make it appear that there never was a page at this url. However, it
                        <i>is</i> possible to recover by going to the page history, and reverting the delete revision.
                    </p>

                    <b-btn v-b-modal.delModal variant="danger">
                        Delete Page
                    </b-btn>
                </b-card>
            </b-collapse>

            <hr />

            <!-- Page Controls -->
            <b-form-row>
                <b-col sm="12" md="6" offset-md="6" class="mb-3 d-flex">
                    <b-button class="w-100 mr-2" type="reset" variant="secondary" :to="{ query: {} }">
                        <font-awesome-icon icon="times"></font-awesome-icon>
                        Cancel
                    </b-button>
                    <b-button class="w-100 mr-2" type="reset" variant="danger">
                        <font-awesome-icon icon="undo"></font-awesome-icon>
                        Reset
                    </b-button>
                    <b-button class="w-100" type="submit" variant="success" :disabled="!page.dirty">
                        <font-awesome-icon icon="save"></font-awesome-icon>
                        Save
                    </b-button>
                </b-col>
            </b-form-row>
        </b-form>

        <!-- Modals -->
        <b-modal id="delModal" size="lg" ok-variant="danger" ok-title="Delete" @ok="deletePage">
            <template slot="modal-title">
                <font-awesome-icon class="text-danger" icon="exclamation-triangle"></font-awesome-icon>
                Delete page "{{ page.title }}"
            </template>

            <p>
                <b>Are you sure you want to delete this page?</b>
            </p>
            <p class="text-muted">
                Generally, it is not recommended to delete pages; instead you can simply remove the contents and
                replace it with explanatory text about why the page was deleted.
            </p>
            <p>
                While it is possible to undo this operation, you will need to remember that a page existed at the url
                <code>/wiki{{ page.path }}</code> and then check the page history to revert.
            </p>
        </b-modal>
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

    // Managers
    import wikiMan from '../../api/managers/wiki';

    // Components
    import CodeMirror from 'vue-cm';
    import Markdown from '../ui/markdown.vue';

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
                        name: 'gfm',
                        gitHubSpice: false,
                        tokenTypeOverrides: {
                            emoji: 'emoji'
                        }
                    },
                    lineNumbers: true,
                    theme: 'default'
                }
            };
        },
        computed: {
            permsChanged()
            {
                const actionView = _.get(this.page, 'action_view', {});
                const actionModify = _.get(this.page, 'action_modify', {});
                const actionViewRef = _.get(this.page._ref, 'action_modify', {});
                const actionModifyRef = _.get(this.page._ref, 'action_modify', {});

                return _.isEqual(actionView, actionViewRef) || _.isEqual(actionModify, actionModifyRef);
            },
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
        beforeDestroy()
        {
            this.$root.$off('page reset', this.reset);
            this.$root.$off('page save', this.save);
        },
        created()
        {
            this.$root.$on('page reset', this.reset);
            this.$root.$on('page save', this.save);
        },
        methods: {
            save()
            {
                this.formValidated = true;
                return wikiMan.savePage(this.page)
                    .then(() =>
                    {
                        this.formValidated = false;
                        this.$router.push({ query: {} });
                    });
            },
            savePerms()
            {
                this.formValidated = true;

                // Copy the changed to the actions
                const actions = _.get(this.page, 'actions');

                // We reset the page, to reset any other changes.
                this.page.reset();

                // Reset the permissions
                _.assign(this.page.actions, actions);

                // Save the page
                return wikiMan.savePage(this.page)
                    .then(() =>
                    {
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
            },
            movePage()
            {
                // Pull out the new path
                const newPath = this.page.path;

                // Reset any other changes to the page, including the path change.
                this.page.reset();

                // Move the page
                return wikiMan.movePage(this.page, newPath)
                    .then(() =>
                    {
                        this.$router.push({ path: `/wiki${ newPath }`, query: {} });
                    });
            },
            deletePage()
            {
                const path = this.page.path;
                return wikiMan.deletePage(path)
                    .then(() =>
                    {
                        this.$router.push({ path: `/wiki${ path }`, query: {} });
                    });
            }
        },
        subscriptions: {
            page: wikiMan.currentPage$
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
