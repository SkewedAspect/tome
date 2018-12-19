<!----------------------------------------------------------------------------------------------------------------------
  -- cmDiff.vue
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <b-card class="cm-diff" no-body style="overflow: hidden">
        <codemirror ref="editor" :merge="true" :options="cmOption"></codemirror>
    </b-card>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    .cm-diff {
        .CodeMirror-merge {
            border: none !important;
        }

        .CodeMirror-merge-r-chunk-start {
            border-top: 1px solid #dadcdf;
        }

        .CodeMirror-merge-r-chunk-end {
            border-bottom: 1px solid #dadcdf;
        }

        .CodeMirror-merge-r-chunk,
        .CodeMirror-merge-l-chunk {
            background: #eef0f3;
        }

        .CodeMirror-merge-r-connect {
            fill: #eef0f3;
            stroke: #dadcdf;
        }

        .CodeMirror-merge-r-deleted, .CodeMirror-merge-l-deleted {
            background-image: none;
            background-color: #fbe9eb;
        }

        .CodeMirror-merge-r-inserted, .CodeMirror-merge-l-inserted {
            background-image: none;
            background-color: #e6ffed;
        }
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Code Mirror
    import DiffMatchPatch from 'diff-match-patch';

    // Components
    import { codemirror } from 'vue-codemirror'

    //------------------------------------------------------------------------------------------------------------------

    window.diff_match_patch = DiffMatchPatch;
    window.DIFF_DELETE = -1;
    window.DIFF_INSERT = 1;
    window.DIFF_EQUAL = 0;

    //------------------------------------------------------------------------------------------------------------------

    export default {
        name: 'CodeMirrorDiff',
        components: {
            codemirror
        },
        props: {
            left: {
                type: String,
                required: true
            },
            right: {
                type: String,
                required: true
            }
        },
        methods: {
            cmRefresh()
            {
                this.$refs.editor.refresh();
            }
        },
        watch: {
            left(){ return this.cmRefresh(); },
            right(){ return this.cmRefresh(); }
        },
        data()
        {
            return {
                cmOption: {
                    value: this.left,
                    orig: this.right,
                    // connect: 'align',
                    mode: {
						name: "gfm",
						gitHubSpice: false,
						tokenTypeOverrides: {
							emoji: "emoji"
						}
					},
                    readOnly: true,
                    lineNumbers: true,
                    revertButtons: false,
                    collapseIdentical: true,
                    highlightDifferences: true
                }
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
