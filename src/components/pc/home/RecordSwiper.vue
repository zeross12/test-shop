<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "../head/HeadPortrait.vue";
// import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper/modules";
import "swiper/less/autoplay";
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
// import { getOpenBoxRecords } from "@/network/api/blind";
import { getAllOpenBoxRecords } from '@/network/api/index'
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import { tokenName } from "@/config";
import { re } from "mathjs";
components: {
	HeadPortrait;
}

const swiperModules = [Autoplay];
const router = useRouter();
const route = useRoute();
const store = useStore();

const openRecord = ref([]);

const playRecord = ref(true)
const stopRecord = ref(false)	///	鼠标经过时停止
const swiperRecord = ref(null);
const swiperKey = ref(1);

const tmpArr = ref([])
const trans = ref(false)
const lists = ref([])
const random1 = ref(0)
const random2 = ref(0)

const limitNum = ref(25)

/// first req flag
const init = ref(true)
/// 当前步进
const step = ref(0)

///	记录类型 1.所有盲盒 2.物品价值1000以上的盲盒
const recordType = ref(1)

///	上次请求的最后一个ID
const lastId = ref(0)

///	计时器
const timer = ref(null)
const timeout = ref(null)

///	价值背景色数组
const bgcolors = ref([
	'lightblue', 'yellow', 'purple', 'pink', 'grey', 'blue'

])

/**
 * 复制对象
 * @param obj Object
 * @returns Object
 */
function copy(obj) {
	let res = obj instanceof Array ? [] : {};
	for (const [key, value] of Object.entries(obj)) {
		res[key] = typeof value === "object" ? copy(value) : value;
	}
	return res
}

function splitData(start, length) {
	let arr = copy(openRecord.value)
	return arr.splice(start, length)
}

function anim() {
	if (!playRecord.value || stopRecord.value) return

	random1.value = step.value
	random2.value = getRandomInt(5)

	let arr = splitData(random1.value, random2.value)
	if (lists.value.length >= limitNum.value) {
		lists.value.splice(0, random2.value)
	}

	init.value = false
	setTimeout(() => lists.value.push(...arr), 100)
	// let arr = copy( openRecord.value )

	// tmpArr.value = arr.splice( random1.value, random2.value )

	// lists.value.splice( openRecord.value.length - random2.value, 0 - random2.value )
	// lists.value.push( ...tmpArr.value )

	/// 如果动画全部轮训完
	if (random2.value + random1.value > limitNum.value) {
		random2.value = random2.value - random1.value
		step.value = 0
		getBoxRecord()
	}
	else {
		step.value = step.value + random2.value
	}
}

/// 生成随机数
function getRandomInt(max) {
	let num = Math.floor(Math.random() * max)
	return num < 0 ? getRandomInt(max) : num
}

async function getBoxRecord(limit) {
	let params =
	{
		limit: typeof limit === 'undefined' ? limitNum.value : limit,
		recordType: recordType.value
	}
	const res = await getAllOpenBoxRecords(params)
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			openRecord.value = copy(items)

			if (init.value)
				lists.value = openRecord.value

			// window.$dev && console.log( items[0].id, lastId.value )
			///	通过最新的id判断是否进行动画
			if (items.length > 0) {
				if (items[0].id != lastId.value) {
					lastId.value = items[0].id
					playRecord.value = true

					if (!timer.value)
						timer.value = setInterval(anim, 1000)
					return
				}
			}

			playRecord.value = false
			clearInterval(timer.value)
			timer.value = null
			timeout.value = setTimeout(getBoxRecord, 5000)
		}
	}
}


