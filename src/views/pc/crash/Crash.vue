<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { Warn } from '@/util/common'

import CrashList from '@/components/crash/CrashList.vue'

const store = useStore()
const hasLogin = computed(() => store.getters.hasLogin)

///	历史爆点
const historyBoomArr = ref([])
const message = ref(null)

const countToRef = ref(null)

///	爆点记录
const boomPointRecord = ref([])
///	下注倒计时
const betOvertime = ref(0)
///	下注倒计时进度条
const betProgress = ref(100)
///	自己是否加入
const isJoin = ref(false)

///	当前奖池金额
const moneyPool = ref(0)

///	初始下注倍数
const initMultiple = ref(0)

///	加入游戏的用户
const betUsers = ref([])
///	逃跑用户
const escapeUsers = ref([])
///	背包物品加载状态
const myBagLoading = ref(true)
///	自己背包内的物品
const myBagItems = ref([])

///	游戏状态
const gameStatus = ref('GAME_START')
///	过滤奖池内物品的参数
const filter = ref({
	page: 1,
	limit: 18,
	sortType: 1,
	goodsName: '',
	lowPrice: '',
	highPrice: ''
})
///	奖池内物品加载状态
const poolGoodsLoading = ref(true)
///	奖池内的游戏物品
const poolGoods = ref([])
///	当前展示的游戏物品
const curPoolGoods = ref([])

///	当前观看的用户 如果加入了游戏 默认是自己 否则是第一个下注人
const curWatchUser = ref(null)

///	我的下注金额
const myBetMoney = ref(0.1)
///	我当前的金额
const myCurBetMoney = ref(0.00)
///	逃跑倍数
const multiple = ref("")

///	实时爆点
const curBoomPoint = ref(1.00)
///	是否已爆
const isBoom = ref(false)

///	弹窗控制
const showMyBag = ref(false)
const showStore = ref(false)

///	目标物品
const targetGoods = ref(null)
///	下注的物品
const betGoods = ref([])

///	爆点计时器
let boomPointTimer = ref(0)
///	进度定时器
let progressTimer = ref(0)
///	物品请求计时器
let goodsTimer = ref(0)

onMounted(() => {
	start()
})

onUnmounted(() => {
	end()
})

/**
 * 监听用户登陆状态
 * @param boolean hasLogin 使用登陆
 * @param function 回调
 */
watch(hasLogin, val => {
	if (val)
		start()
	else
		end()
})

/**
 * 开始游戏
 */
function start() {
	addEventListener('socket.message', onSocketMessage)
	addEventListener('game.message', onGameMessage)
	ws.send({ cid: 1001, data: JSON.stringify({ gameName: "GAME_CRASH" }) })
	myCurBetMoney.value = myBetMoney.value
	send('GAME_GOODS', filter.value)
}

/**
 * 离开游戏
 */
function end() {
	ws.send({ cid: 1002, data: JSON.stringify({ gameName: 'GAME_CRASH' }) })
}

/**
 * 接收游戏消息
 * @param object e
 */
function onGameMessage(e) {
	let message = e.detail.data
	if (message.result === 0) {
		let cmd = message.strCmd
		let data = JSON.parse(message.data)

		switch (cmd) {
			///	有用户下注
			case 'USER_BET':
				window.$dev && console.log('join >>>>>>>>>>>', data)
				userBet(data)
				break

			///	有用户逃跑
			case 'USER_CRASH':
				window.$dev && console.log('escape >>>>>>>>>', data)
				userEscape(data)
				break

			///	获取游戏奖池的物品
			case 'GAME_GOODS':
				window.$dev && console.log('goods >>>>>>>>>>', data.items)
				poolGoods.value = data.items
				poolGoodsLoading.value = false
				break

			///	获取当前游戏的奖品
			case 'PLAY_GOODS':
				curPoolGoods.value.push(data.goodsItem)
				// if( curPoolGoods.value.length < 1 )
				// {
				// 	curPoolGoods.value = data.items
				// }
				// else
				// {
				// 	curPoolGoods.value.splice( 0, 1 )
				// 	setTimeout( () => curPoolGoods.value.push( data.items[1] ), 500 )
				// }
				break

			///	游戏准备
			case 'GAME_START':
				window.$dev && console.log('start >>>>>>>>>>>', data.gameConfig)

				///	重设数据
				reset(data)

				gameStatus.value = cmd
				progressControl()
				break

			///	游戏开始
			case 'GAME_PLAY':
				///	如果自己没加入游戏,观察者为下注的第一个人
				if (!isJoin.value && betUsers.value.length > 0) {
					curWatchUser.value = betUsers.value[0].betItem
					curWatchUser.value.userId = betUsers.value[0].userItem.userId
				}

				betOvertime.value = 0
				gameStatus.value = cmd

				///	获取游戏池内的物品
				// getPoolGoods( {
				// 	page : 1,
				// 	limit : 100,
				// 	sortType : 2,
				// 	lowPrice : myBetMoney.value.toString(),
				// 	// highPrice : myBetMoney.value *
				// } )

				getCurPoolGoods()
				getCurBoomPoint()

				window.$dev && console.log('play >>>>>>>>>>>>', data)
				break

			///	游戏结束
			case 'GAME_END':
				///	停止物品请求计时器
				clearInterval(goodsTimer)
				curWatchUser.value = null

				gameStatus.value = cmd
				isBoom.value = true
				isJoin.value = false

				///	清除目标物品
				// targetGoods.value = null
				// multiple.value = ''

				///	重置我的下注金额
				// myBetMoney.value = 0.00

				///	更新用户信息
				store.dispatch("getUserInfo")
				getSceneData()
				window.$dev && console.log('end >>>>>>>>>>>>', data)
				break

			///	背包数据
			case 'RUCKSACK_GOODS':
				myBagItems.value = data.items
				window.$dev && console.log('bag >>>>>>>>>>>>', myBagItems.value)
				break

			///	当前场景数据
			case 'SCENE_DATA':
				window.$dev && console.log('scent >>>>>>>>>>', data)
				if (data.gameStatus !== 'undefined') {
					switch (data.gameStatus) {
						case 1:
							gameStatus.value = 'GAME_START'
							break
						case 2:
							gameStatus.value = 'GAME_PLAY'
							break
						case 3:
							gameStatus.value = 'GAME_END'
							break
					}
				}
				boomPointRecord.value = data.gameRecords
				break
		}
	}
	else {
		Warn(message.errMsg)
	}
}

/**
 * 重设数据
 */
