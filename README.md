# Interaktivní mapa cest Hanzelky a Zikmunda 🗺️🚗📷

Tento projekt poskytuje interaktivní webovou aplikaci a mapovou vizualizaci cest legendárních československých cestovatelů **Jiřího Hanzelky** a **Miroslava Zikmunda**.

Mapa zachycuje kompletní trasu obou jejich nejslavnějších výprav po světě včetně historických detailů, fotografií, popisu zastávek a specifikací vozidel.

---

## 🌟 Hlavní funkce aplikace

- **První výprava (1947–1950)**:
  - Trasa napříč Afrikou, Jižní a Střední Amerikou ve stříbrném proudnicovém voze **Tatra 87**.
  - Zahrnuje ikony jako Casablanca, Cheopsovu pyramidu v Gíze, Kilimandžáro, Viktoriiny vodopády, Kapské Město, Machu Picchu a další.
- **Druhá výprava (1959–1964)**:
  - Trasa přes Blízký východ, Asii, Oceánii, Japonsko a Sovětský svaz ve dvou terénních speciálech **Tatra 805**.
  - Obsahuje zastávky v Istanbulu, Tádž Mahalu, na Bali, Fudži či u zimního jezera Bajkal.
- **Interaktivní mapa (Leaflet.js)**:
  - Barevně odlišené linie tras a vlastní značky zastávek.
  - Vyskakovací okna (popups) s popisem událostí a historickými fotografiemi.
- **Interaktivní časová osa a přehrávač cesty**:
  - Tlačítko pro automatické animované procházení zastávek krok za krokem.
- **Filtrace a vyhledávání**:
  - Filtrování podle konkrétní expedice nebo vyhledávání konkrétních měst, zemí či dat.
- **Historický kontext a galeriový prohlížeč**:
  - Informační okno o Hanzelkovi a Zikmundovi i podrobných technických parametrech vozů Tatra 87 a Tatra 805.

---

## 🚀 Jak aplikaci spustit lokálně

Aplikace nevyžaduje žádné složité buildovací nástroje ani závislosti. Stačí mít jakýkoliv lokální webový server.

### Možnost A: Python HTTP Server

```bash
# V kořenovém adresáři projektu spustit:
python3 -m http.server 8000
```
Poté otevřete ve svém prohlížeči adresu: `http://localhost:8000`

### Možnost B: Node.js http-server / npx

```bash
npx http-server -p 8000
```

---

## 📂 Struktura projektu

```text
.
├── index.html              # Hlavní HTML struktura aplikace
├── css/
│   └── styles.css          # Moderní CSS styly a responzivní rozvržení
├── js/
│   └── app.js              # Logika mapy Leaflet, filtry, časová osa
├── data/
│   └── journeys.json       # Geografická data zastávek, popisky, fotky
├── images/
│   └── photos/             # Historické fotografie z výprav
├── /home/jules/self_created_tools/
│   └── validate_journey_data.py # Skript pro validaci formátu dat
└── README.md               # Dokumentace
```

---

## 🌐 Publikování na GitHub Pages

Projekt je navržen tak, aby jej bylo možné okamžitě nasadit zdarma na **GitHub Pages**:

1. Nahrajte tento repozitář na váš GitHub účet.
2. V nastavení repozitáře (**Settings -> Pages**) vyberte jako zdroj větev `main` (nebo `master`) a složku `/ (root)`.
3. Během několika sekund bude vaše mapa dostupná online na adrese: `https://<vase-jmeno>.github.io/<nazev-repozitare>/`.

---

## 🗺️ Přidané fotografie ke klíčovým zastávkám v Africe (Tatra 87)

- **Casablanca (Maroko)**
![Casablanca](images/photos/LUH8fd265_profimedia_0157444413.jpg)

1. **Průjezd Atlasem a skalnatými kaňony v Severní Africe**
![Průjezd Atlasem](images/photos/4826375.webp)

2. **Průjezd Saharou a vyprošťování auta ze závějí písku**
![Průjezd Saharou](images/photos/03964138.jpeg)

- **Káhira a Gíza (Egypt)**
![Káhira a Gíza](images/photos/kdo-byli-zikmund-a-hanzelka3-770x578-2032416904.jpg)

3. **Ostrý kamenný terén a pouštní reg**
![Ostrý kamenný terén](images/photos/76767a2cff7f31e1bfc17319fa1e08be.jpg)

4. **Nocování v savaně / setkání s místními obyvateli u auta s moskytiérou**
![Nocování v savaně](images/photos/05-h-20-2b-20z-20-2833-29-20-284-29.jpg)

5. **Přebrodění řeky a kamenitého koryta v buši**
![Přebrodění řeky](images/photos/02-h-20-2b-20z-20-2833-29-20-281-29.jpg)

6. **Průjezd pralesem a setkání s kmenem Pygmejů ve Střední Africe**
![Průjezd pralesem](images/photos/2131012.webp)

- **Kapské Město (Jihoafrická republika)**
![Kapské Město](images/photos/01-h-20-2b-20z-20-2833-29-20-285-29.jpg)

---

## 🗺️ Přidané fotografie ke zastávkám v Jižní a Střední Americe (Tatra 87)

- **Rio de Janeiro (Brazílie)**
![Rio de Janeiro](images/photos/titul-1.jpg)

- **Buenos Aires (Argentina)**
![Buenos Aires](images/photos/1a.jpg)

- **San Carlos de Bariloche (Argentina)**
![San Carlos de Bariloche](images/photos/MBB558cd5_hz6.jpg)

- **Santiago de Chile (Chile)**
![Santiago de Chile](images/photos/a696f4a4259c35aea95a3e73e49c7244_resize=680,540_.jpg)

- **La Paz a Jezero Titicaca (Bolívie)**
![La Paz a Jezero Titicaca](images/photos/109a.jpg)

- **Machu Picchu a Lima (Peru)**
![Machu Picchu a Lima](images/photos/kniha-Zikmund-HAnzelka-Pr%CC%86es-Kordillery-6.jpg)

- **Quito (Ekvádor)**
![Quito](images/photos/113a.jpg)

- **Bogota (Kolumbie)**
![Bogota](images/photos/anzelka_zikmund_profimedia-0157444413_oqjharg.jpg)

- **Panama City (Panama)**
![Panama City](images/photos/hanzelka-a-zikmund_photo-_c_-muzeum-jihovychodni-moravy-ve-zline--archiv-h-z..webp)

---

## 📷 Licenční informace k fotografiím

Použité fotografie pocházejí z volně přístupných zdrojů Wikimedia Commons v souladu s licencemi Creative Commons a Public Domain.
