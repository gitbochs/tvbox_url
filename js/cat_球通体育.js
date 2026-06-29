import { _ } from 'assets://js/lib/cat.js';

const API_BASE = 'https://aapi2.xbncs.com/api';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
};

async function requestJson(url) {
    let res = await req(url, {
        headers: HEADERS,
        timeout: 10000
    });
    let content = typeof res === 'string' ? res : (res.content || '');
    try {
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
}

async function home(filter) {
    let classes = [
        { type_id: '-1', type_name: '全部' },
        { type_id: '1', type_name: '足球' },
        { type_id: '2', type_name: '篮球' }
    ];
    return JSON.stringify({ class: classes, list: [] });
}

async function category(tid, pg, filter, extend) {
    let page = parseInt(pg) || 1;
    let navId = tid === '-1' ? '' : tid;
    let url = `${API_BASE}/room/page?roomType=&navId=${navId}&roomId=&word=&page=${page}&pageSize=30&channelId=3&platform=1`;
    let videos = [];
    try {
        let json = await requestJson(url);
        let data = json?.data;
        if (data && data.list && Array.isArray(data.list)) {
            for (let item of data.list) {
                let roomId = item.roomId || '';
                let title = item.title || '';
                let cover = item.cover || '';
                let navName = item.navName || '';
                videos.push({
                    vod_id: roomId,
                    vod_name: title,
                    vod_pic: cover,
                    vod_remarks: navName
                });
            }
        }
    } catch (e) {}
    let pagecount = videos.length < 30 ? page : page + 1;
    return JSON.stringify({
        page: page,
        pagecount: pagecount,
        limit: 30,
        total: videos.length,
        list: videos
    });
}

async function detail(id) {
    let roomId = (Array.isArray(id) ? id[0] : id).toString();
    let vod = {
        vod_id: roomId,
        vod_name: '',
        vod_pic: '',
        vod_content: '',
        type_name: '',
        vod_play_from: '球通',
        vod_play_url: ''
    };
    try {
        let url = `${API_BASE}/room/info?roomId=${roomId}&channelId=3&platform=1`;
        let json = await requestJson(url);
        let data = json?.data;
        if (data) {
            vod.vod_name = data.title || '';
            vod.vod_pic = data.cover || '';
            vod.vod_content = data.description || '';
            vod.type_name = data.nickName || '';
            let playUrls = [];
            if (data.pushUrl && data.pushUrl !== 'null') {
                playUrls.push(`flv$${data.pushUrl}`);
            }
            if (data.pullUrl && data.pullUrl !== 'null') {
                playUrls.push(`m3u8$${data.pullUrl}`);
            }
            vod.vod_play_url = playUrls.join('#');
        }
    } catch (e) {
        return JSON.stringify({ code: -1, msg: '数据获取异常: ' + e.message });
    }
    if (!vod.vod_play_url) {
        return JSON.stringify({ code: -1, msg: '暂无播放数据' });
    }
    return JSON.stringify({ list: [vod], code: 1, msg: '' });
}

async function play(flag, id, flags) {
    // id 即为传入的播放地址（如 flv$url 或 m3u8$url 中的 url 部分）
    return JSON.stringify({ parse: 0, url: id });
}

async function search(wd, quick, pg) {
    return JSON.stringify({ list: [] });
}

export function __jsEvalReturn() {
    return { init: () => {}, home, category, detail, play, search };
}