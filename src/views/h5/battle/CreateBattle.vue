<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from "vue";
import { getBoxList, createBattleRoom } from "@/network/api/battle";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Currency from "@/components/h5/common/Currency.vue";
import BoxDetail from "./components/BoxDetail.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue"

const store = useStore();
const router = useRouter();

const limit = ref({
	maxBoxTypeCount: 6,
	maxBoxNum: 6,
}); //对战限制
const pattern = ref([
	{
		text: t('battle.roomFor2'),
		peopleCount: 2,
	},
	{
		text: t('battle.roomFor3'),
		peopleCount: 3,
	},
]);

let searchTabData = ref({
	searchItems: [
		{ icon: "", type: 1, text: t('battle.defaults'), min: 0, max: 1000000000 },
		{ icon: "", type: 2, text: t('battle.perc55'), min: 0, max: 5 },
		{ icon: "", type: 3, text: t('battle.blood'), min: 5, max: 10 },
		{ icon: "", type: 4, text: t('battle.soul'), min: 10, max: 100 },
		{ icon: "", type: 8, text: t('battle.monthNew'), min: 0, max: 100 },
	],
	searchTabIndex: 0,
	searchFilter: "",
});

const peopleCount = ref(2);

const allBox = ref([]); //箱子列表
const listBox = ref([]); //可选箱子列表

const bottomActive = ref(true); //底部弹出
const already = ref([]); //已选箱子列表
const alreadyList = ref([]); //已选箱子列表
const round = ref(0); //回合
const totalPrice = ref(0); //价格

const tabType = ref(1);

const roomNumDef = ref([1, 2, 3, 4]);
const roomNumSel = ref(0);
const roomNumInput = ref("");
let preRoomNumSel = 0;

const btnCreateActive = ref(true); //防快速点击

const battleType = ref(1);

onMounted(() => {
	window.$dev && console.log("localStorage", localStorage.getItem("remember-battle-tip"));
	createTips.value.nextShow =
		localStorage.getItem("remember-battle-tip") == "true" ? true : false;

	getBattleBoxList();
});

async function getBattleBoxList() {
	const res = await getBoxList();
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			allBox.value = items.sort((a, b) => a.price - b.price);
			window.$dev && console.log("allBox", res);
			onClickTab(1);
		}
	}
}

function onClickBattleType(type) {
	battleType.value = type;
}

function onClickRoomType(rc) {
	peopleCount.value = rc;
}

function onClickTab(type) {
	tabType.value = type;
	listBox.value = allBox.value.filter((item) => {
		return item.subType == type;
	});
}

function addAmount(item) {
	if (roundsieve()) {
		let value = already.value.find((v) => v.boxId == item.boxId);
		alreadyList.value.unshift(item);
		if (value) {
			item.amount += 1;
			roundcalculation();
		} else {
			if (alreadysieve()) {
				already.value.push(item);
				if (item.amount == undefined) item.amount = 0;
				item.amount += 1;
				roundcalculation();
			} else {
				NotifyF(t('battle.boxCatOverLimit'));
			}
		}
	} else {
		NotifyF(t('battle.boxNumOverLimit'));
	}
}

function catAmount(item, index) {
	alreadyList.value.splice(index, 1);
	if (item.amount > 0) {
		item.amount -= 1;
		if (item.amount == 0) {
			already.value = already.value.filter(
				(value) => value.boxId != item.boxId
			);
		}
		roundcalculation();
	}
}

//回合数量计算
function roundcalculation() {
	let num = 0;
	let price = 0;
	for (let i = 0; i < already.value.length; i++) {
		price += already.value[i].amount * already.value[i].price;
		num += already.value[i].amount;
	}
	round.value = num;

	let roomCount =
		roomNumSel.value == 4 ? Number(roomNumInput.value) : roomNumSel.value + 1;
	totalPrice.value = price * roomCount;
}

//已选种类查询
function alreadysieve() {
	let list = already.value.map((item) => {
		return item.boxName;
	});
	let mySet = new Set(list);
	[...mySet];

	return mySet.size + 1 <= limit.value.maxBoxTypeCount;
}

//已选回合数量查询
function roundsieve() {
	let num = 0;
	for (let i = 0; i < already.value.length; i++) {
		num += already.value[i].amount;
	}
	return num + 1 <= limit.value.maxBoxNum;
}

//关闭弹出层
function closeEject() {
	reset();
}

