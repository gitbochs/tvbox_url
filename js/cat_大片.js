/**
    title: "666大片影视[动态]",
    author: "",
    logo: "https://www.66dpw.xyz/template/mxpro/mxtheme/images/favicon2.png",
    more: {
        sourceTag: "在线影视"
    }
*/
import { Crypto, load, _ } from 'assets://js/lib/cat.js';

let HOST = 'https://www.66dpw.xyz';
let siteKey = "", siteType = "", sourceKey = "", ext = "";
let siteConfig = null; // 缓存网站配置

const UA = 'Mozilla/5.0 (Linux; Android 12; ALN-AL00 Build/HUAWEIALN-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Mobile Safari/537.36';

function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    sourceKey = cfg.sourceKey;
    ext = cfg.ext;
    if (ext && ext.indexOf('http') == 0) HOST = ext;
}

// ==================== 核心：动态获取分类 ====================

async function fetchSiteConfig() {
    if (siteConfig) return siteConfig;
    
    try {
        const res = await req(HOST + '/', { headers: { 'User-Agent': UA } });
        const $ = load(res.content);
        
        // 1. 解析分类（多选择器尝试）
        const classes = parseClasses($);
        
        // 2. 解析筛选条件（访问第一个分类页）
        let filters = {};
        if (classes.length > 0) {
            filters = await fetchFiltersFromPage(classes[0].type_id);
        }
        
        // 3. 如果没获取到，使用硬编码降级
        if (classes.length === 0) {
            console.log('动态获取分类失败，使用默认配置');
            siteConfig = getDefaultConfig();
        } else {
            siteConfig = { classes, filters };
        }
        
        return siteConfig;
    } catch (error) {
        console.log('获取网站配置失败:', error);
        siteConfig = getDefaultConfig();
        return siteConfig;
    }
}

// 解析分类导航
function parseClasses($) {
    const classes = [];
    const seen = new Set();
    
    // 多选择器尝试（适配不同模板版本）
    const selectors = [
        '.nav-menu a',           // 主导航
        '.navbar a',             // 导航栏
        '.header-menu a',        // 头部菜单
        '.type-list a',          // 分类列表
        '.module-class a',       // 模块分类
        '.menu-item a',          // 菜单项
        'a[href*="/vodtype/"]',   // 包含vodtype的链接
        'a[href*="/vodshow/"]',   // 包含vodshow的链接
        'a[href*="/vod/"]'        // 包含vod的链接
    ];
    
    for (const selector of selectors) {
        $(selector).each((i, el) => {
            const $el = $(el);
            const href = $el.attr('href') || '';
            const name = $el.text().trim();
            
            // 提取 type_id
            const match = href.match(/\/vod(?:type|show)?\/?(\d+)/) 
                       || href.match(/[?&]id=(\d+)/)
                       || href.match(/[?&]tid=(\d+)/);
            
            if (match && name && name.length > 0 && name.length < 15) {
                const id = match[1];
                // 过滤非数字ID和重复项
                if (!seen.has(id) && /^\d+$/.test(id) && !['首页', 'Home', '排行'].includes(name)) {
                    seen.add(id);
                    classes.push({
                        type_id: id,
                        type_name: name
                    });
                }
            }
        });
        
        // 如果找到足够分类，停止尝试
        if (classes.length >= 5) break;
    }
    
    return classes.sort((a, b) => parseInt(a.type_id) - parseInt(b.type_id));
}

