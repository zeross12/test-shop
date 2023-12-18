<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import { truncation, getGoodsLevelColor } from "@/util/common";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import Currency from "@/components/h5/common/Currency.vue";
import fudaiImage from "@/assets/romimg/common/fudai.png";

const store = useStore();
const props = defineProps(["list", "showBaolv", "item_click"]);

// let props = defineProps({
//	 list: { type: Array },
//	 showBaolv: { type: boolean },
// });

// const props = defineProps({
//	 list: {
//		 type: Array,
//	 },
//	 showBaolv: {
//		 type: boolean,

//	 },
// });
const itemIndex = ref(-1);
const activeIndex = ref(-1);

function showProbability(index) {
	if (itemIndex.value == index) {
		itemIndex.value = -1;
	} else {
		itemIndex.value = index;
	}
}

function getImageIcon(item) {
	if (item.goodsType == 2) {
		return fudaiImage;
	} else {
		return item.iconUrl;
	}
}

// //颜色--
// function getColor(v) {
//		 return 'color:' + getGoodsLevelColor(v)
// }
function getImageBg(item) {
	if (item.goodsLevel == 0) {
		return store.getters.getGoodsBgImage(GoodImageBgType.box, 1);
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

function toactiveIndex(index) {
	window.$dev && console.log(index);
	if (index == activeIndex.value) {
		activeIndex.value = -1;
	} else {
		activeIndex.value = index;
	}
}
</script>

<template>
	<div id="weaponListCpt">
		<div class="weapon-list">
			<div
				class="weapon-item"
				v-for="(item, index) in list"
				:key="index"
				:style="'background-image: url(' + getImageBg(item) + ');'"
				@click="item_click(item)"
			>
				<div
					class="weapon-all-name"
					v-if="false"
					:class="{ active: activeIndex == index }"
				>
					{{ item.goodsName }}
				</div>
				<div
					v-if="false"
					class="weapon-item-name hide"
					@click.stop="toactiveIndex(index)"
				>
					{{ item.goodsName }}
				</div>
				<div class="weapon-item-price" v-if="!item.probability">
					<div class="price">
						<Currency :currency="item.price"></Currency>
						<!-- ${{ item.price }} -->
					</div>
				</div>
				<div class="weapon-info" v-else>
					<div class="weapon-item-price">
						<!-- ${{ item.price }} -->
						<Currency :currency="item.price"></Currency>
					</div>
					<div v-if="showBaolv" class="rate" @click="showProbability(index)">
						{{ truncation(item.probability) }}%
					</div>
				</div>
				<div class="weapon-item-pic">
					<!-- <img :src="item.iconUrl" :alt="item.goodsName" /> -->
					<img :src="getImageIcon(item)" :alt="item.goodsName" />
				</div>
				<div
					class="weapon-all-name"
					v-if="false"
					:class="{ active: activeIndex == index }"
				>
					{{ item.goodsName }}
				</div>
				<div class="weapon-item-name hide" @click.stop="toactiveIndex(index)">
					{{ item.goodsName.split("|")[0] }}
				</div>
				<div class="weapon-item-wear hide" @click.stop="toactiveIndex(index)">
					{{ item.goodsName.split("|")[1] }}
				</div>
				<div
					class="text"
					v-if="item.probability"
					:class="{ show: itemIndex == index }"
				>
					{{ item.probability }}%
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#weaponListCpt {
	.weapon-list {
		display: flex;
		flex-wrap: wrap;
		box-sizing: border-box;
		justify-content: space-between;
		width: 100%;
		margin-top: 10px;
		margin-bottom: 20px;
		padding: 0 30px;

		.weapon-item {
			position: relative;
			background: #1b1e38;
			margin-top: 20px;
			width: 335px;
			height: 520px;
			// margin: 10px;
			display: flex;
			flex-direction: column;
			// justify-content: center;
			background-repeat: no-repeat;
			background-position: center center;
			background-size: 335px 520px;
			border-radius: 10px;
			box-sizing: border-box;

			margin-right: 0;
			// &:nth-child(3n) {
			//	 margin-right: 0;
			// }

			.weapon-item-pic {
				width: 259px;
				height: 198px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 30px auto;
				box-sizing: border-box;
				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			.weapon-item-name {
				text-align: center;
				padding: 0 10px;
				box-sizing: border-box;
				font-size: 26px;
				color: rgba(255, 255, 255, 0.6);
				text-align: center;
				line-height: 40px;

				font-style: normal;
				font-weight: 400;
				margin-top: 50px;
			}

			.weapon-item-wear {
				text-align: center;
				padding: 0 10px;
				margin-top: 6px;
				box-sizing: border-box;
				color: #fff;

				line-height: 36px;

				font-size: 26px;
				font-weight: 500;
			}

			.weapon-all-name {
				width: 100%;
				text-align: center;
				color: #4b4d5f;
				line-height: 40px;
				font-size: 24px;
				// margin-top: 40px;
				padding: 20px;
				z-index: 9;
				box-sizing: border-box;
				display: none;

				&.active {
					display: block;
				}

				&::after {
					display: block;
					content: "";
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

			.weapon-item-price {
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				color: #7bdca2;
				// font-weight: 700;
				font-size: 30px;
				margin-top: 40px;

				.price {
					margin-top: 10px;
				}
			}

			.weapon-info {
				display: flex;
				align-items: center;
				justify-content: space-around;
				margin-top: 15px;

				.weapon-item-price {
					margin-top: 25px;
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
					color: #fbfa02;
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

			&:nth-child(3n) {
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

			&:nth-child(3n - 1) {
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
}
</style>
