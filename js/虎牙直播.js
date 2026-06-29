// 本资源来源于互联网公开渠道，仅可用于个人学习爬虫技术，严禁将其用于任何商业用途。
var rule = {
    title: '虎牙直播',//多弗朗明哥改
    host: 'https://www.huya.com',
    url: '/cache.php?m=LiveList&do=getLiveListByPage&gameId=fyclass&tagAll=0&page=fypage',
    homeUrl: '/cache.php?m=LiveList&do=getLiveListByPage&gameId=2168&tagAll=0&page=1',
    detailUrl: 'https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=fyid',
    searchUrl: 'https://search.cdn.huya.com/?m=Search&do=getSearchContent&q=**&uid=0&v=4&typ=-5&livestate=0&rows=40&start=0',
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
    },
    timeout: 5000,
    limit: 20,
    play_parse: true,

    class_name: '一起看&原创&网游竞技&无畏契约&CS2&英雄联盟&魔兽世界&王者荣耀&王者荣耀世界&DOTA1&DOTA2&传奇&剑灵&穿越火线&魔兽争霸3&英雄之刃&问道&军事游戏&综合射击游戏&起凡&第五人格&三角洲行动&和平精英&综合手游&英雄联盟手游&问道手游&CF手游&永劫无间手游&原神&动作手游&手游休闲&MMORPG&一起玩&单机热游&天天吃鸡&永劫无间&恐怖游戏&我的世界&互动点播&怀旧游戏&主机游戏&户外&二次元&吃喝玩乐&互动组队&交友&体育&娱乐天地&旅游&颜值&星秀',
    class_url: '2135&6861&100023&5937&862&1&wow&2336&71519&6&7&983&897&4&4615&1830&107&100133&100141&1612&3115&9449&3203&100029&6203&2477&2413&7579&5489&100197&100004&100273&6613&100002&2793&6219&9453&1732&5907&100125&100032&2165&2633&100044&5367&4079&2356&100022&6791&2168&1663',

    推荐: $js.toString(() => {
        let url = rule.homeUrl;
        let html = fetch(url);
        let data = JSON.parse(html);
        let list = [];
        if (data && data.data && data.data.datas) {
            for (let item of data.data.datas) {
                list.push({
                    vod_id: item.profileRoom,
                    vod_name: item.roomName || item.nick || '虎牙直播',
                    vod_pic: item.screenshot,
                    vod_remarks: (item.totalCount / 10000).toFixed(1) + '万'
                });
            }
        }
        VODS = list;
    }),

    一级: $js.toString(() => {
        let cateId = input;
        let page = MY_PAGE || 1;
        let url = 'https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=' + cateId + '&tagAll=0&page=' + page;
        let html = fetch(url);
        let data = JSON.parse(html);
        let list = [];
        if (data && data.data && data.data.datas) {
            for (let item of data.data.datas) {
                list.push({
                    vod_id: item.profileRoom,
                    vod_name: item.roomName || item.nick || '虎牙直播',
                    vod_pic: item.screenshot,
                    vod_remarks: (item.totalCount / 10000).toFixed(1) + '万'
                });
            }
        }
        VODS = list;
    }),

    二级: $js.toString(() => {
    function md5(str) {
        return CryptoJS.MD5(str).toString();
    }
    let roomId = input;
    if (roomId) {
        let match = roomId.match(/\d+/);
        if (match) roomId = match[0];
    }
    let vod = {
        vod_id: roomId,
        vod_name: '虎牙直播',
        vod_pic: '',
        vod_actor: '房间号:' + roomId,
        vod_play_from: '虎牙直播',
        vod_play_url: ''
    };
    try {
        let url = 'https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=' + roomId;
        let html = fetch(url);
        let data = JSON.parse(html);
        if (data && data.data) {
            let info = data.data;
            let nick = info.profileInfo?.nick || info.liveData?.nick || '虎牙主播';
            let roomName = info.liveData?.introduction || nick;
            let totalCount = info.liveData?.totalCount || 0;
            let isLive = info.liveStatus === 'ON';
            vod.vod_name = roomName;
            vod.vod_pic = info.liveData?.screenshot || info.profileInfo?.avatar180 || '';
            vod.vod_actor = nick + ' (房间号:' + roomId + ')';
            vod.vod_content = '主播：' + nick + '\n热度：' + (totalCount / 10000).toFixed(1) + '万\n状态：' + (isLive ? '直播中' : '未开播');
            if (isLive && info.stream?.baseSteamInfoList) {
                let streamList = info.stream.baseSteamInfoList;
                let playUrls = [];
                let baseUid = info.profileInfo?.uid || (12340000 + Math.floor(Math.random() * 1000));
                let index = 0;
                for (let stream of streamList) {
                    let cdnType = stream.sCdnType;
                    let sStreamName = stream.sStreamName;
                    let srcUrl = stream.sFlvUrl;
                    if (srcUrl && sStreamName) {
                        let hostUrl = srcUrl.replace(/^https?:\/\//, '').split('/')[0];
                        let uniqueUid = String(parseInt(baseUid) + index + Math.floor(Math.random() * 100));
                        let seqid = String(parseInt(baseUid) + Date.now() + index + Math.floor(Math.random() * 1000));
                        let ctype = 'huya_adr';
                        let t = '102';
                        let wsTime = Math.floor(Date.now() / 1000 + 21600).toString(16);
                        let ss = md5(seqid + '|' + ctype + '|' + t);
                        let wsSecret = md5('DWq8BcJ3h6DJt6TY_' + uniqueUid + '_' + sStreamName + '_' + ss + '_' + wsTime);
                        let flvUrl = 'https://' + hostUrl + '/src/' + sStreamName + '.flv?wsSecret=' + wsSecret + '&wsTime=' + wsTime + '&ctype=' + ctype + '&seqid=' + seqid + '&uid=' + uniqueUid + '&fs=bgct&ver=1&t=' + t + '&ratio=0';
                        if (!['TX'].includes(cdnType)) {
                            playUrls.push(cdnType + '$' + flvUrl);
                        }
                    }
                    index++;
                }
                if (playUrls.length > 0) {
                    vod.vod_play_url = playUrls.join('#');
                } else {
                    vod.vod_play_url = '无信号$0';
                }
            } else {
                vod.vod_play_url = '未开播$0';
            }
        }
    } catch (e) {
        vod.vod_play_url = '未开播$0';
    }
    VOD = vod;
}),

    搜索: 'json:response.3.docs;game_roomName;game_screenshot;game_nick;room_id',
}