function reset(data) {
	///	清除下注用户和逃跑用户
	betUsers.value = []
	escapeUsers.value = []

	moneyPool.value = 0.00

	myCurBetMoney.value = Number(myBetMoney.value)
	curPoolGoods.value = []

	isBoom.value = false
	betProgress.value = 100

	betOvertime.value = data.gameConfig.timeBet
	initMultiple.value = data.gameConfig.initMultiple

	// multiple.value = initMultiple.value
}

/**
 * 获取当前应该显示的武器
 */
function getCurPoolGoods() {
	if (!curWatchUser.value) return

	send('PLAY_GOODS', { userId: curWatchUser.value.userId })

	if (curWatchUser.value)
		goodsTimer = setInterval(() => {
			send('PLAY_GOODS', { userId: curWatchUser.value.userId })
		}, 1000)
}

/**
 * 获取所有游戏物品
 * @param object params
 */
function getPoolGoods(params) {
	send('GAME_GOODS', params)
}

/**
 * 用户下注
 * @param object data 下注信息
 */
function userBet(data) {

	betUsers.value.push(data)
	betUsers.value.sort((a, b) => {
		return Number(b.betItem.betAmount) - Number(a.betItem.betAmount)
	})
	getPoolTotal(data.betItem)
}

/**
 * 用户逃跑消息
 * @param object data 逃跑信息
 */
function userEscape(data) {
	betUsers.value.forEach((item, index) => {
		if (item.userItem.userId == data.userItem.userId) {
			betUsers.value.splice(index, 1)

			if (store.state.userId == data.userItem.userId) {
				clearInterval(goodsTimer)
				isJoin.value = false
			}
		}
	})
	escapeUsers.value.unshift(data)
}

/**
 * 获取奖池总额
 * @param object betItem 下注人的下注信息
 */
function getPoolTotal(betItem) {
	moneyPool.value += betItem.betAmount
	// betUsers.value.forEach( item => {
	// 	moneyPool.value += Number( item.betItem.betAmount )
	// } )
}

/**
 * 获取游戏物品
 */
function getMyGoodsList() {
	let params = {
		page: 1,
		limit: 2
	}
}

/**
 * 下注 / 逃跑 控制
 */
function action() {
	if (!hasLogin.value)
		return Warn(t('crash.needLogin'))

	if (isJoin.value) {
		switch (gameStatus.value) {
			case 'GAME_START': Warn(t('crash.notStarted')); break
			case 'GAME_END': Warn(t('crash.gameover')); break
			case 'GAME_PLAY': escapeFormGame(); break
		}
	}
	else {
		if (gameStatus.value == 'GAME_START') {
			if (myBetMoney.value <= 0) {
				return Warn(t('crash.needChangeMoney'))
			}
			isJoin.value = true
			joinGame()
		}
	}
}

/**
 * 发送游戏命令
 * @param string cmd
 * @param params json
 */
function send(cmd, params) {
	if (!ws.auth) return

	ws.send({
		cid: 1100,
		data: JSON.stringify({
			gameName: 'GAME_CRASH',
			strCmd: cmd,
			data: JSON.stringify(params)
		})
	})
}

/**
 * 从游戏中逃跑
 */
function escapeFormGame() {
	if (multiple.value !== '' || Number(multiple.value) > initMultiple.value) return

	let params = {
		multiple: curBoomPoint.value.toFixed(2)
	}

	send('USER_CRASH', params)
	clearInterval(goodsTimer)
}

/**
 * 加入游戏
 */
function joinGame() {
	let params = {
		betType: 1,
		betAmount: myBetMoney.value.toString(),
		rucksackGoodsIds: [],
		setGoodsId: 0,
		setMultiple: multiple.value.toString()
	}

	send('USER_BET', params)

	curWatchUser.value = params
	curWatchUser.value.userId = store.state.userId
}

/**
 * 增加下注额
 */
function addMoney(val) {
	if (gameStatus.value !== 'GAME_START') return

	myBetMoney.value = (myBetMoney.value * 10 + val * 10) / 10
	myCurBetMoney.value = myBetMoney.value
	onChangeMultiple()
}

/**
 * 计算倍数
 */
function onChangeMultiple() {
	if (targetGoods.value)
		multiple.value = Number((Number(targetGoods.value.price) / myBetMoney.value).toFixed(2))
}

/**
 * 增加预设逃跑
 */
function addEscape(val) {
	if (gameStatus.value !== 'GAME_START') return

	multiple.value = multiple.value == '' ? 0.00 : multiple.value
	multiple.value = (multiple.value * 10 + val * 10) / 10
}

/**
 * 获取实时爆点
 */
function getCurBoomPoint() {
	let $t = 0
	boomPointTimer = setInterval(() => {
		if (isBoom.value) {
			curBoomPoint.value = 1.00
			clearInterval(boomPointTimer)
		}
		else
			$t += 40
		let t = 0.04 * $t / 100
		curBoomPoint.value = t / 2 + (Math.pow(t, 2) - t) / 10 + 1

		if (isJoin.value)
			myCurBetMoney.value = parseFloat((((curBoomPoint.value * 100) * (myBetMoney.value * 10)) / 1000).toFixed(2))
	}, 40)
}

/**
 * 倒计时进度
 */
function progressControl() {
	progressTimer = setInterval(() => {
		if (betOvertime.value == 0 || betProgress.value == 0)
			clearInterval(progressTimer)
		else
			betProgress.value -= .1
	}, betOvertime.value)
}

/**
 * 接收的socket信息
 */
function onSocketMessage(e) {
	let message = e.detail.data
	window.$dev && console.log('enter >>>>>>>>>>', message)

	if (message.result === 0) {
		getSceneData()
	}
	else {
		Warn(message.errMsg)
	}
}

/**
 * 获取场景信息
 */
function getSceneData() {
	let params =
	{
		page: 1,
		limit: 5,
		sortType: 0
	}

	///	获取场景数据
	send('SCENE_DATA', {})
	///	获取背包数据
	send('RUCKSACK_GOODS', params)
}

const getRandomPositionStyle = () => {
	const randomLeft = Math.floor(Math.random() * 800) // 范围内的左偏移
	const randomTop = Math.floor(Math.random() * 600) // 范围内的上偏移

	return {
		left: `${randomLeft}px`,
		top: `${randomTop}px`
	};
}

