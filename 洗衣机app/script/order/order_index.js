apiready = function() {
	//初始化页面
	var vm = new Vue({
		el : "#order_list",
		data : {
			status : '加载中',
			loading : true,
			orderlist : false,
			ismonth : true,
			product : []
		},
		filters : {
			formatMonth : function(value) {
				//alert('fit'+this.format(value));
				return vm.format(value).substring(5, 7) + '月订单';
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
		mounted : function() {
			this.$nextTick(function() {
				this.carView();
			});
		},
		methods : {
			carView : function() {
				var _this = this;
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
							if (ret && ret.data) {
								console.log(JSON.stringify(ret));
								_this.product = ret.data;
								_this.orderlist = true;
								_this.loading = false;
								for (var i = 1, len = ret.data.length; i < len; i++) {
									if (vm.format(ret.data[i].reader_time).substring(5, 7) == vm.format(ret.data[i - 1].reader_time).substring(5, 7)) {
										_this.ismonth = false;
									}
								}
							} else {
								api.addEventListener({
									name : 'tap'
								}, function(ret, err) {
									location.reload();
								});
							}
						}, 'appOrderList&funid=wash_order&wash_user_id=' + wash_user_id + '&uuid=' + uuid + '&page=' + 1);
					} else {
						api.refreshHeaderLoadDone();
					}
				});
			},
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
			add0 : function(m) {
				return m < 10 ? '0' + m : m;
			}
		}
	});
	//下拉刷新
	api.setRefreshHeaderInfo({
		visible : true,
		bgColor : '#fff',
		textColor : '#666666',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		location.reload();
		//api.refreshHeaderLoadDone();
	});
}