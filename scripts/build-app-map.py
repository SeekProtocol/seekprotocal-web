"""
Turn a Mapbox render into the two map plates the app walkthrough can use.

    python3 scripts/build-app-map.py ~/Downloads/some-map.png

Writes public/app/screens/map-day.avif and map-night.avif, cropped to the
phone aperture's ratio (402:874).

The night version is composited here rather than filtered in CSS, and that is
the point of the file. A CSS filter that darkens a map either washes it out or,
if it reaches for `invert`, turns the parks magenta and the water orange:
inverting a hue is not the same as turning the lights off. Darkening the
luminance, easing the saturation back and multiplying a deep blue-black over
the top keeps green green and water water.

⚠️ Attribution. These are Mapbox renders and their terms require the logo and
copyright line to stay visible. The crop drops the logo baked into the source,
so the screens carry `rewards.mapCredit` instead. See FOUND_MAP in
content/rewards.ts.
"""

import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageEnhance

Image.MAX_IMAGE_PIXELS = None

APERTURE = 402 / 874
# 880 covers the phone screen at 3x. Anything a source can give above that is
# thrown away by the browser; anything below it is left at its native size.
EDGE = 880
OUT_DIR = os.path.join("public", "app", "screens")


def write(image: Image.Image, name: str, quality: str = "72") -> None:
    """
    q72 rather than q62. These plates are dense fine type at the size a street
    label is drawn, and AVIF spends its error budget exactly there: at 62 the
    labels smear into the roads and the map stops reading as a map.
    """
    os.makedirs(OUT_DIR, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        image.save(tmp.name)
        target = os.path.join(OUT_DIR, f"{name}.avif")
        subprocess.run(
            ["avifenc", "-q", quality, "--qalpha", "100", "-s", "4", tmp.name, target],
            check=True, capture_output=True,
        )
    os.unlink(tmp.name)
    print(f"{target}  {image.size}  {os.path.getsize(target) // 1024} KB")


def main(src: str, left: int | None = None) -> None:
    image = Image.open(src).convert("RGB")
    width, height = image.size
    crop_w = round(height * APERTURE)
    # Centre by default; pass an x to choose what the crop keeps.
    x = (width - crop_w) // 2 if left is None else max(0, min(width - crop_w, left))
    day = image.crop((x, 0, x + crop_w, height))
    # Never upscale. EDGE is a cap, not a target: resizing a 567px crop up to
    # 640 adds no detail, costs bytes and softens every label on the map, which
    # is the one thing that has to survive. The first version of this did
    # exactly that.
    if day.size[0] > EDGE:
        day = day.resize((EDGE, round(EDGE * day.size[1] / day.size[0])), Image.LANCZOS)
    write(day, "map-day")

    night = ImageEnhance.Brightness(day).enhance(0.34)
    night = ImageEnhance.Color(night).enhance(0.62)
    night = Image.blend(night, Image.new("RGB", night.size, (16, 20, 34)), 0.42)
    night = ImageEnhance.Contrast(night).enhance(1.18)
    write(night, "map-night")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else None)
