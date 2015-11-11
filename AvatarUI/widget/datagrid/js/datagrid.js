/**
 * AvatarUI-表格
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Datagrid = function(options) {
		var dafaults = {
			width: '',    //表格宽度设置，默认为 auto
			height: 312,  //表格高度设置，默认为300
			url: '',                     //请求的url
			method: 'POST',              //可选项：'POST','GET'
			dataParam: {},    //向后台传参数,如：'a':1,'b':2
			columns: [],  //定义列参数
					/*
					[
						{field:'select', title:'选择', width:150, align:'center', formatter:function(row){
								return '<input type="checkbox" thisId="'+row.id+'" />';
							} 
						},
						{field:'name', title:'姓名', width:150, align:'left', dataType: 'string', sortable:true},
						{field:'email', title:'邮箱', width:150, align:'left', dataType: 'string', sortable:true},
						{field:'score', title:'得分', width:200, align:'center', dataType: 'int', sortable:true},
						{field:'date', title:'日期', width:150, align:'center', dataType: 'date', sortable:true},
						{field:'detail', title:'详情', width:50, align:'center', formatter:function(row){
								return '<a href="javascript:;" onclick="alert('+row.id+')"><img src="images/icon_detail.png"/></a>';
							} 
						}
					]
					*/
			
			initCallback: function(self){},      //表格加载完毕执行回调
			debugAjax: false,
			
			ajaxCallback: function(data, self){},  //ajax返回后处理执行回调
			
			pageRowList: [10,20,30,50,100],  //每页显示的行数
			pageRowSelected: 10,             //默认选中的行数
			
			sortType: 'local',          //设置排序方式，ajax是请求后台排序，local是本页表格内容排序
			sortRule: 'desc',           //升序
			sortOrderBy: '',       //设置根据那一列来排序
			
			autoWidth: true,           //表格宽度是否根据自动拉伸
			gapWidth: 9,                //表格头部td的左右padding加边框宽度
			
			showFooter: true,	//显示表格底
			colToggle: true,	
			colResize: true,	
			
			dgResize: true, 	//允许拉伸表格
			
			dgHeaderHeight: false,
			
			headerColspan: false,
			firstRowspan: false,
			
			loadingMsg: '数据加载中。。。',  			//加载提示语
			timeout: 300,             				//设置超时时间
			timeoutMsg: '数据量太大，暂时无法查询出来！',  //查询超时提示
			
			heightAdjust: true,
			
			hasFirstCol: true,	//是否显示表格序列号
			firstColWidth: 25,
			firstColHeaderName: '',
			firstColData: [],
			
			staticData: false,
			
			conDivAuto: false,	//自动行高
			dgAutoHeight: false	//表格自动高度
		};
		
		var opt = $.extend({}, dafaults, options);
		var _self = $(this);
		
		var widthArr = [],
			widthSum = 0,
			widthArrFixed = [],
			fieldArr = [],
			formatterArr = [],
			alignArr = [], 
			adjustAble = true,
			dgWidth = 0,
			colIndexStatic = null,
			dgHeaderHeight = 0,
			dgFooterHeight = 0;
		
		var Datagrid = {
			init: function(){
				var dgWidth = 0;
				var colIndexStatic = null;
				_self.addClass('dg').show();
				_self.html('').height('');
				
				//表格宽高初始化
				_self.width(opt.width);
				!opt.dgAutoHeight && _self.height(opt.height);
				
				_self.append('<div class="dgLoading"><div class="dgLoadingCon">'+opt.loadingMsg+'</div></div>');
				
				if(opt.hasFirstCol){
					_self.css('padding-left', opt.firstColWidth);
					_self.append('<div class="dgFirstCol"><table border="0" cellpadding="0" cellspacing="0" class="tableHeader"><tr><td></td></tr></table><div class="tableCon"><table border="0" cellpadding="0" cellspacing="0"></table></div><table border="0" cellpadding="0" cellspacing="0" class="tableFooter"><tr><td></td></tr></table></div>');
					
					if(opt.headerColspan !== false){
						_self.find('.tableHeader').addClass('tableHeaderColspan');
					}
					
					if(opt.staticData !== false){
						_self.find('.dgFirstCol .tableCon').addClass('tableConFirst');
					}
					_self.find('.dgFirstCol').width(opt.firstColWidth);
					_self.find('.dgFirstCol td').width(opt.firstColWidth);
					_self.find('.dgFirstCol .tableHeader td').html(opt.firstColHeaderName);
					if(opt.showFooter){
						_self.find('.dgFirstCol .tableFooter').show();
					}
				}

				/*--- 构建表格DOM start ---*/
				var headerTdStr = '', colResizeStr = '', leftStr = 0, colToggleStr = '';
				for(var i = 0; i < opt.columns.length; i++){
					var fieldStr = '', dataTypeStr = '', widthStr = '', titleStr = '', alignStr = '', sortableStr = '', widthStaticStr = '', isNull = false;
					$.each(opt.columns[i], function(k,v){
						fieldStr += k == 'field' ? ' field="'+v+'"' : '';
						titleStr += k == 'title' ? v : '';
						alignStr += k == 'align' ? ' text-align:'+v+';' : '';
						sortableStr += k == 'sortable' ? ' sortable' : '';
						dataTypeStr += k == 'dataType' ? ' datatype="'+v+'"' : '';
						if(k == 'width'){
							if(opt.autoWidth){
								widthArr.push(v);
							}else{
								widthStr += ' width:'+v+'px;';
								if(v != 0){
									leftStr += v+opt.gapWidth;
								}
								widthStaticStr = v;
							}
							widthSum += v;
							widthArrFixed.push(v);
						}
						if(v == 0){
							isNull = true;
						}
					});
					var displayNone = isNull ? ' style="display:none;"' : '';
					headerTdStr += '<td'+fieldStr+dataTypeStr+displayNone+'><div class="dgHeaderTdDiv'+sortableStr+'" style="'+widthStr+alignStr+'">'+titleStr+'</div></td>';
					
					if(opt.colResize){
						if(!isNull){
							colToggleStr += '<div'+fieldStr+' class="colToggleItem"><input type="checkbox" checked="checked" />'+titleStr+'</div>';
						}
						var resizeDivLeft = '';
						if(!opt.autoWidth){
							resizeDivLeft = 'left:'+(leftStr-3)+'px';
						}
						colResizeStr += '<div'+fieldStr+' style="'+resizeDivLeft+'" widthstatic="'+widthStaticStr+'"></div>';
					}
				};
				
				
				var headerColspan = '';
				if(opt.headerColspan !== false){
					for (var i = 0; i < opt.headerColspan.length; i++) {
						var thisHeader = opt.headerColspan[i];
						headerColspan += '<td colspan="'+thisHeader.colspan+'" align="'+thisHeader.align+'">'+thisHeader.title+'</td>';
					};
					headerColspan = '<tr style="border-bottom:1px solid #ddd;">'+headerColspan+'</tr>';
				}

				var headerStr = '<div class="dgHeader"><table border="0" cellpadding="0" cellspacing="0">'+headerColspan+'<tr class="dgHeaderTr">'+headerTdStr+'</tr></table><div class="colResize">'+colResizeStr+'</div>';
				_self.append(headerStr);
				
				if(opt.dgHeaderHeight){
					_self.find('.dgHeader').height(opt.dgHeaderHeight);
					_self.find('.dgHeader td').height(opt.dgHeaderHeight);
				};

				if(opt.headerColspan !== false){
					_self.find('.dgHeader').addClass('dgHeaderColspan');
				}
				
				if(opt.colToggle){
					_self.find('.dgHeader').append('<div class="colToggle">'+colToggleStr+'</div></div>');
				}
				
				//表格头部宽度初始化
				opt.autoWidth && this.reSetWidth();
				
				if(opt.sortType == 'ajax'){
					_self.find('.dgHeader .dgHeaderTr td').each(function(){
						if($(this).attr('field') == opt.sortOrderBy){
							$(this).find('.dgHeaderTdDiv').addClass('sortable'+opt.sortRule);
							$(this).find('.dgHeaderTdDiv').attr('sortrule',opt.sortRule);
						}
					});
				}

				//初始化表格内容
				_self.append('<div class="dgContent"><table class="dgContentTable" border="0" cellpadding="0" cellspacing="0"></table></div>');
				
				//初始化表格底部
				var _pageRowOpt = '';
				$.each(opt.pageRowList, function(key,val){
					if(val == opt.pageRowSelected){
						_pageRowOpt += '<option value="'+val+'" selected>'+val+'</option>';
					}else{
						_pageRowOpt += '<option value="'+val+'">'+val+'</option>';
					}
				});
				
				_self.append('<div class="dgFooter">'
				+'<div class="dgPage"><select class="rowNum">'+_pageRowOpt+'</select>&nbsp;&nbsp;'
				+'<span><a href="javascript:;" class="pageFirst pageFirstAble">首页</a></span>'
				+'<span><a href="javascript:;" class="pagePrev pagePrevAble">上一页</a></span> '
				+'<input type="text" class="pageNow" value="0" /> / <b class="pageTotal"></b> '
				+'<span><a href="javascript:;" class="pageNext pageNextAble">下一页</a></span>'
				+'<span><a href="javascript:;" class="pageLast pageLastAble">末页</a></span>&nbsp;&nbsp;'
				+'转到 <input type="text" class="pageGo" value="0" size="3"/> '
				+'<a href="javascript:;" class="pageGoBtn">Go</a>'
				+'</div>'
				+'<div class="dgPageStatus">显示记录从<b class="itemStart"></b>到<b class="itemEnd"></b>, 总数 <b class="total"></b>条'
				+'</div></div>');
				
				if(opt.showFooter){
					_self.find('.dgFooter').show();
				}
				opt.dgResize &&	_self.append('<div class="dgResize dgResizeRight" resize="right"></div><div class="dgResize dgResizeBottom" resize="bottom"></div><div class="dgResize dgResizeRightBottom" resize="rightBottom"></div>');
			},
			
			colToggle: function(){
				$(document).mousedown(function(e){
					if($(e.target).closest('.dgHeader').is('div')){
						if(e.which == 3){
							$(document).bind('contextmenu.right', function(){
								return false; 
							});
							e.stopPropagation();
							var colToggleDiv = $(e.target).closest('.dg').find('.colToggle');
							var dgHeader = $(e.target).closest('.dgHeader');
							var _left = e.pageX - dgHeader.offset().left;
							var _top = e.pageY - dgHeader.offset().top;
							
							colToggleDiv.css({'left': _left,'top': _top});
							colToggleDiv.show();
							return false;
						}
					}else{
						$(e.target).closest('.dg').find('.colToggle').hide();
						$(document).unbind('.right');
					}
				});
				
				_self.find('.colToggleItem').live('click',function(){
					var thisField = $(this).attr('field');
					var _toggle = $(this).find('input').attr('checked') ? 'block' : 'none';
					_self.find('td').each(function(){
						if($(this).attr('field') == thisField){
							$(this).css('display', _toggle);
						}
					});
				});
				
				_self.find('.dgHeader').die().live('mouseleave',function(){
					_self.find('.colToggle').hide();
				});
			},

			addEvent: function(){
				//表格内容滚动使表格头部跟随
				_self.find('.dgContent').bind('scroll',function(){
					_self.find('.dgHeader').css('margin-left', -$(this).scrollLeft());
					if(opt.hasFirstCol){
						_self.find('.dgFirstCol .tableCon table').css('top', -$(this).scrollTop());
					}
				});
				
				//浏览器窗体改变时重设头部和内容的宽度
				$(win).unbind('resize.dgResize_'+_self.attr('id')).bind('resize.dgResize_'+_self.attr('id'), function(){
					if(opt.autoWidth){
						//表格第一列的高度与后面的
						Datagrid.firstColTdHeightResize();
						
						Datagrid.reSetWidth();
						Datagrid.colWidthSet();
					}
				});
				
				
				// 点击网页空白处，表格行的click样式去掉
				$('body').unbind('.dg').bind('click.dg', function(){
					_self.find('.dgContentTable tr').removeClass('trClick');
					_self.find('.dgFirstCol .tableCon table tr').removeClass('trClick');
				});
				
				//排序
				_self.delegate('.sortable', 'click', function(){
					_self.find('.sortable').removeClass('sortableasc sortabledesc');

					if($(this).attr('sortRule') == 'desc'){
						$(this).removeClass('sortabledesc');
						$(this).addClass('sortableasc');
						$(this).attr('sortRule', 'asc');
						opt.sortRule = 'asc';
					}else{
						$(this).removeClass('sortableasc');
						$(this).addClass('sortabledesc');
						$(this).attr('sortRule', 'desc');
						opt.sortRule = 'desc';
					}
					opt.sortOrderBy = $(this).parent().attr('field');
					
					if(opt.sortType == 'ajax'){
						Datagrid.addAsyncData(1, _self.find('.rowNum').val());
					}else{
						var dataType = $(this).parent().attr('datatype');
						var colIndex = _self.find('.dgHeader .dgHeaderTr td').index($(this).parent());
						Datagrid.sortTableLocal(colIndex, opt.sortRule, dataType);
					}
					return false;
				});
				
				//翻页操作
				_self.find('.dgPage span').hover(function(){
					$(this).addClass('hover');
				},function(){
					$(this).removeClass('hover');
				});
				
		        _self.find('.rowNum').die().live('change',function(){
					Datagrid.addAsyncData(1, _self.find('.rowNum').val());
					return false;
				});
				
		        _self.find('.pageFirstAble').die().live('click',function(){
					Datagrid.addAsyncData(1, _self.find('.rowNum').val());
					return false;
				});
				
		        _self.find('.pagePrevAble').die().live('click', function(){
		        	var pageNow = _self.find('.pageNow').val();
					if(pageNow > 1){
						Datagrid.addAsyncData(parseInt(pageNow) - 1, _self.find('.rowNum').val());
					}else{
						Datagrid.addAsyncData(1, _self.find('.rowNum').val());
					}
					return false;
				});
				
				_self.find('.pageNextAble').die().live('click',function(){
					var pageNow = _self.find('.pageNow').val();
					var pageTotal = _self.find('.pageTotal').html();
					if(parseInt(pageNow) < parseInt(pageTotal)){
						Datagrid.addAsyncData(parseInt(pageNow) + 1, _self.find('.rowNum').val());
					}else{
						Datagrid.addAsyncData(pageTotal, _self.find('.rowNum').val());
					}
					return false;
				});
				
				_self.find('.pageLastAble').die().live('click', function(){
					Datagrid.addAsyncData(parseInt(_self.find('.pageTotal').html()), _self.find('.rowNum').val());
					return false;
				});
				
				_self.find('.pageGoBtn').die().live('click', function(){
					var r = /^\+?[1-9][0-9]*$/; //正整数
					var _pageGo = _self.find('.pageGo');
					if(r.test(_pageGo.val()) == false){
						alert('页码输入格式出错！');
						_pageGo.val('1');
						return;
					}
					if(_pageGo.val() > parseInt(_self.find('.pageTotal').html())){
						alert('不能超出最大页码！');
						$(this).val('1');
						return;
					}
					Datagrid.addAsyncData(parseInt(_pageGo.val()), _self.find('.rowNum').val());
					return false;
				});
			},
			
			sortTableLocal: function(colIndex, sortRule, dataType){
				var trArr = [];
				var contentTableTr = _self.find('.dgContentTable tr');
				$.each(contentTableTr,function(){
					trArr.push($(this).html());
				});
				this.judge(trArr, colIndex, sortRule, dataType);
			},
			
			judge: function(trArr, colIndex, sortRule, dataType) {
				if(colIndexStatic == colIndex){
					trArr.reverse();
				}else{
					trArr.sort(this.getSort(colIndex, sortRule, dataType));
				}
				this.reBulidDom(trArr);
				colIndexStatic = colIndex;//用作后面判断用
			},
			
			getSort: function(colIndex, sortRule, dataType) {
				return function createSort(a,b) {
					var first = $(a).eq(colIndex).text();
					var second = $(b).eq(colIndex).text();
					var value1 = convert(first,dataType);
					var value2 = convert(second,dataType);
					if(value1 < value2) {
						return sortRule == 'desc' ? 1 : -1;
					} else if(value1 > value2) {
						return sortRule == 'desc' ? -1 : 1;
					} else {
						return 0;
					}
				};
				function convert(value,type){
					switch(type) {
						case 'int': return parseInt(value);break;
						case 'float': return parseFloat(value);break;
						case 'string': return value.toString();break;
						case 'data': return new Date(Date.parse(value));break;
						default: return value.toString();break;
					}
				}
			},
			
			reBulidDom: function(trArr){
				var dgContentTalbeTbody = _self.find('.dgContentTable tbody');
				dgContentTalbeTbody.html('');
				$.each(trArr,function(index,val){
					dgContentTalbeTbody.append('<tr>'+val+'</tr>');
				});
				//表格点击变色
				dgContentTalbeTbody.find('tr').filter(':odd').addClass('trOdd');
			},

			resize: function(){
				//表格拉伸
				_self.find('.dgResize').hover(function(){
					$(this).addClass('resizeHover');
				},function(){
					$(this).removeClass('resizeHover');
				});
				_self.find('.dgResize').mousedown(function(e){
					$(this).addClass('resizeHover');
					var _this = $(this);
					var _drag = true;
					var oldWidth = _self.width();
					var oldHeight = _self.height();
					if(_drag){
						var startX = e.pageX;
						var startY = e.pageY;
						win.getSelection ? win.getSelection().removeAllRanges() : document.selection.empty(); //禁止拖放对象文本被选择的方法
						$(document).bind('mousemove.dgResize', function(e){
							if (_drag) {
								var endX = e.pageX;
								var endY = e.pageY;
								var diffX = endX - startX;
								var diffY = endY - startY;
								if(_this.attr('resize') == 'right'){
									_self.width(oldWidth + diffX);
									if(opt.autoWidth){
										Datagrid.reSetWidth();
										Datagrid.colWidthSet();
									}
								}
								
								if(_this.attr('resize') == 'bottom'){
									_self.height(oldHeight + diffY);
									_self.find('.dgContent').css('height', parseInt(_self.height()) - dgHeaderHeight - dgFooterHeight);
									if(opt.hasFirstCol){
										_self.find('.dgFirstCol .tableCon').css('height',parseInt(_self.height()) - dgHeaderHeight - dgFooterHeight);
									}
									_self.find('.dgResizeRight').css('height',parseInt(_self.height()));
								}
								if(_this.attr('resize') == 'rightBottom'){
									_self.width(oldWidth + diffX);
									_self.height(oldHeight + diffY);
									_self.find('.dgContent').css('height',parseInt(_self.height()) - dgHeaderHeight - dgFooterHeight);
									if(opt.hasFirstCol){
										_self.find('.dgFirstCol .tableCon').css('height',parseInt(_self.height()) - dgHeaderHeight - dgFooterHeight);
									}
									_self.find('.dgResizeRight').css('height',parseInt(_self.height()));
									if(opt.autoWidth){
										Datagrid.reSetWidth();
										Datagrid.colWidthSet();
									}
								}
								//表格第一列的高度与后面的
								Datagrid.firstColTdHeightResize();
							}
						});
						
						$(document).bind('mouseup.dgResize', function(){
							_drag = false;
							$(document).unbind('.dgResize');
						});
					}
				});
				_self.find('.dgResize').mouseup(function(){
					$(this).removeClass('resizeHover');
				});
			},
			
			//列拉伸
			colResize: function(){
				_self.find('.dgHeader .colResize div').hover(function(){
					$(this).addClass('resizeHover');
				},function(){
					$(this).removeClass('resizeHover');
				});
				_self.find('.dgHeader .colResize div').mousedown(function(e){
					$(this).addClass('resizeHover');
					var thisField = $(this).attr('field');
					var _this = $(this);
					var thisIndex = $(this).index();
					
					var oldLeft = parseInt(_this.css('left'));
					var colResizeDivWidthArr = [];
					_self.find('.dgHeader .colResize div').each(function(index){
						colResizeDivWidthArr.push(parseInt($(this).css('left')));
					});
					
					var oldWidth = parseInt(_this.attr('widthstatic'));
					var diffX = 0;

					var _drag1 = true;
					if(_drag1){
						var startX = e.pageX;
						win.getSelection ? win.getSelection().removeAllRanges() : document.selection.empty(); //禁止拖放对象文本被选择的方法
						$(document).bind('mousemove.colResize', function(e){
							if (_drag1) {
								var endX = e.pageX;
								diffX = endX - startX;
								
								if(colResizeDivWidthArr[thisIndex] + diffX < colResizeDivWidthArr[thisIndex-1] + 50){
									return;
								}
								
								_self.find('.dgHeader .colResize div').each(function(i){
									if(i >= thisIndex){
										$(this).css('left',colResizeDivWidthArr[i] + diffX + 'px');
									}
								});
								
								_this.attr('widthstatic',oldWidth + diffX);
								widthArr = [];
								_self.find('.colResize div').each(function(index){
									widthArr.push($(this).attr('widthstatic'));
								});
		
								_self.find('td').each(function(){
									if($(this).attr('field') == thisField){
										var thisDiv = $(this).find('div');
										thisDiv.width(oldWidth + diffX+'px');
									}
								});
								Datagrid.firstColTdHeightResize();
							}
						});
						$(document).bind('mouseup.colResize', function(){
							_drag1 = false;
							$(document).unbind('.colResize');
						});
					}
				});
				_self.find('.dgHeader .colResize div').mouseup(function(){
					$(this).removeClass('resizeHover');
				});
			},
			
			adjustHeight: function(){
	        	var nowHeight = _self.find('.dgHeader').outerHeight() + _self.find('.dgContentTable').outerHeight();
	        	var contentTableWidth = _self.find('.dgContentTable').outerWidth(),
	        		contentTableHeight = _self.find('.dgContentTable').outerHeight(),
	        		contentWidth = _self.find('.dgContent').outerWidth(),
	        		contentHeight = _self.find('.dgContent').outerHeight();
	        	
	        	if(opt.showFooter){
	        		nowHeight += _self.find('.dgFooter').outerHeight();
	        	}
	        	
				if(nowHeight < opt.height){
					if(contentTableWidth > contentWidth){
						_self.height(nowHeight+19);
						_self.find('.dgContent').height(contentTableHeight + 18);
					}else{
						_self.height(nowHeight);
						_self.find('.dgContent').height(contentTableHeight);
					}
					if(opt.hasFirstCol){
						if(opt.hasFirstCol){
							_self.find('.dgFirstCol .tableCon').css({'height': _self.outerHeight() - dgHeaderHeight - dgFooterHeight - 3});
						}
					}
				}
				adjustAble = false;
	        },
	        
	        reSetWidth: function(){
				dgWidth = _self.width() - 18;
				var bai = widthSum/dgWidth;
				widthArrNew = [];
				var resizeLeft = 0;
				$.each(widthArrFixed, function(index, val){
					if(opt.autoWidth){
						var newWidth = Math.floor(val/bai) - opt.gapWidth;
						newWidth = newWidth < val ? val : newWidth;
						resizeLeft += newWidth + opt.gapWidth;
					}else{
						var newWidth = val;
						resizeLeft += parseInt(newWidth) + opt.gapWidth;
					}
					_self.find('.dgHeader .dgHeaderTr td').eq(index).find('.dgHeaderTdDiv').width(newWidth);
					_self.find('.dgHeader .colResize div').eq(index).attr('widthstatic',newWidth);
					_self.find('.dgHeader .colResize div').eq(index).css('left', (resizeLeft - 3));
					widthArrNew.push(newWidth);
				});
				widthArr = widthArrNew;
			},
			
			//表格内容宽度重设
			colWidthSet: function(){
				widthArr = [];
				var headerTdDiv = _self.find('.dgHeader .dgHeaderTr td .dgHeaderTdDiv');
				headerTdDiv.each(function(index){
					widthArr.push(parseInt($(this).css('width')));
				});
				
				var dgContentTableTr = _self.find('.dgContentTable tr');
				dgContentTableTr.each(function(index){
					$(this).find('td').each(function(i){
						$(this).find('.dgContentInnerDiv').width(widthArr[i]);
					});
				});
			},
			
			//改变表格颜色
			trColorEvent: function(){
				var _trFirstCol = _self.find('.dgFirstCol .tableCon tr');
				var _trContent = _self.find('.dgContentTable tr');
				
				_trFirstCol.filter(':odd').addClass('trOdd');
				_trContent.filter(':odd').addClass('trOdd');
				
				
				//表格hover变色
				_trFirstCol.hover(function(){
					$(this).addClass('trHover');
					_trContent.eq(_trFirstCol.index($(this))).addClass('trHover');
				}, function(){
					$(this).removeClass('trHover');
					_trContent.eq(_trFirstCol.index($(this))).removeClass('trHover');
				});
				
				//表格点击变色
				_trFirstCol.die().live('click', function(){
					$(this).addClass('trClick').siblings().removeClass('trClick');
					_trContent.eq(_trFirstCol.index($(this))).addClass('trClick').siblings().removeClass('trClick');
				});
				
				
				//表格hover变色
				_trContent.hover(function(){
					$(this).addClass('trHover');
					_trFirstCol.eq(_trContent.index($(this))).addClass('trHover');
				}, function(){
					$(this).removeClass('trHover');
					_trFirstCol.eq(_trContent.index($(this))).removeClass('trHover');
				});
				
				//表格点击变色
				_trContent.die().live('click', function(){
					$(this).addClass('trClick').siblings().removeClass('trClick');
					_trFirstCol.eq(_trContent.index($(this))).addClass('trClick').siblings().removeClass('trClick');
				});
			},
			
			firstColTdHeightResize: function(){
				var dgContentTableTr = _self.find('.dgContentTable tr'),
				firstColTd = _self.find('.dgFirstCol .tableCon tr');
				var n = 0;
				firstColTd.each(function(i, v){
					if($(this).attr('rowspan') && $(this).attr('rowspan') != 1 ){
						n++;
						return true;
					}
					$(this).height(dgContentTableTr.eq(i-n).outerHeight());
				});
			},
	        
			//静态数据
	        addStaticData: function(){
	        	var _firstCol = _self.find('.dgFirstCol .tableCon table');
				$.each(opt.firstColData, function(i, v){
					_firstCol.append('<tr><td width="'+opt.firstColWidth+'">'+v+'</td></tr>');
				});
				var _conCol = _self.find('.dgContentTable');
				var headerTdDiv = _self.find('.dgHeader .dgHeaderTr td .dgHeaderTdDiv');
				widthArr = [];
				headerTdDiv.each(function(index){
					widthArr.push(parseInt($(this).css('width')));
				});
				$.each(opt.staticData, function(i, v){
					var thisTr = $('<tr></tr>');
					_conCol.append(thisTr);
					$.each(v, function(key, value){
						thisTr.append('<td><div class="dgContentInnerDiv" style="width:'+widthArr[key]+'px; text-align:'+alignArr[key]+';">'+value+'</div></td>');
					})
				});
				Datagrid.trColorEvent();
				
				if(opt.heightAdjust){
					//矫正表格高度
					adjustAble && Datagrid.adjustHeight();
				}
	        },
	        
	        
	        //后台请求获得数据
			addAsyncData: function(pageNow, rowNum, getDataTotal){
				var headerTdDiv = _self.find('.dgHeader .dgHeaderTr td .dgHeaderTdDiv');
				widthArr = [];
				headerTdDiv.each(function(index){
					widthArr.push(parseInt($(this).css('width')));
				});
				
				_self.find('.dgHeader').css('margin-left','0px');
				
				//数据加载中的loading效果
				_self.find('.dgLoading').css({'width': _self.outerWidth(), 'height': _self.outerHeight()}).show();
				
				
				//传送页面参数,其中当前页和显示行数是必须的
				var _param = {'pageNow': pageNow, 'rowsNum':rowNum};
				if(opt.dataParam){
					$.extend(_param, opt.dataParam);
				};
				if(opt.sortType == 'ajax'){
					$.extend(_param, {'sortRule':opt.sortRule, 'sortOrderBy':opt.sortOrderBy});
				}
				
				//第一次加载数据时获得数据的条数
				getDataTotal && $.extend(_param, {'getDataTotal': 1});
				
		        $.ajax({
		            url: opt.url,
		            type: opt.method,
		            data: _param,
		            dataType: 'json',
		            timeout: opt.timeout*1000,
		            success: function(data){
		        		opt.debugAjax && win.console && console.log(data);
		            	//显示表格
		            	var contentStr = '', dgFirstColTableStr = '';
		            	var _rowNum = _self.find('.rowNum').val(), rowspanName, rowspanMap = {};
		            	
						$.each(data.rows, function(key, val){
							if(opt.hasFirstCol){
								if(opt.firstRowspan !== false){
									dgFirstColTableStr += '<tr>';
									rowspanName = val.firstRowspanName;
									if(rowspanMap[rowspanName] == undefined){
										rowspanMap[rowspanName] = 1;
										dgFirstColTableStr += '<td width="80" row="'+rowspanName+'" rowspan="0">'+rowspanName+'</td>';
									}else{
										rowspanMap[rowspanName] = ++rowspanMap[rowspanName];
									}
									dgFirstColTableStr += '<td width='+opt.firstColWidth+'>'+val.firstCol+'</td>';
									dgFirstColTableStr += '</tr>';
								}else{
									dgFirstColTableStr += '<tr><td width='+opt.firstColWidth+'>'+((pageNow-1)*_rowNum + 1 + key)+'</td></tr>';
								}
							}
							
							contentStr += '<tr>';
							for(var i = 0; i < fieldArr.length; i++){
								var j = 0;
								$.each(val, function(k, v){
									if(k == fieldArr[i]){
										var _display = (widthArr[i] == 0) ? ' style="display:none;"' : '';
										var _val = (formatterArr[i] == 0) ? v : formatterArr[i](val);
										contentStr += '<td field="'+fieldArr[i]+'"'+_display+'><div class="dgContentInnerDiv" style="width:'+widthArr[i]+'px; text-align:'+alignArr[i]+';">'+_val+'</div></td>';
										j = 1;
									}
								});
								if(j == 0){
									contentStr += '<td field="'+fieldArr[i]+'"><div class="dgContentInnerDiv" style="width:'+widthArr[i]+'px; text-align:'+alignArr[i]+';">'+formatterArr[i](val)+'</div></td>';
								}
							}
							contentStr += '</tr>';
						});
						
						_self.find('.dgLoading').hide();
						_self.find('.dgContentTable').html(contentStr);
						
						if(opt.hasFirstCol){
							_self.find('.dgFirstCol .tableCon table').html(dgFirstColTableStr);
							var firstColTd = _self.find('.dgFirstCol .tableCon td');
							firstColTd.each(function(i,v){
								if($(this).attr('row')){
									$(this).attr('rowspan', rowspanMap[$(this).attr('row')]);
									return;
								}
							});
						};
						
						if(opt.conDivAuto){
							_self.find('.dgContentTable .dgContentInnerDiv').addClass('auto');
							Datagrid.firstColTdHeightResize();
							
							if(opt.hasFirstCol){
								_self.find('.dgFirstCol .tableCon').css({'height': _self.outerHeight() - dgHeaderHeight - dgFooterHeight - 3});
							}
							_self.find('.dgResizeRight').css('height', _self.outerHeight());
						};
						
						if(opt.dgAutoHeight){
							var dgContentHeight = _self.find('.dgContentTable').outerHeight();
							_self.find('.dgContent').height(dgContentHeight);
							_self.height(dgHeaderHeight + dgFooterHeight + dgContentHeight);
							if(opt.hasFirstCol){
								_self.find('.dgFirstCol .tableCon').css({'height': _self.outerHeight() - dgHeaderHeight - dgFooterHeight - 3});
							}
						};
						
						//如果是第一次请求数据则获得分页总数，翻页之类的数据则从total里面得到。
						var dataTotal = getDataTotal ? data.total : _self.find('.total').html();
						
						_self.find('.pageNow').val(data.pageNow);
						_self.find('.total').html(dataTotal);
						_self.find('.pageTotal').html(Math.ceil(dataTotal/_rowNum));
						_self.find('.itemStart').html((pageNow-1)*_rowNum + 1);
						if(pageNow*_rowNum < dataTotal){
							_self.find('.itemEnd').html(pageNow*_rowNum);
						}else{
							_self.find('.itemEnd').html(dataTotal);
						}
						
						if(data.pageNow == 1){
							_self.find('.pageFirst').removeClass('pageFirstAble');
							_self.find('.pagePrev').removeClass('pagePrevAble');
						}else{
							_self.find('.pageFirst').addClass('pageFirstAble');
							_self.find('.pagePrev').addClass('pagePrevAble');
						}
						
						if(data.pageNow == _self.find('.pageTotal').html()){
							_self.find('.pageNext').removeClass('pageNextAble');
							_self.find('.pageLast').removeClass('pageLastAble');
						}else{
							_self.find('.pageNext').addClass('pageNextAble');
							_self.find('.pageLast').addClass('pageLastAble');
						}

						Datagrid.trColorEvent();

						colIndexStatic = null;
						
						if(opt.heightAdjust){
							adjustAble && Datagrid.adjustHeight();
						}
						
						//表格加载完毕后的执行
				        opt.ajaxCallback(data, _self);
						
		            },
		            error: function(xml,error){
		            	if(error == 'timeout'){ 
		            		alert(opt.timeoutMsg);
		            	}
		            	_self.find('.dgLoading').hide();
		            }
		        });
	        },
	        
	        dgHeight: function(){
				_self.find('.dgContent').css('height', opt.height - dgHeaderHeight - dgFooterHeight);
				if(opt.hasFirstCol){
					_self.find('.dgFirstCol .tableCon').css({'height': opt.height - dgHeaderHeight - dgFooterHeight});
				}
				_self.find('.dgResizeRight').css('height', opt.height);
	        },
	        
	        //存储头部的信息
	        addHeaderInfo: function(){
	        	dgHeaderHeight = _self.find('.dgHeader').outerHeight();
				dgFooterHeight = opt.showFooter ? _self.find('.dgFooter').outerHeight() : 0;
	    		$.each(opt.columns, function(key, val){
	    			var _formatterHas = 0;
	    			$.each(val, function(k,v){
	    				if(k == 'field'){
	    					fieldArr.push(v);
	    				}
	    				if(k == 'align'){
	    					alignArr.push(v);
	    				}
	    				if(k == 'formatter'){
	    					formatterArr.push(v);
	    					_formatterHas = 1;
	    				}
	    			});
	    			if(_formatterHas == 0){
	    				formatterArr.push(0);
	    			}
	    		});
	        }
		}
		
		Datagrid.init();
		Datagrid.addEvent();
		Datagrid.addHeaderInfo();
		
		!opt.dgAutoHeight && Datagrid.dgHeight();
			
		//隐藏列
		opt.colToggle && Datagrid.colToggle();

		opt.dgResize && Datagrid.resize();
		
		opt.colResize && Datagrid.colResize();
		
		//填充表格数据
		if(opt.staticData !== false){
			Datagrid.addStaticData();
		}else{
			Datagrid.addAsyncData(1, _self.find('.rowNum').val(), true);
		}
        
        //表格加载完毕后的执行
        opt.initCallback(_self);
	};
}(this, jQuery);