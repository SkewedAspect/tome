<!--------------------------------------------------------------------------------------------------------------------->
<!-- Breadcrumbs Component                                                                                           -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div v-if="show" class="breadcrumb-area">
		<b-button-toolbar id="breadcrumb-buttons">
			<b-button-group class="mx-1" v-if="canView">

                <!-- Edit / Cancel  -->
				<b-btn v-if="canModify && !editing" variant="link" size="sm" :to="{ query: { edit: null } }">
					<font-awesome-icon icon="edit"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Edit</span>
				</b-btn>
				<b-btn v-else-if="editing" variant="link" size="sm" :to="{ query: {} }">
					<font-awesome-icon icon="times"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Cancel</span>
				</b-btn>

                <!-- History / Undo -->
                <b-btn v-if="canView && !editing" variant="link" size="sm" :to="historyLink">
					<font-awesome-icon icon="history"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">History</span>
				</b-btn>
				<b-btn v-else-if="editing" variant="link" size="sm" @click="broadcast('page reset')">
					<font-awesome-icon icon="undo"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Reset</span>
				</b-btn>

                <!-- Comments / Save -->
				<b-btn v-if="canView && !editing" variant="link" size="sm" :to="commentLink">
					<font-awesome-icon icon="comments"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Comments</span>
				</b-btn>
				<b-btn v-else-if="editing" variant="link" size="sm" @click="broadcast('page save')">
					<font-awesome-icon icon="save"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Save</span>
				</b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-breadcrumb id="site-breadcrumb-bar" class="mb-0" :items="breadcrumbs"></b-breadcrumb>
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

			a.btn.btn-link {
				padding-top: 0.5rem;

				& > * {
					vertical-align: middle;
				}
			}
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

	import _ from 'lodash';

    // Managers
	import authMan from '../../api/managers/auth';
	import pageMan from '../../api/managers/page';

    //------------------------------------------------------------------------------------------------------------------

    export default {
		computed: {
            path()
            {
                let path = _.get(this.$route, 'params.path', '/');
                return pageMan.normalizePath(path);
            },
			editing(){ return _.includes(_.keys(this.$route.query), 'edit'); },
			historyLink(){ return { path: `/history/${ this.$route.params.path }` }; },
			commentLink(){ return { path: `/comment/${ this.$route.params.path }` }; },

        	breadcrumbs()
			{
				let breadcrumbs = [{ text: 'wiki', to: { path: '/wiki' } }];
                let crumbPath = '/wiki';
                const pathCrumbs = _.compact(this.path.split('/'));
                _.each(pathCrumbs, (crumb) =>
                {
                    crumbPath += `/${ crumb }`;
                    breadcrumbs.push({ text: crumb, to: { path: crumbPath } });
                });

				return breadcrumbs;
			},
			canView()
			{
				if(this.page)
				{
					return pageMan.canView(this.page);
				} // end if

				return false;
			},
			canModify()
			{
				if(this.page)
				{
                    return pageMan.canModify(this.page);
				} // end if

				return false;
			},
			show(){ return _.includes(['wiki', 'history', 'comments'], this.$route.name); }
		},
		methods: {
			broadcast(event, ...args)
			{
				this.$root.$emit(event, ...args);
			}
		},
		subscriptions: {
        	account: authMan.account$,
			page: pageMan.currentPage$
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
