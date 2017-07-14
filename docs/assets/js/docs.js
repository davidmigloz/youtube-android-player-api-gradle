var classesNav;
var devdocNav;
var sidenav;
var cookie_namespace = 'android_developer';
var NAV_PREF_TREE = "tree";
var NAV_PREF_PANELS = "panels";
var nav_pref;
var isMobile = false; // true if mobile, so we can adjust some layout

var basePath = getBaseUri(location.pathname);
var SITE_ROOT = toRoot + basePath.substring(1,basePath.indexOf("/",1));
  

/******  ON LOAD SET UP STUFF *********/

var navBarIsFixed = false;
$(document).ready(function() {
  // init the fullscreen toggle click event
  $('#nav-swap .fullscreen').click(function(){
    if ($(this).hasClass('disabled')) {
      toggleFullscreen(true);
    } else {
      toggleFullscreen(false);
    }
  });
  
  // initialize the divs with custom scrollbars
  $('.scroll-pane').jScrollPane( {verticalGutter:0} );
  
  // add HRs below all H2s (except for a few other h2 variants)
  $('h2').not('#qv h2').not('#tb h2').not('.sidebox h2').not('#devdoc-nav h2').css({marginBottom:0}).after('<hr/>');
  
  // set search's onkeyup handler here so we can show suggestions 
  // even while search results are visible
  $("#search_autocomplete").keyup(function() {return search_changed(event, false, toRoot)});

  // set up the search close button
  $('.search .close').click(function() {
    $searchInput = $('#search_autocomplete');
    $searchInput.attr('value', '');
    $(this).addClass("hide");
    $("#search-container").removeClass('active');
    $("#search_autocomplete").blur();
    search_focus_changed($searchInput.get(), false);  // see search_autocomplete.js
    hideResults();  // see search_autocomplete.js
  });
  $('.search').click(function() {
    if (!$('#search_autocomplete').is(":focused")) {
        $('#search_autocomplete').focus();
    }
  });

  // Set up quicknav
  var quicknav_open = false;  
  $("#btn-quicknav").click(function() {
    if (quicknav_open) {
      $(this).removeClass('active');
      quicknav_open = false;
      collapse();
    } else {
      $(this).addClass('active');
      quicknav_open = true;
      expand();
    }
  })
  
  var expand = function() {
   $('#header-wrap').addClass('quicknav');
   $('#quicknav').stop().show().animate({opacity:'1'});
  }
  
  var collapse = function() {
    $('#quicknav').stop().animate({opacity:'0'}, 100, function() {
      $(this).hide();
      $('#header-wrap').removeClass('quicknav');
    });
  }
  
  
  //Set up search
  $("#search_autocomplete").focus(function() {
    $("#search-container").addClass('active');
  })
  $("#search-container").mouseover(function() {
    $("#search-container").addClass('active');
    $("#search_autocomplete").focus();
  })
  $("#search-container").mouseout(function() {
    if ($("#search_autocomplete").is(":focus")) return;
    if ($("#search_autocomplete").val() == '') {
      setTimeout(function(){
        $("#search-container").removeClass('active');
        $("#search_autocomplete").blur();
      },250);
    }
  })
  $("#search_autocomplete").blur(function() {
    if ($("#search_autocomplete").val() == '') {
      $("#search-container").removeClass('active');
    }
  })

    
  // prep nav expandos
  var pagePath = document.location.pathname;
  // account for intl docs by removing the intl/*/ path
  if (pagePath.indexOf("/intl/") == 0) {
    pagePath = pagePath.substr(pagePath.indexOf("/",6)); // start after intl/ to get last /
  }
  
  if (pagePath.indexOf(SITE_ROOT) == 0) {
    if (pagePath == '' || pagePath.charAt(pagePath.length - 1) == '/') {
      pagePath += 'index.html';
    }
  }

  if (SITE_ROOT.match(/\.\.\//) || SITE_ROOT == '') {
    // If running locally, SITE_ROOT will be a relative path, so account for that by
    // finding the relative URL to this page. This will allow us to find links on the page
    // leading back to this page.
    var pathParts = pagePath.split('/');
    var relativePagePathParts = [];
    var upDirs = (SITE_ROOT.match(/(\.\.\/)+/) || [''])[0].length / 3;
    for (var i = 0; i < upDirs; i++) {
      relativePagePathParts.push('..');
    }
    for (var i = 0; i < upDirs; i++) {
      relativePagePathParts.push(pathParts[pathParts.length - (upDirs - i) - 1]);
    }
    relativePagePathParts.push(pathParts[pathParts.length - 1]);
    pagePath = relativePagePathParts.join('/');
  } else {
    // Otherwise the page path is already an absolute URL
  }

  // select current page in sidenav and set up prev/next links if they exist
  var $selNavLink = $('#nav').find('a[href="' + pagePath + '"]');
  if ($selNavLink.length) {
    $selListItem = $selNavLink.closest('li');

    $selListItem.addClass('selected');
    $selListItem.closest('li.nav-section').addClass('expanded');
    $selListItem.closest('li.nav-section').children('ul').show();
    $selListItem.closest('li.nav-section').parent().closest('li.nav-section').addClass('expanded');
    $selListItem.closest('li.nav-section').parent().closest('ul').show();
    
    
  //  $selListItem.closest('li.nav-section').closest('li.nav-section').addClass('expanded');
  //  $selListItem.closest('li.nav-section').closest('li.nav-section').children('ul').show();  

    // set up prev links
    var $prevLink = [];
    var $prevListItem = $selListItem.prev('li');
    
    var crossBoundaries = ($("body.design").length > 0) || ($("body.guide").length > 0) ? true :
false; // navigate across topic boundaries only in design docs
    if ($prevListItem.length) {
      if ($prevListItem.hasClass('nav-section')) {
        if (crossBoundaries) {
          // jump to last topic of previous section
          $prevLink = $prevListItem.find('a:last');
        }
      } else {
        // jump to previous topic in this section
        $prevLink = $prevListItem.find('a:eq(0)');
      }
    } else {
      // jump to this section's index page (if it exists)
      var $parentListItem = $selListItem.parents('li');
      $prevLink = $selListItem.parents('li').find('a');
      
      // except if cross boundaries aren't allowed, and we're at the top of a section already
      // (and there's another parent)
      if (!crossBoundaries && $parentListItem.hasClass('nav-section') 
                           && $selListItem.hasClass('nav-section')) {
        $prevLink = [];
      }
    }

    if ($prevLink.length) {
      var prevHref = $prevLink.attr('href');
      if (prevHref == SITE_ROOT + 'index.html') {
        // Don't show Previous when it leads to the homepage
      } else {
        $('.prev-page-link').attr('href', $prevLink.attr('href')).removeClass("hide");
      }
    } 

    // set up next links
    var $nextLink = [];
    var startCourse = false;
    var startClass = false;
    var training = $(".next-class-link").length; // decides whether to provide "next class" link
    var isCrossingBoundary = false;
    
    if ($selListItem.hasClass('nav-section')) {
      // we're on an index page, jump to the first topic
      $nextLink = $selListItem.find('ul:eq(0)').find('a:eq(0)');

      // if there aren't any children, go to the next section (required for About pages)
      if($nextLink.length == 0) {
        $nextLink = $selListItem.next('li').find('a');
      } else if ($('.topic-start-link').length) {
        // as long as there's a child link and there is a "topic start link" (we're on a landing)
        // then set the landing page "start link" text to be the first doc title
        $('.topic-start-link').text($nextLink.text().toUpperCase());
      }
      
      // Handle some Training specialties
      if ($selListItem.parent().is("#nav") && $(".start-course-link").length) {
        // this means we're at the very top of the TOC hierarchy
        startCourse = true;
      } else if ($(".start-class-link").length) {
        // this means this page has children but is not at the top (it's a class, not a course)
        startClass = true;
      }
    } else {
      // jump to the next topic in this section (if it exists)
      $nextLink = $selListItem.next('li').find('a:eq(0)');
      if (!$nextLink.length) {
        if (crossBoundaries || training) {
          // no more topics in this section, jump to the first topic in the next section
          $nextLink = $selListItem.parents('li:eq(0)').next('li.nav-section').find('a:eq(0)');
          isCrossingBoundary = true;
        }
      }
    }
    if ($nextLink.length) {
      if (startCourse || startClass) {
        if (startCourse) {
          $('.start-course-link').attr('href', $nextLink.attr('href')).removeClass("hide");
        } else {
          $('.start-class-link').attr('href', $nextLink.attr('href')).removeClass("hide");
        }
        // if there's no training bar (below the start button), 
        // then we need to add a bottom border to button
        if (!$("#tb").length) {
          $('.start-course-link').css({'border-bottom':'1px solid #DADADA'});
          $('.start-class-link').css({'border-bottom':'1px solid #DADADA'});
        }
      } else if (training && isCrossingBoundary) {
        $('.content-footer.next-class').show();
        $('.next-page-link').attr('href','')
                            .removeClass("hide").addClass("disabled")
                            .click(function() { return false; });
       
        $('.next-class-link').attr('href',$nextLink.attr('href'))
                            .removeClass("hide").append($nextLink.html());
        $('.next-class-link').find('.new').empty();
      } else {
        $('.next-page-link').attr('href', $nextLink.attr('href')).removeClass("hide");
      }
    }
    
  }



  // Set up expand/collapse behavior
  $('#nav li.nav-section .nav-section-header').click(function() {
    var section = $(this).closest('li.nav-section');
    if (section.hasClass('expanded')) {
    /* hide me */
    //  if (section.hasClass('selected') || section.find('li').hasClass('selected')) {
   //   /* but not if myself or my descendents are selected */
   //     return;
    //  }
      section.children('ul').slideUp(250, function() {
        section.closest('li').removeClass('expanded');
        resizeNav();
      });
    } else {
    /* show me */
      // first hide all other siblings
      var $others = $('li.nav-section.expanded', $(this).closest('ul'));
      $others.removeClass('expanded').children('ul').slideUp(250);
      
      // now expand me
      section.closest('li').addClass('expanded');
      section.children('ul').slideDown(250, function() {
        resizeNav();
      });
    }
  });
  
  $(".scroll-pane").scroll(function(event) {
      event.preventDefault();
      return false;
  });

  /* Resize nav height when window height changes */
  $(window).resize(function() {
    if ($('#side-nav').length == 0) return;
    var stylesheet = $('link[rel="stylesheet"][class="fullscreen"]');
    setNavBarLeftPos(); // do this even if sidenav isn't fixed because it could become fixed
    // make sidenav behave when resizing the window and side-scolling is a concern
    if (navBarIsFixed) {
      if ((stylesheet.attr("disabled") == "disabled") || stylesheet.length == 0) {
        updateSideNavPosition();
      } else {
        updateSidenavFullscreenWidth();
      }
    }
    resizeNav();
  });


  // Set up fixed navbar
  var prevScrollLeft = 0; // used to compare current position to previous position of horiz scroll
  $(window).scroll(function(event) {
    if ($('#side-nav').length == 0) return;
    if (event.target.nodeName == "DIV") {
      // Dump scroll event if the target is a DIV, because that means the event is coming
      // from a scrollable div and so there's no need to make adjustments to our layout
      return;
    }
    var scrollTop = $(window).scrollTop();    
    var headerHeight = $('#header').outerHeight();
    var subheaderHeight = $('#nav-x').outerHeight();
    var searchResultHeight = $('#searchResults').is(":visible") ? 
                             $('#searchResults').outerHeight() : 0;
    var totalHeaderHeight = headerHeight + subheaderHeight + searchResultHeight;
    var navBarShouldBeFixed = scrollTop > totalHeaderHeight;
   
    var scrollLeft = $(window).scrollLeft();
    // When the sidenav is fixed and user scrolls horizontally, reposition the sidenav to match
    if (navBarIsFixed && (scrollLeft != prevScrollLeft)) {
      updateSideNavPosition();
      prevScrollLeft = scrollLeft;
    }
    
    // Don't continue if the header is sufficently far away 
    // (to avoid intensive resizing that slows scrolling)
    if (navBarIsFixed && navBarShouldBeFixed) {
      return;
    }
    
    if (navBarIsFixed != navBarShouldBeFixed) {
      if (navBarShouldBeFixed) {
        // make it fixed
        var width = $('#devdoc-nav').width();
        $('#devdoc-nav')
            .addClass('fixed')
            .css({'width':width+'px'})
            .prependTo('#body-content');
        // add neato "back to top" button
        $('#devdoc-nav a.totop').css({'display':'block','width':$("#nav").innerWidth()+'px'});
        
        // update the sidenaav position for side scrolling
        updateSideNavPosition();
      } else {
        // make it static again
        $('#devdoc-nav')
            .removeClass('fixed')
            .css({'width':'auto','margin':''})
            .prependTo('#side-nav');
        $('#devdoc-nav a.totop').hide();
      }
      navBarIsFixed = navBarShouldBeFixed;
    } 
    
    resizeNav(250); // pass true in order to delay the scrollbar re-initialization for performance
  });

  
  var navBarLeftPos;
  if ($('#devdoc-nav').length) {
    setNavBarLeftPos();
  }


  // Stop expand/collapse behavior when clicking on nav section links (since we're navigating away
  // from the page)
  $('.nav-section-header').find('a:eq(0)').click(function(evt) {
    window.location.href = $(this).attr('href');
    return false;
  });

  // Set up play-on-hover <video> tags.
  $('video.play-on-hover').bind('click', function(){
    $(this).get(0).load(); // in case the video isn't seekable
    $(this).get(0).play();
  });

  // Set up tooltips
  var TOOLTIP_MARGIN = 10;
  $('acronym').each(function() {
    var $target = $(this);
    var $tooltip = $('<div>')
        .addClass('tooltip-box')
        .text($target.attr('title'))
        .hide()
        .appendTo('body');
    $target.removeAttr('title');

    $target.hover(function() {
      // in
      var targetRect = $target.offset();
      targetRect.width = $target.width();
      targetRect.height = $target.height();

      $tooltip.css({
        left: targetRect.left,
        top: targetRect.top + targetRect.height + TOOLTIP_MARGIN
      });
      $tooltip.addClass('below');
      $tooltip.show();
    }, function() {
      // out
      $tooltip.hide();
    });
  });

  // Set up <h2> deeplinks
  $('h2').click(function() {
    var id = $(this).attr('id');
    if (id) {
      document.location.hash = id;
    }
  });

  //Loads the +1 button
  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
  po.src = 'https://apis.google.com/js/platform.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);


  // Revise the sidenav widths to make room for the scrollbar 
  // which avoids the visible width from changing each time the bar appears
  var $sidenav = $("#side-nav");
  var sidenav_width = parseInt($sidenav.innerWidth());
    
  $("#devdoc-nav  #nav").css("width", sidenav_width - 4 + "px"); // 4px is scrollbar width


  $(".scroll-pane").removeAttr("tabindex"); // get rid of tabindex added by jscroller
  
  if ($(".scroll-pane").length > 1) {
    // Check if there's a user preference for the panel heights
    var cookieHeight = readCookie("reference_height");
    if (cookieHeight) {
      restoreHeight(cookieHeight);
    }
  }
  
  resizeNav();


});



function toggleFullscreen(enable) {
  var delay = 20;
  var enabled = true;
  var stylesheet = $('link[rel="stylesheet"][class="fullscreen"]');
  if (enable) {
    // Currently NOT USING fullscreen; enable fullscreen
    stylesheet.removeAttr('disabled');
    $('#nav-swap .fullscreen').removeClass('disabled');
    $('#devdoc-nav').css({left:''});
    setTimeout(updateSidenavFullscreenWidth,delay); // need to wait a moment for css to switch
    enabled = true;
  } else {
    // Currently USING fullscreen; disable fullscreen
    stylesheet.attr('disabled', 'disabled');
    $('#nav-swap .fullscreen').addClass('disabled');
    setTimeout(updateSidenavFixedWidth,delay); // need to wait a moment for css to switch
    enabled = false;
  }
  writeCookie("fullscreen", enabled, null, null);
  setNavBarLeftPos();
  resizeNav(delay);
  updateSideNavPosition();
  setTimeout(initSidenavHeightResize,delay);
}


function setNavBarLeftPos() {
  navBarLeftPos = $('#body-content').offset().left;
}


function updateSideNavPosition() {
  var newLeft = $(window).scrollLeft() - navBarLeftPos;
  $('#devdoc-nav').css({left: -newLeft});
  $('#devdoc-nav .totop').css({left: -(newLeft - parseInt($('#side-nav').css('margin-left')))});
}
  







// TODO: use $(document).ready instead
function addLoadEvent(newfun) {
  var current = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = newfun;
  } else {
    window.onload = function() {
      current();
      newfun();
    }
  }
}