/**
 * 获取商品名称
 * @param string name "运动手套（★） | 潘多拉之盒 (崭新出厂)"
 * @returns str [ 
 * 		'崭新出场', 
 * 		'运动手套（★） | 潘多拉之盒',
 * 		'运动手套（★）',
 * 		'潘多拉之盒'
 * ]
 */
function getGoodsName(name) {
	///	运动手套（★） | 潘多拉之盒 (崭新出厂)
	let str = ['', '', '', '']

	str[0] = name.match(/\(.*\)/) ?
		name.match(/\(.*\)/)[0].replace(/[\(|\)]/g, '')
		: ''
	str[1] = name.replace(/\(.*\)/, '')

	str[2] = str[1].split('|').length > 0 ? str[1].split('|')[0] : ''
	str[3] = str[1].split('|').length > 1 ? str[1].split('|')[1] : ''
	return str
}

/**
 * 格式化商品价格,每3为加逗号
 * @param string | number price
 * @returns string
 */
function formatPrice(price) {
	return parseFloat(Number(price).toFixed(2), 2).toLocaleString('en-US')
}

/**
 * 计算获取某个物品的倍率
 */
function getGoodsMultiple(item) {
	showStore.value = false

	targetGoods.value = item

	return onChangeMultiple()
	// window.$dev && console.log( item )
}

/**
 * 监听最小下注金额
 */
function minBetMoney() {
	myBetMoney.value = myBetMoney.value <= 0.1 ? 0.1 : myBetMoney.value
	return onChangeMultiple()
}

function clearTargetGoods() {
	targetGoods.value = null
	multiple.value = ''
}