// 从分类页获取筛选条件
async function fetchFiltersFromPage(typeId) {
    const filters = {};
    
    try {
        const res = await req(`${HOST}/vodshow/${typeId}---time-------1---.html`, {
            headers: { 'User-Agent': UA }
        });
        const $ = load(res.content);
        
        // 解析筛选区域
        $('.module-class-items, .filter-box, .screen-box, .select-box').each((i, box) => {
            const $box = $(box);
            const title = $box.find('.module-class-item-title, .filter-label, .screen-title').text().trim();
            
            // 映射到标准key
            const keyMap = {
                '剧情': 'class', '类型': 'class', '分类': 'class', 'Genre': 'class',
                '地区': 'area', '国家': 'area', '地区': 'area', 'Region': 'area',
                '语言': 'lang', '语种': 'lang', 'Language': 'lang',
                '年份': 'year', '时间': 'year', '年代': 'year', 'Year': 'year',
                '字母': 'letter', '字母': 'letter', 'Letter': 'letter',
                '排序': 'by', '排序': 'by', 'Sort': 'by'
            };
            
            const key = keyMap[title] || null;
            if (!key) return;
            
            const values = [{ n: '全部', v: '' }];
            $box.find('a').each((j, a) => {
                const $a = $(a);
                const n = $a.text().trim();
                const href = $a.attr('href') || '';
                
                // 从href提取value
                let v = '';
                const parts = href.split('/');
                const lastPart = parts[parts.length - 1] || '';
                // 解析 vodshow/1-大陆-time-... 格式
                const segments = lastPart.replace('.html', '').split('-');
                const keyIndex = {
                    'class': 2, 'area': 1, 'lang': 3, 'letter': 4, 'by': 5, 'year': 6
                }[key];
                
                if (segments[keyIndex] && segments[keyIndex] !== '') {
                    v = segments[keyIndex];
                }
                
                if (n && n !== '全部' && n !== 'All') {
                    values.push({ n, v: n }); // 通常value就是名称本身
                }
            });
            
            if (values.length > 1) {
                filters[key] = {
                    key: key,
                    name: title,
                    value: values
                };
            }
        });
        
    } catch (e) {
        console.log('获取筛选条件失败:', e);
    }
    
    // 如果没获取到，使用默认筛选
    if (Object.keys(filters).length === 0) {
        return getDefaultFilters();
    }
    
    return { [typeId]: Object.values(filters) };
}

// ==================== 降级默认配置 ====================

function getDefaultConfig() {
    return {
        classes: [
            { type_id: "1", type_name: "动作大片" },
            { type_id: "2", type_name: "恐怖大片" },
            { type_id: "3", type_name: "科幻大片" },
            { type_id: "4", type_name: "爱情大片" },
            { type_id: "5", type_name: "战争大片" },
            { type_id: "6", type_name: "喜剧大片" },
            { type_id: "7", type_name: "剧情大片" },
            { type_id: "8", type_name: "记录大片" },
            { type_id: "9", type_name: "动漫大片" },
            { type_id: "20", type_name: "经典大片" }
        ],
        filters: getDefaultFilters()
    };
}

function getDefaultFilters() {
    // 返回所有分类的默认筛选（通用）
    const defaultFilter = [
        {"key":"class","name":"剧情","value":[{"n":"全部","v":""},{"n":"喜剧","v":"喜剧"},{"n":"爱情","v":"爱情"},{"n":"恐怖","v":"恐怖"},{"n":"动作","v":"动作"},{"n":"科幻","v":"科幻"},{"n":"剧情","v":"剧情"},{"n":"战争","v":"战争"},{"n":"犯罪","v":"犯罪"},{"n":"动画","v":"动画"},{"n":"奇幻","v":"奇幻"},{"n":"武侠","v":"武侠"},{"n":"冒险","v":"冒险"},{"n":"悬疑","v":"悬疑"},{"n":"惊悚","v":"惊悚"},{"n":"经典","v":"经典"}]},
        {"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"大陆","v":"大陆"},{"n":"香港","v":"香港"},{"n":"台湾","v":"台湾"},{"n":"美国","v":"美国"},{"n":"日本","v":"日本"},{"n":"韩国","v":"韩国"},{"n":"英国","v":"英国"},{"n":"法国","v":"法国"},{"n":"德国","v":"德国"},{"n":"泰国","v":"泰国"},{"n":"印度","v":"印度"},{"n":"其他","v":"其他"}]},
        {"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"国语","v":"国语"},{"n":"英语","v":"英语"},{"n":"粤语","v":"粤语"},{"n":"韩语","v":"韩语"},{"n":"日语","v":"日语"},{"n":"其他","v":"其他"}]},
        {"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"},{"n":"2014","v":"2014"},{"n":"2013","v":"2013"},{"n":"2012","v":"2012"},{"n":"2011","v":"2011"},{"n":"2010","v":"2010"}]},
        {"key":"letter","name":"字母","value":[{"n":"字母","v":""},{"n":"A","v":"A"},{"n":"B","v":"B"},{"n":"C","v":"C"},{"n":"D","v":"D"},{"n":"E","v":"E"},{"n":"F","v":"F"},{"n":"G","v":"G"},{"n":"H","v":"H"},{"n":"I","v":"I"},{"n":"J","v":"J"},{"n":"K","v":"K"},{"n":"L","v":"L"},{"n":"M","v":"M"},{"n":"N","v":"N"},{"n":"O","v":"O"},{"n":"P","v":"P"},{"n":"Q","v":"Q"},{"n":"R","v":"R"},{"n":"S","v":"S"},{"n":"T","v":"T"},{"n":"U","v":"U"},{"n":"V","v":"V"},{"n":"W","v":"W"},{"n":"X","v":"X"},{"n":"Y","v":"Y"},{"n":"Z","v":"Z"},{"n":"0-9","v":"0-9"}]},
        {"key":"by","name":"排序","value":[{"n":"时间排序","v":"time"},{"n":"人气排序","v":"hits"},{"n":"评分排序","v":"score"}]}
    ];
    
    // 为所有分类生成筛选
    const filters = {};
    ['1','2','3','4','5','6','7','8','9','20'].forEach(id => {
        filters[id] = defaultFilter;
    });
    return filters;
}

