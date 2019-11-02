<!--------------------------------------------------------------------------------------------------------------------->
<!-- App                                                                                                             -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="app">
        <site-header></site-header>
        <router-view></router-view>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#app {
		height: calc(100% - 100px);
		overflow: auto;
		margin-top: 100px;
		padding-top: 10px;
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	// Components
    import SiteHeader from './components/header/index.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            SiteHeader
        },
        computed: {
            bootswatchCSS()
            {
                const theme = this.$siteConfig.bootswatch;
                if(theme)
                {
                    return `https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/${ theme }/bootstrap.min.css`;
                } // end if

                return undefined;
            }
        },
        metaInfo()
        {
            if(this.bootswatchCSS)
            {
                return {
                    link: [
                        { rel: 'stylesheet', href: this.bootswatchCSS }
                    ]
                };
            } // end if
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
