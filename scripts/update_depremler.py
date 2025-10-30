import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import os
from datetime import datetime
from github import Github

# Ayarlar
REPO_NAME = "bedirhan327/deprem-veri-collector"
FILE_PATH = "public/data/deprem_data.json"
MAX_RECORDS = 1000

# ---------- Kandilli Verisi ----------
url_kandilli = "http://www.koeri.boun.edu.tr/scripts/lst0.asp"
response = requests.get(url_kandilli)
response.encoding = "utf-8"
soup = BeautifulSoup(response.text, "html.parser")
lines = soup.find("pre").get_text().split("\n")

data_kandilli = []
for line in lines[7:]:
    parts = line.split()
    if len(parts) >= 9:
        tarih = parts[0]
        saat = parts[1]
        enlem = float(parts[2])
        boylam = float(parts[3])
        derinlik = parts[4]
        ml = parts[6] if parts[6] != "-.-" else None
        yer = " ".join(parts[8:-1])
        cozum = parts[-1].replace("�", "İ")
        data_kandilli.append({
            "Tarih": tarih,
            "Saat": saat,
            "Enlem": enlem,
            "Boylam": boylam,
            "Derinlik": derinlik,
            "ML": ml,
            "Yer": yer,
            "Cozum": cozum,
            "Kaynak": "Kandilli"
        })

df_kandilli = pd.DataFrame(data_kandilli)

# ---------- AFAD Verisi ----------
url_afad = "https://deprem.afad.gov.tr/last-earthquakes.json"  # örnek URL
response_afad = requests.get(url_afad)
data_afad = response_afad.json()

data_afad_list = []
for item in data_afad.get("earthquakes", []):
    tarih_saat = datetime.utcfromtimestamp(item["timestamp"]).strftime("%Y-%m-%d %H:%M:%S").split()
    tarih = tarih_saat[0]
    saat = tarih_saat[1]
    data_afad_list.append({
        "Tarih": tarih,
        "Saat": saat,
        "Enlem": float(item["latitude"]),
        "Boylam": float(item["longitude"]),
        "Derinlik": item.get("depth", ""),
        "ML": item.get("ml", None),
        "Yer": item.get("location", ""),
        "Cozum": "",
        "Kaynak": "AFAD"
    })

df_afad = pd.DataFrame(data_afad_list)

# ---------- Eski JSON oku ----------
if os.path.exists(FILE_PATH):
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        try:
            old_data = json.load(f)
            df_old = pd.DataFrame(old_data)
        except:
            df_old = pd.DataFrame()
else:
    df_old = pd.DataFrame()

# ---------- Birleştirme ----------
df_combined = pd.concat([df_old, df_kandilli, df_afad], ignore_index=True)
df_combined['Datetime'] = pd.to_datetime(df_combined['Tarih'] + ' ' + df_combined['Saat'], errors='coerce')

# En hızlı bildirilen kaynağı seç (datetime küçük olan önce)
df_combined.sort_values(by="Datetime", inplace=True)
df_final = df_combined.drop_duplicates(subset=["Tarih", "Saat", "Enlem", "Boylam"], keep="first")

# Sadece gerekli kolonları al ve limite düşür
df_final = df_final[["Tarih", "Saat", "Enlem", "Boylam", "Derinlik", "ML", "Yer", "Cozum", "Kaynak"]].head(MAX_RECORDS)

# JSON kaydet
os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(df_final.to_json(orient="records", force_ascii=False, indent=2))

# ---------- Log ----------
print(f"📊 Güncel JSON'daki veri sayısı: {len(df_final)}")
print("📝 Son 5 deprem örneği:")
print(df_final.head(5).to_dict(orient="records"))

# ---------- GitHub push ----------
g = Github(os.environ["GITHUB_TOKEN"])
repo = g.get_repo(REPO_NAME)
try:
    file = repo.get_contents(FILE_PATH)
    repo.update_file(
        FILE_PATH,
        f"Auto update {datetime.now()}",
        df_final.to_json(orient="records", force_ascii=False, indent=2),
        file.sha,
        branch="main"
    )
    print("✅ JSON dosyası güncellendi ve pushlandı.")
except:
    repo.create_file(
        FILE_PATH,
        f"First upload {datetime.now()}",
        df_final.to_json(orient="records", force_ascii=False, indent=2),
        branch="main"
    )
    print("✅ JSON dosyası oluşturuldu ve pushlandı.")
