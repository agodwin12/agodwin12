# Fleetra Analytics : schéma animé à fond transparent (v5)

Boucle de 4 s, 30 i/s, 1920×1080 (conçue en 960×540, rendue en 2x). Le fond (couleur, grille de points, bords assombris) est retiré ; le halo orange du hub est conservé.

| Fichier | Usage |
|---|---|
| `frames/frame_000001.png` … `000120` | séquence PNG RGBA (fond alpha = 0), source de tous les encodages |
| `fleetra.webm` | web : Chrome, Firefox, Edge (VP9 + alpha) |
| `fleetra-1x.webm` | même vidéo en 960×540, rendue nativement, pour les écrans standard |
| `fleetra.mov` | montage : ProRes 4444 + alpha. **Non versionné** (~146 Mo, au-delà de la limite de 100 Mo de GitHub) : `./export.sh` le recrée |
| `fleetra-safari.mov` | Safari macOS / iOS (HEVC + alpha), **à encoder sur un Mac** (voir ci-dessous) |
| `fleetra-still.png` | image fixe transparente (état de repos), pour `prefers-reduced-motion` |
| `check-magenta.png`, `check-magenta.mp4` | contrôle : le WebM posé sur du magenta pur |
| `integration-example.html` | intégration : WebKit reçoit le HEVC, les autres le WebM ; image fixe si l'animation est réduite |

## Safari (HEVC avec alpha)

L'encodeur HEVC alpha d'Apple (VideoToolbox) n'existe que sur macOS. Sur un Mac avec ffmpeg :

```sh
./export.sh        # produit aussi fleetra-safari.mov
```

Sans ffmpeg : dans le Finder, clic droit sur `fleetra.mov` → *Actions rapides* → *Encoder les fichiers vidéo sélectionnés* → HEVC 1080p, cocher **Conserver la transparence**. Renommer le résultat en `fleetra-safari.mov`.

La vidéo est prévue pour un fond sombre : textes blancs, cartes remplies de blanc à 3 %.
