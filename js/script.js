(function($){

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  $('#main-nav-toggle').click(function () {
    $('#header').toggleClass('mobile-on');
  });

  $(window).scrollTop() > 100 ? $("#GoTop").addClass("show") : $("#GoTop").removeClass("show");
  $(window).scroll(function() {
    $(window).scrollTop() > 100 ? $("#GoTop").addClass("show") : $("#GoTop").removeClass("show");
  });
  $("#GoTop").click(function() {
      $("#GoTop").addClass("launch");
      $("html, body").animate({
          scrollTop: 0
      }, 300, function() {
          $("#GoTop").removeClass("show");
      });
      return false;
  });
})(jQuery);