<!doctype html>
<html lang="en" translate="no">
  <head>
    <meta name="baidu-site-verification" content="codeva-sY5rrA3hgR" />
<script charset="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>
<script>LA.init({id:"KulgHdLghizCmScP",ck:"KulgHdLghizCmScP",autoTrack:true,hashMode:true})</script>
<style>

/*白天背景图*/
 .hope-ui-light {
    background-image: linear-gradient(rgba(200,200,200,0.7), rgba(200,200,200,0.7)), url('https://www.chirmyram.top/bingpic.php');
    background-repeat:no-repeat;
    background-size:cover;
    background-attachment:fixed;
    background-position-x:center;
    opacity: 0.9;
}
/*夜间背景图*/
 .hope-ui-dark {
    background-image: linear-gradient(rgba(200,200,200,0.7), rgba(200,200,200,0.7)), url('https://www.chirmyram.top/bingpic.php');
    background-repeat:no-repeat;
    background-size:cover;
    background-attachment:fixed;
    background-position-x:center;
    opacity: 0.9;
}
/*主列表白天模式透明*/
 .obj-box.hope-stack.hope-c-dhzjXW.hope-c-PJLV.hope-c-PJLV-igScBhH-css {
    background-color: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(5px)!important;
}
/*主列表夜间模式透明*/
 .obj-box.hope-stack.hope-c-dhzjXW.hope-c-PJLV.hope-c-PJLV-iigjoxS-css {
    background-color:rgb(0 0 0 / 75%) !important;
    backdrop-filter: blur(5px)!important;
}
/*readme白天模式透明*/
 .hope-c-PJLV.hope-c-PJLV-ikSuVsl-css {
    background-color: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(5px)!important;
}
/*readme夜间模式透明*/
 .hope-c-PJLV.hope-c-PJLV-iiuDLME-css {
    background-color:rgb(0 0 0 / 70%) !important;
    backdrop-filter: blur(5px)!important;
}

/*顶部右上角切换按钮透明*/
 .hope-ui-light .hope-c-ivMHWx-hZistB-cv.hope-icon-button {
    background-color: rgba(255, 255, 255, 0.5) !important;
    backdrop-filter: blur(5px)!important;
}
.hope-ui-dark .hope-c-ivMHWx-hZistB-cv.hope-icon-button {
    background-color:rgb(0 0 0 / 70%) !important;
    backdrop-filter: blur(5px)!important;
}

/*右下角侧边栏按钮透明 第一个是白天 第二个是夜间*/
 .hope-ui-light .hope-c-PJLV-ijgzmFG-css {
    background-color: rgba(255, 255, 255, 0.5) !important;
    backdrop-filter: blur(5px)!important;
}
.hope-ui-dark .hope-c-PJLV-ijgzmFG-css {
    background-color:rgb(0 0 0 / 70%) !important;
    backdrop-filter: blur(5px)!important;
}

/*白天模式代码块透明*/
 .hope-ui-light pre {
    background-color: rgba(255, 255, 255, 0.4)!important;
    backdrop-filter: blur(10px)!important;
}
/*夜间模式代码块透明*/
 .hope-ui-dark pre {
    background-color: rgba(255, 255, 255, 0)!important;
    backdrop-filter: blur(10px)!important;
}

/*左侧侧边栏目录*/
/*白天模式*/
 .hope-ui-light .hope-c-PJLV-ieGWMbI-css {
    background: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(5px)!important;
}
/*夜间模式*/
 .hope-ui-dark .hope-c-PJLV-ieGWMbI-css {
    background-color:rgb(0 0 0 / 60%)!important;
    backdrop-filter: blur(5px)!important;
}
/* 返回顶部 */
 .hope-c-PJLV-ihVEsOa-css {
    background: rgba(255, 255, 255, 0.5) !important;
}
.hope-ui-dark .hope-c-PJLV-ihVEsOa-css {
    background-color:rgb(0 0 0 / 70%)!important;
}

/*正常情况未使用吸附功能*/
/*导航条*/
/*白天模式*/
 .hope-ui-light .hope-c-PJLV-idaeksS-css {
    background-color: rgba(255, 255, 255, 0.5)!important;
    border-radius: 10px !important;
    backdrop-filter: blur(5px)!important;
}
/*夜间模式*/
 .hope-ui-dark .hope-c-PJLV-idaeksS-css {
    background-color:rgb(0 0 0 / 60%)!important;
    border-radius: 10px !important;
    backdrop-filter: blur(5px)!important;
}
/*顶栏*/
 .hope-c-PJLV-ikaMhsQ-css {
    background: rgba(255, 255, 255, 0) !important;
}


/* 吸附到页面顶部 */
/*顶部*/
 .hope-c-PJLV-icWrYmg-css {
    background: rgba(255, 255, 255, 0) !important;
}
/*导航条*/
 .hope-c-PJLV-icKsjdm-css::after {
    background: rgba(255, 255, 255, 0) !important;
    
}
/*白天模式*/
 .hope-ui-light .hope-c-PJLV-icKsjdm-css {
    background-color: rgba(255, 255, 255, 0.5)!important;
    border-radius: 10px !important;
}
/*夜间模式*/
 .hope-ui-dark .hope-c-PJLV-icKsjdm-css {
    background-color:rgb(0 0 0 / 50%)!important;
    border-radius: 10px !important;
}

/*仅吸附导航栏*/
/*导航条*/
.hope-c-PJLV-ifdXShc-css::after {
    background: rgba(255, 255, 255, 0) !important;
}
/*白天模式*/
 .hope-ui-light .hope-c-hrsMRY {
    background-color: rgba(255, 255, 255, 0.5)!important;
    border-radius: 10px !important;
}
/*夜间模式*/
 .hope-ui-dark .hope-c-hrsMRY {
    background-color:rgb(0 0 0 / 50%)!important;
    border-radius: 10px !important;
}
</style>

