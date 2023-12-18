<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from 'vue';
import { getBoxList, createBattleRoom } from "@/network/api/battle"
import { getBlindBoxGoods } from '@/network/api/blind'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { showFloat } from "@/util/common";
import { getGoodsNamePre, getGoodsNameSec } from '@/util/common';
import { GoodImageBgType } from '@/util/util'
import { add, bignumber } from 'mathjs';
import BattleBoxDetail from './components/BattleBoxDetail.vue'

const store = useStore()
const router = useRouter()

const limit = ref({
	"maxBoxTypeCount": 6,
	"maxBoxNum": 6
});//对战限制
const pattern = ref([{
	text: '2',
	peopleCount: 2
},
{
	text: '3',
	peopleCount: 3
},
]);

let searchTabData = ref({
	searchItems: [
		{ icon: '', text: t('openbox.all'), min: 0, max: 1000000000, type: 1 },
		{ icon: '', text: t('battle.monthNew'), min: 0, max: 1000000, type: 8 },
		{ icon: "", text: t('battle.defaults'), min: 0, max: 1000000000, type: 1 },
		{ icon: "&#xe61c;", text: t('battle.perc55'), min: 0, max: 5, type: 2 },
		{ icon: "&#xe61c;", text: t('battle.blood'), min: 5, max: 10, type: 3 },
		{ icon: "&#xe61c;", text: t('battle.soul'), min: 10, max: 100, type: 4 },
		// { icon: '', text: '活动系列', min: 5, max: 100, type: 6 }
	],
	searchTabIndex: 0,
	searchFilter: "",
});

const peopleCount = ref(2)
const allBox = ref([])//箱子列表
const listBox = ref([])//可选箱子列表

const bottomActive = ref(true)//底部弹出
const already = ref([])//已选箱子列表
const alreadyList = ref([])//已选箱子列表
const round = ref(0);//回合
const totalPrice = ref(0);//价格

const tabType = ref(1);

const battleType = ref(1);

const roomNumDef = ref([1, 2, 3, 4]);
const roomNumSel = ref(0);
const roomNumInput = ref('');
let preRoomNumSel = 0;

const btnCreateActive = ref(true);//防快速点击

const showCreateDialog = ref(false);

const showConfirmDialog = ref(false)	/// 确认窗口状态
const rememberBattleTip = ref(false)	/// 记住提示
const autoSelectReward = ref(false)	 /// 自动分配奖品
const jumpTip = ref(false)			/// 跳动提示

onMounted(() => {
	rememberBattleTip.value = localStorage.getItem('remember-battle-tip') == 'true' ? true : false
	autoSelectReward.value = localStorage.getItem('auto-select-reward') == 'true' ? true : false
	getBattleBoxList()
})

/**
 * 记住创建房间的选择
 */
function onRememberBattleTip() {
	localStorage.setItem('remember-battle-tip', !rememberBattleTip.value)
	rememberBattleTip.value = !rememberBattleTip.value
}

function onAutoSelectReward() {
	localStorage.setItem('auto-select-reward', !autoSelectReward.value)
	autoSelectReward.value = !autoSelectReward.value
}



async function getBattleBoxList() {
	const res = await getBoxList();
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			allBox.value = items;
			allBox.value = allBox.value.sort((a, b) => a.originalPrice - b.originalPrice);
			listBox.value = allBox.value;
			listBox.value = listBox.value.sort((a, b) => a.originalPrice - b.originalPrice);
		}
	}
}

function onClickRoomType(rc) {
	peopleCount.value = rc;
}

function onClickBattleType(type) {
	battleType.value = type;
}


function onClickTab(type) {
	tabType.value = type;
	listBox.value = allBox.value.filter(item => { return item.subType == type });
}

function addAmount(item) {
	if (roundsieve()) {
		let value = already.value.find(v => v.boxId == item.boxId)
		alreadyList.value.unshift(item)
		if (value) {
			item.amount += 1
			roundcalculation()
		} else {
			if (alreadysieve()) {
				already.value.push(item)
				if (item.amount == undefined) item.amount = 0;
				item.amount += 1
				roundcalculation()
			} else {
				Warn({ offset: 100, message: t('battle.boxCatOverLimit'), customClass: 'error' })
			}
		}
	} else {
		Warn({ offset: 100, message: t('battle.boxNumOverLimit'), customClass: 'error' })
	}
}

