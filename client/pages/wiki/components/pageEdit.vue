<!--------------------------------------------------------------------------------------------------------------------->
<!-- pageEdit                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div class="page-edit">
		<b-form @submit.prevent="save()" @reset.prevent="reset()">
			<b-form-group id="pageTitleGroup"
						  label="Title"
						  label-for="pageTitle">
				<b-form-input id="pageTitle"
							  type="text"
							  v-model="page.title"
							  required
							  placeholder="Some page title...">
				</b-form-input>
			</b-form-group>
			<b-form-group id="pageBodyGroup"
						  label="Body"
						  label-for="pageBody">
				<b-form-textarea id="pageBody"
							  type="text"
							  v-model="page.body"
							  rows="16"
							  required
							  placeholder="Page content...">
				</b-form-textarea>
			</b-form-group>
			<b-button type="submit" variant="primary">Submit</b-button>
			<b-button type="reset" variant="danger">Reset</b-button>
		</b-form>
    </div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .page-edit {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

	// Managers
	import pageMan from '../../../api/managers/page';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        data()
        {
            return {
                dirty: true
            };
		},
		methods: {
        	save()
			{
				return pageMan.save(this.page)
					.then(() =>
					{
						this.$router.push({ query: {} });
					});
			},
			reset()
			{
				this.page.reset();
			}
		},
		subscriptions: {
			page: pageMan.currentPage$
        }
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
