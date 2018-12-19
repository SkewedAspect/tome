<!--------------------------------------------------------------------------------------------------------------------->
<!-- HistoryItem                                                                                                     -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <b-list-group-item class="history-item" class="flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">Revision {{ revision.revNumber }}</h5>
            <b-button-toolbar>
                <b-btn size="sm" style="width: 85px" v-if="page.revision_id !== revision.revision_id">
                    <font-awesome-icon icon="undo"></font-awesome-icon>
                    Revert
                </b-btn>
                <b-btn variant="outline-primary" size="sm" style="width: 85px" v-else disabled>
                    <font-awesome-icon icon="check"></font-awesome-icon>
                    Current
                </b-btn>
                <b-btn class="ml-2" variant="outline-secondary" size="sm" v-b-toggle="`diff-collapse-${ revision.revision_id }`" style="width: 100px">
                    <span class="when-opened">
                        <font-awesome-icon icon="compress-alt"></font-awesome-icon>
                        Hide Diff
                    </span>
                    <span class="when-closed">
                        <font-awesome-icon icon="expand-alt"></font-awesome-icon>
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
                <small class="text-muted" v-b-tooltip.html.hover :title="editedDate">{{ editedFromNow }}</small>
            </div>
        </div>
        <b-collapse :id="`diff-collapse-${ revision.revision_id }`" @shown="onShown" @hidden="onHidden">
            <cm-diff class="mt-2" ref="cm" :left="revision.body" :right="prevBody" v-if="shown"></cm-diff>
            <div class="cm-placeholder text-center" v-else>
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
                type: Object
            }
        },
        computed: {
            editedDate(){ return moment(this.revision.edited).format('MMMM Do YYYY,<br> h:mm a'); },
            editedFromNow(){ return moment(this.revision.edited).fromNow(); },
            prevBody(){ return _.get(this.prevRevision, 'body', ''); },
            diff(){ return diffTrimmedLines(this.prevBody, this.revision.body); },
            diffAdditions()
            {
                return _.reduce(this.diff, (accum, change) =>
                {
                    if(change.added)
                    {
                        return accum + change.count;
                    } // end if

                    return accum;
                }, 0)
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
                }, 0)
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
            }
        },
        subscriptions: {
            page: wikiMan.currentPage$
        },
        data()
        {
            return {
                shown: false
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