var agent = navigator['userAgent'].toLowerCase();
// If a mobile phone, set flag and do mobile setup
if ((agent.indexOf("mobile") != -1) ||      // android, iphone, ipod
    (agent.indexOf("blackberry") != -1) ||
    (agent.indexOf("webos") != -1) ||
    (agent.indexOf("mini") != -1)) {        // opera mini browsers
  isMobile = true;
}


addLoadEvent( function() {
  $("pre:not(.no-pretty-print)").addClass("prettyprint");
  prettyPrint();
} );

function init() {
  //resizeNav();

  resizePackagesNav = $("#resize-packages-nav");
  classesNav = $("#classes-nav");
  devdocNav = $("#devdoc-nav");

  var cookiePath = "";
  if (location.href.indexOf("/reference/") != -1) {
    cookiePath = "reference_";
  } else if (location.href.indexOf("/guide/") != -1) {
    cookiePath = "guide_";
  } else if (location.href.indexOf("/tools/") != -1) {
    cookiePath = "tools_";
  } else if (location.href.indexOf("/training/") != -1) {
    cookiePath = "training_";
  } else if (location.href.indexOf("/design/") != -1) {
    cookiePath = "design_";
  } else if (location.href.indexOf("/distribute/") != -1) {
    cookiePath = "distribute_";
  }
}



