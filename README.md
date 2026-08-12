# louparisot-site

Site portfolio de Lou Parisot. Site statique (HTML/CSS/JS, sans build), pensé pour GitHub Pages.

## Structure

- `index.html`, `portfolio.html`, `texts.html`, `about.html`, `contact.html`, `news.html` — les 6 pages du site.
- `css/style.css` — styles.
- `js/gallery.js`, `js/entries.js` — chargent le contenu des pages depuis `data/*.json`.
- `data/gallery.json` — liste des œuvres (image, titre, année, technique, légende) affichées sur l'accueil.
- `data/news.json` — actualités / expositions.
- `data/texts.json` — extraits de textes presse + liens PDF.
- `images/` — toutes les photos d'œuvres (dépose-les ici).
- `assets/pdf/` — portfolio PDF et PDF des textes presse.

## Ajouter une image à la galerie

1. Dépose le fichier image dans `images/`.
2. Ajoute une entrée dans `data/gallery.json` :

```json
{
  "src": "images/nom-du-fichier.jpg",
  "title": "Titre de l'œuvre",
  "year": "2024",
  "medium": "Technique / matériaux",
  "caption": "Légende ou description courte."
}
```

## Ajouter une actu ou un texte presse

Même principe dans `data/news.json` ou `data/texts.json`.

## Portfolio

Remplace `assets/pdf/portfolio.pdf` par le fichier réel (même nom, ou mets à jour le lien dans `portfolio.html`).
