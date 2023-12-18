<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import fudaiImage from '@/assets/romimg/common/fudai.png';
import { getRollList, getMyRollList } from '@/network/api/roll';
import { GoodImageBgType } from '@/util/util'
import { tokenName } from '../../../config';

const route = useRoute();
const router = useRouter();
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 12 });
const loading = ref(false)
const rollLoading = ref(false)
const finished = ref(false)
const rollList = ref([]);

const tabType = ref(route.query.tabIndex || 1) //1-all 2-me

const downList = ref([{ text: t('battle.inProgress'), id: 1 }, { text: t('battle.notStarted'), id: 2 }]);
const rollState = ref({ text: t('battle.inProgress'), id: 1 })

const keyword = ref('')//搜索关键字

const roomListRef = ref([]);

onMounted(() => {
	getRollRoom()
})

watch(() => store.state.openResultRollId, (newRollId, preRollId) => {
	pager.value.pageIndex = 1
	keyword.value = ''
	finished.value = false
	getRollRoom()
})

async function getRollRoom() {
	let params = {}
	params.page = pager.value.pageIndex
	params.limit = pager.value.limit
	params.roomState = rollState.value.id
	params.platformId = store.state.platformId

	if (keyword.value) {
		params.roomName = keyword.value;
	}

	rollLoading.value = true

	let res
	if (tabType.value == 1) {
		res = await getRollList(params)
	}
	else if (tabType.value == 2) {
		res = await getMyRollList(params)
	}

	if (res && res.code == 0) {
		let items = res.data.items || []
		let preList = rollList.value
		if (res.data.page == 1) {
			preList = []
		}
		rollList.value = [...preList, ...items]
		// 加载状态结束
		loading.value = false

		// 数据全部加载完成
		if (items.length < res.data.limit) {
			finished.value = true
		}
	}
	else {
		loading.value = false
		finished.value = true
	}
	rollLoading.value = false
}

function onClickTab(type) {

	if (type == 2 && (!localStorage.getItem(tokenName))) {
		store.commit('setSignView', true)
		return
	}

	if (type == 1) {
		downList.value = [{ text: t('battle.inProgress'), id: 1 }, { text: t('battle.notStarted'), id: 2 }]
	}
	else {
		downList.value = [{ text: t('battle.inProgress'), id: 1 }, { text: t('battle.finished'), id: 2 }]
	}

	tabType.value = type
	pager.value.pageIndex = 1
	keyword.value = ''
	rollState.value = { text: t('battle.inProgress'), id: 1 }
	finished.value = false
	getRollRoom()
}

function onClickSearch() {
	pager.value.pageIndex = 1
	finished.value = false
	getRollRoom()
}

function onLoad() {
	if (rollLoading.value) return;
	pager.value.pageIndex += 1;
	getRollRoom();
}

function onClickItem(item) {
	router.push({
		path: '/p/roll_detail',
		query: {
			rollId: item.id
		}
	});
}

function onCountdown(date, index) {
	if (date.days == 0 && date.hours == 0) {
		roomListRef.value[index].className = 'roll-item-wrap active'
		if (date.milliseconds == 0 && date.minutes == 0) {
			roomListRef.value[index].className = 'roll-item-wrap'
		}
	}
}


function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
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

function judgeLotteryTime(item) {
	let offset = new Date(item.lotteryTime).getTime() - new Date().getTime();
	return offset < 3600000;
}

//倒计时过滤
function timeFilter(time) {
	let offset = new Date(time).getTime() - new Date().getTime();
	//相减并返回
	return offset
}

</script>
		