/* ######### RESIZE THE SIDENAV HEIGHT ########## */

function resizeNav(delay) {
  var $nav = $("#devdoc-nav");
  var $window = $(window);
  var navHeight;
  
  // Get the height of entire window and the total header height.
  // Then figure out based on scroll position whether the header is visible
  var windowHeight = $window.height();
  var scrollTop = $window.scrollTop();
  var headerHeight = $('#header').outerHeight();
  var subheaderHeight = $('#nav-x').outerHeight();
  var headerVisible = (scrollTop < (headerHeight + subheaderHeight));
  
  // get the height of space between nav and top of window. 
  // Could be either margin or top position, depending on whether the nav is fixed.
  var topMargin = (parseInt($nav.css('margin-top')) || parseInt($nav.css('top'))) + 1; 
  // add 1 for the #side-nav bottom margin
  
  // Depending on whether the header is visible, set the side nav's height.
  if (headerVisible) {
    // The sidenav height grows as the header goes off screen
    navHeight = windowHeight - (headerHeight + subheaderHeight - scrollTop) - topMargin;
  } else {
    // Once header is off screen, the nav height is almost full window height
    navHeight = windowHeight - topMargin;
  }
  
  
  
  $scrollPanes = $(".scroll-pane");
  if ($scrollPanes.length > 1) {
    // subtract the height of the api level widget and nav swapper from the available nav height
    navHeight -= ($('#api-nav-header').outerHeight(true) + $('#nav-swap').outerHeight(true));
    
    $("#swapper").css({height:navHeight + "px"});
    if ($("#nav-tree").is(":visible")) {
      $("#nav-tree").css({height:navHeight});
    }
    
    var classesHeight = navHeight - parseInt($("#resize-packages-nav").css("height")) - 10 + "px"; 
    //subtract 10px to account for drag bar
    
    // if the window becomes small enough to make the class panel height 0, 
    // then the package panel should begin to shrink
    if (parseInt(classesHeight) <= 0) {
      $("#resize-packages-nav").css({height:navHeight - 10}); //subtract 10px for drag bar
      $("#packages-nav").css({height:navHeight - 10});
    }
    
    $("#classes-nav").css({'height':classesHeight, 'margin-top':'10px'});
    $("#classes-nav .jspContainer").css({height:classesHeight});
    
    
  } else {
    $nav.height(navHeight);
  }
  
  if (delay) {
    updateFromResize = true;
    delayedReInitScrollbars(delay);
  } else {
    reInitScrollbars();
  }
  
}

