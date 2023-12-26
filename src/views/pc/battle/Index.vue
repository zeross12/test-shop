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
					<p>{{ t('router.battle') }}</p>
				</div>
				<div class="opts">
					<div class="opt" @click="onClickSort" v-if="false">
						<span class="icon iconfont pc-icon">&#xe61b;</span>{{ store.state.battleListSort == 1 ? t(
							'common.defaultSort') : t('common.priceSort') }}
					</div>
					<div class="opt" @click="onClickCreate">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M18 12.75H6C5.59 12.75 5.25 12.41 5.25 12C5.25 11.59 5.59 11.25 6 11.25H18C18.41 11.25 18.75 11.59 18.75 12C18.75 12.41 18.41 12.75 18 12.75Z"
								fill="current" />
							<path
								d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V6C11.25 5.59 11.59 5.25 12 5.25C12.41 5.25 12.75 5.59 12.75 6V18C12.75 18.41 12.41 18.75 12 18.75Z"
								fill="current" />
						</svg>
						{{ t('router.createBattle') }}

					</div>
					<div class="help" @click="onClickHelp">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
							<path
								d="M16.0003 30.3334C8.09366 30.3334 1.66699 23.9067 1.66699 16C1.66699 8.09335 8.09366 1.66669 16.0003 1.66669C23.907 1.66669 30.3337 8.09335 30.3337 16C30.3337 23.9067 23.907 30.3334 16.0003 30.3334ZM16.0003 3.66669C9.20033 3.66669 3.66699 9.20002 3.66699 16C3.66699 22.8 9.20033 28.3334 16.0003 28.3334C22.8003 28.3334 28.3337 22.8 28.3337 16C28.3337 9.20002 22.8003 3.66669 16.0003 3.66669Z"
								fill="#FFE063" />
							<path
								d="M16.5473 18.6666C16.0006 18.6666 15.5473 18.2133 15.5473 17.6666V17.3867C15.5473 15.84 16.6806 15.08 17.1073 14.7867C17.6006 14.4533 17.7606 14.2267 17.7606 13.88C17.7606 13.2133 17.2139 12.6666 16.5473 12.6666C15.8806 12.6666 15.334 13.2133 15.334 13.88C15.334 14.4267 14.8807 14.88 14.334 14.88C13.7873 14.88 13.334 14.4267 13.334 13.88C13.334 12.1067 14.7739 10.6666 16.5473 10.6666C18.3206 10.6666 19.7606 12.1067 19.7606 13.88C19.7606 15.4 18.6406 16.16 18.2273 16.44C17.7073 16.7866 17.5473 17.0133 17.5473 17.3867V17.6666C17.5473 18.2266 17.0939 18.6666 16.5473 18.6666Z"
								fill="#FFE063" />
							<path
								d="M16.5479 21.9866C15.9879 21.9866 15.5479 21.5333 15.5479 20.9866C15.5479 20.44 16.0012 19.9866 16.5479 19.9866C17.0945 19.9866 17.5479 20.44 17.5479 20.9866C17.5479 21.5333 17.1079 21.9866 16.5479 21.9866Z"
								fill="#FFE063" />
						</svg>
					</div>
				</div>
			</div>

			<div class="swiper-container">
				<swiper ref="swipers" :modules="swiperModules" :space-between="16" :loop="true" :loopedSlides="10"
					:slidesPerView="6" :grid="{
						fill: 'row'
					}" :speed="300" navigation>
					<swiper-slide v-for="( item, index ) in listBoxData" :key="index" class="swiper-slide"
						@click="openBoxDetail(item)">
						<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
							<img :src="item.weaponImageUrl" alt="" />
						</div>
						<div class="desc">{{ item.name }}</div>
						<div class="price">
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />
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
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
						<circle opacity="0.3" cx="12.875" cy="12" r="12" fill="#EB4C4B" />
						<circle cx="12.875" cy="12" r="7" fill="#EB4C4B" />
					</svg>
					<span>{{ t('battle.inProgress') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_history' }" @click="onTabClick(1)">
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
						<path
							d="M12.125 22.75C6.195 22.75 1.375 17.93 1.375 12C1.375 6.07 6.195 1.25 12.125 1.25C18.055 1.25 22.875 6.07 22.875 12C22.875 17.93 18.055 22.75 12.125 22.75ZM12.125 2.75C7.025 2.75 2.875 6.9 2.875 12C2.875 17.1 7.025 21.25 12.125 21.25C17.225 21.25 21.375 17.1 21.375 12C21.375 6.9 17.225 2.75 12.125 2.75Z"
							fill="current" />
						<path
							d="M15.8346 15.93C15.7046 15.93 15.5746 15.9 15.4546 15.82L12.3546 13.97C11.5846 13.51 11.0146 12.5 11.0146 11.61V7.51001C11.0146 7.10001 11.3546 6.76001 11.7646 6.76001C12.1746 6.76001 12.5146 7.10001 12.5146 7.51001V11.61C12.5146 11.97 12.8146 12.5 13.1246 12.68L16.2246 14.53C16.5846 14.74 16.6946 15.2 16.4846 15.56C16.3346 15.8 16.0846 15.93 15.8346 15.93Z"
							fill="current" />
					</svg>
					<span>{{ t('battle.finished') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_mylist' }" @click="onTabClick(3)">
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
						<path
							d="M12.9955 13.53C12.9755 13.53 12.9455 13.53 12.9255 13.53C12.8955 13.53 12.8555 13.53 12.8255 13.53C10.5555 13.46 8.85547 11.69 8.85547 9.51001C8.85547 7.29001 10.6655 5.48001 12.8855 5.48001C15.1055 5.48001 16.9155 7.29001 16.9155 9.51001C16.9055 11.7 15.1955 13.46 13.0255 13.53C13.0055 13.53 13.0055 13.53 12.9955 13.53ZM12.8755 6.97001C11.4755 6.97001 10.3455 8.11001 10.3455 9.50001C10.3455 10.87 11.4155 11.98 12.7755 12.03C12.8055 12.02 12.9055 12.02 13.0055 12.03C14.3455 11.96 15.3955 10.86 15.4055 9.50001C15.4055 8.11001 14.2755 6.97001 12.8755 6.97001Z"
							fill="current" />
						<path
							d="M12.8748 22.75C10.1848 22.75 7.61484 21.75 5.62484 19.93C5.44484 19.77 5.36484 19.53 5.38484 19.3C5.51484 18.11 6.25484 17 7.48484 16.18C10.4648 14.2 15.2948 14.2 18.2648 16.18C19.4948 17.01 20.2348 18.11 20.3648 19.3C20.3948 19.54 20.3048 19.77 20.1248 19.93C18.1348 21.75 15.5648 22.75 12.8748 22.75ZM6.95484 19.1C8.61484 20.49 10.7048 21.25 12.8748 21.25C15.0448 21.25 17.1348 20.49 18.7948 19.1C18.6148 18.49 18.1348 17.9 17.4248 17.42C14.9648 15.78 10.7948 15.78 8.31484 17.42C7.60484 17.9 7.13484 18.49 6.95484 19.1Z"
							fill="current" />
						<path
							d="M12.875 22.75C6.945 22.75 2.125 17.93 2.125 12C2.125 6.07 6.945 1.25 12.875 1.25C18.805 1.25 23.625 6.07 23.625 12C23.625 17.93 18.805 22.75 12.875 22.75ZM12.875 2.75C7.775 2.75 3.625 6.9 3.625 12C3.625 17.1 7.775 21.25 12.875 21.25C17.975 21.25 22.125 17.1 22.125 12C22.125 6.9 17.975 2.75 12.875 2.75Z"
							fill="current" />
					</svg>
					<span>{{ t('battle.myRoom') }}</span>
				</div>
				<div class="pc-battle-tab" :class="{ active: route.name == 'p_battle_rank' }" @click="onTabClick(2)">
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
						<path
							d="M10.7353 18.15H6.94531C6.53531 18.15 6.19531 17.81 6.19531 17.4V12.28C6.19531 11.24 7.0453 10.39 8.0853 10.39H10.7353C11.1453 10.39 11.4853 10.73 11.4853 11.14V17.39C11.4853 17.81 11.1453 18.15 10.7353 18.15ZM7.69531 16.65H9.98529V11.9H8.0853C7.8753 11.9 7.69531 12.07 7.69531 12.29V16.65Z"
							fill="current" />
						<path
							d="M14.5146 18.15H10.7246C10.3146 18.15 9.97461 17.81 9.97461 17.4V7.73999C9.97461 6.69999 10.8246 5.84998 11.8646 5.84998H13.3846C14.4246 5.84998 15.2746 6.69999 15.2746 7.73999V17.4C15.2646 17.81 14.9346 18.15 14.5146 18.15ZM11.4846 16.65H13.7746V7.73999C13.7746 7.52999 13.6046 7.34998 13.3846 7.34998H11.8646C11.6546 7.34998 11.4746 7.51999 11.4746 7.73999V16.65H11.4846Z"
							fill="current" />
						<path
							d="M18.3056 18.15H14.5156C14.1056 18.15 13.7656 17.81 13.7656 17.4V12.85C13.7656 12.44 14.1056 12.1 14.5156 12.1H17.1656C18.2056 12.1 19.0556 12.95 19.0556 13.99V17.4C19.0556 17.81 18.7256 18.15 18.3056 18.15ZM15.2656 16.65H17.5556V13.99C17.5556 13.78 17.3856 13.6 17.1656 13.6H15.2656V16.65Z"
							fill="current" />
						<path
							d="M15.625 22.75H9.625C4.195 22.75 1.875 20.43 1.875 15V9C1.875 3.57 4.195 1.25 9.625 1.25H15.625C21.055 1.25 23.375 3.57 23.375 9V15C23.375 20.43 21.055 22.75 15.625 22.75ZM9.625 2.75C5.015 2.75 3.375 4.39 3.375 9V15C3.375 19.61 5.015 21.25 9.625 21.25H15.625C20.235 21.25 21.875 19.61 21.875 15V9C21.875 4.39 20.235 2.75 15.625 2.75H9.625Z"
							fill="current" />
					</svg>
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
	max-width: 1120px;
	width: 100%;
	margin: auto;

	.pc-battle-body {


		.swiper-container {
			// border: 1px solid red;
			width: 100%;
			margin-top: 40px;
			// height: 200px;
			// margin-bottom: 30px;
			// position: relative;

			.swiper-button-prev {
				width: 60px;
				height: 100%;
				// background: url(@/assets/pcimg/battle/prev.png ) no-repeat;
				top: 0;
				left: 0;
				bottom: 0;
				// position: absolute;

				&::after {
					content: none;
				}
			}

			.swiper-button-next {
				// width: 100px;
				// height: 200px;
				// background: url(@/assets/pcimg/battle/next.png ) no-repeat;
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
					// width: 159px !important;
					// height: 289px;
					width: 100%;
					padding-bottom: 16px;
					display: flex;
					flex-direction: column;
					// justify-content: center;
					align-items: center;
					cursor: pointer;
					// position: relative;

					&:hover {
						transition: .2s;
						// transform: scale(1.1);
					}

					.case_pic {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
						padding: 10px;
						max-height: 50%;
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
						// margin-top: 10px;

						img {
							max-width: 90%;
							max-height: 139px;
							// max-height: 90%;
							// margin-bottom: 6px;
						}
					}

					.desc {
						color: #fff;
						font-size: 16px;
						margin-top: 18px;
						font-weight: 500;
						line-height: 24px;
						text-align: center;
					}

					.price {
						display: flex;
						align-items: center;
						color: #fff;
						font-size: 18px;
						font-weight: 500;
						line-height: 26px;
						border-radius: 8px;
						border: 2px solid #FFE063;
						min-width: 104px;
						height: 42px;
						padding: 0 8px;
						margin-top: 16px;

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
			// height: 138px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			position: relative;
			margin-top: 40px;

			.title-c {
				color: #fff;
				font-size: 40px;
				font-weight: 700;
				letter-spacing: 4px;

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
					display: flex;
					align-items: center;
					justify-content: center;
					box-sizing: border-box;
					border-radius: 8px;
					gap: 8px;
					background: #FFE063;
					padding: 16px 32px;
					color: #151515;
					font-size: 16px;
					font-weight: 700;
					border: 1px solid #FFE063;
					transition: .3s all;

					svg {
						fill: #171717;
						transition: .3s all;
					}

					&:hover {
						background: transparent;
						border: 1px solid #FFE063;
						color: #FFE063;

						svg {
							fill: #FFE063;
						}
					}
				}

				.help {
					display: flex;
					cursor: pointer;
					margin-left: 16px;
					padding: 12px;
					border-radius: 12px;
					transition: .3s all;
					background: rgba(255, 224, 99, 0.30);

					&:hover {
						background: rgba(255, 224, 99, 0.50);
						// background: url(@/assets/pcimg/common/help2.png) center no-repeat;
						// background-size: 100% 100%;
					}
				}
			}
		}

		.pc-battle-tabs {
			border-radius: 12px;
			background: rgba(28, 33, 89, 0.50);
			backdrop-filter: blur(12px);
			font-size: 16px;
			color: #fff;
			text-transform: uppercase;
			font-weight: 500;
			display: flex;
			align-items: center;
			text-align: center;
			justify-content: flex-start;
			padding: 0 38px;

			.pc-battle-tab {
				color: #fff;
				// width: 300px;
				cursor: pointer;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				flex: 1;
				height: 100%;
				padding: 24px 0;
				gap: 8px;

				border-bottom: solid 1px transparent;
				transition: .3s all;

				svg {
					transition: .3s all;
					fill: #fff;
				}

				&:hover,
				&.active {
					color: #fff;
					border-color: #FFE063;

					svg {
						fill: #FFE063;
					}
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
