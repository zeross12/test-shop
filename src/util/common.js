/////////////////////common func////////////
import { uuid } from 'vue3-uuid';
import { add, bignumber } from 'mathjs';
import { runDeviceType } from '@/config'
import { DeviceType } from '@/util/util'
// import cIcon from "@/assets/romimg/common/c.png";
import { ElNotification } from 'element-plus'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import i18n from '@/lang'

export const t = i18n.global.t

/**
 * 计算倒计时
 * @param {number} timestamp 倒计时结束的时间戳
 */
export function timeCountdown( timestamp )
{

	let over = Math.floor( timestamp - new Date().getTime() / 1000 )

	let days = Math.floor(	over / ( 60 * 60 * 24 ) )				/// 天
	let hours = Math.floor( over % ( 60 * 60 * 24 ) / ( 60 * 60 ) ) /// 小时
	let min = Math.floor(	over % ( 60 * 60 ) / 60 )				/// 分钟
	let sec = over % 60											 /// 秒

	// window.$dev && console.log( { days : days, hours : hours, min : min, sec : sec } )
	return { days : days, hours : hours, min : min, sec : sec }
}

/**
 * 格式化日期
 * @param format 要显示的日期格式,参数参照PHP
 * @param timestamp 要格式化的时间戳
 * @returns 格式化后的日期
 */
export function datetime( format, timestamp )
{
	///	要显示的日期格式
	let f = format ? format : 'Y-m-d H:i:s'

	let t = typeof timestamp != 'undefined' ? new Date( timestamp.toString().length > 10 ? timestamp : timestamp * 1000 ) : new Date()
	return f.replace( /Y/, t.getFullYear().toString() )
			.replace( /m/, cTime( t.getMonth() + 1 ) )
			.replace( /d/, cTime( t.getDate() ) )
			.replace( /H/, cTime( t.getHours() ) )
			.replace( /i/, cTime( t.getMinutes() ) )
			.replace( /s/, cTime( t.getSeconds() ) )
}

function cTime( i )
{
	return i < 10 ? `0${i}` : i.toString()
}

const offset = 100		/// 提示的偏移量
export const Success = options =>
{
	if( typeof options == 'string' )
		return ElNotification.success( { offset : offset, message : options, duration : 3000 } )
	else
		return ElNotification.success( { offset : options.offset || 0, message : options.message, duration : 3000 } )
}

export const Warn = options =>
{
	if( typeof options == 'string' )
		return ElNotification( { icon : WarnTriangleFilled, offset : offset, message : options, duration : 3000, customClass : 'error' } )
	else
		return ElNotification( { icon : WarnTriangleFilled, offset : options.offset || 0, message : options.message, duration : 3000, customClass : 'error' } )
}

export const Notify = message =>
{
	return ElNotification.error( {
		offset : offset,
		message : message,
		dangerouslyUseHTMLString : true,
		duration : 5000,
		customClass : 'error'
	} )
}

export const random = ( min, max ) =>
{
	min = Math.ceil( min )
	max = Math.floor( max )
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min
}

export const sleep = time =>
{
	return new Promise( resolve => setTimeout( resolve, time ) )
}

export const _isMobile = () => {
	let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
	return flag;
}

export const getUUID = () => {
	let uuidVal = localStorage.getItem('device_uuid');
	if (!uuidVal) {
		uuidVal = uuid.v4();
		localStorage.setItem('device_uuid', uuidVal);
	}
	return uuidVal;
}
//设备类型	0.默认 1.PC 2.H5 3.android 4.ios)
export const getDeviceType = () => {
	let type = 0
	if (runDeviceType == DeviceType.pc || runDeviceType == DeviceType.h5) {
		if (_isMobile()) {
			type = DeviceType.h5;
		} else {
			type = DeviceType.pc;
		}
	} else {
		type = runDeviceType;
	}
	return type
}

//弹出框禁止滑动
export const _stopScroll = function (el) {
	if (!el) return;
	var mo = function (e) { e.preventDefault() }
	el.style.overflow = 'hidden'
	el.addEventListener('touchmove', mo, { passive: false })// 禁止页面滑动
}

//弹出框可以滑动
export const _canScroll = function (el) {
	if (!el) return;
	var mo = function (e) {
		e.preventDefault()
	}
	el.style.overflow = ''// 出现滚动条
	el.removeEventListener('touchmove', mo, { passive: false })
}


export const getAssetsRes = (name) => {
	return new URL('../assets/' + name, import.meta.url).href
}

