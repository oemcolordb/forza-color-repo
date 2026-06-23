---
name: forza-horizon-5-color-math
description: |
  Provides knowledge and tools for converting standard color formats (HEX/RGB) to the Forza Horizon 5 sub-tick HSB format, and vice versa. It also details physically-based rendering (PBR) material calibration, custom paint types (Metal Flake, Two-Tone, Spectraflame), and photo/Lightroom recovery settings.
  
  Use this skill when:
  - User asks to convert Hex/RGB to Forza HSB, or from Forza HSB to Hex/RGB.
  - Designing liveries or rendering paint swatches in Forza.
  - Performing color-matching, auditing color files, or working with Forza-color-repo assets.
---

# Forza Horizon 5 Color Math & Material Calibration

This skill provides the mathematical models, quantization algorithms, material properties, and calibration guidelines required to achieve perfect color and material replication inside the *Forza Horizon 5* rendering engine and external rendering environments (Unreal, Blender, etc.).

---

## 1. Digital Color Space Differences: HSB vs. HSL

*Forza Horizon 5* utilizes a cylindrical **HSB (Hue, Saturation, Brightness)** model for its paint customization UI rather than HSL (Hue, Saturation, Lightness). This is because HSB corresponds more accurately to physical paint layer properties:
* **HSB (Value/Brightness)**: $100\%$ brightness is only pure white if Saturation is simultaneously $0\%$. If Saturation is $100\%$ and Brightness is $100\%$, it represents a fully illuminated, vivid pure color.
* **HSL (Lightness)**: $100\%$ lightness *always* yields pure white, regardless of saturation, which is physically unrealistic for automotive base coats (where depth is manipulated by absorbing specific wavelengths rather than mixing white pigment).

---

## 2. Sub-Tick Quantization Mathematics

The in-game user interface displays HSB sliders as two-decimal-place values (from `0.00` to `1.00`), but the internal shader variables possess higher precision. The scale operates on an integer grid of **200 discrete steps** (intervals of `0.005`). 

Because the UI truncates this precision to two decimal places, each visible hundredth masks two distinct internal shading states:
* **Left Tick (L)**: Represents the exact hundredth (e.g., `0.54L` = `0.540`).
* **Right Tick (R)**: Represents the hundredth plus a `0.005` offset (e.g., `0.54R` = `0.545`).

### 2.1 Standard HSB/RGB to Forza Sub-Tick HSB

To convert standard, normalized $H_F, S_F, B_F \in [0, 1]$ to Forza UI and Tick coordinates:

1. Calculate the discrete integer step $N$:
   $$N = \text{round}(200 \times V)$$
   *(where $V$ is one of $H_F, S_F, B_F$)*

2. Calculate the base UI decimal $V_{UI}$:
   $$V_{UI} = \frac{\lfloor N/2 \rfloor}{100}$$

3. Determine the sub-tick parity:
   $$\text{Tick} = \begin{cases} \text{"L"} & \text{if } N \pmod 2 = 0 \\ \text{"R"} & \text{if } N \pmod 2 = 1 \end{cases}$$

4. Format the final parameter as: `[V_UI][Tick]` (e.g., `0.26L`, `0.27L`, `0.32L`).

> [!NOTE]
> For Olive Drab Green (`#46523C` / $R=70, G=82, B=60$):
> * Normalized: $H_F \approx 0.2576$, $S_F \approx 0.2683$, $B_F \approx 0.3216$.
> * Sub-tick conversion yields: **`H = 0.26L`**, **`S = 0.27L`**, **`B = 0.32L`**.

### 2.2 Forza Sub-Tick HSB to Standard HSB / RGB (Reverse Engineering)

Given a coordinate $(V_{UI}, \text{Tick})$:

1. Reconstruct the true underlying floating-point value:
   $$V_{true} = V_{UI} + \begin{cases} 0.000 & \text{if Tick} = \text{"L"} \\ 0.005 & \text{if Tick} = \text{"R"} \end{cases}$$