var updateScrollbars = false;
var updateFromResize = false;

/* Re-initialize the scrollbars to account for changed nav size.
 * This method postpones the actual update by a 1/4 second in order to optimize the
 * scroll performance while the header is still visible, because re-initializing the
 * scroll panes is an intensive process.
 */
function delayedReInitScrollbars(delay) {
  // If we're scheduled for an update, but have received another resize request
  // before the scheduled resize has occured, just ignore the new request
  // (and wait for the scheduled one).
  if (updateScrollbars && updateFromResize) {
    updateFromResize = false;
    return;
  }
  
  // We're scheduled for an update and the update request came from this method's setTimeout
  if (updateScrollbars && !updateFromResize) {
    reInitScrollbars();
    updateScrollbars = false;
  } else {
    updateScrollbars = true;
    updateFromResize = false;
    setTimeout('delayedReInitScrollbars()',delay);
  }
}

/* Re-initialize the scrollbars to account for changed nav size. */
function reInitScrollbars() {
  var pane = $(".scroll-pane").each(function(){
    var api = $(this).data('jsp');
    if (!api) { setTimeout(reInitScrollbars,300); return;}
    api.reinitialise( {verticalGutter:0} );
  });  
  $(".scroll-pane").removeAttr("tabindex"); // get rid of tabindex added by jscroller
}


/* Resize the height of the nav panels in the reference,
 * and save the new size to a cookie */
function saveNavPanels() {
  var basePath = getBaseUri(location.pathname);
  var section = basePath.substring(1,basePath.indexOf("/",1));
  writeCookie("height", resizePackagesNav.css("height"), section, null);
}



function restoreHeight(packageHeight) {
    $("#resize-packages-nav").height(packageHeight);
    $("#packages-nav").height(packageHeight);
  //  var classesHeight = navHeight - packageHeight;
 //   $("#classes-nav").css({height:classesHeight});
  //  $("#classes-nav .jspContainer").css({height:classesHeight});
}



/* ######### END RESIZE THE SIDENAV HEIGHT ########## */





/** Scroll the jScrollPane to make the currently selected item visible 
    This is called when the page finished loading. */
function scrollIntoView(nav) {
  var $nav = $("#"+nav);
  var element = $nav.jScrollPane({/* ...settings... */});
  var api = element.data('jsp');

  if ($nav.is(':visible')) {
    var $selected = $(".selected", $nav);
    if ($selected.length == 0) return;
    
    var selectedOffset = $selected.position().top;
    if (selectedOffset + 90 > $nav.height()) {  // add 90 so that we scroll up even 
                                                // if the current item is close to the bottom
      api.scrollTo(0, selectedOffset - ($nav.height() / 4), false); // scroll the item into view
                                                              // to be 1/4 of the way from the top
    }
  }
}






/* Show popup dialogs */
function showDialog(id) {
  $dialog = $("#"+id);
  $dialog.prepend('<div class="box-border"><div class="top"> <div class="left"></div> <div class="right"></div></div><div class="bottom"> <div class="left"></div> <div class="right"></div> </div> </div>');
  $dialog.wrapInner('<div/>');
  $dialog.removeClass("hide");
}





/* #########    COOKIES!     ########## */

function readCookie(cookie) {
  var myCookie = cookie_namespace+"_"+cookie+"=";
  if (document.cookie) {
    var index = document.cookie.indexOf(myCookie);
    if (index != -1) {
      var valStart = index + myCookie.length;
      var valEnd = document.cookie.indexOf(";", valStart);
      if (valEnd == -1) {
        valEnd = document.cookie.length;
      }
      var val = document.cookie.substring(valStart, valEnd);
      return val;
    }
  }
  return 0;
}

function writeCookie(cookie, val, section, expiration) {
  if (val==undefined) return;
  section = section == null ? "_" : "_"+section+"_";
  if (expiration == null) {
    var date = new Date();
    date.setTime(date.getTime()+(10*365*24*60*60*1000)); // default expiration is one week
    expiration = date.toGMTString();
  }
  var cookieValue = cookie_namespace + section + cookie + "=" + val 
                    + "; expires=" + expiration+"; path=/";
  document.cookie = cookieValue;
}

/* #########     END COOKIES!     ########## */

























/*

REMEMBER THE PREVIOUS PAGE FOR EACH TAB

function loadLast(cookiePath) {
  var location = window.location.href;
  if (location.indexOf("/"+cookiePath+"/") != -1) {
    return true;
  }
  var lastPage = readCookie(cookiePath + "_lastpage");
  if (lastPage) {
    window.location = lastPage;
    return false;
  }
  return true;
}



$(window).unload(function(){
  var path = getBaseUri(location.pathname);
  if (path.indexOf("/reference/") != -1) {
    writeCookie("lastpage", path, "reference", null);
  } else if (path.indexOf("/guide/") != -1) {
    writeCookie("lastpage", path, "guide", null);
  } else if ((path.indexOf("/resources/") != -1) || (path.indexOf("/training/") != -1)) {
    writeCookie("lastpage", path, "resources", null);
  }
});

*/














function toggle(obj, slide) {
  var ul = $("ul:first", obj);
  var li = ul.parent();
  if (li.hasClass("closed")) {
    if (slide) {
      ul.slideDown("fast");
    } else {
      ul.show();
    }
    li.removeClass("closed");
    li.addClass("open");
    $(".toggle-img", li).attr("title", "hide pages");
  } else {
    ul.slideUp("fast");
    li.removeClass("open");
    li.addClass("closed");
    $(".toggle-img", li).attr("title", "show pages");
  }
}





function buildToggleLists() {
  $(".toggle-list").each(
    function(i) {
      $("div:first", this).append("<a class='toggle-img' href='#' title='show pages' onClick='toggle(this.parentNode.parentNode, true); return false;'></a>");
      $(this).addClass("closed");
    });
}
































/*      REFERENCE NAV SWAP     */


function getNavPref() {
  var v = readCookie('reference_nav');
  if (v != NAV_PREF_TREE) {
    v = NAV_PREF_PANELS;
  }
  return v;
}

