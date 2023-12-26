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
				<!-- <img src="@/assets/pcimg/battle/icon_create.png" alt="" /> -->
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
					<path
						d="M35.8997 13.0146V13.0166V26.9833C35.8997 29.8675 35.0429 32.0795 33.5527 33.5697C32.0625 35.0598 29.8505 35.9166 26.9663 35.9166H13.0163C10.1322 35.9166 7.92043 35.0599 6.43034 33.5679C4.94014 32.0758 4.08301 29.8597 4.08301 26.9666V13.0166C4.08301 10.1325 4.93982 7.9205 6.43 6.43031C7.92019 4.94012 10.1322 4.08331 13.0163 4.08331H26.983C29.8673 4.08331 32.079 4.94018 33.5669 6.42998C35.0547 7.91961 35.9076 10.1309 35.8997 13.0146ZM21.9997 26.6666V22H26.6663C27.7639 22 28.6663 21.0975 28.6663 20C28.6663 18.9024 27.7639 18 26.6663 18H21.9997V13.3333C21.9997 12.2358 21.0972 11.3333 19.9997 11.3333C18.9021 11.3333 17.9997 12.2358 17.9997 13.3333V18H13.333C12.2355 18 11.333 18.9024 11.333 20C11.333 21.0975 12.2355 22 13.333 22H17.9997V26.6666C17.9997 27.7642 18.9021 28.6666 19.9997 28.6666C21.0972 28.6666 21.9997 27.7642 21.9997 26.6666Z"
						fill="#4B4F71" stroke="#4B4F71" stroke-width="1.5" />
				</svg>
				<p>{{ t('battle.addBox') }}</p>
				<div class="question"><img src="@/assets/pcimg/battle/question.png" alt="" /></div>
			</div>
			<div class="opts">
				<div class="opt" @click="onClickBack">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
							fill="white" />
						<path
							d="M13.9204 16.13H9.00039C8.59039 16.13 8.25039 15.79 8.25039 15.38C8.25039 14.97 8.59039 14.63 9.00039 14.63H13.9204C15.2004 14.63 16.2504 13.59 16.2504 12.3C16.2504 11.01 15.2104 9.96997 13.9204 9.96997H7.15039C6.74039 9.96997 6.40039 9.62997 6.40039 9.21997C6.40039 8.80997 6.74039 8.46997 7.15039 8.46997H13.9204C16.0304 8.46997 17.7504 10.19 17.7504 12.3C17.7504 14.41 16.0304 16.13 13.9204 16.13Z"
							fill="white" />
						<path
							d="M8.56945 11.52C8.37945 11.52 8.18945 11.45 8.03945 11.3L6.46945 9.73001C6.17945 9.44001 6.17945 8.96001 6.46945 8.67001L8.03945 7.10001C8.32945 6.81001 8.80945 6.81001 9.09945 7.10001C9.38945 7.39001 9.38945 7.87001 9.09945 8.16001L8.05945 9.20001L9.09945 10.24C9.38945 10.53 9.38945 11.01 9.09945 11.3C8.95945 11.44 8.76945 11.52 8.56945 11.52Z"
							fill="white" />
					</svg>
					{{ t('common.back') }}
				</div>
			</div>
		</div>
		<div class="create-nav">
			<div class="nav-left">
				<div class="round">{{ round }} {{ t('battle.round') }}</div>
				<div class="pep-count">{{ t('common.users') }}
					<div class="pep-item" :class="{ 'active': item.peopleCount == peopleCount }"
						v-for="(item, index) in pattern" :key="index" @click="onClickRoomType(item.peopleCount)">
						{{ item.text }}</div>
				</div>
			</div>
			<div class="nav-right">
				{{ t('battle.priceTotal') }}
				<span><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ totalPrice.toFixed(2)
				}}</span>
			</div>
		</div>
		<div class="box-wrap">
			<div class="box-item" v-for="(item, index) in already" :key="index">
				<div class="box-item--bg">

				</div>
				<div class="num-wrap">
					<div class="btn-num" @click="boxCatAmount(item)">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M13.3337 10.625H6.66699C6.32533 10.625 6.04199 10.3417 6.04199 10C6.04199 9.65833 6.32533 9.375 6.66699 9.375H13.3337C13.6753 9.375 13.9587 9.65833 13.9587 10C13.9587 10.3417 13.6753 10.625 13.3337 10.625Z"
								fill="white" />
							<path
								d="M12.5003 18.9584H7.50033C2.97533 18.9584 1.04199 17.0251 1.04199 12.5001V7.50008C1.04199 2.97508 2.97533 1.04175 7.50033 1.04175H12.5003C17.0253 1.04175 18.9587 2.97508 18.9587 7.50008V12.5001C18.9587 17.0251 17.0253 18.9584 12.5003 18.9584ZM7.50033 2.29175C3.65866 2.29175 2.29199 3.65841 2.29199 7.50008V12.5001C2.29199 16.3417 3.65866 17.7084 7.50033 17.7084H12.5003C16.342 17.7084 17.7087 16.3417 17.7087 12.5001V7.50008C17.7087 3.65841 16.342 2.29175 12.5003 2.29175H7.50033Z"
								fill="white" />
						</svg>
					</div>
					<div class="num">{{ item.amount }}</div>
					<div class="btn-num" @click="addAmount(item)">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M13.3337 10.625H6.66699C6.32533 10.625 6.04199 10.3417 6.04199 10C6.04199 9.65833 6.32533 9.375 6.66699 9.375H13.3337C13.6753 9.375 13.9587 9.65833 13.9587 10C13.9587 10.3417 13.6753 10.625 13.3337 10.625Z"
								fill="white" />
							<path
								d="M10 13.9584C9.65833 13.9584 9.375 13.6751 9.375 13.3334V6.66675C9.375 6.32508 9.65833 6.04175 10 6.04175C10.3417 6.04175 10.625 6.32508 10.625 6.66675V13.3334C10.625 13.6751 10.3417 13.9584 10 13.9584Z"
								fill="white" />
							<path
								d="M12.5003 18.9584H7.50033C2.97533 18.9584 1.04199 17.0251 1.04199 12.5001V7.50008C1.04199 2.97508 2.97533 1.04175 7.50033 1.04175H12.5003C17.0253 1.04175 18.9587 2.97508 18.9587 7.50008V12.5001C18.9587 17.0251 17.0253 18.9584 12.5003 18.9584ZM7.50033 2.29175C3.65866 2.29175 2.29199 3.65841 2.29199 7.50008V12.5001C2.29199 16.3417 3.65866 17.7084 7.50033 17.7084H12.5003C16.342 17.7084 17.7087 16.3417 17.7087 12.5001V7.50008C17.7087 3.65841 16.342 2.29175 12.5003 2.29175H7.50033Z"
								fill="white" />
						</svg>
					</div>
				</div>
				<div class="case-pic" :style="'background-image: url(' + item.imageUrl + ');'"><img
						:src="item.weaponImageUrl" alt=""></div>
				<div class="name">{{ item.name }}</div>
				<div class="price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
					(Number(item.price) * Number(item.amount)).toFixed(2) }}</div>
				<div class="close" @click.stop="boxCatAllAmount(item)">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
							fill="#EB4C4B" />
						<path
							d="M9.16937 15.5801C8.97937 15.5801 8.78938 15.5101 8.63938 15.3601C8.34938 15.0701 8.34938 14.5901 8.63938 14.3001L14.2994 8.64011C14.5894 8.35011 15.0694 8.35011 15.3594 8.64011C15.6494 8.93011 15.6494 9.41011 15.3594 9.70011L9.69937 15.3601C9.55937 15.5101 9.35937 15.5801 9.16937 15.5801Z"
							fill="#EB4C4B" />
						<path
							d="M14.8294 15.5801C14.6394 15.5801 14.4494 15.5101 14.2994 15.3601L8.63938 9.70011C8.34938 9.41011 8.34938 8.93011 8.63938 8.64011C8.92937 8.35011 9.40937 8.35011 9.69937 8.64011L15.3594 14.3001C15.6494 14.5901 15.6494 15.0701 15.3594 15.3601C15.2094 15.5101 15.0194 15.5801 14.8294 15.5801Z"
							fill="#EB4C4B" />
					</svg>
				</div>
			</div>
			<div class="box-item" @click="onClickAdd">
				<div class="box-item--bg">

				</div>

				<!-- <div class="add-wrap">+</div> -->
				<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
					<path
						d="M53.3337 41.75H26.667C25.7145 41.75 24.917 40.9525 24.917 40C24.917 39.0475 25.7145 38.25 26.667 38.25H53.3337C54.2861 38.25 55.0837 39.0475 55.0837 40C55.0837 40.9525 54.2861 41.75 53.3337 41.75Z"
						fill="#727391" stroke="#727391" stroke-width="1.5" />
					<path
						d="M40 55.0833C39.0475 55.0833 38.25 54.2857 38.25 53.3333V26.6666C38.25 25.7142 39.0475 24.9166 40 24.9166C40.9525 24.9166 41.75 25.7142 41.75 26.6666V53.3333C41.75 54.2857 40.9525 55.0833 40 55.0833Z"
						fill="#727391" stroke="#727391" stroke-width="1.5" />
					<path
						d="M50.0003 75.8333H30.0003C11.9003 75.8333 4.16699 68.1 4.16699 50V30C4.16699 11.9 11.9003 4.16663 30.0003 4.16663H50.0003C68.1003 4.16663 75.8337 11.9 75.8337 30V50C75.8337 68.1 68.1003 75.8333 50.0003 75.8333ZM30.0003 9.16663C14.6337 9.16663 9.16699 14.6333 9.16699 30V50C9.16699 65.3666 14.6337 70.8333 30.0003 70.8333H50.0003C65.367 70.8333 70.8337 65.3666 70.8337 50V30C70.8337 14.6333 65.367 9.16663 50.0003 9.16663H30.0003Z"
						fill="#727391" />
				</svg>
				<p>{{ t('battle.addBox') }}</p>
			</div>
		</div>
		<div class="btn-create" @click="onConfirmCreate">
			<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
				<path
					d="M18.5 12.75H6.5C6.09 12.75 5.75 12.41 5.75 12C5.75 11.59 6.09 11.25 6.5 11.25H18.5C18.91 11.25 19.25 11.59 19.25 12C19.25 12.41 18.91 12.75 18.5 12.75Z"
					fill="#171717" />
				<path
					d="M12.5 18.75C12.09 18.75 11.75 18.41 11.75 18V6C11.75 5.59 12.09 5.25 12.5 5.25C12.91 5.25 13.25 5.59 13.25 6V18C13.25 18.41 12.91 18.75 12.5 18.75Z"
					fill="#171717" />
			</svg>
			{{ t('battle.create') }}<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
				totalPrice.toFixed(2) }}
		</div>

		<van-overlay :show="showConfirmDialog" style="background-color: rgba( 0, 0, 0, .7 )" z-index="200">
			<div class="confirm-container">
				<div class="close-btn" @click="showConfirmDialog = false"><img src="@/assets/pcimg/common/close.png"></div>
				<div class="cc-title">{{ t('battle.create') }}</div>
				<div class="cc-sub-title">{{ t('battle.createTip') }}</div>
				<div class="cc-price"><img src="@/assets/pcimg/common/coin.svg">{{ totalPrice.toFixed(2) }}</div>
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
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />
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
								<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />
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
	max-width: 1120px;
	width: 100%;
	margin: auto;
	min-height: 900px;
	margin-top: 40px;

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
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;

		.title-c {
			color: #fff;
			font-size: 40px;
			font-weight: 700;
			letter-spacing: 4px;
			text-transform: uppercase;
			display: flex;
			align-items: center;
			position: relative;

			svg {
				width: 40px;
				height: 40px;
				margin-right: 8px;
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
			color: white;
			font-size: 16px;
			font-weight: 700;
			text-transform: uppercase;
			line-height: 24px;

			.opt {
				cursor: pointer;
				display: flex;
				align-items: center;
				padding: 16px 32px;
				flex-shrink: 0;
				vertical-align: middle;
				border-radius: 4px;
				border-radius: 8px;
				background: #4B4F71;

				svg {
					margin-right: 8px;
				}
			}
		}
	}

	.create-nav {
		display: flex;
		// width: 100%;
		align-items: center;
		// flex-shrink: 0;
		margin-top: 16px;
		justify-content: space-between;
		padding: 12px 24px;
		border-radius: 12px;
		background: rgba(28, 33, 89, 0.50);
		backdrop-filter: blur(12px);
		color: white;

		.nav-left {
			display: flex;
			align-items: center;

			.round {
				color: white;
				font-size: 20px;
				font-weight: 700;
				line-height: 28px;
				text-transform: uppercase;
			}

			.pep-count {
				display: flex;
				align-items: center;
				color: #FFF;
				font-size: 18px;
				font-weight: 500;
				margin-left: 65px;

				.pep-item {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 48px;
					height: 48px;
					color: #fff;
					font-size: 18px;
					line-height: 26px;
					cursor: pointer;
					border-radius: 12px;
					border: 1px solid #727391;
					margin-left: 8px;
					transition: .3s all;

					&:first-child {
						margin-left: 24px;
					}

					&.active {
						border: 1px solid #6D6C82;
						color: #FFF;
					}

					&:hover,
					&.active {
						border-color: #FFE063;
						background: #FFE063;
						color: #151515;
					}
				}
			}
		}

		.nav-right {
			color: #FFF;
			font-size: 18px;
			font-weight: 500;
			line-height: 26px;
			display: flex;
			align-items: center;
			gap: 16px;

			span {
				font-size: 20px;
				font-weight: 700;
				text-transform: uppercase;
				display: flex;
				align-items: center;
				gap: 8px;
			}

			img {
				width: 20px;
				height: 20px;
			}

			.pc-price-coin {
				margin: 0 !important;
			}
		}
	}

	.box-wrap {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		box-sizing: border-box;
		margin-top: 40px;


		.box-item {

			// display: flex;
			// justify-content: center;
			// align-items: center;
			// flex-direction: column;
			height: 100%;
			color: white;
			background: rgba(52, 53, 79, 0.50);
			backdrop-filter: blur(80px);
			border-radius: 16px;
			font-size: 18px;
			font-weight: 500;
			line-height: 26px;
			cursor: pointer;
			overflow: hidden;

			aspect-ratio: .8;
			height: 100%;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			// bacfilter: blur(40px);

			* {
				position: relative;
				z-index: 1;
			}

			&::before {
				content: "";
				position: absolute;
				background: url(@/assets/pcimg/battle/box_bg.png) no-repeat center;
				width: 100%;
				aspect-ratio: 1.34;
				bottom: 0;
				z-index: 0;
			}

			&--bg,
			&::after {
				content: "";
				position: absolute;
				background: #6544f7b9;
				width: 130px;
				height: 130px;
				top: 0;
				left: 0;
				transform: translate(-40%, -40%);
				z-index: 0;
				border-radius: 100%;
				filter: blur(40px);
			}

			&::after {
				bottom: 0;
				top: 90%;
				right: 0;
				left: 90%;
			}



			.close {
				position: absolute;
				right: 16px;
				top: 16px;
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
				position: absolute;
				top: 16px;
				left: 16px;

				.btn-num {
					cursor: pointer;
					display: flex;
					align-items: center;
				}

				.num {
					color: #FFF;
					align-self: stretch;
					font-size: 18px;
					font-weight: 500;
					width: 40px;
					display: flex;
					justify-content: center;
					align-items: center;
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
				color: #fff;
				font-size: 16px;
				font-weight: 500;
				padding-top: 16px;
			}

			.price {
				display: flex;
				align-items: center;
				margin-top: 8px;
				color: #fff;
				font-size: 18px;
				font-weight: 500;
				gap: 4px;

				img {
					margin: 0;
				}
			}

		}

		.box-item {


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
				margin-top: 16px;
			}
		}
	}

	.btn-create {
		padding: 24px 32px;
		border-radius: 8px;
		background: #FFE063;
		color: #151515;
		text-align: center;
		font-size: 20px;
		font-weight: 700;
		margin: auto;
		margin-top: 40px;
		margin-bottom: 98px;
		cursor: pointer;
		width: fit-content;
		transition: .3s all;
		display: flex;
		align-items: center;
		gap: 8px;

		img {
			border: 2px solid white;
			border-radius: 100%;
			width: 20px;
			height: 20px;
			margin: 0;
		}

		&:hover {
			background: #ffe063e7;

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
					color: #959ac2;
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