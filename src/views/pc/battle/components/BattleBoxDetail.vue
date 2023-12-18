<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getBlindBoxGoods } from '@/network/api/blind'
import { getGoodsNamePre, getGoodsNameSec } from '@/util/common';
import { GoodImageBgType } from '@/util/util'
import { add, bignumber } from 'mathjs';

const store = useStore();
const router = useRouter();

const props = defineProps(['item'])
const emit = defineEmits(['close-box-detail'])

onMounted(() => {
	// window.$dev && console.log( 'hello' )
	getBoxGoods(props.item)
})

const goodsList = ref([])

const curBox = ref({})
const showBoxDetail = ref(false)

watch(props, val => {
	// window.$dev && console.log( val )
	getBoxGoods(val.item)
})

//爆率数据
const rarityList = ref([
	{
		icon: new URL('@/assets/pcimg/openbox/baolv1.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv2.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv3.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv4.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv5.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv6.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('@/assets/pcimg/openbox/baolv7.png', import.meta.url).href,
		probability: 0
	},
]);
async function getBoxGoods(item) {
	let boxId = item.boxId
	curBox.value = item
	// window.$dev && console.log( curBox.value )
	const res = await getBlindBoxGoods({ boxId: boxId });
	showBoxDetail.value = true
	if (res.code === 0) {
		goodsList.value = res.data.items;

		for (let index = 0; index < rarityList.value.length; index++) {
			let rarityItem = rarityList.value[index];
			rarityItem.probability = 0;
		}
		for (let item of goodsList.value) {
			rarityList.value[item.goodsLevel - 1].probability = add(bignumber(rarityList.value[item.goodsLevel - 1].probability),
				bignumber(item.probability));
		}

	}
}

function closeBoxDetail() {
	// curBox.value = {}
	// goodsList.value = []
	emit('close-box-detail')
	// showBoxDetail.value = false

}
function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}
</script>
<template>
	<div class="pc-box-detail-info">
		<div class="close-detail-info-btn" @click="closeBoxDetail"><img src="@/assets/pcimg/battle/close.png"></div>
		<div class="box-detail-header">
			<div class="box-name">{{ curBox.name }}</div>
			<div class="box-control">
				<!-- <div class="control-item left"></div> -->
				<div class="box-price"><img src="@/assets/pcimg/common/coin.png">
					{{ curBox.price }}&nbsp;
					<p v-if="Number(curBox.price) < Number(curBox.originalPrice)">{{ curBox.originalPrice }}</p>
				</div>

				<!-- <div class="control-item right"></div> -->
			</div>
			<div class="box-detail-icon">
				<div class="case_pic" :style="'background-image: url(' + curBox.imageUrl + ');'">
					<img :src="curBox.weaponImageUrl" alt="" />
				</div>
			</div>
		</div>
		<div class="box-open-prec-container">
			<div class="box-open-prec">
				<template v-for="(item, index) in rarityList" :key="index">
					<div class="probability_item" v-if="item.probability != 0">
						<div>
							<img :src="item.icon" alt="">
							<p>{{ item.probability }}%</p>
						</div>
					</div>
				</template>
			</div>
		</div>
		<div class="box-items">
			<div class="box-item">
				<div class="pc-weapon-list">
					<div class="weapon-item" v-for="(item, index) in goodsList" :key="index" @click="onClickGoodsItem(item)"
						:style="'background-image: url(' + getImageBg(item) + ');'">
						<div class="weapon-item-pic">
							<img :src="item.iconUrl" :alt="item.goodsName">
						</div>
						<div class="item-info">
							<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
							<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
						</div>
						<div class="price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{
							item.price }} </div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="scss">
.pc-box-detail-info {
	display: flex;
	position: fixed;
	width: 464px;
	height: 100%;
	right: 0;
	top: 0;
	flex-direction: column;
	background-image: linear-gradient(187deg, #171A2F 42.39%, #171A2F 100.32%);
	z-index: 200;

	.close-detail-info-btn {
		position: absolute;
		left: 14px;
		top: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 27px;
		height: 27px;
		// color: rgba( 255, 255, 255, .7 );
		background: rgba(255, 255, 255, .05);
		border-radius: 3px;
	}

	.box-detail-header {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 453px;
		background-image: url(@/assets/pcimg/battle/box-detail-header-bg.png );

		.box-name {
			font-size: 25px;
			color: #fff;
			width: 100%;
			display: flex;
			justify-content: center;
			padding: 0px 0 16px 0;
		}

		.box-control {
			display: flex;
			width: 100%;

			.box-price {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				font-size: 16px;
				color: #fff;

				img {
					width: 18px;
					margin-right: 6px;
				}

				p {
					color: #5E5E5E;

					font-size: 16px;
					font-style: normal;
					font-weight: 700;
					line-height: 14px;
					text-decoration-line: strikethrough;
					text-transform: uppercase;
					text-decoration: line-through solid;
					// padding: 0 8px;														
				}
			}
		}

		.box-detail-icon {
			width: 280px;
			height: 250px;
			display: flex;
			justify-content: center;
			align-items: center;

			.case_pic {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				height: 100%;
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
		}
	}

	.box-open-prec-container {
		width: 100%;
		justify-content: center;
		display: flex;
		padding: 0 21px;
		box-sizing: border-box;

		.box-open-prec {
			// width: 411px;
			width: 100%;
			border: 1px solid #1E2138;
			background: #1E2138;
			display: flex;
			justify-content: center;
			box-sizing: border-box;
			gap: 0 24px;
			flex-wrap: wrap;

			.probability_item {

				// flex: 1;
				// width: 40px;
				div {
					height: 41px;
					display: flex;
					align-items: center;
					gap: 5px;
					flex: 1;

					p {
						color: #B0C3D8;
					}
				}
			}
		}
	}

	.box-items {
		padding: 21px;
		overflow: hidden;
		overflow-y: scroll;
		height: calc(100% - 483px - 41px - 16px);

		.pc-weapon-list {
			// display: grid;
			// grid-template-columns: repeat(auto-fill, 205px);
			// grid-template-rows: repeat(auto-fill, 205px);
			// column-gap: 0px;
			// row-gap: 0px;
			box-sizing: border-box;
			width: 100%;
			display: flex;
			gap: 10px;
			flex-wrap: wrap;
			// margin-bottom: 20px;
			// justify-content: space-between;

			.weapon-item {
				position: relative;
				width: 202px;
				height: 205px;
				background-size: cover;
				background-position: center;
				background-repeat: no-repeat;
				border: 1px solid #1E2138;
				box-sizing: border-box;

				.weapon-item-pic {
					width: 120px;
					height: 120px;
					display: flex;
					justify-content: center;
					align-items: center;
					margin: 20px auto 0;

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

				.price {
					display: flex;
					align-items: center;
					color: #7BDCA2;

					font-size: 13px;
					font-weight: 700;
					position: absolute;
					right: 20px;
					top: 25px;

				}

			}
		}
	}
}
</style>