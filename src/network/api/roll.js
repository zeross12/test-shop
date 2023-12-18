import axios from '../axios'

//获取roll房列表
export function getRollList(data) {
	return axios({
		url: '/api/roll/getList',
		method: 'post',
		data
	})
}

//获取roll房列表
export function getMyRollList(data) {
	return axios({
		url: '/api/roll/getMyList',
		method: 'post',
		data
	})
}

//获取roll结果
export function getResultList(data) {
	return axios({
		url: '/api/roll/getResultList',
		method: 'post',
		data
	})
}

//获取roll用户
export function getUserList(data) {
	return axios({
		url: '/api/roll/getUserList',
		method: 'post',
		data
	})
}

//获取roll物品
export function getGoodsList(data) {
	return axios({
		url: '/api/roll/getGoodsList',
		method: 'post',
		data
	})
}

//detail
export function getDetails(data) {
	return axios({
		url: '/api/roll/getDetails',
		method: 'post',
		data
	})
}


//加入roll
export function joinRoll(data) {
	return axios({
		url: '/api/roll/join',
		method: 'post',
		data
	})
}
