<!----------------------------------------------------------------------------------------------------------------------
  -- Recent Page
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <b-container id="recent-page">
        <header class="clearfix m-md-1">
            <b-dropdown
                id="recent-items-dropdown"
                class="float-right"
                :text="`${ Number.isFinite(maxItems) ? maxItems: 'All' }`"
                size="sm"
                right
            >
                <b-dropdown-item :active="maxItems === 5" @click="maxItems = 5">
                    5
                </b-dropdown-item>
                <b-dropdown-item :active="maxItems === 10" @click="maxItems = 10">
                    10
                </b-dropdown-item>
                <b-dropdown-item :active="maxItems === 25" @click="maxItems = 25">
                    25
                </b-dropdown-item>
                <b-dropdown-item :active="maxItems === 50" @click="maxItems = 50">
                    50
                </b-dropdown-item>
                <b-dropdown-item :active="maxItems === 100" @click="maxItems = 100">
                    100
                </b-dropdown-item>
                <b-dropdown-item :active="maxItems === Infinity" @click="maxItems = Infinity">
                    All
                </b-dropdown-item>
            </b-dropdown>
            <h4>Recent Activity</h4>
        </header>
        <hr class="clearfix mt-0" />
        <p class="text-center text-info mb-0 mt-0">
            <small><i>Results are sorted descending from most recent to least.</i></small>
        </p>

        <b-row class="mt-3">
            <b-col cols="6">
                <b-card class="h-100" no-body>
                    <template slot="header">
                        <h5 class="m-0">
                            Pages
                        </h5>
                    </template>
                    <div v-if="loadingRevisions" class="card-body text-center">
                        <h4>Loading...</h4>
                        <b-progress :value="100" animated></b-progress>
                    </div>
                    <b-list-group flush>
                        <b-list-group-item v-for="revision in revisions" :key="revision.revision_id">
                            {{ revision }}
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-col>
            <b-col cols="6">
                <b-card class="h-100" no-body>
                    <template slot="header">
                        <h5 class="m-0">
                            Comments
                        </h5>
                    </template>
                    <div v-if="loadingComments" class="card-body text-center">
                        <h4>Loading...</h4>
                        <b-progress :value="100" animated></b-progress>
                    </div>
                    <b-list-group flush>
                        <b-list-group-item v-for="comment in comments" :key="comment.comment_id">
                            {{ comment }}
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #recent-page {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Managers
    import wikiMan from '../api/managers/wiki';
    import commentMan from '../api/managers/comment';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        data()
        {
            return {
                loadingRevisions: false,
                loadingComments: false,
                maxItems: 25,
                revisions: [],
                comments: []
            };
        },
        watch: {
            maxItems()
            {
                this.reload();
            }
        },
        mounted()
        {
            this.maxItems = 25;
            this.reload();
        },
        methods: {
            async reload()
            {
                // Load Revisions
                this.loadingRevisions = true;
                this.revisions = await wikiMan.getRecent(this.maxItems)
                    .catch((ex) =>
                    {
                        console.error('Error loading revisions:', ex);
                    });
                this.loadingRevisions = false;

                // Load Comments
                this.loadingComments = true;
                this.comments = await commentMan.getRecent(this.maxItems)
                    .catch((ex) =>
                    {
                        console.error('Error loading comments:', ex);
                    });
                this.loadingComments = false;
            }
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
