import cheerio from 'assets://js/lib/cheerio.min.js';

const appConfig = {
    siteName: "神马影院",
    siteUrl: "https://www.lfsymy.com"
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

async function init(ext) {
    console.log("初始化爬虫:", appConfig.siteName);
}

const catConfig = {
    "电影":     { tid: "1",  sub: ["6","7","8","9","10","11","12","13","14","15"] },
    "电视剧":   { tid: "2",  sub: [] },
    "动漫":     { tid: "3",  sub: [] },
    "综艺":     { tid: "4",  sub: [] },
    "短剧":     { tid: "5",  sub: [] }
};

const subCatMap = {
    "6":  "动作片",
    "7":  "喜剧片",
    "8":  "爱情片",
    "9":  "科幻片",
    "10": "恐怖片",
    "11": "剧情片",
    "12": "战争片",
    "13": "动画片",
    "14": "悬疑片",
    "15": "纪录片"
};

const typeFilter = {
    "key": "type", "name": "类型", "value": [
        { "n": "全部", "v": "" },
        { "n": "动作", "v": "动作" },
        { "n": "喜剧", "v": "喜剧" },
        { "n": "爱情", "v": "爱情" },
        { "n": "科幻", "v": "科幻" },
        { "n": "恐怖", "v": "恐怖" },
        { "n": "剧情", "v": "剧情" },
        { "n": "战争", "v": "战争" },
        { "n": "悬疑", "v": "悬疑" },
        { "n": "动画", "v": "动画" },
        { "n": "纪录", "v": "纪录" }
    ]
};

function getYearFilter() {
    let years = [{ "n": "全部", "v": "" }];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2000; y--) {
        years.push({ "n": String(y), "v": String(y) });
    }
    return { "key": "year", "name": "年份", "value": years };
}

function getAreaFilter() {
    return {
        "key": "area", "name": "地区", "value": [
            { "n": "全部", "v": "" },
            { "n": "大陆", "v": "大陆" },
            { "n": "香港", "v": "香港" },
            { "n": "台湾", "v": "台湾" },
            { "n": "美国", "v": "美国" },
            { "n": "日本", "v": "日本" },
            { "n": "韩国", "v": "韩国" },
            { "n": "英国", "v": "英国" },
            { "n": "法国", "v": "法国" },
            { "n": "德国", "v": "德国" },
            { "n": "泰国", "v": "泰国" },
            { "n": "印度", "v": "印度" },
            { "n": "其他", "v": "其他" }
        ]
    };
}

const commonFilters = [
    getAreaFilter(),
    getYearFilter(),
    typeFilter
];

const myFilters = {};

async function home(filter) {
    const classList = [
        { type_id: "电影",   type_name: "电影" },
        { type_id: "电视剧", type_name: "电视剧" },
        { type_id: "动漫",   type_name: "动漫" },
        { type_id: "综艺",   type_name: "综艺" },
        { type_id: "短剧",   type_name: "短剧" }
    ];

    classList.forEach(item => {
        myFilters[item.type_id] = commonFilters;
    });

    let list = [];
    try {
        const html = (await req(appConfig.siteUrl, {
            method: "GET",
            headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Referer": appConfig.siteUrl
            }
        })).content;
        const $ = cheerio.load(html);
        let seen = {};

        $(".row-six .box-item").each(function () {
            let $a = $(this).find("a.item-link").first();
            let vod_id = $a.attr("href");
            if (!vod_id || seen[vod_id]) return;

            let vod_name = $a.attr("title") || "";
            let $img = $(this).find("img").first();
            let vod_pic = fixUrl($img.attr("src") || $img.attr("data-src") || "");

            let vod_remarks = "";
            $a.contents().each(function () {
                if (this.type === 'text') {
                    let t = $(this).text().trim();
                    if (t && !vod_remarks) vod_remarks = t;
                }
            });
            if (!vod_remarks) {
                vod_remarks = $(this).find(".meta .item-name").text().trim() || "";
            }

            if (vod_name && vod_id) {
                seen[vod_id] = true;
                list.push({ vod_id, vod_name, vod_pic, vod_remarks });
            }
        });
    } catch (e) {
        console.error("首页推荐获取失败:", e.message);
    }

    return JSON.stringify({
        class: classList,
        filters: myFilters,
        list: list.slice(0, 30)
    });
}

