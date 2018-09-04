<!--------------------------------------------------------------------------------------------------------------------->
<!-- Search Page
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <b-container id="search-page">
        <div v-if="!searchTerm">
            <h4 class="text-center">Please use the search bar to search for a page.</h4>
        </div>
        <div v-else-if="!searchResults || searchResults.length === 0">
            <h4 class="text-center">No results found.</h4>
        </div>
        <div v-else>
            Results: {{ searchResults }}
        </div>
    </b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #search-page {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';

    // Managers
    import pageMan from '../api/managers/page';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        computed: {
            searchTerm(){ return _.get(this.$route, 'query.term'); }
        },
        watch: {
            '$route'()
            {
                this.doSearch();
            }
        },
        methods: {
            doSearch()
            {
                if(this.searchTerm)
                {
                    return pageMan.searchPages(this.searchTerm)
                        .then((results) =>
                        {
                            this.$set(this, 'searchResults', results);
                        });
                } // end if
            }
        },
        data()
        {
            return {
                searchResults: undefined
            };
        },
        mounted()
        {
            this.doSearch();
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
