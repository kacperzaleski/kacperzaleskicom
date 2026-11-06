---
title: CT-to-PET translation with diffusion
tagline: Synthesising PET scans from CT with a Brownian-bridge diffusion model (CPDM) on the autoPET dataset
status: archived # finished; shown as "Completed"
featured: true
tags: [PyTorch, diffusion models, medical imaging, MONAI]
screenshot: thesis/figures/qualitative_short.png
screenshot_fit: contain
screenshot_alt: Grid of CT slices next to PET predictions from several models (posterior mean, CPDM, concat-diffusion, concat-flow, PMRF) and the ground-truth PET
# German texts (TODO(kacper): review). Missing fields fall back to English.
de:
  title: CT-zu-PET-Übersetzung mit Diffusion
  tagline: Synthese von PET-Aufnahmen aus CT mit einem Brownian-Bridge-Diffusionsmodell (CPDM) auf autoPET
  screenshot_alt: Raster aus CT-Schnitten neben PET-Vorhersagen mehrerer Modelle (Posterior Mean, CPDM, Concat-Diffusion, Concat-Flow, PMRF) und der echten PET-Aufnahme
  body: >-
    Reimplementierung des WACV-2025-Papers "CT to PET Translation: A
    Large-scale Dataset and Domain-Knowledge-Guided Diffusion Approach" auf den
    Daten der autoPET-Challenge: Attention-Map-UNet, VQGAN und
    Brownian-Bridge-Diffusion im latenten Raum. Grundlage meiner Bachelorarbeit
    an der JKU.
---

Reimplementation of the WACV 2025 paper "CT to PET Translation: A Large-scale
Dataset and Domain-Knowledge-Guided Diffusion Approach" on the autoPET challenge
data: attention-map UNet, VQGAN and Brownian-bridge diffusion in latent space.
Basis of my bachelor's thesis at JKU.
