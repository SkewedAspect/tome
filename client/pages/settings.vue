<!--------------------------------------------------------------------------------------------------------------------->
<!-- Settings Page                                                                                                       -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
	<div id="settings-page">
		<header id="settings-header">
			<md-avatar class="md-large">
				<img :src="accountAvatar">
			</md-avatar>
			<div class="md-display-3 name">{{ account.name }}</div>
			<div class="md-caption email">{{ account.email }}</div>

			<md-input-container class="display-name-container">
				<md-input v-model="displayName"
						  :disabled="!editing"
						  placeholder="Display Name"
						  maxlength="25">
				</md-input>
			</md-input-container>
			<div v-if="!editing">
				<md-button class="md-raised md-primary" @click="editDisplayName()">Edit</md-button>
			</div>
			<div v-else>
				<md-button class="md-raised md-accent" @click="saveDisplayName()">Save</md-button>
			</div>
		</header>
	</div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style rel="stylesheet/scss" lang="sass">
	#settings-page {
		padding: 16px;

		#settings-header {
			text-align: center;

			.md-avatar {
				margin: 0 auto;
			}

			.name {
				margin-top: 20px;
			}

			.email {
				margin-top: 20px;
			}

			.display-name-container {
				width: 200px;
				margin-top: 20px;
				margin-bottom: 5px;
				margin-left: auto;
				margin-right: auto;
			}
		}
	}
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import stateSvc from '../services/state';
	import accountSvc from '../services/account';

	//------------------------------------------------------------------------------------------------------------------

    export default {
        data: function()
        {
            return {
            	state: stateSvc.state,
				editing: false,
				displayName: null
			};
		},
		beforeRouteEnter (to, from, next)
		{
			if(!stateSvc.state.account)
			{
				next('/');
			}
			else
			{
				next();
			} // end if
		},
		computed: {
			account()
			{
				return this.state.account;
			},
			accountAvatar()
			{
				const id = this.account.id.replace(/-/g, '');
				return this.account.avatar || `https://identicons.github.com/${ id }.png`;
			}
		},
		methods: {
			editDisplayName()
			{
				this.editing = true;
			},
			saveDisplayName()
			{
				const oldName = this.account.displayName;
				this.account.displayName = this.displayName;
				return accountSvc.save()
					.then(() =>
					{
						this.displayName = this.account.displayName;
						this.editing = false;
					})
					.catch((error) =>
					{
						this.displayName = oldName;
						this.account.displayName = oldName;
						this.editing = false;

						console.error('Error saving account.', error);
					});
			}
		},
		mounted()
		{
			this.displayName = this.account.displayName;
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
