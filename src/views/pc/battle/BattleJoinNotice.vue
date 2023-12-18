<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { joinBattleRoom } from "@/network/api/battle";

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
	if (!btnJoinActive.value) return;
	btnJoinActive.value = false;

	if (props.battleId != 0) {
		joinBattleRoom({ battleId: props.battleId })
			.then((res) => {
				showJoinDialog.value = false;
				if (res.code == 0) {
					Success({ offset: 100, message: t('battle.joinSuccess') });
					store.dispatch("getUserInfo");
					emit("joinRoomSuc");
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
	<van-dialog v-model:show="showJoinDialog" show-cancel-button class="pc-join-dialog">
		<div class="join-dialog-wrap">
			<div class="join-content-wrap" v-html="t('battle.joinRoomTip', { money: joinPrice })"></div>
		</div>
		<template #footer>
			<div class="join-dialog-bottom">
				<div class="bottom-btn-wrap">
					<div class="join-dialog-btn" @click="onClickJoinCancel">{{ t('notify.cancel') }}</div>
					<div class="join-dialog-btn" @click="onClickJoinSure">{{ t('notify.confirm') }}</div>
				</div>

				<div class="not-join-notice">
					<div class="check-icon" @click="onCheckNotNotice">
						<img v-if="notJoinNotice" class="checked-wrap" src="@/assets/pcimg/sign/checkbox__inner.png"
							alt="" />
						<div v-else class="check-wrap"></div>
					</div>
					<p>{{ t('battle.noPopupAgain') }}</p>
				</div>
			</div>
		</template>
	</van-dialog>
</template>
<style lang="scss" scoped>
.pc-join-dialog {
	width: 710px !important;
	background-color: #191c34 !important;

	.van-dialog__content {
		.join-dialog-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #fff;
			font-size: 20px;
			line-height: 1.75em;

			.join-content-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 40px;

				img {
					width: 34px;
				}

				p {
					color: #75dc9e;

					font-size: 22px;
					font-weight: 700;
				}
			}
		}
	}

	.join-dialog-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;

		.bottom-btn-wrap {
			height: 60px;
			margin-top: 30px;
			display: flex;
			text-align: center;
			justify-content: center;

			&::after {
				display: none;
			}

			.join-dialog-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 140px;
				height: 60px;
				background: #3a34b0;
				color: #fff;
				font-size: 18px;
				font-weight: bold;
				margin: 0 20px;

				&::after {
					display: none;
				}

				&:nth-child(2) {
					background: #7d51df;
				}
			}
		}

		.not-join-notice {
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 35px auto 0;

			.check-icon {
				display: flex;
				align-items: center;
				width: 19px;
				margin-right: 10px;
				margin-top: 3px;

				.checked-wrap {
					width: 19px;
					height: 17px;
				}

				.check-wrap {
					width: 17px;
					height: 17px;
					background: #16182e;
					border-radius: 3px;
				}
			}

			p {
				color: #fff;
				font-size: 17px;
			}
		}
	}
}
</style>