function buildCategoryUrl(catName, pg, extend) {
    let cfg = catConfig[catName] || { tid: "1", sub: [] };
    let areaVal = extend.area || '';
    let yearVal = extend.year || '';
    let typeVal = extend.type || '';

    let parts = [`/lfs/${cfg.tid}`];
    if (areaVal) parts.push(`area/${encodeURIComponent(areaVal)}`);
    if (yearVal) parts.push(`year/${encodeURIComponent(yearVal)}`);
    if (typeVal) parts.push(`class/${encodeURIComponent(typeVal)}`);
    
    if (areaVal || yearVal || typeVal) {
        return `${appConfig.siteUrl}${parts.join('/')}.html`;
    } else {
        return `${appConfig.siteUrl}/lf/${cfg.tid}-${pg}.html`;
    }
}

function fixUrl(u) {
    if (!u) return '';
    if (u.startsWith('http')) return u;
    if (u.startsWith('//')) return 'https:' + u;
    if (u.startsWith('/')) return appConfig.siteUrl + u;
    return u;
}

function parseListHtml(html) {
    const $ = cheerio.load(html);
    let list = [];
    let vodIds = {};

    $(".box-item").each(function (index, el) {
        let $a = $(this).find("a.item-link").first();
        let vod_id = $a.attr("href");
        if (!vod_id || vodIds[vod_id]) return;

        let vod_name = $a.attr("title") || "";

        let $pic = $(this).find("img").first();
        let vod_pic = fixUrl($pic.attr("src") || $pic.attr("data-src") || "");

        let vod_remarks = "";
        let $link = $(this).find("a.item-link").first();
        $link.contents().each(function() {
            if (this.type === 'text') {
                let text = $(this).text().trim();
                if (text && !vod_remarks) vod_remarks = text;
            }
        });

        if (vod_name && vod_id) {
            vodIds[vod_id] = true;
            list.push({ vod_id, vod_name, vod_pic, vod_remarks });
        }
    });

    let pagecount = 1;
    let $lastPage = $("a[title='末页']").last();
    if ($lastPage.length > 0) {
        let href = $lastPage.attr("href");
        if (href) {
            let m = href.match(/-(\d+)\.html/);
            if (m) pagecount = parseInt(m[1]);
        }
    } else {
        let maxPage = 1;
        $("a[href*='/lf/']").each(function() {
            let href = $(this).attr("href");
            if (href) {
                let m = href.match(new RegExp(`/lf/\\d+-(\\d+)\\.html`));
                if (m) {
                    let p = parseInt(m[1]);
                    if (p > maxPage) maxPage = p;
                }
            }
        });
        pagecount = maxPage;
    }

    return { list, pagecount };
}

async function category(tid, pg, filter, extend) {
    pg = pg || 1;
    extend = extend || {};

    let url = buildCategoryUrl(tid, pg, extend);

    try {
        const html = (await req(url, {
            method: "GET",
            headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Referer": appConfig.siteUrl
            }
        })).content;
        const result = parseListHtml(html);
        return JSON.stringify(result);
    } catch (e) {
        console.error("分类列表获取失败:", e.message);
        return JSON.stringify({ list: [], pagecount: 0 });
    }
}

