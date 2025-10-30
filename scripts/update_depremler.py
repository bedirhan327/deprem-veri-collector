import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import os
from datetime import datetime
from github import Github

# Ayarlar
REPO_NAME = "bedirhan327/deprem-veri-collector"  # kendi repo bilgisi
FILE_PATH = "public/data/deprem_data.json"
MAX_RECORDS = 1000

# Kandilli verisi çek
url = "http://www.koeri.boun.edu.tr/scripts/lst0.asp"
response = requests.get(url)
response.encoding = "utf-8"
soup = BeautifulSoup(response.text, "html.parser")
lines = soup.find("pre").get_text().split("\n")

data = []
for line in lines[7:]:
    parts = line.split()
    if len(parts) >= 9:
        tarih = parts[0]
        saat = parts[1]
        enlem = float(parts[2])
        boylam = float(parts[3])
        derinlik = float(parts[4])
        ml = parts[6] if parts[6] != "-.-" else None
        yer = " ".join(parts[8:-1])
        cozum = parts[-1].replace("�", "İ")  # yanlış encoding karakterlerini düzelt
        data.append({
            "Tarih": tarih,
            "Saat": saat,
            "Enlem": enlem,
            "Boylam": boylam,
            "Derinlik": derinlik,
            "ML": ml,
            "Yer": yer,
            "Cozum": cozum
        })

df_new = pd.DataFrame(data)

# Eski JSON varsa oku
if os.path.exists(FILE_PATH):
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        try:
            old_data = json.load(f)
            df_old = pd.DataFrame(old_data)
        except:
            df_old = pd.DataFrame()
else:
    df_old = pd.DataFrame()

# Birleştir, duplicate temizle
df_combined = pd.concat([df_old, df_new], ignore_index=True)
df_combined.drop_duplicates(subset=["Tarih", "Saat", "Enlem", "Boylam"], inplace=True)
df_combined['Datetime'] = pd.to_datetime(df_combined['Tarih'] + ' ' + df_combined['Saat'], errors='coerce')
df_combined.sort_values(by="Datetime", ascending=False, inplace=True)

# Sadece gerekli kolonları al (Datetime hariç)
df_limited = df_combined[["Tarih", "Saat", "Enlem", "Boylam", "Derinlik", "ML", "Yer", "Cozum"]].head(MAX_RECORDS)

# JSON kaydet
os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(df_limited.to_json(orient="records", force_ascii=False, indent=2))

# Güncel veri sayısını yazdır
print(f"📊 Güncel JSON'daki veri sayısı: {len(df_limited)}")

# GitHub push
g = Github(os.environ["GITHUB_TOKEN"])
repo = g.get_repo(REPO_NAME)
try:
    file = repo.get_contents(FILE_PATH)
    repo.update_file(
        FILE_PATH,
        f"Auto update {datetime.now()}",
        df_limited.to_json(orient="records", force_ascii=False, indent=2),
        file.sha,
        branch="main"
    )
    print("✅ JSON dosyası güncellendi ve pushlandı.")
except:
    repo.create_file(
        FILE_PATH,
        f"First upload {datetime.now()}",
        df_limited.to_json(orient="records", force_ascii=False, indent=2),
        branch="main"
    )
    print("✅ JSON dosyası oluşturuldu ve pushlandı.")
