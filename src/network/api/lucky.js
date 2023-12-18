import axios from '../axios'

//获取幸运饰品物品列表
export function getLuckyGoods(data) {
	return axios({
		url: '/api/extend/getLuckyGoods',
		method: 'post',
		data
	})
}

//获取幸运饰品类型列表
export function getLuckyTypes(data) {
	return axios({
		url: '/api/extend/getLuckyTypes',
		method: 'post',
		data
	})
}

//获取幸运饰品详情
export function getLuckyDetails(data) {
	return axios({
		url: '/api/extend/getLuckyDetails',
		method: 'post',
		data
	})
}

//拉取幸运饰品
export function pullLuckyGoods(data) {
	return axios({
		url: '/api/extend/pullLuckyGoods',
		method: 'post',
		data
	})
}

//获取自定义幸运饰品统计
export function getLuckyCustom(data) {
	return axios({
		url: '/api/extend/getLuckyCustom',
		method: 'post',
		data
	})
}

//获取幸运饰品掉落记录
export function getLuckyRecords(data) {
	return axios({
		url: '/api/extend/getLuckyRecords',
		method: 'post',
		data
	})
}

//获取幸运饰品全局统计
export function getLuckyStats(data) {
	return axios({
		url: '/api/extend/getLuckyStats',
		method: 'post',
		data
	})
}


//获取幸运饰品模块
export function getLuckyBestRecords(data) {
	return axios({
		url: '/api/extend/getLuckyBestRecords',
		method: 'post',
		data
	})
}

 

