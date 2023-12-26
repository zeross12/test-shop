<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import { onMounted, ref, watch } from "vue";
import fudaiImage from "@/assets/romimg/common/fudai.png";
import { GoodImageBgType } from "@/util/util";
import {
	getResultList,
	getUserList,
	getGoodsList,
	joinRoll,
	getDetails,
} from "@/network/api/roll";
import { useStore } from "vuex";

import { useRoute, useRouter } from "vue-router";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import useClipboard from "vue-clipboard3";

const { toClipboard } = useClipboard();

const route = useRoute();
const router = useRouter();
const rollId = Number(route.query.rollId);
const store = useStore();
const rollInfo = ref({});
const tabType = ref(0); //0奖池，1参与人员，2获奖名单
const passwordShow = ref(false); //密码加入
const password = ref(""); //密码

const goodslist = ref([]); //奖品列表
const userlist = ref([]); //参与人员列表
const winninglist = ref([]);

const goodsPager = ref({ pageIndex: 1, limit: 18 });
const goodsLoading = ref(false);
const goodsFinished = ref(false);
const customGoodsLoading = ref(false);

const userPager = ref({ pageIndex: 1, limit: 32 });
const userLoading = ref(false);
const userFinished = ref(false);
const customUserLoading = ref(false);

const winningPager = ref({ pageIndex: 1, limit: 20 });
const winningLoading = ref(false);
const winningFinished = ref(false);
const customWinningLoading = ref(false);

const hasInfo = ref(false);

const btnOpenActive = ref(true); //防快速点击

onMounted(() => {
	getRollInfo();
});

watch(
	() => store.state.openResultRollId,
	(newRollId, preRollId) => {
		getRollInfo();
	}
);

async function getRollInfo() {
	let res = await getDetails({ rollId: rollId });
	if (res.code == 0) {
		rollInfo.value = res.data.item || {};
		rollInfo.value.inRoll = res.data.inRoll;
		rollInfo.value.hasPassword = res.data.hasPassword;
		hasInfo.value = true;
		goodsPager.value.pageIndex = 1;
		goodsFinished.value = false;
		getRollGoods();

		userPager.value.pageIndex = 1;
		userFinished.value = false;
		getRollUser();

		if (rollInfo.value.isSettle) {
			winningPager.value.pageIndex = 1;
			winningFinished.value = false;
			getRollwinning();
		}
	} else {
		hasInfo.value = false;
		goodsLoading.value = false;
		goodsFinished.value = true;
		userLoading.value = false;
		userFinished.value = true;
		winningLoading.value = false;
		winningFinished.value = true;
	}
}

async function getRollGoods() {
	customGoodsLoading.value = true;
	let res = await getGoodsList({
		page: goodsPager.value.pageIndex,
		limit: goodsPager.value.limit,
		rollId: rollId,
	});
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = goodslist.value;
		if (res.data.page == 1) {
			preList = [];
		}
		goodslist.value = [...preList, ...items];
		goodsLoading.value = false;

		if (items.length < res.data.limit) {
			goodsFinished.value = true;
		}
	} else {
		goodsLoading.value = false;
		goodsFinished.value = true;
	}
	customGoodsLoading.value = false;
}

async function getRollUser() {
	customUserLoading.value = true;
	let res = await getUserList({
		page: userPager.value.pageIndex,
		limit: userPager.value.limit,
		rollId: rollId,
	});
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = userlist.value;
		if (res.data.page == 1) {
			preList = [];
		}
		userlist.value = [...preList, ...items];
		userLoading.value = false;

		if (items.length < res.data.limit) {
			userFinished.value = true;
		}
	} else {
		userLoading.value = false;
		userFinished.value = true;
	}
	customUserLoading.value = false;
}

async function getRollwinning() {
	customWinningLoading.value = true;
	let res = await getResultList({
		page: winningPager.value.pageIndex,
		limit: winningPager.value.limit,
		rollId: rollId,
	});
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = winninglist.value;
		if (res.data.page == 1) {
			preList = [];
		}
		winninglist.value = [...preList, ...items];
		winningLoading.value = false;

		if (items.length < res.data.limit) {
			winningFinished.value = true;
		}
	} else {
		winningLoading.value = false;
		winningFinished.value = true;
	}
	customWinningLoading.value = false;
}

function onGoodsLoad() {
	if (customGoodsLoading.value) return;
	goodsPager.value.pageIndex += 1;
	getRollGoods();
}

