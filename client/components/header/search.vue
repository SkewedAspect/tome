<!--------------------------------------------------------------------------------------------------------------------->
<!-- search.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <b-input-group class="search-bar">
        <b-form-input v-model="searchTerm" type="text" placeholder="Search..." @keyup.enter.native="doSearch"></b-form-input>
        <b-input-group-append>
            <b-button @click="doSearch">
                <font-awesome-icon icon="search"></font-awesome-icon>
            </b-button>
        </b-input-group-append>
    </b-input-group>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .search-bar {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Imports go here

    //------------------------------------------------------------------------------------------------------------------

    export default {
        data()
        {
            return {
                searchTerm: undefined
            };
        },
        methods: {
            doSearch()
            {
                this.$router.push({ path: '/search', query: { term: this.searchTerm } });
                this.searchTerm = undefined;
            }
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
