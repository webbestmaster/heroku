!function(e){!function(){"use strict";function e(e,n){var t=new Image;t.addEventListener("load",e,!1),t.addEventListener("error",n,!1),t.src="http://google.com/favicon.ico?"+Date.now()}function n(){return i.querySelector(".js-header").style.display="block"}function t(){a.location.href=r.app.href}var a,i,o,r,c,u;a=window,i=a.document,o=a.navigator,r={app:{href:"http:wbm.herokuapp.com/t2/www/"},defaultLanguage:"en",availableLanguages:["en"],localization:{en:{needConnectionForFirstTime:"need internet connection<br/>on first application launch"}},detectLanguage:function(){var e=this,n=(o.language||o.userLanguage||e.defaultLanguage).split("-")[0].toLowerCase();return-1===e.availableLanguages.indexOf(n)?e.defaultLanguage:n}},c=r.detectLanguage(),u=r.localization[c].needConnectionForFirstTime,i.querySelector("title").innerHTML=u,i.querySelector(".js-header").innerHTML=u,function l(){return"yes"===a.localStorage.getItem("isInitialized")?void t():void e(function(){a.localStorage.setItem("isInitialized","yes"),t()},function(){n(),setTimeout(l,1e3)})}()}()}({});