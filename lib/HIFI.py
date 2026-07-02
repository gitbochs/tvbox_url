# coding=utf-8
#!/usr/bin/python

"""

作者 丢丢喵 🚓 内容均从互联网收集而来 仅供交流学习使用 版权归原创者所有 如侵犯了您的权益 请通知作者 将及时删除侵权内容
                    ====================Diudiumiao====================

"""

from Crypto.Util.Padding import unpad
from Crypto.Util.Padding import pad
from urllib.parse import unquote
from Crypto.Cipher import ARC4
from urllib.parse import quote
from base.spider import Spider
from Crypto.Cipher import AES
from datetime import datetime
from bs4 import BeautifulSoup
from base64 import b64decode
import urllib.request
import urllib.parse
import binascii
import requests
import base64
import hmac
import json
import time
import sys
import re
import os

sys.path.append('..')

xurl = "http://if2.hifiok.com"
xurl1 = "http://if2.zhenxian.fm"

headerx = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36',
    'Referer': 'http://if2.hifiok.com/',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Connection': 'keep-alive'
}

class Spider(Spider):
    global xurl
    global xurl1
    global headerx

    def getName(self):
        return "HIFI音乐"

    def init(self, extend):
        pass

    def isVideoFormat(self, url):
        pass

    def manualVideoCheck(self):
        pass

    def extract_middle_text(self, text, start_str, end_str, pl, start_index1: str = '', end_index2: str = ''):
        if pl == 3:
            plx = []
            while True:
                start_index = text.find(start_str)
                if start_index == -1:
                    break
                end_index = text.find(end_str, start_index + len(start_str))
                if end_index == -1:
                    break
                middle_text = text[start_index + len(start_str):end_index]
                plx.append(middle_text)
                text = text.replace(start_str + middle_text + end_str, '')
            if len(plx) > 0:
                purl = ''
                for i in range(len(plx)):
                    matches = re.findall(start_index1, plx[i])
                    output = ""
                    for match in matches:
                        match3 = re.search(r'(?:^|[^0-9])(\d+)(?:[^0-9]|$)', match[1])
                        if match3:
                            number = match3.group(1)
                        else:
                            number = 0
                        if 'http' not in match[0]:
                            output += f"#{match[1]}${number}{xurl}{match[0]}"
                        else:
                            output += f"#{match[1]}${number}{match[0]}"
                    output = output[1:]
                    purl = purl + output + "$$$"
                purl = purl[:-3]
                return purl
            else:
                return ""
        else:
            start_index = text.find(start_str)
            if start_index == -1:
                return ""
            end_index = text.find(end_str, start_index + len(start_str))
            if end_index == -1:
                return ""

        if pl == 0:
            middle_text = text[start_index + len(start_str):end_index]
            return middle_text.replace("\\", "")

        if pl == 1:
            middle_text = text[start_index + len(start_str):end_index]
            matches = re.findall(start_index1, middle_text)
            if matches:
                jg = ' '.join(matches)
                return jg

        if pl == 2:
            middle_text = text[start_index + len(start_str):end_index]
            matches = re.findall(start_index1, middle_text)
            if matches:
                new_list = [f'{item}' for item in matches]
                jg = '$$$'.join(new_list)
                return jg

    def decrypt(self, timestamp):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        protocolver = "zx11"
        sliderid = "4"
        terminaltype = "5"
        data = f"apikey{apikey}protocolver{protocolver}sliderid{sliderid}terminaltye{terminaltype}timestamp{timestamp}"
        signature = hmac.new(secret_key.encode('utf-8'), data.encode('utf-8'), 'sha1').digest()
        base64_result = base64.b64encode(signature).decode('utf-8')
        return base64_result

    def decrypt_sha1(self, timestamp, value):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        id_value = value
        maxitems = "96"
        protocolver = "zx11"
        startitem = "0"
        type_value = "1"
        data = f"apikey{apikey}id{id_value}maxitems{maxitems}protocolver{protocolver}startitem{startitem}timestamp{timestamp}type{type_value}"
        signature = hmac.new(secret_key.encode('utf-8'), data.encode('utf-8'), 'sha1').digest()
        base64_result = base64.b64encode(signature).decode('utf-8')
        return base64_result

    def decrypt_sha2(self, timestamp):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        protocolver = "zx11"
        data = f"apikey{apikey}protocolver{protocolver}timestamp{timestamp}"
        signature = hmac.new(
            secret_key.encode('utf-8'),
            data.encode('utf-8'),
            'sha1'
        ).digest()
        base64_signature = base64.b64encode(signature).decode('utf-8')
        return base64_signature

    def decrypt_sha3(self, timestamp, value):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        id_value = value
        protocolver = "zx11"
        data = f"apikey{apikey}id{id_value}protocolver{protocolver}timestamp{timestamp}"
        signature = hmac.new(
            secret_key.encode('utf-8'),
            data.encode('utf-8'),
            'sha1'
        ).digest()
        base64_signature = base64.b64encode(signature).decode('utf-8')
        return base64_signature

    def decrypt_sha4(self, timestamp):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        protocolver = "zx11"
        terminaltype = "0"
        data = f"apikey{apikey}protocolver{protocolver}terminaltype{terminaltype}timestamp{timestamp}"
        signature = hmac.new(
            secret_key.encode('utf-8'),
            data.encode('utf-8'),
            'sha1'
        ).digest()
        base64_signature = base64.b64encode(signature).decode('utf-8')
        return base64_signature

    def decrypt_sha5(self, timestamp):
        secret_key = "6f7ab440b39eba4ac87bfa5576eac999"
        apikey = "0f607264-fc63-38a9-ab9e-13c65db7cd3c"
        protocolver = "zx11"
        maxitems = "96"
        startitem = "0"
        data = f"apikey{apikey}maxitems{maxitems}protocolver{protocolver}startitem{startitem}timestamp{timestamp}"
        signature = hmac.new(
            secret_key.encode('utf-8'),
            data.encode('utf-8'),
            'sha1'
        ).digest()
        base64_signature = base64.b64encode(signature).decode('utf-8')
        return base64_signature

    def homeContent(self, filter):
        result = {"class": []}
        try:
            current_timestamp = int(datetime.now().timestamp())
            signature = self.decrypt_sha2(current_timestamp)

            url = f'{xurl}/interface2/ws/tv/index?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&protocolver=zx/1.1&timestamp={current_timestamp}&signature={signature}'
            detail = requests.get(url=url, headers=headerx, timeout=10)
            detail.encoding = "utf-8"
            
            if detail.status_code == 200:
                data = detail.json()
                menus = data.get('menus', [])
                
                skip_patterns = [r'\b5\.1环绕声\b', r'\b厂牌音乐\b']

                for vod in menus:
                    name = vod.get('menuname', '')
                    should_skip = any(re.fullmatch(pattern, name) for pattern in skip_patterns)
                    if should_skip:
                        continue

                    id = vod.get('menuid', '')
                    if id and name:
                        result["class"].append({"type_id": id, "type_name": name})
        except Exception as e:
            print(f"homeContent error: {e}")
            
        return result

    def homeVideoContent(self):
        videos = []
        try:
            current_timestamp = int(datetime.now().timestamp())
            signature = self.decrypt(current_timestamp)

            url = f'{xurl}/interface2/ws/content/slider?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&protocolver=zx/1.1&sliderid=4&terminaltye=5&timestamp={current_timestamp}&signature={signature}'
            detail = requests.get(url=url, headers=headerx, timeout=10)
            detail.encoding = "utf-8"
            
            if detail.status_code == 200:
                data = detail.json()
                contents = data.get('content', [])

                for vod in contents:
                    name = vod.get('albumName', '')
                    if not name:
                        continue
                        
                    content_id = vod.get('contentId', '')
                    if content_id:
                        vid = str(int(content_id)) + "@456"
                    else:
                        continue
                        
                    pic = vod.get('imgUrl', '')
                    remark = vod.get('artistName', '未知')

                    video = {
                        "vod_id": vid,
                        "vod_name": name,
                        "vod_pic": pic,
                        "vod_remarks": remark
                    }
                    videos.append(video)
        except Exception as e:
            print(f"homeVideoContent error: {e}")

        result = {'list': videos}
        return result

    def categoryContent(self, cid, pg, filter, ext):
        result = {}
        videos = []
        try:
            current_timestamp = int(datetime.now().timestamp())
            
            if '93' not in cid:
                signature = self.decrypt_sha1(current_timestamp, cid)
                url = f'{xurl}/interface2/ws/content/album/list?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&id={cid}&maxitems=96&protocolver=zx/1.1&startitem=0&timestamp={current_timestamp}&type=1&signature={signature}'
                detail = requests.get(url=url, headers=headerx, timeout=10)
                detail.encoding = "utf-8"
                
                if detail.status_code == 200:
                    data = detail.json()
                    albums = data.get('album', [])

                    for vod in albums:
                        name = vod.get('cn_name', '')
                        if not name:
                            continue
                            
                        album_id = vod.get('id')
                        if album_id is None:
                            continue
                            
                        vid = str(int(album_id)) + "@456"
                        pic = vod.get('smallimg', '')
                        remark = vod.get('artist', '未知')

                        video = {
                            "vod_id": vid,
                            "vod_name": name,
                            "vod_pic": pic,
                            "vod_remarks": remark
                        }
                        videos.append(video)
            else:
                signature = self.decrypt_sha5(current_timestamp)
                url = f'{xurl}/interface2/ws/content/pack/list?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&maxitems=96&protocolver=zx/1.1&startitem=0&timestamp={current_timestamp}&signature={signature}'
                detail = requests.get(url=url, headers=headerx, timeout=10)
                detail.encoding = "utf-8"
                
                if detail.status_code == 200:
                    data = detail.json()
                    packs = data.get('packs', [])

                    for vod in packs:
                        name = vod.get('name', '')
                        if not name:
                            continue
                            
                        pack_id = vod.get('id')
                        if pack_id is None:
                            continue
                            
                        vid = str(int(pack_id)) + "@789"
                        pic = vod.get('smallimg', '')
                        remark = "请您欣赏"

                        video = {
                            "vod_id": vid,
                            "vod_name": name,
                            "vod_pic": pic,
                            "vod_remarks": remark
                        }
                        videos.append(video)
        except Exception as e:
            print(f"categoryContent error: {e}")

        result = {
            'list': videos,
            'page': pg,
            'pagecount': 9999,
            'limit': 90,
            'total': 999999
        }
        return result

    def detailContent(self, ids):
        did = ids[0] if ids else ''
        result = {}
        videos = []
        
        if not did or '@' not in did:
            return {'list': []}
            
        try:
            fenge = did.split("@")
            if len(fenge) != 2:
                return {'list': []}
                
            album_id = fenge[0]
            type_flag = fenge[1]

            current_timestamp = int(datetime.now().timestamp())
            signature = self.decrypt_sha3(current_timestamp, album_id)
            
            xianlu = ''
            bofang = ''

            if '789' not in type_flag:
                # 普通专辑
                url = f'{xurl}/interface2/ws/content/album/detail?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&id={album_id}&protocolver=zx/1.1&timestamp={current_timestamp}&signature={signature}'
                detail = requests.get(url=url, headers=headerx, timeout=10)
                detail.encoding = "utf-8"
                
                if detail.status_code != 200:
                    raise Exception(f"HTTP {detail.status_code}")
                    
                data = detail.json()
                
                content = '为您介绍剧情📢' + data.get('introduction', '未知')
                director = data.get('companyname', '未知')
                actor = data.get('artists', '未知')
                bitDepth = data.get('bitDepth', '未知')
                musiccount = data.get('musiccount', 0)
                remarks = f'共计{musiccount}首 {bitDepth}比特'
                year = data.get('publishtime', '未知')
                area = data.get('language', '未知')

                disks = data.get('disks', [])
                if disks and len(disks) > 0:
                    musics = disks[0].get('musics', [])
                    for sou in musics:
                        music_id = sou.get('id')
                        name = sou.get('name', '').replace('#', '').replace('$', '')
                        if music_id and name:
                            bofang += f"{name}${music_id}#"
                    
                if bofang:
                    bofang = bofang[:-1]
                xianlu = 'HIFI音乐'
                
            else:
                # Pack 类型
                url = f'{xurl}/interface2/ws/content/pack/detail?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&id={album_id}&protocolver=zx/1.1&timestamp={current_timestamp}&signature={signature}'
                detail = requests.get(url=url, headers=headerx, timeout=10)
                detail.encoding = "utf-8"
                
                if detail.status_code != 200:
                    raise Exception(f"HTTP {detail.status_code}")
                    
                data = detail.json()
                
                content = '为您介绍剧情📢' + data.get('introduction', '未知')
                director = data.get('companyname', '未知')
                actor = data.get('artists', '未知')
                bitDepth = data.get('bitDepth', '未知')
                musiccount = data.get('musiccount', 0)
                remarks = f'共计{musiccount}首 {bitDepth}比特'
                year = data.get('publishtime', '未知')
                area = data.get('language', '未知')

                music_list = data.get('musicListItems', [])
                for sou in music_list:
                    testurl = sou.get('testurl', '')
                    name = sou.get('name', '').replace('#', '').replace('$', '')
                    if testurl and name:
                        bofang += f"{name}${testurl}#"
                        
                if bofang:
                    bofang = bofang[:-1]
                xianlu = '音乐包'

            videos.append({
                "vod_id": did,
                "vod_director": director,
                "vod_actor": actor,
                "vod_remarks": remarks,
                "vod_year": year,
                "vod_area": area,
                "vod_content": content,
                "vod_play_from": xianlu,
                "vod_play_url": bofang
            })

        except Exception as e:
            print(f"detailContent error: {e}")

        result['list'] = videos
        return result

    def playerContent(self, flag, id, vipFlags):
        try:
            # 判断是否为URL（包含 http 或 https）
            if not id.startswith('http'):
                # 分支1：普通音乐（id为数字ID）
                current_timestamp = int(datetime.now().timestamp())
                signature = self.decrypt_sha3(current_timestamp, id)

                # 第一步：获取音乐详情（获取跳转地址）
                url1 = f'{xurl1}/interface2/ws/content/music/detail?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&id={id}&protocolver=zx/1.1&timestamp={current_timestamp}&signature={signature}'
                response = requests.get(url1, headers=headerx, allow_redirects=False, timeout=10)
                
                # 检查是否为重定向响应
                if response.status_code not in [301, 302, 303, 307, 308]:
                    raise Exception(f"获取音乐详情失败，状态码: {response.status_code}")
                
                redirect_url = response.headers.get('Location')
                if not redirect_url:
                    raise Exception("未获取到重定向地址")
                
                # 第二步：获取真实详情（JSON）
                detail = requests.get(url=redirect_url, headers=headerx, timeout=10)
                detail.encoding = "utf-8"
                
                if detail.status_code != 200:
                    raise Exception(f"获取详情失败: {detail.status_code}")
                
                json_data = detail.json()
                listenurl = json_data.get('listenurl')
                
                if not listenurl:
                    raise Exception("未获取到 listenurl")
                
                # 第三步：获取最终播放地址（重定向后的真实音频URL）
                signature = self.decrypt_sha4(current_timestamp)
                url2 = f'{listenurl}?apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&protocolver=zx/1.1&terminaltype=0&timestamp={current_timestamp}&signature={signature}'
                response = requests.get(url2, headers=headerx, allow_redirects=False, timeout=10)
                
                if response.status_code not in [301, 302, 303, 307, 308]:
                    raise Exception(f"获取播放地址失败，状态码: {response.status_code}")
                
                final_url = response.headers.get('Location')
                if not final_url:
                    raise Exception("未获取到最终播放地址")
                    
                url = final_url
                
            else:
                # 分支2：Pack音乐（id为完整URL，如 http://xxx/testurl?xxx）
                # 修复：统一使用秒级时间戳，与其他方法保持一致
                current_timestamp = int(datetime.now().timestamp())
                signature = self.decrypt_sha4(current_timestamp)
                
                # 修复：正确处理已有查询参数的URL
                separator = '&' if '?' in id else '?'
                url1 = f'{id}{separator}apikey=0f607264-fc63-38a9-ab9e-13c65db7cd3c&protocolver=zx/1.1&terminaltype=0&timestamp={current_timestamp}&signature={signature}'
                
                response = requests.get(url1, headers=headerx, allow_redirects=False, timeout=10)
                
                if response.status_code not in [301, 302, 303, 307, 308]:
                    raise Exception(f"获取Pack播放地址失败，状态码: {response.status_code}")
                
                url = response.headers.get('Location')
                if not url:
                    raise Exception("未获取到Pack播放地址")

            result = {
                "parse": 0,
                "playUrl": '',
                "url": url,
                "header": headerx
            }
            return result
            
        except Exception as e:
            print(f"playerContent error: {e}")
            # 返回错误信息便于调试
            return {
                "parse": 0,
                "playUrl": '',
                "url": id if id.startswith('http') else f"http://localhost/error.mp3?msg={str(e)}",
                "header": {}
            }

    def searchContentPage(self, key, quick, pg):
        pass

    def searchContent(self, key, quick, pg="1"):
        return self.searchContentPage(key, quick, '1')

    def localProxy(self, params):
        if params['type'] == "m3u8":
            return self.proxyM3u8(params)
        elif params['type'] == "media":
            return self.proxyMedia(params)
        elif params['type'] == "ts":
            return self.proxyTs(params)
        return None
