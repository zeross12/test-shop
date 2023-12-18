import axios from '../axios'

//创建对战房间
export function createBattleRoom(data) {
	return axios({
		url: '/api/battle/create',
		method: 'post',
		data
	})
}


//进入对战房间
export function enterBattleRoom(data) {
	return axios({
		url: '/api/battle/enter',
		method: 'post',
		data
	})
}

//获取对战箱子列表
export function getBoxList() {
	return axios({
		url: '/api/battle/getBoxList',
		method: 'post',
	})
}

//进入对战详情
export function getBattleDetails(data) {
	return axios({
		url: '/api/battle/getDetails',
		method: 'post',
		data
	})
}


//进入对战列表
export function getBattleList(data) {
	return axios({
		url: '/api/battle/getList',
		method: 'post',
		data
	})
}

//加入对战房间
export function joinBattleRoom(data) {
	return axios({
		url: '/api/battle/join',
		method: 'post',
		data
	})
}

//离开对战房间
export function leaveBattleRoom(data) {
	return axios({
		url: '/api/battle/leave',
		method: 'post',
		data
	})
}

//获取对战排行榜
export function getRankList(data) {
	return axios({
		url: '/api/battle/getRankList',
		method: 'post',
		data
	})
}


//获取对战记录
export function getRecords(data) {
	return axios({
		url: '/api/battle/getRecords',
		method: 'post',
		data
	})
}

//获取自己对战记录
export function getUserRecords(data) {
	return axios({
		url: '/api/battle/getUserRecords',
		method: 'post',
		data
	})
}

export function getAuthInfo(data) {
	return axios({
		url: '/api/battle/getAuthInfo',
		method: 'post',
		data
	})
}