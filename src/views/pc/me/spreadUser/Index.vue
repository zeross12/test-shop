<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from "vue";
import { getSpreadDetails, getTodayCommList } from "@/network/api/recharge";
import useClipboard from "vue-clipboard3";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { siteUrl } from "@/config";

const { toClipboard } = useClipboard();
const store = useStore();
const router = useRouter();
const userInfoExt = computed(() => store.state.userInfoExt);
const userSpreadCode = ref(userInfoExt.value.spreadCode);

const ownerInvitation = ref(siteUrl + "?code=" + userInfoExt.value.spreadCode);
const statsList = ref([]);
const pageIndex = ref(1);
const loading = ref(false);
const customLoading = ref(false);
const finished = ref(false);

const detailData = ref({});

onMounted(() => {
	pageIndex.value = 1;
	getSpreadList();
	getDetail();
});

async function copy(value) {
	try {
		await toClipboard(value);
		Success({ offset: 100, message: t('common.copySuccess') });
	} catch (e) {
		Warn({ offset: 100, message: t('common.copyFail'), customClass: "error" });
	}
}

async function getDetail() {
	const res = await getSpreadDetails();
	if (res.code == 0) {
		detailData.value = res.data;
	}
}

async function getSpreadList() {
	let params = {};
	params.page = pageIndex.value;
	params.limit = 10;
	customLoading.value = true;
	const res = await getTodayCommList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = statsList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		statsList.value = [...preList, ...items];
		loading.value = false;
		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
	customLoading.value = false;
}

//触底刷新
function onLoad() {
	if (customLoading.value) return;
	pageIndex.value += 1;
	getSpreadList();
}

// 每日奖励
function onClickDayAward() {
	router.push({ path: "/p/me/spreadUserDetail" });
}
</script>

