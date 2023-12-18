<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from '@/components/pc/head/HeadPortrait.vue';
import BattleRankTopItem from '../battle/components/BattleRankTopItem.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue';
// import { getRankList } from "@/network/api/battle"
import { useStore } from 'vuex';
import { useRouter } from "vue-router";
import Price from '@/components/pc/common/Price.vue'
import { getPointRank } from '@/network/api/extend';
import { timeCountdown } from '@/util/common'

const router = useRouter();
const store = useStore();
const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoAssets = computed(() => store.state.userInfoAssets)
const hasLogin = computed(() => store.getters.hasLogin)
const rankData = ref([]);
const todayRankData = ref([]);
const yesRankData = ref([]);

const frontDayStar = ref({});

const topRank = ref([]);
const otherRank = ref([]);
const selRank = ref({});
const rewardAmount = ref(0)
const newRank = ref([]) /// 新顺序 2 1 3排序
const surplusTime = ref(0)	/// 倒计时

const timer = ref(0)
const overtime = ref({
	days: 0,
	hours: 0,
	min: 0,
	sec: 0
})

const myRank = ref(null)

// const myRank = ref( 0 )
// const myPoint = ref( 0 )
// const myReward = ref( 0 )

onMounted(() => {
	getRank();
})

onUnmounted(() => {
	clearInterval(timer.value)
})

async function getRank() {
	// const res = await getRankList({ limit: 10 });
	const res = await getPointRank()
	// window.$dev && console.log( res )
	if (res.code === 0) {
		todayRankData.value = res.data.items || [];

		// for( let i = 0; i < 10; i++ )
		// {
		//	 todayRankData.value.push( ...res.data.items )
		// }

		yesRankData.value = res.data.frontItems || [];
		frontDayStar.value = res.data.frontDayStar || {};
		rankData.value = todayRankData.value;
		rewardAmount.value = res.data.rewardAmount

		myRank.value = res.data.myRankItem
		// window.$dev && console.log( myRank.value )

		// myRank.value = res.data.myRankNum
		// myPoint.value = res.data.myPoint
		// myReward.value = res.data.rewardAmount

		topRank.value = todayRankData.value.slice(0, 3) || [];
		otherRank.value = todayRankData.value.slice(3) || [];

		surplusTime.value = new Date().getTime() / 1000 + Number(res.data.surplusTime)

		timer.value = setInterval(() => {
			overtime.value = timeCountdown(surplusTime.value)
		}, 1000)
		// newRank.value[0] = topRank.value[1] || {}
		// newRank.value[1] = topRank.value[0] || {}
		// newRank.value[2] = topRank.value[2] || {}

		// window.$dev && console.log( topRank.value, otherRank.value )

		let topRankLength = topRank.value.length;
		if (topRankLength < 3) {
			for (let index = 0; index < 3 - topRankLength; index++) {
				topRank.value.push({});
			}
		}

		selRank.value = { rank: t('rank.notOnList'), sumScore: "" };
		for (let index = 0; index < todayRankData.value.length; index++) {
			if (todayRankData.value.isSelf) {
				selRank.value.rank = index + 1;
				selRank.value.sumScore = todayRankData.value.sumScore;
			}
		}
	}
}


function onClickBack() {
	router.back();
}

function getNeedToTop() {
	if (otherRank.value.length < 1) return myRank.value && myRank.value.rewardAmount ? parseInts(myRank.value.rewardAmount) : 0

	let last = otherRank.value ? Number(otherRank.value[otherRank.value.length - 1].rewardAmount) : 0
	let me = myRank.value && myRank.value.rewardAmount ? Number(myRank.value.rewardAmount) : 0
	return parseInts(last - me + 1)
}

function parseInts(num) {
	return (Math.floor(num)).toLocaleString('en-US')
}

let showrule = ref(false);


function onRule() {
	showrule.value = true;
}

function offRule() {
	showrule.value = false;
}
</script>
		
