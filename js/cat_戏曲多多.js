import { _ } from 'assets://js/lib/cat.js';

const API_BASE = 'https://fly.daoran.tv/API_ROP';
const PHOTO_BASE = 'https://ottphoto.daoran.tv/HD/';

const headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': 'okhttp/3.9.1',
    'md5': 'SkvyrWqK9QHTdCT12Rhxunjx+WwMTe9y4KwgeASFDhbYabRSPskR0Q=='
};

async function postJson(url, body) {
    try {
        let res = await req(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            timeout: 10000
        });
        return typeof res === 'string' ? res : (res.content || '');
    } catch (e) {
        return '';
    }
}

async function home(filter) {
    let classes = [];
    try {
        let body = {
            leastNum: '0',
            memberId: 'yszyz',
            project: 'lyhxcx',
            userId: 'yszyz'
        };
        let data = await postJson(`${API_BASE}/page/setinf/get`, body);
        let json = JSON.parse(data);
        let sects = json.sects || [];
        for (let sect of sects) {
            classes.push({
                type_id: sect.code,
                type_name: sect.name
            });
        }
    } catch (e) {}
    return JSON.stringify({ class: classes, list: [] });
}

async function category(tid, pg, filter, extend) {
    let page = parseInt(pg) || 1;
    let videos = [];
    try {
        let body = {
            cur: page.toString(),
            free: '0',
            item: 'o5',
            pageSize: '20',
            sect: [tid]
        };
        let data = await postJson(`${API_BASE}/search/album/list`, body);
        let json = JSON.parse(data);
        let dataList = json?.pb?.dataList || [];
        for (let item of dataList) {
            let img = item.img ? PHOTO_BASE + item.img : '';
            videos.push({
                vod_id: item.code || '',
                vod_name: item.name || '',
                vod_pic: img,
                vod_remarks: item.publishTime || ''
            });
        }
    } catch (e) {}
    let pagecount = videos.length < 20 ? page : page + 1;
    return JSON.stringify({
        page: page,
        pagecount: pagecount,
        limit: 20,
        total: 999,
        list: videos
    });
}

async function detail(id) {
    let vid = (Array.isArray(id) ? id[0] : id).toString();
    let vod = {
        vod_id: vid
    };
    try {
        let body = {
            albumCode: vid,
            cur: '1',
            project: 'lyhxcx',
            pageSize: '2147483647',
            selectFlag: '0',
            userId: 'yszyz'
        };
        let data = await postJson(`${API_BASE}/album/res/list`, body);
        let json = JSON.parse(data);
        let album = json.album || {};
        vod.vod_name = album.name || '';
        vod.vod_pic = album.img ? PHOTO_BASE + album.img : '';
        vod.vod_remarks = album.sect || '';
        vod.vod_content = album.des || '';
        vod.vod_actor = album.artistName || '';
        vod.vod_director = album.vod_director || '';
        vod.vod_year = album.publishTime || '';
        let playList = [];
        let dataList = json?.pb?.dataList || [];
        for (let ep of dataList) {
            let name = ep.name || '';
            let code = ep.code || '';
            if (name && code) playList.push(`${name}$${code}`);
        }
        if (playList.length > 0) {
            vod.vod_play_from = '在线播放';
            vod.vod_play_url = playList.join('#');
        } else {
            vod.vod_play_from = '';
            vod.vod_play_url = '';
        }
    } catch (e) {}
    return JSON.stringify({ list: [vod] });
}

async function play(flag, id, flags) {
    let resCode = id;  // 播放时传入的 code
    try {
        let body = {
            item: 'y9',
            nodeCode: '001000',
            project: 'lyhxcx',
            px: '2',
            resCode: resCode,
            userId: '92315ec6e58a45ba7f47fd143b3d7956'
        };
        let data = await postJson(`${API_BASE}/play/get/playurl`, body);
        let json = JSON.parse(data);
        let playUrl = json?.playres?.playurl || '';
        if (playUrl) {
            return JSON.stringify({ parse: 0, url: playUrl });
        }
    } catch (e) {}
    return JSON.stringify({ parse: 1, url: '' });
}

async function search(wd, quick, pg) {
    return JSON.stringify({ list: [] });
}

export function __jsEvalReturn() {
    return { init: () => {}, home, category, detail, play, search };
}