function chooseDefaultNav() {
  nav_pref = getNavPref();
  if (nav_pref == NAV_PREF_TREE) {
    $("#nav-panels").toggle();
    $("#panel-link").toggle();
    $("#nav-tree").toggle();
    $("#tree-link").toggle();
  }
}

function swapNav() {
  if (nav_pref == NAV_PREF_TREE) {
    nav_pref = NAV_PREF_PANELS;
  } else {
    nav_pref = NAV_PREF_TREE;
    init_default_navtree(toRoot);
  }
  var date = new Date();
  date.setTime(date.getTime()+(10*365*24*60*60*1000)); // keep this for 10 years
  writeCookie("nav", nav_pref, "reference", date.toGMTString());

  $("#nav-panels").toggle();
  $("#panel-link").toggle();
  $("#nav-tree").toggle();
  $("#tree-link").toggle();
  
  resizeNav();

  // Gross nasty hack to make tree view show up upon first swap by setting height manually
  $("#nav-tree .jspContainer:visible")
      .css({'height':$("#nav-tree .jspContainer .jspPane").height() +'px'});
  // Another nasty hack to make the scrollbar appear now that we have height
  resizeNav();
  
  if ($("#nav-tree").is(':visible')) {
    scrollIntoView("nav-tree");
  } else {
    scrollIntoView("packages-nav");
    scrollIntoView("classes-nav");
  }
}



/* ############################################ */
/* ##########     LOCALIZATION     ############ */
/* ############################################ */

function getBaseUri(uri) {
  var intlUrl = (uri.substring(0,6) == "/intl/");
  if (intlUrl) {
    base = uri.substring(uri.indexOf('intl/')+5,uri.length);
    base = base.substring(base.indexOf('/')+1, base.length);
      //alert("intl, returning base url: /" + base);
    return ("/" + base);
  } else {
      //alert("not intl, returning uri as found.");
    return uri;
  }
}

function requestAppendHL(uri) {
//append "?hl=<lang> to an outgoing request (such as to blog)
  var lang = getLangPref();
  if (lang) {
    var q = 'hl=' + lang;
    uri += '?' + q;
    window.location = uri;
    return false;
  } else {
    return true;
  }
}


function changeNavLang(lang) {
  var $links = $("#devdoc-nav,#header,#nav-x,.training-nav-top,.content-footer").find("a["+lang+"-lang]");
  $links.each(function(i){ // for each link with a translation
    var $link = $(this);
    if (lang != "en") { // No need to worry about English, because a language change invokes new request
      // put the desired language from the attribute as the text
      $link.text($link.attr(lang+"-lang"))
    }
  });
}

function changeDocLang(lang) {
  changeNavLang(lang);
}

function changeLangPref(lang, refresh) {
  var date = new Date();
  expires = date.toGMTString(date.setTime(date.getTime()+(10*365*24*60*60*1000))); 
  // keep this for 50 years
  //alert("expires: " + expires)
  writeCookie("pref_lang", lang, null, expires);
  changeDocLang(lang);
  if (refresh) {
    l = getBaseUri(location.pathname);
    window.location = l;
  }
}

function loadLangPref() {
  var lang = readCookie("pref_lang");
  if (lang != 0) {
    $("#language").find("option[value='"+lang+"']").attr("selected",true);
  }
}

function getLangPref() {
  var lang = $("#language").find(":selected").attr("value");
  if (!lang) {
    lang = readCookie("pref_lang");
  }
  return (lang != 0) ? lang : 'en';
}

/* ##########     END LOCALIZATION     ############ */






/* Used to hide and reveal supplemental content, such as long code samples.
   See the companion CSS in android-developer-docs.css */
function toggleContent(obj) {
  var div = $(obj.parentNode.parentNode);
  var toggleMe = $(".toggle-content-toggleme",div);
  if (div.hasClass("closed")) { // if it's closed, open it
    toggleMe.slideDown();
    $(".toggle-content-text", obj).toggle();
    div.removeClass("closed").addClass("open");
    $(".toggle-content-img", div).attr("title", "hide").attr("src", toRoot 
                  + "assets/images/triangle-opened.png");
  } else { // if it's open, close it
    toggleMe.slideUp('fast', function() {  // Wait until the animation is done before closing arrow
      $(".toggle-content-text", obj).toggle();
      div.removeClass("open").addClass("closed");
      $(".toggle-content-img", div).attr("title", "show").attr("src", toRoot 
                  + "assets/images/triangle-closed.png");
    });
  }
  return false;
}