<template>
	<div id="pc-battleRank">
		<!-- <div class="pc-battle-title">
			<div class="title-c">
				<img src="@/assets/pcimg/home/icon_battle2.png" alt="" />
				<p>排行榜</p>
				<div class="question" v-if="false"><img src="@/assets/pcimg/battle/question.png" alt="" /></div>
			</div>
			<div class="opts">
				<div class="opt" @click="onClickBack">
					<img src="@/assets/pcimg/common/back.png" alt="" />返回
				</div>
			</div>
		</div> -->

		<div class="rank-header-container">
			<!-- <div class="header">
				<div class="menu">
					<div class="menu-item left">
						<div>通缉悬赏</div>
						<div>您目前排名 {{selRank.rank}}</div>
					</div>
					<div class="menu-item center">
						<div>Tokenmania</div>
						<div>即将到来...</div>
					</div>
					<div class="menu-item right">
						<div>幸运射击</div>
						<div>活动暂停...</div>
					</div>
				</div>
			</div> -->

			<div class="body">
				<div class="intro">
					<div class="rule" @click="onRule">{{ t('rank.rule') }}</div>
					<div class="content">
						<div class="s-title">{{ t('rank.timeLeft') }}</div>
						<div class="count-down">
							{{ overtime.days }} {{ t('timebox.days') }},
							{{ overtime.hours < 10 ? `0${overtime.hours}` : overtime.hours }} : {{ overtime.min < 10 ?
								`0${overtime.min}` : overtime.min }} : {{ overtime.sec < 10 ? `0${overtime.sec}` :
		overtime.sec }} </div>
						</div>
					</div>
					<div class="ad">
						<div class="r-title"><img src="@/assets/pcimg/battle/coins-lg.png" alt="" />{{ parseInts(
							rewardAmount) }}</div>
						<div class="r-subtitle">{{ t('rank.balance') }}</div>
						<div class="r-content">{{ t('rank.subtitle') }}</div>
					</div>
				</div>
			</div>

			<div class="rank-wrap">

				<div class="top-wrap">
					<div class="top-warp-fix">
						<BattleRankTopItem :rank="index + 1" v-for="( item, index ) in topRank" :key="index">
							<!-- <img :src="item.avater" v-if="item.avater" alt="" class="avatar">
						<div class="nickname">{{item.nickName}}</div>
						<div class="score" v-if="item.sumScore"><img src="@/assets/pcimg/common/coin.png" alt=""/>{{item.sumScore}}</div> -->
							<div class="top-rank-item">
								<img src="@/assets/pcimg/battle/top-icon.png" class="icon">
								<div class="user-info">
									<img :src="item.avater" class="user-avatar">
									<div>{{ index + 1 }}</div>
								</div>
								<div class="other-info">
									<div class="amount"><img src="@/assets/pcimg/common/coin.png" alt="" /> {{ parseInts(
										item.rewardAmount) }}</div>
									<div class="point">
										{{ parseInts(item.point) }}
										<img src="@/assets/pcimg/battle/point.png">
									</div>
									<div class="nick-name">{{ item.nickName }}</div>
								</div>
							</div>
						</BattleRankTopItem>
					</div>
					<!-- <div class="top-item" v-for="(item, index) in topRank" :key="index"> -->
					<!-- <div class="award" :class="[{ two: index == 1, three: index == 2 }]">
						<HeadPortrait :userModel='item' :size="'pc-battle-big-header'">
						</HeadPortrait>
					</div>
					<div class="info-wrap">
						<div class="info1"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt=""/>{{ item.sumScore }}</div>
						<div class="info2">{{ item.nickName }}</div>
					</div> -->
					<!-- </div> -->
				</div>
				<div class="list-header">
					<p class="header1">#</p>
					<p class="header2">{{ t('battle.users') }}</p>
					<p class="header3">{{ t('rank.point') }}</p>
					<p class="header4">{{ t('rank.balance') }}</p>
				</div>

				<div class="list-wrap">
					<!-- <div class="rank-item me" v-if="false">
					<div class="item-rank">{{ selRank.rank }}</div>
					<div class="item-user">
						<HeadPortrait :userModel='userInfoBase' :size="'pc-battle-header-small'" :hide-frame="true">
						</HeadPortrait>
						<span>{{ userInfoBase.nickName }}</span>
					</div>
					<div class="item-score"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt=""/>{{ selRank.sumScore }}</div>
				</div> -->
					<div class="rank-item my-rank" v-if="hasLogin">
						<div class="item-rank">{{ (myRank !== null && myRank.rankNum && myRank.rankNum < 50) ?
							myRank.rankNum : '50+' }}</div>
								<div class="item-user">
									<img :src="userInfoBase.avater">
									<span>{{ userInfoBase.nickName }}</span>
								</div>
								<div class="item-score">
									<img src="@/assets/pcimg/battle/point.png"> {{ (myRank && myRank.point) ? myRank.point
										: 0 }}
									<!-- <img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt=""/>{{ item.sumScore }} -->
									<!-- <Price :value="item.sumScore" color="#70C593" before-size="18px" after-size="14px" show-icon></Price> -->
								</div>
								<div class="item-price no-warp"
									v-if="myRank && myRank.rankNum != 0 && myRank.rankNum <= 50">
									<img src="@/assets/pcimg/common/coin.png" alt="" />{{ parseInts(myRank.rewardAmount)
									}}
								</div>
								<div class="item-price" v-else>
									<span>{{ t('rank.onListTip') }}</span>
									<div class="lable">
										{{ getNeedToTop() }}
										<img src="@/assets/pcimg/battle/warn.png">
										<div class="item-text">
											{{ t('rank.myRankTip') }}
										</div>
									</div>
								</div>
						</div>

						<div v-for="(item, index) in otherRank" class="rank-item" :key="index">
							<div class="item-rank">{{ index + 4 }}</div>
							<div class="item-user">
								<HeadPortrait :userModel='item' :size="'pc-battle-header-small'" :hide-frame="true">
								</HeadPortrait>
								<span>{{ item.nickName }}</span>
							</div>
							<div class="item-score">
								<img src="@/assets/pcimg/battle/point.png"> {{ parseInts(item.point) }}
								<!-- <img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt=""/>{{ item.sumScore }} -->
								<!-- <Price :value="item.sumScore" color="#70C593" before-size="18px" after-size="14px" show-icon></Price> -->
							</div>
							<div class="item-price">
								<img src="@/assets/pcimg/common/coin.png" alt="" />{{ parseInts(item.rewardAmount) }}
							</div>
						</div>
					</div>
				</div>

				<div class="game-rule" v-if="showrule">
					<div class="rule-body">
						<div class="close-btn" @click="offRule">
							<img src="@/assets/pcimg/recharge/close-tip.png" alt="" />
						</div>
						<div class="rule-text">
							<div class="text">
								<div class="round"></div>
								{{ t('rank.top50Tip') }}
							</div>
							<div class="text">
								<div class="round"></div>
								{{ t('rank.settleTip') }}
							</div>
							<div class="text">
								<div class="round"></div>
								{{ t('rank.pointTip') }}
							</div>
							<div class="text">
								<div class="round"></div>
								{{ t('rank.finishTip') }}
							</div>
						</div>
						<div class="tips">
							<img src="@/assets/pcimg/mall/tips.png">
							{{ t('rank.ruleTip') }}
						</div>
					</div>
				</div>
			</div>
