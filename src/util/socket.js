import { wsurl, tokenName } from "@/config"

/**
 * WebSocket readyState
 * 0 正在建立连接
 * 1 连接成功
 * 2 正在关闭
 * 3 连接已关闭或未能成功建立连接
 */
export default class Socket
{
	store
	dev = import.meta.env.MODE === 'development'

	ws = null
	url = ''

	///	状态验证结果
	auth = false

	///	重连中的状态
	reconnecting = false

	///	重连计时器
	timer = 0
	///	心跳计时器
	pTimer = 0

	///	手动断开连接的标识
	status = false

	///	心跳
	HEARTBEAT = 2
	///	请求认证
	AUTHORIZTHON = 12
	///	活动中奖
	WSRESP_ACTIVITY_GOODS_PRIZE = 102
	///	ROLL房结算
	ROLL_SETTLE = 101
	///	进入游戏
	ENTER_GAME = 1001
	///	离开游戏
	LEAVE_GAME = 1002
	///	游戏消息
	GAME_MESSAGE = 1100

	/**
	 * 构造函数
	 * @param { string } url ws[s]地址
	 * @param { Vuex } store vue store 对象
	 */
	constructor( url, store )
	{
		this.store = store
		this.url = !url || typeof url === 'undefined' ? wsurl : url
		this.connect()
	}

	connect()
	{
		///	如果手动关闭了,放弃重连
		///	目前发现原逻辑没意义,暂时注释掉
		// if( this.status ) return

		try
		{
			this.ws && this.ws.close()
			this.ws = null
		} catch( e ) { this.dev && console.log( 'reconnect >>>>>>>>' )( e ) }

		if( !this.ws /*&& !this.status*/ )
		{
			this.ws = new WebSocket( this.url )

			this.ws.onopen = this.open.bind( this )
			this.ws.onmessage = this.message.bind( this )
			this.ws.onerror = this.error.bind( this )
			this.ws.onclose = this.over.bind( this )
		}
	}

	/**
	 * 接收消息
	 * @param { MessageEvent } e 
	 */
	message( e )
	{
		let data = e.data !== '' ? JSON.parse( e.data ) : {}
		let $d = typeof data.data !== 'undefined' && data.data !== '' ? JSON.parse( data.data ) : {}

		///	消息拦截
		switch( data.cid )
		{
			///	未登记拦截的类型
			default :
				this.addListener( 'socket.message', $d )
			break

			///	心跳
			case this.HEARTBEAT :
				this.store.commit( 'setOnlineUser', $d.onlineNum )
			break

			///	状态验证
			case this.AUTHORIZTHON :
				this.auth = $d.isValid
			break

			///	这里兼容一下旧系统
			case this.ROLL_SETTLE :
				this.store.commit( "setOpenResultRollId", $d.rollId )
				this.store.dispatch( "getUserInfo" )
			break

			///	进入游戏
			case this.GAME_MESSAGE :
				this.addListener( 'game.message', $d )
			break

			///	活动中奖信息
			case this.WSRESP_ACTIVITY_GOODS_PRIZE :
				this.addListener( 'activity.prize', $d )
			break
		}
	}

	/**
	 * 断线重连
	 */
	reconnect()
	{
		this.dev && console.log( 'reconnect >>>>>>>>' )
		if( this.reconnecting ) return
		this.timer = setInterval( this.connect.bind( this ), 3000 )
		this.reconnecting = true
	}

	/**
	 * 消息重发
	 * @param { string | JSON } msg 
	 */
	retry( msg )
	{
		setTimeout( () => {
			if( this.ws && this.ws.readyState === 0 )
				this.retry( msg )
			else
				this.send( msg )
		}, 1000 )
	}

	/**
	 * 发送消息
	 * @param { string | JSON } msg 消息体
	 */
	send( message )
	{
		let msg = 'string' != typeof message ? JSON.stringify( message ) : message

		if( !this.ws ) this.reconnect()

		switch( this.ws.readyState )
		{
			case 1 :
				this.ws.send( msg )
			break

			case 0 :
				this.retry( msg )
			break

			case 3 :
				this.ws.close()
				this.connect()
			break
		}
	}

	/**
	 * 创建自定义事件
	 * @param { string } evt 事件名称
	 * @param { mixed } data 数据
	 */
	addListener( evt, data )
	{
		window.dispatchEvent( new CustomEvent( evt, {
			detail : { data : data }
		} ) )
	}

	/**
	 * 发送心跳
	 */
	heartbeat()
	{
		this.ws.send( { cid : 1 } )
	}

	/**
	 * 连接创建成功
	 * @param { OpenEvent } e 
	 */
	open( e )
	{
		this.dev && console.log( 'reconnect >>>>>>>>' )( 'open >>>>>>>>>>>>>>>>' )
		clearInterval( this.timer )
		clearInterval( this.pTimer )
		this.reconnecting = false

		this.addListener( 'open', e )

		let token = localStorage.getItem( tokenName )

		if( !this.ws.auth )
			this.ws.send( JSON.stringify( { cid : 11, data : JSON.stringify( { token : token } ) } ) )
		
		this.pTimer = setInterval( this.heartbeat, 7000 )
	}

	/**
	 * 连接有误
	 * @param { ErrorEvent } e 
	 */
	error( e )
	{
		this.dev && console.info( 'error >>>>>>>>>>>>', e )
		this.addListener( 'error', e )
		this.reconnect()
	}

	/**
	 * 连接关闭
	 * @param { CloseEvent } e 
	 */
	over( e )
	{
		this.dev && console.info( 'close >>>>>>>>>>>', e )
		this.addListener( 'close', e )
		this.reconnect()
	}

	/**
	 * 关闭连接
	 */
	close()
	{
		this.dev && console.log( 'reconnect >>>>>>>>' )
		this.dev && console.log( 'offonline >>>>>>>>>>>>' )
		this.status = true
		this.ws.close()
		this.ws = null
	}
}