<template>
	<div id="pc-spreadUser-wrap">
		<div class="spread-top-wrap">
			<div class="top-item">
				<div class="item-title">
					<img src="@/assets/pcimg/me/chain.png" alt="" />{{ t('users.mySpreadLink') }}：
				</div>
				<div class="item-c">
					<span>{{ ownerInvitation }}</span>
					<svg class="icon-c" @click="copy(ownerInvitation)">
						<use xlink:href="@/assets/icon.svg#copy"></use>
					</svg>
				</div>
			</div>
			<div class="top-item">
				<div class="item-title">
					<img src="@/assets/pcimg/me/fire.png" alt="" />{{ t('users.myInviteCode') }}：
				</div>
				<div class="item-c">
					<span>{{ userSpreadCode }}</span>
					<svg class="icon-c" @click="copy(userSpreadCode)">
						<use xlink:href="@/assets/icon.svg#copy"></use>
					</svg>
				</div>
			</div>
		</div>
		<div class="spread-header">
			<div class="spread-header-l"></div>
			<div class="spread-header-c">{{ t('users.mySpreadList') }}</div>
			<div class="spread-header-r">
				<div class="btn-wrap" v-if="false">
					{{ t('users.rewardForDays') }}
					<img src="@/assets/pcimg/me/icon_tq.png" alt="" />
				</div>
			</div>
		</div>
		<div class="spread-content">
			<div class="info-title">
				<p>{{ t('users.spreadTotal') }}</p>
				<p>{{ t('users.rechargeTotal') }}</p>
				<p>{{ t('users.bonusRatio') }}</p>
				<p>{{ t('users.cumulativeIncome') }}</p>
			</div>
			<div class="info-content">
				<p class="c1">{{ detailData.sumUserCount }}</p>
				<p class="c2"></p>
				<p class="c3">
					{{ Math.floor(Number(detailData.rewardScale) * 100) }}%
				</p>
				<p class="c4">{{ detailData.sumAmount }}</p>
			</div>
			<div class="rule">
				<img src="@/assets/pcimg/me/spread_rule.png" alt="" />
			</div>
		</div>
		<div class="spread-header">
			<div class="spread-header-l"></div>
			<div class="spread-header-c">{{ t('users.spreadDetail') }}</div>
			<div class="spread-header-r"></div>
		</div>
		<div class="spread-content">
			<div class="info-title">
				<p>{{ t('users.spreadUser') }}</p>
				<p>{{ t('users.spreadReward') }}</p>
				<p>{{ t('users.rechargeMoney') }}</p>
			</div>
			<van-list v-model="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad"
				:immediate-check="false" class="spread-list-wrap">
				<div class="spread-item" v-for="(item, index) in statsList" :key="index">
					<p class="hide">{{ item.nickName }}</p>
					<p>{{ item.rewardAmount }}</p>
					<p>{{ item.chargeAmount }}</p>
				</div>
			</van-list>
		</div>
		<div class="top-info" v-if="false">
			<div class="title">{{ t('users.mySpreadList') }}</div>
			<div class="spread-data">
				<div class="sd-title">
					<p>{{ t('users.spreadSuccessTotal') }}</p>
					<p>{{ t('users.cumulativeReward') }}</p>
					<p>{{ t('users.bonusRatio') }}</p>
				</div>
				<div class="spread-data-content">
					<div class="spread-data-font">
						<span>{{ detailData.sumUserCount }}</span>人
					</div>
					<div class="spread-data-amount">
						<img src="@/assets/romimg/common/gold.png" alt="" />
						<span>{{ detailData.sumAmount }}</span>
					</div>
					<div class="spread-data-font">
						<span>{{ Math.floor(Number(detailData.rewardScale) * 100) }}</span>%
					</div>
				</div>
			</div>

			<div class="spread-cont flexCol">
				<div class="spread-item day-award-wrap" @click="onClickDayAward()">
					<div class="f-col">
						<div class="spread-item-info"><span>{{ t('users.rewardForDays') }}</span></div>
					</div>
					<div class="f-row">
						<img class="spread-title-img" src="@/assets/romimg/spread/arrow_right.png" alt="" />
					</div>
				</div>
				<div class="spread-item">
					<div class="f-col">
						<div class="spread-item-info">
							<span>{{ t('users.myInviteCode') }}：</span><span>{{ userSpreadCode }}</span>
						</div>
					</div>
					<div class="f-row">
						<div class="spread-btnCol" @click="copy(userSpreadCode)">{{ t('common.copy') }}</div>
					</div>
				</div>
				<div class="spread-item">
					<div class="f-col">
						<div class="spread-item-info">
							<span>{{ t('users.mySpreadLink') }}：</span><span class="info-content hide">{{ ownerInvitation
							}}</span>
						</div>
					</div>
					<div class="f-row">
						<div class="spread-btnCol" @click="copy(ownerInvitation)">{{ t('common.copy') }}</div>
					</div>
				</div>
			</div>
			<div class="spread-steps flexCol">
				<div class="spread-steps-item flexRow">
					<img class="spread-steps-titleImg" src="@/assets/romimg/spread/share.png" alt="" />
					<div class="spread-steps-itemInfo f-col">
						<p class="spread-steps-infoTitle">{{ t('users.shareTitle1') }}</p>
						<p class="spread-steps-infoCont">
							{{ t('users.shareRule1') }}
						</p>
					</div>
				</div>
				<div class="spread-steps-item flexRow">
					<img class="spread-steps-titleImg" src="@/assets/romimg/spread/recharge.png" alt="" />
					<div class="spread-steps-itemInfo f-col">
						<p class="spread-steps-infoTitle">{{ t('users.shareTitle2') }}</p>
						<p class="spread-steps-infoCont">{{ t('users.shareRule2') }}</p>
					</div>
				</div>
				<div class="spread-steps-item flexRow">
					<img class="spread-steps-titleImg" src="@/assets/romimg/spread/bag.png" alt="" />
					<div class="spread-steps-itemInfo f-col">
						<p class="spread-steps-infoTitle">{{ t('users.shareTitle3') }}</p>
						<p class="spread-steps-infoCont">{{ t('users.shareRule3') }}</p>
					</div>
				</div>
				<img class="spread-steps-bg" src="@/assets/romimg/spread/big_bag.png" alt="" />
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-spreadUser-wrap {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;

	.spread-top-wrap {
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding: 45px 50px 50px 50px;
		box-sizing: border-box;
		background: #0e0f1e;
		box-shadow: 0px 24px 31px 0px rgba(15, 16, 31, 0.71);

		.top-item {
			display: flex;
			flex-direction: column;

			.item-title {
				display: flex;
				color: #b8b9cc;
				font-size: 19px;

				img {
					width: 20px;
					height: 20px;
					margin-right: 10px;
				}
			}

			.item-c {
				display: flex;
				align-items: center;
				justify-content: space-between;
				color: #fff;
				font-size: 13px;
				background: #131528;
				padding: 0 25px;
				height: 76px;
				margin-top: 16px;
				width: 756px;
				box-sizing: border-box;

				.icon-c {
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					position: relative;
					top: 0px;
					width: 22px;
					height: 22px;
					color: #707290;
				}
			}

			&:last-child {
				.item-c {
					width: 504px;
				}
			}
		}
	}

	.spread-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 5px;
		color: #8488a6;
		font-size: 16px;

		.spread-header-l {
			flex: 1;
		}

		.spread-header-c {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 197px;
			height: 105px;
			background: url(@/assets/pcimg/me/header_bg.png) center no-repeat;
			background-size: 100% 100%;
			color: #fff;
			font-size: 24px;
		}

		.spread-header-r {
			display: flex;
			flex: 1;
			justify-content: flex-end;
		}

		.btn-wrap {
			display: inline-flex;
			width: 146px;
			height: 48px;
			justify-content: center;
			align-items: center;
			background: #181a31;
			margin-left: 10px;
			cursor: pointer;

			img {
				width: 16px;
				height: auto;
				margin-left: 12px;
			}
		}
	}

	.spread-content {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;

		.info-title {
			display: flex;
			width: 100%;
			background: #111324;
			color: #5d5f72;
			font-size: 13px;
			font-weight: 700;
			align-items: center;
			box-sizing: border-box;
			padding: 0 30px;
			height: 66px;

			p {
				flex: 2;

				&:last-child {
					flex: 1;
				}
			}
		}

		.info-content {
			display: flex;
			width: 100%;
			background: #131528;
			align-items: center;
			box-sizing: border-box;
			padding: 0 30px;
			height: 56px;

			p {
				flex: 2;

				&:last-child {
					flex: 1;
				}
			}

			.c1 {
				color: #6a77ff;

				font-size: 15px;
				font-weight: 500;
			}

			.c2 {
				color: #fff;

				font-size: 15px;
				font-weight: 500;
			}

			.c3 {
				color: #75dc9e;

				font-size: 15px;
				font-weight: 500;
			}

			.c4 {
				color: #c6c7d3;

				font-size: 15px;
				font-weight: 500;
			}
		}

		.rule {
			img {
				width: 100%;
				height: auto;
			}
		}
	}

	.spread-list-wrap {
		display: flex;
		flex-direction: column;
		width: 100%;

		.spread-item {
			display: flex;
			width: 100%;
			background: #131528;
			align-items: center;
			box-sizing: border-box;
			padding: 0 30px;
			height: 56px;
			color: #fff;

			font-size: 15px;
			font-weight: 500;

			p {
				flex: 2;
			}

			p:last-child {
				flex: 1;
			}
		}
	}
}
</style>
