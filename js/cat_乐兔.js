import { Crypto, load, _ } from 'assets://js/lib/cat.js';

let HOST = 'https://www.letu.me';
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
        const a = $it.find('a.vodlist_thumb').first();
        const href = a.attr('href') || '';
        if (!href) return;

        const title = a.attr('title') || $it.text().trim();
        const pic = a.attr('data-original') || a.attr('src');
        const remarks = $it.find('.pic_text').text().trim();

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
        { type_id: '2', type_name: '连续剧' },
        { type_id: '3', type_name: '综艺' },
        { type_id: '4', type_name: '动漫' },
        { type_id: '5', type_name: '短剧' }
    ];

    const filterObj = {};
    
    const areaValue = [
        { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' }, { n: '台湾', v: '台湾' },
        { n: '美国', v: '美国' }, { n: '法国', v: '法国' }, { n: '英国', v: '英国' }, { n: '日本', v: '日本' },
        { n: '韩国', v: '韩国' }, { n: '德国', v: '德国' }, { n: '泰国', v: '泰国' }, { n: '印度', v: '印度' },
        { n: '意大利', v: '意大利' }, { n: '西班牙', v: '西班牙' }, { n: '加拿大', v: '加拿大' }, { n: '其他', v: '其他' }
    ];
    
    const yearValue = [{ n: '全部', v: '' }];
    for (let y = 2026; y >= 2012; y--) yearValue.push({ n: y.toString(), v: y.toString() });
    
    const sortValue = [
        { n: '按最新', v: 'time' }, 
        { n: '按最热', v: 'hits' }, 
        { n: '按评分', v: 'score' }
    ];

    classes.forEach(it => {
        filterObj[it.type_id] = [
            { key: 'class', name: '类型', value: [{ n: '全部', v: '' }, { n: '喜剧', v: '喜剧' }, { n: '爱情', v: '爱情' }, { n: '动作', v: '动作' }, { n: '科幻', v: '科幻' }, { n: '剧情', v: '剧情' }, { n: '战争', v: '战争' }, { n: '警匪', v: '警匪' }, { n: '犯罪', v: '犯罪' }, { n: '动画', v: '动画' }, { n: '奇幻', v: '奇幻' }, { n: '武侠', v: '武侠' }, { n: '冒险', v: '冒险' }, { n: '枪战', v: '枪战' }, { n: '悬疑', v: '悬疑' }, { n: '惊悚', v: '惊悚' }, { n: '经典', v: '经典' }, { n: '青春', v: '青春' }, { n: '文艺', v: '文艺' }, { n: '微电影', v: '微电影' }, { n: '古装', v: '古装' }, { n: '历史', v: '历史' }, { n: '运动', v: '运动' }, { n: '农村', v: '农村' }, { n: '儿童', v: '儿童' }, { n: '网络电影', v: '网络电影' }] },
            { key: 'area', name: '地区', value: areaValue },
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
        let list = parseVodList($, '.cbox_list .vodlist_item');
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

        let url = `${HOST}/vodshow/${tid}-${encodeURIComponent(area)}-${by}-${encodeURIComponent(clazz)}-${encodeURIComponent(lang)}-${letter}---${pg}---${year}.html`;

        const res = await request(url);
        const $ = load(res.content);
        const list = parseVodList($, '.vodlist_item');
        const hasMore = $('.page a:contains("下一页")').length > 0;
        
        return JSON.stringify({ page: pg, pagecount: hasMore ? pg + 1 : pg, list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function detail(id) {
    try {
        const res = await request(id);
        const $ = load(res.content);
        
        const vod_name = $('h2.title').first().text().trim();
        const vod_pic = $('.vodlist_thumb').attr('data-original') || $('.vodlist_thumb').attr('src');
        
        let vod_actor = '', vod_director = '', vod_type = '', vod_area = '', vod_year = '';

        $('.data').each((i, el) => {
            const text = $(el).text();
            if (text.includes('主演：')) vod_actor = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('导演：')) vod_director = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('类型：')) vod_type = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('地区：')) vod_area = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
            if (text.includes('年份：')) vod_year = $(el).find('a').map((i, a) => $(a).text()).get().join(',');
        });

        const vod_content = $('.content_desc.full_text span').text().trim() || $('.content_desc.context span').text().trim();

        const playSources = [];
        $('#NumTab a').each((i, el) => {
            playSources.push($(el).text().trim().replace(/&nbsp;/g, ''));
        });

        const playUrls = [];
        $('.play_list_box').each((i, el) => {
            if (i >= playSources.length) return;
            const episodes = [];
            $(el).find('.content_playlist li a').each((j, a) => {
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
        let url = `${HOST}/vodsearch/${encodeURIComponent(wd)}----------${pg}---.html`;
        const res = await request(url);
        const $ = load(res.content);
        
        const list = parseVodList($, '.vodlist_item');
        const hasMore = $('.page a:contains("下一页")').length > 0;
        
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