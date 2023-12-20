import { DeviceType } from "@/util/util";

//正式服
export const url = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging' ? 'https://api.vnskin.club/' : "https://api.199skins.com";
// export const url = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging' ? 'https://testapi.qhrqfa.com' : "https://api.199skins.com";
export const wsurl = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging' ? 'wss://8.217.71.149:21081/gate' : "wss://api.199skins.com/gate";
// export const url = 'http://192.168.110.59:21080';
// export const wsurl = 'ws://192.168.110.59:21081/gate';	 

// export const url = 'http://47.98.133.119:21080';
// export const wsurl = 'ws://47.98.133.119:21081/gate'; 

//设备类型	0.默认 1.pc 2.h5 3.android 4.ios
export const runDeviceType = DeviceType.h5;

//打包渠道用于app 199 baidu
let buildChannel = "199";

export const localAndroidVersion = "1.9.0";

//默认平台
export const defaultPlatformId = 1;
//默认渠道
export const defaultChannelCode = "DEFAULT";

//siteUrl
// let officailAppSiteUtl = "https://199skins.com";
// let bdAppSiteUtl = "https://bd.199skins.com";
let officailAppSiteUtl = "";
let bdAppSiteUtl = "";

switch (import.meta.env.MODE) {
	case 'bcxgogogo':
		officailAppSiteUtl = "https://199skins.bcxgogogo888.com";
		bdAppSiteUtl = "https://199skins.bcxgogogo888.com";
		break

	case 'jmkykj':
		officailAppSiteUtl = "https://199skins.jmkykj.cn";
		bdAppSiteUtl = "https://199skins.jmkykj.cn";
		break

	case 'a18183':
		officailAppSiteUtl = "https://18183.199skins.com";
		bdAppSiteUtl = "https://18183.199skins.com";
		break

	case 'wxqef':
		officailAppSiteUtl = "https://199skins.wxqef.cn";
		bdAppSiteUtl = "https://199skins.wxqef.cn";
		break

	case 'yc':
		officailAppSiteUtl = "https://199skins.yc-zhongjie.top";
		bdAppSiteUtl = "https://199skins.yc-zhongjie.top";
		break

	case 'jszhongjie':
		officailAppSiteUtl = "https://199skins.jszhongjie.com";
		bdAppSiteUtl = "https://199skins.jszhongjie.com";
		break

	case 'a199skins':
		officailAppSiteUtl = "https://199skins.com";
		bdAppSiteUtl = "https://bd.199skins.com";
		break
}


function getSiteUrl() {
	let url = location.origin;
	if (runDeviceType == DeviceType.android || runDeviceType == DeviceType.ios) {
		if (buildChannel == "baidu") {
			url = bdAppSiteUtl;
		} else {
			url = officailAppSiteUtl;
		}
	}
	return url;
}
export const siteUrl = getSiteUrl();

function getRuterHistoryType() {
	let type = 1;
	if (runDeviceType == DeviceType.h5 || runDeviceType == DeviceType.pc) {
		if (buildChannel == "baidu") {
			type = 2;
		}
	}
	return type;
}
export const routerHistoryType = getRuterHistoryType();

//token key
export const tokenName = "199_token";