function onUserLoad() {
	if (customUserLoading.value) return;
	userPager.value.pageIndex += 1;
	getRollUser();
}

function onWinningLoad() {
	if (customWinningLoading.value) return;
	winningPager.value.pageIndex += 1;
	getRollwinning();
}

function onClickTab(type) {
	tabType.value = type;
	if (!hasInfo.value) return;
	if (type == 0) {
		goodsPager.value.pageIndex = 1;
		goodsFinished.value = false;
		getRollGoods();
	} else if (type == 1) {
		userPager.value.pageIndex = 1;
		userFinished.value = false;
		getRollUser();
	} else if (type == 2) {
		winningPager.value.pageIndex = 1;
		winningFinished.value = false;
		getRollwinning();
	}
}

async function onClickJoin() {
	if (rollInfo.value.hasPassword) {
		if (!passwordShow.value) {
			passwordShow.value = true;
			return;
		} else {
			if (!password.value) {
				Warn({ offset: 100, message: t('sign.enterPassword'), customClass: "error" });
				return;
			}
		}
	}
	let params = {};
	params.rollId = rollId;
	if (password.value) {
		params.joinPassword = password.value;
	}
	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	let res = await joinRoll(params);

	btnOpenActive.value = true;
	if (res.code == 0) {
		Success({ offset: 100, message: t('battle.joinSuccess') });
		getRollInfo();
		passwordShow.value = false;
	}
}

function onClickPWCancel() {
	passwordShow.value = false;
	password.value = "";
}

function onClickPWJoin() {
	onClickJoin();
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsLevel == 0) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.roll, level);
}

function getImageIcon(item) {
	if (item.goodsType == 2) {
		return fudaiImage;
	} else {
		return item.iconUrl;
	}
}

function onClickRollTab(index) {
	router.push({
		path: "/p/roll",
		query: {
			tabIndex: index,
		},
	});
}
function onClickCopy() {
	copy(location.href);
}
async function copy(value) {
	try {
		await toClipboard(value);
		Success({ offset: 100, message: t('common.copySuccess') });
	} catch (e) {
		Warn({ offset: 100, message: t('common.copyFail'), customClass: "error" });
	}
}
const truncatedNickName = (nickName) => {
	const maxLength = 6;
	return nickName.length > maxLength
		? `${nickName.slice(0, maxLength)}...`
		: nickName;
};
</script>

