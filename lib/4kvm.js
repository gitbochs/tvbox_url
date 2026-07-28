var rule = {
    title: '4K影视',
    host: 'https://www.4kvm.cc',
    // 备用域名（站点公告会提示）
    // host: 'https://4kvm.site',
    url: '/filter?page=fypage',
    searchUrl: '/search?q=**',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Referer': 'https://www.4kvm.cc/'
    },
    timeout: 8000,
    class_name: '最近更新',
    class_url: '/',
    // 推荐/首页
    推荐: '*',
    // 一级列表（对应 4kvm_movie.json 的 vod_*）
    一级: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        let d = [];
        let html = request(input);
        let list = pdfa(html, "div.movie-card") || pdfa(html, ".movie-card") || [];
        list.forEach(it => {
            let title = pdfh(it, "h3&&Text") || pdfh(it, ".title&&Text") || "";
            let img = pd(it, "img&&data-src") || pd(it, "img&&src") || "";
            let link = pd(it, "a&&href") || "";
            let desc = pdfh(it, "span.text-white&&Text") || pdfh(it, ".desc&&Text") || "";
            if (title && link) {
                d.push({
                    title: title.trim(),
                    img: img,
                    desc: desc,
                    url: link
                });
            }
        });
        setResult(d);
    `,
    // 二级详情 + 选集（对应 playlist_*）
    二级: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        VOD = {};
        let html = request(input);
        VOD.vod_name = pdfh(html, "h1&&Text") || pdfh(html, "title&&Text").split("-")[0].trim() || "";
        VOD.vod_pic = pd(html, "img&&data-src") || pd(html, "meta[property=og:image]&&content") || "";
        VOD.vod_content = pdfh(html, "meta[name=description]&&content") || pdfh(html, ".announcement-content&&Text") || "";
        VOD.vod_remarks = "";
        // 线路/选集：grid grid-cols-6 下的 a[data-episode]
        let tabs = [];
        let lists = [];
        let groups = pdfa(html, "div.grid.grid-cols-6.gap-2") || pdfa(html, ".grid.grid-cols-6") || [];
        if (groups.length === 0) {
            // 兜底：直接找所有带 data-episode 的 a
            let eps = pdfa(html, "a[data-episode]") || [];
            let urls = [];
            eps.forEach(a => {
                let ep = pdfh(a, "a&&data-episode") || pdfh(a, "Text") || "";
                let href = pd(a, "a&&href");
                if (href) urls.push(ep + "$" + href);
            });
            if (urls.length) {
                tabs.push("默认");
                lists.push(urls.join("#"));
            }
        } else {
            groups.forEach((g, gi) => {
                let eps = pdfa(g, "a") || [];
                let urls = [];
                eps.forEach(a => {
                    let ep = pdfh(a, "a&&data-episode") || pdfh(a, "Text") || ("第" + (urls.length + 1) + "集");
                    let href = pd(a, "a&&href");
                    if (href) urls.push(ep + "$" + href);
                });
                if (urls.length) {
                    tabs.push("线路" + (gi + 1));
                    lists.push(urls.join("#"));
                }
            });
        }
        VOD.vod_play_from = tabs.join("$$$") || "默认";
        VOD.vod_play_url = lists.join("$$$");
    `,
    // 搜索（对应 search_*）
    搜索: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        let d = [];
        let html = request(input);
        let list = pdfa(html, "div.group.relative") || pdfa(html, ".group.relative") || pdfa(html, "div.movie-card") || [];
        list.forEach(it => {
            let title = pdfh(it, "h3&&Text") || "";
            let img = pd(it, "img&&data-src") || pd(it, "img&&src") || "";
            let link = pd(it, "a&&href") || "";
            if (title && link) {
                d.push({
                    title: title.trim(),
                    img: img,
                    desc: "",
                    url: link
                });
            }
        });
        setResult(d);
    `,
    // 播放：站点使用 WASM + Artplayer，直链通常动态生成。
    // 返回播放页本身，由客户端嗅探 / 浏览器打开（对应原 json 的 open_with_safari_flag）
    lazy: `js:
        // input 为播放页相对或绝对地址
        if (!/^http/.test(input)) {
            input = rule.host + (input.startsWith("/") ? input : "/" + input);
        }
        // 尝试从页面中提取可能的 m3u8（部分线路可能有）
        try {
            let html = request(input, {headers: rule.headers});
            let m3u8 = html.match(/https?:\\/\\/[^"'\\s]+\\.m3u8[^"'\\s]*/i);
            if (m3u8) {
                input = { parse: 0, jx: 0, url: m3u8[0], header: rule.headers };
            } else {
                // 无直链时交给播放器嗅探 / 外开
                input = { parse: 1, jx: 0, url: input, header: rule.headers };
            }
        } catch (e) {
            input = { parse: 1, jx: 0, url: input };
        }
    `,
    play_parse: true,
    // 图片处理
    图片来源: '',
    图片替换: '',
    // 杂项
    预处理: '',
    double: false,
    tab_exclude: '猜你|喜欢|下载|剧情|榜|评论',
    cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态'
};