// ==================== 接口实现 ====================

async function home(filter) {
    const config = await fetchSiteConfig();
    return JSON.stringify({
        class: config.classes,
        filters: config.filters
    });
}

async function homeVod() {
    try {
        const res = await req(HOST + '/', { headers: { 'User-Agent': UA } });
        const $ = load(res.content);
        
        // 多选择器尝试获取首页推荐
        const selectors = [
            '.module-poster-item.module-item',
            '.module-item-poster',
            '.vod-item',
            '.movie-item',
            '.video-item',
            '.module-items .module-item'
        ];
        
        let items = null;
        for (const selector of selectors) {
            items = $(selector);
            if (items.length > 0) break;
        }
        
        if (!items || items.length === 0) return JSON.stringify({ list: [] });
        
        const videos = _.map(items, (item) => {
            const $item = $(item);
            const link = $item.find('a').first();
            const href = link.attr('href') || $item.attr('href');
            const title = link.attr('title') || $item.attr('title') || link.text().trim();
            
            // 多选择器尝试获取图片
            let pic = $item.find('img.lazyload').attr('data-original')
                   || $item.find('img').attr('data-src')
                   || $item.find('img').attr('src')
                   || '';
            
            const note = $item.find('.module-item-note, .pic-text, .status, .remark').text().trim();
            
            return { 
                vod_id: href ? (href.startsWith('http') ? href : HOST + href) : '', 
                vod_name: title, 
                vod_pic: pic, 
                vod_remarks: note 
            };
        }).filter(v => v.vod_id && v.vod_name); // 过滤无效数据
        
        return JSON.stringify({ list: videos });
    } catch (error) {
        console.log('homeVod error:', error);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    
    // 获取该分类的筛选配置
    const config = await fetchSiteConfig();
    const filterGroup = config.filters[tid] || config.filters['1'] || [];
    
    const getVal = (key) => {
        const item = filterGroup.find(it => it.key === key);
        if (!item) return '';
        const val = extend[key];
        if (val) {
            const opt = item.value.find(o => o.v === val);
            return opt ? opt.v : '';
        }
        return item.value[0].v;
    };
    
    const params = ['area', 'by', 'class', 'lang', 'letter'].map(k => getVal(k));
    const year = getVal('year');
    
    // 构建URL（兼容不同格式）
    const link = `${HOST}/vodshow/${tid}-${params.join('-')}---${pg}---${year}.html`;
    
    try {
        const res = await req(link, { headers: { 'User-Agent': UA } });
        const $ = load(res.content);
        
        // 多选择器尝试
        const selectors = [
            '.module-poster-item.module-item',
            '.module-items .module-item',
            '.vod-list .vod-item',
            '.video-list .video-item',
            '.movie-list .movie-item'
        ];
        
        let items = null;
        for (const selector of selectors) {
            items = $(selector);
            if (items.length > 0) break;
        }
        
        if (!items || items.length === 0) {
            return JSON.stringify({ list: [], msg: '未找到视频' });
        }
        
        const videos = _.map(items, (item) => {
            const $item = $(item);
            const link = $item.is('a') ? $item : $item.find('a').first();
            const href = link.attr('href');
            const title = link.attr('title') || $item.find('.module-poster-item-title, .title').text().trim();
            
            let pic = $item.find('img.lazyload').attr('data-original')
                   || $item.find('img').attr('data-src')
                   || $item.find('img').attr('src')
                   || '';
            
            const note = $item.find('.module-item-note, .pic-text, .status').text().trim();
            
            return { 
                vod_id: href ? (href.startsWith('http') ? href : HOST + href) : '', 
                vod_name: title, 
                vod_pic: pic, 
                vod_remarks: note 
            };
        }).filter(v => v.vod_id);
        
        return JSON.stringify({ list: videos });
    } catch (error) {
        return JSON.stringify({ list: [], error: '分类获取失败：' + error.message });
    }
}

async function search(wd) {
    const searchUrl = `${HOST}/vodsearch/${encodeURIComponent(wd)}-------------.html`;
    
    try {
        const res = await req(searchUrl, { headers: { 'User-Agent': UA } });
        const $ = load(res.content);
        
        // 多选择器尝试
        const selectors = [
            '.module-card-item.module-item',
            '.search-item',
            '.vod-search-item',
            '.search-list .search-result'
        ];
        
        let items = null;
        for (const selector of selectors) {
            items = $(selector);
            if (items.length > 0) break;
        }
        
        if (!items || items.length === 0) return JSON.stringify({ list: [] });
        
        const lowerWd = wd.toLowerCase();
        const videos = [];
        
        items.each((index, item) => {
            const $item = $(item);
            const link = $item.find('a').first();
            const href = link.attr('href');
            const title = $item.find('.module-card-item-title strong, .title, .name').text().trim() 
                       || link.attr('title');
            
            let pic = $item.find('img.lazyload').attr('data-original')
                   || $item.find('img').attr('data-src')
                   || $item.find('img').attr('src')
                   || '';
            
            const note = $item.find('.module-item-note, .pic-text, .info').text().trim();
            
            // 模糊匹配标题
            if (title && title.toLowerCase().includes(lowerWd)) {
                videos.push({ 
                    vod_id: href ? (href.startsWith('http') ? href : HOST + href) : '', 
                    vod_name: title, 
                    vod_pic: pic, 
                    vod_remarks: note || '暂无备注'
                });
            }
        });
        
        return JSON.stringify({ list: videos });
    } catch (error) {
        return JSON.stringify({ list: [], error: '搜索失败：' + error.message });
    }
}

async function detail(id) {
    try {
        const res = await req(id, { headers: { 'User-Agent': UA } });
        const html = res.content;
        if (!html) return JSON.stringify({ list: [], error: '页面内容为空' });
        
        const $ = load(html);
        
        // 多选择器尝试获取信息
        const vod_name = $('h1').first().text().trim() 
                      || $('.module-info-heading h1').text().trim()
                      || $('.title').first().text().trim();
        
        let vod_pic = $('.module-info-poster img.lazyload').attr('data-original')
                   || $('.module-info-poster img').attr('src')
                   || $('.poster img').attr('src')
                   || '';
        
        // 解析标签
        let vod_year = '', vod_area = '', vod_type = '';
        $('.module-info-tag-link a, .tag a, .info-tag a').each((i, elem) => {
            const text = $(elem).attr('title') || $(elem).text().trim();
            if (text && /^\d{4}$/.test(text)) vod_year = text;
            else if (['大陆','香港','台湾','美国','日本','韩国','欧美','内地','英国','法国','德国','泰国','新加坡','中国','华语'].includes(text)) vod_area = text;
            else if (text && text.length < 10) vod_type = text;
        });
        
        // 解析详细信息
        let vod_director = '', vod_actor = '', vod_remarks = '', vod_content = '';
        $('.module-info-item, .info-item').each((i, el) => {
            const title = $(el).find('.module-info-item-title, .item-title').text().trim();
            const content = $(el).find('.module-info-item-content, .item-content').text().trim();
            
            if (title.includes('导演')) vod_director = content.replace(/\s+/g, ' ');
            else if (title.includes('主演')) vod_actor = content.replace(/\s+/g, ' ');
            else if (title.includes('备注')) vod_remarks = content;
            else if (title.includes('更新')) vod_remarks = content.split('，')[0];
        });
        
        vod_content = $('.module-info-introduction-content, .desc, .description, .summary').text().trim();
        
        const vod = {
            vod_id: id,
            vod_name: vod_name,
            vod_pic: vod_pic,
            vod_year: vod_year,
            vod_area: vod_area,
            vod_type: vod_type,
            vod_remarks: vod_remarks,
            vod_actor: vod_actor,
            vod_director: vod_director,
            vod_content: vod_content,
            vod_play_from: '',
            vod_play_url: ''
        };
        
        // 解析播放源
        const playFrom = [], playUrl = [];
        
        $('.module-tab-item.tab-item, .source-item, .play-source').each((i, elem) => {
            const sourceName = $(elem).find('span').text().trim() 
                          || $(elem).text().trim()
                          || `播放源${i+1}`;
            playFrom.push(sourceName);
            
            const episodes = [];
            // 对应面板的选择器
            const panelSelectors = [
                `.module-list.sort-list.tab-list:eq(${i})`,
                `.play-list:eq(${i})`,
                `.episode-list:eq(${i})`,
                `.module-play-list:eq(${i})`
            ];
            
            let $panel = null;
            for (const sel of panelSelectors) {
                $panel = $(sel);
                if ($panel.length > 0) break;
            }
            
            if ($panel) {
                $panel.find('.module-play-list-link, .play-link, .episode-link, a').each((j, link) => {
                    const $link = $(link);
                    const episodeText = $link.text().trim();
                    const episodeHref = $link.attr('href');
                    if (episodeText && episodeHref) {
                        const episodeUrl = episodeHref.startsWith('http') ? episodeHref : HOST + episodeHref;
                        episodes.push(`${episodeText}$${episodeUrl}`);
                    }
                });
            }
            playUrl.push(episodes.join('#'));
        });
        
        vod.vod_play_from = playFrom.join('$$$');
        vod.vod_play_url = playUrl.join('$$$');
        
        return JSON.stringify({ list: [vod] });
    } catch (error) {
        return JSON.stringify({ list: [], error: `详情解析失败: ${error.message}` });
    }
}

async function play(flag, id, flags) {
    try {
        const res = await req(id, { headers: { 'User-Agent': UA } });
        const html = res.content;
        
        // 多模式尝试提取播放器数据
        let playerData = null;
        
        // 模式1: player_aaaa
        const playerStart = html.indexOf('var player_aaaa=');
        if (playerStart !== -1) {
            const playerEnd = html.indexOf('</script>', playerStart);
            const playerScript = html.substring(playerStart + 'var player_aaaa='.length, playerEnd);
            const cleanScript = playerScript.split(';')[0].trim();
            try {
                playerData = JSON.parse(cleanScript);
            } catch(e) {}
        }
        
        // 模式2: playerConfig
        if (!playerData) {
            const configMatch = html.match(/var playerConfig\s*=\s*({.+?});/);
            if (configMatch) {
                try {
                    playerData = JSON.parse(configMatch[1]);
                } catch(e) {}
            }
        }
        
        // 模式3: 直接URL匹配
        if (!playerData) {
            const urlMatch = html.match(/"url"\s*:\s*"([^"]+)"/);
            if (urlMatch) {
                playerData = { url: urlMatch[1], encrypt: '0' };
            }
        }
        
        if (!playerData) {
            throw new Error('未找到播放器数据');
        }

        let url = playerData.url || '';
        const encrypt = String(playerData.encrypt || '0');

        // 解密处理
        if (encrypt === '1') {
            url = decodeURIComponent(url);
        } else if (encrypt === '2') {
            try {
                const base64Str = Crypto.enc.Base64.parse(url).toString(Crypto.enc.Utf8);
                url = decodeURIComponent(base64Str);
            } catch(e) {
                url = atob(url); // 备用解码
            }
        }

        url = url.trim();
        const directVideoPattern = /\.(m3u8|mp4|mkv|flv|avi|mov|wmv|webm)(\?.*)?$/i;
        const isDirectVideo = directVideoPattern.test(url);
        
        if (url && isDirectVideo) {
            return JSON.stringify({ parse: 0, url: url, header: { 'User-Agent': UA } });
        } else if (url) {
            // 尝试解析接口
            const parserResult = await tryParse(url);
            if (parserResult) return parserResult;
            
            // 使用webview解析
            return JSON.stringify({ parse: 1, url: id, header: { 'User-Agent': UA } });
        } else {
            throw new Error('播放地址为空');
        }
    } catch (error) {
        console.log('play error:', error);
        return JSON.stringify({ parse: 0, url: id, header: { 'User-Agent': UA } });
    }
}

