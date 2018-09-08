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
            <header>
                <div class="float-right text-muted mt-2">
                    <small>({{ searchResults.length }} results)</small>
                </div>
                <h4>Search Results:</h4>
                <hr class="mt-0 mb-1">
            </header>
            <p class="text-center text-info mb-0 mt-0">
                <small><i>Results are sorted from best to worst match.</i></small>
            </p>
            <ul class="fa-ul">
                <li class="mt-4" v-for="results in searchResults" :key="results.page.id">
                    <font-awesome-icon icon="file-alt" transform="down-3" list-item></font-awesome-icon>
                    <router-link :to="'/wiki' + results.page.path"><h5 class="mb-0" v-html="results.match.title"></h5></router-link>
                    <small class="text-muted d-block text-monospace">
                        <span>/wiki{{ results.page.path }}</span>
                    </small>
                    <div v-html="results.match.body"></div>
                </li>
            </ul>
        </div>
    </b-container>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
    #search-page {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';

    // Managers
    import wikiMan from '../api/managers/wiki';

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
                    return wikiMan.searchPages(this.searchTerm)
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
