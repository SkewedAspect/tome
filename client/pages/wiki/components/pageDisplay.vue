<!--------------------------------------------------------------------------------------------------------------------->
<!-- pageDisplay.vue                                                                                                         -->
<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <div id="page-display">
		<div id="page-content"></div>
	</div>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style lang="scss" scoped>
    #page-display {
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
    //------------------------------------------------------------------------------------------------------------------

	import Vue from 'vue';
	import markdown from '../../../lib/markdown';

	// Managers
	import pageMan from '../../../api/managers/page';

	//------------------------------------------------------------------------------------------------------------------

	let mdComponent;

    //------------------------------------------------------------------------------------------------------------------

    export default {
		subscriptions: {
        	page: pageMan.currentPage$
		},
		mounted()
		{
			this.$subscribeTo(pageMan.currentPage$, (page) =>
			{
				const htmlTxt = !!page ? markdown.render(page.body) : '';
				const res = Vue.compile(`<div id="page-display">\n${ htmlTxt }\n</div>`);

				// Build and mount the new component
				mdComponent = new Vue({ parent: this, render: res.render, staticRenderFns: res.staticRenderFns });
				mdComponent.$mount('#page-content');
			});
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
