<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
 
import { computed, ref } from 'vue';
const props = defineProps(['serialNum', 'disVerify']);
defineExpose({ showRule });
const showRuleDialog = ref(false);
const serialNum = ref('');
import { useRouter } from 'vue-router';
const router = useRouter();

function showRule() {
	showRuleDialog.value = true;
	serialNum.value = props.serialNum;
}

function onClickClose() {
	showRuleDialog.value = false;
}

function onVerify() {
	if (!serialNum.value) {
		Warn( { offset : 100, message : t( 'battle.enterBattleNo' ), customClass : 'error' } )
		return
	}
	router.push({
		path: '/m/battleverify',
		query: { serialNum: serialNum.value, }
	})
}
</script>
		
<template>
	<div id="battle-rule" :class="{ 'active': showRuleDialog }">
		<div class="introduce-wrap">
			<div class="close" @click="onClickClose()"><img src="@/assets/romimg/sign/close.png" alt=""></div>
			<div class="introduce-title" v-if="false">{{ t( 'battle.ruleTitle' ) }}</div>
			<div class="introduce-content">
				<p class="intr-content-title">{{ t( 'battle.ruleTitle' ) }}</p><br />
				<p>{{ t( 'battle.ruleText1' ) }}</p><br>
				<p>{{ t( 'battle.ruleText2' ) }}</p><br>
				<p>{{ t( 'battle.ruleText3' ) }}</p><br>
				<p>{{ t( 'battle.ruleText4' ) }}</p><br>
				<p>{{ t( 'battle.ruleText5' ) }}</p><br>
				<p>{{ t( 'battle.ruleText6' ) }}</p>
			</div>
			<div class="verify-wrap" v-if="!props.disVerify && false">
				<input type="text" v-model="serialNum" :placeholder="t( 'battle.enterBattleNo' )" @keyup.enter="onVerify">
				<div class="btn-verify" @click="onVerify">{{ t( 'battle.verifyBattle' ) }}</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#battle-rule {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	box-sizing: border-box;
	background-color: rgba($color: #000000, $alpha: .6);
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	transition: .3s;
	z-index: -1;
	opacity: 0;

	.introduce-wrap {
		display: flex;
		flex-direction: column;
		position: relative;
		background: url(@/assets/romimg/sign/back.png) no-repeat center;
		background-size: contain;
		width: 640px;
		height: 1060px;
		padding-bottom: 100px;
		box-sizing: border-box;
		transform: scale(0.8);

		.introduce-title {
			position: absolute;
			color: #FBFA02;
			font-size: 24px;
			left: 60px;
			top: 54px;
		}

		.close {
			width: 60px;
			height: 60px;
			position: absolute;
			right: -20px;
			top: -55px;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.introduce-content {
			width: 531px;
			margin: 50px auto 0;
			color: #fff;
			font-size: 24px;
			// max-height: 850px;
			flex: 1;
			overflow-y: scroll;


			&::-webkit-scrollbar {
				width: 5px;
				background-color: #34332D;
			}

			&::-webkit-scrollbar-track {
				border-radius: 10px;
				background-color: rgba($color: #000000, $alpha: .1);
			}

			&::-webkit-scrollbar-thumb {
				border-radius: 10px;
				background-color: rgba($color: #000000, $alpha: .6);
			}

			.intr-content-title {
				color: #FBFA02;
			}

			.intr-box-notice {

				.intr-content-pic {
					img {
						width: 100%;
					}
				}
			}
		}

		.verify-wrap {
			width: 551px;
			display: flex;
			align-items: center;
			margin: 30px auto 0;

			input {
				width: 372px;
				height: 62px;
				border: 2px solid #FBFA02;
				background: none;
				text-align: left;
				font-size: 24px;
				color: #FFFFFF;
				box-sizing: border-box;
				padding: 0 10px;
			}

			.btn-verify {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 140px;
				height: 60px;
				background: #FBFA02;
				font-size: 24px;
				color: #000000;
				margin-left: 18px;
				box-sizing: border-box;
			}
		}
	}

	&.active {
		z-index: 999;
		opacity: 1;
	}
}
</style>
		