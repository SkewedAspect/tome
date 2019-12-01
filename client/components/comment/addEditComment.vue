<!----------------------------------------------------------------------------------------------------------------------
  -- Add or Edit Comment Component
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <b-card v-if="comment" id="add-edit-comment" class="mb-4">
        <template slot="header">
            <h4 class="m-0">
                <span v-if="isNew">New</span>
                <span v-else>Edit</span>
                Comment
            </h4>
        </template>
        <b-form novalidate @submit.prevent="save()" @reset.prevent="reset()">
            <b-form-group
                id="commentTitleGroup"
                label="Title"
                label-for="commentTitle"
            >
                <b-form-input
                    id="commentTitle"
                    v-model="comment.title"
                    type="text"
                    required
                    placeholder="Some comment title..."
                >
                </b-form-input>
            </b-form-group>

            <b-tabs @input="cmRefresh">
                <b-tab title="Markdown" class="p-3">
                    <b-card no-body style="overflow: hidden">
                        <code-mirror
                            id="commentBody"
                            ref="editor"
                            v-model="comment.body"
                            :options="cmOptions"
                        >
                        </code-mirror>
                    </b-card>
                </b-tab>
                <b-tab title="Preview" class="p-3">
                    <b-alert variant="warning" :show="!comment.body" class="text-center">
                        <fa icon="exclamation-triangle"></fa>
                        Nothing to preview.
                    </b-alert>
                    <markdown class="comment-preview" style="margin-bottom: 2px;" :text="comment.body"></markdown>
                </b-tab>
            </b-tabs>
        </b-form>

        <b-button-toolbar class="float-right">
            <b-btn variant="danger" @click="reset">
                <fa icon="undo"></fa>
                Clear
            </b-btn>
            <b-btn class="ml-2" @click="cancel">
                <fa icon="times"></fa>
                Cancel
            </b-btn>
            <b-btn variant="success" class="ml-2" :disabled="!isValid" @click="save">
                <fa icon="save"></fa>
                <span v-if="isNew">Post</span>
                <span v-else>Save</span>
                Comment
            </b-btn>
        </b-button-toolbar>
    </b-card>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #add-edit-comment {
        .CodeMirror {
            height: 200px;

            .CodeMirror-scroll {
                height: 200px;
            }
        }
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Managers
    import authMan from '../../api/managers/auth';
    import commentMan from '../../api/managers/comment';

    // Components
    import CodeMirror from 'vue-cm';
    import Markdown from '../ui/markdown.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        name: 'AddEditComment',
        components: {
            CodeMirror,
            Markdown
        },
        props: {
            comment: {
                type: Object,
                default: undefined
            }
        },
        data()
        {
            return {
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
            isNew() { return !this.comment.comment_id; },
            isValid() { return this.comment.dirty && !!this.comment.title && !!this.comment.body; }
        },
        methods: {
            cmRefresh()
            {
                this.$nextTick(() =>
                {
                    this.$refs.editor.getCodeMirror().refresh();
                });
            },
            reset()
            {
                this.comment.reset();
            },
            save()
            {
                return commentMan.saveComment(this.comment)
                    .then(() =>
                    {
                        this.$emit('saved');
                    });
            },
            cancel()
            {
                this.comment.reset();
                this.$emit('canceled');
            }
        },
        subscriptions: {
            account: authMan.account$
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