async function search(wd, quick, page) {
    page = page || 1;
    try {
        const url = `${appConfig.siteUrl}/search.html`;
        const html = (await req(url, {
            method: "POST",
            data: { wd: wd },
            headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Referer": appConfig.siteUrl,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })).content;
        const result = parseListHtml(html);
        return JSON.stringify({ list: result.list, pagecount: 1 });
    } catch (e) {
        console.error("搜索失败:", e.message);
        return JSON.stringify({ list: [] });
    }
}

async function detail(id) {
    try {
        const html = (await req(appConfig.siteUrl + id, {
            method: "GET",
            headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Referer": appConfig.siteUrl
            }
        })).content;
        const $ = cheerio.load(html);

        let vod_name = $("h1").first().text().trim() || $(".video-info-title").first().text().trim();

        let vod_pic = "";
        let $detailPic = $(".video-pic img, .pic img, .detail-pic img, .vod-pic img, .thumb img").first();
        if ($detailPic.length > 0) {
            vod_pic = fixUrl($detailPic.attr("src") || $detailPic.attr("data-src") || "");
        }
        if (!vod_pic) {
            $("img").each(function() {
                let alt = $(this).attr("alt") || "";
                let src = $(this).attr("src") || $(this).attr("data-src") || "";
                if ((alt.includes(vod_name) || vod_name.includes(alt)) && src.includes('upload')) {
                    vod_pic = fixUrl(src);
                    return false;
                }
            });
        }

        let vod_actor = "";
        let vod_director = "";
        let vod_remarks = "";
        let vod_year = "";
        let vod_area = "";
        let vod_content = "";
        let vod_class = "";

        $("ul").each(function () {
            let $label = $(this).find(".info-label, .li_l span").first();
            let label = $label.text().trim();
            let $value = $(this).find(".li_r, .li_r a").first();
            let value = $value.text().trim();

            if (label === '导演' && !vod_director) {
                vod_director = $(this).find(".li_r a").map(function() { return $(this).text().trim(); }).get().filter(Boolean).join(',');
                if (!vod_director) vod_director = value;
            }
            if (label === '主演' && !vod_actor) {
                vod_actor = $(this).find(".li_r a").map(function() { return $(this).text().trim(); }).get().filter(Boolean).join(',');
                if (!vod_actor) vod_actor = value;
            }
            if (label === '类型' && !vod_class) {
                vod_class = $(this).find(".li_r a").map(function() { return $(this).text().trim(); }).get().filter(Boolean).join(',');
                if (!vod_class) vod_class = value;
            }
            if (label === '年份' && !vod_year) {
                vod_year = value || $(this).find("a").first().text().trim();
            }
            if (label === '地区' && !vod_area) {
                vod_area = value || $(this).find("a").first().text().trim();
            }
            if (label === '状态' && !vod_remarks) {
                vod_remarks = value;
            }
        });

        if (!vod_year) {
            $("a[href*='year/']").each(function() {
                let y = $(this).text().trim();
                if (/^\d{4}$/.test(y)) {
                    vod_year = y;
                    return false;
                }
            });
        }

        let $intro = $(".video-info-content, .desc, .introduction, .content-detail, .vod-content, .video-detail");
        if ($intro.length > 0) {
            vod_content = $intro.first().text().trim();
        }
        if (!vod_content) {
            $("h3:contains('简介')").nextAll("p").each(function() {
                vod_content += $(this).text().trim();
            });
        }
        if (!vod_content) {
            $("p:contains('是')").each(function() {
                let text = $(this).text().trim();
                if (text.length > 50) {
                    vod_content = text;
                    return false;
                }
            });
        }

        let lines = [];
        let playlists = [];
        let seenEpisodes = new Set();

        $(".dslist-group").each(function () {
            let lineName = "默认";
            let $heading = $(this).prev(".panel-heading");
            if ($heading.length > 0) {
                let text = $heading.text().trim();
                let match = text.match(/《[^》]+》\s*-\s*([^-]+)\s*-/);
                if (match) {
                    lineName = match[1].trim();
                }
            }

            let episodes = [];
            $(this).find("a[href*='/lfplay/']").each(function () {
                let name = $(this).text().trim();
                let href = $(this).attr('href') || '';

                if (name && href && !name.includes("立即播放")) {
                    let episodeKey = `${name}_${href}`;
                    if (!seenEpisodes.has(episodeKey)) {
                        seenEpisodes.add(episodeKey);
                        episodes.push(`${name}$${href}`);
                    }
                }
            });

            if (episodes.length > 0) {
                lines.push(lineName);
                playlists.push(episodes);
            }
        });

        if (lines.length === 0) {
            let episodes = [];
            $("a[href*='/lfplay/']").each(function () {
                let name = $(this).text().trim();
                let href = $(this).attr('href') || '';

                if (name && href && !name.includes("立即播放")) {
                    let episodeKey = `${name}_${href}`;
                    if (!seenEpisodes.has(episodeKey)) {
                        seenEpisodes.add(episodeKey);
                        episodes.push(`${name}$${href}`);
                    }
                }
            });
            if (episodes.length > 0) {
                lines.push("默认");
                playlists.push(episodes);
            }
        }

        if (lines.length === 0) {
            lines.push("默认");
            playlists.push([`暂无播放地址$${id}`]);
        }

        const { vod_play_from, vod_play_url } = buildVodPlayData(lines, playlists);

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name,
                vod_pic,
                vod_actor,
                vod_director,
                vod_remarks,
                vod_year,
                vod_area,
                vod_content,
                vod_class,
                vod_play_from,
                vod_play_url
            }]
        });
    } catch (error) {
        console.error(`解析详情页异常 [ID: ${id}]:`, error);
        return JSON.stringify({ list: [] });
    }
}

