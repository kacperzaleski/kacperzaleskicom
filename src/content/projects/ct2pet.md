---
title: CT-to-PET translation on autoPET
tagline: "Generating PET from CT: an ablation of diffusion and flow models in latent and pixel space"
status: archived # finished; shown as "Completed"
featured: true
tags: [PyTorch, diffusion models, flow matching, medical imaging, MONAI]
screenshot: thesis/figures/qualitative_short.png
screenshot_fit: contain
screenshot_alt: Grid of CT slices next to PET predictions from several models (posterior mean, CPDM, concat-diffusion, concat-flow, PMRF) and the ground-truth PET
# German texts (TODO(kacper): review). Missing fields fall back to English.
de:
  title: CT-zu-PET-Übersetzung auf autoPET
  tagline: "PET aus CT erzeugen: Ablation von Diffusions- und Flow-Modellen im latenten und im Pixelraum"
  screenshot_alt: Raster aus CT-Schnitten neben PET-Vorhersagen mehrerer Modelle (Posterior Mean, CPDM, Concat-Diffusion, Concat-Flow, PMRF) und der echten PET-Aufnahme
  body: >-
    Die Aufgabe: aus CT-Aufnahmen des autoPET-Datensatzes die zugehörigen
    PET-Bilder erzeugen. Ich habe dafür eine Ablation verschiedener
    Konfigurationen von Diffusions- und Flow-Modellen im latenten und im
    Pixelraum durchgeführt: das latente Diffusionsmodell CPDM (WACV 2025), eine
    einfachere konditionierte latente Diffusion und zwei Rectified-Flow-Modelle
    im Pixelraum, darunter Posterior-Mean Rectified Flow (PMRF), mit einem
    Posterior-Mean-U-Net als Referenz. Dazu habe ich meine Bachelorarbeit an
    der JKU geschrieben.
---

The task: generate the matching PET image from a CT scan, on the autoPET
dataset. I ran an ablation of diffusion and flow model configurations in latent
and pixel space: the CPDM latent diffusion model (WACV 2025), a simpler
conditioned latent diffusion, and two rectified-flow models in pixel space,
including posterior-mean rectified flow (PMRF), with a posterior-mean U-Net as
reference. I wrote my bachelor's thesis at JKU on this work.
