<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { onMounted, ref } from "vue";
import { getBoxList, createBattleRoom } from "@/network/api/battle";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { showFloat } from "@/util/common";

const props = defineProps(["showCreateDialog"]);
const emit = defineEmits(["closeCreateDialog"]);
const store = useStore();
const router = useRouter();

const limit = ref({
	maxBoxTypeCount: 6,
	maxBoxNum: 6,
}); //对战限制

const pattern = ref([
	{
		text: t('battle.romeFor2'),
		peopleCount: 2,
	},
	{
		text: t('battle.romeFor3'),
		peopleCount: 3,
	},
]);

let searchTabData = ref({
	searchItems: [
		{ icon: "", text: t('common.all'), min: 0, max: 1000000000 },
		{ icon: "&#xe61c;", text: "0-5", min: 0, max: 5 },
		{ icon: "&#xe61c;", text: "5-10", min: 5, max: 10 },
		{ icon: "&#xe61c;", text: "10-100", min: 10, max: 100 },
		{ icon: "&#xe61c;", text: "100+", min: 100, max: 1000000000 },
	],
	searchTabIndex: 0,
	searchFilter: "",
});

function onClickSearchTabIndex(index) {
	searchTabData.value.searchTabIndex = index;
	let itemFilter = searchTabData.value.searchItems[index];
	listBox.value = allBox.value.filter((item) => {
		return item.price >= itemFilter.min && item.price < itemFilter.max;
	});
}

const peopleCount = ref(2);
const allBox = ref([]); //箱子列表
const listBox = ref([]); //可选箱子列表

const bottomActive = ref(true); //底部弹出
const already = ref([]); //已选箱子列表
const alreadyList = ref([]); //已选箱子列表
const round = ref(0); //回合
const totalPrice = ref(0); //价格

const tabType = ref(1);

const battleType = ref(1);

const roomNumDef = ref([1, 2, 3, 4]);
const roomNumSel = ref(0);
const roomNumInput = ref("");
let preRoomNumSel = 0;

const btnCreateActive = ref(true); //防快速点击

onMounted(() => {
	getBattleBoxList();
});

async function getBattleBoxList() {
	const res = await getBoxList();
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			allBox.value = items;
			listBox.value = items;
		}
	}
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
	params.roomCount =
		roomNumSel.value == 4 ? Number(roomNumInput.value) : roomNumSel.value + 1;
	params.battleType = battleType.value;

	let boxIds = [];
	for (let i = 0; i < alreadyList.value.length; i++) {
		let item = alreadyList.value[i];
		boxIds.push(item.boxId);
	}
	params.boxIds = boxIds;
	const res = await createBattleRoom(params);
	if (res.code === 0) {
		Success({ offset: 100, message: t('battle.createSuccess') });
		store.dispatch("getUserInfo");
		emit("closeCreateDialog");
	}

	btnCreateActive.value = true;
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

function onSearchName() {
	listBox.value = allBox.value.filter((item) => {
		return item.name.indexOf(searchTabData.value.searchFilter) >= 0;
	});
}

function onClose() {
	emit("closeCreateDialog");
}
</script>

<template>
	<div id="pc-create-battle-dialog">
		<van-overlay :show="showCreateDialog" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="200">
			<div class="create-container">
				<div class="create-title">
					<div>
						{{ t('battle.createBattle') }}
						<div class="cost-container">
							{{ t('battle.priceTotal') }}
							<span class="icon iconfont pc-icon icon">&#xe61c;</span>
							<div class="price" v-html="showFloat(totalPrice.toFixed(2), 10)"></div>
						</div>

						<div class="clear" @click="reset">{{ t('common.clear') }}</div>
					</div>

					<div class="close" @click="onClose">✕</div>
				</div>
				<div class="create-body">
					<div class="search-container">
						<div class="search-items">
							<div class="search-item" :class="{ active: index == searchTabData.searchTabIndex }"
								v-for="(item, index) in searchTabData.searchItems" @click="onClickSearchTabIndex(index)"
								:key="index">
								<span v-if="item.icon" class="iconfont pc-icon-16">&#xe61c;</span>{{ item.text }}
							</div>
						</div>
						<div class="search-filter">
							<input type="text" v-model="searchTabData.searchFilter" :placeholder="t('battle.boxName')"
								@keyup.enter="onSearchName()" />
							<span style="color: #878b91" class="iconfont pc-icon-16" @click="onSearchName()">&#xe620;</span>
						</div>
					</div>
					<div class="goods-list">
						<div class="goods-item" v-for="(item, index) in listBox" :class="{ active: item.amount > 0 }"
							@click.prevent="addAmount(item)" :key="index">
							<div class="num" v-show="item.amount > 0">×{{ item.amount }}</div>
							<div class="case_pic" :style="'background-image: url(' + item.imageUrl + ');'">
								<img :src="item.weaponImageUrl" alt="" />
							</div>
							<div class="desc">{{ item.name }}</div>
							<div class="price">
								<span class="iconfont pc-icon"
									style="font-size: 18px !important; margin-right: 5px">&#xe61c;</span>
								<div v-html="showFloat(item.price, 10)"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="create-footer">
					<div>{{ t('battle.ready') }}</div>
				</div>
			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#pc-create-battle-dialog {
	width: 100%;

	.van-overlay {
		z-index: 200 !important;
		display: flex;

		.create-container {
			border-radius: 4px;
			background: #171a30;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 750px;
			height: 780px;
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

						.price {
							padding-top: 3px;
							font-size: 16px;

						}

						.icon {
							font-size: 18px !important;
							margin-left: 3px;
							margin-right: 3px;
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
				.search-container {
					border-top: 2px solid #131730;
					border-bottom: 2px solid #131730;
					background: #171a30;
					width: 750px;
					height: 55px;
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

						.search-item {
							// line-height: 54px;
							margin: 0px 20px;
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

				.goods-list {
					width: 100%;
					// display: grid;
					// grid-template-columns: repeat(auto-fill, 170px);
					// grid-template-rows: repeat(auto-fill, 225px);
					// column-gap: 12px;
					// row-gap: 12px;
					padding: 15px;
					box-sizing: border-box;
					height: 550px;
					overflow-y: scroll;
					display: flex;
					flex-wrap: wrap;
					gap: 12px;

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
							color: #75dc9e;
							font-size: 14px !important;

							span:first-child {
								font-size: 12px !important;
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
