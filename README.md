# نور السنة — Noor Al Sunnah

> **موسوعة الأحاديث النبوية الشريفة**  
> Application web de recherche et consultation des Hadiths Prophétiques.

🌐 **Live** : [noor-al-sunnah-production.up.railway.app](https://noor-al-sunnah-production.up.railway.app)

---

## 📌 Description

**Noor Al Sunnah** est une encyclopédie web permettant de rechercher, filtrer et sauvegarder des hadiths prophétiques. Les données proviennent de [Dorar Al-Saniyya](https://dorar.net) via l'API open-source [dorar-hadith-api](https://github.com/AhmedElTabarani/dorar-hadith-api) hébergée sur AWS EC2.

---

## 🏗️ Architecture
```
Navigateur (utilisateur)
        │  HTTPS
        ▼
┌───────────────────┐
│     Railway       │  ← server.js (Node.js natif, sans Express)
│  noor-al-sunnah   │    • sert public/ en statique
│                   │    • proxy /v1/* → EC2:80
└────────┬──────────┘
         │  HTTP
         ▼
┌───────────────────┐
│    AWS EC2        │  ← t2.micro Ubuntu
│     Nginx :80     │    reverse proxy → localhost:3000
│ dorar-hadith-api  │    Node.js + PM2
└────────┬──────────┘
         │  scraping
         ▼
┌───────────────────┐
│    dorar.net      │  ← source des hadiths
└───────────────────┘
```

---

## 🗂️ Structure du projet
```
noor-al-sunnah/
├── public/
│   ├── index.html        # SPA — page unique, 4 vues internes
│   ├── css/
│   │   └── style.css     # Thème clair/sombre, composants
│   └── js/
│       └── app.js        # Toute la logique (recherche, favoris, daily hadith...)
├── server.js             # Serveur HTTP natif — sert public/ + proxy /v1/*
├── package.json
├── .gitignore
└── README.md
```

---

## ✨ Fonctionnalités

- 📖 **Hadith du jour** — pool de 30 hadiths sahih renouvelé chaque jour
- 🔄 **Hadith suivant** — naviguer dans le pool sans appel réseau
- 🔍 **Recherche avancée** — par mot-clé avec filtres : degré (صحيح/حسن/ضعيف), livre, محدث
- 🏷️ **Recherche rapide par thème** — الصلاة، الصدق، الرحمة، العلم...
- 📖 **Shrah (شرح)** — affichage du commentaire du hadith
- 🔗 **Hadiths similaires** — depuis le détail de chaque hadith
- ❤️ **Favoris** — sauvegarde locale (localStorage)
- 📤 **Partage** — WhatsApp, Twitter, Telegram, copie
- 🌙 **Mode sombre** — détection système + toggle manuel
- 📅 **Date hijri** — affichée en temps réel dans le header

---

## ⚙️ Endpoints API utilisés

| Endpoint | Description |
|---|---|
| `GET /v1/site/hadith/search?value={q}&page={n}&removehtml=true&tab=1` | Recherche principale |
| `GET /v1/site/hadith/search?...&d[]=1` | Degré : 1=صحيح, 2=حسن, 3=ضعيف |
| `GET /v1/site/hadith/search?...&s[]={id}` | Filtrer par livre |
| `GET /v1/site/hadith/search?...&m[]={id}` | Filtrer par محدث |
| `GET /v1/site/hadith/search?...&t={zone}` | Zone : 0=مرفوعة, 1=قدسية, 2=آثار |
| `GET /v1/site/hadith/similar/{id}` | Hadiths similaires |
| `GET /v1/site/sharh/{id}` | Shrah (commentaire) |
| `GET /v1/site/mohdith/{id}` | Infos sur le محدث |

---

## ☁️ Déploiement

### API sur AWS EC2
```bash
ssh -i key.pem ubuntu@<EC2-IP>
git clone https://github.com/AhmedElTabarani/dorar-hadith-api.git
cd dorar-hadith-api
npm install
# config/config.js → CACHE_EACH = 43200 (cache 12h, anti rate-limiting)
pm2 start index.js --name dorar-api
pm2 save && pm2 startup
```

### Frontend sur Railway

1. New Project → Deploy from GitHub → `noor-al-sunnah`
2. Ajouter la variable d'environnement : `API_BASE=http://<EC2-IP>`
3. Chaque `git push main` redéploie automatiquement

---

## 📊 Analytique

Google Analytics (GA4) intégré pour le suivi des visiteurs en temps réel.

---

## 📄 Licence & Sources

- Données hadiths : [Dorar Al-Saniyya](https://dorar.net) — tous droits réservés
- API : [dorar-hadith-api](https://github.com/AhmedElTabarani/dorar-hadith-api) par Ahmed El Tabarani
- Ce projet est à but non lucratif, éducatif et religieux

---

*Développé par [Abderrahmane Ouarach](https://www.linkedin.com/in/abderrahmane-ouarach-7368051b6) — 2026*
