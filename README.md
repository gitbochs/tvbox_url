# TVBox 配置文件说明

生成时间: 2026-09-29

## 📦 配置文件列表

### 主配置文件
- **config.json** (380KB) - 完整版，包含842个站点
- **config_50sites.json** (55KB) - 超稳定版，50个高质量站点，适合老设备
- **config_100sites.json** (81KB) - 推荐版，100个站点，平衡性能与内容
- **config_200sites.json** (120KB) - 扩展版，200个站点，适合较新设备
- **config_multi.json** (5.4KB) - 多仓版，包含30个仓库地址

### 源列表
- **sources.txt** (3.7KB) - 包含所有处理的源URL

## 🎯 配置特点

### Spider配置
- **全局spider**: `./jar/aidaox-20260911-111534.jar` (17MB)
  - 最大最全的spider包，支持317种spider类
- **站点专属jar**: 196个站点（23.3%）使用自己的jar
- **共用全局spider**: 646个站点（76.7%）使用全局spider

### 豆瓣站点 (11个)
所有豆瓣站点使用全局spider，包括：
- 🎬豆瓣┃推荐 (csp_Douban)
- 豆瓣┃预告 (csp_YGP)
- 🏠豆瓣[4K] (csp_DoubanPan)
- 🔍豆瓣 (csp_DouDouGuard)
- 🥳豆瓣┃[盘搜] (csp_TgDouban)
- 等等...

### 依赖文件
- JAR文件: 293个
- JS文件: 780个
- LIB文件: 2532个
- EXT文件: 30个

## 📋 站点统计

- **总站点数**: 842
- **Type 1 (采集站)**: 126
- **Type 3 (Spider站)**: 716
  - 有专属jar: 196
  - 使用全局spider: 520
- **解析器**: 194个

## 🚀 使用方法

### 1. 完整版 (推荐新设备)
```
https://your-domain/config.json
```

### 2. 精简版 (推荐老设备)
```
https://your-domain/config_50sites.json
```

### 3. 多仓版
```
https://your-domain/config_multi.json
```

## 🔧 配置优先级说明

TVBox加载spider的优先级：
1. **站点级jar** - 如果站点配置有`"jar": "xxx.jar"`字段，优先使用
2. **全局spider** - 如果站点没有jar字段，使用全局`"spider"`字段

这种设计确保：
- 特殊站点可以使用专属jar
- 通用站点共享一个全局jar，节约内存
- 全局jar是最大最全的包，兼容性最好

## ⚠️ 注意事项

1. 所有依赖文件（jar/js/lib/ext）都已下载到对应目录
2. 配置中的路径都是相对路径（如`./jar/xxx.jar`）
3. 上传到GitHub时需要保持目录结构
4. 豆瓣站点需要全局spider支持多种spider类

## 📝 更新记录

- 2026-09-29: 初始版本
  - 聚合842个站点
  - 优化spider选择逻辑（选择最大jar支持最多spider类）
  - 下载所有依赖文件
  - 生成多个版本配置