// 尝试第三方解析
async function tryParse(url) {
    const parsers = [
        `https://svip.qlplayer.cyou/?url=${encodeURIComponent(url)}`,
        `https://jx.jsonplayer.com/player/?url=${encodeURIComponent(url)}`,
        `https://jx.aidouer.net/?url=${encodeURIComponent(url)}`
    ];
    
    for (const parserUrl of parsers) {
        try {
            const parserRes = await req(parserUrl, { 
                headers: { 'User-Agent': UA },
                timeout: 5000 
            });
            const parserHtml = parserRes.content;
            
            // 尝试提取直链
            const urlMatches = parserHtml.match(/"url"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i)
                            || parserHtml.match(/url:\s*['"]([^'"]+\.(?:m3u8|mp4)[^'"]*)['"]/i);
            
            if (urlMatches && urlMatches[1]) {
                const videoUrl = urlMatches[1].replace(/\\\//g, '/');
                return JSON.stringify({ 
                    parse: 0, 
                    url: videoUrl,
                    header: { 'User-Agent': UA, 'Referer': parserUrl }
                });
            }
        } catch (e) {}
    }
    
    return null;
}

export function __jsEvalReturn() {
    return { 
        init: init, 
        detail: detail, 
        home: home, 
        play: play, 
        homeVod: homeVod, 
        category: category, 
        search: search 
    };
}
