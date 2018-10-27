<!--------------------------------------------------------------------------------------------------------------------->
<!-- Breadcrumbs Component                                                                                           -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div v-if="show" class="breadcrumb-area">

        <!-- Wiki Toolbar Buttons -->
		<b-button-toolbar id="breadcrumb-buttons" v-if="routeName === 'wiki'">
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

        <!-- Comments Toolbar Buttons -->
        <b-button-toolbar id="breadcrumb-buttons" v-else-if="routeName === 'comments'">
            <b-button-group class="mx-1" v-if="canView">

                <!-- Wiki -->
                <b-btn v-if="canView" variant="link" size="sm" :to="wikiLink">
                    <font-awesome-icon icon="file-alt"></font-awesome-icon><span class="ml-1 d-none d-sm-inline-block">Wiki</span>
                </b-btn>
            </b-button-group>
        </b-button-toolbar>

        <breadcrumbs id="site-breadcrumb-bar" class="mb-0" :items="breadcrumbs"></breadcrumbs>
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
	import wikiMan from '../../api/managers/wiki';

	// Components
    import Breadcrumbs from '../ui/breadcrumbs.vue';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            Breadcrumbs
        },
		computed: {
            path()
            {
                let path = _.get(this.$route, 'params.path', '/');
                return wikiMan.normalizePath(path);
            },
			editing(){ return _.includes(_.keys(this.$route.query), 'edit'); },
			historyLink()
            {
                const path = this.$route.params.path;
                return { path: _.isUndefined(path) ? '/history' : `/history/${ path }` };
            },
			commentLink()
            {
                const path = this.$route.params.path;
                return { path: _.isUndefined(path) ? '/comment' : `/comment/${ path }` };
            },
            wikiLink()
            {
                const path = this.$route.params.path;
                return { path: _.isUndefined(path) ? '/wiki' : `/wiki/${ path }` };
            },

        	breadcrumbs()
			{
                let crumbPath = '/wiki';
                const pathCrumbs = _.compact(this.path.split('/'));
                let breadcrumbs = [{ text: 'wiki', to: { path: '/wiki' }, active: pathCrumbs.length === 0 && this.$route.name === 'wiki' }];
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
					return wikiMan.canView(this.page);
				} // end if

				return false;
			},
			canModify()
			{
				if(this.page)
				{
                    return wikiMan.canModify(this.page);
				} // end if

				return false;
			},
            routeName(){ return this.$route.name; },
			show(){ return _.includes(['wiki', 'history', 'comments', 'search'], this.$route.name); }
		},
		methods: {
			broadcast(event, ...args)
			{
				this.$root.$emit(event, ...args);
			}
		},
		subscriptions: {
        	account: authMan.account$,
			page: wikiMan.currentPage$
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
