<!--------------------------------------------------------------------------------------------------------------------->
<!-- search.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<b-input-group class="search-bar">
        <b-form-input type="text" placeholder="Search..." v-model="searchTerm" @keyup.enter.native="doSearch"></b-form-input>
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
        methods: {
            doSearch()
            {
                this.$router.push({ path: '/search', query: { term: this.searchTerm }});
                this.searchTerm = undefined;
            }
        },
        data()
        {
            return {
                searchTerm: undefined
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
