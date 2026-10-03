var rule = {
    title: '一家视频网',
    模板: '首图',
    host: 'https://m.yijia5.com',
    url: '/fyclass_fypage.html',
    searchUrl: '/search_fypage.html?search=**',
    class_parse: '.myui-header__menu&&li;a&&Text;a&&href;.*/(.*?).html',
    lazy: `js:
  let html = request(input);
  let hconf = html.match(/r player_.*?=(.*?)</)[1];
  let json = JSON5.parse(hconf);
  let url = json.url;
  if (json.encrypt == '1') {
    url = unescape(url);
  } else if (json.encrypt == '2') {
    url = unescape(base64Decode(url));
  }
  if (/\\.(m3u8|mp4|m4a|mp3)/.test(url)) {
    input = {
      parse: 0,
      jx: 0,
      url: url,
    };
  } else {
    input;
  }`,
    搜索: '#searchList li;a&&title;.lazyload&&data-original;.pic-text&&Text;h4&&a&&href;.detail&&Text',
}