<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import { getAuthInfo } from "@/network/api/battle";
import { useStore } from "vuex";

const props = defineProps(["serialNum"]);

defineExpose({ showBattleVerify });

const store = useStore();
const route = useRoute();

const activeTab = ref(1); //1-公平性说明 2-验证
const result = ref({});
const randValue = ref(""); // 本场随机值
const position = ref(""); // 座位号
const currentSerialNum = ref(""); // 验证开奖号码
let roundList = ref([]); // 轮次列表
const showBattleverifyDialog = ref(false);

onMounted(() => {
	!store.state.isPCClient && getAuthInfoData();
});

async function getAuthInfoData() {
	const res = await getAuthInfo({
		serialNum: store.state.isPCClient ? props?.serialNum : route.query.serialNum,
	});
	if (res.code === 0) {
		result.value = res.data;
		randValue.value = res.data?.randValue;
		position.value = res.data?.position;
		// window.$dev && console.log("result", res.data);
		valueChange(res.data?.position);
		getRoundList(res.data);
	}
}

const onClickVerify = (value) => {
	position.value = value;
	onClickTab(2);
	valueChange(value);
};

function onClickTab(tab) {
	activeTab.value = tab;
}

// 座位号改变
const valueChange = () => {
	const val = Number(position.value);
	let users = result?.value?.users;
	for (let i = 0; i < users?.length; i++) {
		let userItem = users[i];
		for (let index = 0; index < userItem?.goodsItems.length; index++) {
			const element = userItem?.goodsItems[index];
			if (element?.position === val) {
				position.value = element?.position;
				currentSerialNum.value = element?.serialNum;
				return;
			} else {
				position.value = val;
				currentSerialNum.value = "";
			}
		}
	}
};

// 获取轮次列表
const getRoundList = (data) => {
	const users = data?.users;
	const arrays = [];
	users.map((item) => {
		arrays.push(item.goodsItems);
	});
	for (let i = 0; i < arrays[0].length; i++) {
		const temp = [];
		for (let j = 0; j < arrays.length; j++) {
			temp.push(arrays[j][i]);
		}
		roundList.value.push(temp);
	}
};

function showBattleVerify() {
	showBattleverifyDialog.value = true;
	getAuthInfoData()
}

function cancel() {
	showBattleverifyDialog.value = false;
}

</script>

