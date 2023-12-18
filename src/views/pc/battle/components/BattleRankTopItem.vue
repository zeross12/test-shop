<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from 'vue'

const top = defineProps( [ 'rank' ] )
</script>
<template>
	<div :class="[ 'top-container' ]">
		<slot></slot>
	</div>
</template>
<style lang="scss">
</style>