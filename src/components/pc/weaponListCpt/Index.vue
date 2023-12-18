<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from 'vue';
import { truncation, getGoodsLevelColor, getGoodsNamePre, getGoodsNameSec } from '@/util/common';
import { useStore } from 'vuex';
import { GoodImageBgType } from '@/util/util'

const store = useStore();
const props = defineProps(['list', 'showBaolv']);
const itemIndex = ref(-1);
const activeIndex = ref(-1);

function showProbability(index) {
	if (itemIndex.value == index) {
		itemIndex.value = -1
	} else {
		itemIndex.value = index
	}
}

// //颜色--
// function getColor(v) {
//	 return 'color:' + getGoodsLevelColor(v)
// }
function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

function toactiveIndex(index) {
	window.$dev && console.log(index)
	if (index == activeIndex.value) {
		activeIndex.value = -1
	} else {
		activeIndex.value = index
	}
}
</script>
		
<template>
	<div id="pc-weaponListCpt">
		<div class="pc-weapon-list">
			<div class="weapon-item" v-for="(item, index) in list" :key="index"
				:style="'background-image: url(' + getImageBg(item) + ');'">
				<div class="weapon-item-price" v-if="!item.probability && false">
					<img src="@/assets/pcimg/common/coin.png" alt="">
					<div class="price">
						{{ item.price }}
					</div>
				</div>
				<div class="weapon-price" v-else><img src="@/assets/pcimg/common/coin.png" alt=""> {{ item.price }}</div>
				<div class="weapon-info" v-if="false">
					<div class="weapon-item-price"><img src="@/assets/pcimg/common/coin.png" alt="">{{ item.price }}</div>
					<div v-if="showBaolv" class="rate" @click="showProbability(index)">{{ truncation(item.probability) }}%
					</div>
				</div>
				<div class="weapon-item-pic">
					<img :src="item.iconUrl" :alt="item.goodsName">
				</div>
				<div class="item-info">
					<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
					<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
				</div>
				<div v-if="false" class="weapon-item-name hide" @click.stop="toactiveIndex(index)">{{ item.goodsName }}
				</div>
				<div v-if="false" class="weapon-all-name" :class="{ 'active': activeIndex == index }">{{ item.goodsName }}
				</div>

				<div class="text" v-if="item.probability && false" :class="{ 'show': itemIndex == index }">{{
					item.probability }}%
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
#pc-weaponListCpt {
	background-color: #15172C;

	.pc-weapon-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 0;
		// display: grid;
		// grid-template-columns: repeat(auto-fill, 201px);
		// grid-template-rows: repeat(auto-fill, 205px);
		// column-gap: 0px;
		// row-gap: 0px;
		box-sizing: border-box;
		max-width: 1414px;
		width: 100%;
		margin-bottom: 20px;
		// justify-content: space-between;

		.weapon-item {
			position: relative;
			min-width: 180px;
			width: calc( 100% / 7 );
			height: 205px;
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			border: 1px solid #1E2138;
			box-sizing: border-box;
			// margin-left: -1px;
			margin-top: -1px;
			// margin-right: 25px;
			// margin-top: 20px;

			// &:nth-child(6n) {
			//	 margin-right: 0;
			// }

			.weapon-item-pic {
				width: 120px;
				height: 120px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 30px auto 0;

				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			.item-info {
				display: flex;
				flex-direction: column;
				position: absolute;
				bottom: 22px;
				left: 20px;

				.item-info1 {
					font-size: 12px;
					color: #CBCCD6;
				}

				.item-info2 {
					font-size: 12px;
					color: #fff;
					font-weight: bold;
					margin-top: 3px;
				}
			}

			.weapon-item-name {
				text-align: center;
				padding: 0 10px;
				box-sizing: border-box;
				color: #fff;
				font-weight: bold;
				font-size: 16px;
			}

			.weapon-all-name {
				left: 0px;
				bottom: -35px;
				width: 100%;
				text-align: center;
				background: #353748;
				position: absolute;
				color: #fff;
				line-height: 40px;
				font-size: 16px;
				padding: 0 20px;
				border-radius: 8px;
				z-index: 9;
				box-sizing: border-box;
				display: none;

				&.active {
					display: block;
				}

				&::after {
					display: block;
					content: '';
					width: 33px;
					height: 27px;
					background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
					background-size: contain;
					position: absolute;
					left: 50%;
					top: -20px;
					transform: translateX(-50%);
				}
			}

			.weapon-price
			{
				display: flex;
				position: absolute;
				top: 28px;
				right: 28px;
				align-items: center;
				line-height: 16px;
				color: #7BDCA2;

				img
				{
					width: 16px;
					margin-right: 6px;
				}
			}

			.weapon-item-price {
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				color: #FBFA02;
				font-size: 20px;
				margin-top: 30px;

				.price {
					margin-top: 10px;
				}

				img {
					width: 31px;
					height: 31px;
				}
			}

			.weapon-info {
				display: flex;
				align-items: center;
				justify-content: space-around;
				margin-top: 15px;

				.weapon-item-price {
					margin-top: 0;
				}

				.rate {
					font-size: 18px;
				}
			}

			.join-user-wrap {
				.join-user-price {
					display: flex;
					justify-content: center;
					align-items: center;
					color: #FBFA02;
					font-size: 20px;

					img {
						width: 28px;
						height: 28px;
					}
				}

				.join-user-info {
					display: flex;
					justify-content: center;
					align-items: center;
					color: #fff;
					font-size: 20px;
					margin-top: 30px;

					p {
						max-width: 130px;
					}
				}
			}

			.text {
				position: absolute;
				left: 100px;
				bottom: 60px;
				height: 40px;
				background: #353748;
				color: #fff;
				line-height: 40px;
				font-size: 16px;
				padding: 0 20px;
				border-radius: 8px;
				white-space: nowrap;
				z-index: 2;
				box-sizing: border-box;
				min-width: 100px;
				display: none;

				&::after {
					display: block;
					content: "";
					width: 33px;
					height: 27px;
					background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
					background-size: contain;
					position: absolute;
					left: 40px;
					top: 30px;
					transform: rotate(180deg);
				}

				&.show {
					display: block;
				}
			}

			&:nth-child(6n) {
				margin-right: 0;

				.text {
					left: auto;
					right: 10px;

					&::after {
						left: auto;
						right: 40px;
					}
				}
			}

			&:nth-child(6n - 1) {
				.text {
					left: 50%;
					transform: translateX(-1%);

					&::after {
						left: 40px;
					}
				}
			}
		}
	}

}</style>