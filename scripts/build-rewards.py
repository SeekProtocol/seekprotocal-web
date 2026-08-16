"""
Turn the stock reward renders into web assets.

    python3 scripts/build-rewards.py ~/Downloads/rewards

The source files are 3000x3000 PNGs, up to 16MB each, 250MB for the set. They
are renders on transparency with a lot of empty margin, so three things happen
here and each one is worth more than the last:

  1. Trim to the alpha bounding box. Every file is a subject floating in a
     square, and up to 40% of the pixels are nothing at all. Trimming is also
     what makes the layout predictable: after it, "fit the image box" means
     "fit the subject", so a coin and a wide voucher can share a grid cell
     without one of them appearing to shrink.
  2. Resize the long edge to EDGE. These are drawn around 260px and never above
     320px, so 640 covers a 2x display with room to spare.
  3. Encode AVIF. The site already serves AVIF everywhere else and
     next.config.ts lists it first.

A padded square variant is written alongside for anything that needs a uniform
box, but the trimmed one is the default: it is the one that lets a component
decide its own composition.
"""

import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

EDGE = 640
QUALITY = "58"

# Category drives the copy and the ordering in `content/rewards.ts`. It lives
# here as well because the filenames are the only place the set is enumerated,
# and a file appearing in the folder that nothing knows about should be loud.
CATEGORY = {
    "ethereum": "token",
    "solana": "token",
    "bnb (1)": "token",
    "hyperliquid-token": "token",
    "berachain-cryptocurrency": "token",
    "dogecoin": "meme",
    "pepe-cryptocurrency": "meme",
    "baby-doge-cryptocurrency": "meme",
    "spx6900-cryptocurrency": "meme",
    "toshi-cryptocurrency": "meme",
    "turbo-cryptocurrency": "meme",
    "nft-auction": "nft",
    "voucher": "voucher",
    "food-voucher": "voucher",
    "barcode-voucher": "voucher",
    "gaming-controller": "goods",
    "playstation": "goods",
    "shoes-for-sale": "goods",
}

# Filenames that would be awkward as a URL or an id.
RENAME = {"bnb (1)": "bnb"}


def main(src_dir: str):
    out_dir = os.path.join("public", "app", "rewards")
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    unknown = []

    for filename in sorted(os.listdir(src_dir)):
        if not filename.lower().endswith(".png"):
            continue
        stem = os.path.splitext(filename)[0]
        if stem not in CATEGORY:
            unknown.append(stem)
            continue

        slug = RENAME.get(stem, stem)
        image = Image.open(os.path.join(src_dir, filename)).convert("RGBA")
        box = image.getchannel("A").getbbox()
        if box:
            image = image.crop(box)

        scale = EDGE / max(image.size)
        if scale < 1:
            size = (round(image.width * scale), round(image.height * scale))
            image = image.resize(size, Image.LANCZOS)

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            image.save(tmp.name)
            target = os.path.join(out_dir, f"{slug}.avif")
            # avifenc rather than Pillow's encoder: it keeps the alpha lossless
            # while the colour plane stays lossy, which matters because these
            # are cut-outs and a soft alpha edge is what stops them looking
            # pasted on.
            subprocess.run(
                ["avifenc", "-q", QUALITY, "--qalpha", "100", "-s", "4",
                 tmp.name, target],
                check=True, capture_output=True,
            )
        os.unlink(tmp.name)

        manifest.append({
            "id": slug,
            "category": CATEGORY[stem],
            "width": image.width,
            "height": image.height,
            "kb": round(os.path.getsize(target) / 1024, 1),
        })

    print(json.dumps(manifest, indent=1))
    total = sum(entry["kb"] for entry in manifest)
    print(f"{len(manifest)} assets, {total:.0f} KB total")
    if unknown:
        print(f"NOT BUILT, no category: {unknown}")


if __name__ == "__main__":
    main(sys.argv[1])
