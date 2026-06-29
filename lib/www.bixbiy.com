<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>网站通知</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f6f6f2;
      color: #222;
      font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
      line-height: 1.8;
    }

    main {
      width: min(680px, calc(100% - 40px));
      padding: 34px 30px;
      background: #fff;
      border: 1px solid #deded6;
      border-radius: 8px;
      box-sizing: border-box;
    }

    h1 {
      margin: 0 0 22px;
      font-size: 26px;
      font-weight: 700;
    }

    p {
      margin: 12px 0;
      font-size: 17px;
    }

    a {
      color: #1f5fbf;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <main>
    <h1>网站通知</h1>
    <p>由于不可抗力，可能会关闭网站。</p>
    <p>友情微信群：其他人发的微信</p>
    <p>
      微信交流群二维码：
      <a href="https://pan.xunlei.com/s/VOvPml5Ly7AUSstfCz0qhJnKA1?pwd=fn7d#" target="_blank" rel="noopener">
        https://pan.xunlei.com/s/VOvPml5Ly7AUSstfCz0qhJnKA1?pwd=fn7d#
      </a>
    </p>
  </main>
</body>
</html>
