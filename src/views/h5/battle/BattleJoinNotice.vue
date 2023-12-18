<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { joinBattleRoom } from "@/network/api/battle";

import Currency from "@/components/h5/common/Currency.vue";
const props = defineProps(["battleId", "joinPrice"]);
const emit = defineEmits(["joinRoomSuc"]);
defineExpose({ joinRoom });

const store = useStore();
const showJoinDialog = ref(false);
const notJoinNotice = computed(() => store.state.notJoinRoomNotice);

const btnJoinActive = ref(true); //防快速点击

async function joinRoom() {
	if (!notJoinNotice.value) {
		showJoinDialog.value = true;
	} else {
		onClickJoinSure();
	}
}

function onCheckNotNotice() {
	store.commit("setBattleNotJoinNoitce", !notJoinNotice.value);
}

function onClickJoinCancel() {
	showJoinDialog.value = false;
}

function onClickJoinSure() {
	window.$dev && console.log("3");
	if (!btnJoinActive.value) return;
	btnJoinActive.value = false;
	window.$dev && console.log("r", props.battleId);
	if (props.battleId != 0) {
		joinBattleRoom({ battleId: props.battleId })
			.then((res) => {
				showJoinDialog.value = false;
				if (res.code == 0) {
					Notify(t('battle.joinSuccess'));
					store.dispatch("getUserInfo");
					emit("joinRoomSuc", props.battleId);
				}
				btnJoinActive.value = true;
			})
			.catch((err) => {
				btnJoinActive.value = true;
			});
	}
}
</script>

<template>
	<van-dialog v-model:show="showJoinDialog" show-cancel-button class="join-dialog">
		<div class="join-dialog-wrap">
			<div class="close-wrap" @click="onClickJoinCancel">
				<span class="icon iconfont">&#xe637;</span>
			</div>
			<div class="join-content-wrap">
				{{ t('battle.joinRoomTip', { money: joinPrice }) }}
				<!-- <p><currency :currency="joinPrice" :fontsize="14"></currency></p>
				&nbsp;{{ t('battle.confirmCopy') }} -->
			</div>
		</div>
		<template #footer>
			<div class="join-dialog-bottom">
				<div class="bottom-btn-wrap">
					<div class="join-dialog-btn" @click="onClickJoinCancel">{{ t('notify.cancel') }}</div>
					<div class="join-dialog-btn" @click="onClickJoinSure">{{ t('battle.confirm') }}</div>
				</div>

				<div class="not-join-notice" @click="onCheckNotNotice">
					<div class="check-icon" :class="{ active: notJoinNotice }"></div>
					<p>{{ t('battle.noPopupAgain') }}</p>
				</div>
			</div>
		</template>
	</van-dialog>
</template>
<style lang="scss">
.join-dialog {
	width: 710px !important;
	background-color: #191c34 !important;

	.van-dialog__content {
		height: 100px;

		.join-dialog-wrap {
			margin-top: 20px !important;
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 710px !important;
			background-color: #191c34 !important;
			color: #dbdeea;
			font-size: 32px;
			font-style: normal;
			font-weight: 600;
			position: relative;

			.close-wrap {
				position: absolute;
				color: #fff;
				top: -20px;
				right: 30px;
				// margin-right: 10px;
			}

			.join-content-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				padding-top: 30px;

				p {
					margin-left: 10px;
					color: #63bd87;
					font-weight: bold;
				}
			}
		}
	}

	.join-dialog-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;

		// margin-bottom: 30px;
		.bottom-btn-wrap {
			height: 102px;
			margin-top: 30px;
			display: flex;
			text-align: center;
			justify-content: center;

			&::after {
				display: none;
			}

			.join-dialog-btn {
				display: flex;
				width: 250px;
				height: 96px !important;

				justify-content: center;
				align-items: center;

				border-radius: 8px;
				background: #3a34b0;

				color: #cfcee8;
				font-size: 26px;
				font-weight: bold;
				margin: 0 20px;
				display: flex;
				align-items: center;
				justify-content: center;

				&::after {
					display: none;
				}

				&:nth-child(2) {
					background-color: #8e61f3;
				}
			}
		}

		.not-join-notice {
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 60px auto 0;

			color: #535b70;

			font-size: 24px !important;
			font-style: normal;
			font-weight: 400;

			.check-icon {
				width: 30px;
				height: 30px;
				background: url(@/assets/romimg/common/unselected.png) no-repeat center;
				background-size: contain;
				margin-right: 10px;

				&.active {
					background: url(@/assets/romimg/common/selected.png) no-repeat center;
					background-size: contain;
				}
			}

			p {
				color: #fff;
				font-size: 28px !important;
			}
		}
	}
}

