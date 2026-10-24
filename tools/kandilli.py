#!/usr/bin/env python3
"""Kandilli Rasathanesi'nin son depremler listesini çekip js/data/kandilli.js dosyasını günceller.

GitHub'da her saat kendiliğinden çalışır (.github/workflows/kandilli.yml); elle çalıştırmak gerekmez.
Kandilli'nin listesi tarayıcıdan okunamıyor (yalnızca http, başka sitelere izin yok), bu yüzden sunucuda çekilir.

Kandilli yalnızca son 500 depremi listeler. Listeden düşen eski depremler dosyada kalır; son 8 günden eskiler silinir.

Kullanım:
    python3 tools/kandilli.py
"""
import datetime as dt
import json
import pathlib
import re
import sys
import time
import urllib.request

URL = "http://www.koeri.boun.edu.tr/scripts/lst0.asp"
FRAME = (25.5, 35.6, 45.0, 42.3)     # harita çerçevesi: batı, güney, doğu, kuzey (js/features/recent.js ile aynı)
KEEP_DAYS = 8                        # site son 7 günü gösterir; bir günlük pay
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "data" / "kandilli.js"

# 2026.10.24 09:35:51  38.2272   38.5008        5.0      -.-  2.5  -.-   GULUMUSAGI-(MALATYA)        İlksel
# Yer adı boşluk içerebilir; satır "İlksel" ya da "REVIZE01 (tarih)" ile biter.
ROW = re.compile(r"(\d{4})\.(\d\d)\.(\d\d) (\d\d:\d\d:\d\d)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)"
                 r"\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\s+(?:İlksel|REVIZE)")


def fetch(tries=3):
    req = urllib.request.Request(URL, headers={"User-Agent": "turkiye-afet-haritasi (github.com/hakanersosyal)"})
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("cp1254")
        except OSError as e:
            if i == tries - 1:
                sys.exit(f"Kandilli'ye ulaşılamadı: {e}")
            time.sleep(30)


def mag(md, ml, mw):
    """Varsa Mw (moment büyüklüğü), yoksa ML, o da yoksa MD; Kandilli boşları "-.-" yazar."""
    for m in (mw, ml, md):
        if m != "-.-" and float(m) > 0:
            return float(m)
    return None


def parse(text):
    rows = []
    w, s, e, n = FRAME
    for line in text.splitlines():
        m = ROW.match(line)
        if not m:
            continue
        y, mo, d, t, lat, lon, depth, md, ml, mw, place = m.groups()
        lat, lon, size = float(lat), float(lon), mag(md, ml, mw)
        if size is None or not (w <= lon <= e and s <= lat <= n):
            continue
        rows.append([f"{y}-{mo}-{d} {t}", lat, lon, float(depth), size, place.strip()])
    return rows


def saved():
    if not OUT.exists():
        return []
    return [json.loads(l.strip().rstrip(",")) for l in OUT.read_text(encoding="utf-8").splitlines() if l.startswith('  ["')]


def main():
    new = parse(fetch())
    if not new:
        sys.exit("Kandilli'nin listesinden deprem okunamadı.")
    # Listedeki dönem için Kandilli'nin son hâli geçerli (düzeltilen depremler değişir); öncesi eski dosyadan gelir.
    oldest = min(r[0] for r in new)
    rows = new + [r for r in saved() if r[0] < oldest]
    newest = dt.datetime.fromisoformat(max(r[0] for r in rows))
    keep = (newest - dt.timedelta(days=KEEP_DAYS)).strftime("%Y-%m-%d %H:%M:%S")
    rows = sorted((r for r in rows if r[0] >= keep), key=lambda r: r[0], reverse=True)

    out = [
        "// Türkiye Afet Haritası · Kandilli Rasathanesi'nin kaydettiği son depremler",
        "// Kaynak: " + URL,
        "// GitHub'da her saat kendiliğinden güncellenir (tools/kandilli.py); elle düzenlemeyin.",
        "'use strict';",
        "",
        "// Türkiye saati, enlem, boylam, derinlik (km), büyüklük, Kandilli'nin yazdığı yer; en yenisi üstte",
        "const KANDILLI = [",
        *[f"  {json.dumps(r, ensure_ascii=False)}," for r in rows],
        "];",
    ]
    tmp = OUT.with_suffix(".tmp")  # yarım kalmış bir dosya siteyi bozmasın
    tmp.write_text("\n".join(out) + "\n", encoding="utf-8")
    tmp.replace(OUT)
    print(f"{OUT.name}: {len(rows)} deprem ({len(new)} yeni listeden), {rows[-1][0]} – {rows[0][0]}")


if __name__ == "__main__":
    main()
