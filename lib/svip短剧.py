"""
@header({
  searchable: 1,
  filterable: 0,
  quickSearch: 1,
  title: 'SVIP短剧',
  lang: 'hipy',
})
"""

# coding=utf-8
import sys
import json
import re
import urllib.parse
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
sys.path.append('..')
from base.spider import Spider

class Spider(Spider):
    def getName(self):
        return "SVIP短剧"

    def init(self, extend=""):
        self.host = "https://m.svipys.cn"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
            "Referer": f"{self.host}/",
            "Origin": self.host,
            "Accept": "application/json, text/plain, */*"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def isVideoFormat(self, url): return True
    def manualVideoCheck(self): return False
    def destroy(self): pass

    def _safe_text(self, text):
        if not text: return ""
        return re.sub(r'\s+', ' ', str(text)).strip()

    def _req_get(self, path, params=None):
        try:
            r = self.session.get(f"{self.host}{path}", params=params, timeout=10, verify=False)
            return r.json()
        except:
            return {}

    def _req_post(self, path, json_data=None):
        try:
            r = self.session.post(f"{self.host}{path}", json=json_data, timeout=10, verify=False)
            return r.json()
        except:
            return {}

    def _pick_data(self, res):
        if isinstance(res, dict):
            inner_data = res.get("data", res)
            if isinstance(inner_data, dict) and "data" in inner_data:
                return inner_data["data"]
            return inner_data
        return {}

    def _flatten_home_list(self, data):
        rows = data.get("list", []) if isinstance(data, dict) else []
        if not isinstance(rows, list):
            rows = []

        for x in rows:
            if isinstance(x, dict) and isinstance(x.get("list"), list):
                return {
                    "list": x["list"],
                    "page": x.get("page", 1),
                    "totalPage": x.get("totalPage", 1),
                    "total": x.get("total", 0),
                    "size": x.get("size", 20)
                }
        return {
            "list": rows,
            "page": data.get("page", 1) if isinstance(data, dict) else 1,
            "totalPage": data.get("totalPage", 1) if isinstance(data, dict) else 1,
            "total": data.get("total", 0) if isinstance(data, dict) else 0,
            "size": data.get("size", 20) if isinstance(data, dict) else 20
        }

    def _to_vod(self, item):
        vid = str(item.get("shortId") or item.get("bookId") or item.get("id") or item.get("seriesShortId") or "")
        name = item.get("title") or item.get("bookName") or item.get("book_name") or ""
        pic = item.get("coverUrl") or item.get("cover") or item.get("pic") or ""
        remark = str(item.get("upStatus") or item.get("lastChapterTitle") or item.get("updateStatus") or item.get("hot") or item.get("score") or "")
        actor = str(item.get("actor") or item.get("role") or item.get("starring") or "")
        director = str(item.get("author") or "")

        return {
            "vod_id": vid,
            "vod_name": self._safe_text(name),
            "vod_pic": pic,
            "vod_remarks": self._safe_text(remark),
            "vod_actor": self._safe_text(actor),
            "vod_director": self._safe_text(director)
        }

    def homeContent(self, filter):
        res = self._req_get('/my/hg/new', {"page": 1})
        data = self._pick_data(res)
        block = self._flatten_home_list(data)
        
        videos = []
        for item in block.get("list", []):
            vod = self._to_vod(item)
            if vod["vod_id"] and vod["vod_name"]:
                videos.append(vod)
                
        return {
            "class": [{"type_id": "1", "type_name": "短剧"}],
            "filters": {},
            "list": videos,
            "page": 1,
            "pagecount": block.get("totalPage", 1),
            "limit": block.get("size", 20),
            "total": block.get("total", len(videos))
        }

    def categoryContent(self, tid, pg, filter, extend):
        params = {"page": int(pg)}
        if tid and tid != "1":
            params["channeid"] = tid
            
        res = self._req_get('/my/hg/new', params)
        data = self._pick_data(res)
        block = self._flatten_home_list(data)
        
        videos = []
        for item in block.get("list", []):
            vod = self._to_vod(item)
            if vod["vod_id"] and vod["vod_name"]:
                videos.append(vod)
                
        pagecount = block.get("totalPage")
        if not pagecount:
            pagecount = int(pg) + 1 if len(videos) >= 20 else int(pg)
            
        return {
            "list": videos,
            "page": int(pg),
            "pagecount": pagecount,
            "limit": block.get("size", 20),
            "total": block.get("total", 0)
        }

    def searchContent(self, key, quick, pg="1"):
        size = 20 
        res = self._req_get('/my1/search', {"key": key, "page": int(pg), "size": size})
        data = self._pick_data(res)
        
        videos = []
        for item in data.get("list", []):
            vod = self._to_vod(item)
            if vod["vod_id"] and vod["vod_name"]:
                videos.append(vod)
                
        pagecount = int(pg) + 1 if data.get("hasMore") else int(pg)
        
        return {
            "list": videos,
            "page": int(pg),
            "pagecount": pagecount,
            "limit": size,
            "total": data.get("total", 0)
        }

    def detailContent(self, ids):
        sid = str(ids[0]).split(',')[0].strip()
        if not sid:
            return {"list": []}
            
        res = self._req_get(f'/my1/book/{urllib.parse.quote(sid)}')
        data = self._pick_data(res)
        
        info = data.get("seriesInfo") or data.get("info") or {}
        eps = data.get("list", [])
        
        name = info.get("title") or info.get("bookName") or sid
        pic = info.get("coverUrl", "")
        remark = str(info.get("updateStatus") or info.get("lastChapterTitle") or "")
        
        # 处理分类，如果是数组拼接成字符串
        tags = info.get("tags", [])
        category = info.get("category")
        type_name = str(category if category else ",".join(tags) if isinstance(tags, list) else tags)
        
        actor = str(info.get("actor") or info.get("starring") or "")
        director = str(info.get("author") or "")
        desc = str(info.get("description") or "")
        
        play_list = []
        for idx, ep in enumerate(eps):
            title = str(ep.get("title") or ep.get("episodeTitle") or f"第{ep.get('episodeNumber', idx + 1)}集")
            accessKey = str(ep.get("episodeAccessKey") or ep.get("shortId") or ep.get("item_id") or "")
            if accessKey:
                play_list.append(f"{self._safe_text(title)}${accessKey}")
                
        return {
            "list": [{
                "vod_id": sid,
                "vod_name": self._safe_text(name),
                "vod_pic": pic,
                "vod_remarks": self._safe_text(remark),
                "type_name": type_name,
                "vod_actor": self._safe_text(actor),
                "vod_director": self._safe_text(director),
                "vod_content": self._safe_text(desc),
                "vod_play_from": "SVIP极速线路",
                "vod_play_url": "#".join(play_list)
            }]
        }

    def playerContent(self, flag, id, vipFlags):
        accessKey = str(id).strip()
        if not accessKey:
            return {"parse": 1, "url": ""}
            
        payload = {
            "type": "episode",
            "accessKey": accessKey
        }

        res = self._req_post('/my/hg/query', json_data=payload)
        body = self._pick_data(res)
        
        urls = body.get("urls", [])
        first = urls[0] if urls else {}
        
        play_url = first.get("cdnUrl") or first.get("ossUrl") or first.get("url") or ""

        return {
            "parse": 0,
            "url": play_url or accessKey,
            "header": ""
        }

    def localProxy(self, param): pass
