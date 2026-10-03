#!/usr/bin/env python3
"""
ヘッダーのワードマーク public/wordmark.png / wordmark-dark.png を書き出す。

もともとヘッダーは「ロンド」がブラウザのフォント、「ん！」だけが public/logo.png
という混成だった。和文フォントは端末ごとに違うので字形も太さも揃わず、画像との
ベースラインも目分量で合わせるしかない。そこでワードマーク全体を1枚の画像にした。

その後「ん！」を logo.png(ビッグベンの「ん」とタワーブリッジの「！」)から
public/logo.svg(白い波線を「ん」に見立て、赤い点を添えたもの)に替え、
色もワードマーク全体を logo.svg の白・赤・ネイビーに揃えた。
「！」は logo.svg の語彙で作り直している(「ん」と同じ太さの棒 + 赤い点)。
「ジャスト・」の「・」も同じ赤い点にして、赤は丸だけに使う。

やっていること:
  1. logo.svg のパスと点を読み、線を丸キャップで描く
  2. 「ん」の胴(点を除く)の高さを「ロ」の高さに合わせる。開いた形なので、
     線の太さを文字に合わせると字面が軽く、文字に負けて見える
  3. 「ジャスト・」「ロンド」を描き、「ん」の下端を「ン」の下端に揃えて並べる
  4. ダーク用は logo.svg のまま(白い線)。ライト用は白い地に白い線は見えないので、
     白をロゴの地色のネイビーに入れ替える。赤はどちらも同じ

書体は Zen Maru Gothic Black。SIL OFL なので商用利用もアウトライン化も可。
3.7MB あるのでリポジトリには置かず、実行時に Google Fonts から取って
scripts/.tmp/ に置く(gitignore 済み)。

実行:  python3 scripts/build-wordmark.py
Pillow が要る:  pip3 install --user Pillow
書き出した PNG は必ずコミットすること。ビルド時には走らない。
寸法が変わったら components/navbar/Wordmark.tsx の WIDTH / HEIGHT も直す。
"""

from __future__ import annotations

import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow が要る:  pip3 install --user Pillow")

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "logo.svg"
TMP = ROOT / "scripts" / ".tmp"

FONT_URL = (
    "https://github.com/google/fonts/raw/main/ofl/zenmarugothic/ZenMaruGothic-Black.ttf"
)
FONT_FILE = TMP / "ZenMaruGothic-Black.ttf"

# 「ジャスト・」は本体より一段控えめな色にする。どちらもロゴのネイビー(slate-900)と同系
JUST_ON_DARK = (203, 213, 225)  # slate-300。ネイビーのままだと暗い地に沈む
JUST_ON_LIGHT = (100, 116, 139)  # slate-500

SIZE = 1000  # 作業時のフォントサイズ。最後に OUTPUT_HEIGHT まで縮める
JUST_RATIO = 0.66  # 「ジャスト・」は本体より一段小さく
GAP_JUST = 0.06  # 以下はいずれも本体のフォントサイズに対する比
GAP_N = 0.07  # 「ド」の濁点と「ん」の点がぶつからない程度
GAP_BANG = 0.13
BANG_TOP = 0.80  # 「！」の上端。ベースラインから「ド」の頭(0.78)とほぼ同じ高さ
BANG_DOT_GAP = 0.07  # 「！」の棒と点のあいだ
BANG_DOT_SCALE = 1.2  # 「！」の点の直径は棒の太さの何倍か

OUTPUT_HEIGHT = 160  # 実表示 40px の4倍。Retina でも眠くならない
PALETTE_COLORS = 48  # 平坦な3色の絵なので、減色しても劣化しない

SVG_NS = {"svg": "http://www.w3.org/2000/svg"}


def fetch_font() -> Path:
    if FONT_FILE.exists():
        return FONT_FILE
    TMP.mkdir(parents=True, exist_ok=True)
    print(f"downloading {FONT_URL}")
    with urllib.request.urlopen(FONT_URL, timeout=120) as res:
        FONT_FILE.write_bytes(res.read())
    return FONT_FILE


def ink_box(font: ImageFont.FreeTypeFont, char: str) -> tuple[int, int, int, int]:
    """文字を実際に描き、インクの外接を描画原点(左端・ベースライン)からの距離で返す。
    font.getbbox は下端をベースラインで切ってしまい、字面の高さを測れない。"""
    size = font.size
    canvas = Image.new("L", (size * 3, size * 3), 0)
    origin = (size, size * 2)
    ImageDraw.Draw(canvas).text(origin, char, font=font, fill=255, anchor="ls")
    left, top, right, bottom = canvas.getbbox()
    return left - origin[0], top - origin[1], right - origin[0], bottom - origin[1]