<template>
	<div id="pc-roll" class="min-wrap-height">
		<div class="pc-common-tabs">
			<div class="tab-item" :class="{ 'active': tabType == 1 }" @click="onClickTab(1)">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gifts"></use>
				</svg>{{ t('battle.allRoom') }}
			</div>
			<div v-if="false" class="tab-item" :class="{ 'active': tabType == 3 }" @click="onClickTab(3)">
				{{ t('battle.joinedRoom') }}
			</div>
			<div class="tab-item" :class="{ 'active': tabType == 2 }" @click="onClickTab(2)">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gift-3"></use>
				</svg>
				{{ t('battle.myRoom') }}
			</div>
			<div class="header-right">
				<input type="text" v-model="keyword" :placeholder="t('battle.searchByName')" />
				<div class="search-btn" @click="onClickSearch()">
					<svg class="icon-search">
						<use xlink:href="@/assets/icon.svg#search" ng-href="@/assets/icon.svg#search"></use>
					</svg>
				</div>
			</div>
		</div>
		<van-list v-model="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad"
			:immediate-check="false">
			<div class="roll-list-wrap">
				<div class="roll-item-wrap" v-for="(item, index) in rollList" :key="index" @click="onClickItem(item)"
					ref="roomListRef" :class="{ anchor: item.rollType == 2, over: item.isSettle }">
					<div class="roll-data-wrap" :class="{ 'member-room': item.anchorUser }">
						<div class="room-header" v-if="item.anchorUser">
							<!-- <img :src="item.anchorUser.avater"> -->
							<!-- <div>{{ t( 'battle.anchorReward' ) }}</div> -->
						</div>
						<div class="roll-name hide">{{ item.rollName }}</div>
					</div>

					<div class="roll-info-wrap">
						<div class="roll-info">
							<div class="roll-info-item">
								<p class="info-1">{{ t('battle.pricePrize') }}</p>
								<div class="info-2"> {{ item.priceNum }}</div>
							</div>
							<div class="roll-info-item">
								<p class="info-1">{{ t('battle.goodsNameTitle') }}</p>
								<p class="info-3"> {{ item.goodsNum }}</p>
							</div>
							<div class="roll-info-item">
								<p class="info-1"> {{ t('common.users') }}</p>
								<p class="info-3">{{ item.userNum }}</p>
							</div>

						</div>
						<div class="goods-list">
							<div class="goods-item" v-for="(value, index) in item.goodsItems" :key="index"
								:style="`background-image: url(` + getImageBg(value) + `)`">
								<img :src="getImageIcon(value)" :alt="value.goodsName">
								<div class="g-item-price">{{ value.price }}</div>
							</div>
						</div>
						<div class="btn-look"> <svg class="icon">
								<use xlink:href="@/assets/icon.svg#eye"></use>
							</svg>
							<p>{{ t('battle.viewRollRoom') }}</p>
						</div>
						<div class="award-time">{{ t('battle.rewardTime') }}：{{ item.lotteryTime }}</div>
					</div>
				</div>
			</div>
		</van-list>

	</div>
</template>
		
