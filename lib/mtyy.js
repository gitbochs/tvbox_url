var rule = {
    title: '麦田',
    host: 'https://www.mtyy1.cc',
    url: '/vodshow/fyclass--hits_week------fypage---.html',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'Referer': 'https://www.mtyy1.cc/'
    },
    timeout: 8000,
    class_name: '电影&剧集&综艺&动漫',
    class_url: '1&2&3&4',
    // 推荐/首页
    推荐: '*',
    // 一级列表（对应 mt.json 的 vod_*）
    一级: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        let d = [];
        let html = request(input);
        let list = pdfa(html, "div.public-list-box") || [];
        list.forEach(it => {
            let title = pdfh(it, "div.public-list-button a&&Text") || pdfh(it, ".public-list-button a&&Text") || "";
            let img = pd(it, "img&&data-src") || pd(it, "img&&src") || "";
            let link = pd(it, "div.public-list-button a&&href") || pd(it, ".public-list-button a&&href") || "";
            let desc = pdfh(it, "span.public-list-prb&&Text") || "";
            let score = pdfh(it, "span.public-prt&&Text") || "";
            if (title && link) {
                d.push({
                    title: title.trim(),
                    img: img,
                    desc: (score ? score + " " : "") + desc,
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
        VOD.vod_pic = pd(html, "img&&data-src") || pd(html, "img&&src") || "";
        VOD.vod_content = pdfh(html, "div.this-desc&&Text") || pdfh(html, ".this-desc&&Text") || pdfh(html, "meta[name=description]&&content") || "";
        VOD.vod_remarks = pdfh(html, "span.public-list-prb&&Text") || "";
        // 线路/选集：ul.anthology-list-play 下的 li a
        let tabs = [];
        let lists = [];
        let groups = pdfa(html, "ul.anthology-list-play") || pdfa(html, "ul[class*=anthology-list-play]") || [];
        if (groups.length === 0) {
            // 兜底：直接找选集 a
            let eps = pdfa(html, ".anthology-list-play a") || pdfa(html, "ul.anthology-list-play a") || [];
            let urls = [];
            eps.forEach(a => {
                let ep = pdfh(a, "a&&Text") || "";
                let href = pd(a, "a&&href");
                if (href) urls.push(ep + "$" + href);
            });
            if (urls.length) {
                tabs.push("默认");
                lists.push(urls.join("#"));
            }
        } else {
            // 尝试找线路名
            let tabNodes = pdfa(html, ".anthology-tab a") || pdfa(html, ".play-from a") || pdfa(html, "[class*=anthology-tab] a") || [];
            groups.forEach((g, gi) => {
                let eps = pdfa(g, "li a") || pdfa(g, "a") || [];
                let urls = [];
                eps.forEach(a => {
                    let ep = pdfh(a, "a&&Text") || ("第" + (urls.length + 1) + "集");
                    let href = pd(a, "a&&href");
                    if (href) urls.push(ep + "$" + href);
                });
                if (urls.length) {
                    let tabName = (tabNodes[gi] ? pdfh(tabNodes[gi], "a&&Text") : "") || ("线路" + (gi + 1));
                    tabs.push(tabName.trim() || ("线路" + (gi + 1)));
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
        let list = pdfa(html, "div.public-list-box") || [];
        list.forEach(it => {
            let title = pdfh(it, "div.public-list-button a&&Text") || pdfh(it, ".public-list-button a&&Text") || "";
            let img = pd(it, "img&&data-src") || pd(it, "img&&src") || "";
            let link = pd(it, "div.public-list-button a&&href") || pd(it, ".public-list-button a&&href") || "";
            let desc = pdfh(it, "span.public-list-prb&&Text") || "";
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
    // 播放：原 json 开启 open_with_safari_flag，优先抽直链，否则返回播放页嗅探
    lazy: `js:
        if (!/^http/.test(input)) {
            input = rule.host + (input.startsWith("/") ? input : "/" + input);
        }
        try {
            let html = request(input, {headers: rule.headers});
            // 常见 MacCMS 播放配置
            let m = html.match(/player_aaaa\\s*=\\s*(\\{[\\s\\S]*?\\})/);
            if (m) {
                try {
                    let conf = JSON.parse(m[1]);
                    let u = conf.url || conf.uri || "";
                    if (u) {
                        if (!/^http/.test(u) && conf.encrypt) {
                            // 部分站点有加密，交给解析
                            input = { parse: 1, jx: 1, url: u };
                        } else {
                            if (!/^http/.test(u)) u = rule.host + (u.startsWith("/") ? u : "/" + u);
                            input = { parse: 0, jx: 0, url: u, header: rule.headers };
                        }
                        // 跳出
                    }
                } catch (e) {}
            }
            if (typeof input === "string" || (input && input.parse === undefined && !input.url)) {
                let m3u8 = html.match(/https?:\\/\\/[^"'\\s]+\\.m3u8[^"'\\s]*/i);
                let mp4 = html.match(/https?:\\/\\/[^"'\\s]+\\.mp4[^"'\\s]*/i);
                if (m3u8) {
                    input = { parse: 0, jx: 0, url: m3u8[0], header: rule.headers };
                } else if (mp4) {
                    input = { parse: 0, jx: 0, url: mp4[0], header: rule.headers };
                } else {
                    input = { parse: 1, jx: 0, url: input, header: rule.headers };
                }
            }
        } catch (e) {
            input = { parse: 1, jx: 0, url: input };
        }
    `,
    play_parse: true,
    图片来源: '',
    图片替换: '',
    预处理: '',
    double: false,
    tab_exclude: '猜你|喜欢|下载|剧情|榜|评论',
    cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态'
};