<!--------------------------------------------------------------------------------------------------------------------->
<!-- Breadcrumbs Component                                                                                           -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div v-if="show" class="breadcrumb-area">
        <!-- Wiki Toolbar Buttons -->
        <b-button-toolbar v-if="routeName === 'wiki'" id="breadcrumb-buttons">
            <b-button-group v-if="canView" class="mx-1">
                <!-- Edit / Cancel  -->
                <b-btn v-if="canModify && !editing" variant="link" size="sm" :to="{ query: { edit: null } }">
                    <fa icon="edit"></fa><span class="ml-1 d-none d-sm-inline-block">Edit</span>
                </b-btn>
                <b-btn v-else-if="editing" variant="link" size="sm" :to="{ query: {} }">
                    <fa icon="times"></fa><span class="ml-1 d-none d-sm-inline-block">Cancel</span>
                </b-btn>

                <!-- History / Undo -->
                <b-btn v-if="canView && !editing" variant="link" size="sm" :to="historyLink">
                    <fa icon="history"></fa><span class="ml-1 d-none d-sm-inline-block">History</span>
                </b-btn>
                <b-btn v-else-if="editing" variant="link" size="sm" @click="broadcast('page reset')">
                    <fa icon="undo"></fa><span class="ml-1 d-none d-sm-inline-block">Reset</span>
                </b-btn>

                <!-- Comments / Save -->
                <b-btn v-if="canView && !editing" variant="link" size="sm" :to="commentLink">
                    <fa icon="comments"></fa><span class="ml-1 d-none d-sm-inline-block">Comments</span>
                </b-btn>
                <b-btn v-else-if="editing" variant="link" size="sm" @click="broadcast('page save')">
                    <fa icon="save"></fa><span class="ml-1 d-none d-sm-inline-block">Save</span>
                </b-btn>
            </b-button-group>
        </b-button-toolbar>

        <!-- Comments Toolbar Buttons -->
        <b-button-toolbar v-else-if="routeName === 'comments'" id="breadcrumb-buttons">
            <b-button-group v-if="canView" class="mx-1">
                <!-- Wiki -->
                <b-btn v-if="canView" variant="link" size="sm" :to="wikiLink">
                    <fa icon="file-alt"></fa><span class="ml-1 d-none d-sm-inline-block">Wiki</span>
                </b-btn>

                <!-- History -->
                <b-btn v-if="canView" variant="link" size="sm" :to="historyLink">
                    <fa icon="history"></fa><span class="ml-1 d-none d-sm-inline-block">History</span>
                </b-btn>
            </b-button-group>
        </b-button-toolbar>

        <!-- History Toolbar Buttons -->
        <b-button-toolbar v-else-if="routeName === 'history'" id="breadcrumb-buttons">
            <b-button-group v-if="canView" class="mx-1">
                <!-- Wiki -->
                <b-btn v-if="canView" variant="link" size="sm" :to="wikiLink">
                    <fa icon="file-alt"></fa><span class="ml-1 d-none d-sm-inline-block">Wiki</span>
                </b-btn>

                <!-- Comments -->
                <b-btn v-if="canView" variant="link" size="sm" :to="commentLink">
                    <fa icon="comments"></fa><span class="ml-1 d-none d-sm-inline-block">Comments</span>
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

    // Utils
    import pathUtils from '../../api/utils/path';

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
                const path = _.get(this.$route, 'params.path', '/');
                return pathUtils.normalizePath(path);
            },
            editing() { return _.includes(_.keys(this.$route.query), 'edit'); },
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
                const breadcrumbs = [ { text: 'wiki', to: { path: '/wiki' }, active: pathCrumbs.length === 0 && this.$route.name === 'wiki' } ];
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
                if(this.page && this.account)
                {
                    return wikiMan.canModify(this.page);
                } // end if

                return false;
            },
            routeName() { return this.$route.name; },
            show() { return _.includes([ 'wiki', 'history', 'comments', 'search' ], this.$route.name); }
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
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