<style lang="scss">
#pc-roll {
	box-sizing: border-box;
	margin: 20px auto;
	width: 100%;

	.pc-common-tabs {
		max-width: 1420px;
		margin: 50px auto 0;
		position: relative;

		.tab-item {
			&:hover {
				border-bottom: solid 1px #4b56bc;
			}
		}

		.header-right {
			display: flex;
			position: absolute;
			max-width: 714px;
			// width: 100%;
			width: calc(100% - 600px);
			background: #1F213C;
			box-sizing: border-box;
			height: 100%;
			top: 0;
			right: 0;

			input {
				width: 100%;
				height: 100%;
				padding-left: 30px;
				padding-right: 70px;
				border: 0;
				font-size: 18px;
				font-weight: 300;
				padding-top: 3px;
				color: #bfc1d1;
				outline: 0;
				background-color: #1f213c;
				box-sizing: border-box;

				&::placeholder {
					color: #676C90;
				}
			}

			.search-btn {
				display: flex;
				align-items: center;
				position: absolute;
				top: 50%;
				right: 0px;
				color: #dbdded;
				transition: none;
				transform: translateY(-50%);
				cursor: pointer;
				box-sizing: border-box;
				width: 50px;
				height: 100%;

				.icon-search {
					width: 20px;
					height: 20px;
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					color: #dbdded;
					cursor: pointer;
					box-sizing: border-box;
				}
			}
		}
	}

	.roll-list-wrap {
		width: 100%;
		max-width: 1440px;
		box-sizing: border-box;
		margin: 25px auto 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, 270px);
		column-gap: 18px;
		row-gap: 16px;
		padding: 0 8px;

		.roll-item-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			box-sizing: border-box;
			position: relative;
			width: 270px;
			height: 383px;
			padding: 1px 1px 16px 1px;
			border: 1px solid #2D2D67;
			background: #15172C;
			box-shadow: 0px 0px 59px 1px rgba(41, 34, 139, 0.15) inset;

			&.over {
				opacity: .3;
			}

			.roll-data-wrap {
				display: flex;
				justify-content: center;
				width: 100%;
				height: 158px;
				background: url(@/assets/pcimg/roll/item_bg1.png) center no-repeat;
				background-size: 100% 100%;
				position: relative;

				&.member-room {
					background: url(@/assets/pcimg/roll/member-bg.png ) no-repeat center !important;
				}

				// &.member-room
				// {
				// 	background: url( @/assets/pcimg/roll/member-bg.png ) no-repeat center !important;
				// 	flex-direction: column;
				// 	align-items: center;
				// 	width: 100%;
				// 	background-size: 100% 100% !important;
				// 	// height: 100%;

				// 	.room-header
				// 	{
				// 		display: flex;
				// 		flex-direction: column;
				// 		position: relative;
				// 		align-items: center;
				// 		margin-top: 15px;

				// 		div
				// 		{
				// 			display: flex;
				// 			align-items: center;
				// 			justify-content: center;
				// 			border-radius: 10px;
				// 			background: #7349CA;
				// 			width: 76px;
				// 			height: 24px;
				// 			position: absolute;
				// 			color: #EDEEF3;
				// 			text-align: center;
				// 			
				// 			font-size: 11px;
				// 			font-style: normal;
				// 			font-weight: 400;
				// 			line-height: 18px; /* 150% */
				// 			text-transform: uppercase;
				// 			bottom: -12px;
				// 		}
				// 	}

				// 	.roll-name
				// 	{
				// 		margin-top: 25px;
				// 	}

				// 	img
				// 	{
				// 		width: 74px;
				// 		height: 74px;
				// 		border-radius: 12px;
				// 	}
				// }

				.roll-name {
					color: #EDEEF3;
					text-align: center;
					font-size: 20px;
					font-style: normal;
					font-weight: 400;
					line-height: 31.5px;
					margin-top: 114px;
					max-width: 90%;
				}
			}

			.roll-info-wrap {
				display: flex;
				align-items: center;
				flex-direction: column;
				width: 100%;


				.roll-info {
					display: inline-flex;
					padding: 10px 0px 5.25px 0px;
					align-items: flex-start;
					position: relative;
					width: 246px;
					box-sizing: border-box;
					// height: 42px;


					.roll-info-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						flex: 1;
						height: 40px;

						.info-1 {
							color: #FFFEFE;
							text-align: center;
							font-size: 15px;
							font-style: normal;
							font-weight: 290;
							line-height: 20.25px;
						}

						.info-2 {
							display: flex;
							align-items: center;
							color: #75DC9E;
							text-align: center;

							font-size: 15px;
							font-style: normal;
							font-weight: 700;
							line-height: 20.25px;

							img {
								margin-bottom: 2px;
							}
						}

						.info-3 {
							color: #FFF;
							text-align: center;

							font-size: 14px;
							font-style: normal;
							font-weight: 700;
							line-height: 20.25px;
						}
					}
				}

				.goods-list {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 246px;
					height: 85px;
					// padding: 0 8px;
					box-sizing: border-box;
					overflow: hidden;
					white-space: nowrap;

					.goods-item {
						position: relative;
						background-color: #131528;
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
						width: 66px;
						height: 75px;
						margin-right: 6px;
						display: flex;
						padding: 5px;
						flex-direction: column;
						align-items: center;
						justify-content: center;

						img {
							max-width: 74%;
							max-height: 74%;
						}

						.g-item-price {
							display: flex;
							height: 22px;
							justify-content: center;
							align-items: center;
							position: absolute;
							left: 50%;
							transform: translateX(-50%);
							bottom: 10px;
							border-radius: 10px;
							background: rgba(14, 15, 30, 0.50);
							color: #EDEEF3;

							font-size: 12px;
							font-style: normal;
							font-weight: 300;
							padding: 0 8px;
						}

						&:last-child {
							margin-right: 0px;
						}
					}
				}

				.btn-look {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 240px;
					height: 44px;
					border-radius: 4px;
					background: #4B56BC;
					margin-top: 6px;
					cursor: pointer; //鼠标变手

					.icon {
						display: inline-block;
						vertical-align: middle;
						fill: currentColor;
						position: relative;
						width: 20px;
						height: 20px;
						color: #fff;
						font-size: 16px;
						text-transform: uppercase;
					}

					p {
						color: #FFF;
						font-size: 15px;
						font-style: normal;
						font-weight: 700;
						line-height: 22.5px;
						text-transform: uppercase;
						margin-left: 6px;
					}
				}

				.award-time {
					color: #8D91AE;
					text-align: center;

					font-size: 13px;
					font-style: normal;
					font-weight: 300;
					line-height: 19.5px;
					margin-top: 15px;
				}

			}





			&.anchor {
				.roll-data-wrap {
					background: url(@/assets/pcimg/roll/item_bg2.png) center no-repeat;
				}
			}
		}
	}


}
</style>