function catAmount(item, index) {
	alreadyList.value.splice(index, 1);
	if (item.amount > 0) {
		item.amount -= 1
		if (item.amount == 0) {
			already.value = already.value.filter(value => value.boxId != item.boxId)

		}
		roundcalculation()
	}
}


function boxCatAmount(item) {
	if (item.amount > 0) {
		item.amount -= 1
		if (item.amount == 0) {
			already.value = already.value.filter(value => value.boxId != item.boxId)
		}
		let chIndex = alreadyList.value.findIndex((v) => {
			return item.boxId == v.boxId
		});
		if (chIndex != -1) {
			alreadyList.value.splice(chIndex, 1);
		}

		roundcalculation()
	}
}


function boxCatAllAmount(item) {
	if (item.amount > 0) {
		item.amount = 0
		already.value = already.value.filter(value => value.boxId != item.boxId)
		alreadyList.value = alreadyList.value.filter(value => value.boxId != item.boxId)
		roundcalculation()
	}
}
//回合数量计算
function roundcalculation() {
	let num = 0
	let price = 0
	for (let i = 0; i < already.value.length; i++) {
		price += already.value[i].amount * already.value[i].price
		num += already.value[i].amount
	}
	round.value = num

	let roomCount = roomNumSel.value == 4 ? Number(roomNumInput.value) : (roomNumSel.value + 1);
	totalPrice.value = price * roomCount;
}

//已选种类查询
function alreadysieve() {
	let list = already.value.map(item => {
		return item.boxName
	})
	let mySet = new Set(list);
	[...mySet]

	return (mySet.size + 1) <= limit.value.maxBoxTypeCount
}

//已选回合数量查询
function roundsieve() {
	let num = 0
	for (let i = 0; i < already.value.length; i++) {
		num += already.value[i].amount
	}
	return num + 1 <= limit.value.maxBoxNum
}


// 创建对战信息重置
function reset() {
	already.value = []
	alreadyList.value = []
	roundcalculation()
	listBox.value.map(item => item.amount = 0)
}

function onConfirmCreate() {
	// if( already.value.length > 0 )
	//	 if( rememberBattleTip.value && autoSelectReward.value )
	onClickCreate()
	//	 else
	//		 return showConfirmDialog.value = true
	// else
	//	 return Warn( '请先添加箱子' )
}

/**
 * 确认创建
 */
async function onClickCreate() {
	// if( autoSelectReward.value != true )
	// {
	//	 jumpTip.value = true
	//	 setTimeout( () => jumpTip.value = false, 1000 )
	//	 return
	// }

	if (!btnCreateActive.value) return;
	btnCreateActive.value = false;

	let params = {};
	params.peoples = peopleCount.value;
	params.roomCount = roomNumSel.value == 4 ? Number(roomNumInput.value) : (roomNumSel.value + 1);
	params.battleType = battleType.value;

	let boxIds = [];
	for (let i = 0; i < alreadyList.value.length; i++) {
		let item = alreadyList.value[i];
		boxIds.push(item.boxId);
	}
	params.boxIds = boxIds;
	if (boxIds.length == 0) {
		Warn({ offset: 100, message: t('battle.addBox'), customClass: 'error' })
		btnCreateActive.value = true;
		return;
	}
	const res = await createBattleRoom(params);
	if (res.code === 0) {
		Success({ offset: 100, message: t('battle.createSuccess') })
		store.dispatch("getUserInfo");
		onClickBack();
	}

	btnCreateActive.value = true;
}


function onSearchName() {
	listBox.value = allBox.value.filter((item) => {
		return item.name.indexOf(searchTabData.value.searchFilter) >= 0;
	});
}


function onClose() {
	showBoxDetail.value = false
	curBox.value = {}
	showCreateDialog.value = false;
}

function onClickBack() {
	router.back();
}

function onClickAdd() {
	showCreateDialog.value = true;
}
function onClickSearchTabIndex(index) {
	// window.$dev && console.log( index )
	searchTabData.value.searchTabIndex = index;
	if (index == 0) {
		listBox.value = allBox.value
	}
	else {
		let itemFilter = searchTabData.value.searchItems[index];
		listBox.value = allBox.value.filter(item => { return item.subType == itemFilter.type });
	}
}