///	盲盒类型
// 1	盲盒
// 2	对战
// 3	等级
// 4	时间
// 5	推广
// 6	弹壳
// const boxType
function onClickItem(item) {
	// let path = '/p/openbox'
	switch (item.boxType) {
		case 1:
			router.push({
				path: "/p/openbox",
				query: {
					boxId: item.boxId,
				},
			});
			break

		case 2:
			router.push({
				path: "/p/battleDetail",
				query: {
					id: item.id,
					status: 3
				}
			})
			break
	}
	//	 router.push({
	//	 path: "/p/openbox",
	//	 query: {
	//		 boxId: item.boxId,
	//	 },
	//	 });
}

function handleSwiper(swp) {
	swiperRecord.value = swp;
}

function onClickSwitch() {
	playRecord.value = !playRecord.value;
	// if (playRecord.value) {
	//	 swiperRecord.value.autoplay.start();
	// } else {
	//	 swiperRecord.value.autoplay.stop();
	// }
}

function onMouseenter() {
	stopRecord.value = true
}

function onMouseleave() {
	stopRecord.value = false
}

function onClickRed() {
	store.commit("setPassRed", true);
}

function onClickGroup() {
	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert(t('menu.browserNotSupport'));
	} else {
		let item = store.state.otherConfig.qqGroup[0];
		let qqGroupLink = item || store.getters.getConfigItem("GroupChatUrl");
		window.open(qqGroupLink);
	}
}

function onClickService() {
	if (localStorage.getItem(tokenName)) {
		let channelId = store.getters.getConfigItem("CustomerServiceUrl") || "A12fdC";

		if (!window._AIHECONG) {
			(function (d, w, c) {
				if (w[c]) return;
				var s = d.createElement("script");
				w[c] = function () {
					(w[c].z = w[c].z || []).push(arguments);
				};
				s.async = true;
				s.src = "https://static.ahc.ink/hecong.js";
				if (d.head) d.head.appendChild(s);
			})(document, window, "_AIHECONG");

			_AIHECONG("ini", {
				channelId: channelId,
				uniqueId: `199skins${store.state.userInfoBase.account}`,
				button: false,
			});
			_AIHECONG("customer", {
				名称: store.state.userInfoBase.nickName,
				手机: store.state.userInfoBase.mobile,
				终端: "MODILE",
				会员账号: store.state.userInfoBase.account,
			});
			_AIHECONG("showChat");
		} else {
			_AIHECONG("showChat");
		}
	} else {
		store.commit("setSignView", true);
	}
}

function getImageBg(item) {
	console.log(store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel));
	console.log("================================================================");
	return store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel);
}

const isHide = ref(false)
onMounted(() => {
	// window.$dev && console.log( route.name )
	if (route.name == 'p_activity')
		return isHide.value = true

	isHide.value = false
	getBoxRecord()
});

// watch(route, (newRoute, oldRoute) => {
// 	if( newRoute.name == 'p_activity' )
// 		isHide.value = true
// 	else
// 		isHide.value = false

// 	getBoxRecord()
// });

watch(recordType, val => {
	init.value = true
	lastId.value = 0
	clearTimeout(timeout.value)
	clearInterval(timer.value)
	timer.value = null

	random1.value = 0
	random2.value = 0
	step.value = 0

	openRecord.value = []
	lists.value = []

	recordType.value = val

	getBoxRecord()
})
</script>

