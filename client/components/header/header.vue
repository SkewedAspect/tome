<!--------------------------------------------------------------------------------------------------------------------->
<!-- header.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<header id="site-header">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
            <b-navbar-brand to="/">Tome</b-navbar-brand>
            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item to="/recent">Recent</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <search-bar class="mr-2"></search-bar>
                    <b-nav-form>
						<login></login>
                    </b-nav-form>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>

		<!-- Breadcrumbs bar -->
		<breadcrumbs></breadcrumbs>
	</header>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #site-header
	{
		position: fixed;
		top: 0; left: 0; right: 0;
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Components
	import Breadcrumbs from './breadcrumbs.vue';
	import Login from './login.vue';
	import SearchBar from './searchbar.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
    	components: {
    		Breadcrumbs,
			Login,
			SearchBar
		},
        data()
        {
            return {
                // Data goes here
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
