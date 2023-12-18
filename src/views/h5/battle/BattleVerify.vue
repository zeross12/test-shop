<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from "vue";
import { getAuthInfo } from "@/network/api/battle";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";

const store = useStore();
const route = useRoute();

const serialNum = ref(route.query.serialNum);
const tabIndex = ref(1);
const authInfo = ref({});
const roundInfo = ref([]);

const curUserCode = ref("");
const curPosition = ref(1);
const curRandValue = ref("");
const curResult = ref("");

onMounted(() => {
	getBattleAuthInfo();
});

async function getBattleAuthInfo() {
	const res = await getAuthInfo({ serialNum: serialNum.value });
	if (res.code === 0) {
		authInfo.value = res.data || {};

		roundInfo.value = [];
		let users = authInfo.value.users || [];
		for (let index = 0; index < users.length; index++) {
			const user = users[index];
			let goodsItems = user.goodsItems || [];

			for (let i = 0; i < goodsItems.length; i++) {
				let userRoundItem = { ...goodsItems[i] };
				if (!roundInfo.value[i]) {
					roundInfo.value[i] = [];
				}
				roundInfo.value[i].push(userRoundItem);
			}
		}

		curPosition.value = authInfo.value.position;
		curRandValue.value = authInfo.value.randValue;
		curUserCode.value = authInfo.value.userCodes;
		getPositionResult(curPosition.value);
	}
}

function getPositionResult(position) {
	let result = "";
	for (let index = 0; index < roundInfo.value.length; index++) {
		for (let i = 0; i < roundInfo.value[index].length; i++) {
			let roundItem = roundInfo.value[index][i];
			if (roundItem.position == position) {
				result = roundItem.serialNum;
			}
		}
	}
	curResult.value = result;
}

function onPositionInputChange() {
	getPositionResult(curPosition.value);
}

function onClickUserPositon(user) {
	curPosition.value = user.position;
	curRandValue.value = authInfo.value.randValue;
	curUserCode.value = authInfo.value.userCodes;
	getPositionResult(curPosition.value);
	tabIndex.value = 2;
}
function tabFlexChangedEvent(event) {
	tabIndex.value = event + 1;
}
</script>

