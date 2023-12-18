<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getBoxList } from "@/network/api/battle";
import BattleRank from "./BattleRank.vue";
// import CreateBattle from "./CreateBattle.vue";
import BattleRule from "./BattleRule.vue";
import { Swiper, SwiperSlide } from "swiper/vue"
import { Autoplay, Navigation, Grid } from "swiper/modules";
import "swiper/scss/autoplay";
import 'swiper/scss/navigation'
import 'swiper/scss/grid'
import { showFloat } from '@/util/common'
import BattleBoxDetail from './components/BattleBoxDetail.vue'

const store = useStore();
const route = useRoute();
const router = useRouter();
const listBoxData = ref([]);
const battleRuleRef = ref(null);
const tabIndex = ref(0);
const swiperModules = [Navigation, Autoplay, Grid];

//显示创建
const showCreateDialog = ref(false);

const swipers = ref(null)

onMounted(async () => {
	await getBattleBoxList()
	// window.$dev && console.log( swipers.value )
	// Success( { offset : 100, message : '交易链接保存成功', duration : 0, offset : 100 } )
	// Warn( { offset : 100, message : '交易链接保存失败', duration : 0, customClass : 'error' } )
});

onUnmounted(() => { });

async function getBattleBoxList() {
	const res = await getBoxList();
	if (res.code === 0) {
		listBoxData.value = res.data.items;
	}
}

function onClickCreate() {
	// showCreateDialog.value = true;
	router.push("/p/createbattle");
}
function onClickHistory() {

}

function onCloseCreateDialog() {
	showCreateDialog.value = false;
}

function onVerifyBattle() {
	battleRuleRef.value.showRule();
}

function onTabClick(index) {
	tabIndex.value = index;
	if (index == 0) {
		router.push("/p/battle/list");
	} else if (index == 1) {
		router.push("/p/battle/battleHistory");
	} else if (index == 2) {
		// router.push("/p/battleRank");
		router.push("/p/rank")
	} else if (index == 3) {
		router.push("/p/battle/mylist");
	}
}

function onClickBox(item) {
	let boxData = { boxName: item.name, boxId: item.boxId };
	store.commit("setClickBattleBoxData", boxData);
	router.push({
		path: "/p/battleBoxDetails",
	});
}
function onClickSort() {
	store.commit("setBattleListSort", store.state.battleListSort == 1 ? 3 : 1);
}

function onClickHelp() {
	let data = {
		show: true,
		html: `<p>${t('router.battle')}</p><br><p>${t('battle.ruleText1')}</p><br><p>${t('battle.ruleText2')}</p><br><p>${t('battle.ruleText3')}</p><br><p>${t('battle.ruleText4')}</p><br><p>${t('battle.ruleText5')}</p><br><p>${t('battle.ruleText6')}</p>`
	}
	store.commit('setHowPlay', data)
}

function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return "background-image: url(" + item.imageUrl + ");";
	} else {
		return "width:100%;";
	}
}

const showBoxDetail = ref(false)
const curBox = ref({})
function openBoxDetail(item) {
	// window.$dev && console.log( item )
	curBox.value = item
	showBoxDetail.value = true
}

function closeBoxDetail(e) {
	// window.$dev && console.log( e )
	if (e == 'close-btn') return showBoxDetail.value = false

	if (typeof e.target != 'undefined' && e.target.className == 'van-overlay')
		return showBoxDetail.value = false
}
</script>

