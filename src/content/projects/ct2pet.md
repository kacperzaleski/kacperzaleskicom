---
title: CT-to-PET translation with diffusion
tagline: Synthesising PET scans from CT with a Brownian-bridge diffusion model (CPDM) on the autoPET dataset
status: wip # TODO(kacper): confirm
featured: true
tags: [PyTorch, diffusion models, medical imaging, MONAI]
screenshot: thesis/figures/qualitative_short.png
screenshot_fit: contain
screenshot_alt: Grid of CT slices next to PET predictions from several models (posterior mean, CPDM, concat-diffusion, concat-flow, PMRF) and the ground-truth PET
---

Reimplementation of the WACV 2025 paper "CT to PET Translation: A Large-scale
Dataset and Domain-Knowledge-Guided Diffusion Approach" on the autoPET challenge
data: attention-map UNet, VQGAN and Brownian-bridge diffusion in latent space.
Basis of my bachelor's thesis at JKU.
