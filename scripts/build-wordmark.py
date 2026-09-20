#!/usr/bin/env python3
"""
ヘッダーのワードマーク public/wordmark.png / wordmark-dark.png を書き出す。

もともとヘッダーは「ロンド」がブラウザのフォント、「ん！」だけが public/logo.png
という混成だった。和文フォントは端末ごとに違うので字形も太さも揃わず、画像との
ベースラインも目分量で合わせるしかない。ワードマーク全体を1枚の画像にして、
そこに「ジャスト」を足したのがこれ。

やっていること:
  1. logo.png から「ん(+ビッグベン)」と「！(+タワーブリッジ+バス)」を切り出す
  2. 素材の「ん」の筆画の太さ(実測 95px)に線幅が一致するフォントサイズを逆算し、
     「ジャスト・」「ロンド」をそのサイズで描く
  3. 文字のベースラインを「ん」の筆画の下端に合わせて横に並べる
  4. ダーク用は素材と文字のネイビーだけを明色に差し替える
     (サイトのダーク背景は near-black で、ネイビーがそのままだと沈む)

書体は Zen Maru Gothic Black。SIL OFL なので商用利用もアウトライン化も可。
3.7MB あるのでリポジトリには置かず、実行時に Google Fonts から取って
scripts/.tmp/ に置く(gitignore 済み)。

実行:  python3 scripts/build-wordmark.py
Pillow が要る:  pip3 install --user Pillow
書き出した PNG は必ずコミットすること。ビルド時には走らない。
"""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow が要る:  pip3 install --user Pillow")

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "logo.png"
TMP = ROOT / "scripts" / ".tmp"

FONT_URL = (
    "https://github.com/google/fonts/raw/main/ofl/zenmarugothic/ZenMaruGothic-Black.ttf"
)
FONT_FILE = TMP / "ZenMaruGothic-Black.ttf"

# logo.png(810x665)の実測値。素材を差し替えたら測り直すこと。
N_BOX = (4, 11, 562, 660)  # 「ん」+ ビッグベン。尖塔が字面より上に出る
EX_BOX = (611, 37, 779, 659)  # 「！」+ タワーブリッジ + バス
N_BASELINE = 659  # 「ん」の筆画の下端。文字のベースラインをここに合わせる
N_STROKE = 95.0  # 「ん」の筆画の太さ

ORANGE = (255, 97, 71)  # logo.png から採取
NAVY = (24, 56, 88)
NAVY_ON_DARK = (205, 222, 238)  # ダーク背景でネイビーの代わりに使う明色

# 「ん」を文字に対してどれだけ大きく見せるか。1.0 だと字面に埋もれる
ART_SCALE = 1.12
JUST_RATIO = 0.66  # 「ジャスト・」は本体より一段小さく
GAP_JUST = 0.06  # 以下はいずれも本体のフォントサイズに対する比
GAP_N = 0.16
GAP_EX = 0.14

OUTPUT_HEIGHT = 160  # 実表示 40px の4倍。Retina でも眠くならない
PALETTE_COLORS = 48  # 平坦な3色の絵なので、減色しても劣化しない


def fetch_font() -> Path:
    if FONT_FILE.exists():
        return FONT_FILE
    TMP.mkdir(parents=True, exist_ok=True)
    print(f"downloading {FONT_URL}")
    with urllib.request.urlopen(FONT_URL, timeout=120) as res:
        FONT_FILE.write_bytes(res.read())
    return FONT_FILE


def stroke_width(font_path: Path, size: int) -> int:
    """「ロ」の縦画を実際に描いて数え、そのフォントサイズでの線幅を返す。"""
    font = ImageFont.truetype(str(font_path), size)
    canvas = Image.new("L", (size * 3, size * 3), 0)
    ImageDraw.Draw(canvas).text((size // 2, size // 2), "ロ", font=font, fill=255)
    canvas = canvas.crop(canvas.getbbox())
    px = canvas.load()
    y = canvas.height // 2
    start = None
    for x in range(canvas.width):
        filled = px[x, y] > 128
        if filled and start is None:
            start = x
        if not filled and start is not None:
            return x - start
    raise RuntimeError("「ロ」の縦画を測れなかった")


def recolor(image: Image.Image, src, dst, tolerance: int = 70) -> Image.Image:
    """素材のネイビーだけを差し替える。オレンジと時計盤のクリームはそのまま。"""
    out = image.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if (
                a > 8
                and abs(r - src[0]) < tolerance
                and abs(g - src[1]) < tolerance
                and abs(b - src[2]) < tolerance
            ):
                px[x, y] = (dst[0], dst[1], dst[2], a)
    return out


def build(source: Image.Image, font_path: Path, dark: bool) -> Image.Image:
    accent = NAVY_ON_DARK if dark else NAVY
    art = recolor(source, NAVY, NAVY_ON_DARK) if dark else source

    probe = 900
    size = round(probe * (N_STROKE * ART_SCALE) / stroke_width(font_path, probe))
    font = ImageFont.truetype(str(font_path), size)
    just_font = ImageFont.truetype(str(font_path), round(size * JUST_RATIO))

    canvas = Image.new("RGBA", (size * 12, size * 5), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    baseline = size * 3
    art_top = baseline - round((N_BASELINE - N_BOX[1]) * ART_SCALE)

    def paste(box, xy) -> int:
        part = art.crop(box)
        part = part.resize(
            (round(part.width * ART_SCALE), round(part.height * ART_SCALE)),
            Image.LANCZOS,
        )
        canvas.alpha_composite(part, xy)
        return part.width

    x = size
    draw.text((x, baseline), "ジャスト・", font=just_font, fill=accent, anchor="ls")
    x += round(just_font.getlength("ジャスト・")) + round(size * GAP_JUST)

    draw.text((x, baseline), "ロンド", font=font, fill=ORANGE, anchor="ls")
    x += round(font.getlength("ロンド")) + round(size * GAP_N)

    x += paste(N_BOX, (x, art_top)) + round(size * GAP_EX)
    paste(EX_BOX, (x, art_top + round((EX_BOX[1] - N_BOX[1]) * ART_SCALE)))

    out = canvas.crop(canvas.getbbox())
    return out.resize(
        (round(out.width * OUTPUT_HEIGHT / out.height), OUTPUT_HEIGHT), Image.LANCZOS
    )


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"素材が見つからない: {SOURCE}")
    source = Image.open(SOURCE).convert("RGBA")
    font_path = fetch_font()

    for dark in (False, True):
        image = build(source, font_path, dark)
        out = ROOT / "public" / ("wordmark-dark.png" if dark else "wordmark.png")
        image.quantize(colors=PALETTE_COLORS, method=Image.FASTOCTREE).save(
            out, optimize=True
        )
        kb = out.stat().st_size / 1024
        print(f"wrote {out.relative_to(ROOT)}  {image.width}x{image.height}  {kb:.1f}KB")


if __name__ == "__main__":
    main()
