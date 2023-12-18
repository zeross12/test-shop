<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import weaponListCpt from '@/components/h5/weaponListCpt/Index.vue'
import { onMounted, ref } from 'vue';
import { getBlindBoxGoods } from "@/network/api/blind";
import { useRoute } from 'vue-router';
import { add, bignumber } from 'mathjs';
import { useStore } from 'vuex';

const route = useRoute();
const boxName = ref('');
const boxId = ref(0);
const store = useStore();

const goodsList = ref([]);

//爆率数据
const rarityList = ref([
	{
		icon: new URL('../../../assets/romimg/openbox/baolv1.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv2.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv3.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv4.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv5.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv6.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/romimg/openbox/baolv7.png', import.meta.url).href,
		probability: 0
	},
]);

onMounted(() => {
	let data = JSON.parse(decodeURIComponent(route.query.boxData));
	// let data = store.state.clickBattleBoxData;
	boxId.value = data.boxId;
	boxName.value = data.boxName;

	getBoxGoods();
})

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
	<div id="battle-box-detail">
		<div class="title">
			{{ boxName }}
		</div>
		<div class="probability_main">
			<div class="probability_item" v-for="(item, index) in rarityList" :key="index">
				<img :src="item.icon" alt="">
				<p>{{ item.probability }}%</p>
			</div>
		</div>

		<weaponListCpt :list="goodsList"></weaponListCpt>
	</div>
</template>
		
<style lang="scss">
#battle-box-detail {
	display: flex;
	align-items: center;
	flex-direction: column;
	box-sizing: border-box;
	width: 750px;
	min-height: 1200px;
	padding-top: 28px;
	padding-bottom: 30px;

	.title {
		margin-top: 20px;
		font-size: 28px;
	}

	.probability_main {
		display: flex;
		align-items: center;
		justify-content: space-around;
		flex-direction: row-reverse;
		margin: 15px auto 0px;
		background: url(@/assets/romimg/openbox/baolv_bg.png) no-repeat center;
		background-size: contain;
		width: 719px;
		height: 53px;
		color: #fff;
		flex-wrap: wrap;

		.probability_item {
			display: flex;
			align-items: center;
			justify-content: center;

			img {
				width: 17px;
				height: 17px;
			}

			p {
				font-size: 16px;
				margin-left: 5px;
			}

			&:first-of-type {
				margin-left: 8px;
			}

			&:last-of-type {
				margin-right: 8px;
			}
		}
	}

	.weapon-item {
		background-position: center;
		background-repeat: no-repeat;
		background-size: 100% 100%;
	}
}
</style>