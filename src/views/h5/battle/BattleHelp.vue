<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router"
const { t } = useI18n()
const router = useRouter();
</script>

<template>
	<div id="battle-help">
		<div class="help-wrap">
			{{ t( 'battle.ruleText1' ) }}
		</div>
		<div class="help-wrap">
			{{ t( 'battle.ruleText2' ) }}
		</div>
		<div class="help-wrap">
			{{ t( 'battle.ruleText3' ) }}
		</div>
		<div class="help-wrap">{{ t( 'battle.ruleText4' ) }}</div>
		<div class="help-wrap">
			{{ t( 'battle.ruleText5' ) }}
		</div>
		<div class="help-wrap">
			{{ t( 'battle.ruleText6' ) }}
		</div>
	</div>
</template>

<style lang="scss">
#battle-help {
	justify-content: center;
	align-items: center;
	background: #15172c;
	box-sizing: border-box;

	width: 100%;
	height: 100%;
	transition: 0.3s;

	.help-wrap {
		align-items: center;
		margin: 30px auto;
		line-height: 40px;

		width: 710px;
		box-sizing: border-box;
		color: #b4b6c8;

		font-size: 24px;
		font-style: normal;
		font-weight: 400;
	}
}
</style>
