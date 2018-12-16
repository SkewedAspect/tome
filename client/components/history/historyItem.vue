<!--------------------------------------------------------------------------------------------------------------------->
<!-- HistoryItem                                                                                                     -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <b-list-group-item class="history-item" class="flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">Revision {{ revision.revNumber }}</h5>
            <b-button-toolbar>
                <b-btn size="sm" v-if="page.revision_id !== revision.revision_id">
                    <font-awesome-icon icon="undo"></font-awesome-icon>
                    Revert
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
        <b-collapse :id="`diff-collapse-${ revision.revision_id }`">
            <h4>DIFF GOES HERE!!!!</h4>
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

    //------------------------------------------------------------------------------------------------------------------

    export default {
        name: 'HistoryItem',
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
        subscriptions: {
            page: wikiMan.currentPage$
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
