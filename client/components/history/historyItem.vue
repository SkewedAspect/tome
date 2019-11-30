<!--------------------------------------------------------------------------------------------------------------------->
<!-- HistoryItem                                                                                                     -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <b-list-group-item class="history-item flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">
                Revision {{ revision.revNumber }}
            </h5>
            <b-button-toolbar>
                <b-btn v-if="page.revision_id === revision.revision_id" variant="outline-primary" size="sm" style="width: 85px" disabled>
                    <fa icon="check"></fa>
                    Current
                </b-btn>
                <b-btn v-else-if="page.body === revision.body" variant="outline-secondary" size="sm" style="width: 85px" disabled>
                    <fa icon="ban"></fa>
                    No Diff
                </b-btn>
                <b-btn v-else size="sm" style="width: 85px" :disabled="!!savingRevision" @click="revert(revision)">
                    <fa v-if="savingRevision !== revision.revision_id" icon="undo"></fa>
                    <fa v-else icon="spinner" spin></fa>
                    Revert
                </b-btn>
                <b-btn v-b-toggle="`diff-collapse-${ revision.revision_id }`" class="ml-2" variant="outline-secondary" size="sm" style="width: 100px">
                    <span class="when-opened">
                        <fa icon="compress-alt"></fa>
                        Hide Diff
                    </span>
                    <span class="when-closed">
                        <fa icon="expand-alt"></fa>
                        Show Diff
                    </span>
                </b-btn>
            </b-button-toolbar>
        </div>
        <div class="d-flex w-100 justify-content-between">
            <div>
                <small class="text-muted">
                    Changes with
                    <span class="text-success">{{ diffAdditions }} addition<span v-if="diffAdditions > 1">s</span></span>, and
                    <span class="text-danger">{{ diffDeletions }} deletion<span v-if="diffDeletions > 1">s</span></span>.
                </small>
            </div>
            <div>
                <small v-b-tooltip.html.hover class="text-muted" :title="editedDate">{{ editedFromNow }}</small>
            </div>
        </div>
        <b-collapse :id="`diff-collapse-${ revision.revision_id }`" @shown="onShown" @hidden="onHidden">
            <cm-diff v-if="shown" ref="cm" class="mt-2" :left="revision.body" :right="prevBody"></cm-diff>
            <div v-else class="cm-placeholder text-center">
                <h4>Loading...</h4>
                <b-progress variant="primary" :value="100" animated></b-progress>
            </div>
        </b-collapse>
    </b-list-group-item>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .history-item {
        .collapsed > .when-opened,
        :not(.collapsed) > .when-closed {
            display: none;
        }

        .cm-placeholder {
            height: 350px;
        }
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';
    import moment from 'moment';
    import { diffTrimmedLines } from 'diff';

    // Managers
    import wikiMan from '../../api/managers/wiki';

    // Components
    import CmDiff from '../ui/cmDiff.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        name: 'HistoryItem',
        components: {
            CmDiff
        },
        props: {
            revision: {
                type: Object,
                required: true
            },
            prevRevision: {
                type: Object,
                default: undefined
            }
        },
        data()
        {
            return {
                shown: false,
                savingRevision: undefined
            };
        },
        computed: {
            editedDate() { return moment(this.revision.edited).format('MMMM Do YYYY,<br> h:mm a'); },
            editedFromNow() { return moment(this.revision.edited).fromNow(); },
            prevBody() { return _.get(this.prevRevision, 'body', ''); },
            diff() { return diffTrimmedLines(this.prevBody, this.revision.body); },
            diffAdditions()
            {
                return _.reduce(this.diff, (accum, change) =>
                {
                    if(change.added)
                    {
                        return accum + change.count;
                    } // end if

                    return accum;
                }, 0);
            },
            diffDeletions()
            {
                return _.reduce(this.diff, (accum, change) =>
                {
                    if(change.removed)
                    {
                        return accum + change.count;
                    } // end if

                    return accum;
                }, 0);
            },
            wikiLink()
            {
                const path = this.$route.params.path;
                return { path: _.isUndefined(path) ? '/wiki' : `/wiki/${ path }` };
            }
        },
        methods: {
            onShown()
            {
                this.shown = true;
            },
            onHidden()
            {
                this.shown = false;
            },
            refresh()
            {
                this.$refs.cm.cmRefresh();
            },
            revert(revision)
            {
                this.savingRevision = revision.revision_id;

                this.page.body = revision.body;
                return wikiMan.savePage(this.page)
                    .then(() =>
                    {
                        this.$router.push(this.wikiLink);
                        this.savingRevision = undefined;
                    })
                    .catch((error) =>
                    {
                        console.error('Error reverting revision.', error);
                        this.savingRevision = undefined;
                    });
            }
        },
        subscriptions: {
            page: wikiMan.currentPage$
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