<template>
	<div id="pc-roll-details" class="min-wrap-height">
		<div class="pc-tabs">
			<div class="tab-item" @click="onClickRollTab(1)">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gifts"></use>
				</svg>{{ t('battle.allRoom') }}
			</div>
			<div class="tab-item" @click="onClickRollTab(2)">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gift-3"></use>
				</svg>
				{{ t('battle.myRoom') }}
			</div>
		</div>
		<div class="roll-wrap">
			<div class="roll-details-info">
				<div class="roll-left">
					<div class="roll-head" v-if="rollInfo.rollType == 1">
						<img src="@/assets/pcimg/roll/anc_head.png" alt="" />
						<div>{{ t('battle.officialRoom') }}</div>
					</div>
					<div class="roll-head" v-if="rollInfo.rollType == 2">

						<img src="@/assets/pcimg/roll/off_head.png" alt="" v-if="!rollInfo.anchorUser" />
						<img :src="rollInfo.anchorUser.avater" alt="" v-else />
						<div class="anchor">{{ t('battle.anchorRoom') }}</div>
					</div>
					<div class="roll-state">
						{{ rollInfo.isSettle ? t('battle.finished') : t('battle.inProgress') }}
					</div>
				</div>
				<div class="roll-right">
					<div class="info-name hide">{{ rollInfo.rollName }}</div>
					<div class="details-rule">
						<div class="details-rule-content" v-html="rollInfo.rollDesc"></div>
					</div>
					<div v-show="rollInfo.inRoll && !rollInfo.isSettle" class="details-btn">
						{{ t('battle.joined') }}
					</div>
					<div v-show="!rollInfo.inRoll && !rollInfo.isSettle" class="details-btn" @click="onClickJoin">
						{{ t('battle.join') }}
					</div>
					<div v-show="rollInfo.isSettle" class="details-btn">{{ t('battle.finished') }}</div>

					<div class="bottom-info">
						<div class="info-item">
							<img src="@/assets/pcimg/roll/door.png" alt="" />
							<p>{{ t('battle.roomId') }}:{{ rollInfo.id }}</p>
							<svg class="icon-copy" @click="onClickCopy">
								<use xlink:href="@/assets/icon.svg#copy"></use>
							</svg>
						</div>
						<div class="info-item">
							<img src="@/assets/pcimg/roll/time.png" alt="" />
							<p>{{ t('battle.startTime') }}:{{ rollInfo.startTime }}</p>
						</div>
						<div class="info-item">
							<img src="@/assets/pcimg/roll/time.png" alt="" />
							<p>{{ t('battle.endTime') }}:{{ rollInfo.endTime }}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="common-nav" v-if="false">
				<div class="common-nav-item" :class="{ active: tabType == 0 }" @click="onClickTab(0)">
					{{ t('battle.rollRewardPrize') }}
				</div>
				<div class="common-nav-item" :class="{ active: tabType == 1 }" @click="onClickTab(1)">
					{{ t('battle.participant') }}
				</div>
				<div class="common-nav-item" v-show="rollInfo.isSettle" :class="{ active: tabType == 2 }"
					@click="onClickTab(2)">
					{{ t('battle.rewardUsers') }}
				</div>
			</div>
			<div class="roll-pool" v-if="winninglist.length > 0">
				<div class="pool-header">
					<div class="item">
						<p>{{ t('battle.rewardRecord') }}</p>
					</div>
				</div>
				<div class="pool-items">
					<div class="pool-item" v-for="(item, index) in winninglist" :key="index">
						<div class="item-card award">
							<div class="card-label">
								<!-- <p>饰品价格</p> -->
								<span><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ item.price
								}}</span>
							</div>
							<div class="weapon-item-pic" :style="`background-image: url(` + getImageBg(item) + `)`">
								<img :src="getImageIcon(item)" :alt="item.goodsName" />
							</div>
							<div class="user-info">
								<HeadPortrait :userModel="item.user" :size="'pc-openbox-header'">
								</HeadPortrait>
								<p class="hide">{{ truncatedNickName(item.user.nickName) }}</p>
							</div>
							<!-- <div class="item-info">
																<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
																<p class="item-info2">{{ getGoodsNameSec(item.goodsName, item.goodsType) }}</p>
														</div> -->
						</div>
					</div>
				</div>
				<div class="btn-more" v-if="!winningFinished" @click="onWinningLoad">
					{{ t('common.loadmore') }}
				</div>
			</div>
			<div class="roll-pool">
				<div class="pool-header">
					<div class="item">
						<p>{{ t('battle.goodsName') }}</p>
						<span>{{ rollInfo.goodsNum }}</span>
					</div>
					<div class="item line-item">
						<p>{{ t('battle.priceTotal') }}：</p>
						<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" /><span>{{ rollInfo.priceNum
						}}</span>
					</div>
				</div>
				<div class="pool-items">
					<div class="pool-item" v-for="(item, index) in goodslist" :key="index">
						<div class="item-card">
							<div class="card-label">
								<p>{{ t('battle.price') }}</p>
								<span><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ item.price
								}}</span>
							</div>
							<div class="weapon-item-pic" :style="`background-image: url(` + getImageBg(item) + `)`">
								<img :src="getImageIcon(item)" :alt="item.goodsName" />
							</div>
							<div class="item-info">
								<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
								<p class="item-info2">
									{{ getGoodsNameSec(item.goodsName, item.goodsType) }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="btn-more" v-if="!goodsFinished" @click="onGoodsLoad">
					{{ t('common.loadmore') }}
				</div>
			</div>
			<div class="roll-pool">
				<div class="pool-header">
					<div class="item">
						<p>{{ t('battle.participant') }}</p>
						<span>{{ rollInfo.userNum }}</span>
					</div>
				</div>
				<div class="pool-players">
					<div class="pool-player" v-for="(item, index) in userlist" :key="index">
						<HeadPortrait :userModel="item" :size="'pc-roll-player'" :hide-frame="true"></HeadPortrait>
					</div>
				</div>
				<div class="btn-more" v-if="!userFinished" @click="onUserLoad">
					{{ t('common.loadmore') }}
				</div>
			</div>
		</div>
		<div class="join-pw" :class="{ active: passwordShow }">
			<div class="pw-join-box">
				<p>{{ t('sign.enterPassword') }}</p>
				<input type="text" v-model="password" ref="input" maxlength="10" />
				<div class="pw-join-btns">
					<p @click="onClickPWCancel">{{ t('notify.cancel') }}</p>
					<p @click="onClickPWJoin">{{ t('notify.confirm') }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-roll-details {
	box-sizing: border-box;
	width: 100%;
	padding-bottom: 30px;
	width: 100%;

	.pc-tabs {
		background-color: #111324;
		font-size: 16px;
		color: #fff;
		display: flex;
		height: 80px;
		line-height: 80px;
		align-items: center;
		text-align: center;
		justify-content: flex-start;
		max-width: 1440px;
		width: 100%;
		margin: 50px auto 0;
		box-sizing: border-box;

		.tab-item {
			color: #9ca1c7;
			width: 300px;
			cursor: pointer;

			.icon {
				display: inline-block;
				vertical-align: middle;
				fill: currentColor;
				position: relative;
				top: -2px;
				width: 20px;
				height: 20px;
				color: #9ca1c7;
				margin-right: 12px;
				font-size: 16px;
				text-transform: uppercase;
				flex-shrink: 0;
			}

			&.active {
				color: #fff;
				border-bottom: solid 1px #4b56bc;

				.icon {
					color: #4b56bc;
				}
			}
		}
	}

	.roll-wrap {
		width: 100%;
		max-width: 1440px;
		box-sizing: border-box;
		margin: 40px auto 0;
	}

	.roll-details-info {
		position: relative;
		display: flex;
		max-width: 1440px;
		width: 100%;
		height: 334px;
		align-items: flex-start;
		border: 1px solid #2d2d67;
		background: #15172c;
		box-shadow: 0px 0px 59px 1px rgba(41, 34, 139, 0.15) inset;
		box-sizing: border-box;

		.roll-left {
			display: flex;
			width: 300px;
			height: 100%;
			padding: 40px 30px;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: #1a1d37;
			box-sizing: border-box;
			position: relative;

			.roll-head {
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;
				background: url(@/assets/pcimg/roll/head_bg.png) no-repeat center;
				background-size: 100% 100%;
				width: 300px;
				height: 334px;

				img {
					width: 100px;
					height: 100px;
					margin-top: 50px;
					border-radius: 12px;
				}

				div {
					display: flex;
					width: 100px;
					height: 30px;
					justify-content: center;
					align-items: center;
					border-radius: 10px;
					background: #cb8928;
					position: absolute;
					top: 142px;
					color: #fff;
					font-size: 12px;
					line-height: 19.5px;
					box-sizing: border-box;
				}

				.anchor {
					background: #7349ca;
				}
			}

			.roll-state {
				display: flex;
				height: 44px;
				width: 240px;
				justify-content: center;
				align-items: center;
				border-radius: 4px;
				background: #121322;
				position: absolute;
				bottom: 40px;
				color: #8589a5;
				text-align: center;
				font-size: 15px;
				font-weight: 700;
			}
		}

		.roll-right {
			display: flex;
			height: 100%;
			padding: 45px;
			flex-direction: column;
			align-items: flex-start;
			box-sizing: border-box;
			flex: 1;
			position: relative;

			.info-name {
				color: #5562e2;
				font-size: 38.4px;
				font-style: normal;
				font-weight: 400;
				line-height: 46px;
				max-width: 1000px;
			}

			.details-rule {
				width: 100%;
				display: flex;
				flex-direction: column;
				margin-top: 5px;

				.details-rule-content {
					width: 100%;
					color: #fff;
					font-size: 19.2px;
				}
			}

			.details-btn {
				display: flex;
				height: 50px;
				width: 200px;
				justify-content: center;
				align-items: center;
				cursor: pointer;
				color: #fff;
				font-size: 22px;
				font-weight: 700;
				margin-top: 20px;
				border-radius: 4px;
				background: #3a33ac;
			}

			.bottom-info {
				position: absolute;
				display: flex;
				bottom: 45px;

				.info-item {
					display: flex;
					align-items: center;
					font-size: 13px;
					color: #8d91ae;
					margin-right: 44px;
					position: relative;

					img {
						position: relative;
						top: -1px;
						margin-right: 10px;
						width: 20px;
					}

					.icon-copy {
						display: inline-block;
						vertical-align: middle;
						fill: currentColor;
						position: relative;
						top: 0px;
						width: 40px;
						height: 20px;
						color: #707290;
					}
				}
			}
		}
	}

	.roll-pool {
		.pool-header {
			display: flex;
			font-size: 18px;
			padding-left: 36px;
			margin-top: 40px;
			margin-bottom: 40px;

			.item {
				display: flex;
				align-items: center;

				p {
					color: #fff;
					font-size: 18px;
					font-style: normal;
					font-weight: 700;
					line-height: 27px;
				}

				span {
					display: inline-block;
					margin-left: 5px;
					color: #f9a328;
				}
			}

			.line-item {
				&::before {
					content: "|";
					margin-left: 15px;
					margin-right: 13px;
					color: #4b56bc;
				}

				img {
					width: 18px;
					height: 18px;
				}
			}
		}

		.pool-items {
			display: flex;
			flex-wrap: wrap;
			margin: -4px;

			.pool-item {
				padding: 4px;
				flex: 0 0 12.5%;
				max-width: 12.5%;
				box-sizing: border-box;

				.item-card {
					display: flex;
					flex-direction: column;
					align-items: center;
					text-align: center;
					background-color: #1b1e38;
					height: 260px;

					.card-label {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-top: 40px;

						p {
							color: #4b4d5f;
							font-size: 12px;
							line-height: 18px;
						}

						span {
							display: flex;
							align-items: center;
							color: #7bdca2;

							font-size: 13px;
							font-style: normal;
							font-weight: 700;
							line-height: 18.75px;

							img {
								width: 12px;
								height: 12px;
								margin-bottom: 2px;
							}
						}
					}

					.weapon-item-pic {
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						max-width: 100%;
						height: 116px;
						background-size: contain;
						background-position: center;
						background-repeat: no-repeat;

						img {
							max-width: 90%;
							max-height: 90%;
						}
					}

					.user-info {
						display: flex;
						justify-content: center;
						/* 水平居中 */
						align-items: center;
						/* 垂直居中 */
						// margin-top: -5px;
						width: 100%;
						height: 70px;
						background-color: #202447;
						margin-top: 15px;
						border-bottom-left-radius: 5px;
						border-bottom-right-radius: 5px;

						p {
							color: #fff;
							font-size: 13px;
							height: 19.5px;
							line-height: 19.5px;
							margin-left: 10px;
						}
					}

					.item-info {
						display: flex;
						align-items: center;
						flex-direction: column;
						margin-top: 10px;

						.item-info1 {
							color: rgba(255, 255, 255, 0.6);
							font-size: 13px;
							height: 19.5px;
							line-height: 19.5px;
						}

						.item-info2 {
							color: #fff;
							font-size: 13px;
							line-height: 19.5px;
						}
					}

					&.award {
						height: 260px;
						border-radius: 5px;
					}
				}
			}
		}

		.pool-players {
			display: flex;
			flex-wrap: wrap;
			margin: -15px;

			.pool-player {
				width: 90px;
				height: 96px;
				padding: 6px;
				box-sizing: border-box;
			}
		}

		.btn-more {
			display: flex;
			height: 40px;
			width: 100px;
			justify-content: center;
			align-items: center;
			border-radius: 4px;
			background: #3a33ac;
			color: #fff;
			font-size: 12px;
			margin: 20px auto 0;
		}
	}

	.join-pw {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		box-sizing: border-box;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		padding-bottom: 100px;
		background: rgba($color: #000000, $alpha: 0.8);
		opacity: 0;
		z-index: -1;
		transition: 0.2s;
		color: #fff;
		text-align: center;

		&.active {
			opacity: 1;
			z-index: 202;
		}

		.pw-join-box {
			width: 552px;
			height: 294px;
			background: #20222b;

			p {
				font-size: 32px;
				text-align: center;
				margin: 40px 0;
			}

			input {
				width: 477px;
				height: 61px;
				border: 2px solid #3a33ac;
				background: none;
				padding: 0 20px;
				box-sizing: border-box;
				font-size: 28px;
			}

			.pw-join-btns {
				display: flex;
				justify-content: center;
				height: 80px;
				margin-top: 26px;

				p {
					display: flex;
					height: 60px;
					width: 150px;
					justify-content: center;
					align-items: center;
					border-radius: 4px;
					background: #3a33ac;
					color: #fff;
					font-size: 16px;
					margin: 0 20px;
				}
			}
		}
	}
}
</style>