// 创建对战信息重置
function reset() {
	already.value = [];
	roundcalculation();
	listBox.value.map((item) => (item.amount = 0));
}

async function onClickCreate() {
	if (!btnCreateActive.value) return;
	btnCreateActive.value = false;

	let params = {};
	params.peoples = peopleCount.value;
	params.roomCount = 1;
	//roomNumSel.value == 4 ? Number(roomNumInput.value) : roomNumSel.value + 1;
	params.battleType = battleType.value;

	let boxIds = [];
	for (let i = 0; i < alreadyList.value.length; i++) {
		let item = alreadyList.value[i];
		boxIds.push(item.boxId);
	}
	params.boxIds = boxIds;
	const res = await createBattleRoom(params);
	if (res.code === 0) {
		Notify(t('battle.createSuccess'));
		store.dispatch("getUserInfo");
		// router.go(-1);
		router.replace("/m/battle/list");
	}

	btnCreateActive.value = true;
}
function onClickCreatePre() {
	// if (!createTips.value.nextShow) {
	//	 createTips.value.show = true;
	// } else {
	//	 onClickCreate();
	// }
	onClickCreate();
}

function onClickRoomNum(index) {
	roomNumSel.value = index;
	roomNumInput.value = "";
	roundcalculation();
}

function onInputRoomNum() {
	if (roomNumInput.value.length > 0) {
		roomNumInput.value = Math.floor(Number(roomNumInput.value));
		if (roomNumInput.value > 9) {
			roomNumInput.value = 9;
		}
		if (roomNumInput.value < 1) {
			roomNumInput.value = 1;
		}
		if (roomNumSel.value != 4) {
			preRoomNumSel = roomNumSel.value;
		}
		roomNumSel.value = 4;
	} else {
		roomNumSel.value = preRoomNumSel;
	}
	roundcalculation();
}

function onClickSearchTabIndex(index) {
	searchTabData.value.searchTabIndex = index;
	let itemFilter = searchTabData.value.searchItems[index];
	listBox.value = allBox.value.filter((item) => {
		return item.subType == itemFilter.type;
	});
}
function onClickClose() {
	router.go(-1);
}
const showBoxDetail = ref({ show: false, ids: [], index: 0 });
function onClickBoxDetails(index) {
	// router.push("/m/boxDetails?boxId=" + id);
	let ids = listBox.value.map((el) => el.boxId);
	showBoxDetail.value.ids = ids;
	showBoxDetail.value.index = index;
	showBoxDetail.value.show = true;
}
const createTips = ref({
	show: false,
	checked: false,
	nextShow: false,
});

/**
 * 记住创建房间的选择
 */
function onRememberBattleTip() {
	window.$dev && console.log("!createTips.value.nextShow", !createTips.value.nextShow);
	localStorage.setItem("remember-battle-tip", !createTips.value.nextShow);
	createTips.value.nextShow = !createTips.value.nextShow;
}
</script>