<template>
	<div id="pc-recordswiper" v-show="!isHide">
		<div class="opt-wrap">
			<div class="live-wrap">
				<div class="live-opt">

					<div class="live-action" @click="onClickSwitch">
						<svg class="icon-pause" v-if="!playRecord">
							<use xlink:href="@/assets/icon.svg#play" ng-href="@/assets/icon.svg#play" class="ng-scope">
							</use>
						</svg>

						<svg class="icon-pause" v-else xmlns="http://www.w3.org/2000/svg" width="16" height="17"
							viewBox="0 0 16 17" fill="none">
							<circle cx="8" cy="8.5" r="8" fill="#EB4C4B" />
						</svg>
						<div class="opt-bg"> </div>
					</div>
				</div>

				<div class="live-txt">{{ t('menu.droppedBoxesTitle') }}</div>
			</div>
			<!-- <div class="btn-wrap"> -->
			<!-- <div class="btn-red new-btns" @click="onClickRed">
					<div><img src="@/assets/pcimg/home/lv-opt-1.png" alt="" /></div>
					<div>{{ t('menu.redPack') }}</div>
				</div> -->
			<!-- <div @click="onClickGroup" class="new-btns"> 
					<div><img src="@/assets/pcimg/home/lv-opt-2.png" alt="" /></div>
					<div>{{ t( 'redpack.groupChat' ) }}</div>
				</div> -->
			<!-- <div @click="onClickService" class="new-btns">
					<div><img src="@/assets/pcimg/home/lv-opt-3.png" alt="" /></div>
					<div>{{ t( 'redpack.service' ) }}</div>
				</div> -->

			<!-- </div> -->
		</div>
		<div class="swiper-container" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
			<div class="sub-container">
				<div :class="['swiper-slide', init ? 'init-node' : '']" v-for="( item, index ) in lists" :key="index"
					:style="{ order: 0 - index }">
					<img :src="getImageBg(item)" class="item-bgimg">
					<div class="swiper-item" @click="onClickItem(item)">
						<div class="swiper-pic">
							<img :src="item.iconUrl" :alt="item.goodsName" class="item" />
						</div>
						<div class="item-info">
							<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
							<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
						</div>
						<div class="box-item" @click="onClickItem(item)">
							<img :src="item.imageUrl" class="box">
							<img :src="item.avater" class="user-pic">
							<div class="nickname">{{ item.nickName }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="separate" style="margin-top: 16px;"></div>
</template>

<style lang="scss" scoped>
#pc-recordswiper {
	display: flex;
	width: 100%;
	position: relative;
	margin-top: 16px;

	// @media screen and (max-width: 768px) {
	// 	margin-top: 90px;
	// }

	.opt-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 143px;



		.live-wrap {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			// width: 100%;
			// height: 100%;
			padding: 0 24px;
			gap: 8px;

			.live-txt {
				font-family: Archivo;
				font-size: 18px;
				font-weight: 700;
				color: white;
				text-transform: uppercase;
			}

			.live-opt {}

			.live-action {
				width: 16px;
				height: 16px;
				position: relative;
				bottom: 16px;

				svg {
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					width: 100%;
					height: 100%;
					font-size: 10px;
					color: #4b4e68;
					position: relative;
				}

				.opt-bg {
					position: absolute;
					top: 50%;
					left: 50%;
					width: 122px;
					height: 122px;
					transform: translate(-50%, -50%);
					opacity: 0.20;
					background: #EB4C4B;
					box-shadow: 24px 24px 24px;
					border-radius: 9999px;
					filter: blur(24px);
				}
			}
		}

		.btn-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			color: #FFFEFE;
			font-size: 15px;
			margin-top: 10px;
			gap: 12px;

			// .btn-red {
			//	 cursor: pointer;
			//	 display: flex;
			//	 flex-direction: column;
			//	 align-items: center;

			//	 div {
			//	 display: flex;
			//	 align-items: center;
			//	 justify-content: center;
			//	 height: 40px;
			//	 margin-bottom: 2px;

			//	 img {
			//		 width: 40px;
			//		 height: 28px;

			//	 }
			//	 }

			// }

			.new-btns {
				// margin-left: 12px;
				// cursor: pointer;
				display: flex;
				// flex-direction: column;
				align-items: center;
				gap: 8px;
				background: #1C203C;
				padding: 0 16px;
				border-radius: 6px;
				height: 46px;
				width: calc(100% - 64px);


				div {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					&:first-child {
						display: flex;
						// border-radius: 50%;
						// width: 40px;
						// height: 40px;
						// background: #1C203C;
						align-items: center;
						justify-content: center;
					}

					&:last-child {
						font-size: 16px;
					}
				}

				img {
					width: 24px;
					// height: 23px;
					// width: 40px;
					// height: 40px;
					// margin-bottom: 2px;
				}
			}
		}
	}

	.swiper-container {
		// flex: 1;
		height: 160px;
		// display: flex;
		width: calc(100% - 196px);
		overflow: hidden;

		.sub-container {
			display: flex;
			gap: 8px;
			// width: calc( 100% - 95px );

			.live-item {
				position: relative;
				flex-shrink: 0;

				.live-link {
					width: 162px;
					height: 162px;
					border-radius: 3px;
					overflow: hidden;
					box-sizing: border-box;
					transition: .5s;

					.loading-skeleton {
						background-color: rgba(0, 0, 0, .2);
						background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .2)), color-stop(rgba(0, 0, 0, .2)), to(rgba(0, 0, 0, .2)));
						background-image: linear-gradient(90deg, rgba(0, 0, 0, .2), rgba(0, 0, 0, .2), rgba(0, 0, 0, .2));
						background-size: 200px 100%;
						background-repeat: no-repeat;
						border-radius: 4px;
						display: inline-block;
						line-height: 1;
						animation: skeleton-animate-wave 1.2s ease-in-out 0s infinite normal none running;
					}

					.live-image-wrapper {
						position: absolute;
						top: 0;
						left: 0;
						display: flex;
						align-items: center;
						justify-content: center;
						width: 100%;
						height: 100%;
						line-height: 1;
					}

					.live-footer {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						padding: 14px;
						box-sizing: border-box;
					}

					&.lightblue {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(98, 195, 236, .4) 0, rgba(58, 172, 197, .316) 31.63%, rgba(22, 67, 77, 0) 100%), #21222b;
					}

					&.yellow {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(238, 177, 58, .6) 0, rgba(198, 114, 15, .474) 31.63%, rgba(81, 55, 17, 0) 100%), #21222b;
					}

					&.purple {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(130, 78, 242, .4) 0, rgba(109, 39, 197, .316) 31.63%, rgba(45, 17, 81, 0) 100%), #21222b;
					}

					&.pink {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(238, 58, 101, .4) 0, rgba(207, 38, 89, .316) 31.63%, rgba(81, 17, 29, 0) 100%), #21222b;
					}

					&.grey {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(191, 198, 201, .4) 0, rgba(169, 175, 176, .316) 31.63%, rgba(67, 75, 77, 0) 100%), #21222b;
					}

					&.blue {
						background: radial-gradient(101.95% 157% at 50% -23%, rgba(58, 86, 238, .4) 0, rgba(15, 44, 198, .316) 31.63%, rgba(26, 17, 81, 0) 100%), #21222b
					}
				}
			}

			.swiper-slide {
				width: 180px;
				height: 160px;
				border-radius: 16px;
				overflow: hidden;
				box-sizing: border-box;
				transition: .5s;
				background: #21222B;

				-webkit-animation: drop-in-data .5s ease-in-out normal forwards;
				animation: drop-in-data .5s ease-in-out normal forwards;
				background-position: center;
				background-size: cover;

				@keyframes drop-in-data {
					0% {
						max-width: 0;
					}

					100% {
						max-width: 100%;
					}
				}

				.item-bgimg {
					position: absolute;
					width: 100%;
					height: 100%;
					left: 0;
					top: 0;
				}

				&.init-node {
					width: 0px;
					transition: 0ms;
					margin-left: -2px;
					animation: none !important;
				}

				.swiper-item {
					display: block;
					width: 100% !important;
					height: 100%;
					background-position: center;
					background-repeat: no-repeat;
					background-size: cover;
					// padding-top: 10px;
					box-sizing: border-box;
					position: relative;
					cursor: pointer;
					overflow: hidden;
					// border: 1px solid red;
					display: flex;
					flex-direction: column;
					align-items: center;

					background: rgba(52, 53, 79, 0.50);

					&:hover {
						background-color: rgba(14, 15, 25, .5);

						.swiper-pic {
							// top: -200px;
							opacity: 0;
						}

						// .item-info
						// {
						// 	bottom: 184px;
						// }

						.box-item {
							top: 0;
						}
					}

					.swiper-pic {
						// transition: .3s;
						top: 12px;
						position: absolute;
						width: 116px;
						height: 116px;
						// margin: 0 auto;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 100%;
							max-height: 100%;
							// filter: drop-shadow(0 10px 3px rgba(0,0,0,.25));
						}
					}

					.item-info {
						opacity: 1;
						transition: .3s;
						display: flex;
						flex-direction: column;
						position: absolute;
						bottom: 16px;
						left: 20px;
						width: calc(100% - 20px * 2);
						z-index: 9;
						text-align: center;

						.item-info1 {
							font-size: 15px;
							font-weight: 400;
							color: #fff;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							width: 100%;
						}

						.item-info2 {
							margin-top: 4px;
							font-size: 12px;
							color: #AEAEAE;
							width: 100%;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					.box-item {
						position: absolute;
						width: 180px;
						height: 160px;
						top: 160px;
						display: flex;
						justify-content: center;
						align-items: center;
						flex-direction: column;
						opacity: 1;
						// padding-bottom: 20px;
						// box-sizing: border-box;
						// transition: .7s ease;

						.box {
							position: absolute;
							// top: -0px;
							margin-bottom: 14px;
							max-width: 110px;
							width: 100%;
							// max-height: 80%;
							filter: saturate(150%);
							// filter: contrast(1);
							opacity: .6;
							z-index: 1;
						}

						.user-pic {
							// position: absolute;
							// left: 25px;
							// bottom: 36px;
							width: 30px;
							height: 30px;
							border-radius: 8px;
							z-index: 2;
							margin-bottom: 4px;
						}

						.nickname {
							// position: absolute;
							// left: 25px;
							// bottom: 14px;
							font-size: 12px;
							color: #fff;
							z-index: 2;
							padding-bottom: 32px;
						}
					}

					.swiper-user-wrap {
						height: 16px;
						display: flex;
						justify-content: center;
						align-items: center;
						margin-top: -1px;

						.user-icon {
							width: 25px;
							height: 25px;
							border-radius: 50%;
						}

						p {
							// max-width: 180px;
							font-size: 12px;
							color: #fff;
							margin-left: 10px;
							padding-top: 2px;
						}
					}
				}
			}
		}
	}

	.swiper-container .swiper-wrapper {
		-webkit-transition-timing-function: linear;
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
	}

	@keyframes blinking {
		0% {
			transform: scale(0);
			opacity: 0;
		}

		100% {
			transform: scale(1);
			opacity: 1;
		}
	}



	@keyframes skeleton-animate-wave {
		0% {
			background-position: -200px 0;
		}

		100% {
			background-position: calc(200px + 100%) 0;
		}
	}

	@media screen and (max-width: 768px) {
		display: flex;
		flex-direction: column;
		align-items: start;

		.opt-wrap {
			width: auto;
			height: auto;
			margin-bottom: 8px;

			.live-wrap {
				padding: 0 16px;

				.live-txt {
					font-size: 16px;
				}

				.live-action {
					bottom: 0;
					display: flex;
					align-items: center;
				}
			}
		}

		.swiper-container {
			width: 100%;
			padding-left: 16px;
			height: auto;

			.sub-container {

				.swiper-slide {
					width: 108px;
					height: 96px;

					.swiper-item {
						.swiper-pic {
							width: 70% !important;
							height: auto !important;
							// top: 0 !important;
						}

						.item-info {
							bottom: 4px;
						}

						.item-info1 {
							font-size: 14px !important;
						}

						.item-info2 {
							font-size: 10px !important;
							margin-top: 0 !important;
						}
					}


				}
			}
		}
	}
}
</style>
