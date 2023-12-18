<script setup>

import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import { onMounted, ref, watch } from "vue";
import officialImage from "@/assets/romimg/roll/official.png";
import anchorImage from "@/assets/romimg/roll/anchor.png";
import fudaiImage from "@/assets/romimg/common/fudai.png";
import { GoodImageBgType } from "@/util/util";
import { getGoodsLevelColor } from "@/util/common";
import Tabs from "@/components/h5/home/Tabs.vue";
import weaponListCpt from "@/components/h5/weaponListCpt/Index.vue";
import Currency from "@/components/h5/common/Currency.vue";

import {
	getResultList,
	getUserList,
	getGoodsList,
	joinRoll,
	getDetails,
} from "@/network/api/roll";
import { useStore } from "vuex";

import { useRoute } from "vue-router";import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute();
const rollId = Number(route.query.rollId);
const store = useStore();
const rollInfo = ref({});

const passwordShow = ref(false); //密码加入
const password = ref(""); //密码

const goodslist = ref([]); //奖品列表
const userlist = ref([]); //参与人员列表
const winninglist = ref([]);

const goodsPager = ref({ pageIndex: 1, limit: 12 });
const goodsLoading = ref(false);
const goodsFinished = ref(false);
const customGoodsLoading = ref(false);

const userPager = ref({ pageIndex: 1, limit: 20 });
const userLoading = ref(false);
const userFinished = ref(false);
const customUserLoading = ref(false);

const winningPager = ref({ pageIndex: 1, limit: 12 });
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

//roll房类别(官方/主播)
function getRollType(v) {
	if (v == 2) {
		return anchorImage;
	} else {
		return officialImage;
	}
}

