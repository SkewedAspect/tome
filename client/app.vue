<!--------------------------------------------------------------------------------------------------------------------->
<!-- App                                                                                                             -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="app" :class="breadcrumbs ? 'breadcrumbs-shown' : ''">
        <site-header></site-header>
        <router-view></router-view>
        <site-footer></site-footer>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#app {
		height: calc(100% - 66px);
		overflow: auto;
		margin-top: 66px;
		padding-top: 10px;

        &.breadcrumbs-shown {
            height: calc(100% - 110px);
            margin-top: 110px;
        }
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	// Components
    import SiteHeader from './components/header/index.vue';
    import SiteFooter from './components/ui/footer.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            SiteHeader,
            SiteFooter
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
            },
            breadcrumbs()
            {
                return [ 'wiki', 'history', 'comments', 'search' ].includes(this.$route.name);
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
