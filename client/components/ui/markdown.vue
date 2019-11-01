<!----------------------------------------------------------------------------------------------------------------------
  -- Markdown Component - Allows for both text and vue components to be used.
  --------------------------------------------------------------------------------------------------------------------->

<template>
    <v-runtime-template :template="template"></v-runtime-template>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    .markdown-block {
        overflow: auto;
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

    // Components
    import VRuntimeTemplate from 'v-runtime-template';

    // Utils
    import markdown from '../../api/utils/markdown';

    //------------------------------------------------------------------------------------------------------------------

    export default {
        components: {
            VRuntimeTemplate
        },
        props: {
            text: {
                type: String,
                required: true
            }
        },
        computed: {
            template()
            {
                const htmlTxt = this.text ? markdown.render(this.text) : '';
                return `<div class="markdown-block">${ htmlTxt }</div>`;
            }
        }
    };
</script>

<!--------------------------------------------------------------------------------------------------------------------->
