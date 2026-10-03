Object.assign(muban.首图.二级, {
    tabs: '.myui-panel-box .btn',
    lists: '.clearfix .btn',
});
var rule = {
    模板: '首图',
    title: 'R18撸[密]',
    host: 'https://ckrxh.r18lu-open.buzz',
    url: '/index.php/vodtype/fyclass-fypage.html',
    searchUrl: '/index.php/vodsearch/-------------.html?wd=**&submit=&page=fypage;post',
    class_parse: '.myui-header__menu li:gt(0):lt(11);a&&Text;a&&href;/(\\d+).html',
    headers: {
        'User-Agent': 'PC_UA',
    },
    推荐: $js.toString(() => {
        let html = request(HOST);
        let d = [];
        let lis = pdfa(html, '.myui-vodlist li');
        lis.forEach((it) => {
            let _tt = pdfh(it, 'a&&Text');
            let _url = pd(it, 'a&&href', MY_URL);
            let _pic = pd(it, 'img&&src', MY_URL);
            if (/detail/.test(_url)) {
                d.push({
                    title: _tt,
                    desc: "",
                    img: _pic,
                    url: _url
                })
            }
        });
        setResult(d);
    }),
    一级: '.myui-vodlist li;a&&Text;img&&src;img&&src;a&&href',
    搜索: '*',
},