/**
 * AvatarUI-日历
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Calendar = function(options) {
		var defaults = {
			offsetX: 0,						//横向偏移量
			offsetY: 0,						//纵向偏移量
			single: true,					//是否是单个日历
			monthSize: 1,					//显示多少个月份
			
			currentDate: new Date(),		//自定义系统时间
			disableDate: false,				//不能选择的日期 "past"||"futrue"||"2012-01-12||2012-01-18"

			showShortcuts: false,			//显示快速选择日期

			showHour: false,				//显示小时，true||number， 
			showTime: false,				//是否显示时间 true||false||"current"

			showCompare: false,				//显示对比，同比和环比
			compareType: 'tongbi',			//默认对比类型, "tongbi"||"huanbi"
			compareId: '',					//对比后的值填充到dom元素中

			initCallback: function(){},		//日历框初始化回调函数
			applyCallback: function(){}		//选择日期后的回调函数
		};

		var opt = $.extend({},defaults, options);
		
		var Calendar = {
			current: function(){
				function checkTime(i){if (i<10){i="0" + i}return i;}
				var today = new Date();
				var h = checkTime(today.getHours());
				var m = checkTime(today.getMinutes());
				var s = checkTime(today.getSeconds());
				box.find('.detailTime').val(h+':'+m+':'+s);
			},

			//根据日期区间获得月份
			setDateRange: function(date1,date2){
				opt.start = date1.getTime();
				opt.end = date2.getTime();
				for(var i = 0; i < opt.monthSize; i++){
					Calendar.showMonth(Calendar.changeMonth(new Date(date1),i), 'month'+(i+1));
				};
				Calendar.showSelectedDays();
			},

			//获得选择的日期区间
			showSelectedDays: function(){
				box.find('.day').each(function(){
					if (!$(this).hasClass('toMonth')) return;
					var time = $(this).attr('time');
					if (
						(opt.start && opt.end && opt.end >= time && opt.start <= time )
						|| ( opt.start && !opt.end && opt.start == time )
					){
						$(this).addClass('checked');
					}else{
						$(this).removeClass('checked');
					}
				});
			},
			
			//日期点击处理
			dayClicked: function(day){
				if(opt.single){
					box.find(".day").removeClass('checked');
					var time = parseInt(day.addClass('checked').attr('time'));
					var minute = "";
					var hour = "";
					if(opt.showTime != false){
						minute = box.find('.detailTime').val();
					}else if(opt.showHour != false){
						hour = box.find('.hour').val();
					}

					if(hour != ''){
						_self.val(Calendar.dateToString(new Date(time)) + " " + hour + "时");
					}else{
						_self.val(Calendar.dateToString(new Date(time)));
					}
					
					if(minute != ''){
						_self.val(Calendar.dateToString(new Date(time)) + " " + minute);
					}else{
						_self.val(Calendar.dateToString(new Date(time)));
					}

					Calendar.closeCalendar();
					opt.applyCallback();
				}else{
					var time = day.addClass('checked').attr('time');
					if ((opt.start && opt.end) || (!opt.start && !opt.end) ){
						opt.start = time;
						opt.end = false;
					}else if (opt.start){
						opt.end = time;
					}
					if (opt.start && opt.end && opt.start > opt.end){
						var tmp = opt.end;
						opt.end = opt.start;
						opt.start = tmp;
					}
					opt.start = parseInt(opt.start);
					opt.end = parseInt(opt.end);
					Calendar.showSelectedDays();
				}
				opt.compare && Calendar.compareDate();
			},

			//时间对比
			compareDate: function(){
				var startDateVal, endDateVal;
				if(opt.start && opt.end){
					if(opt.compareType == "huanbi"){
						startDateVal = Calendar.dateToString(Calendar.changeYear(new Date(opt.start), -1));
						endDateVal = Calendar.dateToString(Calendar.changeYear(new Date(opt.end), -1));
					}else{
						startStr = 2*opt.start - opt.end - 86400000;
						endStr = opt.start-86400000;

						startDateVal = Calendar.dateToString(new Date(startStr));
						endDateVal = Calendar.dateToString(new Date(endStr));
					}
				}else{
					if(opt.compareType == "huanbi"){
						startDateVal =  Calendar.dateToString(Calendar.changeYear(new Date(opt.start), -1));
						endDateVal =  Calendar.dateToString(Calendar.changeYear(new Date(opt.start), -1));
					}else{
						startStr = opt.start - 86400000;
						endStr = opt.start - 86400000;

						startDateVal =  Calendar.dateToString(new Date(opt.start - 86400000));
						endDateVal =  Calendar.dateToString(new Date(opt.start - 86400000));
						
					}
				}
				box.find(".compareVal").find(".startDate").val(startDateVal);
				box.find(".compareVal").find(".endDate").val(endDateVal);
				Calendar.compareSelectedDays();
			},

			compareSelectedDays: function(){
				box.find('.day').each(function(){
					if (!$(this).hasClass('toMonth')) return;
					var time = $(this).attr('time');
					if (endStr >= time && startStr <= time && opt.compareType == "tongbi"){
						$(this).addClass('checkedCompare');
					}else{
						$(this).removeClass('checkedCompare');
					}
				});
			},
			
			//显示日期
			showMonth: function(date,month){
				var monthName = Calendar.nameMonth(date.getMonth());
				box.find('.'+month+' .monthName').html('<span class="yearVal">'+date.getFullYear()+'</span>年 <span class="monthVal">'+monthName.toUpperCase()+'</span>月');
				box.find('.'+month+' .dateTable').html(Calendar.createMonthHTML(date));
				opt[month] = date;

				//当日之前的日期不能选择
				opt.disableDate != false && Calendar.disableDate();
			},

			//当天之前的日期不能点击
			disableDate: function(){
				box.find('.day').each(function(){
					var time = $(this).attr('time');
					if(opt.disableDate == "past"){
						time < opt.currentDate.getTime()-86400000 && $(this).removeClass('toMonth');
					}else if(opt.disableDate == "future"){
						time > opt.currentDate.getTime() && $(this).removeClass('toMonth');
					}else{
						var _disableDate = opt.disableDate.split("||");

						console.log('time--'+$(this).html()+'--'+time);
						console.log('this--'+(new Date(Date.parse(_disableDate[0])).getTime()));

						time < new Date(Date.parse(_disableDate[0])).getTime() - 86400000 && $(this).removeClass('toMonth');
						time > new Date(Date.parse(_disableDate[1])).getTime() && $(this).removeClass('toMonth');
					}
				});
			},

			//关闭操作
			closeCalendar: function(){
				$(box).slideUp(100,function(){
					box.remove();
					isIE6 && $('#Iframe').remove();
					_self.removeAttr('calendarOpenned',false);
				});
				$(document.body).unbind('.calendar');
			},

			/*--- util 工具类 start ---*/
			//改变月份
			changeMonth: function(date, n){
				date.setDate(1);
				date.setMonth(date.getMonth() + n);
				return date;
			},
			
			//改变年份
			changeYear: function(date, n){
				date.setFullYear(date.getFullYear() + n); 
				return date;
			},

			//日期转字符串 转换前Thu Sep 01 2011 00:00:00 GMT+0800， 转换后的格式是 2011-08-21
			dateToString: function(date){
				var dateYear = date.getFullYear();
				var dateMonth = date.getMonth()+1;
				if(dateMonth < 10){
					dateMonth = "0"+dateMonth;
				}
				var dateDay = date.getDate();
				if(dateDay < 10){
					dateDay = "0"+dateDay;
				}
				return dateYear+"-"+dateMonth+"-"+dateDay;
			},
			
			//字符串转日期 转换前:2011-05-20 至 2011-08-20， 转换后的格式是 Thu Aug 18 00:00:00 UTC+0800 2011至Thu Aug 25 00:00:00 UTC+0800 2011
			stringToDate: function(dateStr){
				dateStr = dateStr.replace("-","/").replace("-","/").replace("-","/").replace("-","/");
				dateStr = dateStr.replace(" ","").replace(" ","");
				dateStr = dateStr.split("至");
				dateStr = new Date(Date.parse(dateStr[0])).toString() + '至' + new Date(Date.parse(dateStr[1])).toString();
				return dateStr;
			},
			
			
			//月份数组
			nameMonth: function(m){
				return ['1','2','3','4','5','6','7','8','9','10','11','12'][m];
			},

			//创建日历框dom
			createDom: function(){
				box = $('<div class="calendarWrapper">'
								+'<div class="calendarCon"></div>'
								+'<div class="calendarFooter">'
									+'<div class="shortcuts"></div>'
									+'<div class="operateOpt"></div>'
									+'<div class="operateBtn"><input type="button" class="applyBtn" value="确 定" /></div>'
								+'</div>'
							+'</div>');
				return box;
			},

			//创建月份
			createMonthHTML: function(d){
				var days = [];
				d.setDate(1);
				var lastMonth = new Date(d.getTime() - 86400000);
				if (d.getDay() > 0){
					for(var i = d.getDay(); i>0; i--){
						var day = new Date(d.getTime() - 86400000*i);
						days.push({type:'lastMonth',day: day.getDate(),time:day.getTime() });
					}
				}
				var toMonth = d.getMonth();
				for(var i=0; i<40; i++){
					var today = new Date(d.getTime() + 86400000*i);
					days.push({type: today.getMonth() == toMonth ? 'toMonth' : 'nexMonth',day: today.getDate(),time:today.getTime() });
				}
				var html = [];
				for(var week=0; week<6; week++){
					if (days[week*7].type == 'nexMonth') break;
					html.push('<tr>');
					for(var day = 0; day<7; day++){
						var today = days[week*7+day];
						html.push('<td><a time="'+today.time+'" href="javascript:;" class="day '+today.type+'">'+today.day+'</a></td>');
					}
					html.push('</tr>');
				}
				return html.join('');
			}
			/*--- util 工具类 end ---*/
		}
		
		var box;
		var _self;
		
		$(this).addClass('calendar');
		opt.start = false;
		opt.end = false;
		var startStr, endStr;

		var isIE6 = $.browser.msie && ($.browser.version == '6.0');

		$('.toMonth').live('hover',function(){$(this).addClass('toMonthHover');});
		$('.toMonth').live('mouseleave',function(){$(this).removeClass('toMonthHover');});

		$('.selectList a').live('hover',function(){$(this).addClass('hover');});
		$('.selectList a').live('mouseleave',function(){$(this).removeClass('hover');});

		$(this).click(function(e){
			e.stopPropagation();
			_self = $(this);
			if($(this).attr('calendarOpenned')){
				Calendar.closeCalendar();
				return;
			}

			//绑定显示日历的属性
			$(this).attr('calendarOpenned',true);

			var box = Calendar.createDom().hide();
			$(document.body).append(box);
			

			//显示月份
			for(var i = 1; i <= parseInt(opt.monthSize); i++){
				box.find('.calendarCon').append('<div class="month'+i+' monthItem">'
					+'<div class="caption">'
					+'<div class="prevYearTh"><a class="prevYear" href="javascript:;"><<</a></div>'
					+'<div><a class="prevMonth" href="javascript:;"><</a></div>'
					+'<div><a href="javascript:;" class="monthName" id="monthName_'+i+'"><span class="yearVal">2011</span>年<span class="monthVal">06</span>月</a></div>'
					+'<div><a class="nextMonth" href="javascript:;" >></a></div>'
					+'<div class="nextYearTh"><a class="nextYear" href="javascript:;" >>></a></div>'
					+'</div>'
					+'<div class="weekName"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>'
					+'<table class="dateTable" cellspacing="0" cellpadding="0" border="0"></table>'
					+'<div class="selectPanel" id="SelectPanel_'+i+'">'
					+'<div class="selectPanelTop"></div>'
					+'<div class="selectList selectListMonth"><a href="javascript:;" monthval="1">1月</a><a href="javascript:;" monthval="2">2月</a><a href="javascript:;" monthval="3">3月</a><a href="javascript:;" monthval="4">4月</a><a href="javascript:;" monthval="5">5月</a><a href="javascript:;" monthval="6">6月</a><a href="javascript:;" monthval="7">7月</a><a href="javascript:;" monthval="8">8月</a><a href="javascript:;" monthval="9">9月</a><a href="javascript:;" monthval="10">10月</a><a href="javascript:;" monthval="11">11月</a><a href="javascript:;" monthval="12">12月</a></div>'
					+'<div class="selectList selectListYear"><a href="javascript:;" class="prevA">&lt;</a><a href="javascript:;" class="nextA">&gt;</a><div class="yearList"></div></div>'
					+'<div class="botBtn"><input type="button" class="selectedBtn" value="确定"/>&nbsp;<input type="button" class="selectedCancel" value="取消"/></div>'
					+'</div>'
					+'</div>');
			}

			if(opt.single == true && opt.showHour == false && opt.showTime == false){
				box.find('.calendarFooter').hide();
			}

			box.css('width',(box.find('.monthItem').outerWidth()+8) * opt.monthSize);
			var _boxTop, 
				thisOffsetTop = $(this).offset().top, 
				thisOuterHeight = $(this).outerHeight(),
				boxOuterHeight = box.outerHeight();
			
			if(thisOffsetTop > boxOuterHeight && thisOffsetTop + thisOuterHeight + opt.offsetY + boxOuterHeight > document.documentElement.clientHeight + document.documentElement.scrollTop + document.body.scrollTop){
				_boxTop = thisOffsetTop - boxOuterHeight;
			}else{
				_boxTop = thisOffsetTop + thisOuterHeight + opt.offsetY;
			}

			box.css({'top': _boxTop,'left':($(this).offset().left) + opt.offsetX});

			box.slideDown(100);

			box.click(function(e){
				e.stopPropagation();
			});

			var defaults = _self.val();
			//已经有选择的日期则按照这个日期段显示，如果没有显示当前日期的区间
			if(defaults != ""){
				if(opt.single == true){
					defaults = defaults.replace('-','/').replace('-','/').split(' ');
					var date = new Date(Date.parse(defaults[0]));
					Calendar.setDateRange(date,date);
				}else{
					defaults = Calendar.stringToDate(defaults).split('至');
					Calendar.setDateRange(new Date(defaults[0]),new Date(defaults[1]));
				}
			}else{
				opt.start = Calendar.dateToString(opt.currentDate).replace('-','/').replace('-','/');
				opt.end = opt.start;
				Calendar.setDateRange(new Date(opt.start), new Date(opt.end));
			}

			//ie6下select没法遮住，使用了添加iframe的方法遮盖。
			if(isIE6){
				$(document.body).append("<iframe scrolling='no' frameborder='0' id='Iframe' style='position:absolute;'/></iframe>");
				$('#Iframe').css({'width' : box.width()+12, 'height' : box.find('.calendarCon').outerHeight()+12, 'top' : box.css('top'), 'left' : box.css('left')});
			};

			//点击网页隐藏日历框
			$(document).bind('click.calendar',function(){
				Calendar.closeCalendar();
			});

			if(opt.showShortcuts != false){
				if(opt.showShortcuts == "today"){
					box.find('.shortcuts').html('<a href="javascript:;" shortcut="day,1">今天</a>');
				}else{
					box.find('.shortcuts').html('<a href="javascript:;" shortcut="day,1">今天</a>'
												+'<a href="javascript:;" shortcut="day,7">7天</a>' 
												+'<a href="javascript:;" shortcut="day,14">14天</a>' 
												+'<a href="javascript:;" shortcut="day,30">30天</a>'
												+'<a href="javascript:;" shortcut="month,1">1个月</a>'
												+'<a href="javascript:;" shortcut="month,3">3个月</a>'
												+'<a href="javascript:;" shortcut="year">今年</a>');
				}
			}

			box.find('[shortcut]').click(function(){
				var shortcut = $(this).attr('shortcut');
				var end = new Date(Calendar.dateToString(opt.currentDate).replace('-','/').replace('-','/')),start;
				var _date = new Date(Calendar.dateToString(opt.currentDate).replace('-','/').replace('-','/'));
				if (shortcut.indexOf('day') != -1){
					var day = parseInt(shortcut.split(',',2)[1]);
					start = new Date(_date.getTime() - 86400000*(day-1));
				}else if(shortcut.indexOf('month') != -1){
					var month = parseInt(shortcut.split(',',2)[1]);
					var start = _date;
					var startDay = _date.getDate();
					start = Calendar.changeMonth(start,-month);
					start.setDate(startDay);
					end = new Date(Calendar.dateToString(opt.currentDate).replace('-','/').replace('-','/'));
				}else if (shortcut == 'year'){
					start = _date;
					start.setFullYear(end.getFullYear() - 1);
					start.setMonth(0);
					start.setDate(1);
					end.setFullYear(end.getFullYear() - 1);
					end.setMonth(11);
					end.setDate(31);
				}
				Calendar.setDateRange(start,end);
			});
			
			//显示时间
			if(opt.showTime != false){
				box.find('.operateOpt').append('<input type="text" class="detailTime" val="" />');
				if(opt.showTime == "current"){
					(function(){
						Calendar.current();
						setTimeout(arguments.callee, 1000);
					})()
				}else{
					Calendar.current();
				}

				box.find('.detailTime').bind("blur", function(){
					if(!/^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(box.find('.detailTime').val())){
						$(this).css("border", "1px solid red");
						alert("时间格式错误！");
						return;
					}
				});

				box.find('.detailTime').bind("focus", function(){
					$(this).css("border", "1px solid #ddd");
				});

			}

			//显示时间
			if(opt.showHour != false){
				box.find('.operateOpt').html('<select class="hour"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option></select> 时');
				opt.showHour != true && box.find('.hour').val(opt.showHour);
			}

			if(opt.showCompare){
				box.find('.operateOpt').css({"width": 400, "text-align": "left"}).html(''
				+'<div class="compareWrap">'
					+'<div class="compareOnOff"><input type="checkbox" class="compareCheckbox"/> 对比</div>'
					+'<div class="compareCon" style="display:none;">'
						+'<div class="compareAWrap"><a href="javascript:;" class="compareA compareASelected tongbi">同比</a><a href="javascript:;" class="compareA huanbi">环比</a></div>'
						+'<div class="compareVal"><input type="text" class="startDate compareText"/> 至 <input type="text" class="endDate compareText"/></div>'
					+'</div>'
				+'</div>');

				if(opt.compareType == "huanbi"){
					box.find('.huanbi').addClass("compareASelected");
					box.find('.tongbi').removeClass("compareASelected");
				}

//				compareDate();
//				compareSelectedDays();

				//显示对比
				box.find('.compareCheckbox').bind('click.calendar',function(){
					box.find(".compareCon").toggle();
					opt.compare = opt.compare == true ? false : true;
					if(opt.compare == false){
						box.find('.day').removeClass("checkedCompare");
					}else{
						Calendar.compareDate();
						Calendar.compareSelectedDays();
					}
				});

				box.find('.tongbi').bind('click.calendar',function(){
					opt.compareType = "tongbi";
					box.find('.compareA').removeClass("compareASelected");
					$(this).addClass("compareASelected");
					Calendar.compareDate();
					Calendar.compareSelectedDays();
				});

				box.find('.huanbi').bind('click.calendar',function(){
					opt.compareType = "huanbi";
					box.find('.compareA').removeClass("compareASelected");
					$(this).addClass("compareASelected");
					Calendar.compareDate();
					Calendar.compareSelectedDays();
				});
			}

			box.find('.todayBtn').bind('click.calendar',function(){
				opt.start = Calendar.dateToString(opt.currentDate).replace('-','/').replace('-','/');
				opt.end = opt.start;
				Calendar.setDateRange(new Date(opt.start), new Date(opt.end));
			});


			//下一月
			box.find('.nextMonth').bind('click.calendar',function(){
				for(var i = 1; i <= opt.monthSize; i++){
					Calendar.showMonth(Calendar.changeMonth(opt['month'+i],1), 'month'+i);
				};
				Calendar.showSelectedDays();

				opt.compare && Calendar.compareSelectedDays();
			});

			//上一月
			box.find('.prevMonth').bind('click.calendar',function(){
				for(var i = 1; i <= opt.monthSize; i++){
					Calendar.showMonth(Calendar.changeMonth(opt['month'+i],-1), 'month'+i);
				};
				Calendar.showSelectedDays();
				opt.compare && Calendar.compareSelectedDays();
			});
			
			//下一年
			box.find('.nextYear').bind('click.calendar',function(){
				for(var i = 1; i <= opt.monthSize; i++){
					Calendar.showMonth(Calendar.changeYear(opt['month'+i],1), 'month'+i);
				};
				Calendar.showSelectedDays();
				opt.compare && Calendar.compareSelectedDays();
			});
			
			//上一年
			box.find('.prevYear').bind('click.calendar',function(){
				for(var i = 1; i <= opt.monthSize; i++){
					Calendar.showMonth(Calendar.changeYear(opt['month'+i],-1), 'month'+i);
				};
				Calendar.showSelectedDays();
				opt.compare && Calendar.compareSelectedDays();
			});
			
			//点击选择日期
			box.bind('click',function(e){
				if ($(e.target).hasClass('day') && $(e.target).hasClass('toMonth')){
					Calendar.dayClicked($(e.target));
				}
			});

			//日历中的月份年份选择
			box.find('.monthName').bind('click',function(){
				$(".selectPanel").hide();
				var thisId = $(this).attr("id");
				thisId = thisId.substring(thisId.lastIndexOf("_"));
				
				var yearVal = $(this).find(".yearVal").html();
				var monthVal = $(this).find(".monthVal").html();

				var selectPanel = $("#SelectPanel"+thisId);

				selectPanel.find(".selectPanelTop").html(yearVal+"年 "+monthVal+"月");

				var monthA = selectPanel.find(".selectListMonth a");
				var yearA = selectPanel.find(".selectListYear .yearList a");

				$.each(monthA, function(i,v){
					if(monthVal == $(this).attr("monthval")){
						$(this).addClass("selected");
					}else{
						$(this).removeClass("selected");
					}
				});

				var yearList = selectPanel.find(".yearList");
				$(".yearList").html("");

				var startYear = parseInt(yearVal) - 4;
				var endYear = parseInt(yearVal) + 4;
				for(var i = startYear; i < endYear; i++){
					if(i == yearVal){
						yearList.append('<a href="javascript:;" yearval="'+i+'" class="selected">'+i+'</a>');
					}else{
						yearList.append('<a href="javascript:;" yearval="'+i+'">'+i+'</a>');
					}
				}

				$(".selectListMonth a").bind("click.select",function(){
					$(this).addClass("selected").siblings().removeClass("selected");
				});

				$(".selectListYear .yearList a").bind("click.select",function(){
					$(this).addClass("selected").siblings().removeClass("selected");
				});

				$(".selectListYear .prevA").bind("click.select",function(){
					var endYear = $(".selectListYear .yearList a").eq(0).attr("yearval");
					$(".yearList").html("");
					for(var i = parseInt(endYear) - 8; i < endYear; i++){
						if(i == yearVal){
							yearList.append('<a href="javascript:;" yearval="'+i+'" class="selected">'+i+'</a>');
						}else{
							yearList.append('<a href="javascript:;" yearval="'+i+'">'+i+'</a>');
						}
					}

					$(".selectListYear .yearList a").bind("click.select",function(){
						$(this).addClass("selected").siblings().removeClass("selected");
					});
				});

				$(".selectListYear .nextA").bind("click.select",function(){
					var startYear = parseInt($(".selectListYear .yearList a").eq(7).attr("yearval"))+1;
					$(".yearList").html("");
					for(var i = startYear; i < parseInt(startYear) + 8; i++){
						if(i == yearVal){
							yearList.append('<a href="javascript:;" yearval="'+i+'" class="selected">'+i+'</a>');
						}else{
							yearList.append('<a href="javascript:;" yearval="'+i+'">'+i+'</a>');
						}
					}

					$(".selectListYear .yearList a").bind("click.select",function(){
						$(this).addClass("selected").siblings().removeClass("selected");
					});
				});

				$(".selectedBtn").bind("click.select", function(){
					$(".selectListMonth a").each(function(){
						if($(this).hasClass("selected")){
							monthVal = $(this).html();
						}
					});

					$(".selectListYear a").each(function(){
						if($(this).hasClass("selected")){
							yearVal = $(this).html();
						}
					});

					var dateStr = yearVal + "/" + (parseInt(monthVal)) + "/01";
					var _index = thisId.substring(1);

					for(var i = 1; i <= opt.monthSize; i++){
						var date = new Date(dateStr);
						var le = i-_index;                                                                                            
						Calendar.showMonth(Calendar.changeMonth(date,le), 'month'+i);
					};

					selectPanel.slideUp(100);
					$(".selectPanel a").unbind('.select');

				});

				$(".selectedCancel").bind("click.select", function(){
					selectPanel.slideUp(100);
					$(".selectPanel a").unbind('.select');
				});

				selectPanel.show();
			});

			
			//确定按钮
			box.find('.applyBtn').click(function(){
				(!opt.end) && (opt.end = opt.start);
				var startDate = Calendar.dateToString(new Date(opt.start));
				var endDate = Calendar.dateToString(new Date(opt.end));

				if(opt.single == true){
					if(opt.showTime != false){
						var hour = box.find('.detailTime').val();
						_self.val(startDate+" " + hour);
					}else if(opt.showHour != false){
						var hour = box.find('.hour').val();
						_self.val(startDate+" " + hour + "时");
					}
				}else{
					_self.val(startDate+' 至 '+endDate);
				}
				
				opt.compare && $("#"+opt.compareId).html("比较日期范围："+box.find(".startDate").val()+" 至 "+box.find(".endDate").val());

				Calendar.closeCalendar();
				opt.applyCallback();
			});
			
			//取消按钮
			box.find('.cancelBtn').click(function(){
				Calendar.closeCalendar();
			});
			
			//日历框初始化完毕
			opt.initCallback();
			
		});
	};
}(this, jQuery);