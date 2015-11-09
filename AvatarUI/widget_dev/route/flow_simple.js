;(function($){
    $('<span style="margin-left:10px; line-height:30px; color:#DB4701">本报表通常情况下将在每天8：30计算完成!</span>').insertAfter('.crumb h1');
    $.fn.AvatarChart = function(options) {
        var dafaults = {
            width: '',
            height: 312,
            data: ''
        };
        
        var opt = $.extend({}, dafaults, options);
        var isIE = $.browser.msie && $.browser.version < 9;
        
        var _self = $(this);
        var chartCanvasWidth = opt.width || _self.outerWidth();
        var chartCanvasHeight = opt.height || _self.outerHeight();

        _self.append('<canvas class="chartCanvas" id="ChartCanvas" width="'+chartCanvasWidth+'" height="'+chartCanvasHeight+'" style="position:absolute; top:0; left:0;"></canvas>');

        _self.append('<div class="chartWrap" style="position:absolute; width:800px; z-index:100"></div>');
        var chartWrap = _self.find('.chartWrap');

        var _data = opt.data;
        var replaceStr = function(str){var reg = /%/g;return str.replace(reg, '_')};
        
        var originX = $('#Chart').offset().left;
        var originY = $('#Chart').offset().top;

        var myCanvas = document.getElementById("ChartCanvas");
        if(isIE){
            myCanvas = window.G_vmlCanvasManager.initElement(myCanvas);
        }
        var cvs =  myCanvas.getContext("2d");

        var thisFirst = _data[0];
        var firstIndex = true;
        chartWrap.append('<div class="chartCon leavl_0"><div rate="100" class="chartConText first ChartTitle_'+replaceStr(thisFirst.name)+'" title="'+thisFirst.name+'"><span>'+thisFirst.name+'</span></div></div>');

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
                $(this).parents('.chartCon').find('.chartConText').removeClass('active');
                $(this).addClass('active');
                
                var thisParent = $(this).parent('.chartCon');
                var index = $('.chartCon').index(thisParent);
                var dd = thisParent.find('div').index($(this));
                if(index == 0){
                    offsetY = 26;
                    firstIndex = true;
                }else{
                    offsetY = 20;
                }
                creatChart($(this).find('span').html(), index, dd);
                cvs.clearRect(0, $(this).offset().top + offsetY - originY, 800, 800);
                
                if(isIE){
                    creatLineForIE(thisFirst.name, 0, 0, index);
                }
                
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
            var thisName = $(this).attr('title');

            _self.find('.leavl_0 div').removeClass().addClass('chartConText').addClass('first');
            _self.find('.leavl_0 span').html(thisName).attr('title', thisName);

            creatChart(thisName, 0, 0);
            cvs.clearRect(0, 0, 800, 800);
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


        function creatChart(fName, leavlIndex, inlineIndex){
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
                    var _left = 0;
                    var thisConLen = 5;
                    if(thisOutLen == 1){
                        _left = 240;
                        thisConLen = 2;
                    }else if(thisOutLen == 2){
                        _left = 160;
                        thisConLen = 3;
                    }if(thisOutLen == 3){
                        _left = 80;
                        thisConLen = 4;
                    }
                    
                    var fRate;

                    $.each(v.reachName, function(k,v){
                        if(k > 3){
                            return false;
                        }
                        fRate = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).attr('rate');
                        
                        var name = v.name;
                        var percent = v.rate;
                        var _percent = parseFloat(percent);
                        var _thisRate = Math.round(_percent*fRate)/100;
                        hasPercent = hasPercent + _percent;
                        var marginLeft = 0, conMarginLeft = 10, offsetX, offsetY;
                        var noChild = true;
                        $.each(_data, function(k,v){
                            if(v.name == name){
                                noChild = false;
                                return;
                            }
                        });

                        var disableStr = (name == '离开系统' || leavlIndex == 3 || noChild) ? 'disable' : '';
                        var linkStr = (name != '离开系统' && !noChild) ? '<a href="javascript:;" title="'+name+'" class="chartConTextTip" title="设为第一级"></a>' : '';
                        var disableStr1 = (name == '离开系统' || noChild) ? 'disable' : '';

                        if(k == 0){
                            conMarginLeft = conMarginLeft + _left;
                        }
                        
                        _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText '+disableStr1+'">'+_thisRate+'%</div>');
                        _self.find('.chartCon').eq(leavlIndex + 1).append('<div rate="'+_thisRate+'" class="chartConText '+disableStr+'" title="'+name+'" style="margin-left:'+conMarginLeft+'px"><span>'+name+'</span>'+linkStr+'</div>');

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

                            var ss =  orgLeft + parseInt(thisOffset)/2 + 48;
                            if(firstIndex){
                                ss = ss + 25;
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
                    _self.find('.chartCon').eq(leavlIndex+1).append('<div class="chartConText ChartTitle_other disable" title="other"><span>其他</span></div>');
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
                        if(k > 3){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 120;
                            offsetY = 26;
                        }else{
                            offsetX = 70;
                            offsetY = 20;
                        }

                        
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
                            if($(this).attr('title') == fName){
                                preTitle = $(this);
                                return;
                            }
                        });
                        
                        thisTitle.each(function(){
                            if($(this).attr('title') == name){
                                thisTitle = $(this);
                                return;
                            }
                        })
                        drawLine(preTitle.offset().left + offsetX - originX, 
                                    preTitle.offset().top + offsetY - originY, 
                                    thisTitle.offset().left + 70- originX, 
                                    thisTitle.offset().top + 20 - originY, 
                                    disableLine
                                );
                        if(k == 0 && name == '离开系统'){
                            thisIndex = 1;
                        }

                        if(!hasNext && name != '离开系统' && leavlIndex < 3){
                            hasNext = true;
                            thisTitle.addClass('active');
                            creatLine(name, leavlIndex + 1, thisIndex);
                        }
                    });
                    drawLine(preTitle.offset().left + offsetX - originX, 
                            preTitle.offset().top + offsetY - originY, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().left + 70- originX, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().top + 20 - originY, 
                                true
                            );
                }else{
                    return
                }
            });
        }
        
        function creatLineForIE(fName, leavlIndex, dd, maxLeavl){
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var preTitle;
                    var thisTitle
                    $.each(v.reachName, function(k,v){
                        if(k > 3){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 120;
                            offsetY = 26;
                        }else{
                            offsetX = 70;
                            offsetY = 20;
                        }

                        
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
                            if($(this).attr('title') == fName){
                                preTitle = $(this);
                                return;
                            }
                        });
                        
                        thisTitle.each(function(){
                            if($(this).attr('title') == name){
                                thisTitle = $(this);
                                return;
                            }
                        })
                        drawLine(preTitle.offset().left + offsetX - originX, 
                                    preTitle.offset().top + offsetY - originY, 
                                    thisTitle.offset().left + 70- originX, 
                                    thisTitle.offset().top + 20 - originY, 
                                    disableLine
                                );
                        if(thisTitle.hasClass('active')){
                            thisIndex = k;
                            hasNext = true;
                            if(leavlIndex + 1 < maxLeavl){
                                creatLineForIE(name, leavlIndex + 1, thisIndex, maxLeavl);
                            }
                        }
                    });
                    drawLine(preTitle.offset().left + offsetX - originX, 
                            preTitle.offset().top + offsetY - originY, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().left + 70- originX, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().top + 20 - originY, 
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
            cvs.lineWidth = 2;
            cvs.beginPath();
            cvs.moveTo(sx,sy);
            cvs.lineTo(ex,ey);
            cvs.closePath();//可以把这句注释掉再运行比较下不同
            cvs.stroke();//画线框
            // context.fill();//填充颜色
        }
    }
})(jQuery);