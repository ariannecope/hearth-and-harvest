"""Turn phone photos of pencil sketches into clean, trimmed, transparent web images.

    python3 client/scripts/process-sketches.py

Reads  client/sketches-original/<name>sketch.JPG
Writes client/src/assets/sketches/<name>.webp

Steps: even out the lighting so the paper becomes white, keep the pencil lines as a
dark ink on a transparent background, drop stray marks touching the photo's edges
(bits of neighbouring sketches), and trim to the drawing with a small margin.
Needs Pillow, numpy and scipy.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'sketches-original'
OUT = ROOT / 'src' / 'assets' / 'sketches'
INK = (47, 42, 36)        # warm near-black, close to the site's --ink colour
WORK = 1600               # processing size (long side), px
MAX_SIDE = {'garden': 720, 'sheep': 480, 'goat': 480, 'veggie': 320}  # output long side (about 2x display size); default below
DEFAULT_SIDE = 200


def process(path: Path) -> Image.Image:
    img = ImageOps.exif_transpose(Image.open(path)).convert('L')
    img.thumbnail((WORK, WORK), Image.LANCZOS)
    g = np.asarray(img, dtype=np.float32) / 255

    # Paper brightness map: close over the thin pencil lines, then blur.
    bg = ndimage.gaussian_filter(ndimage.grey_closing(g, size=(31, 31)), 25)
    flat = np.clip(g / np.maximum(bg, 1e-3), 0, 1)
    ink = ndimage.median_filter(1 - flat, size=3)       # soften paper grain speckle
    alpha = np.clip((ink - 0.2) / 0.4, 0, 1) ** 0.8     # grain sits below ~0.2; keep soft shading

    # Group strokes into drawings; pieces touching the border are usually neighbouring sketches.
    strokes = ndimage.binary_opening(ink > 0.4, iterations=1)  # firm lines only, no specks
    mask = ndimage.binary_dilation(strokes, iterations=14)
    labels, n = ndimage.label(mask)
    mass = ndimage.sum(alpha, labels, index=np.arange(1, n + 1))
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    # The main drawing may brush an edge, so only drop edge pieces that are small next to it.
    biggest = mass.max()
    keep = [
        i for i in range(1, n + 1)
        if mass[i - 1] >= (0.4 if i in border else 0.03) * biggest
    ]
    keep_mask = np.isin(labels, keep)
    alpha = alpha * keep_mask

    ys, xs = np.nonzero(alpha > 0.05)
    pad = int(0.025 * max(g.shape))
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, g.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, g.shape[1])
    alpha = alpha[y0:y1, x0:x1]

    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = (alpha * 255).round().astype(np.uint8)
    return Image.fromarray(rgba)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for path in sorted(SRC.glob('*sketch.*')):
        name = path.stem.lower().removesuffix('sketch')
        out = process(path)
        out.thumbnail((MAX_SIDE.get(name, DEFAULT_SIDE),) * 2, Image.LANCZOS)
        dest = OUT / f'{name}.webp'
        out.save(dest, 'WEBP', quality=88, method=6)
        print(f'{path.name:22} -> {dest.relative_to(ROOT)}  {out.size[0]}x{out.size[1]}  {dest.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
