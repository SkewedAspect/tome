<!--------------------------------------------------------------------------------------------------------------------->
<!-- wikiLink.vue                                                                                                    -->
<!--------------------------------------------------------------------------------------------------------------------->
<template>
	<!-- TODO: This needs to get all the wonderful functionality of a true wiki link. -->
    <a :href="url" class="wiki-link" :class="{ 'text-danger': !exists }" @click="handleClick">
		<slot></slot>
		<font-awesome-icon v-if="isExternal" icon="external-link-alt" size="xs" />
		<font-awesome-icon v-else-if="isPrivate" icon="lock-alt" size="xs" />
	</a>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<script>
	//------------------------------------------------------------------------------------------------------------------

	import $http from 'axios';

	const relUrlRegEx = new RegExp('^(?!www\\.|(?:http|ftp)s?://|[A-Za-z]:\\\\|//)[^/]*/[^/].*$');

	//------------------------------------------------------------------------------------------------------------------

    export default {
        name: "WikiLink",
		props: {
        	href: {
        		type: String,
				required: true
			}
		},
		data()
		{
        	return {
				exists: false,
				isPrivate: false
			};
		},
		computed: {
        	url()
			{
				let url = this.href;
				if(!this.isExternal)
				{
					if(!_.startsWith(url, '/'))
					{
						url = `/${ url }`;
					} // end if

					if(!_.startsWith(url, `/wiki`))
					{
						url = `/wiki${ url }`;
					} // end if
				} // end if

				return url;
			},
        	isExternal(){ return !relUrlRegEx.test(this.href); }
		},
		methods: {
        	handleClick($event)
			{
				if(!this.isExternal)
				{
					$event.preventDefault();
					$event.stopPropagation();

					this.$router.push(this.url);
				} // end if
			}
		},
		mounted()
		{
			if(!this.isExternal)
			{
				$http.head(this.url)
					.then(() => {
						this.exists = true;
						this.isPrivate = false;
					})
					.catch(({ response }) => {
						switch(response.status)
						{
							case 403:
								this.exists = true;
								this.isPrivate = true;
								break;

							case 404:
							default:
								this.exists = false;
								this.isPrivate = false;
						} // end switch
					});
			}
			else
			{
				this.exists = true;
			} // end if
		}
    }
</script>

<!--------------------------------------------------------------------------------------------------------------------->
