<!----------------------------------------------------------------------------------------------------------------------
  -- Header
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <header id="site-header">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
            <b-navbar-brand to="/">
                <font-awesome-icon v-if="$siteConfig.faIcon" :icon="$siteConfig.faIcon"></font-awesome-icon>
                <b-img v-else-if="$siteConfig.localIcon" class="logo" :src="$siteConfig.localIcon" alt="Site Logo"></b-img>
                {{ $siteConfig.siteName }}
            </b-navbar-brand>
            <b-collapse id="nav_collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item to="/recent">
                        Recent
                    </b-nav-item>
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
        <breadcrumb-bar></breadcrumb-bar>
    </header>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #site-header
	{
		position: fixed;
		top: 0; left: 0; right: 0;

        .logo {
            max-height: 40px;
            margin-right: 0.25em;
        }
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Components
    import BreadcrumbBar from './breadcrumbBar.vue';
    import Login from './login.vue';
    import SearchBar from './search.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            BreadcrumbBar,
            Login,
            SearchBar
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
