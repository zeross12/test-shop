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
		path: "/m/openbox",
		query: {
			boxId: value.boxId,
			type: "ammon",
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
	<div id="Ammonhome" v-if="store.state.moduleAmmonBox">
		<div class="home-list" v-for="(item, index) in homoBox" :key="index">
			<div class="title" v-if="item.boxItems && item.boxItems.length > 0">
				{{ item.name }}
			</div>
			<div class="tab-list">
				<div
					class="tab-item"
					v-for="value in item.boxItems"
					@click="openBox(value)"
					:key="value.boxId"
				>
					<lazy-component>
						<div class="hot" v-show="value.labelUrl">
							<img :src="value.labelUrl" alt="" />
						</div>
						<div
							class="item-pic"
							:style="'background-image: url(' + value.imageUrl + ');'"
						>
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

<style lang="scss">
#Ammonhome {
	width: 100%;
	padding: 0 20px;
	box-sizing: border-box;
	min-height: 800px;
	overflow: hidden;

	.home-list {
		.title {
			margin-top: 30px;
		}

		.spring-title {
			width: 452px;
			height: 103px;
			margin: 0 auto 20px;
			background: url(@/assets/romimg/spring/title_bg.png) no-repeat center;
			background-size: contain;
			line-height: 146px;
			text-align: center;
			color: #fff;

			font-size: 40px;
		}

		.tab-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;

			.tab-item {
				width: 350px;
				margin-top: 40px;
				position: relative;

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

				.item-pic {
					width: 100%;
					height: 260px;
					display: flex;
					justify-content: center;
					align-items: center;
					background-position: center;
					background-size: cover;
					background-repeat: no-repeat;
					z-index: 3 !important;

					img {
						max-width: 100%;
						max-height: 100%;
						margin-top: -70px;
					}
				}

				.item-price {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-top: 10px;
					color: #7ae6a6;
					font-size: 32px;
					font-weight: bold;

					.price {
						display: flex;
						justify-content: center;
						align-items: center;
						margin: 0 4px;

						img {
							width: 58px;
							height: 58px;
							margin-bottom: 5px;
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

.balloon {
	position: absolute;
	width: 140px;
	height: 140px;
	left: -15px;
	top: 52px;
	z-index: 2px !important;

	img {
		width: 100%;
		height: 100%;
	}
}
</style>
