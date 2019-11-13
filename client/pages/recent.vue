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
                <b-card class="h-100">
                    <template slot="header">
                        <h5 class="m-0">
                            Pages
                        </h5>
                    </template>
                    Foo
                </b-card>
            </b-col>
            <b-col cols="6">
                <b-card class="h-100">
                    <template slot="header">
                        <h5 class="m-0">
                            Comments
                        </h5>
                    </template>
                    Bar
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

    // import _ from 'lodash';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        data()
        {
            return {
                maxItems: 25
            };
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
