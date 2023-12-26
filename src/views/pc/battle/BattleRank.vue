<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from '@/components/pc/head/HeadPortrait.vue';
import BattleRankTopItem from './components/BattleRankTopItem.vue'
import { onMounted, ref, computed } from 'vue';
import { getRankList } from "@/network/api/battle"
import { useStore } from 'vuex';
import { useRouter } from "vue-router";
import Price from '@/components/pc/common/Price.vue'

const router = useRouter();
const store = useStore();
const userInfoBase = computed(() => store.state.userInfoBase);
const rankData = ref([]);
const todayRankData = ref([]);
const yesRankData = ref([]);

const frontDayStar = ref({});

const topRank = ref([]);
const otherRank = ref([]);
const selRank = ref({});

const newRank = ref([]) /// 新顺序 2 1 3排序


onMounted(() => {
	getRank();
})

async function getRank() {
	const res = await getRankList({ limit: 10 });
	// window.$dev && console.log( res )
	if (res.code === 0) {
		todayRankData.value = res.data.items || [];
		yesRankData.value = res.data.frontItems || [];
		frontDayStar.value = res.data.frontDayStar || {};
		rankData.value = todayRankData.value;

		topRank.value = todayRankData.value.slice(0, 3) || [];
		otherRank.value = todayRankData.value.slice(3) || [];

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
		<div class="rank-wrap">

			<div class="top-wrap">
				<div class="top-warp-fix">
					<BattleRankTopItem :rank="index + 1" v-for="( item, index ) in topRank" :key="index">
						<!-- <img :src="item.avater" v-if="item.avater" alt="" class="avatar">
						<div class="nickname">{{item.nickName}}</div>
						<div class="score" v-if="item.sumScore"><img src="@/assets/pcimg/common/coin.svg" alt=""/>{{item.sumScore}}</div> -->
						<div class="top-rank-item">
							<img src="@/assets/pcimg/battle/top-icon.png" class="icon">
							<div class="user-info">
								<img :src="item.avater" class="user-avatar">
								<div>{{ index + 1 }}</div>
							</div>
							<div class="other-info">
								<Price show-icon font-weight="700" :value="item.sumScore" color="#71E3A0" before-size="27px"
									after-size="20px"></Price>
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
						<div class="info1"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt=""/>{{ item.sumScore }}</div>
						<div class="info2">{{ item.nickName }}</div>
					</div> -->
				<!-- </div> -->
			</div>
			<div class="list-header">
				<p class="header1">#</p>
				<p class="header2">{{ t('common.users') }}</p>
				<p class="header3">{{ t('rank.point') }}</p>
			</div>

			<div class="list-wrap">
				<div class="rank-item me" v-if="false">
					<div class="item-rank">{{ selRank.rank }}</div>
					<div class="item-user">
						<HeadPortrait :userModel='userInfoBase' :size="'pc-battle-header-small'" :hide-frame="true">
						</HeadPortrait>
						<span>{{ userInfoBase.nickName }}</span>
					</div>
					<div class="item-score"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
						selRank.sumScore }}</div>
				</div>
				<div v-for="(item, index) in otherRank" class="rank-item" :key="index">
					<div class="item-rank">{{ index + 4 }}</div>
					<div class="item-user">
						<HeadPortrait :userModel='item' :size="'pc-battle-header-small'" :hide-frame="true">
						</HeadPortrait>
						<span>{{ item.nickName }}</span>
					</div>
					<div class="item-score">
						<!-- <img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt=""/>{{ item.sumScore }} -->
						<Price :value="item.sumScore" color="#70C593" before-size="18px" after-size="14px" show-icon>
						</Price>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
#pc-battleRank {
	max-width: 1440px;
	width: 100%;
	margin: auto;
	// padding: 0 15px;
	box-sizing: border-box;
	min-height: 900px;

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
		// margin-top: 100px;

		.top-wrap {
			display: flex;
			// justify-content: space-between;
			justify-content: center;
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
						background: rgba(37, 35, 43, 0.54);
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

							.nick-name {
								color: #bec0c5;
								font-weight: 200;
								font-size: 17px;
								line-height: 27px;
								padding-top: 8px;
							}
						}
					}
				}

				// .top-container
				// {
				//	 width: calc( 100% / 3 );
				//	 // min-width: 308px;
				//	 height: 100%;
				//	 display: flex;
				//	 // justify-content: center;
				//	 align-items: center;
				//	 // border: 1px solid red;
				//	 flex-direction: column;
				//	 align-items: center;
				//	 box-sizing: border-box;
				//	 background-position: bottom center !important;

				//	 .avatar
				//	 {
				//		 width: 118px;
				//		 height: 118px;
				//		 border-radius: 18px;
				//	 }

				//	 .nickname
				//	 {
				//		 color: #EDF0F7;
				//		 font-size: 28px;
				//		 padding-top: 38px;
				//		 padding-bottom: 4px;
				//	 }

				//	 .score
				//	 {
				//		 color: #7BDCA2;
				//		 font-size: 24px;
				//		 display: flex;
				//		 gap: 6px;
				//		 align-items: center;
				//	 }

				//	 &.rank-1
				//	 {
				//		 background: url( @/assets/pcimg/battle/rank_top2_bg.png ) no-repeat;
				//		 background-size: cover;
				//		 padding-top: 84px;
				//	 }

				//	 &.rank-2
				//	 {
				//		 background: url( @/assets/pcimg/battle/rank_top1_bg.png ) no-repeat;
				//		 background-size: cover;
				//		 padding-top: 44px;
				//	 }

				//	 &.rank-3
				//	 {
				//		 background: url( @/assets/pcimg/battle/rank_top3_bg.png ) no-repeat;
				//		 background-size: cover;
				//		 padding-top: 106px;
				//	 }
				// }

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


			width: 100%;
			margin-top: 24px;
			margin-bottom: 16px;
			color: #727391;
			text-transform: uppercase;
			font-size: 16px;
			font-weight: 500;
			text-align: left;
			display: flex;
			align-items: center;
			box-sizing: border-box;

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


		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			width: 100%;
			position: relative;
			box-sizing: border-box;
			padding: 0 20px;

			.rank-item {
				position: relative;
				width: 100%;
				display: flex;
				height: 64px;
				align-items: center;
				border-radius: 8px;
				background: #131528;
				margin-bottom: 2px;
				// padding-left: 39px;
				// padding-right: 10px;
				box-sizing: border-box;

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
					color: #70C593;

					font-size: 18px;
					font-weight: 700;
					width: 210px;
					text-align: left;


					img {
						width: 18px;
						height: 18px;
						margin-bottom: -2px;
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