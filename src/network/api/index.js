import axios from '../axios'

// 获取文章列表
export function getArticleList(data) {
	return axios({
		url: '/api/index/getArticleList',
		method: 'post',
		data
	})
}

// 获取横幅广告列表
export function getBannerList(data) {
	return axios({
		url: '/api/index/getBannerList',
		method: 'post',
		data
	})
}

// 获取配置列表
export function getConfigList() {
	return axios({
		url: '/api/index/getConfigList',
		channel:true,
		method: 'post',
	})
}

// 获取模块列表
export function getModuleList() {
	return axios({
		url: '/api/index/getModuleList',
		method: 'post',
		channel:true,
	})
}

// 获取平台渠道
export function getChannel(data) {
	return axios({
		url: '/api/index/getChannel',
		method: 'post',
		data
	})
}

// 获取装备属性列表
export function getGoodsAttributes() {
	return axios({
		url: '/api/index/getGoodsAttributes',
		method: 'post',
	})
}

// 获取装备背景图
export function getGoodsBgImages() {
	return axios({
		url: '/api/index/getGoodsBgImages',
		method: 'post',
	})
}


export function getAllOpenBoxRecords( data )
{
	return axios({
		url : '/api/index/getAllOpenBoxRecords',
		method: 'post',
		data
	})
}

export function getPlatformStatistics()
{
	return axios({
		url: '/api/index/getPlatformStatistics',
		method: 'post'
	})
}