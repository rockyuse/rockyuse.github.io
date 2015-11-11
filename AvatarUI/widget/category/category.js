/**
 * AvatarUI-分类
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Category = function(options){
		var defaults = {
			url: "",          //ajax请求的url
			initFid: 0,       //初始化父节点的id
			getData: "ajax",  //选择类型展示类型，"once"为一次性查询出所有数据，"ajax"为逐步加载
			staticData: "",   //静态数据
			
			hasValue: "",     //有级联的value值
			hasName: "",      //有级联的text值
			splitStr: "-"     //分类之间的连接符
		};
		var opt = $.extend({},defaults, options);
		
		var Category = {
			//请求后台获得分类
			getCategory: function(fid){
				$.ajax({
					url: opt.url,
					type: "post",
					data: {"fid": fid, "getData": opt.getData},
					dataType : "json",
					success: function(data){
						jsonData = data;
						//如果已经存在值，则对应显示
						if(opt.hasValue != "" || opt.hasName != ""){
							Category.matchCategory();
						}else{
							Category.jsonDataLoopByFid(fid, data);
						}
					}
				});
			},
			
			//json数据循环
			jsonDataLoopByFid: function(fid, data){
				$.each(data.category, function(key,val){
					if(fid == val.fid){
						if(_self.find(".cate_"+fid+"").length == 0){
							_self.append("<select class=\"cate_"+fid+"\"><option value=\"null\">所有</option></select>");
						}
						_self.find(".cate_"+fid+"").append("<option value=\""+val.id+"\">"+val.name+"</option>");
					}
				});
			},
			
			//json数据循环
			matchSelect: function(selectHas, type){
				$.each(selectHas, function(index, value){
					var id;
					var fid;
					$.each(jsonData.category, function(key,val){
						if(type == "value"){
							if(value == val.id){
								id = val.id
								fid = val.fid;
							}
						}else{
							if(value == val.name){
								id = val.id;
								fid = val.fid;
							}
						}
					});
					if(_self.find(".cate_"+fid+"").length == 0){
						_self.append("<select class=\"cate_"+fid+"\"><option value=\"null\">所有</option></select>");
						$.each(jsonData.category, function(i,v){
							if(fid == v.fid){
								_self.find(".cate_"+fid+"").append("<option value=\""+v.id+"\">"+v.name+"</option>");
							}
						});
					}
					_self.find(".cate_"+fid+"").val(id);
				})
			},
			
			//根据已有值匹配展示下拉菜单
			matchCategory: function(){
				if(opt.hasValue != ""){
					var selectArr = opt.hasValue.split(opt.splitStr);
					Category.matchSelect(selectArr, "value");
				}else{
					var selectArr = opt.hasName.split(opt.splitStr);
					Category.matchSelect(selectArr, "name");
				}
			}
		}
		
		var _self = $(this);
		var jsonData = "";
		
		if(opt.staticData != ""){
			data = eval('('+opt.staticData+')');
			jsonData = data;
			Category.jsonDataLoopByFid(opt.initFid, data);
		}else{
			Category.getCategory(opt.initFid);
		}
		
	    $(this).find("select").live("change", function(){
	    	$(this).nextAll("select").remove();
	    	var thisVal = $(this).val();
    	
	    	if(opt.getData != "once"){
	    		Category.getCategory(thisVal);
	    	}else{
	    		Category.jsonDataLoopByFid(thisVal, jsonData);
	    	}
	    });
	};
}(this, jQuery);