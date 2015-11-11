/**
 * AvatarUI-选择框
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Chosen = function(options){
		var dafaults = {
			data: [],				//数据
			chosenWidth: 'auto',	//选择框宽度
			dataListWidth: 200,		//下拉框的宽度
			dataListHeight: 280,	//下拉框的高度
			
			beforeCallback: function(_self, data){},		//填充数据之前
			initCallback: function(_self){},				//初始化完毕
			initSelectedValue: [],							//初始化选中的值
			selectedCallback: function(id, name, _self){},	//选择
			removeCallback: function(id, name, _self){},	//反选
			
			placeholderTxt: '请选择...',	//初始化提示文字
			searchOpt: false,				//是否可搜索

			searchBack: false,				//后台搜索
			searchAjaxURL: '',				//后台搜索url
			ajaxParam: {},					//后台搜索的参数

			clearOpt: false,				//是否可以删除选择项	

			multi: false,		//是否多选
			multiInline: false,	//选择的多选内容是连在一起的
			maxSize: 5,			//选择的最大条数
			maxSizeTip: '',		//超出选择后的提示
			joinChar: ','		//选择连接符
		};
		
		var opt = $.extend({}, dafaults, options);
		var rightPadding = opt.clearOpt ? 40 : 20;

		//数组扩展
		Array.prototype.indexOf = function(Object){
		    for(var i = 0, len = this.length; i < len; i++){
		        if(this[i] == Object){
		            return i;
		        }
		    }
		    return -1;
		};

		//数组删除项
		Array.prototype.remove = function(val) {
		    var index = this.indexOf(val);
		    if (index > -1) {
		        this.splice(index, 1);
		    }
		};

		//创建chosen对象
		var Chosen = {
			//初始化
			_init: function(){
				var selectedWidth = opt.chosenWidth - rightPadding - 6;
				var _dataSelectedCon;
				if(opt.multi){
					if(opt.multiInline){
						_dataSelectedCon = '<a href="javascript:;" class="fixedText"></a>';
					}else{
						_dataSelectedCon = '<div class="dataSelectedCon"></div>';
					}
				}else{
					_dataSelectedCon = '<a href="javascript:;" class="fixedText"></a>';
				}
				_self.append('<div class="dataSelected" style="padding-right:'+rightPadding+'px"><label class="fixedTextInit">'+opt.placeholderTxt+'</label>'+_dataSelectedCon+'<input type="hidden" class="fixedId" /><input type="hidden" class="fixedVal" /><a href="javascript:;" class="clearSelected"></a><b class="chosenArrow"></b></div>'
					+'<div class="chosenCon">'
					+'<div class="searchKeyword"><input type="text" class="keywords" autocomplete="off" placeholder="关键字搜索…" /><div class="dataList keywordsDataList"><ul></ul></div></div>'
					+'<div class="dataList dataListAll"><ul></ul></div>'
					+'</div>');

				if(typeof opt.chosenWidth == 'number'){
					_self.find('.dataSelected').width(selectedWidth);
					_self.find('.dataSelected .fixedText').width(selectedWidth);
				}

				//绑定数据之前
				opt.beforeCallback(_self, opt.data);

				//是否显示搜索
				if(opt.searchOpt){
					if(opt.searchBack){
						Chosen._keywordsSearchBack();
					}else{
						if(opt.data.length > 5){
							Chosen._keywordsSearch();
						}
					}
				}

				//选择下拉框的宽度
				opt.dataListWidth && _self.find('.chosenCon').width(opt.dataListWidth);

				var dataListAll = _self.find('.dataListAll');
				var dataListAllUl = dataListAll.find('ul');

				$.each(opt.data, function(k, v){
					//填充内容
					dataListAllUl.append('<li thisid="'+v.id+'" thisval="'+v.name+'">'+v.name+'</li>');
				});
				
				//默认选中的内容
				opt.initSelectedValue.length > 0 && Chosen._initSelectedFill();

				dataListAllUl.find('li').filter(':odd').addClass('odd');
				Chosen._bind();
			},

			//默认选项填充
			_initSelectedFill: function(){
				_self.find('.fixedTextInit').hide();
				
				var selectedId = [];
				var dataListAll = _self.find('.dataListAll');
				var dataListAllUl = dataListAll.find('ul');
				
				$.each(opt.initSelectedValue, function(k, v){
					dataListAllUl.find('li').each(function(){
						var _name = $(this).attr('thisval');
						var _id = $(this).attr('thisid');;
						if(_name == v){
							selectedId.push(_id);
						}
					});
				});
				
				if(opt.multi && !opt.multiInline){
					for(var i = 0, len = selectedId.length; i < len; i++){
						_self.find('.dataSelectedCon').append('<span class="item" thisid="'+selectedId[i]+'" thisval="'+opt.initSelectedValue[i]+'"><a href="javascript:;" class="itemText">'+opt.initSelectedValue[i]+'</a><a href="javascript:;" class="delItem"></a></span>');
					}
				}else{
					_self.find('.fixedText').html(opt.initSelectedValue.join(opt.joinChar));
				}
				
				_self.find('.fixedId').val(selectedId.join(opt.joinChar));
				_self.find('.fixedVal').val(opt.initSelectedValue.join(opt.joinChar));
			},

			//上下键移动选择内容
			_selectItemMove: function(method){
				var _activeDatalist = _self.find('.dataListAll').is(':hidden') ? _self.find('.keywordsDataList') : _self.find('.dataListAll');
				var dataliLen = _activeDatalist.find('li').length;
				
				_activeDatalist.find('li.hover').removeClass('hover');
				_activeDatalist.find('li').eq(_i).addClass('hover');
				var selectedLi = _activeDatalist.find('li').eq(_i);

				if(method == 'down'){
					if(_i < dataliLen - 1){
						_i++;
					}
				}else{
					if(_i > 0){
						_i--;
					}
				}

				var itemHeight = selectedLi.outerHeight();
	            var itemTop = selectedLi.position().top;

	            if(itemHeight + itemTop > _activeDatalist.height()){
	                _activeDatalist.scrollTop(_activeDatalist.scrollTop() + itemTop + itemHeight  - _activeDatalist.height());
	            }else if(itemTop < 0){
	                _activeDatalist.scrollTop(_activeDatalist.scrollTop() + itemTop);
	            }
			},

			//关键字搜索
			_keywordsSearch: function(){
				_self.find('.searchKeyword').show();

				_self.find('.searchKeyword .keywords').width(opt.dataListWidth - 20);

				var dataListAll = _self.find('.dataListAll');
				var keywordDataList = _self.find('.keywordsDataList');
				var keywordDataListUI = _self.find('.keywordsDataList ul');

				_self.find('.keywords').keyup(function(e){
					_i = 0;
                	var _keyword = $(this).val(), keyword;
					if(_keyword != ''){
						keyword = _keyword;
						
						dataListAll.hide();
						keywordDataList.show();
						keywordDataListUI.html('');
						
						if(RegExp('([\(])').test(_keyword)){
							keyword = _keyword.replace(/(\()/, "\\"+"$1");
						}
						if(RegExp('([\)])').test(_keyword)){
							keyword = _keyword.replace(/(\))/, "\\"+"$1");
						}
						if(RegExp('([\[])').test(_keyword)){
							keyword = _keyword.replace(/(\[)/, "\\"+"$1");
						}
						if(RegExp('([\]])').test(_keyword)){
							keyword = _keyword.replace(/(\])/, "\\"+"$1");
						}

						dataListAll.find('li').each(function(k, v){
							var thisVal = $(this).attr('thisval');
							var thisHtml = $(this).html();
							var thisId = $(this).attr('thisid');
							
							if(RegExp(keyword, "i").test(thisVal)){
								thisHtml = thisHtml.replace(eval("/("+keyword+")/gi"), '<b>'+'$1'+'</b>');
								var _active = _self.find('.fixedId').val().split(opt.joinChar).indexOf(thisId) > -1 ? 'active' : '';
								keywordDataListUI.append('<li thisid="'+thisId+'" thisval="'+thisVal+'" class="'+_active+'">'+thisHtml+'</li>');
							}
						});

						if(!keywordDataListUI.find('li').length){
							keywordDataListUI.append('<li>没有<b>"'+_keyword+'"</b>的相关结果。</li>');
						}
						keywordDataListUI.find('li').filter(':odd').addClass('odd');

						var thisHeight = keywordDataListUI.height();
						keywordDataList.height(thisHeight > opt.dataListHeight ? opt.dataListHeight : thisHeight);

						_self.find('.dataList li').hover(function(){
							$(this).addClass('hover');
						}, function(){
							$(this).removeClass('hover');
						});
					}else{
						dataListAll.show();
						keywordDataList.hide().find('ul').html('');
					}
					
					var thisSelectedId = _self.find('.fixedId').val().split(opt.joinChar);
					_self.find('.dataList li').each(function(k, v){
						if(thisSelectedId.indexOf($(this).attr('thisid')) > -1){
							$(this).addClass('active');
						}
					});
				})
			},

			//后台关键字搜索
			_keywordsSearchBack: function(){
				_self.find('.searchKeyword').append('<a href="javascript:;" class="btn btnPrimary keywordsSearch">搜 索</a>');

				_self.find('.searchKeyword').show();

				_self.find('.searchKeyword .keywords').width(opt.dataListWidth - 20);

				var dataListAll = _self.find('.dataListAll');
				var keywordDataList = _self.find('.keywordsDataList');
				var keywordDataListUI = _self.find('.keywordsDataList ul');

				_self.find('.keywords').keyup(function(e){
					var _keyword = $(this).val();

					if(_keyword != ''){
						dataListAll.hide();
						keywordDataList.show();
						$('.keywordsSearch').addClass('keywordsSearchActive');
					}else{
						$('.keywordsSearch').removeClass('keywordsSearchActive');
						dataListAll.show();
						keywordDataList.hide().find('ul').html('');
					}
					
					var thisSelectedId = _self.find('.fixedId').val().split(opt.joinChar);
					_self.find('.dataList li').each(function(k, v){
						if(thisSelectedId.indexOf($(this).attr('thisid')) > -1){
							$(this).addClass('active');
						}
					});
				});

				//点击搜索按钮
				_self.find('.keywordsSearch').click(function(){
					if($(this).hasClass('keywordsSearchActive')){
						keywordDataListUI.html('<div style="padding:5px;">正在搜索...</div>');
						
						var _keyword = _self.find('.keywords').val();
						keyword = _keyword;
						var ajaxParam = $.extend({}, opt.ajaxParam, {'keywords': 'keywords=%'+keyword.toLowerCase()+'%'});
	                	$.ajax({
	                		url: opt.searchAjaxURL,
	                		data: ajaxParam,
	                		dataType: 'json',
	                		success: function(data){
	                			$('.keywordsSearch').removeClass('keywordsSearchActive');
								keywordDataListUI.html('');
								
	                			if(data.length == 0){
	                				keywordDataListUI.append('<li>没有<b>"'+_keyword+'"</b>的相关结果。</li>');
	                			}else{
	                				$.each(data, function(k, v){
		            					if(!RegExp('[?]').test(v.name)){
		            						keywordDataListUI.append('<li thisid="'+v.id+'" thisval="'+v.name+'">'+v.name+'</li>');
		            					}
		            				});
	                				
	                				keywordDataListUI.find('li').filter(':odd').addClass('odd');
	                				_self.find('.dataList li').hover(function(){
										$(this).addClass('hover');
									}, function(){
										$(this).removeClass('hover');
									});
	                			}
	                			
	                			var thisHeight = keywordDataListUI.height();
								keywordDataList.height(thisHeight > opt.dataListHeight ? opt.dataListHeight : thisHeight);
	                		}
	                	})
					}
				});
			},

			//行为绑定
			_bind: function(){
				var dataListAll = _self.find('.dataListAll');
				var dataListAllUl = dataListAll.find('ul');

				//hover
				_self.find('.dataSelected').hover(function(){
					$(this).addClass('dataSelectedHover');
					var _top = _self.find('.dataSelectedCon').outerHeight();
						_top = _top < 24 ? 24 : _top;
						_self.find('.dataSelected').css('height', _top);
				},function(){
					if(_self.find('.chosenCon').is(':hidden')){
						$(this).removeClass('dataSelectedHover');
							_self.find('.dataSelected').css('height', 24);
					}
				});

				_self.find('.dataList li').hover(function(){
					$(this).addClass('hover');
				}, function(){
					$(this).removeClass('hover');
				});

				//选择框点击操作
				_self.find('.dataSelected').die().live('click', function(){
					if(_self.find('.chosenCon').is(':hidden')){
						if($(this).outerWidth() > _self.find('.chosenCon').outerWidth()){
							$(this).removeClass('dataSelectedActiveFFF');
							_self.find('.chosenCon').addClass('chosenConFFF');
						}else{
							$(this).addClass('dataSelectedActiveFFF');
							_self.find('.chosenCon').removeClass('chosenConFFF');
						}

						$(this).addClass('dataSelectedActive');
						_self.find('.chosenCon').show();
						_self.find('.keywords').focus();
						
						_self.find('.dataList li.active').removeClass('active');
						if(!_self.find('.dataListAll').is(':hidden')){
							_i = 0;
							//dataListAll.find('li').eq(0).addClass('active');
							var _thisHeight = dataListAllUl.outerHeight();
							dataListAll.height(_thisHeight > opt.dataListHeight ? opt.dataListHeight : _thisHeight);
						}

						var thisId = _self.find('.fixedId').val().split(opt.joinChar);
						_self.find('.dataList li').each(function(){
							if(thisId.indexOf($(this).attr('thisid')) != -1){
								$(this).addClass('active');
							}
						})

						var _top = _self.find('.dataSelectedCon').outerHeight();
							_top = _top < 24 ? 24 : _top;
						_self.find('.dataSelected').css('height', _top);
						_self.find('.chosenCon').css('top', _top + 1);

						_self.find('.chosenArrow').addClass('chosenArrowUp');
					}else{
						_self.find('.dataSelected').removeClass('dataSelectedActive');
						_self.find('.chosenCon').hide();
						_self.find('.dataSelected').removeClass('dataSelectedActiveFFF');
						_self.find('.chosenCon').addClass('chosenConFFF');
						_self.find('.dataSelected').height(24);
						_self.find('.chosenArrow').removeClass('chosenArrowUp');
					}
				});

				//列表选择内容点击
				_self.find('.dataList li').die().live('click', function(){
					var thisId = $(this).attr('thisid');
					var thisVal = $(this).attr('thisval');

					if(opt.multi){
						if($(this).hasClass('active')){
							var _thisVal = _self.find('.fixedVal').val().split(opt.joinChar);
							var _thisId = _self.find('.fixedId').val().split(opt.joinChar);

							_thisVal.remove(thisVal);
							_thisId.remove(thisId);

							_self.find('.fixedVal').val(_thisVal.join(opt.joinChar));
							_self.find('.fixedId').val(_thisId.join(opt.joinChar));

							if(opt.multiInline){
								_self.find('.fixedText').html(_thisVal.join(opt.joinChar));
							}else{
								_self.find('.dataSelectedCon .item').each(function(){
									var thisid = $(this).attr('thisid');
									if(thisid == thisId){
										$(this).remove();
										if(_self.find('.dataSelectedCon .item').length == 0){
											_self.find('.fixedTextInit').show();
											opt.clearOpt && _self.find('.clearSelected').hide();
										}
										return false;
									}
								});
							}
							$(this).removeClass('active');
							
							opt.removeCallback(thisId, thisVal, _self);
						}else{
							if(_self.find('.fixedId').val().split(opt.joinChar).length == opt.maxSize){
								if(opt.maxSizeTip == ''){
									alert('只能选择 '+opt.maxSize+' 项！');
								}else{
									alert(opt.maxSizeTip);
								}
								return;
							}
							if(_self.find('.fixedVal').val() != ''){
								_self.find('.fixedVal').val(_self.find('.fixedVal').val() + opt.joinChar + thisVal);
								_self.find('.fixedId').val(_self.find('.fixedId').val() + opt.joinChar + thisId);
							}else{
								_self.find('.fixedVal').val(thisVal);
								_self.find('.fixedId').val(thisId);
							}

							if(opt.multiInline){
								_self.find('.fixedText').html(_self.find('.fixedVal').val()).attr('title', _self.find('.fixedVal').val());
							}else{
								_self.find('.dataSelectedCon').append('<span class="item" thisid="'+thisId+'" thisval="'+thisVal+'"><a href="javascript:;" class="itemText">'+thisVal+'</a><a href="javascript:;" class="delItem"></a></span>');
							}
							_self.find('.fixedTextInit').hide();
							opt.clearOpt && _self.find('.clearSelected').show();
							$(this).addClass('active');
							
							opt.selectedCallback(thisId, thisVal, _self);
						}
						var _top = _self.find('.dataSelectedCon').outerHeight();
						_top = _top < 24 ? 24 : _top;
						_self.find('.dataSelected').css('height', _top);
						_self.find('.chosenCon').css('top', _top + 1);

						if(typeof opt.chosenWidth != 'number'){
							if(_self.find('.dataSelected').outerWidth() > _self.find('.chosenCon').outerWidth()){
								_self.find('.dataSelected').removeClass('dataSelectedActiveFFF');
								_self.find('.chosenCon').addClass('chosenConFFF');
							}else{
								_self.find('.dataSelected').addClass('dataSelectedActiveFFF');
								_self.find('.chosenCon').removeClass('chosenConFFF');
							}
						}
					}else{
						_self.find('.fixedVal').val(thisVal);
						_self.find('.fixedId').val(thisId);

						_self.find('.fixedText').html(thisVal).attr('title', thisVal);

						_self.find('.dataSelected').removeClass("dataSelectedActive dataSelectedHover dataSelectedActiveFFF");

						opt.clearOpt && _self.find('.clearSelected').show();
						_self.find('.chosenArrow').removeClass('chosenArrowUp');
						_self.find('.fixedTextInit').hide();
						_self.find('.chosenCon').hide();
						
						opt.selectedCallback(thisId, thisVal, _self);
					}
				});

				//选择时上下键操作
				_self.find('.keywords').die().live('keydown', function(e){
					 switch(e.keyCode){
		                case 38: //up
		                    Chosen._selectItemMove('up');
		                    break;
		                case 40: //down
		                    Chosen._selectItemMove('down');
		                    break;
		                case 13: //enter
		                    _self.find('.dataSelected').removeClass('dataSelectedActive');
							_self.find('.chosenCon').hide();

							var _selectedLi = _self.find('.dataList li.hover');

							var thisId = _selectedLi.attr('thisid');
							var thisVal = _selectedLi.attr('thisval');
							if(thisId){
								if(opt.multi){
									if(_self.find('.fixedVal').val() != ''){
										_self.find('.fixedVal').val(_self.find('.fixedVal').val() + opt.joinChar + thisVal);
										_self.find('.fixedId').val(_self.find('.fixedId').val() + opt.joinChar + thisId);
									}else{
										_self.find('.fixedVal').val(thisVal);
										_self.find('.fixedId').val(thisId);
									}

									if(opt.multiInline){
										_self.find('.fixedText').html(_self.find('.fixedVal').val()).attr('title', _self.find('.fixedVal').val());
									}else{
										_self.find('.dataSelectedCon').append('<span class="item" thisid="'+thisId+'" thisval="'+thisVal+'"><a href="javascript:;" class="itemText">'+thisVal+'</a><a href="javascript:;" class="delItem"></a></span>');
									}

									_self.find('.fixedTextInit').hide();

									var _top = _self.find('.dataSelectedCon').outerHeight();
									_top = _top < 24 ? 24 : _top;
									_self.find('.dataSelected').css('height', _top);
									_self.find('.chosenCon').css('top', _top + 1);

								}else{
									_self.find('.fixedVal').val(thisVal);
									_self.find('.fixedId').val(thisId);

									_self.find('.fixedText').html(thisVal).attr('title', thisVal);
									_self.find('.dataSelected').removeClass("dataSelectedActive dataSelectedActiveFFF");

									_self.find('.fixedTextInit').hide();
									_self.find('.chosenCon').hide();
								}
								opt.selectedCallback(thisId, thisVal, _self);
							}
		                    break;
		            }
				});

				//删除选择项操作
				if(opt.clearOpt){
					_self.find('.clearSelected').die().live('click', function(e){
						if(opt.multi){
							_self.find('.dataSelectedCon').html('');
							_self.find('.dataSelected').height(24)
							_self.find('.chosenCon').css('top', 25);
							if(opt.multiInline){
								_self.find('.fixedText').html('').removeAttr('title');
							}
						}else{
							_self.find('.fixedText').html('').removeAttr('title');
						}
						_self.find('.dataList li').removeClass('active');
						_self.find('.fixedTextInit').show();
						_self.find('.fixedId').val('');
						_self.find('.fixedVal').val('');
						$(this).hide();
						if(!_self.find('.chosenCon').is(':hidden')){
							if(typeof opt.chosenWidth != 'number'){
								if(_self.find('.dataSelected').outerWidth() > _self.find('.chosenCon').outerWidth()){
									_self.find('.dataSelected').removeClass('dataSelectedActiveFFF');
									_self.find('.chosenCon').addClass('chosenConFFF');
								}else{
									_self.find('.dataSelected').addClass('dataSelectedActiveFFF');
									_self.find('.chosenCon').removeClass('chosenConFFF');
								}
							}
						}
						e.stopPropagation();
					});
				};

				//清除选择内容
				_self.find('.delItem').die().live('click', function(e){
					var thisId = $(this).parent().attr('thisid');
					var thisVal = $(this).parent().attr('thisval');
					$(this).parent().remove();

					var _thisVal = _self.find('.fixedVal').val().split(opt.joinChar);
					var _thisId = _self.find('.fixedId').val().split(opt.joinChar);

					_thisVal.remove(thisVal);
					_thisId.remove(thisId);

					_self.find('.fixedVal').val(_thisVal.join(opt.joinChar));
					_self.find('.fixedId').val(_thisId.join(opt.joinChar));

					_self.find('.dataList li').each(function(){
						if($(this).attr('thisid') == thisId){
							$(this).removeClass('active');
						}
					});
					var _top = _self.find('.dataSelectedCon').outerHeight();
						_top = _top < 24 ? 24 : _top;
						_self.find('.chosenCon').css('top', _top + 1);

					if(!_self.find('.chosenCon').is(':hidden')){
						if(typeof opt.chosenWidth != 'number'){
							if(_self.find('.dataSelected').outerWidth() > _self.find('.chosenCon').outerWidth()){
								_self.find('.dataSelected').removeClass('dataSelectedActiveFFF');
								_self.find('.chosenCon').addClass('chosenConFFF');
							}else{
								_self.find('.dataSelected').addClass('dataSelectedActiveFFF');
								_self.find('.chosenCon').removeClass('chosenConFFF');
							}
						}
					}
					if(!_self.find('.fixedId').val().split(opt.joinChar).length){
						opt.clearOpt && _self.find('.clearSelected').hide();
						_self.find('.fixedTextInit').show();
					}
					if(_self.find('.dataSelectedCon').html() == ''){
						_self.find('.fixedTextInit').show();
					}
					
					opt.removeCallback(thisId, thisVal, _self);
					e.stopPropagation();
				});

				//绑定点击隐藏
				$(document).unbind('mousedown.Chosen');
				$(document).bind('mousedown.Chosen', function(e){
					var _thisChosen = $(e.target).closest('.chosen');
					if(_thisChosen.length == 0){
						$('.dataSelected').removeClass('dataSelectedActive dataSelectedActiveFFF dataSelectedHover').height(24);
						$('.chosenCon').hide().addClass('chosenConFFF');
						$('.chosenArrow').removeClass('chosenArrowUp');
					}else{
						$('.chosen').each(function(){
							if($(this).attr('id') == _thisChosen.attr('id')){
								return;
							}
							$(this).find('.dataSelected').removeClass('dataSelectedActive dataSelectedActiveFFF dataSelectedHover').height(24);
							$(this).find('.chosenCon').hide().addClass('chosenConFFF');
							$(this).find('.chosenArrow').removeClass('chosenArrowUp');
						})
					}
				});
			}
		};

		var _self = $(this);
		var _i = 0;
		_self.html('').addClass('chosen');

		Chosen._init();
		opt.initCallback(_self, opt.data);
	}
}(this, jQuery);