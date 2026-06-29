import { Crypto, load, _ } from 'assets://js/lib/cat.js';

let HOST = 'https://bajie2028.com';
let siteKey = '', siteType = '', sourceKey = '', ext = '';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const headers = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': HOST + '/'
};

function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    sourceKey = cfg.sourceKey || '';
    ext = cfg.ext || '';
    if (ext && ext.startsWith('http')) HOST = ext.replace(/\/$/, '');
}

async function request(url, options = {}) {
    try {
        options.headers = Object.assign({}, headers, options.headers || {});
        if (!options.headers.Referer) options.headers.Referer = HOST + '/';
        const res = await req(url, options);
        return res;
    } catch (e) {
        return { content: '' };
    }
}

function getFullUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return HOST + (url.startsWith('/') ? '' : '/') + url;
}

function parseVodList($, selector) {
    const list = [];
    $(selector).each((_, it) => {
        const $it = $(it);
        const a = $it.find('.pic a').first();
        if (!a.length) return;
        
        const href = a.attr('href') || '';
        if (!href || href.includes('javascript:')) return;

        const title = a.attr('title') || $it.find('.name h3 a').text().trim();
        const pic = $it.find('.img-wrapper-pic').attr('data-original') || $it.find('img.lazyload').attr('data-original');
        const remarks = $it.find('.item-status').text().trim();

        list.push({
            vod_id: getFullUrl(href),
            vod_name: title,
            vod_pic: getFullUrl(pic),
            vod_remarks: remarks.replace(/\s+/g, ' ')
        });
    });
    return list;
}