const curBox = ref({})
const showBoxDetail = ref(false)
async function getBoxGoods(item) {
	curBox.value = item
	showBoxDetail.value = true
}

function closeBoxDetail() {
	showBoxDetail.value = false
}
const formatOriginalPrice = (price) => {
	const parts = price.toString().split('.');
	const integerPart = parts[0];
	// const decimalPart = parts[1] || '00'; // If there's no decimal part, default to '00'

	return integerPart
};
const formatOriginaldecimalPart = (price) => {
	const parts = price.toString().split('.');
	const integerPart = parts[0];
	const decimalPart = parts[1] || '00'; // If there's no decimal part, default to '00'

	return decimalPart
};
// // 假设 listBox 中的每个项都有一个 value 属性
// watch(listBox, (newListBox) => {
//	 // 当 listBox 改变时，重新排序
//	 listBox.value = [...newListBox].sort((a, b) => a.originalPrice - b.originalPrice);
// });
</script>
		
<template>
	<div id="pc-createbattle">

		<div class="pc-battle-title">
			<div class="title-c">
				<img src="@/assets/pcimg/battle/icon_create.png" alt="" />
				<p>{{ t('battle.addBox') }}</p>
				<div class="question"><img src="@/assets/pcimg/battle/question.png" alt="" /></div>
			</div>
			<div class="opts">
				<div class="opt" @click="onClickBack">
					<img src="@/assets/pcimg/common/back.png" alt="" />{{ t('common.back') }}
				</div>
			</div>
		</div>
		<div class="create-nav">
			<div class="nav-left">
				<div class="round">{{ round }}{{ t('battle.round') }}</div>
				<div class="pep-count">{{ t('common.users') }}
					<div class="pep-item" :class="{ 'active': item.peopleCount == peopleCount }"
						v-for="(item, index) in pattern" :key="index" @click="onClickRoomType(item.peopleCount)">
						{{ item.text }}</div>
				</div>
			</div>
			<div class="nav-right">
				{{ t('battle.priceTotal') }}
				<span><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{ totalPrice.toFixed(2)
				}}</span>
			</div>
		</div>
		<div class="box-wrap">
			<div class="box-item" v-for="(item, index) in already" :key="index">
				<div class="num-wrap">
					<div class="btn-num" @click="boxCatAmount(item)">-</div>
					<div class="num">{{ item.amount }}</div>
					<div class="btn-num" @click="addAmount(item)">+</div>
				</div>
				<div class="case-pic" :style="'background-image: url(' + item.imageUrl + ');'"><img
						:src="item.weaponImageUrl" alt=""></div>
				<div class="name">{{ item.name }}</div>
				<div class="price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{
					(Number(item.price) * Number(item.amount)).toFixed(2) }}</div>
				<div class="close" @click.stop="boxCatAllAmount(item)">
					<img src="@/assets/pcimg/common/close.png" alt="" />
				</div>
			</div>
			<div class="box-add" @click="onClickAdd">
				<div class="add-wrap">+</div>
				<p>{{ t('battle.addBox') }}</p>
			</div>
		</div>
		<div class="btn-create" @click="onConfirmCreate">
			{{ t('battle.create') }}<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{
				totalPrice.toFixed(2) }}
		</div>

		<van-overlay :show="showConfirmDialog" style="background-color: rgba( 0, 0, 0, .7 )" z-index="200">
			<div class="confirm-container">
				<div class="close-btn" @click="showConfirmDialog = false"><img src="@/assets/pcimg/common/close.png"></div>
				<div class="cc-title">{{ t('battle.create') }}</div>
				<div class="cc-sub-title">{{ t('battle.createTip') }}</div>
				<div class="cc-price"><img src="@/assets/pcimg/common/coin.png">{{ totalPrice.toFixed(2) }}</div>
				<div class="cc-tip">{{ t('battle.createConfirmText') }}</div>
				<div class="cc-checkbox" :class="{ shake: jumpTip }" @click="onAutoSelectReward">
					<img src="@/assets/pcimg/battle/checkbox.png" v-if="!autoSelectReward">
					<img src="@/assets/pcimg/battle/checkbox-on.png" v-else>
					{{ t('battle.resultTip') }}
				</div>
				<div class="cc-btn"><button @click="onClickCreate">{{ t('notify.confirm') }}</button></div>
				<div class="cc-remember" @click="onRememberBattleTip">
					<img src="@/assets/pcimg/battle/checkbox.png" v-if="!rememberBattleTip">
					<img src="@/assets/pcimg/battle/checkbox-on.png" v-else>
					{{ t('battle.noPopupAgain') }}
				</div>
			</div>
		</van-overlay>

		<van-overlay :show="showCreateDialog" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="200">

			<div class="create-container">
				<div class="create-title">
					<div>
						{{ t('router.createBattle') }}
						<div class="cost-container">
							{{ t('battle.priceTotal') }}
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />
							<div class="price" v-html="showFloat(totalPrice.toFixed(2), 10)"></div>
						</div>

						<div class="clear" @click="reset">{{ t('mall.clear') }}</div>
					</div>

					<div class="close" @click="onClose">✕</div>
				</div>
				<div class="create-body">
					<div class="search-container">
						<div class="search-items">
							<div class="search-item" :class="{ active: index == searchTabData.searchTabIndex }"
								v-for="(item, index) in searchTabData.searchItems" @click="onClickSearchTabIndex(index)"
								:key="index">
								{{ item.text }}
							</div>
						</div>
						<div class="search-filter">
							<input type="text" v-model="searchTabData.searchFilter" :placeholder="t('battle.boxName')"
								@keyup.enter="onSearchName()" />
							<span style="color: #878b91" class="iconfont pc-icon-16" @click="onSearchName()">&#xe620;</span>
						</div>
					</div>
					<div class="goods-list">
						<div class="goods-item" v-for="(item, index) in listBox" :key="index"
							:class="{ active: item.amount > 0 }" @click.prevent="addAmount(item)">
							<div class="show-box-detail" @click.stop="getBoxGoods(item)"><img
									src="@/assets/pcimg/battle/search.png"></div>

							<div class="num" v-show="item.amount > 0">×{{ item.amount }}</div>
							<div class="reduce" v-show="item.amount > 0" @click.stop="boxCatAmount(item)"><img
									src="@/assets/pcimg/battle/minus.png"></div>
							<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
								<img :src="item.weaponImageUrl" alt="" />
							</div>
							<div class="desc">{{ item.name }}</div>
							<div class="price">
								<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />
								<div>{{ item.price }}</div>&nbsp;&nbsp;
								<p v-if="Number(item.price) < Number(item.originalPrice)">{{ item.originalPrice }}</p>
								<!-- <p class="point" v-if="Number(item.price) < Number(item.originalPrice)">{{ formatOriginaldecimalPart(item.originalPrice) }}</p> -->

							</div>
						</div>
					</div>
				</div>
				<div class="create-footer">
					<div @click="onClose">{{ t('notify.confirm') }}</div>
				</div>
			</div>

			<BattleBoxDetail :item="curBox" v-if="showBoxDetail" @close-box-detail="closeBoxDetail"></BattleBoxDetail>
		</van-overlay>
	</div>
