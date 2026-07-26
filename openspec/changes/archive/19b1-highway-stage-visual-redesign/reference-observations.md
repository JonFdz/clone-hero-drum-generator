# Planning Reference Observations

## Purpose

Several user-supplied screenshots were reviewed during planning. They are **planning-only inputs** and are intentionally not copied into this OpenSpec or the repository.

This document records only abstract, non-proprietary observations useful for an original implementation. It does not authorize reproducing any screenshot, artwork, texture, mesh, iconography, UI layout, or branded visual identity.

## Observed high-level direction

### 1. Negative space creates focus

The reference composition places a relatively narrow highway in a broad, dark field. The empty space is intentional: it makes the road and incoming notes read as a stage/gameplay surface instead of a dashboard.

**Translation for this repository:** constrain and center the road viewport on wide canvases.

### 2. The target row is compact

Targets are low-profile, dark-centered, and color-outlined. Their role is to anchor lane identity without becoming large colored UI cards.

**Translation for this repository:** use dark interiors and controlled colored outlines/highlights for four pitched targets.

### 3. Note silhouettes carry meaning

Different note classes are readable through silhouette and controlled depth treatment, not only through flat color.

**Translation for this repository:** preserve square/pitched and circular/cymbal silhouettes; add original procedural depth cues only.

### 4. Perspective is deliberate

The road has a focused vanishing area, generous near field, and smooth compression of distant objects.

**Translation for this repository:** make camera landmarks and depth projection profile-driven, monotonic, and bounded.

### 5. Technical overlays are quiet

When performance or timing text exists, it is peripheral and visually subordinate.

**Translation for this repository:** default HUD off; when enabled, render compactly in a corner with low visual weight.

## Reference-to-requirement mapping

| Planning observation | Original implementation requirement |
|---|---|
| Narrow highway centered in broad dark frame | Controlled scene viewport with max width and side negative space |
| Compact colored receiver pads | Four dark interior targets with lane-color outlines/highlights |
| Strong perspective | Profile-owned horizon/hit-line ratios and monotonic depth curve |
| Distinct note forms | Original square/prism and disc/ring treatments |
| Orange horizontal kick markers | Separate thin road-contained orange kick rail and sustain band |
| Quiet debug text | HUD off by default; compact optional corner overlay |

## Repository documentation deliverables

The implementation must create the following durable project documents:

```text
docs/reference/highway-stage-visual-language.md
docs/reference/highway-stage-visual-validation.md
```

They must contain original textual/design guidance and validation criteria. They must not embed, copy, or redistribute the planning screenshots unless the user separately provides explicit rights and asks for that exact repository change.