/*  	
 *  Slideshow 1.0
 *  Used on /index.html and /develop/index.html for carousel
 *
 *  Sample usage:
 *  HTML -
 *  <div class="slideshow-container">
 *   <a href="" class="slideshow-prev">Prev</a>
 *   <a href="" class="slideshow-next">Next</a>
 *   <ul>
 *       <li class="item"><img src="images/marquee1.jpg"></li>
 *       <li class="item"><img src="images/marquee2.jpg"></li>
 *       <li class="item"><img src="images/marquee3.jpg"></li>
 *       <li class="item"><img src="images/marquee4.jpg"></li>
 *   </ul>
 *  </div>
 *
 *   <script type="text/javascript">
 *   $('.slideshow-container').dacSlideshow({
 *       auto: true,
 *       btnPrev: '.slideshow-prev',
 *       btnNext: '.slideshow-next'
 *   });
 *   </script>
 *
 *  Options:
 *  btnPrev:    optional identifier for previous button
 *  btnNext:    optional identifier for next button
 *  auto:       whether or not to auto-proceed
 *  speed:      animation speed
 *  autoTime:   time between auto-rotation
 *  easing:     easing function for transition
 *  start:      item to select by default
 *  scroll:     direction to scroll in
 *  pagination: whether or not to include dotted pagination
 *
 */

 (function($) {
 $.fn.dacSlideshow = function(o) {
     
     //Options - see above
     o = $.extend({
         btnPrev:   null,
         btnNext:   null,
         auto:      true,
         speed:     500,
         autoTime:  12000,
         easing:    null,
         start:     0,
         scroll:    1,
         pagination: true

     }, o || {});
     
     //Set up a carousel for each 
     return this.each(function() {

         var running = false;
         var animCss = o.vertical ? "top" : "left";
         var sizeCss = o.vertical ? "height" : "width";
         var div = $(this);
         var ul = $("ul", div);
         var tLi = $("li", ul);
         var tl = tLi.size(); 
         var timer = null;

         var li = $("li", ul);
         var itemLength = li.size();
         var curr = o.start;

         li.css({float: o.vertical ? "none" : "left"});
         ul.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
         div.css({position: "relative", "z-index": "2", left: "0px"});

         var liSize = o.vertical ? height(li) : width(li);
         var ulSize = liSize * itemLength;
         var divSize = liSize;

         li.css({width: li.width(), height: li.height()});
         ul.css(sizeCss, ulSize+"px").css(animCss, -(curr*liSize));

         div.css(sizeCss, divSize+"px");
         
         //Pagination
         if (o.pagination) {
             var pagination = $("<div class='pagination'></div>");
             var pag_ul = $("<ul></ul>");
             if (tl > 1) {
               for (var i=0;i<tl;i++) {
                    var li = $("<li>"+i+"</li>");
                    pag_ul.append(li);
                    if (i==o.start) li.addClass('active');
                        li.click(function() {
                        go(parseInt($(this).text()));
                    })
                }
                pagination.append(pag_ul);
                div.append(pagination);
             }
         }
         
         //Previous button
         if(o.btnPrev)
             $(o.btnPrev).click(function(e) {
                 e.preventDefault();
                 return go(curr-o.scroll);
             });

         //Next button
         if(o.btnNext)
             $(o.btnNext).click(function(e) {
                 e.preventDefault();
                 return go(curr+o.scroll);
             });
         
         //Auto rotation
         if(o.auto) startRotateTimer();
             
         function startRotateTimer() {
             clearInterval(timer);
             timer = setInterval(function() {
                  if (curr == tl-1) {
                    go(0);
                  } else {
                    go(curr+o.scroll);  
                  } 
              }, o.autoTime);
         }

         //Go to an item
         function go(to) {
             if(!running) {

                 if(to<0) {
                    to = itemLength-1;
                 } else if (to>itemLength-1) {
                    to = 0;
                 }
                 curr = to;

                 running = true;

                 ul.animate(
                     animCss == "left" ? { left: -(curr*liSize) } : { top: -(curr*liSize) } , o.speed, o.easing,
                     function() {
                         running = false;
                     }
                 );

                 $(o.btnPrev + "," + o.btnNext).removeClass("disabled");
                 $( (curr-o.scroll<0 && o.btnPrev)
                     ||
                    (curr+o.scroll > itemLength && o.btnNext)
                     ||
                    []
                  ).addClass("disabled");

                 
                 var nav_items = $('li', pagination);
                 nav_items.removeClass('active');
                 nav_items.eq(to).addClass('active');
                 

             }
             if(o.auto) startRotateTimer();
             return false;
         };
     });
 };

 function css(el, prop) {
     return parseInt($.css(el[0], prop)) || 0;
 };
 function width(el) {
     return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
 };
 function height(el) {
     return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
 };

 })(jQuery);


/*	
 *  dacSlideshow 1.0
 *  Used on develop/index.html for side-sliding tabs
 *
 *  Sample usage:
 *  HTML -
 *  <div class="slideshow-container">
 *   <a href="" class="slideshow-prev">Prev</a>
 *   <a href="" class="slideshow-next">Next</a>
 *   <ul>
 *       <li class="item"><img src="images/marquee1.jpg"></li>
 *       <li class="item"><img src="images/marquee2.jpg"></li>
 *       <li class="item"><img src="images/marquee3.jpg"></li>
 *       <li class="item"><img src="images/marquee4.jpg"></li>
 *   </ul>
 *  </div>
 *
 *   <script type="text/javascript">
 *   $('.slideshow-container').dacSlideshow({
 *       auto: true,
 *       btnPrev: '.slideshow-prev',
 *       btnNext: '.slideshow-next'
 *   });
 *   </script>
 *
 *  Options:
 *  btnPrev:    optional identifier for previous button
 *  btnNext:    optional identifier for next button
 *  auto:       whether or not to auto-proceed
 *  speed:      animation speed
 *  autoTime:   time between auto-rotation
 *  easing:     easing function for transition
 *  start:      item to select by default
 *  scroll:     direction to scroll in
 *  pagination: whether or not to include dotted pagination
 *
 */
 (function($) {
 $.fn.dacTabbedList = function(o) {
     
     //Options - see above
     o = $.extend({
         speed : 250,
         easing: null,
         nav_id: null,
         frame_id: null
     }, o || {});
     
     //Set up a carousel for each 
     return this.each(function() {

         var curr = 0;
         var running = false;
         var animCss = "margin-left";
         var sizeCss = "width";
         var div = $(this);
         
         var nav = $(o.nav_id, div);
         var nav_li = $("li", nav);
         var nav_size = nav_li.size(); 
         var frame = div.find(o.frame_id);
         var content_width = $(frame).find('ul').width();
         //Buttons
         $(nav_li).click(function(e) {
           go($(nav_li).index($(this)));
         })
         
         //Go to an item
         function go(to) {
             if(!running) {
                 curr = to;
                 running = true;

                 frame.animate({ 'margin-left' : -(curr*content_width) }, o.speed, o.easing,
                     function() {
                         running = false;
                     }
                 );

                 
                 nav_li.removeClass('active');
                 nav_li.eq(to).addClass('active');
                 

             }
             return false;
         };
     });
 };

 function css(el, prop) {
     return parseInt($.css(el[0], prop)) || 0;
 };
 function width(el) {
     return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
 };
 function height(el) {
     return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
 };

 })(jQuery);


/* ######################################################## */
/* #################  JAVADOC REFERENCE ################### */
/* ######################################################## */

/* Initialize some droiddoc stuff, but only if we're in the reference */
if (location.pathname.indexOf("/reference") == 0) {
  $(document).ready(function() {
    // init available apis based on user pref
    changeApiLevel();
    initSidenavHeightResize()
  });
}

var API_LEVEL_COOKIE = "api_level";
var minLevel = 1;
var maxLevel = 1;

/******* SIDENAV DIMENSIONS ************/
  
  function initSidenavHeightResize() {
    // Change the drag bar size to nicely fit the scrollbar positions
    var $dragBar = $(".ui-resizable-s");
    $dragBar.css({'width': $dragBar.parent().width() - 5 + "px"});
    
    $( "#resize-packages-nav" ).resizable({ 
      containment: "#nav-panels",
      handles: "s",
      alsoResize: "#packages-nav",
      resize: function(event, ui) { resizeNav(); }, /* resize the nav while dragging */
      stop: function(event, ui) { saveNavPanels(); } /* once stopped, save the sizes to cookie  */
      });
          
  }
  
function updateSidenavFixedWidth() {
  if (!navBarIsFixed) return;
  $('#devdoc-nav').css({
    'width' : $('#side-nav').css('width'),
    'margin' : $('#side-nav').css('margin')
  });
  $('#devdoc-nav a.totop').css({'display':'block','width':$("#nav").innerWidth()+'px'});
  
  initSidenavHeightResize();
}

