import axios from '../axios'

//获取普通盲盒
export function getGeneralList() {
	return axios({
		url: '/api/blind/getGeneralList',
		method: 'post',
	})
}
//获取盲盒装备列表
export function getBlindBoxGoods(data) {
	return axios({
		url: '/api/blind/getBlindBoxGoods',
		method: 'post',
		data
	})
}
//获取盲盒掉落记录
export function getBoxDropRecords(data) {
	return axios({
		url: '/api/blind/getBoxDropRecords',
		method: 'post',
		data
	})
}
//获取盲盒开箱记录
export function getOpenBoxRecords(data) {
	return axios({
		url: '/api/blind/getOpenBoxRecords',
		method: 'post',
		data,
	})
}

//盲盒详情
export function getBoxDetails(data) {
	return axios({
		url: '/api/blind/getBoxDetails',
		method: 'post',
		data,
	})
}

//盲盒开箱
export function getOpenBox(data) {
	return axios({
		url: '/api/blind/openBox',
		method: 'post',
		data,
	})
}

//获取福利盲盒
export function getGradeList() {
	return axios({
		url: '/api/blind/getGradeList',
		method: 'post',
	})
}

//盲盒开箱
export function openGradeBox(data) {
	return axios({
		url: '/api/blind/openGradeBox',
		method: 'post',
		data,
	})
}

//获取时间盲盒
export function getTimingList() {
	return axios({
		url: '/api/blind/getTimingList',
		method: 'post',
	})
}

//获取推广盲盒
export function getFissionBoxGoods() {
	return axios({
		url: '/api/blind/getFissionBoxGoods',
		method: 'post',
	})
}

//获取弹壳盲盒
export function getAmmonList() {
	return axios({
		url: '/api/blind/getAmmonBoxList',
		method: 'post',
	})
}

//盲盒开箱
export function openAmmonBox(data) {
	return axios({
		url: '/api/blind/openAmmonBox',
		method: 'post',
		data,
	})
}