<template>
	<div id="createbattle">
		<div v-if="false" class="bat_type_wrap">
			<div class="cb_tab">
				<div @click="onClickBattleType(1)" class="tab_item" :class="{ active: battleType == 1 }">
					{{ t('battle.defaultBattle') }}
				</div>
				<div @click="onClickBattleType(2)" class="tab_item" :class="{ active: battleType == 2 }">
					{{ t('battle.XBattle') }}
				</div>
			</div>
		</div>

		<div class="battle-header">
			<div class="battle-title">
				<span class="icon iconfont" @click="onClickClose">&#xe61e;</span>
			</div>

			<div class="pep-wrap">
				<!-- <span>玩家数量</span> -->
				<div class="pep-item" @click="peopleCount = 2" :class="{ active: peopleCount == 2 }">
					{{ t('battle.roomFor2') }}
				</div>
				<div class="pep-item" @click="peopleCount = 3" :class="{ active: peopleCount == 3 }">
					{{ t('battle.roomFor3') }}
				</div>
			</div>
		</div>

		<div class="search-container">
			<div class="search-items">
				<div class="search-item" :class="{ active: index == searchTabData.searchTabIndex }"
					v-for="(item, index) in searchTabData.searchItems" @click="onClickSearchTabIndex(index)" :key="index">
					<span v-if="item.icon" class="iconfont pc-icon-16">&#xe61c;</span>{{ item.text }}
				</div>
			</div>
			<!-- <div class="search-filter">
				<input
					type="text"
					v-model="searchTabData.searchFilter"
					placeholder="箱子名称"
					@keyup.enter="onSearchName()"
				/>
				<span
					style="color: #878b91"
					class="iconfont pc-icon-16"
					@click="onSearchName()"
					>&#xe620;</span
				>
			</div> -->
		</div>
		<ShowDialog @cancel="createTips.show = false" :btnType="-1" :title="t('battle.create')" :show="createTips.show">
			<div class="show-dialog-content-wrap">
				<div class="desc-wrap">{{ t('battle.createTipText') }} </div>
				<div class="price-wrap">
					<Currency :fontsize="24" :currency="totalPrice.toFixed(2)" />
				</div>
				<div class="desc-wrap">{{ t('battle.createConfirmText') }} </div>
				<div class="check-desc-wrap" @click="createTips.checked = !createTips.checked">
					<img v-if="createTips.checked" src="@/assets/romimg/battle/create/checked.png" alt="" />
					<img v-else src="@/assets/romimg/battle/create/unchecked.png" alt="" />
					{{ t('battle.resultTip') }}
				</div>
				<div class="btn-ok-wrap" @click="onClickCreate" v-if="createTips.checked">
					{{ t('notify.confirm') }}
				</div>
				<div class="btn-ok-wrap enable" v-else>{{ t('notify.confirm') }}</div>
				<div class="next-desc-wrap" @click="onRememberBattleTip">
					<img v-if="createTips.nextShow" src="@/assets/romimg/battle/create/checked.png" alt="" />
					<img v-else src="@/assets/romimg/battle/create/unchecked.png" alt="" />
					{{ t('battle.noPopupAgain') }}
				</div>
			</div>
		</ShowDialog>
		<!-- <div class="cb_tab_wrap">
			<div class="cb_tab">
				<div
					@click="onClickTab(1)"
					class="tab_item"
					:class="{ active: tabType == 1 }"
				>
					常规系列
				</div>
				<div
					@click="onClickTab(2)"
					class="tab_item"
					:class="{ active: tabType == 2 }"
				>
					55开
				</div>
				<div
					@click="onClickTab(3)"
					class="tab_item"
					:class="{ active: tabType == 3 }"
				>
					血压系
				</div>
			</div>
		</div> -->
		<div class="goods-list" :class="{ active: alreadyList.length > 0 }">
			<div class="goods-item" v-for="(item, index) in listBox" :key="index" :class="{ active: item.amount > 0 }"
				@click.prevent="addAmount(item)">
				<div class="num" v-show="item.amount > 0">×{{ item.amount }}</div>

				<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
					<img :src="item.weaponImageUrl" alt="" />
				</div>
				<div class="name hide">
					{{ item.name }}
				</div>
				<div class="price">
					<Currency :fontsize="12" :currency="item.price"></Currency>
					<p v-if="Number(item.price) < Number(item.originalPrice)">{{ item.originalPrice }}</p>
				</div>
				<div class="view" @click.stop="onClickBoxDetails(index)">{{ t('battle.view') }}</div>
			</div>
		</div>
		<div class="bottom-wrap" :class="{ active: alreadyList.length > 0 }">
			<div class="spread" v-if="alreadyList.length > 0">
				<div class="spread_item">
					{{ t('battle.roundTotal') }}：
					<p>{{ round }}/{{ limit.maxBoxNum }}</p>
				</div>
				<div class="spread_item">
					{{ t('battle.priceTotal') }}：<span>{{ totalPrice.toFixed(2) }}</span>
				</div>
			</div>
			<div class="choose_list" v-if="alreadyList.length > 0">
				<div class="choose_list_wrap">
					<div class="choose_item" v-for="(item, index) in alreadyList" :key="item.boxId"
						@click="catAmount(item, index)">
						<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
							<img :src="item.weaponImageUrl" alt="" />
						</div>
					</div>
				</div>
			</div>
			<!-- <div class="room_num_wrap">
				<div class="room_num_title">批量创建房间</div>
				<div class="room_num">
					<div
						class="room_num_item"
						v-for="(item, index) in roomNumDef"
						:key="index"
						:class="{ active: index == roomNumSel }"
						@click="onClickRoomNum(index)"
					>
						{{ item }}个
					</div>
					<div class="room_num_item" :class="{ active: 4 == roomNumSel }">
						<input
							type="text"
							v-model="roomNumInput"
							placeholder="自定义"
							@input="onInputRoomNum"
						/>
					</div>
				</div>
			</div> -->
			<div class="create-btn">
				<p v-if="alreadyList.length > 0" @click="onClickCreatePre">{{ t('router.createBattle') }}</p>
				<p v-else class="enable">{{ t('router.createBattle') }}</p>
			</div>
		</div>
	</div>

	<BoxDetail :show="showBoxDetail.show" :boxIds="showBoxDetail.ids" :index="showBoxDetail.index" :showHeader="false"
		@close="showBoxDetail.show = false"></BoxDetail>