2. Convert to standard degree/percentage:
   $$H^\circ = H_{true} \times 360$$
   $$S_\% = S_{true} \times 100$$
   $$B_\% = B_{true} \times 100$$

3. Standard conversion formulas can then translate HSB/HSV $(H^\circ, S_\%, B_\%)$ back to RGB/HEX.

---

## 3. Paint Types & Material Calibration Guidelines

*Forza Horizon 5* exposes advanced shader parameters under the **Special Colors** interface.

### 3.1 Goniochromatism & Anisotropic Surfaces (Metal Flake & Two-Tone)
Modern metallic and pearlescent finishes exhibit color shifting (*flop*). These materials expose two color inputs:
* **Base Color (Lowlight / Absorptive Layer)**: Accessed by pressing `X`. Dictates the deep, absorptive color.
* **Highlight (Flake Color / Specular Layer)**: Accessed by pressing `Y`. Controls the color of direct specular reflection.

> [!IMPORTANT]
> **PBR Energy Conservation Rule**: Highlight brightness should generally be slightly lower than lowlight brightness (especially in Two-Tone Polished). Driving highlight saturation and brightness to $1.00$ violates energy conservation, resulting in a flat, plastic look.
>
> *Example (Midnight Purple II)*:
> * **Base Layer (X)**: $H=0.925$, $S=0.90$, $B=0.25$
> * **Flake Layer (Y)**: $H=0.10$, $S=0.90$, $B=0.35$

### 3.2 Spectraflame Workaround
Spectraflame mimics candy color over a polished zinc chassis. It is locked in-game to 12 licensed Mattel values. 
* **Workaround**: Apply **Chrome** special color as the base, then layer semi-transparent colored vinyl decals (using alpha blending) over the vehicle body to replicate the candy-over-zinc look.

### 3.3 Tinting Un-Tintable Materials (Carbon Fiber, Damascus Steel, etc.)
Composite and architectural materials (Carbon Fiber, Damascus Steel, Aluminum, Brass, Wood) default to locked grayscale or bronze states.
* **Workaround to Unlock HSB Sliders**:
  1. Apply the special material to a vehicle surface.
  2. Navigate back to the **Previous Colors** tab.
  3. Shift one position to the right.
  4. Press the `X` button. The HSB sliders will now be fully accessible, allowing you to tint the material's albedo while keeping the underlying normal map intact.

### 3.4 Simulating True Elemental Gold
True gold is highly complex due to its refractive index. Replicate it with:
* **Material**: Brass or Steel Polished
* **Hue Slider**: `0.11` to `0.14`
* **Saturation Slider**: `0.60` to `0.70`
* **Brightness Slider**: `0.60` to `0.85`

---

## 4. Physically-Based Calibration (PBC) Pipeline

Playground Games uses a specialized PBC pipeline to measure real-world paint samples:
1. **Multi-Angle Spectrophotometry**: Reflectance curves ($R_\lambda$) are captured under D65 illuminant (6500K) at 5 angles ($15^\circ$, $25^\circ$, $45^\circ$, $75^\circ$, $110^\circ$).
2. **CIE 1931 XYZ / CIELAB Integration**: The reflectance curve is integrated with human eye weights ($W_\lambda$) to yield XYZ coordinates, then transformed to CIELAB ($L^*, a^*, b^*$).
3. **Delta E Minimization**: The 8-input shader is iteratively optimized in a virtual D65 lighting environment until the total color difference across all angles ($\Delta E_{Total} = \sum_{\theta} \Delta E_\theta$) is minimized.
   * Target: $\Delta E_{Total} < 5.0$ (standard for photorealism). Automated PBC averages $\Delta E_{Total} \approx 2.4$, compared to manual hand-tuned error rates of $\approx 38.9$.

---

## 5. External Environment Replication & Photography Recovery

### 5.1 Exporting to External Engines (Unreal / Blender)
* **Shader Structure**: Use a **Layered BRDF** architecture.
* **Clearcoat**: Compute transmission/translucency in an upper layer.
* **Flake Layer**: Render metallic characteristics in a subordinate layer. Drive flakes using a high-frequency noise normal map, alpha-blended with the flake color ('Y' input).
* **Base Coat**: Define ambient occlusion and global illumination absorption using the base color ('X' input).

