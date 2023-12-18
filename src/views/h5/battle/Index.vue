<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BattleRule from "./BattleRule.vue";
import RecordSwiper from "@/components/h5/home/RecordSwiper.vue";
import Tabs from "@/components/h5/home/Tabs.vue";
import { tokenName } from "../../../config";

import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

//滚动
const oldScrollTop = ref(0);
const scrollTopCount = ref(0);
const scrollBottomCount = ref(0);
const topActive = ref(true);

const battleRuleRef = ref(null);

onMounted(() => {
	window.addEventListener("scroll", handleScroll);
	// getBattleBoxList();
});

onUnmounted(() => {
	window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
	let scrollTop =
		window.pageYOffset ||
		document.documentElement.scrollTop ||
		document.body.scrollTop;
	let offset = scrollTop - oldScrollTop.value;
	let show = scrollTop < 100;
	if (show) {
		if (!topActive.value) {
			topActive.value = true;
		}
		return;
	}

	let value = 5;
	if (offset > value) {
		scrollBottomCount.value++;
		scrollTopCount.value = 0;
	}
	if (offset < -value) {
		scrollBottomCount.value = 0;
		scrollTopCount.value++;
	}

	if (offset > value && topActive.value && scrollBottomCount.value > 1) {
		topActive.value = false;
	} else if (offset < -value && !topActive.value && scrollTopCount.value > 1) {
		topActive.value = true;
	}
	oldScrollTop.value = scrollTop;
}

function onClickHelp() {
	// let data = {
	//	 show: true,
	//	 html: "<p>决战沙场</p><br><p>1、创建活动时，可以选择拼箱人数（2/3人），一个场次最多可以选择 6 个盲盒。</p><br><p>2、房间一但创建，不可取消，如在15分钟内未有用户加入，则房间自动解散，归还房间对应币值。</p><br><p>3、活动参与费用即本场活动开启的盲盒价格总和，支付费用后，即视为加入房间，中途退出房间，并不会退还盲盒或参与费。</p><br><p>4、多个玩家拼箱，开出最丰厚奖品的玩家优先分配。</p><br><p>5、当一场活动开出最丰厚奖品的玩家有多名时，非本人所得饰品将被回购为硬币发放到对应账户余额。</p><br><p>6、每场活动的结果受到（创建时间，用户ID，用户位置和开始时间等）多方面因素影响，为完全随机产生的结果。游戏完全公平可证。</p>",
	// };
	// store.commit("setHowPlay", data);
	router.replace("/m/battle/battleHelp");
}

function onVerifyBattle() {
	battleRuleRef.value.showRule();
}

function toRoute(path) {
	router.push(path);
}

function onClickBox(item) {
	let boxData = { boxName: item.name, boxId: item.boxId };
	store.commit("setClickBattleBoxData", boxData);
	router.push({
		path: "/m/battleBoxDetails",
		query: { boxData: encodeURIComponent(JSON.stringify(boxData)) },
	});
}

function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return "background-image: url(" + item.imageUrl + ");";
	} else {
		return "width:100%;";
	}
}
// let tabItems = ref({ items: [t('router.battleHistory'), t('router.battleRank')], index: -1 });
let tabItems = ref({ items: [ t('router.battleHistory'), t('router.myBattleHistory') ], index: -1 } )
function tabChangedEvent(event) {
	if (event == 0) {
		router.replace("/m/battle/battleHistory");
		tabItems.value.index = 0;
	} else if (event == 1) {
		router.replace("/m/battle/myBattleHistory");
		tabItems.value.index = 1;
	}
}

watch(route, (newRoute, oldRoute) => {
	if (route.name === "m_battle_rank") {
		tabItems.value.index = 1;
	} else if (route.name === "m_battle_history") {
		tabItems.value.index = 0;
	} else {
		tabItems.value.index = -1;
	}
	window.$dev && console.log("router.name", route.name, tabItems.value.index);
});

function onClickCreate() {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}
	router.push("/m/createbattle");
}
let detailScreenShow = ref(false);

function showHelper() {
	detailScreenShow.value = true;
}
</script>

