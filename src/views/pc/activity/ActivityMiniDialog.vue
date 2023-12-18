<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()
const router = useRouter()

const hasLogin = computed( () => store.getters.hasLogin )

const active = computed( () => {
	return	store.state.activityConfig.open &&
			!store.state.showActivityDialog &&
			hasLogin.value &&
			route.name != 'p_activity'
} )

function go()
{
	router.push( '/p/activity' )
}
</script>
<template>
	<div class="mini-dialog-container" v-if="active" @click.stop="go"></div>
</template>
<style lang="scss" scoped>
.mini-dialog-container
{
	position: fixed;
	left: 54px;
	bottom: 54px;
	// border: 1px solid red;
	width: 385px;
	height: 303px;
	background: url( @/assets/pcimg/activity/mini-dialog.png ) no-repeat;
	background-size: cover;
	background-position: center center;
	z-index: 200;
}
</style>