def hex_color(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def parse_path(d: str):
    """M と C だけのパスを3次ベジェの区間のリストにする。logo.svg はこれで足りる。"""
    tokens = re.findall(r"[A-Za-z]|-?\d*\.?\d+", d)
    segments, current, command, i = [], None, None, 0
    while i < len(tokens):
        if tokens[i].isalpha():
            command = tokens[i]
            if command not in ("M", "C"):
                sys.exit(f"logo.svg のパスに未対応のコマンドがある: {command}")
            i += 1
            continue
        nums = [float(t) for t in tokens[i : i + (2 if command == "M" else 6)]]
        if command == "M":
            current = (nums[0], nums[1])
            i += 2
        else:
            p1, p2, p3 = (nums[0], nums[1]), (nums[2], nums[3]), (nums[4], nums[5])
            segments.append((current, p1, p2, p3))
            current = p3
            i += 6
    return segments


def sample(segment, n: int = 1500):
    p0, p1, p2, p3 = segment
    for step in range(n + 1):
        t = step / n
        u = 1 - t
        yield (
            u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
        )


def load_logo():
    svg = ET.parse(SOURCE).getroot()
    path = svg.find("svg:path", SVG_NS)
    dot = svg.find("svg:circle", SVG_NS)
    rect = svg.find("svg:rect", SVG_NS)

    points = [p for seg in parse_path(path.get("d")) for p in sample(seg)]
    stroke = float(path.get("stroke-width"))
    half = stroke / 2
    return {
        "points": points,
        "stroke": stroke,
        # 線幅込みの「ん」の胴の外接。点はここに含めない
        "left": min(x for x, _ in points) - half,
        "right": max(x for x, _ in points) + half,
        "top": min(y for _, y in points) - half,
        "bottom": max(y for _, y in points) + half,
        "dot": (float(dot.get("cx")), float(dot.get("cy")), float(dot.get("r"))),
        "line": hex_color(path.get("stroke")),
        "accent": hex_color(dot.get("fill")),
        "ground": hex_color(rect.get("fill")),
    }


def build(logo, font_path: Path, dark: bool) -> Image.Image:
    # ダークはロゴそのまま(白い線)、ライトは線と地を入れ替えてネイビーの線にする
    ink = logo["line"] if dark else logo["ground"]
    just_ink = JUST_ON_DARK if dark else JUST_ON_LIGHT
    accent = logo["accent"]

    font = ImageFont.truetype(str(font_path), SIZE)
    just_font = ImageFont.truetype(str(font_path), round(SIZE * JUST_RATIO))

    canvas = Image.new("RGBA", (SIZE * 9, SIZE * 3), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    baseline = SIZE * 2

    def circle(cx: float, cy: float, r: float, fill) -> None:
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)

    # 「ん」の大きさ: 胴の高さを「ロ」に、下端を「ン」に揃える
    _, ro_top, _, ro_bottom = ink_box(font, "ロ")
    n_bottom = baseline + ink_box(font, "ン")[3]
    k = (ro_bottom - ro_top) / (logo["bottom"] - logo["top"])
    line_r = logo["stroke"] / 2 * k
    dot_x, dot_y, dot_r = logo["dot"]

    # 「・」は「ん」の点を「ジャスト」と同じ比率で縮めた赤丸にし、元の「・」の位置に置く
    x = SIZE * 0.5
    draw.text((x, baseline), "ジャスト", font=just_font, fill=just_ink, anchor="ls")
    x += just_font.getlength("ジャスト")
    mid_left, mid_top, mid_right, mid_bottom = ink_box(just_font, "・")
    circle(
        x + (mid_left + mid_right) / 2,
        baseline + (mid_top + mid_bottom) / 2,
        dot_r * k * JUST_RATIO,
        accent,
    )
    x += just_font.getlength("・") + SIZE * GAP_JUST

    draw.text((x, baseline), "ロンド", font=font, fill=ink, anchor="ls")
    x += font.getlength("ロンド") + SIZE * GAP_N

    ox = x - logo["left"] * k
    oy = n_bottom - logo["bottom"] * k
    for px, py in logo["points"]:
        circle(ox + px * k, oy + py * k, line_r, ink)
    circle(ox + dot_x * k, oy + dot_y * k, dot_r * k, accent)
    x += (logo["right"] - logo["left"]) * k + SIZE * GAP_BANG

    # 「！」: 「ん」と同じ太さの棒と、赤い点。点の下端も「ン」の下端に揃える
    bang_dot_r = line_r * BANG_DOT_SCALE
    cx = x + bang_dot_r
    bang_dot_y = n_bottom - bang_dot_r
    bar_top = baseline - SIZE * BANG_TOP
    bar_bottom = bang_dot_y - bang_dot_r - SIZE * BANG_DOT_GAP
    draw.rounded_rectangle(
        (cx - line_r, bar_top, cx + line_r, bar_bottom), radius=line_r, fill=ink
    )
    circle(cx, bang_dot_y, bang_dot_r, accent)

    out = canvas.crop(canvas.getbbox())
    return out.resize(
        (round(out.width * OUTPUT_HEIGHT / out.height), OUTPUT_HEIGHT), Image.LANCZOS
    )


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"素材が見つからない: {SOURCE}")
    logo = load_logo()
    font_path = fetch_font()

    sizes = set()
    for dark in (False, True):
        image = build(logo, font_path, dark)
        sizes.add(image.size)
        out = ROOT / "public" / ("wordmark-dark.png" if dark else "wordmark.png")
        image.quantize(colors=PALETTE_COLORS, method=Image.FASTOCTREE).save(
            out, optimize=True
        )
        kb = out.stat().st_size / 1024
        print(f"wrote {out.relative_to(ROOT)}  {image.width}x{image.height}  {kb:.1f}KB")

    # Wordmark.tsx は明暗2枚に同じ width/height を渡している
    if len(sizes) != 1:
        sys.exit(f"明暗で寸法が食い違っている: {sizes}")


if __name__ == "__main__":
    main()