// .popup {
//	 display: flex;
//	 justify-content: center;
//	 align-items: center;
//	 position: fixed;
//	 box-sizing: border-box;
//	 background-color: rgba(16, 16, 30, 0.9);
//	 left: 0;
//	 top: 0;
//	 width: 100%;
//	 height: 100%;
//	 transition: 0.3s;
//	 z-index: -1;
//	 opacity: 0;

//	 .popup_top_bg {
//		 position: relative;
//		 top: -240px;
//		 width: 100%;
//		 img {
//			 width: 100%;
//			 height: auto;
//		 }
//	 }

//	 .popup-wrap_bg {
//		 background: #0d0e1c !important;
//		 width: 100% !important;
//	 }

//	 .popup-wrap {
//		 background: #191c34;
//		 width: 710px;
//		 position: absolute;

//		 .close {
//			 align-items: center;
//			 position: absolute;
//			 height: 48px;
//			 width: 48px;
//			 top: 10px;
//			 right: 0px;

//			 span {
//				 font-size: 24px;
//				 color: #4b4f6d;
//			 }
//		 }
//		 .popup-title {
//			 width: 100%;
//			 margin-top: 26px;
//			 display: flex;
//			 align-items: center;
//			 text-align: center;
//			 justify-content: center;
//			 height: 80px;
//			 background: var(--title-background);
//			 &::before {
//				 content: "";
//				 position: absolute;
//				 left: 0px;
//				 width: 228px;
//				 height: 40px;
//				 box-sizing: border-box;
//				 background: var(--title-left-background);
//			 }
//			 &::after {
//				 content: "";
//				 position: absolute;
//				 width: 229px;
//				 height: 41px;
//				 box-sizing: border-box;
//				 background: var(--title-right-background);
//				 right: 0px;
//			 }
//			 span {
//				 font-size: 40px;
//				 color: #fff;
//				 text-align: center;
//				 line-height: 48px;
//				 text-shadow: var(--title-text-shadow);
//			 }

//			 .pop-title-top {
//				 font-size: 36px;
//				 color: #fff;
//				 text-align: center;
//				 
//				 font-style: normal;
//				 font-weight: 400;
//				 text-transform: capitalize;
//			 }
//		 }

//		 .popup-content {
//			 display: flex;
//			 flex-direction: column;
//			 justify-content: center;
//			 align-items: center;
//			 width: 100%;
//			 margin: 0 auto;
//			 box-sizing: border-box;
//			 // overflow-y: auto;
//			 // margin-top: 30px;
//			 // margin-bottom: 68px;
//			 .help_detail_info {
//				 color: #b4b6c8;
//				 
//				 font-size: 28px;
//				 font-style: normal;
//				 font-weight: 500;
//				 padding-top: 80px;
//				 padding-left: 46px;
//				 padding-right: 46px;
//				 margin-bottom: 40px;

//				 p {
//					 margin-bottom: 20px;
//					 span {
//						 color: #00cbff;
//						 margin: 0 5px;
//					 }
//				 }
//			 }

//			 .btn-auto {
//				 width: 344px;
//				 height: 62px;
//				 border-radius: 50px;
//				 background: #3a34b0;
//				 color: #fff;
//				 
//				 font-size: 24px;
//				 font-style: normal;
//				 font-weight: 400;
//				 margin-top: 60px;
//				 margin-bottom: 20px;
//				 text-align: center;
//				 display: flex;
//				 align-items: center;
//				 justify-content: center;
//			 }

//			 .popup-main {
//				 display: flex;
//				 flex-direction: column;
//				 justify-content: center;
//				 align-items: center;
//				 width: 100%;