<template>
	<div id="battle">
		<!-- <RecordSwiper></RecordSwiper> -->
		<TopTitleBack :handler="showHelper"></TopTitleBack>
		<div v-show="topActive" class="battle-top-wrap">
			<div class="top-item1" @click="onClickCreate">
				<span class="icon iconfont"> &#xe619;</span>
				<!-- {{ t( 'battle.createBattle' ) }} -->
			</div>
			<Tabs
				class="top-item2"
				@tabChangedEvent="tabChangedEvent"
				:items="tabItems.items"
				:index="tabItems.index"
			></Tabs>
		</div>

		<div class="room-list">
			<router-view></router-view>
		</div>
		<BattleRule ref="battleRuleRef" />

		<!-- <div class="popup" :class="{ active: detailScreenShow }">
			<div class="popup-wrap">
				<div class="close" @click="detailScreenShow = false">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">决战沙场</div>
				</div>
				<div class="popup-content">
					<div class="help_detail_info">
						<p>
							1、创建活动时，可以选择拼箱人数（2/3人），一个场次最多可以选择 6
							个盲盒。
						</p>
						<p>
							2、房间一但创建，不可取消，如在15分钟内未有用户加入，则房间自动解散，归还房间对应币值。
						</p>
						<p>
							3、活动参与费用即本场活动开启的盲盒价格总和，支付费用后，即视为加入房间，中途退出房间，并不会退还盲盒或参与费。
						</p>
						<p>4、多个玩家拼箱，开出最丰厚奖品的玩家优先分配。</p>
						<p>
							5、当一场活动开出最丰厚奖品的玩家有多名时，非本人所得饰品将被回购为硬币发放到对应账户余额。
						</p>
						<p>
							6、每场活动的结果受到（创建时间，用户ID，用户位置和开始时间等）多方面因素影响，为完全随机产生的结果。游戏完全公平可证。
						</p>
					</div>
				</div>
			</div>
		</div> -->
		<ShowDialog
			:btn-type="-1"
			:title="t('menu.battle')"
			:show="detailScreenShow"
			@ok="detailScreenShow = false"
			@cancel="detailScreenShow = false"
		>
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText1' ) }}
				</div>
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText2' ) }}
				</div>
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText3' ) }}
				</div>
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText4' ) }}
				</div>
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText5' ) }}
				</div>
				<div class="dialog-row-wrap">
					{{ t( 'battle.ruleText6' ) }}
				</div>
			</div>
		</ShowDialog>
	</div>
</template>

<style lang="scss">
#battle {
	width: 100%;
	min-height: 800px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding-bottom: 20px;

	#tabs{
		width: 550px;
		padding: 0px;
		.tab-item{
			flex: 1;
			font-size: 25px;
		}
	}

	.dialog-x-content {
		overflow-y: auto;
		height: 800px;
		.dialog-row-wrap {
			// margin: 10px 10px !important;
			margin: unset;
			line-height: 46px;
		}
	}

	.battle-top-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 26px 0px 23px 35px;
		background-color: #111324;
		// width: 100%;
		height: 160px;
		box-sizing: border-box;

		.top-item1 {
			background-color: #554bf7;
			border-radius: 6px;
			height: 80px;
			width: 144px;
			color: #fff;
			font-size: 28px;
			text-align: center;
			line-height: 75px;
			font-weight: 400;
			box-sizing: border-box;
			span {
				font-size: 44px;
			}
		}

		.top-item2 {
			width: 520px;
		}
		.top-item3 {
			border-radius: 12px;
			border: 1px solid #1e2037;
			width: 140px;
			height: 80px;
			color: #b4b6c8;
			font-size: 24px;
			text-align: center;
			line-height: 75px;
			font-weight: 400;
			box-sizing: border-box;
		}
	}

	.top-wrap-height {
		height: 119px;
		width: 750px;
	}

	.btbox_list {
		width: 710px;
		height: 300px;
		overflow-x: scroll;
		white-space: nowrap;
		margin: auto 20px;
		color: #ffffff;
		font-size: 22px;
		background-color: #15172c;
		overflow: hidden;
		border-bottom: 1px solid #4854c9;
		box-sizing: border-box;

		.btbox_item {
			display: inline-block;
			width: 236px;
			height: 300px;

			.hot {
				position: absolute;
				top: 12px;
				right: 11px;
				width: 55px;
				height: 40px;

				img {
					width: 100%;
				}
			}

			.btbox_pic {
				display: flex;
				justify-content: center;
				align-items: center;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				width: 100%;
				height: 193px;
				margin-top: 8px;

				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			.price {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 24px;
				color: #fff;
				margin-top: 8px;
				font-weight: bold;
			}

			p {
				width: 100%;
				font-size: 20px;
				color: #b4b6c8;
				line-height: 28px;
				// margin-top: -3px;
				text-align: center;
				box-sizing: border-box;
			}

			// &:first-of-type {
			//	 margin-left: 13px;
			// }
		}

		&::-webkit-scrollbar {
			width: 10px;
			height: 10px;
			background-color: none;
			border-radius: 10px;
		}

		&::-webkit-scrollbar-track {
			border-radius: 10px;
			background-color: rgba($color: #000000, $alpha: 0.1);
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 10px;
			background-color: rgba($color: #818187, $alpha: 0.6);
		}
	}

	.room-list {
		flex: 1 1;
	}

	.establish_battle {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		position: fixed;
		right: 20px;
		bottom: 200px;
		width: 86px;
		height: 86px;
		background: #ffc400;
		border-radius: 50%;
		color: #20212b;
		font-weight: bold;
		font-size: 24px;
		line-height: 26px;
		padding-top: 2px;
		padding-right: 2px;
	}
}
</style>
