#!/usr/bin/env python3

import json
import os
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


BING_API = (
    "https://www.bing.com/HPImageArchive.aspx"
    "?format=js&idx=0&n=1&mkt=zh-CN&uhd=1&uhdwidth=3840&uhdheight=2160"
)
TARGET = Path(__file__).resolve().parents[1] / "assets" / "background.jpg"
MAX_IMAGE_SIZE = 15 * 1024 * 1024


def download(url):
    request = Request(url, headers={"User-Agent": "weblist-wallpaper-updater/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read(MAX_IMAGE_SIZE + 1), response.headers.get_content_type()


def main():
    metadata_bytes, _ = download(BING_API)
    metadata = json.loads(metadata_bytes)
    images = metadata.get("images")
    if not images:
        raise RuntimeError("Bing 未返回每日壁纸信息")

    image = images[0]
    image_url = urljoin("https://www.bing.com", image.get("url", ""))

    if urlparse(image_url).hostname not in {"bing.com", "www.bing.com"}:
        raise RuntimeError("Bing 返回了无效的壁纸地址")

    image_bytes, content_type = download(image_url)
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise RuntimeError("壁纸文件超过 15 MiB 限制")
    if content_type != "image/jpeg" or not image_bytes.startswith(b"\xff\xd8\xff"):
        raise RuntimeError(f"壁纸格式异常: {content_type}")

    if TARGET.exists() and TARGET.read_bytes() == image_bytes:
        print("Bing 每日壁纸没有变化")
        return

    temporary = TARGET.with_suffix(".jpg.tmp")
    temporary.write_bytes(image_bytes)
    os.replace(temporary, TARGET)
    print(f"已更新 {TARGET.name}: {image.get('copyright', 'Bing 每日壁纸')}")


if __name__ == "__main__":
    main()