function updateSidenavFullscreenWidth() {
  if (!navBarIsFixed) return;
  $('#devdoc-nav').css({
    'width' : $('#side-nav').css('width'),
    'margin' : $('#side-nav').css('margin')
  });
  $('#devdoc-nav .totop').css({'left': 'inherit'});
  
  initSidenavHeightResize();
}

function buildApiLevelSelector() {
  maxLevel = SINCE_DATA.length;
  var userApiLevel = parseInt(readCookie(API_LEVEL_COOKIE));
  userApiLevel = userApiLevel == 0 ? maxLevel : userApiLevel; // If there's no cookie (zero), use the max by default

  minLevel = parseInt($("#doc-api-level").attr("class"));
  // Handle provisional api levels; the provisional level will always be the highest possible level
  // Provisional api levels will also have a length; other stuff that's just missing a level won't,
  // so leave those kinds of entities at the default level of 1 (for example, the R.styleable class)
  if (isNaN(minLevel) && minLevel.length) {
    minLevel = maxLevel;
  }
  var select = $("#apiLevelSelector").html("").change(changeApiLevel);
  for (var i = maxLevel-1; i >= 0; i--) {
    var option = $("<option />").attr("value",""+SINCE_DATA[i]).append(""+SINCE_DATA[i]);
  //  if (SINCE_DATA[i] < minLevel) option.addClass("absent"); // always false for strings (codenames)
    select.append(option);
  }

  // get the DOM element and use setAttribute cuz IE6 fails when using jquery .attr('selected',true)
  var selectedLevelItem = $("#apiLevelSelector option[value='"+userApiLevel+"']").get(0);
  selectedLevelItem.setAttribute('selected',true);
}

function changeApiLevel() {
  maxLevel = SINCE_DATA.length;
  var selectedLevel = maxLevel;

  selectedLevel = parseInt($("#apiLevelSelector option:selected").val());
  toggleVisisbleApis(selectedLevel, "body");

  var date = new Date();
  date.setTime(date.getTime()+(10*365*24*60*60*1000)); // keep this for 10 years
  var expiration = date.toGMTString();
  writeCookie(API_LEVEL_COOKIE, selectedLevel, null, expiration);

  if (selectedLevel < minLevel) {
    var thing = ($("#jd-header").html().indexOf("package") != -1) ? "package" : "class";
    $("#naMessage").show().html("<div><p><strong>This " + thing + " is not available with API level " + selectedLevel + ".</strong></p>"
                              + "<p>To use this " + thing + ", you must develop your app using a build target "
                              + "that supports API level " + $("#doc-api-level").attr("class") + " or higher. To read these "
                              + "APIs, change the value of the API level filter above.</p>"
                              + "<p><a href='" +toRoot+ "guide/appendix/api-levels.html'>What is the API level?</a></p></div>");
  } else {
    $("#naMessage").hide();
  }
}

function toggleVisisbleApis(selectedLevel, context) {
  var apis = $(".api",context);
  apis.each(function(i) {
    var obj = $(this);
    var className = obj.attr("class");
    var apiLevelIndex = className.lastIndexOf("-")+1;
    var apiLevelEndIndex = className.indexOf(" ", apiLevelIndex);
    apiLevelEndIndex = apiLevelEndIndex != -1 ? apiLevelEndIndex : className.length;
    var apiLevel = className.substring(apiLevelIndex, apiLevelEndIndex);
    if (apiLevel.length == 0) { // for odd cases when the since data is actually missing, just bail
      return;
    }
    apiLevel = parseInt(apiLevel);

    // Handle provisional api levels; if this item's level is the provisional one, set it to the max
    var selectedLevelNum = parseInt(selectedLevel)
    var apiLevelNum = parseInt(apiLevel);
    if (isNaN(apiLevelNum)) {
        apiLevelNum = maxLevel;
    }

    // Grey things out that aren't available and give a tooltip title
    if (apiLevelNum > selectedLevelNum) {
      obj.addClass("absent").attr("title","Requires API Level \""
            + apiLevel + "\" or higher");
    } 
    else obj.removeClass("absent").removeAttr("title");
  });
}




/* #################  SIDENAV TREE VIEW ################### */

function new_node(me, mom, text, link, children_data, api_level)
{
  var node = new Object();
  node.children = Array();
  node.children_data = children_data;
  node.depth = mom.depth + 1;

  node.li = document.createElement("li");
  mom.get_children_ul().appendChild(node.li);

  node.label_div = document.createElement("div");
  node.label_div.className = "label";
  if (api_level != null) {
    $(node.label_div).addClass("api");
    $(node.label_div).addClass("api-level-"+api_level);
  }
  node.li.appendChild(node.label_div);

  if (children_data != null) {
    node.expand_toggle = document.createElement("a");
    node.expand_toggle.href = "javascript:void(0)";
    node.expand_toggle.onclick = function() {
          if (node.expanded) {
            $(node.get_children_ul()).slideUp("fast");
            node.plus_img.src = me.toroot + "assets/images/triangle-closed-small.png";
            node.expanded = false;
          } else {
            expand_node(me, node);
          }
       };
    node.label_div.appendChild(node.expand_toggle);

    node.plus_img = document.createElement("img");
    node.plus_img.src = me.toroot + "assets/images/triangle-closed-small.png";
    node.plus_img.className = "plus";
    node.plus_img.width = "8";
    node.plus_img.border = "0";
    node.expand_toggle.appendChild(node.plus_img);

    node.expanded = false;
  }

  var a = document.createElement("a");
  node.label_div.appendChild(a);
  node.label = document.createTextNode(text);
  a.appendChild(node.label);
  if (link) {
    a.href = me.toroot + link;
  } else {
    if (children_data != null) {
      a.className = "nolink";
      a.href = "javascript:void(0)";
      a.onclick = node.expand_toggle.onclick;
      // This next line shouldn't be necessary.  I'll buy a beer for the first
      // person who figures out how to remove this line and have the link
      // toggle shut on the first try. --joeo@android.com
      node.expanded = false;
    }
  }
  

  node.children_ul = null;
  node.get_children_ul = function() {
      if (!node.children_ul) {
        node.children_ul = document.createElement("ul");
        node.children_ul.className = "children_ul";
        node.children_ul.style.display = "none";
        node.li.appendChild(node.children_ul);
      }
      return node.children_ul;
    };

  return node;
}

