/** 阿里云滑动验证，滑动模块有时会触摸失灵，重新init时用新id能避免失灵的情况 */
function run() {
	let count = 0;
	return () => {
		return count++;
	};
}

const getNcId = run();

export { getNcId };