<template>
	<div id="pc-battle-verify">
		<div class="pc-content">
			<div v-if="showBattleverifyDialog" class="verify-dialog">
				<div class="verify-dialog-heard">
					<div class="common-nav">
						<div class="common-nav-item" :class="{ active: activeTab == 1 }" @click="onClickTab(1)">
							{{ t('battle.verifyIntro') }}
						</div>
						<div class="common-nav-item" :class="{ active: activeTab == 2 }" @click="onClickTab(2)">
							{{ t('battle.verify') }}
						</div>
					</div>

					<img class="cancel" @click="cancel" src="@/assets/romimg/sign/close.png" alt="" />
				</div>
				<div class="verify-dialog-wrap">
					<div class="verify-content-wrap">
						<div class="verify-content">
							<div v-show="activeTab == 1" class="content-wrap">
								<div class="info-wrap">
									<div class="total-wrap">
										<div class="total-title">
											<p>{{ t('battle.category') }}</p>
											<p>{{ t('battle.value') }}</p>
										</div>
										<div class="total-item">
											<p class="item-tit">{{ t('battle.joinBattleNo') }}</p>
											<p class="item-content">
												{{ result.serialNum }}
											</p>
										</div>
										<div class="total-item">
											<p class="item-tit">{{ t('battle.valueTitle') }}</p>
											<p class="item-content">
												{{ result.randValue }}
											</p>
										</div>
										<div class="total-item">
											<p class="item-tit">{{ t('battle.startTime') }}</p>
											<p class="item-content">
												{{ result.startTime }}
											</p>
										</div>
										<div class="total-item">
											<p class="item-tit">{{ t('battle.userNo') }}</p>
											<p class="item-content">
												{{ result.userCodes }}
											</p>
										</div>
										<div class="total-item">
											<p class="item-tit">{{ t('battle.seatNo') }}</p>
											<p class="item-content">
												{{ result.position }}
											</p>
										</div>
									</div>
									<div class="detail-wrap">
										<div class="title">
											{{ t('battle.round') }}
										</div>
										<div class="user-wrap">
											<div class="user-item" v-for="(item, index) in result?.users" :key="index">
												<HeadPortrait :userModel="item" :size="'pc_e_head_fourten'"></HeadPortrait>
												<p class="name">{{ item.nickName }}</p>
												<p class="code-title">{{ t('battle.userNo') }}</p>
												<p class="code">{{ item.userCode }}</p>
											</div>
										</div>
										<div class="round-wrap">
											<div class="round-item" v-for="(item, index) in roundList" :key="index">
												<div class="item-title">
													<p>{{ t('battle.round') }}{{ index + 1 }}</p>
												</div>
												<div class="item-content">
													<div class="item-user" v-for="element in item" :key="element.goodsId">
														<div class="round-user-title">
															<p>{{ t('battle.seatNo') }}</p>
															<p>{{ t('battle.resultNo') }}</p>
															<p>{{ t('battel.reward') }}</p>
														</div>
														<div class="round-user-content">
															<div>
																{{ element.position
																}}<span @click="onClickVerify(element.position)">[{{ t(
	'battle.verify') }}]</span>
															</div>
															<div>{{ element.serialNum }}</div>
															<div class="goods-name hide">{{ element.goodsName }}</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="verify-desc" v-html="t('battle.rewardRule')"></div>
									</div>
								</div>
							</div>
							<div v-show="activeTab == 2" class="content-wrap">
								<div class="verify-wrap">
									<div class="verify-title">
										<p>{{ t('battle.category') }}</p>
										<p>{{ t('battle.value') }}</p>
									</div>
									<div class="verify-item">
										<p>{{ t('battle.userNo') }}</p>
										<div class="verify-item-content">
											{{ result.userCodes }}
										</div>
									</div>
									<div class="verify-item">
										<p>{{ t('battle.valueTitle') }}</p>
										<input type="text" :placeholder="t('battle.enterValue')" readonly
											v-model="randValue" />
									</div>
									<div class="verify-item">
										<p>{{ t('battle.seatNo') }}</p>
										<input type="text" :placeholder="t('battle.enterSeatNo')" v-model="position"
											@input="valueChange" />
									</div>
									<div class="verify-result"
										v-html="t('battle.rewardNo', { pos: position, result: currentSeriaNum })"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-battle-verify {
	box-sizing: border-box;
	width: 100%;

	.verify-content {
		box-sizing: border-box;

		.content-wrap {
			box-sizing: border-box;

			.info-wrap {
				.total-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;

				}

				.detail-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;

					.sub-title {
						font-size: 20px;
						color: #FAD978;
						text-align: left;
						width: 700px;
					}

					.user-wrap {
						display: flex;
						width: 100%;
						height: 131px;
						border: 1px solid #FBFA02;
						box-sizing: border-box;

						.user-item {
							display: flex;
							flex-direction: column;
							align-items: center;
							flex: 1;
							padding-top: 12px;
							box-sizing: border-box;

							.name {
								color: #fff;
								font-size: 14px;
								margin-top: 6px;
							}

							.code-title {
								font-size: 14px;
								color: #FBFA02;
								margin-top: 3px;
							}

							.code {
								font-size: 12px;
								color: #fff;
								max-width: 230px;
								word-wrap: break-word;
								text-align: center;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;
							}
						}
					}
				}

				.round-wrap {
					display: flex;
					flex-direction: column;
					margin-top: 10px;
					width: 100%;

					.round-item {
						display: flex;
						margin-bottom: 20px;

						.item-title {
							display: flex;
							align-items: center;
							justify-content: center;
							width: 75px;
							background: #FBFA02;
							font-size: 16px;
							color: #000;
							box-sizing: border-box;


							p {
								width: 20px;
								word-break: break-all;
								text-align: center;
							}
						}

						.item-content {
							display: flex;
							flex-direction: column;
							width: 978px;
							border: 2px solid #FBFA02;
							box-sizing: border-box;
							border-left: none;

							.item-user {
								display: flex;
								width: 100%;
								border-bottom: 2px solid #595959;
								box-sizing: border-box;
								color: #fff;
								font-size: 14px;
								padding: 20px;
								line-height: 35px;

								&:last-child {
									border-bottom: 0;
								}

								.round-user-title {
									display: flex;
									flex-direction: column;
									color: #fff;
								}

								.round-user-content {
									display: flex;
									flex-direction: column;
									margin-left: 45px;

									>div span {
										color: #FBFA02;
										margin-left: 10px;
									}
								}
							}
						}
					}
				}

				.verify-desc {
					width: 100%;
					font-size: 16px;
					color: #fff;
					margin: 10px auto;
					padding-bottom: 30px;
					line-height: 35px;

					span {
						color: #FBFA02;
					}
				}
			}

			.verify-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 100%;

				.verify-title {
					display: flex;
					font-size: 20px;
					color: #fff;
					width: 100%;
					padding: 20px 25px;
					box-sizing: border-box;
					border-bottom: 1px #71701B solid;
					line-height: 35px;


					p {
						text-align: left;
						width: 190px;

						color: #FBFA02;
						line-height: 35px;
					}
				}


				.verify-item {
					display: flex;
					font-size: 20px;
					color: #fff;
					padding: 20px 15px;
					box-sizing: border-box;
					width: 100%;
					line-height: 35px;
					border-bottom: 1px #71701B solid;

					p {
						width: 190px;
						font-size: 14px;
						color: #fff;
						line-height: 35px;
					}

					.verify-item-content {
						flex: 1;
						word-wrap: break-word;
						line-height: 35px;
						font-size: 14px;

						span {
							height: 20px;
							font-size: 14px;
							color: #8e9197;
						}
					}

					input {
						width: 485px;
						height: 30px;
						border: none;
						font-size: 14px;
						color: #fff;
						background: none;
						text-align: left;
						box-sizing: border-box;
						word-wrap: break-word;
						word-break: normal;
					}
				}

				.verify-result {
					display: flex;
					font-size: 14px;
					color: #fff;
					width: 100%;
					margin-top: 10px;
					line-height: 35px;

					span {
						color: #FBFA02;
						margin-right: 10px;
						line-height: 35px;

						&:last-child {
							margin-right: 0;
							margin-left: 10px;
						}
					}
				}
			}
		}
	}

	.pc-content {

		.verify-dialog {
			width: 1100px;
			background: #151421;
			border-radius: 10px;
			position: fixed;
			box-sizing: border-box;
			top: 45%;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
			z-index: 999;
			transition: 0.3s;
			padding: 0 24px;
		}

		.cancel {
			position: absolute;
			top: 12px;
			right: 25px;
			width: 20px;
			height: 20px;
			cursor: pointer;
		}

		.verify-dialog-heard {

			.common-nav {
				border-bottom: 2px solid #FBFA02;

				.common-nav-item {
					width: 154px;
					height: 46px;
					line-height: 46px;
					color: #fff;
					font-size: 16px;
					cursor: pointer;
					margin-bottom: -1px;

					&.active {
						color: #141427;
						height: 46px;
					}
				}
			}
		}


		.verify-dialog-wrap {
			height: 800px;
			overflow-y: scroll;
		}

		.verify-content {
			box-sizing: border-box;

			.content-wrap {
				box-sizing: border-box;

				.info-wrap {
					.total-wrap {
						display: flex;
						flex-direction: column;
						align-items: center;

						.total-title {
							display: flex;
							font-size: 20px;
							color: #fff;
							width: 100%;
							height: 50px;
							line-height: 50px;
							padding: 0 25px;
							box-sizing: border-box;
							margin-bottom: 0;
							border-bottom: 1px #71701B solid;


							p {
								text-align: left;
								width: 190px;

								color: #FBFA02;
							}
						}

						.total-item {
							display: flex;
							font-size: 20px;
							color: #fff;
							padding: 15px 20px;
							box-sizing: border-box;
							margin-bottom: 10px;
							width: 100%;
							align-items: center;
							border-bottom: 1px #71701B solid;

							&:last-child {
								margin-bottom: 0;
							}

							.item-tit {
								width: 190px;
								font-size: 14px;
								color: #fff;
							}

							.item-content {
								max-width: 785px;
								word-wrap: break-word;
								line-height: 35px;
								font-size: 16px;

								span {
									height: 20px;
									font-size: 14px;
									color: #8e9197;
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
							font-size: 14px;
							color: #FAD978;
							text-align: left;
							width: 100%;
						}
					}




				}


			}
		}
	}
}</style>