### 5.2 Photography & Lightroom Recovery
In-game photo mode highlights tend to clip. Re-normalize raw pixel output to match physical presentation using these settings:
* **In-Game Camera Settings**:
  * Exposure: manually adjust downward to between **$-0.5$ and $-1.0$**.
  * Shadows: lift slightly between **$+10$ and $+20$** to retain weave details.
  * Color Gamut: Export using Adobe RGB or ProPhoto RGB (avoid sRGB compression).
* **Lightroom / Post-Capture Tone Curve Settings**:
  * Highlights: drop substantially to between **$-60$ and $-85$** to recover blown specular highlights.
  * Shadows: lift between **$+25$ and $+45$** to reveal dark composite textures.
  * Texture: augment **$+20$ to $+40$** on Carbon Fiber and Matte paints, but reduce Clarity. On Chrome/Polished steel, use negative Clarity.

---

## 6. CLI Converter Script Usage

A JavaScript CLI converter is included in this skill at [color-converter.js](file:///c:/Users/xxx/Documents/GitHub/forza-color-repo/.agents/skills/forza-horizon-5-color-math/scripts/color-converter.js).

### Convert Hex/RGB to Forza Horizon 5 Sliders:
```bash
node .agents/skills/forza-horizon-5-color-math/scripts/color-converter.js to-forza "#46523C"
# OR using RGB:
node .agents/skills/forza-horizon-5-color-math/scripts/color-converter.js to-forza 70 82 60
```

### Convert Forza Horizon 5 Sliders to Hex/RGB:
```bash
node .agents/skills/forza-horizon-5-color-math/scripts/color-converter.js from-forza 0.26L 0.27L 0.32L
```

---

## 7. Reference OEM Paint Calibrations

| Manufacturer | OEM Color Name | In-Game Paint Type | Base Hue (H) | Base Sat (S) | Base Bri (B) | Flake Hue (H) | Flake Sat (S) | Flake Bri (B) |
|---|---|---|---|---|---|---|---|---|
| Abarth | Acid Green | Metal Flake | `0.19 L` | `0.70 R` | `0.97 R` | `0.18 R` | `0.95 L` | `0.90 R` |
| Abarth | Adrenaline Red | Normal | `1.00 L` | `1.00 R` | `0.96 L` | - | - | - |
| Abarth | Trofeo Grey | Metal Flake | `0.39 R` | `0.07 L` | `0.31 R` | `0.19 L` | `0.06 L` | `0.42 L` |
| Acura | Longbeach Blue | Metal Flake | `0.65 L` | `0.95 L` | `0.55 L` | `0.60 L` | `0.78 L` | `0.67 L` |
| Alfa Romeo | Arancio Pergusa | Metal Flake | `0.08 L` | `0.90 R` | `0.64 L` | `0.07 R` | `0.73 R` | `0.78 L` |
| Alfa Romeo | Avio Blue | Two-Tone Semigloss | `0.57 R` | `0.29 R` | `1.00 R` | `0.55 L` | `0.47 R` | `1.00 R` |
| Alfa Romeo | Blu Montecarlo | Metal Flake | `0.63 L` | `0.76 R` | `0.18 L` | `0.62 L` | `0.72 L` | `0.30 R` |
| Alfa Romeo | Blu Notte | Metal Flake | `0.59 L` | `0.29 R` | `0.20 R` | `0.59 L` | `0.25 L` | `0.27 R` |
| Alfa Romeo | Bordeaux Scuro | Metal Flake | `0.99 L` | `0.91 R` | `0.32 L` | `0.98 L` | `0.90 L` | `0.50 R` |
| Alfa Romeo | Cabaret Red | Metal Flake | `0.00 L` | `0.69 R` | `0.51 L` | `0.01 L` | `0.55 R` | `0.81 R` |