//				 .btn-auto-title {
//					 width: 100%;
//					 margin-top: 30px;
//					 display: flex;
//					 align-items: center;
//					 text-align: center;
//					 justify-content: center;
//					 height: 80px;
//					 background: var(--title-background);
//					 &::before {
//						 content: "";
//						 position: absolute;
//						 left: 0px;
//						 width: 228px;
//						 height: 40px;
//						 box-sizing: border-box;
//						 background: var(--title-left-background);
//					 }
//					 &::after {
//						 content: "";
//						 position: absolute;
//						 width: 229px;
//						 height: 41px;
//						 box-sizing: border-box;
//						 background: var(--title-right-background);
//						 right: 0px;
//					 }
//					 span {
//						 font-size: 40px;
//						 color: #fff;
//						 text-align: center;
//						 line-height: 48px;
//						 text-shadow: var(--title-text-shadow);
//					 }
//				 }

//				 .btn-auto-input {
//					 display: flex;
//					 align-items: center;
//					 justify-content: space-between;
//					 width: 100%;
//					 box-sizing: border-box;
//					 padding-left: 50px;
//					 padding-right: 50px;
//					 margin-top: 100px;

//					 span {
//						 width: 20px;
//						 height: 2px;
//						 background: #4b4f6d;
//					 }

//					 input {
//						 box-sizing: border-box;
//						 text-align: center;
//						 width: 296px;
//						 height: 80px;
//						 color: #b4b6c8;
//						 
//						 font-size: 24px;
//						 font-style: normal;
//						 font-weight: 300;
//						 border-radius: 8px;
//						 border: 2px solid #4b4f6d;
//						 background: #212540;
//					 }
//				 }

//				 .goods-wrap {
//					 display: flex;
//					 justify-content: center;
//					 align-items: center;
//					 width: 100%;
//					 // height: 147px;
//					 // margin-top: 77px;

//					 img {
//						 height: 200px;
//					 }
//				 }

//				 .goods-name {
//					 color: #e8e8e8;
//					 line-height: 40px;
//					 font-size: 24px;
//					 margin: 20px 0;
//					 text-align: center;
//				 }

//				 .price {
//					 display: flex;
//					 justify-content: center;
//					 align-items: center;
//					 color: #30fdfd;
//					 

//					 p {
//						 display: flex;
//						 align-items: center;
//						 font-size: 24px;
//						 margin: 0 15px;
//						 color: #aeabf4;

//						 img {
//							 width: 30px;
//							 margin-right: 10px;
//						 }
//					 }
//				 }

//				 .one-result {
//					 width: 230px;
//					 height: 290px;
//					 background-color: #171930;
//					 margin: 0 auto;
//					 display: flex;
//					 flex-direction: column;
//					 align-items: center;
//					 justify-content: center;
//					 background-repeat: no-repeat;
//					 background-position: center center;
//					 background-size: contain;

//					 .weapon-con {
//						 width: 168px;
//						 padding-top: 20px;
//						 display: flex;
//						 flex-direction: column;
//						 justify-content: center;
//						 align-items: center;

//						 .one-weapon {
//							 width: 160px;
//						 }

//						 .prize-item-name {
//							 margin-top: 40px;
//							 width: 168px;
//							 box-sizing: border-box;
//							 color: #cbccd6;
//							 text-align: center;
//							 
//							 font-size: 24px;
//							 font-style: normal;
//							 font-weight: 300;
//						 }
//					 }
//				 }

//				 .result-totle-price {
//					 width: 100%;
//					 
//					 text-align: center;
//					 font-size: 28px;
//					 font-weight: 500;
//					 color: #6ecf96;
//					 margin-bottom: 50px;
//				 }
//			 }

//			 .popup-btn-wrap {
//				 display: flex;
//				 justify-content: center;
//				 align-items: center;
//				 width: 100%;
//				 margin-top: 60px;
//				 margin-bottom: 64px;

//				 .popup-sure-btn {
//					 box-sizing: border-box;
//					 display: flex;
//					 align-items: center;
//					 justify-content: center;
//					 width: 274px;
//					 height: 96px;
//					 border-radius: 4px;
//					 background: #7d51df;
//					 background-size: 100% 100%;
//					 text-align: center;
//					 font-size: 28px;
//					 font-weight: 700;
//				 }

//				 .popup-cancel-btn {
//					 width: 212px;
//					 height: 96px;
//					 margin-right: 30px;
//					 border-radius: 4px;
//					 background: #3a34b0;
//					 font-size: 28px;
//					 font-weight: 700;
//				 }
//			 }
//		 }
//	 }

//	 &.active {
//		 z-index: 999;
//		 opacity: 1;
//	 }
// }
</style>
