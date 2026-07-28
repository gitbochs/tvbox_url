var rule = {
    title: 'ppnix',
    host: 'https://www.ppnix.com',
    url: '/cn/fyclass/---fypage-.html',
    searchUrl: '/cn/search/**-fypage-.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Referer': 'https://www.ppnix.com/'
    },
    timeout: 8000,
    class_name: '电影&剧集',
    class_url: 'movie&tv',
    // 推荐/首页
    推荐: '*',
    // 一级列表（对应 ppnix.json 的 vod_*）
    一级: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        let d = [];
        let html = request(input);
        let list = pdfa(html, "div.lists-content li") || pdfa(html, ".lists-content li") || [];
        list.forEach(it => {
            let title = pdfh(it, "h2 a&&Text") || pdfh(it, "h2&&Text") || "";
            let img = pd(it, "img&&src") || pd(it, "img&&data-src") || "";
            let link = pd(it, "h2 a&&href") || pd(it, "a&&href") || "";
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
    // 二级详情（原 json playlist_flag=false，无选集列表，详情页即播放入口）
    二级: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        VOD = {};
        let html = request(input);
        VOD.vod_name = pdfh(html, "h1&&Text") || pdfh(html, "h2&&Text") || pdfh(html, "title&&Text").split("-")[0].trim() || "";
        VOD.vod_pic = pd(html, "img&&src") || pd(html, "img&&data-src") || pd(html, "meta[property=og:image]&&content") || "";
        VOD.vod_content = pdfh(html, "meta[name=description]&&content") || pdfh(html, ".detail&&Text") || pdfh(html, ".desc&&Text") || "";
        VOD.vod_remarks = "";
        // playlist_flag=false：无独立选集组，尝试从详情页提取播放链接
        let tabs = [];
        let lists = [];
        // 常见播放列表选择器兜底
        let groups = pdfa(html, "ul.anthology-list-play") || pdfa(html, ".playlist a") || pdfa(html, ".play-list a") || pdfa(html, "[class*=playlist] a") || pdfa(html, ".stui-content__playlist a") || [];
        if (groups.length > 0) {
            let urls = [];
            groups.forEach(a => {
                let ep = pdfh(a, "a&&Text") || pdfh(a, "Text") || ("播放" + (urls.length + 1));
                let href = pd(a, "a&&href") || pd(a, "href");
                if (href) urls.push(ep + "$" + href);
            });
            if (urls.length) {
                tabs.push("默认");
                lists.push(urls.join("#"));
            }
        }
        // 仍无选集时：把当前详情页当作唯一播放源（对应 open_with_safari）
        if (lists.length === 0) {
            tabs.push("默认");
            lists.push("播放$" + input);
        }
        VOD.vod_play_from = tabs.join("$$$") || "默认";
        VOD.vod_play_url = lists.join("$$$");
    `,
    // 搜索（对应 search_*）
    搜索: `js:
        pdfh = jsp.pdfh; pdfa = jsp.pdfa; pd = jsp.pd;
        let d = [];
        let html = request(input);
        let list = pdfa(html, "div.lists-content li") || pdfa(html, ".lists-content li") || [];
        list.forEach(it => {
            let title = pdfh(it, "h2 a&&Text") || pdfh(it, "h2&&Text") || "";
            let img = pd(it, "img&&src") || pd(it, "img&&data-src") || "";
            let link = pd(it, "h2 a&&href") || pd(it, "a&&href") || "";
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
    // 播放：原 json open_with_safari_flag=true，优先抽直链，否则返回页面嗅探
    lazy: `js:
        if (!/^http/.test(input)) {
            input = rule.host + (input.startsWith("/") ? input : "/" + input);
        }
        try {
            let html = request(input, {headers: rule.headers});
            // 常见播放配置
            let m = html.match(/player_aaaa\\s*=\\s*(\\{[\\s\\S]*?\\})/) || html.match(/var\\s+player_.*?=\\s*(\\{[\\s\\S]*?\\})/);
            if (m) {
                try {
                    let conf = JSON.parse(m[1]);
                    let u = conf.url || conf.uri || "";
                    if (u) {
                        if (!/^http/.test(u) && conf.encrypt) {
                            input = { parse: 1, jx: 1, url: u };
                        } else {
                            if (!/^http/.test(u)) u = rule.host + (u.startsWith("/") ? u : "/" + u);
                            input = { parse: 0, jx: 0, url: u, header: rule.headers };
                        }
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