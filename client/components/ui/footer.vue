<!----------------------------------------------------------------------------------------------------------------------
  -- footer.vue
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <ul id="site-footer" class="container list-inline mt-3">
        <li class="list-inline-item">
            <a :href="projectURL">
                <fa :icon="[ 'fab', 'gitlab' ]"></fa>
                GitLab Project
            </a>
        </li>
        <li class="list-inline-item">
            <a :href="issuesURL">
                <fa icon="bug"></fa>
                Report Issue
            </a>
        </li>
        <li class="text-muted">
            <small>Tome v{{ version }}</small>
        </li>
    </ul>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #site-footer {
        border-top: 1px solid #eee;
        padding-top: 15px;
        text-align: center;
        font-size: 0.85rem;
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    const { version } = require('../../../package.json');

    //------------------------------------------------------------------------------------------------------------------

    export default {
        name: 'SiteFooter',
        computed: {
            projectURL()
            {
                return 'https://gitlab.com/skewed-aspect/tome';
            },
            issuesURL()
            {
                return `${ this.projectURL }/issues/new`;
            },
            version()
            {
                return version;
            }
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
