import BigNumber from "bignumber.js";

/**
 * 计算sum
 * @param list
 * @param key
 * @returns
 */
function getListSum(list, key) {
	return list?.reduce((prev, next) => {
		return BigNumber(prev)
			.plus(next[key] ?? 0)
			.dp(2)
			.toFixed(2);
	}, 0);
}

export { getListSum };
