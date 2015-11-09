;(function($){
    $('<span style="margin-left:10px; line-height:30px; color:#DB4701">本报表通常情况下将在每天9：30计算完成!</span>').insertAfter('.crumb h1');
    $.fn.AvatarChart = function(options) {
        var dafaults = {
            width: '',
            height: 800,
            cellWidth: 100,
            cellHeight: 40,
            cellNum: 20,
            cellMargin: 5,
            percentWidth: 44,

            data: ''
        };
        
        var opt = $.extend({}, dafaults, options);
        var _self = $(this);
        
        var cellHeightHalf = (opt.cellHeight - 2) / 2;
        var cellOuterWidth = opt.cellWidth + opt.cellMargin * 2;
        var cellWidthHalf = cellOuterWidth / 2;

        var cellWrapWidth = cellOuterWidth * opt.cellNum;


        _self.append('<canvas class="chartCanvas" id="ChartCanvas" width="'+cellWrapWidth+'" height="'+opt.height+'" style="position:absolute; top:0; left:0;"></canvas>');

        _self.append('<div class="chartWrap" style="position:absolute; width:'+cellWrapWidth+'px; z-index:100"></div>');
        var chartWrap = _self.find('.chartWrap');

        var _data = opt.data;
        var replaceStr = function(str){var reg = /%/g;return str.replace(reg, '_')};
        
        var originX = $('#Chart').offset().left;
        var originY = $('#Chart').offset().top;

        var myCanvas = document.getElementById("ChartCanvas");
        if($.browser.msie && $.browser.version < 9){
            myCanvas = window.G_vmlCanvasManager.initElement(myCanvas);
        }
        var cvs =  myCanvas.getContext("2d");



        var thisFirst = _data[0];
        var firstIndex = true;
        chartWrap.append('<div class="chartCon leavl_0"><div rate="100" class="chartConText first ChartTitle_'+replaceStr(thisFirst.name)+'" titlename="'+thisFirst.name+'"><span>'+thisFirst.name+'</span></div></div>');

        creatChart(thisFirst.name, 0, 0);
        creatLine(thisFirst.name, 0, 0);
        
        _self.height(_self.find('.chartWrap').outerHeight());

        _self.find('.chartCon div').hover(function(){
            if(!$(this).hasClass('disable')){
                $(this).addClass('hover');
            }
        }, function(){
            $(this).removeClass('hover');
        });

        _self.find('.chartCon div').die().live('click', function(){
            if(!$(this).hasClass('disable')){
                var thisParent = $(this).parent('.chartCon');
                var index = $('.chartCon').index(thisParent);
                var dd = thisParent.find('div').index($(this));
                if(index == 0){
                    offsetY = cellHeightHalf;
                    firstIndex = true;
                }else{
                    offsetY = cellHeightHalf;
                }
                creatChart($(this).find('span').html(), index, dd, $(this).offset().left - originX + $(this).outerWidth()/2);
                cvs.clearRect(0, $(this).offset().top + offsetY - originY, cellWrapWidth, opt.height);

                creatLine($(this).find('span').html(), index, dd);
                _self.find('.chartCon div').hover(function(){
                    if(!$(this).hasClass('disable')){
                        $(this).addClass('hover');
                    }
                }, function(){
                    $(this).removeClass('hover');
                });
                _self.height(_self.find('.chartWrap').outerHeight());
                
            }
        });

        _self.find('.chartConTextTip').die().live('click', function(e){
            firstIndex = true;
            var thisName = $(this).attr('titlename');

            _self.find('.leavl_0 div').removeClass().addClass('chartConText').addClass('first');
            _self.find('.leavl_0 span').html(thisName).attr('titlename', thisName);

            creatChart(thisName, 0, 0);
            cvs.clearRect(0, 0, cellWrapWidth, opt.height);
            creatLine(thisName, 0);

            _self.find('.chartCon div').hover(function(){
                if(!$(this).hasClass('disable')){
                    $(this).addClass('hover');
                }
            }, function(){
                $(this).removeClass('hover');
            });
            
            _self.height(_self.find('.chartWrap').outerHeight());
            
            $('#BackRoot').show();
            return false;
        });


        function creatChart(fName, leavlIndex, inlineIndex, parentDomX){
            var chartPer = _self.find('.chartPer');
            var chartCon = _self.find('.chartCon');

            var len = chartCon.length;
            if(len > leavlIndex){
                for(var i = len - 1; i > leavlIndex; i--){
                    chartPer.eq(i-1).remove();
                    chartCon.eq(i).remove();
                }
            }

            chartWrap.append('<div class="chartPer"></div><div class="chartCon leavl_'+(leavlIndex+1)+'"></div>');
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var thisOutLen = v.reachName.length;
                    var hasPercent = 0;


                    if(thisOutLen < opt.cellNum){
                        var thisConLen = thisOutLen + 1;
                        // var _left = (opt.cellNum - 1  - thisOutLen) * cellOuterWidth/2 + opt.cellMargin;
                        var _left = opt.cellMargin;

                        if(parentDomX){
                            var thisConWidth = thisConLen * cellOuterWidth / 2;
                            _left = parentDomX - thisConWidth + opt.cellMargin;
                        }
                        _left = _left < opt.cellMargin ? opt.cellMargin : _left
                    }else{
                        var thisConLen = opt.cellNum;
                        var _left = opt.cellMargin;
                    }

                    var fRate;

                    $.each(v.reachName, function(k,v){
                        if(k > 20){
                            return false;
                        }
                        fRate = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).attr('rate');
                        
                        var name = v.name;
                        var percent = v.rate;
                        var _percent = parseFloat(percent);
                        var _thisRate = Math.round(_percent*fRate)/100;
                        hasPercent = hasPercent + _percent;
                        var marginLeft = 0, conMarginLeft = opt.cellMargin, offsetX, offsetY;
                        var noChild = true;
                        $.each(_data, function(k,v){
                            if(v.name == name){
                                noChild = false;
                                return;
                            }
                        });

                        var disableStr = (name == '离开系统' || leavlIndex == 3 || noChild) ? 'disable' : '';
                        var linkStr = (name != '离开系统' && !noChild) ? '<a href="javascript:;" titlename="'+name+'" class="chartConTextTip" title="设为第一级"></a>' : '';
                        var disableStr1 = (name == '离开系统' || noChild) ? 'disable' : '';

                        if(k == 0){
                            conMarginLeft = _left;
                        }
                        
                        _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText '+disableStr1+'" style="margin-right:'+(cellWidthHalf - opt.percentWidth) +'px">'+_thisRate+'%</div>');
                        _self.find('.chartCon').eq(leavlIndex + 1).append('<div rate="'+_thisRate+'" class="chartConText '+disableStr+'" title="点击查看改页面的行为" titlename="'+name+'" style="margin-left:'+conMarginLeft+'px"><span>'+name+'</span>'+linkStr+'</div>');

                        if(k == 0){
                            inlineIndex = inlineIndex || 0;
                            var preLeavlLeft = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).offset().left - originX;
                            var thisLeavlLeft = _self.find('.chartCon').eq(leavlIndex + 1).find('.chartConText').eq(0).offset().left - originX;

                            var thisOffset = thisLeavlLeft - preLeavlLeft;
                            var orgLeft = preLeavlLeft;
                            if(thisOffset < 0){
                                thisOffset = thisOffset.toString().substring(1);
                                orgLeft = thisLeavlLeft;
                            }

                            var ss =  orgLeft + parseInt(thisOffset)/2 + cellWidthHalf - opt.percentWidth/2 - opt.cellMargin;
                            if(firstIndex){
                                ss = ss + cellWidthHalf - opt.percentWidth/2 - opt.cellMargin;
                                firstIndex = false;
                            }
                            _self.find('.chartPer').eq(leavlIndex).css('padding-left', ss);
                        }
                        if(k == 0 && name == '离开系统'){
                            thisIndex = 1;
                        }
    
                        if(!hasNext && name != '离开系统' && leavlIndex < 3){
                            hasNext = true;
                            creatChart(name, leavlIndex + 1, thisIndex);
                        }

                    });
                    
                    var otherRate = Math.round((100-hasPercent)*fRate)/100;
                    otherRate = otherRate < 0 ? 0 : otherRate;

                    _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText disable">'+otherRate+'%</div>');
                    _self.find('.chartCon').eq(leavlIndex+1).append('<div class="chartConText ChartTitle_other disable" titlename="other"><span>其他</span></div>');
                }
            });
        }

        function creatLine(fName, leavlIndex, dd){
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var preTitle;
                    var thisTitle
                    $.each(v.reachName, function(k,v){
                        if(k > 20){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 100;
                        }else{
                            offsetX = cellWidthHalf - opt.cellMargin;
                        }
                        offsetY = cellHeightHalf;

                        
                        var noChild = true;
                        $.each(_data, function(k,v){
                            if(v.name == name){
                                noChild = false;
                                return;
                            }
                        });
                        
                        var disableLine = false;
                        
                        if(name == '离开系统' || noChild){
                            disableLine = true;
                        }
                        preTitle = $('.leavl_'+leavlIndex).find('.chartConText');
                        thisTitle = $('.leavl_'+(leavlIndex+1)).find('.chartConText');
                        preTitle.each(function(){
                            if($(this).attr('titlename') == fName){
                                preTitle = $(this);
                                return;
                            }
                        });
                        
                        thisTitle.each(function(){
                            if($(this).attr('titlename') == name){
                                thisTitle = $(this);
                                return;
                            }
                        })
                        drawLine(preTitle.offset().left + offsetX - originX, 
                                    preTitle.offset().top + offsetY - originY, 
                                    thisTitle.offset().left + cellWidthHalf - originX - opt.cellMargin, 
                                    thisTitle.offset().top + cellHeightHalf - originY, 
                                    disableLine
                                );
                        if(k == 0 && name == '离开系统'){
                            thisIndex = 1;
                        }

                        if(!hasNext && name != '离开系统' && leavlIndex < 3){
                            hasNext = true;
                            creatLine(name, leavlIndex + 1, thisIndex);
                        }
                    });
                    drawLine(preTitle.offset().left + offsetX - originX, 
                            preTitle.offset().top + offsetY - originY, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().left + cellWidthHalf - originX - opt.cellMargin, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().top + cellHeightHalf - originY, 
                                true
                            );
                }else{
                    return
                }
            });
        }

        function drawLine(sx,sy,ex,ey,disable){
            cvs.fillStyle = 'rgba(255,0,0,.3)';
            if(disable){
                cvs.strokeStyle = 'rgba(200,200,200,1)';
            }else{
                cvs.strokeStyle = 'rgba(105,135,195,.9)';
            }
            cvs.lineWidth = 1;
            cvs.beginPath();
            cvs.moveTo(sx,sy);
            cvs.lineTo(ex,ey);
            cvs.closePath();//可以把这句注释掉再运行比较下不同
            cvs.stroke();//画线框
        }
    }
})(jQuery);