async function onClickJoin() {
	if (rollInfo.value.hasPassword) {
		if (!passwordShow.value) {
			passwordShow.value = true;
			return;
		} else {
			if (!password.value) {
				NotifyF( t('battle.enterPassword') );
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
		Notify( t('battle.joinSuccess') );
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
	return store.getters.getGoodsBgImage(GoodImageBgType.box, level);
}
function getColor(v) {
	return "color:" + getGoodsLevelColor(v);
}
function getImageIcon(item) {
	if (item.goodsType == 2) {
		return fudaiImage;
	} else {
		return item.iconUrl;
	}
}
function getGoodsName(item) {
	if (item.goodsType == 2) {
		return	t('common.luckyBag');
	} else {
		return item.goodsName;
	}
}

//倒计时过滤
function TimeFilter(time) {
	let date = new Date(time);
	let curTime = new Date();
	return date.getTime() - curTime.getTime();
}
let tabIndex = ref(0);
function tabChangedEvent(event) {
	tabIndex.value = event;
}
</script>

<template>
	<div id="roll_details">
		<TopTitleBack :title="t('router.roll')"></TopTitleBack>

		<div class="roll-details-info">
			<div class="roll-detail-top" :class="{ active: rollInfo.rollType == 2 }">
				<div class="rollname hide">{{ rollInfo.rollName }}</div>
				<div class="detail_logo">
					<img
						v-if="rollInfo.rollType == 2 && rollInfo.anchorUser"
						:src="rollInfo.anchorUser.avater"
						alt=""
					/>
					<img v-else src="@/assets/romimg/roll/roll_detail_logo.png" alt="" />

					<div class="desc" :class="{ active: rollInfo.rollType == 2 }">
						<!-- {{ rollInfo.rollType == 2 ? t( 'battle.anchorRoom' ) : t( 'battle.officialRoom' ) }} -->
					</div>
				</div>
				<div class="details-btn-wrap">
					<div
						v-show="rollInfo.inRoll && !rollInfo.isSettle"
						class="details-btn join"
					>
						{{ t('timebox.joined') }}
					</div>
					<div
						v-show="!rollInfo.inRoll && !rollInfo.isSettle"
						class="details-btn"
						@click="onClickJoin"
					>
					{{ t('battle.join') }}
					</div>
					<div v-show="rollInfo.isSettle" class="details-btn join">{{ t('battle.finished') }}</div>
				</div>
			</div>
			<div class="roll-detail-bottom">
				<div class="roll-detail-row">
					<div class="roll-detail-item">
						{{ t('battle.goodsName') }} <span class="item_span">{{ rollInfo.goodsNum }}</span>
					</div>
					<div class="roll-detail-item">
						{{ t( 'battle.priceTotal' ) }}:
						<span>
							<Currency :currency="rollInfo.priceNum"></Currency>
							<!-- ${{ rollInfo.priceNum }} -->
						</span>
					</div>
				</div>
				<div class="roll-detail-desc" v-html="rollInfo.rollDesc"></div>
				<div
					class="roll-detail-time"
					v-if="rollInfo.startTime && rollInfo.endTime"
				>
					<img src="@/assets/romimg/roll/time.png" alt="" srcset="" />
					&nbsp;{{ t('battle.rewardTime') }}: {{ rollInfo.startTime.substring(0, 16) }} -
					{{ rollInfo.endTime.substring(0, 16) }}
				</div>
			</div>
			<!-- <div class="roll-type">
				<img :src="getRollType(rollInfo.rollType)" alt="" />
			</div> -->
			<div class="roll-detail-content" v-if="false">
				<div class="details-info-top">
					<!-- <div class="name hide">{{ rollInfo.rollName }}</div> -->
				</div>
				<div class="details-rule">
					<div class="details-rule-content" v-html="rollInfo.rollDesc"></div>
				</div>
				<div class="details-info-bottom">
					<div
						class="details-info-time"
						v-if="rollInfo.startTime && rollInfo.endTime"
					>
					{{ t('battle.rewardTime') }}<span>{{ rollInfo.endTime }}</span>
					</div>
					<div class="open-time" v-if="!rollInfo.isSettle">
						<van-count-down :time="TimeFilter(rollInfo.endTime)">
							<template #default="timeData">
								<div class="count-item">
									<span class="count-bk">{{
										timeData.days >= 10 ? timeData.days : "0" + timeData.days
									}}</span>
									<div class="count-txt">{{ t('timebox.days') }}</div>
								</div>
								<div class="count-item">
									<span class="count-bk">{{
										timeData.hours >= 10 ? timeData.hours : "0" + timeData.hours
									}}</span>
									<div class="count-txt">{{ t('timebox.hours') }}</div>
								</div>
								<div class="count-item">
									<span class="count-bk">{{
										timeData.minutes >= 10
											? timeData.minutes
											: "0" + timeData.minutes
									}}</span>
									<div class="count-txt">{{ t('timebox.min') }}</div>
								</div>
								<div class="count-item">
									<span class="count-bk">{{
										timeData.seconds >= 10
											? timeData.seconds
											: "0" + timeData.seconds
									}}</span>
									<div class="count-txt">{{ t('timebox.sec') }}</div>
								</div>
							</template>
						</van-count-down>
					</div>
					<div
						v-show="rollInfo.inRoll && !rollInfo.isSettle"
						class="details-btn"
					>
					{{ t('timebox.joined') }}
					</div>
					<div
						v-show="!rollInfo.inRoll && !rollInfo.isSettle"
						class="details-btn"
						@click="onClickJoin"
					>
					{{ t('battle.join') }}
					</div>
					<div v-show="rollInfo.isSettle" class="details-btn">{{ t('battle.finished') }}</div>
				</div>
			</div>
		</div>
		<Tabs
			:items="[t('battle.rollRewardPrize'), t('battle.participant'), t('battle.rewardUsers')]"
			@tabChangedEvent="tabChangedEvent"
		></Tabs>
		<div v-if="tabIndex == 0">
			<weaponListCpt :list="goodslist" :showBaolv="false"></weaponListCpt>

			<!-- <div class="weapon-list">
				<div
					class="weapon-item"
					v-for="(item, index) in goodslist"
					:key="index"
					:style="`background-image: url(` + getImageBg(item) + `)`"
				>
					<div class="weapon-item-pic">
						<img :src="getImageIcon(item)" :alt="item.goodsName" />
					</div>
					<div class="weapon-item-name hide" :style="getColor(item.goodsLevel)">
						{{ getGoodsName(item) }}
					</div>
					<div class="weapon-item-price">
						<img src="@/assets/romimg/common/gold.png" alt="" />{{ item.price }}
					</div>
				</div>
			</div> -->
			<div class="btn-more" v-if="!goodsFinished" @click="onGoodsLoad">
				{{ t('common.loadmore') }}
			</div>
		</div>
		<div v-else-if="tabIndex == 1">
			<div class="count-text">
				{{ t('battle.participant') }}: <span>{{ rollInfo.userNum }}</span>
			</div>
			<div class="join-user-list">
				<div
					class="join-user-item"
					v-for="(item, index) in userlist"
					:key="index"
				>
					<div class="join-user-img">
						<HeadPortrait :userModel="item" :size="'item_pic'"></HeadPortrait>
					</div>
					<p class="hide">{{ item.nickName }}</p>
				</div>
			</div>
			<div class="btn-more" v-if="!userFinished" @click="onUserLoad">
				{{ t('common.loadmore') }}
			</div>
		</div>
		<div v-else-if="tabIndex == 2">
			<!-- <div class="title">中奖名单</div> -->
			<div class="wait-open-wrap" v-if="!rollInfo.isSettle">
				<img src="@/assets/romimg/roll/wait.png" alt="" />
				{{ t('battle.notArrivedTime') }}
			</div>
			<div class="drop-list">
				<div
					class="drop-item"
					v-for="(item, index) in winninglist"
					:key="index"
					:style="`background-image: url(` + getImageBg(item) + `)`"
				>
					<!-- <div class="weapon-item-pic">
						<img :src="getImageIcon(item)" :alt="item.goodsName" />
					</div>
					<div class="join-user-wrap">
						<div class="join-user-price">
	
							<Currency :currency="item.price"></Currency>
						</div>
						<div class="join-user-info">
							<HeadPortrait
								class="head-wrap"
								:userModel="item.user"
								:size="'main_data'"
							>
							</HeadPortrait>
							<p class="hide">{{ item.user.nickName }}</p>
						</div>
					</div> -->

					<div class="price">
						<!-- <Currency :currency="item.price"></Currency> -->
					</div>
					<div class="pic">
						<!-- <img :src="item.iconUrl" :alt="item.goodsName" /> -->

						<img :src="getImageIcon(item)" :alt="item.goodsName" />
					</div>
					<div class="bottom">
						<p>
							<HeadPortrait
								:userModel="item.user"
								:size="'main_data'"
							></HeadPortrait>
						</p>
						<div class="right">
							<div style="display: flex">
								<Currency :font-weight="700" :currency="item.price"></Currency>
							</div>
							<p class="hide">{{ item.user.nickName }}</p>
						</div>
					</div>
				</div>
			</div>
			<div
				class="btn-more"
				v-if="!winningFinished && rollInfo.isSettle"
				@click="onWinningLoad"
			>
			{{ t('common.loadmore') }}
			</div>
		</div>

		<div class="join-pw" :class="{ active: passwordShow }">
			<div class="pw-join-box">
				<p>{{ t('battle.enterPassword') }}</p>
				<input type="text" v-model="password" ref="input" maxlength="10" />
				<div class="pw-join-btns">
					<p @click="onClickPWCancel">{{ t( 'notify.cancel' ) }}</p>
					<p @click="onClickPWJoin">{{ t( 'notify.confirm' ) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#roll_details {
	box-sizing: border-box;
	width: 750px;
	.roll-details-info {
		width: 710px;
		border: 1px solid #2d2d67;

		box-shadow: 0px 0px 59px 1px rgba(41, 34, 139, 0.15) inset;
		box-sizing: border-box;
		margin: auto;
		.roll-detail-top {
			box-sizing: border-box;
			display: flex;
			width: 710px;
			height: 600px;
			padding: 60px;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			background: url(@/assets/romimg/roll/roll_detail_gf_bg.png) no-repeat top;
			background-size: 710px 512px;
			&.active {
				background: url(@/assets/romimg/roll/roll_detail_zhubo_bg.png) no-repeat
					top;
				background-size: 710px 512px;
			}

			.rollname {
				color: #fff;
				text-align: center;

				font-size: 48px;
				font-style: normal;
				font-weight: 400;
				width: 600px;
			}
			.detail_logo {
				margin-top: 20px;
				img {
					position: relative;
					width: calc( 170px / 74px * 74px );
					height: calc( 170px / 74px * 89px );
					// border-radius: 44px;
				}
				.desc {
					margin: auto;
					position: relative;
					top: -30px;
					display: flex;
					width: 150px;
					height: 56px;
					justify-content: center;
					align-items: center;
					color: #fff;
					text-align: center;

					font-size: 24px;
					font-style: normal;
					font-weight: 400;
					text-transform: uppercase;
					border-radius: 20px;
					// background: #cb8928;
					// &.active {
					// 	background: #7349ca;
					// }
				}
			}
			.details-btn-wrap {
				.details-btn {
					box-sizing: border-box;
					display: flex;
					// width: 400px;
					// height: 100px;

					width: 325px;
					height: 90px;

					padding: 20px 0px;
					justify-content: center;
					align-items: center;
					flex-shrink: 0;
					border-radius: 8px;
					background: #3a33ac;
					color: #fff;
					text-align: center;
					font-size: 44px;
					font-style: normal;
					font-weight: 700;
					text-transform: uppercase;
					&.join {
						background: #121322;
					}
				}
			}
		}
		.roll-detail-bottom {
			box-sizing: border-box;
			.roll-detail-row {
				display: flex;
				// justify-content: space-between;
				align-items: center;
				color: #fff;
				font-size: 28px;
				font-style: normal;
				font-weight: 400;
				text-transform: uppercase;
				padding: 5px 20px;
				box-sizing: border-box;
				align-items: center;
				justify-content: space-between;
				.roll-detail-item {
					// flex: 1;
					display: flex;
					align-items: center;

					.item_span {
						margin-left: 10px;
						color: #f9a328;
						font-size: 30px;
						font-style: normal;
						font-weight: 500;
					}

					#currency-wrap {
						margin-left: 10px;
						color: #f9a328;
					}
				}
			}
			.roll-detail-desc {
				padding: 8px 20px;
				color: #878ba8;

				font-size: 28px;
				font-style: normal;
				font-weight: 400;
				box-sizing: border-box;
			}

			.roll-detail-time {
				display: flex;
				align-items: center;
				color: #8d91ae;
				padding: 5px 20px 15px 20px;
				font-size: 24px;
				font-style: normal;
				font-weight: 500;
				box-sizing: border-box;
				img {
					width: 32px;
					height: 32px;
				}
			}
		}

		.roll-type {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 103px;
			height: 103px;
			border: 2px solid #fbfa02;
			border-radius: 50%;

			img {
				width: 78px;
				height: 27px;
			}
		}

		.roll-detail-content {
			display: flex;
			flex-direction: column;
			width: 495px;
			margin-left: 20px;
			position: relative;

			.details-info-top {
				display: flex;

				.name {
					color: #fff;
					font-size: 30px;
					text-align: left;
					width: 520px;
					font-weight: bold;
				}
			}

			.details-rule {
				width: 520px;
				margin: 20px auto;
				display: flex;
				height: 80px;
				box-sizing: border-box;

				.details-rule-content {
					display: flex;
					width: 100%;
					color: #fff;
					font-size: 22px;
				}
			}

			.details-info-bottom {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				position: absolute;
				left: 0;
				bottom: 0px;

				.details-info-time {
					box-sizing: border-box;
					font-size: 20px;
					color: #00f0ff;
					margin-top: 10px;

					span {
						color: #00f0ff;
						font-size: 20px;
					}
				}

				.open-time {
					margin-top: 12px;
					.van-count-down {
						display: flex !important;
						align-items: center;

						.count-item {
							display: flex;
							align-items: center;

							.count-bk {
								display: flex;
								align-items: center;
								justify-content: center;
								width: 40px;
								height: 40px;
								background: #01f0ff;
								border-radius: 8px;
								font-size: 26px;
								color: #000000;
								font-weight: bold;
							}

							.count-txt {
								font-size: 24px;
								color: #00f0ff;
								margin: 0 8px;
							}
						}
					}
				}

				// .details-btn {
				//	 width: 208px;
				//	 height: 63px;
				//	 background: url(@/assets/romimg/roll/join.png) no-repeat center;
				//	 background-size: 100% 100%;
				//	 text-align: center;
				//	 line-height: 63px;
				//	 font-size: 24px;
				//	 margin-left: 80px;
				//	 color: #141221;
				//	 margin-top: 40px;
				// }
			}
		}
	}

	.title {
		margin-top: 60px;
	}

	.count-text {
		padding: 20px 46px;
		text-align: left;
		color: #f9a328;
		font-size: 28px;
		font-style: normal;
		font-weight: 400;
		box-sizing: border-box;
		// span {
		// }
	}

	.wait-open-wrap {
		height: 500px;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		color: #545774;
		font-size: 28px;
		font-weight: 500;
		img {
			width: 376px;
			height: 130px;
			margin-bottom: 50px;
		}
	}
	.btn-more {
		// width: 208px;
		// height: 63px;
		// background: url(@/assets/romimg/roll/join.png) no-repeat center;
		// background-size: 100% 100%;
		// text-align: center;
		// line-height: 63px;
		// font-size: 24px;
		// color: #141221;
		// margin: 25px auto;

		width: 208px;
		height: 63px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		text-align: center;
		// background: #3a34b0;
		font-size: 24px;
		color: #fff;
		margin: 25px auto;
	}

	.join-user-list {
		width: 100%;
		padding: 10px 30px;
		box-sizing: border-box;
		justify-content: flex-start;
		display: flex;

		flex-wrap: wrap;

		.join-user-item {
			width: 135px;
			height: 180px;
			margin-top: 20px;
			// margin-right: 28px;
			// margin-top: 26px;
			// padding-bottom: 30px;

			.join-user-img {
				margin: auto;
				width: 130px;
				height: 130px;
				// border-radius: 50%;
				// margin: 0 auto;
			}

			p {
				// font-size: 20px;
				// color: #fff;
				// text-align: center;
				// padding: 0 20px;
				// box-sizing: border-box;
				margin: auto;
				width: 110px;
				margin-top: -10px;
				color: #545774;
				text-align: center;
				font-size: 26px;
				font-style: normal;
				font-weight: 400;
			}
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
			border: 1px solid #fbfa02;

			p {
				font-size: 32px;
				text-align: center;
				margin: 40px 0;
			}

			input {
				width: 477px;
				height: 61px;
				border: 2px solid #fbfa02;
				background: none;
				padding: 0 20px;
				box-sizing: border-box;
				font-size: 28px;
			}

			.pw-join-btns {
				display: flex;
				height: 80px;
				border-top: 2px solid #fbfa02;
				margin-top: 26px;

				p {
					width: 50%;
					height: 80px;
					text-align: center;
					line-height: 80px;
					margin: 0;
					color: #fbfa02;
					font-size: 32px;

					&:first-child {
						border-right: 2px solid #fbfa02;
					}
				}
			}
		}
	}

	.head-wrap {
		margin-right: 4px;
	}

	.drop-list {
		box-sizing: border-box;
		justify-content: space-between;
		padding: 0 20px;
		display: flex;
		flex-wrap: wrap;

		.drop-item {
			height: 496px;
			width: 348px;
			border-radius: 10px;
			margin-bottom: 20px;
			background-position: center;
			background-size: cover;
			background-repeat: no-repeat;
			// background-color: rgba(25, 28, 53, 0.41);
			background-color: #1b1e38;
			.price {
				text-align: center;
				font-size: 16.393px;
				font-style: normal;
				font-weight: 700;
				line-height: normal;
				margin-top: 38px;
				height: 20px;
			}
			.pic {
				width: 265px;
				height: 200px;
				flex-shrink: 0;
				margin: 40px auto;
				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			.bottom {
				margin: auto;
				padding-top: 30px;
				width: 336px;
				height: 102px;
				display: flex;
				justify-content: center;
				padding-left: 50px;
				.right {
					margin-left: 30px;
					text-align: left;
					width: 356px;
					height: 102px;
					color: #cbccd6;
					padding-top: 15px;
					box-sizing: border-box;
					p {
						color: #cbccd6;
						font-size: 24px;
						font-style: normal;
						font-weight: 300;

						height: 40px;
						text-align: left;
						width: 150px;
						margin-top: 10px;
					}
					// p:last-child {
					//	 display: flex;
					//	 height: 50px;
					//	 color: #cbccd6;
					//	 text-align: left;
					//	 // padding-top: 10px;
					//	 font-size: 24px;
					//	 font-style: normal;
					//	 font-weight: 500;
					//	 width: 150px;
					//	 // line-height: 15.368px; /* 125% */

					//	 // .m-head-timing {
					//	 //	 width: 68px !important;
					//	 //	 height: 68px !important;
					//	 // }
					// }
				}
			}

			//	 &::after {
			//		 display: block;
			//		 position: absolute;
			//		 content: "";
			//		 width: 100%;
			//		 height: 2px;
			//		 border-bottom: 1px solid #fff;
			//		 left: 0;
			//		 bottom: 0;
			//	 }

			//	 p {
			//		 width: 236px;
			//		 text-align: center;
			//		 line-height: 124px;
			//		 font-size: 20px;
			//		 color: #ffffff;

			//		 &:nth-child(2) {
			//			 display: flex;
			//			 justify-content: center;
			//			 align-items: center;
			//		 }
			//	 }
		}
	}
}
</style>