async function home(filter) {
    const classes = [
        { type_id: '1', type_name: '电影' },
        { type_id: '2', type_name: '电视剧' },
        { type_id: '3', type_name: '综艺' },
        { type_id: '4', type_name: '动漫' },
        { type_id: '35', type_name: '动画片' },
        { type_id: '36', type_name: '短剧' }
    ];

    const filterObj = {};
    
    const areaValue = [
        { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' }, { n: '台湾', v: '台湾' },
        { n: '美国', v: '美国' }, { n: '法国', v: '法国' }, { n: '英国', v: '英国' }, { n: '日本', v: '日本' },
        { n: '韩国', v: '韩国' }, { n: '德国', v: '德国' }, { n: '泰国', v: '泰国' }, { n: '印度', v: '印度' },
        { n: '意大利', v: '意大利' }, { n: '其他', v: '其他' }
    ];
    
    const yearValue = [{ n: '全部', v: '' }];
    for (let y = 2026; y >= 2010; y--) yearValue.push({ n: y.toString(), v: y.toString() });
    
    const sortValue = [
        { n: '最近更新', v: 'time' }, 
        { n: '最多播放', v: 'hits' }, 
        { n: '最好评分', v: 'score' }
    ];
    
    const langValue = [
        { n: '全部', v: '' }, { n: '国语', v: '国语' }, { n: '英语', v: '英语' }, { n: '粤语', v: '粤语' },
        { n: '闽南语', v: '闽南语' }, { n: '韩语', v: '韩语' }, { n: '日语', v: '日语' }, { n: '法语', v: '法语' },
        { n: '德语', v: '德语' }, { n: '其它', v: '其它' }
    ];

    classes.forEach(it => {
        filterObj[it.type_id] = [
            { key: 'area', name: '地区', value: areaValue },
            { key: 'lang', name: '语言', value: langValue },
            { key: 'year', name: '年份', value: yearValue },
            { key: 'by', name: '排序', value: sortValue }
        ];
    });

    return JSON.stringify({ class: classes, filters: filterObj });
}

async function homeVod() {
    try {
        const res = await request(HOST);
        const $ = load(res.content);
        // 获取首页各模块的视频列表
        let list = parseVodList($, '.vlist ul.row li, .vod-list ul.row li');
        return JSON.stringify({ list: _.uniqBy(list, 'vod_id') });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    pg = parseInt(pg) || 1;
    try {
        let area = extend.area || '';
        let by = extend.by || 'time';
        let clazz = extend.class || '';
        let lang = extend.lang || '';
        let letter = extend.letter || '';
        let year = extend.year || '';

        // 拼接格式：/vodshow/1-大陆-hits-动作-国语-A---1---2026.html
        let url = `${HOST}/vodshow/${tid}-${encodeURIComponent(area)}-${by}-${encodeURIComponent(clazz)}-${encodeURIComponent(lang)}-${letter}---${pg}---${year}.html`;

        const res = await request(url);
        const $ = load(res.content);
        const list = parseVodList($, '.vlist ul.row li, .vod-list ul.row li');
        
        // 匹配“下一页”按钮以判断是否有更多数据
        const hasMore = $('.ewave-page a:contains("下一页")').length > 0;
        
        return JSON.stringify({ page: pg, pagecount: hasMore ? pg + 1 : pg, list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function detail(id) {
    try {
        const res = await request(id);
        const $ = load(res.content);
        
        const vod_name = $('.vod-info .info h3 a').text().trim() || $('.vod-info .info h3').text().trim();
        const vod_pic = $('.vod-info .pic img').attr('data-original') || $('.vod-info .pic img').attr('src');
        
        let vod_actor = '', vod_director = '', vod_type = '', vod_area = '', vod_year = '';

        // 提取影片元数据信息
        $('.vod-info .info p.row span').each((i, el) => {
            const text = $(el).text();
            if (text.includes('主演：')) vod_actor = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('导演：')) vod_director = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('分类：')) vod_type = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('地区：')) vod_area = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('年份：')) vod_year = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
        });

        const vod_content = $('.vod-info .info .text').text().replace('简介：', '').trim();

        // 提取播放源名称 (例如：高清云播)
        const playSources = [];
        $('.playlist-tab ul li').each((i, el) => {
            playSources.push($(el).text().trim());
        });

        // 提取各个播放源的集数列表
        const playUrls = [];
        $('.episode-box ul.ewave-playlist-content').each((i, el) => {
            if (i >= playSources.length) return;
            const episodes = [];
            $(el).find('li a').each((j, a) => {
                const name = $(a).text().trim();
                const link = getFullUrl($(a).attr('href'));
                episodes.push(`${name}$${link}`);
            });
            playUrls.push(episodes.join('#'));
        });

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name,
                vod_pic: getFullUrl(vod_pic),
                vod_type,
                vod_area,
                vod_year,
                vod_actor,
                vod_director,
                vod_content,
                vod_play_from: playSources.join('$$$'),
                vod_play_url: playUrls.join('$$$')
            }]
        });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function search(wd, quick, pg) {
    pg = parseInt(pg) || 1;
    try {
        // 八戒影视的搜索URL格式
        let url = `${HOST}/vodsearch/${encodeURIComponent(wd)}----------${pg}---.html`;
        const res = await request(url);
        const $ = load(res.content);
        
        const list = parseVodList($, '.vlist ul.row li, .vod-list ul.row li');
        const hasMore = $('.ewave-page a:contains("下一页")').length > 0;
        
        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: hasMore ? pg + 1 : pg
        });
    } catch (e) {
        return JSON.stringify({ list: [], page: 1, pagecount: 0 });
    }
}

async function play(flag, id, flags) {
    try {
        const res = await request(id);
        // 八戒影视播放页通常使用 player_aaaa 或 player_data
        const match = res.content.match(/var\s+(?:player_data|player_aaaa)\s*=\s*({.+?});/);
        
        if (match) {
            const playerConfig = JSON.parse(match[1]);
            let url = playerConfig.url;
            
            if (playerConfig.encrypt == 1) {
                url = decodeURIComponent(url);
            } else if (playerConfig.encrypt == 2) {
                url = decodeURIComponent(atob(url));
            }
            
            if (url.includes('.m3u8') || url.includes('.mp4')) {
                return JSON.stringify({ parse: 0, url: url, header: { 'User-Agent': UA } });
            } else {
                // 如果是非直链资源需要解析器支持
                return JSON.stringify({ parse: 1, url: url, header: { 'User-Agent': UA } });
            }
        }
        
        return JSON.stringify({ parse: 1, url: id });
    } catch (e) {
        return JSON.stringify({ parse: 1, url: id });
    }
}

export function __jsEvalReturn() {
    return { init, home, homeVod, category, search, detail, play };
}