export const getAssetsImage = (name) => {
	return new URL('../assets/romimg/' + name, import.meta.url).href
}

export const truncation = (num, decimal = 3) => {
	num = num.toString()
	const index = num.indexOf('.')
	if (index !== -1) {
		num = num.substring(0, decimal + index + 1)
	} else {
		num = num.substring(0)
	}
	//截取后保留n位小数
	return parseFloat(num).toFixed(decimal)
}

//根据等级获取物品对应的颜色
export const getGoodsLevelColor = (level) => {
	let arr = ['#bad0ea', '#87bdfa', '#91a3fc', '#b58ffc', '#db6ae8', '#ff9696', '#ffc400'];
	if (arr.length >= level) {
		return arr[level - 1];
	} else {
		return arr[0];
	}
}

export const formatScore = (price, decimal = 2) => {
	let PRICE_RITE = 6.5;
	let priceCny = bignumber(price) * PRICE_RITE;
	priceCny = priceCny.toString()
	const index = priceCny.indexOf('.')
	if (index !== -1) {
		priceCny = priceCny.substring(0, decimal + index + 1)
	} else {
		priceCny = priceCny.substring(0)
	}
	return parseFloat(priceCny).toFixed(decimal);
}

export const pageChangeShowHide = function () {
	let hidden, visState, visibilityChange;
	if (typeof document.hidden !== 'undefined') {
		hidden = 'hidden';
		visState = 'visibilityState';
		visibilityChange = 'visibilitychange';
	} else if (typeof document.mozHidden !== 'undefined') {
		hidden = 'mozHidden';
		visState = 'mozvisibilityState';
		visibilityChange = 'mozvisibilitychange';
	} else if (typeof document.msHidden !== 'undefined') {
		hidden = 'msHidden';
		visState = 'msvisibilityState';
		visibilityChange = 'msvisibilitychange';
	} else if (typeof document.webkitHidden !== 'undefined') {
		hidden = 'webkitHidden';
		visState = 'webkitvisibilityState';
		visibilityChange = 'webkitvisibilitychange';
	}
	return { hidden, visState, visibilityChange }
}

export const playAudio = (audio) => {
	let soundSwitch = localStorage.getItem("soundSwitch");
	if (soundSwitch == 'true') {
		audio.play();
	}
}

export const stopAudio = ( audio ) =>
{
	audio.pause()
	audio.currentTIme = 0
}

export const getShowName = () => {
	if (Window.channelInfo && Window.channelInfo.showName) {
		return Window.channelInfo.showName;
	} else {
		return '199skins';
	}
}

export const getPrefixName = () => {
	if (Window.channelInfo && Window.channelInfo.prefixName) {
		return Window.channelInfo.prefixName;
	} else {
		return '199';
	}
}

export const getGoodsNamePre = (name) => {
	if(!name)return"";
	let arr = name.split('|');
	return arr ? arr[0] : '';
}

export const getGoodsNameSec = (name,type=1) => {
	if(!name)return"";
	if(type==2) name= t( 'common.luckyBag' )
	let arr = name.split('|');
	return arr&&arr[1] ? arr[1] : name;
}

export const isPCFunc = () => {
	// return getDeviceType() == DeviceType.pc && window.innerWidth >= 1024;
	return	window.innerWidth >= 1024;
}



export const showFloat = (num, fontsize) => {
	if (!fontsize) {
		fontsize = 12
	}
	let arr = (num + "").split(".")
	if (arr.length == 2) {
		return arr[0] + `.` + `<span style='font-family:inherit;font-size:` + fontsize + `px'>` + arr[1] + `</span>`
	}
	return num
}

export const GetPriceDecimalPlaces=(num)=>{
	let arr = (num+"").split(".")
	if (arr.length==2){
		return arr[1]
	}
	return ""
}

export const FormatNickname=(str,length)=> {
	if (typeof str == "undefined" || str == null) {
		return "";
	}
	if (typeof str != "string") {
		return "";
	}
	if(length == undefined){
		length = 6
	}
	let bytesLen = str.replace(/[^\x00-\xff]/g, "xx").length;
	if (bytesLen > length) {
		let index = 0;
		let byteLen = 0;
		for (var i = 0; i < str.length; i++) {
			if (str.charCodeAt(i) > 255) {
				byteLen += 2;
			} else {
				byteLen += 1;
			}
			if (byteLen >= length) {
				index = i;
				break;
			}
		}
		str = str.substr(0, index + 1);
		str = str + "...";
	}
	//cc.log(str, "str+++++++++++++++++ = = ")
	return str;
}