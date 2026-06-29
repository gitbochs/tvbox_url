import { _ } from 'assets://js/lib/cat.js';

const API_BASE = 'https://01cs01.fusk39cd.com/api/web/live_lists';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function request(url) {
    let res = await req(url, {
        headers: HEADERS,
        timeout: 10000
    });
    return typeof res === 'string' ? res : (res.content || '');
}

async function home(filter) {
    let classes = [
        { type_id: '1', type_name: '全部' },
        { type_id: '3', type_name: '篮球' }
    ];
    return JSON.stringify({ class: classes, list: [] });
}

async function category(tid, pg, filter, extend) {
    let page = parseInt(pg) || 1;
    let videos = [];
    try {
        let url = `${API_BASE}/${tid}`;
        let data = await request(url);
        let json = JSON.parse(data);
        if (json.code !== 200) throw new Error('API error');
        let items = json?.data?.data || [];
        for (let item of items) {
            if (!item.tournament_id) continue;
            let vod_id = `${item.type}|${item.tournament_id}|${item.member_id}`;
            let vod_name = `${item.home_team_zh} VS ${item.away_team_zh}`;
            videos.push({
                vod_id: vod_id,
                vod_name: vod_name,
                vod_pic: item.cover || '',
                vod_remarks: item.league_name_zh || ''
            });
        }
    } catch (e) {}
    let pagecount = videos.length < 20 ? page : page + 1;
    return JSON.stringify({
        page: page,
        pagecount: pagecount,
        limit: 20,
        total: videos.length,
        list: videos
    });
}

async function detail(id) {
    let vid = (Array.isArray(id) ? id[0] : id).toString();
    try {
        let parts = vid.split('|');
        if (parts.length !== 3) throw new Error('Invalid vod_id');
        let type = parts[0];
        let tournamentId = parts[1];
        let memberId = parts[2];
        let url = `${API_BASE}/${type}/detail/${tournamentId}?member_id=${memberId}`;
        let data = await request(url);
        let json = JSON.parse(data);
        if (json.code !== 200) throw new Error('API error');
        let detailObj = json.data.detail || {};
        let moreArr = json.data.more || [];

        let homeTeam = detailObj.home_team_zh || '';
        let awayTeam = detailObj.away_team_zh || '';
        let vod_name = `${homeTeam} VS ${awayTeam}`;
        let vod_content = detailObj.room_notice || '';

        let playFromList = [];
        let playUrlList = [];
        for (let i = 0; i < moreArr.length; i++) {
            let source = moreArr[i];
            let username = source.username || `线路${i+1}`;
            let url1 = source.screen_url || '';
            let url2 = source.screen_url_m3u8 || '';
            playFromList.push(username);
            playUrlList.push(`线路一$${url1}#线路二$${url2}`);
        }
        let vod_play_from = playFromList.join('$$$');
        let vod_play_url = playUrlList.join('$$$');

        let vod = {
            vod_id: vid,
            vod_name: vod_name,
            vod_pic: '',
            vod_play_from: vod_play_from,
            vod_play_url: vod_play_url,
            vod_actor: '',
            vod_director: '',
            vod_content: vod_content,
            vod_year: '',
            vod_area: '',
            vod_remarks: ''
        };
        return JSON.stringify({ list: [vod] });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    // id 即为播放地址（screen_url 或 screen_url_m3u8）
    return JSON.stringify({ parse: 0, url: id });
}

async function search(wd, quick, pg) {
    return JSON.stringify({ list: [] });
}

export function __jsEvalReturn() {
    return { init: () => {}, home, category, detail, play, search };
}