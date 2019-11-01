<!----------------------------------------------------------------------------------------------------------------------
  -- breadcrumbs
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <b-breadcrumb class="breadcrumbs mb-0">
        <b-breadcrumb-item v-for="crumb in crumbs" :key="JSON.stringify(crumb)" v-bind="crumb"></b-breadcrumb-item>
    </b-breadcrumb>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .breadcrumbs {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    import _ from 'lodash';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        props: {
            items: {
                type: Array,
                required: true
            }
        },
        computed: {
            crumbs()
            {
                if(this.items && this.items.length > 0)
                {
                    const lastItem = _.last(this.items);

                    if(lastItem && _.isUndefined(lastItem.active))
                    {
                        lastItem.active = true;
                    } // end if

                    return this.items;
                } // end if

                return undefined;
            }
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
