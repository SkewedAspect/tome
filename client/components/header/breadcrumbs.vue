<!--------------------------------------------------------------------------------------------------------------------->
<!-- breadcrumbs.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div class="breadcrumb-area">
		<b-button-toolbar id="breadcrumb-buttons">
			<b-button-group class="mx-1">
				<b-btn variant="link" size="sm">
					<font-awesome-icon icon="edit"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Edit</span>
				</b-btn>
				<b-btn variant="link" size="sm">
					<font-awesome-icon icon="history"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">History</span>
				</b-btn>
				<b-btn variant="link" size="sm">
					<font-awesome-icon icon="comments"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Comments</span>
				</b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-breadcrumb id="site-breadcrumb-bar" :items="[{ text: 'Foo' }, { text: 'Bar' }, { text: 'Baz' }]"/>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .breadcrumb-area {
		position: relative;

		#breadcrumb-buttons {
			height: 100%;
			position: absolute;
			right: 1rem;
		}

		#site-breadcrumb-bar {
			font-size: 0.85rem;
			border-radius: 0;
		}
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
                // Data goes here
            };
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
