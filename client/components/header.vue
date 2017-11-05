<!--------------------------------------------------------------------------------------------------------------------->
<!-- Site Header                                                                                                     -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<md-toolbar id="site-header">
		<md-button class="md-icon-button">
			<md-icon>menu</md-icon>
		</md-button>

		<h2 class="md-title" style="flex: 1" @click="goToHome()">
			Tome Wiki
		</h2>

		<login></login>
	</md-toolbar>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss">
	#site-header {
		.md-title {
			cursor: pointer;
		}
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	import stateSvc from '../services/state';
	import LoginComponent from './login.vue';

    export default {
		components: {
			login: LoginComponent
		},
        data()
        {
            return {
				state: stateSvc.state
			};
        },
		computed: {
			account(){ return this.state.account; }
		},
		methods: {
			goToHome()
			{
				this.$router.push('/');
			}
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