function expand_node(me, node)
{
  if (node.children_data && !node.expanded) {
    if (node.children_visited) {
      $(node.get_children_ul()).slideDown("fast");
    } else {
      get_node(me, node);
      if ($(node.label_div).hasClass("absent")) {
        $(node.get_children_ul()).addClass("absent");
      } 
      $(node.get_children_ul()).slideDown("fast");
    }
    node.plus_img.src = me.toroot + "assets/images/triangle-opened-small.png";
    node.expanded = true;

    // perform api level toggling because new nodes are new to the DOM
    var selectedLevel = $("#apiLevelSelector option:selected").val();
    toggleVisisbleApis(selectedLevel, "#side-nav");
  }
}

function get_node(me, mom)
{
  mom.children_visited = true;
  for (var i in mom.children_data) {
    var node_data = mom.children_data[i];
    mom.children[i] = new_node(me, mom, node_data[0], node_data[1],
        node_data[2], node_data[3]);
  }
}

function this_page_relative(toroot)
{
  var full = document.location.pathname;
  var file = "";
  if (toroot.substr(0, 1) == "/") {
    if (full.substr(0, toroot.length) == toroot) {
      return full.substr(toroot.length);
    } else {
      // the file isn't under toroot.  Fail.
      return null;
    }
  } else {
    if (toroot != "./") {
      toroot = "./" + toroot;
    }
    do {
      if (toroot.substr(toroot.length-3, 3) == "../" || toroot == "./") {
        var pos = full.lastIndexOf("/");
        file = full.substr(pos) + file;
        full = full.substr(0, pos);
        toroot = toroot.substr(0, toroot.length-3);
      }
    } while (toroot != "" && toroot != "/");
    return file.substr(1);
  }
}

function find_page(url, data)
{
  var nodes = data;
  var result = null;
  for (var i in nodes) {
    var d = nodes[i];
    if (d[1] == url) {
      return new Array(i);
    }
    else if (d[2] != null) {
      result = find_page(url, d[2]);
      if (result != null) {
        return (new Array(i).concat(result));
      }
    }
  }
  return null;
}

function load_navtree_data(toroot) {
  var navtreeData = document.createElement("script");
  navtreeData.setAttribute("type","text/javascript");
  navtreeData.setAttribute("src", toroot+"navtree_data.js");
  $("head").append($(navtreeData));
}

function init_default_navtree(toroot) {
  init_navtree("tree-list", toroot, NAVTREE_DATA);
  
  // perform api level toggling because because the whole tree is new to the DOM
  var selectedLevel = $("#apiLevelSelector option:selected").val();
  toggleVisisbleApis(selectedLevel, "#side-nav");
}

function init_navtree(navtree_id, toroot, root_nodes)
{
  var me = new Object();
  me.toroot = toroot;
  me.node = new Object();

  me.node.li = document.getElementById(navtree_id);
  me.node.children_data = root_nodes;
  me.node.children = new Array();
  me.node.children_ul = document.createElement("ul");
  me.node.get_children_ul = function() { return me.node.children_ul; };
  //me.node.children_ul.className = "children_ul";
  me.node.li.appendChild(me.node.children_ul);
  me.node.depth = 0;

  get_node(me, me.node);

  me.this_page = this_page_relative(toroot);
  me.breadcrumbs = find_page(me.this_page, root_nodes);
  if (me.breadcrumbs != null && me.breadcrumbs.length != 0) {
    var mom = me.node;
    for (var i in me.breadcrumbs) {
      var j = me.breadcrumbs[i];
      mom = mom.children[j];
      expand_node(me, mom);
    }
    mom.label_div.className = mom.label_div.className + " selected";
    addLoadEvent(function() {
      scrollIntoView("nav-tree");
      });
  }
}

/* TOGGLE INHERITED MEMBERS */

/* Toggle an inherited class (arrow toggle)
 * @param linkObj  The link that was clicked.
 * @param expand  'true' to ensure it's expanded. 'false' to ensure it's closed.
 *                'null' to simply toggle.
 */
function toggleInherited(linkObj, expand) {
    var base = linkObj.getAttribute("id");
    var list = document.getElementById(base + "-list");
    var summary = document.getElementById(base + "-summary");
    var trigger = document.getElementById(base + "-trigger");
    var a = $(linkObj);
    if ( (expand == null && a.hasClass("closed")) || expand ) {
        list.style.display = "none";
        summary.style.display = "block";
        trigger.src = toRoot + "assets/images/triangle-opened.png";
        a.removeClass("closed");
        a.addClass("opened");
    } else if ( (expand == null && a.hasClass("opened")) || (expand == false) ) {
        list.style.display = "block";
        summary.style.display = "none";
        trigger.src = toRoot + "assets/images/triangle-closed.png";
        a.removeClass("opened");
        a.addClass("closed");
    }
    return false;
}

/* Toggle all inherited classes in a single table (e.g. all inherited methods)
 * @param linkObj  The link that was clicked.
 * @param expand  'true' to ensure it's expanded. 'false' to ensure it's closed.
 *                'null' to simply toggle.
 */
function toggleAllInherited(linkObj, expand) {
  var a = $(linkObj);
  var table = $(a.parent().parent().parent()); // ugly way to get table/tbody
  var expandos = $(".jd-expando-trigger", table);
  if ( (expand == null && a.text() == "[Expand]") || expand ) {
    expandos.each(function(i) {
      toggleInherited(this, true);
    });
    a.text("[Collapse]");
  } else if ( (expand == null && a.text() == "[Collapse]") || (expand == false) ) {
    expandos.each(function(i) {
      toggleInherited(this, false);
    });
    a.text("[Expand]");
  }
  return false;
}

/* Toggle all inherited members in the class (link in the class title)
 */
function toggleAllClassInherited() {
  var a = $("#toggleAllClassInherited"); // get toggle link from class title
  var toggles = $(".toggle-all", $("#body-content"));
  if (a.text() == "[Expand All]") {
    toggles.each(function(i) {
      toggleAllInherited(this, true);
    });
    a.text("[Collapse All]");
  } else {
    toggles.each(function(i) {
      toggleAllInherited(this, false);
    });
    a.text("[Expand All]");
  }
  return false;
}

/* Expand all inherited members in the class. Used when initiating page search */
function ensureAllInheritedExpanded() {
  var toggles = $(".toggle-all", $("#body-content"));
  toggles.each(function(i) {
    toggleAllInherited(this, true);
  });
  $("#toggleAllClassInherited").text("[Collapse All]");
}


/* HANDLE KEY EVENTS
 * - Listen for Ctrl+F (Cmd on Mac) and expand all inherited members (to aid page search)
 */
var agent = navigator['userAgent'].toLowerCase();
var mac = agent.indexOf("macintosh") != -1;

$(document).keydown( function(e) {
var control = mac ? e.metaKey && !e.ctrlKey : e.ctrlKey; // get ctrl key
  if (control && e.which == 70) {  // 70 is "F"
    ensureAllInheritedExpanded();
  }
});