function buildVodPlayData(lines, playlists) {
    const processedPlaylists = playlists.map(eps => eps.join('#'));
    return {
        vod_play_from: lines.filter(Boolean).join('$$$'),
        vod_play_url: processedPlaylists.join('$$$')
    };
}

async function play(flag, id, flags) {
    try {
        if (id.startsWith("http")) {
            return JSON.stringify({
                parse: 0,
                Header: { "User-Agent": UA, "Referer": appConfig.siteUrl },
                url: id
            });
        }

        const html = (await req(`${appConfig.siteUrl}${id}`, {
            method: "GET",
            headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Referer": appConfig.siteUrl
            }
        })).content;

        let playerMatch = html.match(/var player_aaaa=(\{.+?\});/);
        if (playerMatch) {
            try {
                let playerData = JSON.parse(playerMatch[1]);
                if (playerData.url) {
                    return JSON.stringify({
                        parse: 0,
                        Header: { "User-Agent": UA, "Referer": appConfig.siteUrl },
                        url: playerData.url
                    });
                }
            } catch (e) {
                console.error("解析player_aaaa失败:", e.message);
            }
        }

        let urlMatch = html.match(/"url"[:=]\s*"([^"]+\.m3u8[^"]*)"/);
        if (urlMatch) {
            return JSON.stringify({
                parse: 0,
                Header: { "User-Agent": UA, "Referer": appConfig.siteUrl },
                url: urlMatch[1].replace(/\\/g, '')
            });
        }

        const $ = cheerio.load(html);
        let iframeSrc = $("iframe").attr("src");
        if (iframeSrc) {
            return JSON.stringify({
                parse: 1,
                Header: { "User-Agent": UA, "Referer": appConfig.siteUrl },
                url: fixUrl(iframeSrc)
            });
        }

        return JSON.stringify({
            parse: 1,
            Header: { "User-Agent": UA, "Referer": appConfig.siteUrl },
            url: appConfig.siteUrl + id
        });
    } catch (e) {
        console.error("播放失败:", e);
        return JSON.stringify({ parse: 0, url: "" });
    }
}

export default {
    init,
    home,
    category,
    detail,
    search,
    play
};
