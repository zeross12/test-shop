<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import weaponListCpt from '@/components/pc/weaponListCpt/Index.vue'
import { onMounted, ref } from 'vue';
import { getBlindBoxGoods } from "@/network/api/blind";
import { useRoute, useRouter } from 'vue-router';
import { add, bignumber } from 'mathjs';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const boxName = ref('');
const boxId = ref(0);
const store = useStore();

const goodsList = ref([]);

//爆率数据
const rarityList = ref([
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv1.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv2.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv3.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv4.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv5.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv6.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv7.png', import.meta.url).href,
		probability: 0
	},
]);


onMounted(() => {
	// let data = JSON.parse(route.query.boxData);
	let data = store.state.clickBattleBoxData;
	boxId.value = data.boxId;
	boxName.value = data.boxName;

	getBoxGoods();
})

function onClickBack() {
	router.back();
}

async function getBoxGoods() {
	const res = await getBlindBoxGoods({ boxId: Number(boxId.value) });
	if (res.code === 0) {
		goodsList.value = res.data.items;

		for (let item of goodsList.value) {
			rarityList.value[item.goodsLevel - 1].probability = add(bignumber(rarityList.value[item.goodsLevel - 1].probability),
				bignumber(item.probability));
		}

	}
}
</script>
		
<template>
	<div id="pc-battle-box-detail">
		<div class="opt" @click="onClickBack">
			<img src="@/assets/pcimg/common/back.png" alt="" />{{ t( 'common.back' ) }}
		</div>
		<div class="htitle">
			{{ boxName }}
		</div>
		<div class="presentation">
		<div class="probability_main">
			<div class="probability_item" v-for="(item, index) in rarityList" :key="index">
				<div v-if="item.probability != 0">
					<img :src="item.icon" alt="">
					<p>{{ item.probability }}%</p>
				</div>
			</div>
		</div>
	</div>
		<weaponListCpt :list="goodsList"></weaponListCpt>
	</div>
</template>
		
<style lang="scss">
#pc-battle-box-detail {
	display: flex;
	align-items: center;
	flex-direction: column;
	box-sizing: border-box;
	width: 1412px;
	margin: 0 auto;
	min-height: 1200px;
	padding-top: 28px;
	padding-bottom: 30px;
	position: relative;
	color: #fff;

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
		color: #fff;
		position: absolute;
		right: 0;

		img {
			width: 17px;
			height: 17px;
			margin-right: 15px;
		}
	}

	.htitle {
		margin-top: 20px;
		font-size: 28px;
	}

	.presentation {
 
		box-sizing: border-box;
		margin-top: 30px;
		margin-bottom: 30px;

		.probability_main {
			display: flex;
			align-items: center;
			flex-direction: row-reverse;
			border: 1px solid #313350;
			padding: 15px 20px;

			.probability_item {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 18px;

				div
				{
					display: flex;
					align-items: center;
					
					img {
						width: 14px;
						height: 14px;
					}

					p {
						font-size: 13px;
						font-weight: 500;
						margin-left: 5px;
					}

				}

			}
		}
	}

}
</style>