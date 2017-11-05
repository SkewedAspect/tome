<!--------------------------------------------------------------------------------------------------------------------->
<!-- breadcrumbs.vue                                                                                                 -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div class="breadcrumbs">
        <!-- Home is always an exception -->
        <md-button class="crumb" @click="go('/wiki')">
            <md-icon>home</md-icon>
        </md-button>

        <div class="crumb-container" v-for="(crumb, index) in crumbs">
            <md-icon class="separator">keyboard_arrow_right</md-icon>
            <md-button v-if="index !== (crumbs.length - 1)" class="crumb" @click="clickCrumb(index)">{{ crumb }}</md-button>
            <span class="current-crumb" v-else>{{ crumb }}</span>
        </div>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .breadcrumbs {
		display: flex;
		align-items: center;
		align-content: center;

		.md-button {
			margin-right: 0;
			margin-left: 0;

			&.crumb {
				min-width: 30px;
				padding: 0 8px;
				text-transform: inherit;

				.md-icon {
					margin-top: -2px;
					font-size: 22px;
					width: 22px;
					min-width: 22px;
					height: 22px;
					min-height: 22px;
				}
			}
		}

		.crumb-container {
			display: flex;
			align-items: center;
			align-content: center;
		}

		.current-crumb {
			padding: 0 8px;
		}

		.md-icon.separator {
			margin: auto -2px;
		}
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Imports go here

    //------------------------------------------------------------------------------------------------------------------

    export default {
        props: {
            path: {
                type: String,
				required: true
			}
		},
		computed: {
            crumbs()
			{
			    return this.path.split('/').slice(2);
			}
		},
		methods: {
            go(url)
			{
			    this.$router.push(url);
			},
			clickCrumb(index)
			{
			    const url = `/wiki/${ this.crumbs.slice(0, index + 1).join('/') }`;
			    this.go(url);
			}
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