<style>
/*白天模式 搜索主体+毛玻璃*/
.hope-ui-light .hope-c-PJLV-iiBaxsN-css{
   background-color: rgba(255,255,255,0.2)!important;
   backdrop-filter: blur(10px)!important;
   border: 1px solid rgba(0, 119, 187, 0.4); /* 40%透明度的青蓝色边框，宽度为1px */
}

/*白天模式 搜索栏输入框+毛玻璃*/
.hope-ui-light .hope-c-kvTTWD-hYRNAb-variant-filled{
   background-color: rgba(255,255,255,0.6)!important;
   backdrop-filter: blur(10px)!important;
}

/*白天模式 搜索按钮+毛玻璃*/
.hope-ui-light .hope-c-PJLV-ikEIIxw-css{
   background-color: rgba(255,255,255,0.2)!important;
   backdrop-filter: blur(10px)!important;
   padding: var(--hope-space-1)!important;
}

/*夜间模式搜索主体+毛玻璃*/
.hope-ui-dark .hope-c-PJLV-iiBaxsN-css{
    background-color: rgb(0 0 0 / 10%)!important;
    backdrop-filter: blur(10px)!important;
    border: 1px solid rgba(0, 119, 187, 0.4); /* 40%透明度的青蓝色边框，宽度为1px */
}

/*夜间模式搜索栏+毛玻璃*/
.hope-ui-dark .hope-c-kvTTWD-hYRNAb-variant-filled{
    background-color: rgb(0 0 0 / 60%)!important;
    backdrop-filter: blur(10px)!important;
}

/*夜间模式 搜索按钮+毛玻璃*/
.hope-ui-dark .hope-c-PJLV-ikEIIxw-css{
    background-color: rgb(0 0 0 / 10%)!important;
    backdrop-filter: blur(10px)!important;
    padding: var(--hope-space-1)!important;
}
</style>
    <meta charset="utf-8" >
    <meta name="viewport" content="width=device-width, initial-scale=1" >
    <meta name="referrer" content="same-origin" >
    <meta name="generator" content="OpenList" >
    <meta name="theme-color" content="#000000" >
    <meta name="google" content="notranslate" >
    <link href="/manifest.json" rel="manifest" >
    <meta name="apple-mobile-web-app-capable" content="yes" >
    <meta name="apple-mobile-web-app-title" content="OpenList" >
    <link rel="apple-touch-icon" href="https://gcore.jsdelivr.net/gh/ChirmyRam/ChirmyRam-OneDrive-Repository/favicon.ico" >
    <link       rel="shortcut icon"
      type="image/ico"
      href="https://gcore.jsdelivr.net/gh/ChirmyRam/ChirmyRam-OneDrive-Repository/favicon.ico"
    >
    <title>OpenList</title>
    <script>
      window.OPENLIST_CONFIG = {
        cdn: '',
        base_path: '/',
        api: undefined,
        main_color: '#1890ff',
      }
      window.__dynamic_base__ = window.OPENLIST_CONFIG.cdn || ""
    </script>
    
    
    
    
    
    
    
    
    <script type="module">import'data:text/javascript,if(!import.meta.resolve)throw Error("import.meta.resolve not supported")';import.meta.url;import("_").catch(()=>1);(async function*(){})().next();window.__vite_is_modern_browser=true</script>
    <script type="module">!function(){if(window.__vite_is_modern_browser)return;console.warn("vite: loading legacy chunks, syntax error above and the same error below should be ignored");var e=document.getElementById("vite-legacy-polyfill"),n=document.createElement("script");n.src= window.__dynamic_base__+e.getAttribute('data-src'),n.onload=function(){System.import( window.__dynamic_base__+document.getElementById('vite-legacy-entry').getAttribute('data-src'))},document.body.appendChild(n)}();</script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>

    
    <script nomodule>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",(function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()}),!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
    
    <script nomodule crossorigin id="vite-legacy-entry" data-src="/assets/index-legacy-snGFeJGC.js"></script>
    <script>
(function(){
var preloads = [{"parentTagName":"head","tagName":"script","attrs":{"type":"module","crossorigin":"","src":"/assets/index-LU7UZOdP.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/chunk-DseTPa7n.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/preload-helper-BZsl5WQr.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/en-hZ0-9BhI.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/zh-CN-CQIa8LaP.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/zh-TW-BdOC7TgM.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"modulepreload","crossorigin":"","href":"/assets/store-lTnl42_k.js"}},{"parentTagName":"head","tagName":"link","attrs":{"rel":"stylesheet","crossorigin":"","href":"/assets/index-Bpb1jTBr.css"}},{"parentTagName":"body","tagName":"script","attrs":{"nomodule":"","crossorigin":"","id":"vite-legacy-polyfill","data-src":"/assets/polyfills-legacy-h7H8XqQx.js"}}];
function setAttribute(target, attrs) {
for (var key in attrs) {
  target.setAttribute(key, attrs[key]);
}
return target;
};
for(var i = 0; i < preloads.length; i++){
var item = preloads[i]
var childNode = document.createElement(item.tagName);
setAttribute(childNode, item.attrs)
if( window.__dynamic_base__) {
  if(item.tagName == 'link') {
    setAttribute(childNode, { href:  window.__dynamic_base__ + item.attrs.href })
  } else if (item.tagName == 'script') {
    setAttribute(childNode, { src:  window.__dynamic_base__ + item.attrs.src })
  }
}
document.getElementsByTagName(item.parentTagName)[0].appendChild(childNode);
}
})();
</script>
</body>

</html>
