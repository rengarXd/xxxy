apiready = function() {
	//初始化页面
	var vm = new Vue({
		el : "#order_list",
		data : {
			status : '加载中',
			loading : true, //加载树开关
			orderlist : false, //订单列表树开关
			product : [], //渲染数据
			loadLock : false, //懒加载开关
			page : 1, //分页数
			datacount : null, //请求数据页数
			dowloading : false//懒加载图标
		},
		filters : {
			formatMonth : function(value) {
				var myDate = new Date();
				var thisMonth = myDate.getMonth() + 1;
				if (value.substr(5, 2) == thisMonth) {
					return '本月订单';
				} else {
					return value + '月的订单';
				}
			},
			formatTime : function(value) {
				return vm.format(value).substring(11, 16);
			},
			formatDay : function(value) {
				var myDate = new Date();
				var thisYear = myDate.getFullYear();
				var thisMonth = myDate.getMonth() + 1;
				var thisDay = myDate.getDate();
				var previousDay = thisDay - 1;
				var strtime = vm.format(value);
				var readerYear = strtime.substring(0, 4);
				var readerMonth = strtime.substring(5, 7);
				var readerDay = strtime.substring(8, 10);
				//				var readerTime = strtime.substring(11, 16);
				if (thisYear == readerYear && thisMonth == readerMonth && thisDay == readerDay) {
					return '今天';
				} else if (thisYear == readerYear && thisMonth == readerMonth && previousDay == readerDay) {
					return '昨天';
				} else {
					return readerMonth + '-' + readerDay;
				}
			}
		},
		created : function() {
			this.carView();
			this.reloadEventLisenter();
			this.setRefreshHeaderInfo(function() {
				location.reload();
			});
		},
		methods : {
			carView : function() {
				var _this = this;
				_this.loadLock = true;
				api.getPrefs({
					key : 'userinfo'
				}, function(ret, err) {
					if (ret && ret.value) {
						user = eval('(' + ret.value + ')');
						wash_user_id = user[0].wash_user_id;
						uuid = user[0].uuid;
						$xy.ajax(function(ret, err) {
							//关闭下拉刷新
							api.refreshHeaderLoadDone();
							if (ret && ret.data != []) {
								_this.orderlist = true;
								_this.loading = false;
								//1、初始化页面数据
								if (_this.page == 1) {
									_this.product = ret.data.reverse();
								} else {
									//向后渲染
									_this.product = _this.product.concat(ret.data.reverse());
									_this.dowloading = false;
								};
								//2、返回页数赋值
								_this.datacount = parseInt(ret.message);
								//3、添加懒加载事件
								_this.initEventLinster();
								//4、判断返回页数与当前页数
								if (parseInt(ret.message) == _this.page) {
									_this.loadLock = true;
								} else {
									_this.page++;
									_this.loadLock = false;
								};
							} else if (ret && ret.data == []) {
								_this.status = '暂无订单';
							} else {
								_this.status = '请求失败';
								api.addEventListener({
									name : 'tap'
								}, function(ret, err) {
									location.reload();
								});
							}
						}, 'appOrderList&funid=wash_order&wash_user_id=' + wash_user_id + '&uuid=' + uuid + '&page=' + _this.page);
					} else {
						api.refreshHeaderLoadDone();
						_this.status = '检查到您未登录，轻触屏幕跳转登录页面';
						api.addEventListener({
							name : 'tap'
						}, function(ret, err) {
							api.openWin({
								name : 'login_body',
								url : '../login/login_body.html',
								bounces : false
							});
						});
					}
				});
			},
			//时间戳转换
			format : function(shijianchuo) {
				var time = new Date(parseInt(shijianchuo) * 1000);
				var y = time.getFullYear();
				var m = time.getMonth() + 1;
				var d = time.getDate();
				var h = time.getHours();
				var mm = time.getMinutes();
				var s = time.getSeconds();
				return y + '-' + vm.add0(m) + '-' + vm.add0(d) + ' ' + vm.add0(h) + ':' + vm.add0(mm) + ':' + vm.add0(s);
			},
			//月份格式处理
			add0 : function(m) {
				return m < 10 ? '0' + m : m;
			},
			//获取用户信息
			userinfo : function() {
				api.getPrefs({
					key : 'userinfo'
				}, function(ret, err) {
					if (ret && ret.value) {
						return eval('(' + ret.value + ')');
					} else {
					}
				});
			},
			//打开订单详情
			openDetail : function(retDetail) {
				//alert(JSON.stringify(retDetail));
				var datas = new Array();
				datas.push(retDetail);
				var delay = 0;
				if (api.systemType != 'ios')
					delay = 200;
				if (retDetail.order_condition == "待开始") {
					api.openWin({
						name : 'pay_result_head',
						url : '../main/product/pay_result_head.html',
						bounces : false,
						pageParam : {
							data : datas
						},
						delay : delay,
						slidBackEnabled : true,
						vScrollBarEnabled : false
					});
				} else {
					api.openWin({
						name : 'order_details_head',
						url : './order_details/order_details_head.html',
						pageParam : {
							order_id : retDetail.order_id
						},
						bounces : false,
						delay : delay,
						slidBackEnabled : true,
						vScrollBarEnabled : false
					});
				}
			},
			getRequest : function(url) {
				var url = url;
				//获取url中"?"符后的字串
				var theRequest = new Object();
				if (url.indexOf("?") != -1) {
					var str = url.substr(0);
					strs = str.split("&");
					for (var i = 0; i < strs.length; i++) {
						theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
					}
				}
				return theRequest;
			},
			setRefreshHeaderInfo : function(callback) {
				//下拉刷新
				api.setRefreshHeaderInfo({
					visible : true,
					bgColor : '#fff',
					textColor : '#666666',
					textDown : '下拉刷新...',
					textUp : '松开刷新...',
					showTime : true
				}, function(ret, err) {
					callback();
				});
			},
			initEventLinster : function() {
				//console.log(vm.datacount + '&&' + vm.page);
				//数据行数大于初始页数
				if (vm.datacount > vm.page) {
					// 2.0 底部加载更多
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : -10
						}
					}, function(ret, err) {
						if (vm.loadLock == false) {
							vm.dowloading = true;
							setTimeout(function() {
								vm.carView();
							}, 1000);
						}
					});
				}
				if (vm.datacount == vm.page) {
					// 2.0 底部加载更多
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : -10
						}
					}, function(ret, err) {
						api.toast({
							msg : '已经到底部了！'
						});
					});
				}
			},
			reloadEventLisenter : function() {
				api.addEventListener({
					name : 'locationreload'
				}, function(ret, err) {
					location.reload();
				});
			}
		}
	});

}