</template>
		
<style lang="scss" scoped>
#pc-battleRank {
	// max-width: 1860px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	// margin: auto;
	// padding: 0 15px;
	box-sizing: border-box;
	min-height: 900px;

	.game-rule {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
		position: fixed; //创建弹窗背景
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, .7);
		left: 0;
		top: 0;
		z-index: 200;
		transition: all 0.3s ease;

		.rule-body {
			position: absolute;
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;
			/* 垂直居中 */
			flex-direction: column;
			/* 子元素垂直排列 */
			width: 660px;
			height: 267px;
			background-color: #16182E;
			border-radius: 10px;
			z-index: 200;
			transition: all 0.3s ease;

			.close-btn {
				position: absolute;
				right: 14px;
				top: 15px;
				transition: .3s;
				cursor: pointer; //鼠标变手

				&:hover {
					transform: scale(1.2);
				}
			}

			.tips {
				display: flex;
				// justify-content: center; /* 水平居中 */
				align-items: center;
				/* 垂直居中 */
				width: 582px;
				height: 57px;
				background: #191C34;
				color: #8792F1;
				border-radius: 7px;
				padding: 18px 28px 18px 15px;
				box-sizing: border-box;
				font-weight: bold;

				/* 加粗字体 */
				img {
					width: 18px;
					height: 18px;
					margin-right: 15px;
				}
			}

			.rule-text {
				width: 582px;
				height: 108px;
				margin-bottom: 25px;

				.text {
					display: flex;
					align-items: center;
					/* 垂直居中 */
					// padding-left: 25px;
					color: #CECFD6;
					line-height: 15px;
					font-size: 13px;
					margin-bottom: 16px;

					.round {
						margin-right: 15px;
						width: 5px;
						height: 5px;
						background: #393943;
						border-radius: 5px;
					}
				}
			}
		}
	}

	.rank-header-container {
		display: flex;
		max-width: 1860px;
		width: 100%;
		flex-direction: column;
		align-items: center;
		background: url(@/assets/pcimg/battle/rank-header-bg.png ) no-repeat;
		background-position: 460px bottom;
		height: 560px;
		padding: 44px 0 0 0;
		box-sizing: border-box;
		// border: 1px solid red;

		.header {
			max-width: 1600px;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			// border: 1px solid red;
			height: 106px;

			.menu {
				max-width: 1400px;
				width: 100%;
				display: flex;
				align-items: center;
				padding: 6px;
				box-sizing: border-box;
				gap: 6px;
				border-radius: 12px;
				background: rgba(18, 18, 24, 0.70);
				overflow: hidden;

				.menu-item {
					height: 94px;
					width: 459px;
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					padding: 20px;
					justify-content: flex-end;
					// border: 1px solid red;

					div {
						&:first-child {
							color: #FFF;
							// 
							font-size: 19px;
							font-style: normal;
							font-weight: 900;
							line-height: 23px;
							/* 121.053% */
						}

						&:last-child {
							color: #FFBD81;

							font-size: 10px;
							font-style: normal;
							font-weight: 400;
							line-height: 15px;
							/* 150% */
							text-transform: uppercase;
						}
					}

					&.left {
						background: url(@/assets/pcimg/battle/rank-header-left-bg.png ) no-repeat;
					}

					&.right {
						background: url(@/assets/pcimg/battle/rank-header-right-bg.png ) no-repeat;
						opacity: .4;
					}

					&.center {
						background: url(@/assets/pcimg/battle/rank-header-center-bg.png ) no-repeat;
						opacity: .4;
					}
				}
			}
		}

		.body {
			max-width: 1400px;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding: 40px 0;
			box-sizing: border-box;
			// border: 1px solid red;

			.intro {
				display: flex;
				gap: 24px;

				.rule {
					border-radius: 8px;
					background: #232642;
					// border-radius: 8px;
					// background: rgba(49, 49, 63, 0.42);
					color: #CFD4FF;
					text-align: center;

					font-size: 13px;
					font-style: normal;
					font-weight: 700;
					// line-height: 19.5px; /* 150% */
					display: flex;
					align-items: center;
					justify-content: center;
					width: 96px;
					height: 52px;
					transition: all 0.3s ease;
					cursor: pointer; //鼠标变手

					&:hover {
						background: #363963;
						transition: all 0.3s ease;
					}
				}

				.content {
					display: flex;
					flex-direction: column;

					.s-title {
						display: flex;
						justify-content: center;
						/* 水平居中 */
						align-items: center;
						/* 垂直居中 */
						color: #A09999;
						// 
						font-size: 13px;
						font-style: normal;
						font-weight: 300;
						line-height: 19.5px;
						/* 150% */
						text-transform: uppercase;
					}

					.count-down {
						color: #DD8D73;

						font-size: 20px;
						font-style: normal;
						font-weight: 700;
						line-height: 30px;
						/* 150% */
						text-transform: uppercase;
					}
				}
			}

			.ad {
				.r-title {
					color: #FFF8F2;
					// 
					font-size: 102px;
					font-style: normal;
					font-weight: 800;
					line-height: 122.4px;
					/* 120% */
					padding: 24px 0 4px 0;
					display: flex;
					gap: 40px;
					align-items: center;

					img {
						width: 98px;
					}
				}

				.r-subtitle {
					color: #EFD9B8;

					font-size: 51px;
					font-style: normal;
					font-weight: 700;
					line-height: 51px;
					/* 100% */
					text-transform: uppercase;
				}

				.r-content {
					color: #898A91;

					font-size: 17px;
					font-style: normal;
					font-weight: 290;
					line-height: 17px;
					/* 100% */
					padding-top: 17px;
				}
			}
		}
	}

	.pc-battle-title {
		height: 138px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;

		.title-c {
			color: #fff;
			font-size: 27px;
			display: flex;
			align-items: center;
			position: relative;

			img {
				width: 28px;
				height: 28px;
				margin-right: 10px;
			}

			.question {
				position: absolute;
				top: -10px;
				right: -36px;

				img {
					width: 17px;
					height: 17px;
				}
			}
		}

		.opts {
			display: flex;
			justify-content: center;
			align-items: center;
			color: #cfd4ff;
			font-size: 14px;

			.opt {
				cursor: pointer;
				margin: 10px;
				display: flex;
				align-items: center;
				padding: 0 50px;
				height: 60px;
				flex-shrink: 0;
				vertical-align: middle;
				border-radius: 4px;
				border: 1px solid #313350;

				img {
					width: 17px;
					height: 17px;
					margin-right: 15px;
				}
			}
		}
	}

	.rank-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1860px;
		width: 100%;
		margin-top: -180px;

		.top-wrap {
			display: flex;
			// justify-content: space-between;
			justify-content: center;
			max-width: 1400px;
			width: 100%;
			height: 324px;
			// background: #101120;;

			.top-warp-fix {
				// width: calc( 308px *3 );
				width: 100%;
				display: flex;
				gap: 20px;
				// padding: 42px 0;
				align-items: center;

				.top-container {
					width: calc(100% / 3);
					display: flex;

					// flex: 1;
					.top-rank-item {
						border-radius: 12px;
						border: 1px dashed rgba(119, 106, 102, 0.12);
						background: #111324;
						// width: 453px;
						width: 100%;
						display: flex;
						position: relative;
						height: 167px;
						justify-content: space-between;
						align-items: center;

						.icon {
							width: 172px;
							height: 247px;
							position: absolute;
							left: 20px;
							top: -40px;
							z-index: 1;
						}

						.user-info {
							z-index: 2;
							width: 172px;
							display: flex;
							justify-content: flex-end;
							flex-direction: column;
							align-items: center;
							height: 100%;
							padding-left: 20px;

							.user-avatar {
								width: 66px;
								height: 66px;
								border-radius: 14px;
							}

							div {
								font-size: 21px;
								color: #131528;
								line-height: 31px;
								padding-top: 8px;
								font-weight: 700;
							}
						}

						.other-info {
							z-index: 2;
							display: flex;
							flex-direction: column;
							align-items: center;
							width: calc(100% - 172px - 20px - 36px);
							padding-right: 36px;

							.point {
								color: #FFCD6C;
								// 
								font-size: 17.859px;
								font-style: normal;
								font-weight: 700;
								line-height: 27px;
								/* 151.181% */
								display: flex;
								align-items: center;

								img {
									width: 22px;
									margin-left: 6px;
								}
							}

							.nick-name {
								color: #bec0c5;
								font-weight: 200;
								font-size: 17px;
								line-height: 27px;
								padding-top: 8px;
							}

							.amount {
								color: #71E3A0;
								// 
								font-size: 27.672px;
								font-style: normal;
								font-weight: 900;
								line-height: 34px;
								/* 122.868% */
								display: flex;
								align-items: center;
								gap: 8px;

								img {
									width: 26px;
								}
							}
						}
					}
				}

				.top-item {
					display: flex;
					width: 308px;
					// height: 168px;
					height: 100%;
					justify-content: flex-end;
					align-items: center;
					flex-shrink: 0;
					border-radius: 12px;
					// border: 1px dashed rgba(119, 106, 102, 0.12);
					// background: #1B1E38;
					position: relative;
					box-sizing: border-box;

					.info-wrap {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						width: 205px;
						margin-right: 20px;

						.info1 {
							color: #71E3A0;
							text-align: center;

							font-size: 27px;
							font-weight: 700;

							img {
								width: 20px;
								height: 20px;
								margin-bottom: -2px;
							}
						}

						.info2 {
							color: #BEC0C5;
							text-align: center;

							font-size: 16px;
							font-weight: 300;
							margin-top: 10px;
						}
					}

					.award {
						width: 187px;
						height: 268px;
						background: url(@/assets/pcimg/battle/rank1.png) center no-repeat;
						background-size: 100% 100%;
						position: absolute;
						left: 30px;
						top: -50px;
						display: flex;
						align-items: center;
						justify-content: center;
						padding-top: 16px;
						box-sizing: border-box;

						&.two {
							background: url(@/assets/pcimg/battle/rank2.png) center no-repeat;
							background-size: 100% 100%;
							padding-top: 18px;
						}

						&.three {
							background: url(@/assets/pcimg/battle/rank3.png) center no-repeat;
							background-size: 100% 100%;
							padding-top: 5px;
						}
					}
				}
			}
		}

		.list-header {
			// border: 1px solid red;
			max-width: 1400px;
			width: 100%;
			height: 71px;
			color: #6D6C82;
			font-size: 12px;
			text-align: left;
			display: flex;
			align-items: center;
			box-sizing: border-box;
			// margin-top: 60px;
			// padding: 0 20px;
			// padding-left: 39px;
			// padding-right: 10px;

			p {
				box-sizing: border-box;
				text-align: left;
			}

			.header1 {
				width: 100px;
				// margin-right: 25px;
				text-align: center;
			}

			.header2 {
				flex: 1;
			}

			.header3 {
				width: 210px;
			}

			.header4 {
				width: 163px;
			}
		}

		.list-wrap {
			// border: 1px solid red;
			display: flex;
			flex-direction: column;
			max-width: 1400px;
			width: 100%;
			position: relative;
			box-sizing: border-box;
			// padding: 0 20px;

			.rank-item {
				position: relative;
				width: 100%;
				display: flex;
				height: 64px;
				align-items: center;
				border-radius: 8px;
				// background: #131528;
				margin-bottom: 2px;
				// padding-left: 39px;
				// padding-right: 10px;
				box-sizing: border-box;
				background: #131528;
				gap: 5px;

				&:nth-child(odd) {
					background: #111324;
				}

				&.my-rank {
					width: 100%;
					height: 74px;
					border-radius: 8px;
					// background: #111324;

					background: #111324 url(@/assets/pcimg/battle/myrank-bg.png ) no-repeat;
					// background-size: 100% 100%;
					background-size: 184px 73px;
					background-position-x: 8px;
					background-position-y: bottom;
					// background: linear-gradient(180deg, #1A191F 0%, #232027 100%);

					.item-rank {
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.item-user {
						img {
							width: 30px;
						}
					}

					.item-price {
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						gap: 4px;

						&.no-warp {
							flex-direction: row;
							justify-content: flex-start;
							align-items: center;
						}





						.lable {
							color: #ECDFD2;
							// 
							font-size: 16px;
							font-style: normal;
							font-weight: 700;
							line-height: 19px;
							/* 118.75% */
							display: flex;
							align-items: center;
							gap: 7px;
							cursor: pointer; //鼠标变手

							.item-text {
								display: flex;
								justify-content: center;
								/* 水平居中 */
								align-items: center;
								/* 垂直居中 */
								flex-direction: column;
								/* 子元素垂直排列 */
								opacity: 0;
								/* 设置透明度为 50% */
								position: absolute;
								right: 78px;
								bottom: 53px;
								// margin-left:80px;
								min-height: 40px;
								width: 280px;
								background-color: #20233F;
								color: #FFFFFF;
								// line-height: 40px;
								// line-width: 150px;
								font-size: 13px;
								padding: 9px 20px;
								border-radius: 8px;
								// white-space: nowrap;
								z-index: 2;
								box-sizing: border-box;
								// display: none;
								transition: all 0.3s ease;
								font-weight: 400;

								&::after {
									display: block;
									content: "";
									width: 33px;
									height: 27px;
									background: url(@/assets/pcimg/common/arrow_top.png) no-repeat center;
									background-size: contain;
									position: absolute;
									left: 220px;
									margin-top: 45px;
									// transform: rotate(180deg);
								}
							}

							&:hover {
								.item-text {
									opacity: 1;
									/* 设置透明度为 50% */
									transition: all 0.3s ease;
								}
							}
						}

						span {
							color: #8F8479;

							font-size: 12px;
							font-style: normal;
							font-weight: 700;
							line-height: 13px;
							/* 108.333% */
							text-transform: uppercase;
						}
					}
				}

				.item-rank {
					color: #A1A1A5;
					font-size: 16px;
					width: 100px;
					// margin-right: 25px;
					text-align: center;
				}

				.item-user {
					display: flex;
					align-items: center;
					flex: 1;

					span {
						color: #EDF0F7;
						font-size: 16px;
						margin-left: 14px;
					}
				}

				.item-score {
					width: 210px;
					text-align: left;
					color: #FFCD6C;
					// 
					font-size: 17.297px;
					font-style: normal;
					font-weight: 700;
					line-height: 27px;
					/* 156.098% */

					img {
						width: 18px;
						height: 18px;
						margin-bottom: -2px;
					}
				}

				.item-price {
					color: #70C593;
					// 
					font-size: 18px;
					font-style: normal;
					font-weight: 700;
					line-height: 27px;
					/* 150% */
					width: 163px;
					text-align: left;
					display: flex;
					align-items: center;
					gap: 4px;



					img {
						width: 19px;
						height: 18px;
					}
				}

				&.me {
					height: 74px;
					background: url(@/assets/pcimg/battle/rank_bg.png) center no-repeat;
					background-size: 100% 100%;
					margin-bottom: 6px;

					.item-rank {
						color: #fff;
						font-size: 16px;
					}

					.item-score {
						color: #fff;
					}
				}
			}
		}
	}
}
</style>