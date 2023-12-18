import i18n from "@/lang";
import { _isMobile, isPCFunc } from "../util/common"
const t = i18n.global.t

export default [
	{
		path: "/",
		redirect: (to) => {
			let isPC = isPCFunc();
			if (!isPC) {
				return { path: "/m/home" };
			} else {
				return { path: '/p/home' }
			}
		},
	},
	{
		path: "/m",
		name: "m_index",
		redirect: "/m/home",
		component: () => import("../views/h5/container/Index.vue"),
		children: [
			{
				path: "home",
				name: "m_home",
				component: () => import("../views/h5/home/Index.vue"),
				meta: {
					name : 'home'
				},
			},
			 /// crash
			 {
				path : 'crash',
				name : 'm_crash',
				component : () => import( '@/views/h5/crash/Crash.vue' ),
				meta :
				{
					name : 'crash',
				}
			},
			//roll
			{
				path: "roll",
				name: "m_roll",
				component: () => import("@/views/h5/roll/Index.vue"),
				meta: {
					name: "roll"
				},
			},
			{
				path: "roll_detail",
				name: "m_roll_detail",
				component: () => import("@/views/h5/roll/Detail.vue"),
				meta: {
					name: "roll",
					type: "user",
				},
			},
			//开箱页面
			{
				path: "openbox",
				name: "m_openbox",
				component: () => import("@/views/h5/openbox/Index.vue"),
				meta: {
					name : 'openbox'
				},
			},
			//幸运饰品
			{
				path: "lucky",
				name: "m_lucky",
				component: () => import("@/views/h5/lucky/Index.vue"),
				meta: {
					name: "lucky",
				},
			},
			{
				path: "luckyDetails",
				name: "m_lucky_details",
				component: () => import("@/views/h5/lucky/Details.vue"),
				meta: {
					name: "lucky",
				},
			},
			//重铸
			//	 {
			//		 path: "contract",
			//		 name: "m_contract",
			//		 component: () => import("@/views/h5/contract/Index.vue"),
			//		 meta: {
			//			 name: "饰品重铸",
			//			 type: "user",
			//		 },
			//	 },
			//饰品置换
			{
				path: "replacement",
				name: "m_replacement",
				component: () => import("@/views/h5/replacement/Index.vue"),
				meta: {
					name: "replacement",
					type: "user",
				},
			},
			//福利盲盒
			{
				path: "grade",
				name: "m_grade",
				component: () => import("@/views/h5/grade/Index.vue"),
				meta: {
					name: "grade",
				},
			},
			//时间盲盒
			{
				path: "timebox",
				name: "m_timebox",
				component: () => import("@/views/h5/timebox/Index.vue"),
				meta: {
					name: "timebox",
				},
			},
			// 商城
			// {
			// 	path: "mall",
			// 	name: "m_mall",
			// 	component: () => import("@/views/h5/mall/Index.vue"),
			// 	meta: {
			// 		name: "mall",
			// 	},
			// },
			//中转
			{
				path: "transfor",
				name: "m_transfor",
				component: () => import("@/views/h5/battle/transfor.vue"),
				meta: {
					name: "transfor",
				},
			},
			{
				path: 'activity',
				name : 'm_activity',
				component: () => import( '@/views/h5/activity/Index.vue' ),
				meta : {
					name : 'activity'
				}
			},
			{
				path: "battle",
				name: "m_battle",
				component: () => import("@/views/h5/battle/Index.vue"),
				// redirect: "/m/battle/list",
				children: [
					{
						path: "list",
						name: "m_battle_list",
						component: () => import("@/views/h5/battle/BattleList.vue"),
						meta: {
							name: t("router.battle"),
						},
					},
					{
						path: "battleRank",
						name: "m_battle_rank",
						component: () => import("@/views/h5/battle/BattleRank.vue"),
						meta: {
							name: "rank",
						},
					},
					{
						path: "battleHistory",
						name: "m_battle_history",
						component: () => import("@/views/h5/battle/BattleHistory.vue"),
						meta: {
							name: t("router.battleHistory"),
						},
					},
					{
						path: "myBattleHistory",
						name: "m_my_battle_history",
						component: () => import("@/views/h5/battle/MyBattleHistory.vue"),
						meta: {
							name: t("router.myBattleHistory"),
						},
					},
				
					{
						path: "battleHelp",
						name: "m_battle_help",
						component: () => import("@/views/h5/battle/BattleHelp.vue"),
						meta: {
							name: "battleHelp",
						},
					},

					
				],
			},
			// 创建对战
			{
				path: "createbattle",
				name: "m_createbattle",
				component: () => import("@/views/h5/battle/CreateBattle.vue"),
				meta: {
					name: "createBattle",
				},
			},
			//欧皇战场
			{
				path: "battleDetail",
				name: "m_battleDetail",
				component: () => import("@/views/h5/battle/BattleDetail.vue"),
				meta: {
					name: "battleDetail",
				},
			},
			{
				 path: "battleRank",
				 name: "m_battle_rank",
				 component: () => import("@/views/h5/battle/BattleRank.vue"),
				 meta: {
					 name: "rank",
				 },
			},
			// {
			// 	 path: "battleHistory",
			// 	 name: "m_battle_history",
			// 	 component: () => import("@/views/h5/battle/BattleHistory.vue"),
			// 	 meta: {
			// 		 name: "battleHistory",
			// 	 },
			// },
			{
				path: "battleBoxIntro",
				name: "m_battle_box_intro",
				component: () => import("@/views/h5/battle/BattleBoxIntro.vue"),
				meta: {
					name: "battleBoxIntro",
				},
			},
			{
				path: "battleBoxDetails",
				name: "m_battle_box_details",
				component: () => import("@/views/h5/battle/BattleBoxDetail.vue"),
				meta: {
					name: "battleBoxDetails",
				},
			},
			{
				path: "battleverify",
				name: "m_battleverify",
				component: () => import("@/views/h5/battle/BattleVerify.vue"),
				meta: {
					name: "battleVerify",
				},
			},
			{
				path: "vip",
				name: "m_vip",
				component: () => import("@/views/h5/vip/Index.vue"),
				meta: {
					name: "vip",
					type:'user'
				},
			},
		
		{
			path: "rule",
			name: "m_rule",
			component: () => import("@/views/h5/spreadUser/rule.vue"),
			meta: {
				name: "rule",
				type:'user'
			},
		},

			// {
			//	 path: 'vip',
			//	 name: 'm_vip',
			//	 component: () => import('@/views/h5/vip/Index.vue'),
			//	 meta: {
			//			 name: '会员等级',
			//	 }
			// },

			//vip
	 
			//账户充值
			{
				path: "recharge",
				name: "m_recharge",
				component: () => import("@/views/h5/recharge/Index.vue"),
				meta: {
					name: "recharge",
					type: "user",
				},
			},
			//个人资料
			{
				path: "personal",
				name: "m_personal",
				component: () => import("@/views/h5/personal/Index.vue"),
				meta: {
					name: "userInfo",
					type: "user",
				},
			},
			 //个人资料
			 {
				path: "personalHead",
				name: "m_personal_head",
				component: () => import("@/views/h5/personal/Head.vue"),
				meta: {
					name: "userInfo",
					type: "user",
				},
			},
			{
				path: "personalEdit",
				name: "m_personal_edit",
				component: () => import("@/views/h5/personal/Edit.vue"),
				meta: {
					name: "userInfo",
					type: "user",
				},
			},
			{
				path: "personalInfo",
				name: "m_personal_info",
				component: () => import("@/views/h5/personal/Info.vue"),
				meta: {
					name: "userInfo",
					type: "user",
				},
			},
			// {
			//	 path: "personalInfo",
			//	 name: "m_personal_info",
			//	 component: () => import("@/views/h5/personal/Info.vue"),
			//	 meta: {
			//		 name: "个人信息",
			//		 type: "user",
			//	 },
			// },
			//个人资料
			{
				path: "bag",
				name: "m_bag",
				component: () => import("@/views/h5/bag/Index.vue"),
				meta: {
					name: "myBag",
					type: "user",
				},
			},
			//个人资料
			{
				path: "record",
				name: "m_record",
				component: () => import("@/views/h5/record/Index.vue"),
				meta: {
					name: "myRecord",
					type: "user",
				},
			},
			//推广分红
			{
				path: "spread",
				name: "m_spread",
				component: () => import("@/views/h5/spread/Index.vue"),
				meta: {
					name: "spread",
					type: "user",
				},
			},
			//推广分红
			{
				path: "spreadUser",
				name: "m_spreadUser",
				component: () => import("@/views/h5/spreadUser/Index.vue"),
				meta: {
					name: "spread",
					type: "user",
				},
			},
			{
				path: "spreadUserDetail",
				name: "m_spreadUser_detail",
				component: () => import("@/views/h5/spreadUser/Detail.vue"),
				meta: {
					name: "spread",
				},
			},
			//站内信
			{
				path: "information",
				name: "m_information",
				component: () => import("@/views/h5/information/Index.vue"),
				meta: {
					name: "message",
					type: "user",
				},
			},
		//登陆
		{
			path: "sign",
			name: "m_sign",
			component: () => import("@/components/h5/login/Sign.vue"),
			meta: {
				name: "login",
				type: "user",
			},
		},
		//注册
		{
			path: "register",
			name: "m_register",
			component: () => import("@/components/h5/login/Register.vue"),
			meta: {
				name: "register",
				type: "user",
			},
		},
		//找回密码
		{
			path: "forgetPW",
			name: "m_forgetPW",
			component: () => import("@/components/h5/login/ForgetPW.vue"),
			meta: {
				name: "register",
				type: "user",
			},
		},
			//站内信详情
			{
				path: "informationDetail",
				name: "m_informationDetail",
				component: () => import("@/views/h5/information/InfomationDetail.vue"),
				meta: {
					name: "messageDetail",
					type: "user",
				},
			},
			// {
			//	 path: "personal_info",
			//	 name: "m_personal_info",
			//	 component: () => import("@/views/h5/personal/Info.vue"),
			//	 meta: {
			//		 name: "个人资料",					
			//	 },
			// },
			//下载页
			{
				path: "download",
				name: "m_download",
				component: () => import("@/views/h5/download/Index.vue"),
				meta: {
					name: "download",
				},
			},
			{
				path: "ammonbox",
				name: "m_ammonbox",
				component: () => import("../views/h5/ammonbox/Index.vue"),
				meta: {
					name: "ammonbox",
				},
			},
			// {
			//	 path: "ammonboxcard",
			//	 name: "m_ammonboxcard",
			//	 component: () => import("../views/h5/card/BoxCard.vue"),
			//	 meta: {
			//		 name: "抢卡炼金",
			//	 },
			// },
			// {
			//	 path: "ammoncard",
			//	 name: "m_ammoncard",
			//	 component: () => import("../views/h5/card/Index.vue"),
			//	 meta: {
			//		 name: "抢卡炼金",
			//	 },
			// },
			// {
			//	 path: "ammonCardRank",
			//	 name: "m_ammoncardrank",
			//	 component: () => import("../views/h5/card/CardRank.vue"),
			//	 meta: {
			//		 name: "弹药抢卡",
			//	 },
			// },
			// {
			//	 path: "activity",
			//	 name: "m_activity",
			//	 component: () => import("@/views/h5/activity/Index.vue"),
			//	 meta: {
			//		 name: "节日活动",
			//	 },
			// },
			//帮助中心
			{
				path: "help",
				name: "m_help",
				component: () => import("../views/h5/help/Index.vue"),
				redirect: "/m/help/regulations",
				children: [
					// {
					//		 path: 'problem',
					//		 name: 'm_problem',
					//		 component: () =>
					//				 import('../views/h5/help/subpage/Problem.vue'),
					//		 meta: {
					//				 name: '问题与教程'
					//		 }
					// },
					{
						path: "privacy",
						name: "m_privacy",
						component: () => import("../views/h5/help/subpage/Privacy.vue"),
						meta: {
							name: "privacy",
						},
					},
					{
						path: "regulations",
						name: "m_regulations",
						component: () => import("../views/h5/help/subpage/Regulations.vue"),
						meta: {
							name: "regulations",
						},
					},
					{
						path: "compliance",
						name: "m_compliance",
						component: () => import("../views/h5/help/subpage/Compliance.vue"),
						meta: {
							name: "compliance",
						},
					},
					{
						path: "fandubo",
						name: "m_fandubo",
						component: () => import("../views/h5/help/subpage/FDBNotice.vue"),
						meta: {
							name: "notice",
						},
					},
					{
						path: "contact",
						name: "m_contact",
						component: () => import("../views/h5/help/subpage/Contact.vue"),
						meta: {
							name: "contact",
						},
					},
				],
			},
		],
	},
	{
		path: '/p',
		name: 'p_index',
		redirect: '/p/home',
		component: () => import('../views/pc/container/Index.vue'),
		children: [
			{
				path: 'home',
				name: 'p_home',
				component: () => import('../views/pc/home/Index.vue'),
				meta: {
					name: 'home'
				}
			},
			/// crash
			{
				path : 'crash',
				name : 'p_crash',
				component : () => import( '@/views/pc/crash/Crash.vue' ),
				meta :
				{
					name : 'crash'
				}
			},
			/// rank
			{
				path : 'rank',
				name : 'p_rank',
				component : () => import( '@/views/pc/rank/Index.vue' ),
				meta :
				{
					name : 'rank'
				}
			},
			//roll
			{
				path: 'roll',
				name: 'p_roll',
				component: () =>
					import('@/views/pc/roll/Index.vue'),
				meta: {
					name: 'roll'
				}
			},
			{
				path: 'roll_detail',
				name: 'p_roll_detail',
				component: () =>
					import('@/views/pc/roll/Detail.vue'),
				meta: {
					name: 'roll',
					type: 'user'
				}
			},
			//开箱页面
			{
				path: 'openbox',
				name: 'p_openbox',
				component: () =>
					import('@/views/pc/openbox/Index.vue'),
				meta: {
					name: 'openbox'
				}
			},
			//幸运饰品
			{
				path: 'lucky',
				name: 'p_lucky',
				component: () =>
					import('@/views/pc/lucky/Index.vue'),
				meta: {
					name: 'lucky'
				}
			},
			{
				path: 'luckyDetails',
				name: 'p_lucky_details',
				component: () =>
					import('@/views/pc/lucky/Details.vue'),
				meta: {
					name: 'lucky'
				}
			},
			//重铸
			{
				path: 'contract',
				name: 'p_contract',
				component: () =>
					import('@/views/pc/contract/Index.vue'),
				meta: {
					name: 'contract',
					type: 'user'
				}
			},
			{
				path: "replacement",
				name: "p_replacement",
				component: () => import("@/views/pc/replacement/Index.vue"),
				meta: {
					name: "replacement",
					type: "user",
				},
			},
			//福利盲盒
			{
				path: 'grade',
				name: 'p_grade',
				component: () =>
					import('@/views/pc/grade/Index.vue'),
				meta: {
					name: 'grade'
				}
			},
			//时间盲盒
			{
				path: 'timebox',
				name: 'p_timebox',
				component: () =>
					import('@/views/pc/timebox/Index.vue'),
				meta: {
					name: 'timebox'
				}
			},
			//商城
			// {
			// 	path: 'mall',
			// 	name: 'p_mall',
			// 	component: () =>
			// 		import('@/views/pc/mall/Index.vue'),
			// 	meta: {
			// 		name: 'mall'
			// 	}
			// },
			//中转
			{
				path: "transfor",
				name: "p_transfor",
				component: () => import("@/views/pc/battle/transfor.vue"),
				meta: {
					name: "transfor",
				},
			},
			//对战
			{
				path: 'battle',
				name: 'p_battle',
				component: () =>
					import('@/views/pc/battle/Index.vue'),
				redirect: '/p/battle/list',
				children: [{
					path: 'list',
					name: 'p_battle_list',
					component: () =>
						import('@/views/pc/battle/BattleList.vue'),
					meta: {
						name: 'battle'
					}
				},
				{
					path: 'mylist',
					name: 'p_battle_mylist',
					component: () =>
						import('@/views/pc/battle/BattleMyList.vue'),
					meta: {
						name: 'battle'
					}
				},
				{
					path: 'battleHistory',
					name: 'p_battle_history',
					component: () =>
						import('@/views/pc/battle/BattleHistory.vue'),
					meta: {
						name: 'battleHistory'
					}
				},
				{
					path : 'rank',
					name : 'p_battle_rank',
					component : () => import( '@/views/pc/battle/BattleRank.vue' ),
					meta : {
						name : 'rank'
					}
				}
				]
			},
			//创建对战
			{
				path: 'createbattle',
				name: 'p_createbattle',
				component: () =>
					import('@/views/pc/battle/CreateBattle.vue'),
				meta: {
					name: 'createBattle'
				}
			},
			//欧皇战场
			{
				path: 'battleDetail',
				name: 'p_battleDetail',
				component: () =>
					import('@/views/pc/battle/BattleDetail.vue'),
				meta: {
					name: 'battle'
				}
			},
			{
				 path: 'battleRank',
				 name: 'p_battle_rank',
				 component: () =>
					 import('@/views/pc/battle/BattleRank.vue'),
				 meta: {
					 name: 'rank'
				 }
			},

			{
				path: 'battleBoxDetails',
				name: 'p_battle_box_details',
				component: () =>
					import('@/views/pc/battle/BattleBoxDetail.vue'),
				meta: {
					name: 'battleBoxDetails'
				}
			},
			
			{
				 path: "activity",
				 name: "p_activity",
				 component: () => import("@/views/pc/activity/Index.vue"),
				 meta: {
					 name: "festivalActivity",
				 },
			},
			//个人中心
			{
				path: 'me',
				name: 'p_me',
				component: () =>
					import('@/views/pc/me/Index.vue'),
				redirect: '/p/me/bag',
				meta: {
					name: 'userCenter',
					type: 'user'
				},
				children: [
					//个人资料
					{
						path: 'personal',
						name: 'p_personal',
						component: () =>
							import('@/views/pc/me/personal/Index.vue'),
						meta: {
							name: 'userInfo',
							type: 'user'
						}
					},
					//背包
					{
						path: 'bag',
						name: 'p_bag',
						component: () =>
							import('@/views/pc/me/bag/Index.vue'),
						meta: {
							name: 'myBag',
							type: 'user'
						}
					},
					//记录
					{
						path: 'record',
						name: 'p_record',
						component: () =>
							import('@/views/pc/me/record/Index.vue'),
						meta: {
							name: 'myRecord',
							type: 'user'
						}
					},
					//推广分红
					{
						path: 'spreadUser',
						name: 'p_spreadUser',
						component: () =>
							import('@/views/pc/me/spreadUser/Index.vue'),
						meta: {
							name: 'spread',
							type: 'user'
						}
					},
					{
						path: 'spreadUserDetail',
						name: 'p_spreadUser_detail',
						component: () =>
							import('@/views/pc/me/spreadUser/Detail.vue'),
						meta: {
							name: 'spread'
						}
					},
					//站内信
					{
						path: 'information',
						name: 'p_information',
						component: () =>
							import('@/views/pc/me/information/Index.vue'),
						meta: {
							name: 'message',
							type: 'user'
						}
					},
					//站内信详情
					{
						path: 'informationDetail',
						name: 'p_informationDetail',
						component: () =>
							import('@/views/pc/me/information/InfomationDetail.vue'),
						meta: {
							name: 'messageDetail',
							type: 'user'
						}
					},
					//帮助中心
					{
						path: 'help',
						name: 'p_help',
						component: () => import('@/views/pc/me/help/Index.vue'),
						redirect: '/p/me/help/regulations',
						children: [
							{
								path: 'privacy',
								name: 'p_privacy',
								component: () =>
									import('@/views/pc/me/help/subpage/Privacy.vue'),
								meta: {
									name: 'privacy'
								}
							},
							{
								path: 'regulations',
								name: 'p_regulations',
								component: () =>
									import('@/views/pc/me/help/subpage/Regulations.vue'),
								meta: {
									name: 'regulations'
								}
							},
							{
								path: 'compliance',
								name: 'p_compliance',
								component: () =>
									import('@/views/pc/me/help/subpage/Compliance.vue'),
								meta: {
									name: 'compliance'
								}
							},
							{
								path: 'fandubo',
								name: 'p_fandubo',
								component: () =>
									import('@/views/pc/me/help/subpage/FDBNotice.vue'),
								meta: {
									name: 'notice'
								}
							},
							// {
							//	 path: 'contact',
							//	 name: 'p_contact',
							//	 component: () =>
							//		 import('../views/pc/help/subpage/Contact.vue'),
							//	 meta: {
							//		 name: '联系我们'
							//	 }
							// },
						]
					},
					//vip
					{
						path: 'vip',
						name: 'p_vip',
						component: () =>
							import('@/views/pc/me/vip/Index.vue'),
						meta: {
							name: 'vip',
						}
					},
				]
			},
			//账户充值
			{
				path: 'recharge',
				name: 'p_recharge',
				component: () =>
					import('@/views/pc/recharge/Index.vue'),
				meta: {
					name: 'recharge',
					type: 'user'
				}
			},

			//下载页
			{
				path: 'download',
				name: 'p_download',
				component: () =>
					import('@/views/pc/download/Index.vue'),
				meta: {
					name: 'download',
				}
			},
			{
				path: 'ammonbox',
				name: 'p_ammonbox',
				component: () => import('../views/pc/ammonbox/Index.vue'),
				meta: {
					name: 'ammonbox'
				}
			},
			// {
			//		 path: 'newyear',
			//		 name: 'p_newyear',
			//		 component: () =>
			//				 import('@/views/pc/newyear/Index.vue'),
			//		 meta: {
			//				 name: '新年活动'
			//		 }
			// },

		]
	},
];