</template>
		
<style lang="scss">
@keyframes shakeX {

	0%,
	to {
		transform: translateZ(0)
	}

	10%,
	30%,
	50%,
	70%,
	90% {
		transform: translate3d(-10px, 0, 0)
	}

	20%,
	40%,
	60%,
	80% {
		transform: translate3d(10px, 0, 0)
	}
}

#pc-createbattle {
	max-width: 1440px;
	width: 100%;
	margin: auto;
	padding: 0 15px;
	box-sizing: border-box;
	min-height: 900px;

	.confirm-container {
		width: 514px;
		height: 406px;
		position: fixed;
		top: calc(50% - 406px / 2);
		left: calc(50% - 514px / 2);
		border-radius: 2px;
		background: #191C34;
		box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
		padding: 50px 104px 40px 104px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		div {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.close-btn {
			position: absolute;
			top: 30px;
			right: 32px;
		}

		.cc-remember {
			color: #C3C3E2;

			font-size: 16px;
			font-style: normal;
			font-weight: 400;
			line-height: 21px;
			/* 131.25% */
			gap: 6px;
		}

		.cc-btn {
			width: 100%;

			button {
				border-radius: 4px;
				background: #3A34B0;
				border: none;
				width: 100%;
				height: 55px;
				color: #fff;
				font-size: 18px;
				font-weight: 700;

				&:hover {
					background: #4B58C9;
				}
			}
		}

		.cc-checkbox {
			color: #C3C3E2;

			font-size: 16px;
			font-style: normal;
			font-weight: 400;
			line-height: 21px;
			/* 131.25% */
			gap: 6px;

			&.shake {
				animation: shakeX 1s;
			}
		}

		.cc-tip {
			color: #C3C3E2;

			font-size: 16px;
			font-style: normal;
			font-weight: 400;
			line-height: 21px;
			/* 131.25% */
		}

		.cc-price {
			color: #75DC9E;

			font-size: 29.963px;
			font-style: normal;
			font-weight: 700;
			line-height: 47.085px;
			/* 157.143% */
			gap: 9px;

			img {
				width: 30px;
			}
		}

		.cc-title {
			color: #FFF;

			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: 32px;
			/* 133.333% */
		}

		.cc-sub-title {
			color: #C3C3E2;

			font-size: 16px;
			font-style: normal;
			font-weight: 400;
			line-height: 21px;
			/* 131.25% */
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
				cursor: pointer;

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

	.create-nav {
		display: flex;
		width: 100%;
		height: 80px;
		align-items: center;
		flex-shrink: 0;
		background: #111324;
		margin-top: 10px;
		justify-content: space-between;
		padding: 0 40px;
		box-sizing: border-box;

		.nav-left {
			display: flex;
			align-items: center;

			.round {
				color: #7349CA;

				font-size: 20px;
				font-weight: 300;
			}

			.pep-count {
				display: flex;
				align-items: center;
				color: #FFF;
				font-size: 16px;
				font-weight: 300;
				margin-left: 60px;

				.pep-item {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 24px;
					height: 24px;
					border-radius: 6px;
					border: 1px solid #313350;
					color: #959AC2;
					font-size: 11px;
					margin-left: 10px;
					cursor: pointer;

					&.active {
						border: 1px solid #6D6C82;
						color: #FFF;
					}
				}
			}
		}

		.nav-right {
			color: #FFF;
			font-size: 16px;
			display: flex;
			align-items: center;

			span {
				color: #75DC9E;

				font-size: 14px;
				font-weight: 500;
				letter-spacing: 0.42px;
				margin-left: 10px;
			}

			img {
				margin-bottom: -3px;
			}
		}
	}

	.box-wrap {
		display: flex;
		padding: 0 38px;
		box-sizing: border-box;
		margin-top: 18px;

		.box-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			background: url(@/assets/pcimg/battle/box_bg.png) no-repeat center;
			background-size: 100% 100%;
			border-radius: 10px;
			width: 170px;
			height: 225px;
			margin-right: 10px;

			.close {
				position: absolute;
				right: 10px;
				top: 10px;
				cursor: pointer;

				img {
					width: 12px;
					height: 12px;
				}
			}

			.num-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 12px;

				.btn-num {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 12px;
					height: 12px;
					border-radius: 2px;
					border: 0.8px solid #959AC2;
					color: #959AC2;
					font-size: 10px;
					text-align: center;
					box-sizing: border-box;
					line-height: 10px;
				}

				.num {
					color: #FFF;
					font-size: 12px;
					margin: 0 8px;
					line-height: 12px;
				}
			}

			.case-pic {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				height: 135px;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;

				img {
					max-width: 80%;
					max-height: 80%;
				}
			}

			.name {
				margin-top: 5px;
				color: #B4B6C8;

				font-size: 14px;
				font-weight: 500;
			}

			.price {
				display: flex;
				margin-top: 6px;
				color: #75DC9E;

				font-size: 14px;
				font-weight: 500;
				letter-spacing: 0.42px;

			}

		}

		.box-add {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			width: 170px;
			height: 225px;
			background: #1E203D;
			color: #B4B6C8;

			font-size: 14px;
			font-weight: 500;
			cursor: pointer;

			.add-wrap {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 45px;
				height: 45px;
				border-radius: 6px;
				border: 1px solid #313350;
			}

			p {
				margin-top: 19px;
			}
		}
	}

	.btn-create {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 180px;
		height: 50px;
		border-radius: 4px;
		background: #3A34B0;
		color: #FFF;
		text-align: center;
		font-size: 16px;
		font-weight: 700;
		margin: 54px auto;
		cursor: pointer;

		&:hover {
			background: #4B58C9;
		}

		span {
			display: flex;
			color: #75DC9E;

			font-size: 14px;
			font-weight: 700;
			margin-left: 5px;
		}

		img {
			margin-left: 4px;
		}
	}

	.van-overlay {
		z-index: 200 !important;
		display: flex;

		.create-container {
			border-radius: 4px;
			background: #171a30;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 754px;
			max-height: 780px;
			height: 100%;
			margin: auto;

			.create-title {
				display: flex;
				height: 65px;
				justify-content: space-between;
				padding: 0% 26px;

				div:first-child {
					font-size: 24px;
					color: #fff;
					margin-right: 20px;
					line-height: 65px;
					display: flex;
					box-sizing: border-box;

					.cost-container {
						padding-top: 20px;
						margin-left: 20px;
						line-height: 45px;
						font-size: 12px;
						color: #52cf83;
						display: flex;
						align-items: center;
						box-sizing: border-box;


						.price {
							padding-top: 3px;
							font-size: 16px;

						}

						img {
							width: 18px;
							height: 18px;
							margin-bottom: 0px;
							margin-left: 4px;
						}
					}

					.clear {
						cursor: pointer;
						margin-top: 35px;
						height: 18px;
						line-height: 18px;
						// vertical-align: bottom;
						width: 40px;
						font-size: 10px;
						color: #959ac2;
						border: 1px solid #313350;
						border-radius: 10px;
						text-align: center;
					}
				}

				.close {
					float: right;
					color: #959ac2;
					margin-top: 20px;
					cursor: pointer;
				}
			}

			.create-body {
				height: calc(100% - 165px);

				.search-container {
					border-top: 2px solid #131730;
					border-bottom: 2px solid #131730;
					background: #171a30;
					width: 750px;
					height: 97px;
					flex-shrink: 0;
					display: flex;
					text-align: center;
					align-items: center;
					justify-content: space-between;
					color: #6d6c82;
					font-size: 14px;
					padding-left: 20px;
					padding-right: 20px;
					box-sizing: border-box;

					.search-items {
						display: flex;
						text-align: center;
						align-items: center;
						flex-wrap: wrap;
						// gap: 8px;

						.search-item {
							// line-height: 54px;
							margin: 0px 20px;
							cursor: pointer;
							padding: 10px;

							&.active {
								border: 1px solid #6d6c82;
								color: #fff;
								border-radius: 6px;
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

				.goods-list {
					width: 100%;
					display: grid;
					grid-template-columns: repeat(auto-fill, 170px);
					grid-template-rows: repeat(auto-fill, 225px);
					column-gap: 12px;
					row-gap: 12px;
					padding: 15px;
					box-sizing: border-box;
					// height: 550px;
					height: calc(100% - 97px);
					overflow-y: scroll;

					.goods-item {
						cursor: pointer;
						background: #1e203d;
						width: 170px;
						height: 225px;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						position: relative;

						&:hover {
							background: url(@/assets/pcimg/battle/box_bg.png) no-repeat center;
							background-size: contain;
							border-radius: 10px;
						}

						.show-box-detail {
							// display: none;
							position: absolute;
							background: rgba(100, 89, 209, 0.83);
							border-radius: 50%;
							// padding: 12px;
							display: flex;
							justify-content: center;
							align-items: center;
							overflow: hidden;
							width: 0;
							height: 0;
							transition: .5s;

							img {
								width: 60%;
								height: 60%;
							}
						}

						&:hover {
							.show-box-detail {
								display: flex;
								width: 45px;
								height: 45px;
							}
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
								// padding: 0 8px;							
							}

							.point {
								font-size: 10px;
								margin-top: 2px;
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
							left: 14px;
							top: 8px;
							font-size: 22px;
						}

						.reduce {
							border: 1px solid rgba(255, 102, 102, 0.15);
							position: absolute;
							right: 14px;
							top: 8px;
							// padding: 10px 7px;
							width: 22px;
							height: 22px;
							border-radius: 3px;
							display: flex;
							justify-content: center;
							align-items: center;
						}
					}
				}
			}

			.create-footer {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100px;

				div:first-child {
					background-color: #4b58c9;
					width: 180px;
					height: 50px;
					color: #fff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 16px;
					cursor: pointer;

					&:hover {
						background-color: rgba($color: #4b58c9, $alpha: 0.8);
					}
				}
			}
		}

	}

}
</style>