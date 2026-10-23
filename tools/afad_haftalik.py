#!/usr/bin/env python3
"""AFAD Deprem Kataloğu'ndan bir haftanın depremlerini çekip js/data/recent-quakes.js dosyasını üretir.

Son Olaylar bölümü depremleri internetten canlı alır; bu dosya yalnızca internet yokken gösterilir.

Kullanım:
    python3 tools/afad_haftalik.py 2026-10-14 2026-10-21

Tarihler Türkiye saatiyle verilir; bitiş günü dahildir.
"""
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

API = "https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter"
TSI = dt.timedelta(hours=3)          # AFAD saatleri UTC; Türkiye saati = UTC+3
MIN_MAG = 2.0                        # haritada gösterilecek en küçük büyüklük
FRAME = (25.5, 35.6, 45.0, 42.3)     # harita çerçevesi: batı, güney, doğu, kuzey
NEAR_KM = 50                         # denizdeki bir depremi en yakın ile saymak için en büyük uzaklık
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "data" / "recent-quakes.js"


def fetch(start, end):
    q = urllib.parse.urlencode({"start": start.isoformat(), "end": end.isoformat(), "minmag": 0,
                                "orderby": "timedesc", "limit": 10000})
    # AFAD'ın güvenlik duvarı tarayıcı olmayan istekleri reddediyor.
    req = urllib.request.Request(f"{API}?{q}", headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
        "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def split_loc(loc):
    """"Marmara Denizi - [20.61 km] Marmaraereğlisi (Tekirdağ)" → ("Marmara Denizi", 20.61, "Marmaraereğlisi (Tekirdağ)")."""
    m = re.match(r"(.+?) - \[\s*([\d.]+) km\] (.+)", loc)
    return (m.group(1).replace(" - ", ", "), float(m.group(2)), m.group(3)) if m else (loc, None, None)


def place(loc):
    where, _, near = split_loc(loc)
    if not near:
        return where
    if re.search(r"deniz|göl|körfez", where, re.IGNORECASE):
        return f"{where} · {near} açıkları"
    return f"{where} · en yakın yerleşim: {near}"


def main(first, last):
    start = dt.datetime.fromisoformat(first)                         # Türkiye saati
    end = dt.datetime.fromisoformat(last) + dt.timedelta(days=1)
    rows = fetch(start - TSI, end - TSI)
    if not rows:
        sys.exit("AFAD boş liste döndürdü.")
    for r in rows:
        r["t"] = dt.datetime.fromisoformat(r["date"]) + TSI
        r["m"] = float(r["magnitude"])
        r["lat"], r["lon"] = float(r["latitude"]), float(r["longitude"])
    newest = max(r["t"] for r in rows)

    by_prov = {}
    for r in rows:
        _, km, _ = split_loc(r["location"])
        if r["country"] == "Türkiye" and r["province"] and (km is None or km <= NEAR_KM):
            n, mx = by_prov.get(r["province"], (0, 0))
            by_prov[r["province"]] = (n + 1, max(mx, r["m"]))

    w, s, e, n = FRAME
    shown = sorted((r for r in rows if r["m"] >= MIN_MAG and w <= r["lon"] <= e and s <= r["lat"] <= n),
                   key=lambda r: (r["m"], r["t"]))
    lst = [[round(r["lat"], 3), round(r["lon"], 3), r["m"], round(float(r["depth"]), 1),
            r["t"].strftime("%Y-%m-%d %H:%M"), place(r["location"])] for r in shown]

    days = round((newest - start).total_seconds() / 86400, 2)
    out = [
        "// Türkiye Afet Haritası · Kayıtlı bir haftanın depremleri (AFAD Deprem Kataloğu)",
        "// Son Olaylar bölümü depremleri internetten canlı alır; bu kayıt yalnızca internet yokken gösterilir.",
        "// tools/afad_haftalik.py ile üretildi; elle düzenlemeyin.",
        "'use strict';",
        "",
        "const SAVED_QUAKES = {",
        f"  from: {json.dumps(start.strftime('%Y-%m-%d %H:%M'))}, to: {json.dumps(newest.strftime('%Y-%m-%d %H:%M'))}, days: {days},  // Türkiye saati",
        f"  total: {len(rows)},  // Türkiye ve çevresinde kaydedilen tüm depremler",
        f"  minMag: {MIN_MAG:g},  // haritada gösterilen en küçük büyüklük",
        "  // il, deprem sayısı, en büyük (denizdekiler en fazla " + str(NEAR_KM) + " km uzaktaki ile sayıldı)",
        "  byProv: [",
        *[f"    [{json.dumps(p, ensure_ascii=False)}, {c}, {mx:g}]," for p, (c, mx) in sorted(by_prov.items(), key=lambda kv: (-kv[1][0], kv[0]))],
        "  ],",
        "  // enlem, boylam, büyüklük, derinlik (km), Türkiye saati, yer",
        "  list: [",
        *[f"    {json.dumps(x, ensure_ascii=False)}," for x in lst],
        "  ]",
        "};",
    ]
    OUT.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"{OUT}: {len(rows)} deprem, haritada {len(lst)} (≥{MIN_MAG:g}), en büyük {max(r['m'] for r in rows):g}, son kayıt {newest:%d.%m %H:%M}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
