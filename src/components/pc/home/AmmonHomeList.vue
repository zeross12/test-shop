<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { getAmmonList } from "@/network/api/blind";
import { onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();

const homoBox = ref([]);

function openBox(value) {
	router.push({
		path: "/p/openbox",
		query: {
			boxId: value.boxId,
			type: 'ammon'
		},
	});
}

async function getBox() {
	const res = await getAmmonList();
	if (res.code === 0) {
		let items = res.data.items;
		for (let i = 0; i < items.length; i++) {
			let boxItems = items[i].boxItems;
			if (boxItems && boxItems.length > 0) {
				boxItems.sort((a, b) => a.sort - b.sort);
			}
		}
		homoBox.value = items;
	}
}

onMounted(() => {
	getBox();
});
</script>

<template>
	<div id="pc-ammon-home" v-if="store.state.moduleBlindBox">
		<div class="home-list" v-for="(item, index) in homoBox" :key="index">
			<div class="title" v-if="item.boxItems && item.boxItems.length > 0">
				{{ item.name }}
			</div>
			<div class="tab-list" v-if="item.boxItems && item.boxItems.length > 0">
				<div class="tab-item" v-for="value in item.boxItems" @click="openBox(value)" :key="value.boxId">
					<lazy-component>
						<div class="hot" v-show="value.labelUrl">
							<img :src="value.labelUrl" alt="" />
						</div>
						<div class="pc-item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
							<img :src="value.weaponImageUrl" :alt="value.name" />
						</div>
						<div class="item-price">
							<div class="price">
								<img src="@/assets/romimg/common/danyao.png" alt="" />{{
									value.price
								}}
							</div>
						</div>
						<div class="item-name">{{ value.name }}</div>
					</lazy-component>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#pc-ammon-home {
	padding: 0 20px;
	box-sizing: border-box;
	width: 1500px;
	overflow: hidden;
	min-height: 500px;

	.home-list {

		.title {
			margin-top: 30px;
		}

		.tab-list {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			margin-bottom: 30px;
			margin-top: 50px;

			.tab-item {
				width: 285px;
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				cursor: pointer;
				margin-bottom: 50px;

				.hot {
					position: absolute;
					top: 0px;
					right: 36px;
					width: 51px;
					height: 99px;
					transform: translateY(-10px);

					img {
						width: 100%;
					}
				}

				.pc-item-pic {
					width: 250px;
					height: 220px;
					display: flex;
					justify-content: center;
					align-items: center;
					background-position: center;
					background-size: contain;
					background-repeat: no-repeat;
					z-index: 3 !important;

					img {
						max-width: 100%;
						max-height: 100%;
						margin-top: -70px;
						transition: all 0.2s;

						&:hover {
							transform: scale(1.3);
						}
					}
				}

				.item-price {
					display: flex;
					justify-content: center;
					align-items: center;
					color: #7AE6A6;
					font-size: 26px;
					font-weight: bold;

					.price {
						display: flex;
						justify-content: center;
						align-items: center;
						margin: 0 4px;


						img {
							width: 58px;
							height: 58px;
						}
					}
				}

				.item-name {
					text-align: center;
					font-size: 26px;
					color: #fff;
					font-weight: bold;
				}
			}
		}
	}
}
</style>