</template>

<style lang="scss">
#createbattle {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;

	// height: 1650px;
	overflow: hidden;
	color: #fff;
	width: 750px;

	.close {
		width: 50px;
		height: 50px;
		position: absolute;
		right: 10px;
		top: 30px;
		color: #d2d3e6;

		span {
			font-size: 30px;
		}
	}

	.battle-header {
		position: fixed;
		top: 0px;
		height: 112px;
		line-height: 112px;

		align-items: center;
		padding: 0% 20px;
		width: 710px;

		.battle-title {
			padding-left: 20px;
			color: #fff;
			font-size: 28px;
			font-style: normal;
			float: left;
			font-style: normal;
			font-weight: 300;

			span {
				font-size: 36px;
			}
		}

		.pep-wrap {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 25px;
			// width: 375px;
			float: right;
			line-height: 62px;
			// background-color: #554bf7;
			border: 1px solid #554bf7;
			border-radius: 12px;

			span {
				color: #fff;
				font-size: 28px;
				font-style: normal;
				font-weight: 300;
			}

			.pep-item {
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				width: 242px;
				height: 62px;
				color: #959ac2;
				background-color: transparent;

				font-size: 28px;
				font-style: normal;
				font-weight: 500;
				line-height: 20px;
				// border-radius: 12px;
				// border: 1px solid #313350;

				&.active {
					color: #fff;
					font-size: 28px;
					font-style: normal;
					font-weight: 500;
					line-height: 20px;
					font-weight: 700;
					background: #554bf7;
					border: unset;
				}
			}

			.switch-container {
				font-size: 28px;
				line-height: 20px;
				font-weight: 300;
				box-sizing: border-box;
				width: 110px;
				text-align: left;
				color: #fff;
				// padding-left: 60px;
				background-color: transparent;

				.van-cell__title {
					font-size: 28px;
					margin-bottom: 3px;
				}

				.van-cell {
					color: #fff;
					background-color: transparent;
					width: 120px;
				}

				.van-cell__value {
					width: 80px !important;
				}

				.van-cell__value--alone {
					width: 80px !important;
				}

				.van-switch {
					height: 30px !important;
					width: 80px !important;
				}

				.van-switch__node {
					margin-top: 4px;
				}
			}
		}
	}

	.search-container {
		// border-top: 2px solid #131730;
		// border-bottom: 2px solid #131730;
		position: fixed;
		top: 112px;
		width: 750px;
		height: 120px;
		flex-shrink: 0;
		display: flex;
		text-align: center;
		align-items: center;
		justify-content: space-between;

		padding-left: 20px;
		padding-right: 20px;
		box-sizing: border-box;

		.search-items {
			width: 710px;
			height: 120px;
			display: flex;
			text-align: center;
			align-items: center;
			background: #171a30;

			.search-item {
				line-height: 120px;
				margin: 0px 20px;
				height: 120px;
				font-weight: 500;

				font-size: 28px;
				color: #6d6c82;
				cursor: pointer;

				&.active {
					border-bottom: 2px solid #6d6c82;
					color: #fff;
				}
			}
		}

		.search-filter {
			line-height: 54px;
			border-bottom: 2px solid #6d6c82;
			display: flex;

			input {
				border: none;
				background-color: transparent;
			}

			input::-webkit-input-placeholder {
				font-size: 14px;
				font-weight: 500;
				color: #33364c;
				line-height: 19px;
			}
		}
	}

	.bat_type_wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 5px;

		.cb_tab {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 550px;
			height: 60px;
			font-size: 32px;

			.tab_item {
				box-sizing: border-box;
				color: #fff;
				font-weight: bold;
				flex: 1;
				text-align: center;
				height: 60px;

				&.active {
					color: #fbfa02;
					border-bottom: 1px solid #fbfa02;
				}
			}
		}
	}

	.cb_tab_wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 35px;
		background-color: #111324;

		.cb_tab {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 710px;
			height: 60px;
			background-color: #0e0d19;

			.tab_item {
				box-sizing: border-box;

				color: #959ac2;
				font-weight: 400;
				flex: 1;
				text-align: center;

				height: 60px;
				line-height: 60px;
				font-size: 20px;

				&.active {
					color: #ced3fd;
					background-color: #3f4ab2;
				}
			}
		}
	}

	.goods-list {
		// position: absolute;
		// top: 250px;
		// left: 0px;
		// margin: 28px 0px;
		margin-top: 250px;
		margin-bottom: 170px;
		// min-height: calc(100vh - 300px);
		height: calc(100vh - 420px);
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-content: flex-start;
		padding: 0px 20px;

		box-sizing: border-box;
		overflow-y: scroll;

		.goods-item {
			width: 228px;
			height: 366px;
			//	 background: url(@/assets/romimg/battle/create/box_bg1.png) no-repeat
			//		 center;
			//	 background-size: contain;
			box-sizing: border-box;
			margin-bottom: 10px;
			position: relative;
			background-color: #1e203d;

			.num {
				position: absolute;
				left: 0px;
				top: 0px;
				font-size: 26px;
				// padding: 2px 8px;
				box-sizing: border-box;
				border-radius: 0px 0px 4px 0px;
				opacity: 0.5;
				background: #15172c;
				text-align: center;
				line-height: 40px;
				height: 40px;
				width: 62px;
			}

			.item_flag {
				position: absolute;
				width: 55px;
				height: 40px;
				right: 8px;
				top: 4px;
			}

			.case_pic {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 180px;
				height: 180px;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				margin: auto;
				margin-top: 20px;
				margin-bottom: 10px;

				img {
					max-width: 80%;
					max-height: 80%;
					margin-bottom: 6px;
				}
			}

			.name {
				width: 100%;
				color: #b4b6c8;

				font-size: 22px;
				font-style: normal;
				font-weight: 500;
				text-align: center;
			}

			p {
				margin-top: 14px;
				padding: 0 20px;
				box-sizing: border-box;
				font-size: 18px;
				text-align: center;
			}

			.price {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 20px;
				font-weight: bold;
				color: #75dc9e;

				margin-top: 14px;

				img {
					width: 35px;
					margin-top: 2px;
				}

				p {
					display: flex;
					justify-content: center;
					/* 水平居中 */
					align-items: center;
					/* 垂直居中 */
					color: #5E5E5E;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
					text-transform: uppercase;
					text-decoration: line-through solid;
					padding: 0 8px;
					margin-top: 0;
				}

			}

			.view {
				margin: auto;
				margin-top: 15px;
				width: 180px;
				height: 50px;
				border: 1px solid rgba($color: #fff, $alpha: 0.2);
				// opacity: 0.2;
				background: #1e203d;
				color: #b4b6c8;
				text-align: center;
				font-size: 24px;
				font-style: normal;
				font-weight: 700;
				line-height: 50px;
				box-sizing: border-box;
				border-radius: 8px;
			}

			&.active {
				background-image: url(@/assets/romimg/battle/create/selected.png);
				background-repeat: no-repeat;
				background-size: contain;
				background-color: #282b51;
			}
		}

		&::after {
			display: block;
			content: "";
			width: 221px;
		}

		&::-webkit-scrollbar {
			width: 0px;
		}

		&.active {
			margin-bottom: 370px;
			height: calc(100vh - 620px);
		}
	}

	.bottom-wrap {
		position: fixed;
		bottom: 0;
		box-sizing: border-box;
		width: 710px;
		height: 150px;
		background: #141323;
		z-index: 100;
		padding: 20px 20px 0;
		left: 50%;
		transform: translateX(-355px);

		.spread {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			position: relative;

			.spread_item {
				display: flex;
				align-items: center;

				color: #fff;

				font-size: 28px;
				font-style: normal;
				font-weight: 500;
			}

			.down {
				position: absolute;
				top: -2px;
				right: 20px;
				width: 70px;
				height: 30px;
				border: 2px solid #fbfa02;
				border-radius: 4px;
				text-align: center;
				line-height: 31px;
				font-size: 20px;

				&:active {
					color: #fbfa02;
				}
			}

			// .spread:last-child {
			//	 margin-left: 30px;
			// }

			:nth-child(2) {
				margin-left: 60px;
			}
		}

		.choose_list {
			width: 100%;
			overflow: auto;
			margin-top: 18px;

			.choose_list_wrap {
				display: flex;
				height: 132px;
				overflow-x: scroll;

				flex-wrap: nowrap;
				box-sizing: border-box;

				.choose_item {
					display: inline-block;
					position: relative;
					// background: url(@/assets/romimg/battle/create/box_bg1.png) no-repeat
					//	 center;
					// background-size: contain;
					width: 110px;
					height: 132px;
					flex-shrink: 0;
					margin-right: 20px;

					.case_pic {
						display: flex;
						justify-content: center;
						align-items: center;
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
						width: 100%;
						height: 132px;
						// margin-top: 20px;

						img {
							max-width: 80%;
							max-height: 80%;
							// margin-bottom: 6px;
						}
					}

					// p {
					//	 box-sizing: border-box;
					//	 margin-top: 14px;
					//	 padding: 0 20px;
					//	 font-size: 18px;
					//	 text-align: center;
					// }

					.price {
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 22px;
						font-weight: bold;
						color: #fbfa02;
						margin-top: 2px;

						img {
							width: 35px;
							margin-top: 2px;
						}
					}

					.del_wrap {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 30px;
						height: 30px;
						position: absolute;
						right: 23px;
						top: 15px;

						.del_content {
							width: 26px;
							height: 4px;
							background-color: #fffe00;
							background-repeat: no-repeat;
							background-size: contain;
						}
					}

					&:last-of-type {
						margin-right: 0px;
					}
				}

				// &::-webkit-scrollbar {
				//	 width: 10px;
				//	 height: 10px;
				//	 background-color: none;
				//	 border-radius: 10px;
				// }

				// &::-webkit-scrollbar-track {
				//	 border-radius: 10px;
				//	 background-color: rgba($color: #000000, $alpha: 0.1);
				// }

				// &::-webkit-scrollbar-thumb {
				//	 border-radius: 10px;
				//	 background-color: rgba($color: #818187, $alpha: 0.6);
				// }
			}
		}

		.room_num_wrap {
			display: flex;
			flex-direction: column;
			margin-top: 20px;

			.room_num_title {
				font-size: 22px;
				color: #fff;
			}

			.room_num {
				display: flex;
				justify-content: space-between;
				margin-top: 12px;

				.room_num_item {
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;
					width: 120px;
					height: 58px;
					border: 3px solid #fbfa02;
					font-size: 24px;
					margin: 0 11px;
					font-weight: bold;

					&.active {
						background-color: #fbfa02;
						color: #20212b;
						border: none;
					}

					input {
						width: 100%;
						background: none;
						text-align: center;
						border: none;
					}
				}
			}
		}

		.create-btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			// height: 114px;
			margin-top: 10px;
			margin-bottom: 30px;

			p {
				width: 674px;
				height: 100px;
				// background: url(@/assets/romimg/battle/create/btn_create.png) no-repeat
				//	 center;
				// background-size: contain;
				text-align: center;
				line-height: 100px;
				color: #fff;
				text-align: center;

				font-size: 32px;
				font-style: normal;
				font-weight: 700;

				border-radius: 8px;
				background: #4b58c9;

				&.enable {
					background-color: #242847;
				}
			}
		}

		&.active {
			height: 350px;
		}
	}

	.show-dialog-content-wrap {
		.desc-wrap {
			color: #aaacc1;
			font-size: 28px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
			text-align: center;
			margin-top: 30px;
		}

		.price-wrap {
			margin-top: 80px;
		}

		.check-desc-wrap {
			margin: 60px 0 40px;
			color: #7ef2ad;
			font-size: 26px;
			font-style: normal;
			font-weight: 400;
			line-height: 36px;
			/* 129.231% */
			text-align: center;

			img {
				width: 32px;
				height: 32px;
				vertical-align: middle;
			}
		}

		.next-desc-wrap {
			color: #aaacc1;

			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: 33px;
			/* 140% */
			text-align: center;
			margin: 30px 0;

			img {
				width: 32px;
				height: 32px;
				vertical-align: middle;
			}
		}

		.btn-ok-wrap {
			width: 600px;
			height: 90px;
			line-height: 90px;
			color: #fff;
			text-align: center;
			font-size: 32px;
			font-style: normal;
			font-weight: 700;

			border-radius: 8px;
			background: #4b58c9;

			&.enable {
				line-height: 90px;
				border-radius: 8px;
				background: #242847;
			}
		}
	}
}
</style>