<template>
	<div id="battle-verify">
		<div class="verify-content">
			<TopTitleBack :title="t('battle.verifyTitle')"></TopTitleBack>
			<TabsFlex
				@tabFlexChangedEvent="tabFlexChangedEvent"
				:items="[t('battle.verifyIntro'), t('battle.verifyTitle')]"
				:index="tabIndex - 1"
			></TabsFlex>
			<!-- <div class="common-tab-wrap2">
				<div
					class="common-tab-item"
					:class="{ active: tabIndex == 1 }"
					@click="tabIndex = 1"
				>
					公平性说明
				</div>
				<div
					class="common-tab-item"
					:class="{ active: tabIndex == 2 }"
					@click="tabIndex = 2"
				>
					验证
				</div>
			</div> -->
			<div class="content-wrap">
				<div class="info-wrap" v-if="tabIndex == 1">
					<div class="total-wrap">
						<div class="total-title">
							<p>{{ t('battle.category') }}</p>
							<p>{{ t('battle.value') }}</p>
						</div>
						<div class="total-item">
							<p class="item-tit">{{ t('battle.joinBattleNo') }}</p>
							<p class="item-content">
								{{ authInfo.serialNum }}
								<span><br />*{{ t('battle.categojoinBattleNoTipry') }}</span>
							</p>
						</div>
						<div class="total-item">
							<p class="item-tit">{{ t('battle.valueTitle') }}</p>
							<p class="item-content">
								{{ authInfo.randValue }}
								<span><br />*{{ t('battle.valueTip') }}</span>
							</p>
						</div>
						<div class="total-item">
							<p class="item-tit">{{ t('battle.rewardTime') }}</p>
							<p class="item-content">
								{{ authInfo.startTime }}
								<span><br />*{{ t('battle.rewardTip') }}</span>
							</p>
						</div>
						<div class="total-item">
							<p class="item-tit">{{ t('battle.userNo') }}</p>
							<p class="item-content">
								{{ authInfo.userCodes }}
								<span><br />*{{ t('battle.userNoTip') }}</span>
							</p>
						</div>
						<div class="total-item">
							<p class="item-tit">{{ t('battle.seatNo') }}</p>
							<p class="item-content">
								{{ authInfo.position }}
								<span><br />*{{ t('battle.seatNoTip') }}</span>
							</p>
						</div>
					</div>
					<div class="detail-wrap">
						<div class="user-wrap">
							<div
								:class="{
									user_item: authInfo.users.length == 2,
									user_item3: authInfo.users.length == 3,
								}"
								v-for="(item, index) in authInfo.users"
								:key="index"
							>
								<!-- <HeadPortrait :userModel="item" :size="'two'"></HeadPortrait> -->
								<img :src="item.avater" alt="" />
								<p class="name">{{ item.nickName }}</p>
								<p class="code-title">{{ t('battle.userNo') }}</p>
								<p class="code">{{ item.userCode }}</p>
							</div>
						</div>
						<div class="round-wrap">
							<div
								class="round-item"
								v-for="(item, index) in roundInfo"
								:key="index"
							>
								<div class="item-title">
									<p>{{ t('battle.roundTotal') }}{{ index + 1 }}</p>
								</div>
								<div class="item-content">
									<div
										class="item-user"
										v-for="(userItem, userIndex) in item"
										:key="userIndex"
									>
										<div class="round-user-title">
											<p>{{ t('battle.seatNo') }}</p>
											<p>{{ t('battle.resultNo') }}</p>
											<p>{{ t('battle.reward') }}</p>
										</div>
										<div class="round-user-content">
											<div @click="onClickUserPositon(userItem)">
												{{ userItem.position }}<span>[{{ t('battle.verify') }}]</span>
											</div>
											<div>{{ userItem.serialNum }}</div>
											<div>{{ userItem.goodsName }}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="verify-wrap" v-if="tabIndex == 2">
					<div class="verify-item">
						<p>{{ t('battle.userNo') }}</p>
						<input
							v-if="false"
							type="text"
							v-model="curUserCode"
							:placeholder="t('battle.enterUserNo')"
							readonly
						/>
						<div class="verify-item-content">{{ curUserCode }}</div>
					</div>
					<div class="verify-item">
						<p>{{ t('battle.valueTitle') }}</p>
						<input
							type="text"
							v-model="curRandValue"
							:placeholder=" t('battle.enterValue')  "
							readonly
						/>
					</div>
					<div class="verify-item">
						<p>{{ t('battle.seatNo') }}</p>
						<input
							type="text"
							v-model="curPosition"
							:placeholder=" t('battle.enterSeatNo')  "
							@input="onPositionInputChange"
						/>
					</div>
					<div class="verify-result">
						{{ curPosition }}{{ t('battle.rewardNo') }}&nbsp;
						<span>{{ curResult }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="verify-desc">
			<div class="head">{{ t('battle.rewardRule') }}</div>
<!-- 			
			每场每轮每个玩家都会开出一个武器所开出的武器根据对应的概率所得到一个编号，例如10%获得<span
				>Tec-9 | 晶红石英(崭新出厂)</span
			>
			，则本轮的值在
			<span>1000</span>个数字范围内，可能是
			<span>1-1000</span
			>内获得，也可能是<span>2000-3000</span>内获得，从而达到每轮开的武器都是纯随机。 -->
		</div>
	</div>
</template>

<style lang="scss">
#battle-verify {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	overflow-y: hidden;
	color: #fff;
	width: 750px;
	background-color: #191c34;

	.verify-content {
		// background: url(@/assets/romimg/bag/bg.png) no-repeat center;
		// background-size: 710px 1636px;
		// height: 1636px;
		// padding: 50px 50px;
		// margin: 30px 0px;
		width: 750px;
		box-sizing: border-box;

		.content-wrap {
			//	 height: 1436px;
			overflow-y: scroll;
			margin-top: 10px;
			box-sizing: border-box;

			&::-webkit-scrollbar {
				width: 5px;
				background-color: #34332d;
			}

			&::-webkit-scrollbar-track {
				border-radius: 10px;
				background-color: #34332d;
			}

			&::-webkit-scrollbar-thumb {
				border-radius: 10px;
				background-color: #34332d;
			}

			.info-wrap {
				.total-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;

					.total-title {
						display: flex;
						align-items: center;
						width: 710px;
						height: 80px;
						background: #111324;

						color: #535155;

						font-size: 24px;
						font-style: normal;
						font-weight: 500;

						text-transform: uppercase;
						box-sizing: border-box;
						p:first-child {
							text-align: left;
							flex: 2;
							padding-left: 20px;
							box-sizing: border-box;
						}
						p:last-child {
							text-align: left;
							flex: 5;
						}
					}

					.total-item {
						margin-bottom: 5px;
						display: flex;
						width: 710px;
						// border: 2px solid #fbfa02;
						font-size: 24px;
						color: #ffffff;
						height: 116px;
						// padding: 15px 17px;
						box-sizing: border-box;
						display: flex;
						align-items: center;
						border-radius: 12px;
						background: #131528;
						box-sizing: border-box;
						.item-tit {
							//	 width: 151px;
							flex: 2;
							color: #b4b6c8;

							font-size: 24px;
							font-style: normal;
							font-weight: 500;
							padding-left: 20px;
							box-sizing: border-box;
						}

						.item-content {
							flex: 5;
							max-width: 507px;
							word-wrap: break-word;
							line-height: 30px;
							color: #b4b6c8;

							font-size: 24px;
							font-style: normal;
							font-weight: 300;

							span {
								font-size: 24px;
								color: rgba(255, 255, 255, 0.4);

								font-size: 12px;
								font-style: normal;
								font-weight: 300;
							}
						}
					}
				}

				.detail-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-top: 20px;

					.sub-title {
						font-size: 20px;
						color: #fbfa02;
						text-align: left;
						width: 614px;
					}

					.user-wrap {
						display: flex;
						width: 710px;
						height: 332px;
						box-sizing: border-box;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 10px;

						.user_item {
							width: 350px;
							height: 332px;
							border-radius: 10px;
							background: #1b1e38;
							display: flex;
							flex-direction: column;
							align-items: center;
							box-sizing: border-box;
							padding-top: 20px;

							.name {
								color: #ffffff;
								font-size: 24px;
								margin-top: 20px;
								color: #cbccd6;
								text-align: center;

								font-style: normal;
								font-weight: 300;
							}

							.code-title {
								margin-top: 30px;

								color: #b4b6c8;
								text-align: center;

								font-size: 12px;
								font-style: normal;
								font-weight: 700;
								line-height: 15.6px; /* 130% */
							}

							.code {
								max-width: 280px;
								word-wrap: break-word;
								margin-top: 20px;
								text-align: center;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;

								color: #595b68;

								font-size: 20px;
								font-style: normal;
								font-weight: 500;
							}

							&:last-child {
								border-right: none;
							}
							img {
								width: 118px;
								height: 118px;
								border-radius: 20px;
							}
						}
						.user_item3 {
							width: 230px;
							height: 332px;
							border-radius: 10px;
							background: #1b1e38;
							display: flex;
							flex-direction: column;
							align-items: center;
							box-sizing: border-box;
							padding-top: 20px;
							position: relative;

							.name {
								color: #ffffff;
								font-size: 24px;
								margin-top: 20px;
								color: #cbccd6;
								text-align: center;

								font-style: normal;
								font-weight: 300;
							}

							.code-title {
								margin-top: 30px;
								color: #b4b6c8;
								text-align: center;

								font-size: 12px;
								font-style: normal;
								font-weight: 700;
								line-height: 15.6px; /* 130% */
							}

							.code {
								max-width: 200px;
								word-wrap: break-word;
								margin-top: 20px;
								text-align: center;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;

								color: #595b68;

								font-size: 20px;
								font-style: normal;
								font-weight: 500;
							}

							&:last-child {
								border-right: none;
							}
							img {
								width: 118px;
								height: 118px;
								border-radius: 20px;
							}
						}
					}
				}

				.round-wrap {
					display: flex;
					flex-direction: column;
					margin-top: 20px;
					width: 710px;
					margin: auto;

					.round-item {
						display: flex;
						margin-bottom: 20px;
						// height: 308px;

						.item-title {
							display: flex;
							align-items: center;
							justify-content: center;
							width: 80px;

							background: #111324;
							font-style: normal;
							font-weight: 700;
							font-size: 32px;
							color: #b4b6c8;
							box-sizing: border-box;

							p {
								width: 30px;
								word-break: break-all;
								text-align: center;
							}
						}

						.item-content {
							display: flex;
							flex-direction: column;
							width: 710px;
							box-sizing: border-box;

							.item-user:nth-child(2) {
								background: #111324;
							}

							.item-user {
								display: flex;
								width: 100%;
								height: 154px;
								box-sizing: border-box;
								color: #fff;
								font-size: 20px;
								padding: 20px;
								line-height: 32px;

								.round-user-title {
									display: flex;
									flex-direction: column;
									justify-content: space-between;
									color: #b4b6c8;

									font-size: 24px;
									font-style: normal;
									font-weight: 500;
								}

								.round-user-content {
									display: flex;
									flex-direction: column;
									justify-content: space-between;
									margin-left: 60px;
									color: #b4b6c8;

									font-size: 24px;
									font-style: normal;
									font-weight: 500;

									span {
										color: #554bf7;
										margin-left: 10px;
									}
								}
							}
						}
					}
				}
			}

			.verify-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 10px;
				width: 710px;
				margin: auto;
				.verify-item {
					border-radius: 12px;
					background: #131528;
					width: 710px;
					height: 116px;
					margin-bottom: 5px;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					p {
						flex: 2;
						font-size: 24px;
						color: #fff;
						margin-left: 22px;
					}

					input {
						font-size: 20px;
						color: #ffffff;
						background: none;
						text-align: left;
						box-sizing: border-box;

						padding: 0 20px;
						word-wrap: break-word;
						word-break: normal;
						border: none;
						flex: 5;
					}

					.verify-item-content {
						flex: 5;
						text-align: left;
						max-width: 507px;

						font-size: 20px;
						color: #ffffff;
						// background: none;
						text-align: left;
						box-sizing: border-box;
						padding: 20px 20px;
						word-wrap: break-word;
						word-break: normal;
					}
				}

				.verify-result {
					display: flex;
					font-size: 24px;
					color: #ffffff;
					//	 width: 400px;
					margin: auto;
					margin-top: 40px;
					box-sizing: border-box;

					span {
						color: #554bf7;
						font-size: 28px;
					}
				}
			}
		}
	}

	.verify-desc {
		width: 710px;
		font-size: 24px;
		color: #b4b6c8;
		margin: 5px auto;
		padding-bottom: 30px;
		line-height: 40px;

		.head {
			color: #b4b6c8;

			font-size: 28px;
			font-style: normal;
			font-weight: 400;
			line-height: 100px;
			margin-top: 20px;
		}
		// span {
		//	 color: #fbfa02;
		// }
	}
}
</style>