<template>
	<div id="pc-battle">
		<van-overlay style="background: rgba( 0, 0, 0, .7 )" z-index="200" :show="showBoxDetail" @click="closeBoxDetail">
			<BattleBoxDetail :item="curBox" @close-box-detail="closeBoxDetail('close-btn')"></BattleBoxDetail>
		</van-overlay>
		<div class="pc-battle-body">
			<div class="pc-battle-title">
				<div class="title-c">
					<img src="@/assets/pcimg/battle/icon.png" alt="" />
					<p>{{ t('router.battle') }}</p>
				</div>
				<div class="opts">
					<div class="opt" @click="onClickSort" v-if="false">
						<span class="icon iconfont pc-icon">&#xe61b;</span>{{ store.state.battleListSort == 1 ? t(
							'common.defaultSort') : t('common.priceSort') }}
					</div>
					<div class="opt" @click="onClickCreate">
						{{ t('router.createBattle') }} <img src="@/assets/pcimg/battle/icon_add.png" alt="" />
					</div>
					<div class="help" @click="onClickHelp"> </div>
				</div>
			</div>

			<div class="swiper-container">
				<swiper ref="swipers" :modules="swiperModules" :loop="true" :loopedSlides="10" :slidesPerView="8" :grid="{
					fill: 'row'
				}" :speed="300" navigation>
					<swiper-slide v-for="( item, index ) in listBoxData" :key="index" class="swiper-slide"
						@click="openBoxDetail(item)">
						<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
							<img :src="item.weaponImageUrl" alt="" />
						</div>
						<div class="desc">{{ item.name }}</div>
						<div class="price">
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />
							<div>{{ item.price }}</div>&nbsp;
							<p v-if="Number(item.price) < Number(item.originalPrice)">
								{{ item.originalPrice }}
							</p>
						</div>
					</swiper-slide>
				</swiper>
			</div>

			<div class="pc-battle-tabs">
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_list' }" @click="onTabClick(0)">
					<svg class="icon">
						<use xlink:href="@/assets/icon.svg#gifts"></use>
					</svg>
					<span>{{ t('battle.inProgress') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_history' }" @click="onTabClick(1)">
					<svg class="icon">
						<use xlink:href="@/assets/icon.svg#history"></use>
					</svg>
					<span>{{ t('battle.finished') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_mylist' }" @click="onTabClick(3)">
					<svg class="icon">
						<use xlink:href="@/assets/icon.svg#gift-3"></use>
					</svg>
					<span>{{ t('battle.myRoom') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_rank' }" @click="onTabClick(2)">
					<img class="icon-common" src="@/assets/pcimg/battle/icon_rank.png" alt="" />
					<img class="icon-active" src="@/assets/pcimg/battle/icon_rank.png" alt="" />
					<span>{{ t('router.battleRank') }}</span>
				</div>
			</div>

			<div class="pc-battle-opt-wrap" v-if="false">
				<div class="top-item1" @click="onClickCreate">{{ t('battle.createBattle') }}+</div>
				<div class="top-item2" @click="onClickHistory">{{ t('router.battleHistory') }}</div>
				<div class="top-item2" @click="onVerifyBattle">{{ t('battle.gameRule') }}</div>
			</div>
			<div class="pc-bat-content">
				<div class="room-list">
					<router-view></router-view>
				</div>
			</div>
			<BattleRule ref="battleRuleRef" />
		</div>
	</div>
</template>

<style lang="scss">
#pc-battle {
	width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding-bottom: 20px;

	.pc-battle-body {
		max-width: 1440px;
		width: 100%;
		margin: auto;

		.swiper-container {
			// border: 1px solid red;
			width: 100%;
			height: 200px;
			margin-bottom: 30px;

			.swiper-button-prev {
				width: 100px;
				height: 200px;
				background: url(@/assets/pcimg/battle/prev.png ) no-repeat;
				top: 0;
				left: 0;

				&::after {
					content: none;
				}
			}

			.swiper-button-next {
				width: 100px;
				height: 200px;
				background: url(@/assets/pcimg/battle/next.png ) no-repeat;
				top: 0;
				right: 0;

				&::after {
					content: none;
				}
			}

			.swiper-wrapper {
				// width: 100%;
				transition-timing-function: linear;
				// transition-duration: 10s !important;

				.swiper-slide {
					// width: 128px;
					// cursor: pointer;
					// background: #1e203d;
					width: 170px !important;
					height: 200px;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					position: relative;

					&:hover {
						transition: .2s;
						transform: scale(1.1);
					}

					.case_pic {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 135px;
						height: 135px;
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
						margin-top: 10px;

						img {
							max-width: 80%;
							max-height: 80%;
							margin-bottom: 6px;
						}
					}

					.desc {
						color: #b4b6c8;
						font-size: 14px;
						margin-bottom: 5px;
					}

					.price {
						display: flex;
						align-items: center;
						color: #75dc9e;
						font-size: 14px;

						img {
							width: 14px;
							height: 14px;
							margin-bottom: 2px;
						}

						p {
							color: #5E5E5E;

							font-size: 14px;
							font-style: normal;
							font-weight: 700;
							line-height: 14px;
							text-decoration-line: strikethrough;
							text-transform: uppercase;
							text-decoration: line-through solid;
							// margin-bottom:6px;
							// padding: 0 8px;														
						}
					}

					&.active {
						background: url(@/assets/pcimg/battle/box_bg.png) no-repeat center;
						background-size: contain;
						border-radius: 10px;
					}

					.num {
						color: #b4b6c8;
						position: absolute;
						right: 14px;
						top: 8px;
						font-size: 22px;
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
				font-size: 16px;

				.opt {
					cursor: pointer;
					margin: 10px;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 157px;
					height: 60px;
					box-sizing: border-box;
					border-radius: 4px;
					background: #4752BF;


					img {
						width: 14px;
						height: 14px;
						margin-left: 11px;
					}

					&:hover {
						background: #3A34B0;
					}
				}

				.help {
					display: flex;
					cursor: pointer;
					margin-left: 5px;
					width: 60px;
					height: 60px;
					background: url(@/assets/pcimg/common/help.png) center no-repeat;
					background-size: 100% 100%;

					&:hover {
						background: url(@/assets/pcimg/common/help2.png) center no-repeat;
						background-size: 100% 100%;
					}
				}
			}
		}

		.pc-battle-tabs {
			background-color: #111324;
			font-size: 16px;
			color: #fff;
			line-height: 18.4px;
			display: flex;
			height: 80px;
			line-height: 80px;
			align-items: center;
			text-align: center;
			justify-content: flex-start;
			box-sizing: border-box;

			.pc-battle-tab {
				color: #9ca1c7;
				// width: 300px;
				cursor: pointer;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				flex: 1;
				height: 100%;

				&.active {
					color: #fff;
					border-bottom: solid 1px #4b56bc;


					.icon-active {
						display: block;
					}

					.icon-common {
						display: none;
					}

					.icon {
						color: #4b56bc;
					}
				}

				.icon {
					width: 20px;
					height: 20px;
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					color: #9CA1C7;
					cursor: pointer;
					box-sizing: border-box;
					margin-right: 20px;
				}

				img {
					width: 20px;
					height: 20px;
					margin-right: 20px;
				}

				.icon-active {
					display: none;
				}

				.icon-common {
					display: block;
				}

				&:hover {
					border-bottom: solid 1px #4b56bc;
				}
			}
		}

		.pc-battle-list-warp {
			.pc-battle-list-warp-title {
				color: #343650;
				display: flex;
				height: 80px;
				align-items: center;
				text-align: center;

				.pc-battle-list-warp-title-item5 {
					flex: 5;
					text-align: left;
					padding-left: 10px;
				}

				.pc-battle-list-warp-title-item {
					flex: 1;
				}
			}

			.pc-battle-list-warp-row {
				color: #343650;
				display: flex;
				height: 80px;
				align-items: center;
				text-align: center;

				.pc-battle-list-warp-row-item5 {
					flex: 5;
					text-align: left;
					padding-left: 10px;
				}

				.pc-battle-list-warp-row-item {
					flex: 1;
				}
			}
		}

		.pc-battle-opt-wrap {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			margin-top: 20px;
			margin-bottom: 20px;
			width: 100%;

			.top-item1 {
				background-color: #fbfa02;
				border: 1px solid #fbfa02;
				width: 173px;
				height: 70px;
				color: #1c1a2a;
				font-size: 24px;
				text-align: center;
				line-height: 70px;
				font-weight: bold;
				box-sizing: border-box;
				margin-right: 19px;
				cursor: pointer;
			}

			.top-item2 {
				border: 1px solid #fbfa02;
				width: 173px;
				height: 70px;
				color: #fff;
				font-size: 24px;
				text-align: center;
				line-height: 70px;
				font-weight: bold;
				box-sizing: border-box;
				margin-right: 19px;
				cursor: pointer;
			}
		}
	}

	.pc-bat-content {
		display: flex;

		.room-list {
			flex: 1 1;
		}
	}
}
</style>
