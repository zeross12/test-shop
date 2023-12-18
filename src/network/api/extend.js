import axios from "../axios";

export function exchangeGoods(data) {
	return axios({
		url: "/api/extend/exchangeGoods",
		method: "post",
		data,
	});
}

export function getExchangeGoods(data) {
	return axios({
		url: "/api/extend/getExchangeGoods",
		method: "post",
		data,
	});
}

export function userRucksackWeaponsExchange(data) {
	return axios({
		url: "/api/extend/userRucksackWeaponsExchange",
		method: "post",
		data,
	});
}

export function getPointRank(data) {
	return axios({
		url: "/api/extend/getPointRank",
		method: "post",
		data,
	});
}