watch(myBetMoney, val => {
	myCurBetMoney.value = Number(myBetMoney.value)
})
</script>
<template>
	<div class="pc-crash-container">
		<!-- 奖池物品弹窗 -->
		<van-overlay :show="showStore" z-index="300" style="background: rgba( 0, 0, 0, .7 )">
			<div class="pool-goods-container">
				<div class="pool-goods-header">
					<div class="p-title">{{ t('crash.changeGoods') }}</div>
					<div class="filter-container">
						<div class="form-item">
							<input type="text" :placeholder="t('crash.search')">
						</div>
						<div class="form-item category">
							<input type="text" :placeholder="t('openbox.all')">
						</div>
						<div class="form-item sort">
							<input type="text" :placeholder="t('crash.sortByPriceDesc')">
						</div>
						<div class="form-item price">
							<input type="text" :placeholder="t('crash.minPrice')">
						</div>
						<div class="form-item">
							<input type="text" :placeholder="t('crash.maxPrice')">
						</div>
					</div>
				</div>
				<div class="pool-goods-body">
					<van-list v-model:loading="poolGoodsLoading">
						<div class="pool-goods-item-container" v-for="( item, index ) in poolGoods" :key="index"
							@click="getGoodsMultiple(item)">
							<div class="pool-type">{{ getGoodsName(item.goodsName)[0] }}</div>
							<div class="pg-pic">
								<img :src="item.iconUrl">
							</div>
							<div class="pg-title text-cut">{{ getGoodsName(item.goodsName)[2] }}</div>
							<div class="pg-subtitle text-cut">{{ getGoodsName(item.goodsName)[3] }}</div>
							<div class="price">
								<img src="@/assets/pcimg/crash/gold.png">
								{{ formatPrice(item.price) }}
							</div>
						</div>
					</van-list>
				</div>
			</div>
		</van-overlay>
		<!-- /奖池物品弹窗 -->

		<div class="crash-warp">
			<div class="crash-header">
				<div class="crash-header-item wanted">
					<div class="wanted-text">
						<p>{{ t('crash.bounty') }}</p>
						<span>{{ t('crash.curOnList') }} 3000+</span>
					</div>
				</div>
				<div class="crash-header-item token">
					<div class="token-text">
						<p>Tokenmania</p>
						<span>{{ t('.crash.comeSoon') }}...</span>
					</div>
				</div>
				<div class="crash-header-item shooting">
					<div class="shooting-text">
						<p>{{ t('crash.luckyTitle') }}</p>
						<span>{{ t('crash.pause') }}...</span>
					</div>
				</div>
			</div>

			<div class="crash-body">
				<div class="crash-main">
					<div class="crash-history">
						<div class="history-item" :class="[{ 'green': item > 2 }, { 'gold': item > 5 }]"
							v-for="( item, index ) in boomPointRecord" :key="index">{{ item }}</div>
					</div>

					<div class="bet-container">
						<div class="bet-wrap" v-show="gameStatus == 'GAME_START'">
							<!-- <div class="bet-wrap" v-show="false"> -->
							<div class="bet-title">NEXT ROUND IN...</div>
							<div class="next-round-at">
								<count-to :startVal="betOvertime" :endVal="0.00" :duration="betOvertime * 1000"
									:decimals="2" :useEasing="false" ref="countToRef"></count-to>
							</div>
							<div class="progress-container">
								<div class="cur-progress" :style="{ width: `${betProgress}%` }"></div>
							</div>
						</div>

						<p :class="{ active: false }" v-show="gameStatus == 'GAME_PLAY'">x{{ Number(curBoomPoint).toFixed(2
						) }}</p>
						<!-- <div class="bet-burst" v-show="gameStatus == 'GAME_PLAY'"> -->
						<div class="bet-burst" v-show="gameStatus == 'GAME_PLAY'">
							<!-- 当前武器列表 -->
							<div class="burst">
								<div class="bet-img" v-for="( item, index ) in curPoolGoods" :key="index">
									<img :src="item.iconUrl" />
								</div>
							</div>
							<!-- /当前武器列表 -->
						</div>

						<div class="bet-finish" v-show="gameStatus == 'GAME_END'">
							<!-- <div class="bet-finish" v-show="false"> -->
							<img src="@/assets/pcimg/crash/BOOM.png" />
						</div>

						<div class="bet-text">
							<img src="@/assets/pcimg/crash/geye.png" />
							<div class="p-text">
								<span>Now watching</span>
								&nbsp;your own&nbsp;
								<span>Crash</span>
							</div>
						</div>

						<!-- 逃跑用户 -->
						<TransitionGroup name="success">
							<div v-for="( item, index ) in escapeUsers" :key="index">
								<CrashList class="escape-success" :style="getRandomPositionStyle()"></CrashList>
							</div>
						</TransitionGroup>
						<!-- /逃跑用户 -->
					</div>

					<!-- 投入控制 -->
					<div class="crash-footer">
						<div class="btn" :class="{ active: !isJoin && gameStatus !== 'GAME_START' }">
							<button @click="action">{{ isJoin ? t('crash.runaway') : t('battle.join') }} <label><img
										src="@/assets/pcimg/crash/gold.png" /> {{ myCurBetMoney.toFixed(2)
										}}</label></button>
						</div>

						<div class="my-item-container">
							<div class="presets-container">
								<div class="preset-item" @click="showStore = true">
									<img src="@/assets/pcimg/crash/R.png" v-if="!targetGoods">
									<img :src="targetGoods.iconUrl" class="item-pic" v-else>
									<div class="cross">
										<img src="@/assets/pcimg/crash/aim.png" />
									</div>
								</div>

								<div class="presets-wrap">
									<div class="p-title">{{ t('crash.defaultRunawayValue') }}</div>
									<div class="presets">
										<input placeholder="倍数" v-model="multiple">
										<button class="clear" v-show="targetGoods" @click="clearTargetGoods">{{ t(
											'common.clear') }}</button>
										<button @click="addEscape(0.1)">+0.1</button>
										<button @click="addEscape(1)">+1</button>
									</div>
								</div>
							</div>

							<div class="bet-item-run" v-show="true">
								<div class="p-title">{{ t('plusMoney') }}</div>
								<div class="bet-item-body">
									<img src="@/assets/pcimg/crash/gold.png" />
									<input :placeholder="t('crash.multiple')" v-model="myBetMoney" @blur="minBetMoney"
										@change="onChangeMultiple">
									<button @click="addMoney(0.1)">+0.1</button>
									<button @click="addMoney(1)">+1</button>
								</div>
							</div>

							<div class="bet-items-container">

								<div class="my-bag-goods-container" v-if="showMyBag">
									<div class="b-header">
										<div class="b-title">
											<img src="@/assets/pcimg/crash/myBag.png">
											<label>{{ t('crash.inStock', { items: myBagItems.length }) }}</label>
										</div>
										<div class="more"></div>
									</div>
									<div class="btn-group">
										<button>{{ t('common.selectAll') }}</button>
										<button>{{ t('common.cancelSelectAll') }}</button>
									</div>
									<div class="item-container">
										<div class="item" v-for="( item, index ) in myBagItems" :key="index">
											<div class="checkbox">
												<input type="checkbox">
											</div>
											<div class="item-pic">
												<img :src="item.iconUrl">
											</div>
											<div class="item-info">
												<div class="">{{ getGoodsName(item.goodsName)[0] }}</div>
												<div>{{ getGoodsName(item.goodsName)[1] }}</div>
												<div>
													<img src="@/assets/pcimg/crash/gold.png">
													{{ item.price }}
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="p-title">
									<span>BET ITEMS</span>
									<div class="setting"></div>
								</div>
								<div class="bet-items">
									<div class="item" v-for="( item, index ) in myBagItems" :key="index">
										<div class="leve"></div>
										<img :src="item.iconUrl" />
									</div>
									<div class="my-bag">
										<div class="split"></div>
										<button @click="showMyBag = !showMyBag"></button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- /投入控制 -->

				<!-- 游戏用户列表 -->
				<div class="crash-sidebar">
					<div :class="['user-container', !isBoom ? 'wait' : 'lose']">
						<div class="u-title">
							<div class="user-total">{{ betUsers.length }}位玩家</div>
							<div class="price-total"><img src="@/assets/pcimg/crash/golds.png">{{ Number(moneyPool
							).toFixed(2) }}</div>
						</div>
						<transition-group name="list">
							<div class="user-item" v-for="( item, index ) in betUsers" :key="index">
								<div class="eyes">
									<img src="@/assets/pcimg/crash/eye.png">
								</div>
								<div class="user-item-container">
									<div class="user-head">
										<img :src="item.userItem.avater">
										<div class="watcher">65</div>
										<div class="item-pic" v-show="item.betItem.type == 2">
											<img src="http://dummyimage.com/80x90">
										</div>
									</div>
									<div class="bet-container">
										<img src="@/assets/pcimg/crash/gold.png" />
										<p>{{ item.betItem.betAmount }}</p>
									</div>
									<div class="times-container" v-show="!isBoom">{{ Number(item.betItem.setMultiple) <= 1 ?
										`LIVE` : `x${item.betItem.setMultiple}` }}</div>
											<div class="boom" v-show="isBoom">
												<img src="@/assets/pcimg/crash/boom_2.png">
											</div>
									</div>
								</div>
						</transition-group>
					</div>
					<div class="user-container success" v-show="escapeUsers.length > 0">
						<div class="u-title">{{ escapeUsers.length }}位玩家成功逃脱</div>
						<transition-group name="list">
							<div class="user-item" v-for="( item, index ) in escapeUsers" :key="index">
								<div class="eyes">
									<img src="@/assets/pcimg/crash/eye.png">
								</div>
								<div class="user-item-container escape">
									<div class="user-head">
										<img :src="item.userItem.avater">
										<div class="watcher">65</div>
										<div class="item-pic">
											<img :src="item.settleItem.goodsItem.iconUrl" />
										</div>
									</div>
									<div class="bet-container">
										<img src="@/assets/pcimg/crash/gold.png" />
										<p>{{ item.settleItem.sumAmount }}</p>
									</div>
									<div class="times-container">{{ item.settleItem.multiple }}x</div>
								</div>
							</div>
						</transition-group>
					</div>
				</div>
				<!-- /游戏用户列表 -->
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.pc-crash-container {
	height: 1054px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: url(@/assets/pcimg/crash/container-bg.png ) no-repeat;
	background-size: cover;
	background-position: center;

	.pool-goods-container {
		width: 1140px;
		height: 860px;
		// border: 1px solid red;
		color: #fff;
		position: fixed;
		left: calc(50% - 1140px / 2);
		top: calc(50% - 860px / 2);
		box-sizing: border-box;
		padding: 24px;
		border-radius: 12px;
		background: #21252B;
		box-shadow: 0px 9px 46px 8px rgba(0, 0, 0, 0.12), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 11px 15px -7px rgba(0, 0, 0, 0.20);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 28px;

		.pool-goods-header {
			display: flex;
			flex-direction: column;
			gap: 24px;

			.p-title {
				color: #FFF;

				font-size: 19.2px;
				font-style: normal;
				font-weight: 400;
				line-height: 32px;
				/* 166.667% */
				text-transform: uppercase;
			}

			.filter-container {
				display: flex;
				justify-content: space-between;

				.form-item {
					border-radius: 6px;
					background: #1A1E23;
					box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset;
					height: 50px;
					width: 200px;
					position: relative;

					&::before {
						top: -8px;
						left: 10px;
						color: rgba(255, 255, 255, 0.70);

						font-size: 10.2px;
						font-weight: 400;
						position: absolute;
					}

					&.category::before {
						content: '类别';
					}

					&.sort::before {
						content: '排列顺序';
					}

					&.price::before {
						content: '价格';
					}

					input {
						height: 100%;
						width: 100%;
						background: transparent;
						border: none;
						box-sizing: border-box;
						padding: 0 10px;

						&::placeholder {
							color: rgba(255, 255, 255, 0.60);

							font-size: 13.6px;
							font-weight: 400;
						}
					}
				}
			}
		}

		.pool-goods-body {
			overflow-y: auto;

			.van-list {
				display: flex;
				flex-wrap: wrap;
				gap: 16px;

				.pool-goods-item-container {
					width: 166px;
					height: 210px;
					box-sizing: border-box;
					display: flex;
					position: relative;
					flex-direction: column;
					border-radius: 8px;
					border: 1px solid #1E2138;
					background: #31353D;
					justify-content: flex-end;
					padding: 16px 12px;
					gap: 3px;

					.pg-pic {
						width: 100%;
						display: flex;
						justify-content: center;
						position: absolute;
						top: 40px;
						left: 0;

						img {
							width: calc(80% - 24px);
						}
					}

					.pg-title {
						color: rgba(255, 255, 255, 0.60);

						font-size: 10.9px;
						font-weight: 400;
					}

					.pg-subtitle {
						color: #FFF;

						font-size: 13.6px;
						font-weight: 600;
					}

					.pool-type {
						position: absolute;
						top: 15px;
						right: 15px;
						color: rgba(255, 255, 255, 0.60);

						font-size: 10.4px;
					}

					.price {
						display: flex;
						gap: 4px;
						align-items: center;
						color: #FFF;

						font-size: 13.6px;
						font-weight: 400;
					}
				}
			}
		}
	}


	.crash-warp {
		height: 1054px;
		max-width: 1440px;
		width: 100%;
		display: flex;
		// border: 1px solid red;
		padding: 10px 20px 48px 20px;
		box-sizing: border-box;
		flex-direction: column;
		gap: 18px;

		.crash-body {
			max-width: 1440px;
			width: 100%;
			// padding: 0 20px;
			box-sizing: border-box;
			// border: 1px solid blue;
			height: calc(100% - 106px - 18px);
			display: flex;

			.crash-sidebar {
				// border: 1px solid yellow;
				box-sizing: border-box;
				height: 100%;
				width: 343px;

				.user-container {
					display: flex;
					flex-direction: column;
					gap: 6px;

					.list-enter-active,
					.list-leave-active {
						transition: all 0.5s ease;
					}

					.list-enter-from,
					.list-leave-to {
						opacity: 0;
						transform: translateX(30px);
					}

					&.success {
						.user-item {
							.eyes {
								background: #2D5347;
							}
						}
					}

					&.lose {
						.user-item {

							.eyes,
							.user-item-container {
								background: #523433;
							}
						}
					}

					.user-item {
						width: 100%;
						height: 46px;
						// border: 1px solid red;
						box-sizing: border-box;
						display: flex;
						align-items: center;
						position: relative;
						justify-content: flex-end;

						.user-item-container {
							width: 332px;
							height: 100%;
							display: flex;
							box-sizing: border-box;
							padding: 0 8px 0 18px;
							align-items: center;
							position: relative;
							justify-content: space-between;
							background: #31353D;
							border-radius: 4.8px;

							&.escape {
								background: #2D5347;

								.times-container {
									color: #00C74D;
									text-align: center;

									font-size: 14.4px;
									font-style: normal;
									font-weight: 700;
									line-height: 21.6px;
									/* 150% */
								}

								.bet-container {
									p {
										color: #00E258;

										font-size: 14px;
										font-style: normal;
										font-weight: 400;
										line-height: 14px;
										/* 100% */
									}
								}
							}

							.boom {
								margin-left: 50px;
							}

							.times-container {
								width: 64px;
								height: 27.5px;
								display: flex;
								align-items: center;
								justify-content: center;
								box-sizing: border-box;
								// border: 1px solid yellow;
								color: #FFE063;

								font-size: 13px;
								font-style: normal;
								font-weight: 400;
								border-radius: 3.2px;
								background: #262A30;
							}

							.bet-container {
								display: flex;
								justify-content: center;
								/* 水平居中 */
								align-items: center;
								/* 垂直居中 */
								width: calc(16px + 96px);
								// border: 1px solid red;
								height: 20px;
								box-sizing: border-box;
								gap: 5px;

								img {
									width: 16.8px;
									height: 16.8px;
								}

								p {
									color: #8E8E99;

									font-size: 14px;
									font-style: normal;
									font-weight: 400;
									line-height: 14px;
									/* 100% */
								}
							}

							.user-head {
								display: flex;
								align-items: center;
								width: calc(36px + 24px + 34px);
								// border: 1px solie red;
								box-sizing: border-box;
								gap: 24px;

								.item-pic {
									// border: 1px solid red;
									width: 34px;
									height: 26px;

									img {
										border: none;
										border-radius: 0;
										height: 100%;
									}
								}

								img {
									width: 36px;
									height: 36px;
									box-sizing: border-box;
									border: 4px solid yellow;
									border-radius: 50%;
								}

								.watcher {
									position: absolute;
									border: 1px solid #1D2126;
									box-sizing: border-box;
									width: 18px;
									height: 18px;
									border-radius: 50%;
									bottom: 4px;
									left: 15px;
									color: #1D2126;
									// background:#fff;
									display: flex;
									align-items: center;
									justify-content: center;

									font-size: 7.375px;
									font-style: normal;
									font-weight: 700;
								}

							}
						}

						.eyes {
							display: flex;
							justify-content: center;
							/* 水平居中 */
							align-items: center;
							/* 垂直居中 */
							width: 24px;
							height: 24px;
							border-radius: 50%;
							// border: 1px solid red;
							box-sizing: border-box;
							position: absolute;
							background: #31353D;
							left: 0;
							z-index: 1;

							img {
								width: 14px;
								height: 10px;
							}
						}
					}

					.u-title {
						display: flex;
						color: #8E8E99;
						width: 100%;
						justify-content: space-between;
						padding: 18px 12px 18px 12px;
						box-sizing: border-box;
						height: 58px;
						align-items: flex-end;
						font-weight: 600;
						font-size: 14px;

						.price-total {
							display: flex;
							// border: 1px solid red;
							align-items: flex-end;
							color: #FFF;

							font-size: 20.8px;
							font-style: normal;
							font-weight: 700;
							gap: 8px;

							img {
								height: 40px;
								width: 40px;
							}
						}

						.user-total {
							padding-left: 14px;
							color: #8E8E99;

							font-size: 14.4px;
							font-style: normal;
							font-weight: 600;
							text-transform: uppercase;
							position: relative;
							display: flex;
							align-items: center;

							&::before {
								content: "";
								width: 10px;
								height: 10px;
								position: absolute;
								border-radius: 50%;
								background: #00C74D;
								box-shadow: 0px 1px 0px 0px #35D87B inset, 0px -1px 0px 0px #00913C inset, 0px 5px 12px 0px rgba(0, 255, 12, 0.10);

								left: -5px;
							}
						}
					}
				}
			}

			.crash-main {
				display: flex;
				position: relative;
				height: 100%;
				width: calc(100% - 343px);
				// border: 1px solid red;
				box-sizing: border-box;
				flex-direction: column;

				.crash-history {
					// border: 1px solid red; 
					display: flex;
					height: 40px;
					box-sizing: border-box;
					width: 100%;
					align-items: center;
					gap: 8px;

					.history-item {
						display: flex;
						padding: 0 24px;
						align-items: center;
						box-sizing: border-box;
						height: 100%;
						min-width: 80px;
						border-radius: 12.648px;
						background: #262A30;
						font-size: 16px;
						font-weight: 400;
						color: #FFF;

						&.green {
							background: #1E3930;
							color: #00E258;
						}

						&.gold {
							background: #423E2E;
							color: #FFE063;
						}
					}
				}

				.bet-container {
					height: calc(100% - 174px - 40px);
					// border: 1px solid yellow;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					/* 子元素垂直排列 */
					background: url(@/assets/pcimg/crash/diamond.png ) no-repeat;
					background-position: center center;
					transition: all 0.3s ease;

					p {
						position: absolute;
						/* 使用绝对定位 */
						top: 190px;
						color: #FFF;
						text-align: center;

						font-size: 28.8px;
						font-style: normal;
						font-weight: 700;
						line-height: 43.2px;
						/* 150% */
						transition: all 0.5s ease;

						&.active {
							color: #FF7E3D;
							text-align: center;

							font-size: 34.56px;
							font-style: normal;
							font-weight: 700;
							line-height: 43.2px;
							/* 125% */
							transition: all 0.5s ease;
						}
					}

					.bet-wrap {
						// border: 1px solid red;
						width: 100%;
						height: 500px;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						transition: all 0.3s ease;

						.bet-title {
							color: #6C757D;

							font-size: 11.813px;
							font-style: normal;
							font-weight: 600;
							line-height: 18px;
							/* 152.381% */
							text-transform: uppercase;
						}

						.next-round-at {
							color: #FFF;

							font-size: 28.8px;
							font-style: normal;
							font-weight: 700;
							line-height: 43.2px;
							/* 150% */
							margin: 18px 0 27px 0;
						}

						.progress-container {
							width: 160px;
							height: 5px;
							border-radius: 30px;
							background: #1A1E23;
							box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.02);

							.cur-progress {
								border-radius: 30px;
								// transition: 10s;
								height: 100%;
								// width: 60%;
								background: #00E258;
								box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.02);
							}
						}
					}

					.bet-burst {
						// border: 1px solid red;
						width: 100%;
						height: 500px;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						position: relative;

						.bet-img {
							position: absolute;
							display: flex;
							justify-content: center;
							/* 水平居中 */
							align-items: center;
							/* 垂直居中 */
							transition: .3s;
							opacity: 0;
							left: 50%;
							top: 0px;
							transform: translateX(-50%);
							height: 84px;


							&:only-child {
								opacity: 1 !important;
								height: 168px;
								top: 130px;
								left: 50%;
							}

							&:nth-last-child(2) {
								opacity: 1 !important;
								height: 168px;
								top: 130px;
								left: 50%;
							}

							&:last-child {
								opacity: 1 !important;
								height: 84px;
								left: 50%;
								top: 330px;
								animation: move-in .5s ease;
							}

							img {
								height: 100%;
							}
						}

						.bet-small {
							width: 112.3px;
							height: 84px;
							display: flex;
							justify-content: center;
							/* 水平居中 */
							align-items: center;

							/* 垂直居中 */
							img {
								width: 112.3px;
								height: 84px;
							}
						}

						p {
							color: #FFF;
							text-align: center;

							font-size: 28.8px;
							font-style: normal;
							font-weight: 700;
							line-height: 43.2px;
							/* 150% */
						}

						// .burst-move,
						// .burst-enter-active,
						// .burst-leave-active
						// {
						// 	transition: all 0.5s ease;
						// }

						// .burst-enter-from
						// {
						// 	opacity: 0;
						// 	transform: translateY( -30px );
						// }

						// // .burst-enter-to
						// // {
						// // 	opacity: 1;
						// // 	transform: scale( 0.5 );
						// // }

						// .burst-leave-to
						// {
						// 	opacity: 0;
						// 	transform: translateY( -30px );
						// }

						// .burst-leave-active 
						// {
						// 	position: absolute;
						// }
					}

					.bet-finish {
						// border: 1px solid red;
						width: 100%;
						height: 500px;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						transition: all 0.3s ease;
						// gap:51px;
						padding-bottom: 20px;
						box-sizing: border-box;
						transition: all 0.3s ease;

						p {
							color: #FF7E3D;
							text-align: center;

							font-size: 34.56px;
							font-style: normal;
							font-weight: 700;
							line-height: 43.2px;
							/* 125% */
						}

						img {
							animation: bounceAnimation 0.5s ease;
						}

						@keyframes bounceAnimation {

							50%,
							80%,
							100% {
								transform: scale(1);
							}

							0% {
								transform: scale(0);
							}

							20% {
								transform: scale(0.5);
							}

							40% {
								transform: scale(1.2);
							}

							60% {
								transform: scale(0.8);
							}
						}
					}

					.bet-text {
						position: absolute;
						/* 使用绝对定位 */
						bottom: 210px;
						display: flex;
						align-items: flex-end;
						justify-content: center;
						gap: 5px;

						.p-text {
							display: flex;
							flex-direction: row;
							color: #FFF;
							text-align: center;

							font-size: 16px;
							font-style: normal;
							font-weight: 400;
							line-height: 24px;
							/* 150% */

							span {
								display: flex;
								flex-direction: row;
								color: #6C757D;
								text-align: center;

								font-size: 16px;
								font-style: normal;
								font-weight: 400;
								line-height: 24px;
								/* 150% */
							}
						}
					}

					.random-div {
						width: 50px;
						height: 50px;
						background-color: #3498db;
						position: absolute;
						transition: all 0.3s ease;
					}

					.escape-success {
						// opacity: 1;//透明度设置
						transition: all 0.3s ease;
						// border:1px solid red;
					}

					.success-enter-active,
					.success-leave-active {
						transition: all 0.5s ease;
					}

					.success-enter-from,
					.success-leave-to {
						opacity: 0;
						transform: translateY(30px);
					}

				}

				.crash-footer {
					height: 174px;
					width: 100%;
					// border: 1px solid red;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					.my-item-container {
						display: flex;
						// border: 1px solid red;
						height: 72px;
						justify-content: center;
						align-items: center;
						/* 垂直居中 */
						gap: 41px;
						// background:#fff;

						.bet-item-run {
							display: flex;
							flex-direction: column;
							width: 224px;
							height: 72px;
							justify-content: space-around;

							.p-title {
								color: #FFF;

								font-size: 12.644px;
								font-style: normal;
								font-weight: 900;
								line-height: 13.6px;
								/* 107.563% */
								text-transform: uppercase;
							}

							.bet-item-body {
								height: 44px;
								background: #1A1E23;
								border-radius: 5px;
								display: flex;
								align-items: center;
								padding: 0 9px;
								box-sizing: border-box;
								position: relative;
								overflow: hidden;
								gap: 4px;
								box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset;

								input {
									height: 38px;
									background: transparent;
									border: none;
									box-sizing: border-box;
									padding: 0 0 0 8px;
									width: calc(100% - 16px - 8px - 38px * 2);
									color: #fff;
								}

								button {
									width: 38px;
									height: 38px;
									border-radius: 8px;
									background: #31353D;
									border: 1px solid #31353D;
									box-sizing: border-box;
									color: #FFF;
									font-size: 12px;
									font-weight: 500;
								}
							}

						}

						.bet-items-container {
							display: flex;
							flex-direction: column;
							width: 224px;
							height: 72px;
							justify-content: space-around;
							position: relative;

							.my-bag-goods-container {
								position: absolute;
								right: 0;
								bottom: 50px;
								width: 432px;
								height: 512px;
								// border: 1px solid red;
								overflow: hidden;
								border-radius: 4.8px;
								background: #262A30;
								box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.12), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.20);
								box-sizing: border-box;
								padding: 16px 20px;
								display: flex;
								flex-direction: column;
								gap: 8px;

								.b-header {
									width: 100%;
									box-sizing: border-box;
									height: 48px;
									display: flex;
									align-items: center;
									justify-content: space-between;
									padding: 0 19px;
									border-radius: 6px;
									background: #31353D;

									.b-title {
										display: flex;
										align-items: center;

										img {
											height: 18px;
										}

										label {
											color: #FFF;

											font-size: 14.414px;
											font-style: normal;
											font-weight: 400;
											line-height: 22.5px;
											padding-left: 16px;
										}
									}
								}

								.btn-group {
									display: flex;
									gap: 8px;

									button {
										padding: 0 16px;
										border-radius: 8px;
										background: #31353D;
										height: 36px;
										display: flex;
										align-items: center;
										justify-content: center;
										border: none;
										color: #6C757D;
										text-align: center;

										font-size: 14px;
										font-style: normal;
										font-weight: 400;
										line-height: 36px;
										/* 257.143% */
										text-transform: capitalize;
									}
								}

								.item-container {
									// border: 1px solid red;
									box-sizing: border-box;
									width: 100%;
									height: calc(100% - 48px - 36px - 16px);
									display: flex;
									flex-direction: column;
									overflow-y: auto;
									gap: 8px;

									.item {
										height: 80px;
										box-sizing: border-box;
										display: flex;
										justify-content: flex-start;
										align-items: center;
										gap: 20px;
										border-radius: 6px;
										background: #31353D;
										overflow: hidden;
										padding: 0 18px;

										.item-info {
											display: flex;
											flex-direction: column;
											justify-content: space-around;
											gap: 6px;
											color: #FFF;

											font-size: 12px;
											font-style: normal;
											font-weight: 600;

											div:first-child {
												font-size: 10px;
												font-weight: 400;
											}

											div:last-child {
												display: flex;
												align-items: center;
												gap: 5px;
												height: 18px;
											}
										}

										img {
											max-width: 64px;
											max-height: 72px;
										}

										input {
											background: transparent !important;
										}
									}
								}
							}

							.p-title {
								color: #FFF;

								font-size: 12.644px;
								font-style: normal;
								font-weight: 900;
								line-height: 13.6px;
								/* 107.563% */
								text-transform: uppercase;
							}

							.bet-items {
								height: 44px;
								background: #1A1E23;
								border-radius: 5px;
								display: flex;
								align-items: center;
								padding: 4px;
								box-sizing: border-box;
								position: relative;
								overflow: hidden;
								gap: 4px;
								box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset;

								.item {
									display: flex;
									align-items: center;
									/* 垂直居中 */
									width: 40px;
									height: 40px;

									img {
										width: 100%;
										height: 32px;
									}

									.leve {
										width: 6px;
										height: 6px;
										background: #67B5FD;
										right: 4px;
										top: 4px;
									}
								}

								.my-bag {
									width: 57px;
									height: 38px;
									position: absolute;
									right: 0;
									display: flex;
									background: #1A1E23;

									.split {
										width: 1px;
										height: 100%;
										margin: 0 8px;
										border: 1px solid #262A30;
									}

									button {
										width: 36px;
										height: 36px;
										border: none;
										border-radius: 6px;
										background: #262A30;
										background: url(@/assets/pcimg/crash/myBag.png ) no-repeat;
										background-position: center center;
									}
								}
							}

							div {
								// border: 1px solid red;
								box-sizing: border-box;
							}

							.p-title {
								display: flex;
								justify-content: space-between;

								.setting {
									width: 15px;
									height: 15px;
									// border: 1px solid red;//
									background: url(@/assets/pcimg/crash/gear.png ) no-repeat;
								}
							}
						}

						.presets-container {
							display: flex;
							gap: 8px;

							.preset-item {
								display: flex;
								justify-content: center;
								/* 水平居中 */
								align-items: center;
								/* 垂直居中 */
								position: relative;
								height: 72px;
								width: 72px;
								box-sizing: border-box;
								border-radius: 8px;
								border: 1px solid rgba(255, 255, 255, 0.10);

								.item-pic {
									width: 100%;
								}

								.cross {
									position: absolute;
									height: 19px;
									width: 19px;
									left: 4px;
									bottom: 4px;
								}
							}

							.presets-wrap {
								display: flex;
								flex-direction: column;
								justify-content: space-around;
								width: 224px;

								.p-title {
									color: #FFF;

									font-size: 12.963px;
									font-style: normal;
									font-weight: 900;
									line-height: 13.6px;
									/* 104.918% */
									text-transform: uppercase;
								}

								.presets {
									height: 44px;
									background: #1A1E23;
									border-radius: 5px;
									display: flex;
									align-items: center;
									gap: 4px;
									padding: 0 9px 0 12px;
									box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset;
									position: relative;

									&::before {
										content: "";
										padding: 2px;
										width: 7.45px;
										height: 7.45px;
										display: flex;
										align-items: center;
										justify-content: center;
										background: url(@/assets/pcimg/crash/x.png ) no-repeat;

										// border: 1px solid red;
									}

									input {
										height: 38px;
										background: transparent;
										border: none;
										box-sizing: border-box;
										padding: 0 0 0 8px;
										width: calc(100% - 16px - 8px - 38px * 3);
										color: #fff;


									}

									input::placeholder {

										font-size: 12px;
										font-style: normal;
										font-weight: 400;
										line-height: normal;
										color: rgba(255, 255, 255, 0.30);
									}

									button {
										width: 38px;
										height: 38px;
										border-radius: 8px;
										background: #31353D;
										border: 1px solid #31353D;
										box-sizing: border-box;
										color: #FFF;
										font-size: 12px;
										font-weight: 500;
										position: absolute;

										&:last-child {
											right: 8px;
										}

										&:nth-last-child(2) {
											right: calc(12px + 38px);
										}

										&:nth-last-child(3) {
											right: calc(16px + 38px * 2);
										}

										&.clear {
											// position: absolute;
											background: transparent;
											border: none;
											color: #c45656;
										}
									}
								}
							}
						}
					}

					.btn {
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: center;

						button {
							height: 64px;
							min-width: 160px;
							padding: 0 26px;
							border: none;
							border-radius: 10px;
							background: #00C74D;
							box-shadow: 0px 2px 0px 0px #35D87B inset, 0px -3px 0px 0px #00913C inset, 0px 10px 27px 0px rgba(0, 255, 12, 0.10);
							color: #FFF;

							font-size: 20px;
							font-style: normal;
							font-weight: 700;
							line-height: 14px;
							/* 70% */
							text-transform: uppercase;
							display: flex;
							justify-content: center;
							/* 水平居中 */
							align-items: center;
							/* 垂直居中 */

							label {
								display: flex;
								align-items: center;

								img {
									height: 21.6px;
									padding: 0 5px;
								}
							}
						}

						&.active {
							opacity: .4; //透明度设置
						}
					}
				}
			}
		}

		.crash-header {
			width: 100%;
			height: 106px;
			// border: 1px solid red;
			border-radius: 12px;
			background: rgba(18, 18, 24, 0.70);
			box-sizing: border-box;
			display: flex;
			padding: 6px 3px;
			gap: 6px;
			justify-content: space-between;

			.crash-header-item {
				height: 100%;
				width: calc(100% / 3 - 6px);
				// border: 1px solid red;
				border-radius: 8px;
				padding-left: 20px;

				&.wanted {
					display: flex;
					align-items: center;
					/* 垂直居中 */
					background-image: url("@/assets/pcimg/crash/wanted.png");
					/* 替换为你的图片 URL no-repeat*/
					background-size: contain;
					background-repeat: no-repeat;

					.wanted-text {
						display: flex;
						align-items: center;
						/* 垂直居中 */
						flex-direction: column;

						/* 子元素垂直排列 */
						// border: 1px solid red;
						p {
							color: #FFF;
							text-align: center;

							font-size: 19px;
							font-style: normal;
							font-weight: 900;
							line-height: 23px;
							/* 121.053% */
						}

						span {
							color: #FFBD81;
							text-align: center;

							font-size: 10px;
							font-style: normal;
							font-weight: 400;
							line-height: 15px;
							/* 150% */
							text-transform: uppercase;
						}
					}
				}

				&.token {
					display: flex;
					align-items: center;
					/* 垂直居中 */
					background-image: url("@/assets/pcimg/crash/token.png");
					/* 替换为你的图片 URL no-repeat*/
					background-size: contain;
					background-repeat: no-repeat;
					opacity: .4; //透明度设置

					.token-text {
						display: flex;
						align-items: center;
						/* 垂直居中 */
						flex-direction: column;

						/* 子元素垂直排列 */
						// border: 1px solid red;
						p {
							color: #FFF;
							text-align: center;

							font-size: 19px;
							font-style: normal;
							font-weight: 900;
							line-height: 23px;
							/* 121.053% */
						}

						span {
							color: #FFBD81;
							text-align: center;

							font-size: 10px;
							font-style: normal;
							font-weight: 400;
							line-height: 15px;
							/* 150% */
							text-transform: uppercase;
						}
					}
				}

				&.shooting {
					display: flex;
					align-items: center;
					/* 垂直居中 */
					background-image: url("@/assets/pcimg/crash/shooting.png");
					/* 替换为你的图片 URL no-repeat*/
					background-size: contain;
					background-repeat: no-repeat;
					opacity: .4; //透明度设置

					.shooting-text {
						display: flex;
						align-items: center;
						/* 垂直居中 */
						flex-direction: column;

						/* 子元素垂直排列 */
						// border: 1px solid red;
						p {
							color: #FFF;
							text-align: center;

							font-size: 19px;
							font-style: normal;
							font-weight: 900;
							line-height: 23px;
							/* 121.053% */
						}

						span {
							color: #FFBD81;
							text-align: center;

							font-size: 10px;
							font-style: normal;
							font-weight: 400;
							line-height: 15px;
							/* 150% */
							text-transform: uppercase;
						}
					}
				}
			}
		}
	}
}

@keyframes move-in {
	from {
		top: calc(330px + 84px);
		height: 0px;
	}

	to {
		height: 84px;
		top: 330px;
	}
}
</style>