import axios from '../axios'

// 用户信息
export function getInfo() {
	return axios({
		url: '/api/user/getInfo',
		method: 'post',
	})
}

// 上传文件
export function uploadfile(data,type) {
	return axios({
		url: '/api/uploadfile?type='+type,
		method: 'post',
		headers: {
			'Content-Type': 'multipart/form-data'
		},
		data
	})
}

// 修改用户的邀请码
export function changeInvitationCode(data) {
	return axios({
		url: '/api/user/changeInvitationCode',
		method: 'post',
		data
	})
}

// 修改推广码
export function changeSpreadCode(data) {
	return axios({
		url: '/api/user/changeSpreadCode',
		method: 'post',
		data
	})
}

// 用户实名
export function realName(data) {
	return axios({
		url: '/api/user/realName',
		method: 'post',
		data
	})
}

// 检查用户实名结果
export function queryRealName() {
	return axios({
		url: '/api/user/queryRealName',
		method: 'post'
	})
}

// 更新用户信息
export function update(data) {
	return axios({
		url: '/api/user/update',
		method: 'post',
		data
	})
}

// 修改密码
export function changePassword(data) {
	return axios({
		url: '/api/user/changePassword',
		method: 'post',
		data
	})
}

// 绑定steam
export function bindSteam(data) {
	return axios({
		url: '/api/user/bindSteam',
		method: 'post',
		data
	})
}

// 用户弹壳明细
export function ammoDetails(data) {
	return axios({
		url: '/api/user/ammoDetails',
		method: 'post',
		data
	})
}

// 用户账单明细
export function billDetails(data) {
	return axios({
		url: '/api/user/billDetails',
		method: 'post',
		data
	})
}

// 用户物品记录
export function goodsRecords(data) {
	return axios({
		url: '/api/user/goodsRecords',
		method: 'post',
		data
	})
}

// 用户分解物品
export function recoveryGoods(data) {
	return axios({
		url: '/api/user/recoveryGoods',
		method: 'post',
		data
	})
}

// 用户背包内的物品
export function rucksackGoods(data) {
	return axios({
		url: '/api/user/rucksackGoods',
		method: 'post',
		data
	})
}

export function getMessage(data) {
		return axios({
				url: '/api/user/getMessage',
				method: 'post',
				data
		})
}

export function readyMessage(data) {
		return axios({
				url: '/api/user/readyMessage',
				method: 'post',
				data
		})
}

export function delReadyMessage() {
		return axios({
				url: '/api/user/delReadyMessage',
				method: 'post',
		})
}

export function getReplaceGoods(data) {
		return axios({
				url: '/api/extend/getReplaceGoods',
				method: 'post',
		data
		})
}

export function getUserRucksack(data) {
		return axios({
				url: '/api/extend/userRucksackWeapons',
				method: 'post',
		data
		})
}

export function replaceGoods(data) {
		return axios({
				url: '/api/extend/replaceGoods',
				method: 'post',
		data
		})
}


export function mallBuy(data) {
		return axios({
				url: '/api/user/buyMallGoods',
				method: 'post',
				data
		})
}

export function extractGoods(data) {
		return axios({
				url: '/api/user/extractGoods',
				method: 'post',
				data
		})
}

export function cancelExtract(data) {
		return axios({
				url: '/api/user/cancelExtract',
				method: 'post',
				data
		})
}

export function getAvaterFrameList() {
		return axios({
				url: '/api/user/getAvaterFrameList',
				method: 'post',
		})
}

export function getAvaterList() {
		return axios({
				url: '/api/user/getAvaterList',
				method: 'post',
		})
}

export function getSigninRecords(data) {
		return axios({
				url: '/api/user/getSigninRecords',
				method: 'post',
		data
		})
}

export function signin(data) {
		return axios({
				url: '/api/user/signin',
				method: 'post',
		data
		})
}

// 获取vip等级列表
export function getVipLevelList(data) {
		return axios({
				url: '/api/user/getVipLevelList',
				method: 'post',
				data
		})
}

// 用户领取vip奖励红包
export function getVipReward(data) {
		return axios({
				url: '/api/user/getVipReward',
				method: 'post',
				data
		})
}

///	查询用户印花
export function getUserSticker( data )
{
		return axios( {
				url : '/api/user/getUserSticker',
				method : 'post',
				data
		} )
}

/// 获取兑换记录
export function getRewardRecords( data )
{
		return axios( {
				url : '/api/user/stickerRewardRecords',
				method : 'post',
				data
		} )
}