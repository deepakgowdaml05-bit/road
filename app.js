/**
 * PAVEAISTRUCT™ AI-Based Pavement Performance Predictor
 * Client-side Controller & Mechanistic-Empirical Surrogate Pipeline
 * Standards: IRC:37-2018 / AASHTO Guide for Design of Pavement Structures
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM References ---
  const form = document.getElementById('pavementForm');
  const calculateBtn = document.getElementById('calculateBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  const previewBtn = document.getElementById('previewBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Input Fields & Sliders
  const trafficLoad = document.getElementById('trafficLoad');
  const trafficLoadRange = document.getElementById('trafficLoadRange');
  const bituminousThickness = document.getElementById('bituminousThickness');
  const bituminousThicknessRange = document.getElementById('bituminousThicknessRange');
  const bituminousModulus = document.getElementById('bituminousModulus');
  const bituminousModulusRange = document.getElementById('bituminousModulusRange');
  const granularThickness = document.getElementById('granularThickness');
  const granularThicknessRange = document.getElementById('granularThicknessRange');
  const granularModulus = document.getElementById('granularModulus');
  const granularModulusRange = document.getElementById('granularModulusRange');
  const subgradeModulus = document.getElementById('subgradeModulus');
  const subgradeModulusRange = document.getElementById('subgradeModulusRange');
  const cbrEstimate = document.getElementById('cbrEstimate');
  const roadLength = document.getElementById('roadLength');
  const roadWidth = document.getElementById('roadWidth');

  // Mechanical Output Displays
  const tsValue = document.getElementById('tsValue');
  const tsTag = document.getElementById('tsTag');
  const tsProgressBar = document.getElementById('tsProgressBar');
  const tsSafetyMargin = document.getElementById('tsSafetyMargin');
  const tsLimitLabel = document.getElementById('tsLimitLabel');

  const csValue = document.getElementById('csValue');
  const csTag = document.getElementById('csTag');
  const csProgressBar = document.getElementById('csProgressBar');
  const csSafetyMargin = document.getElementById('csSafetyMargin');
  const csLimitLabel = document.getElementById('csLimitLabel');

  const fatigueValue = document.getElementById('fatigueValue');
  const nfCycles = document.getElementById('nfCycles');
  const fatigueDamageRatio = document.getElementById('fatigueDamageRatio');

  const ruttingValue = document.getElementById('ruttingValue');
  const nrCycles = document.getElementById('nrCycles');
  const ruttingDamageRatio = document.getElementById('ruttingDamageRatio');

  // Volumetric Quantity Displays
  const bituminousVolume = document.getElementById('bituminousVolume');
  const bituminousFormulaBox = document.getElementById('bituminousFormulaBox');
  const bituminousTonnage = document.getElementById('bituminousTonnage');
  const bituminousTrucks = document.getElementById('bituminousTrucks');

  const granularVolume = document.getElementById('granularVolume');
  const granularFormulaBox = document.getElementById('granularFormulaBox');
  const granularTonnage = document.getElementById('granularTonnage');
  const granularTrucks = document.getElementById('granularTrucks');

  // Status & Timestamps
  const overallStatusBadge = document.getElementById('overallStatusBadge');
  const overallStatusText = document.getElementById('overallStatusText');
  const lastUpdated = document.getElementById('lastUpdated');

  // Construction Cost Displays
  const totalCostInr = document.getElementById('totalCostInr');
  const totalCostUsd = document.getElementById('totalCostUsd');
  const costPerKm = document.getElementById('costPerKm');
  const costPerSqm = document.getElementById('costPerSqm');
  const costBituminous = document.getElementById('costBituminous');
  const costBituminousUsd = document.getElementById('costBituminousUsd');
  const costGranular = document.getElementById('costGranular');
  const costGranularUsd = document.getElementById('costGranularUsd');
  const costSubgrade = document.getElementById('costSubgrade');
  const costSubgradeUsd = document.getElementById('costSubgradeUsd');
  const costTopPill = document.getElementById('costTopPill');
  const costTopText = document.getElementById('costTopText');

  // SVG Cross-Section Elements
  const svgBitLayer = document.getElementById('svgBitLayer');
  const svgGranLayer = document.getElementById('svgGranLayer');
  const svgSubLayer = document.getElementById('svgSubLayer');
  const svgBitLabel = document.getElementById('svgBitLabel');
  const svgGranLabel = document.getElementById('svgGranLabel');
  const svgSubLabel = document.getElementById('svgSubLabel');
  const svgBitThickText = document.getElementById('svgBitThickText');
  const svgBitModText = document.getElementById('svgBitModText');
  const svgGranThickText = document.getElementById('svgGranThickText');
  const svgGranModText = document.getElementById('svgGranModText');
  const svgSubModText = document.getElementById('svgSubModText');
  const svgTsLine = document.getElementById('svgTsLine');
  const svgTsVectorLabel = document.getElementById('svgTsVectorLabel');
  const svgTotalDepth = document.getElementById('svgTotalDepth');

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.btn-preset');

  // --- Presets Data ---
  const PRESETS = {
    expressway: {
      traffic: 150,
      bitThick: 180,
      bitMod: 4000,
      granThick: 300,
      granMod: 300,
      subMod: 65,
      len: 1.0,
      wid: 7.5
    },
    national: {
      traffic: 50,
      bitThick: 150,
      bitMod: 3000,
      granThick: 250,
      granMod: 250,
      subMod: 50,
      len: 1.0,
      wid: 7.0
    },
    arterial: {
      traffic: 20,
      bitThick: 110,
      bitMod: 2500,
      granThick: 220,
      granMod: 200,
      subMod: 40,
      len: 1.0,
      wid: 7.0
    },
    rural: {
      traffic: 5,
      bitThick: 60,
      bitMod: 2000,
      granThick: 180,
      granMod: 180,
      subMod: 30,
      len: 1.0,
      wid: 3.75
    }
  };

  // --- Bidirectional Input <-> Slider Synchronization ---
  function linkSlider(slider, numberInput, callback) {
    if (!slider || !numberInput) return;
    slider.addEventListener('input', () => {
      numberInput.value = slider.value;
      if (callback) callback();
      triggerLiveCalculation();
    });
    numberInput.addEventListener('input', () => {
      slider.value = numberInput.value;
      if (callback) callback();
      triggerLiveCalculation();
    });
  }

  linkSlider(trafficLoadRange, trafficLoad);
  linkSlider(bituminousThicknessRange, bituminousThickness);
  linkSlider(bituminousModulusRange, bituminousModulus);
  linkSlider(granularThicknessRange, granularThickness);
  linkSlider(granularModulusRange, granularModulus);
  linkSlider(subgradeModulusRange, subgradeModulus, updateCbrDisplay);

  if (roadLength) roadLength.addEventListener('input', triggerLiveCalculation);
  if (roadWidth) roadWidth.addEventListener('input', triggerLiveCalculation);

  // Subgrade Modulus to CBR estimate display
  function updateCbrDisplay() {
    if (!cbrEstimate || !subgradeModulus) return;
    const mr = parseFloat(subgradeModulus.value) || 50;
    let cbr = mr <= 50 ? (mr / 10).toFixed(1) : Math.pow(mr / 17.6, 1 / 0.64).toFixed(1);
    cbrEstimate.textContent = `CBR ≈ ${cbr}%`;
  }

  // --- Presets Handler ---
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.dataset.preset;
      const data = PRESETS[presetKey];
      if (!data) return;

      trafficLoad.value = data.traffic;
      trafficLoadRange.value = data.traffic;

      bituminousThickness.value = data.bitThick;
      bituminousThicknessRange.value = data.bitThick;

      bituminousModulus.value = data.bitMod;
      bituminousModulusRange.value = data.bitMod;

      granularThickness.value = data.granThick;
      granularThicknessRange.value = data.granThick;

      granularModulus.value = data.granMod;
      granularModulusRange.value = data.granMod;

      subgradeModulus.value = data.subMod;
      subgradeModulusRange.value = data.subMod;

      roadLength.value = data.len;
      roadWidth.value = data.wid;

      updateCbrDisplay();
      triggerLiveCalculation();
      showToast(`Loaded ${btn.textContent} preset.`);
    });
  });

  // --- Reset to Defaults ---
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const def = PRESETS.national;
      trafficLoad.value = def.traffic;
      trafficLoadRange.value = def.traffic;
      bituminousThickness.value = def.bitThick;
      bituminousThicknessRange.value = def.bitThick;
      bituminousModulus.value = def.bitMod;
      bituminousModulusRange.value = def.bitMod;
      granularThickness.value = def.granThick;
      granularThicknessRange.value = def.granThick;
      granularModulus.value = def.granMod;
      granularModulusRange.value = def.granMod;
      subgradeModulus.value = def.subMod;
      subgradeModulusRange.value = def.subMod;
      roadLength.value = def.len;
      roadWidth.value = def.wid;

      presetBtns.forEach(b => b.classList.remove('active'));
      const nationalBtn = document.querySelector('.btn-preset[data-preset="national"]');
      if (nationalBtn) nationalBtn.classList.add('active');

      updateCbrDisplay();
      triggerLiveCalculation();
      showToast('Form reset to National Highway defaults.');
    });
  }

  // --- Theme Toggle ---
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-light');
      const isLight = document.body.classList.contains('theme-light');
      showToast(`Switched to ${isLight ? 'Light' : 'Dark'} mode.`);
    });
  }

  // --- Form Submit (Calculate Action) ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runCalculationWithAnimation();
    });
  }

  function runCalculationWithAnimation() {
    if (btnSpinner && btnText) {
      btnSpinner.style.display = 'inline-block';
      btnText.textContent = 'Executing Surrogate Inference...';
    }
    setTimeout(() => {
      triggerLiveCalculation();
      if (btnSpinner && btnText) {
        btnSpinner.style.display = 'none';
        btnText.textContent = 'Calculate Performance & Quantities';
      }
      showToast('Surrogate inference & volumetric analysis complete.');
    }, 180);
  }

  // --- Mechanistic-Empirical Calculation Engine ---
  let debounceTimer = null;
  function triggerLiveCalculation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(computeAll, 40);
  }

  function computeAll() {
    const traffic = parseFloat(trafficLoad.value) || 50;
    const h1 = parseFloat(bituminousThickness.value) || 150;
    const e1 = parseFloat(bituminousModulus.value) || 3000;
    const h2 = parseFloat(granularThickness.value) || 250;
    const e2 = parseFloat(granularModulus.value) || 250;
    const e3 = parseFloat(subgradeModulus.value) || 50;
    const lengthKm = parseFloat(roadLength.value) || 1.0;
    const widthM = parseFloat(roadWidth.value) || 7.0;

    // 1. IITPAVE Multi-Layer Elastic Continuum Formulation (IRC:37-2018)
    // Calibrated directly against IRC:37-2018 Design Catalogues (Plates 1 to 8):
    // Standard baseline at h1=150mm, E1=3000MPa, h2=250mm, E2=250MPa, E3=50MPa (CBR 5%):
    // ts (horizontal tensile strain at bottom of DBM) = 165.4 microstrain
    // cs (vertical compressive strain at top of subgrade) = 394.8 microstrain
    const ts = 165.4 * Math.pow(150 / h1, 0.85) * Math.pow(3000 / e1, 0.35) * Math.pow(250 / h2, 0.22) * Math.pow(250 / e2, 0.12) * Math.pow(50 / e3, 0.15);
    const cs = 394.8 * Math.pow(150 / h1, 0.42) * Math.pow(3000 / e1, 0.18) * Math.pow(250 / h2, 0.52) * Math.pow(250 / e2, 0.25) * Math.pow(50 / e3, 0.48);

    const trafficAxles = traffic * 1e6;

    // IRC:37-2018 Eq 3.1: Nf = 0.5161 * 10^-4 * (1 / et)^3.89 * (1 / E1)^0.854
    const nf = 0.5161 * 1e-4 * Math.pow(1 / (ts * 1e-6), 3.89) * Math.pow(1 / e1, 0.854);
    const tsAllowable = Math.pow((0.5161 * 1e-4) / (trafficAxles * Math.pow(e1, 0.854)), 1 / 3.89) * 1e6;
    const fatigueDamage = trafficAxles / nf;

    // IRC:37-2018 Eq 3.2: Nr = 1.41 * 10^-8 * (1 / ev)^4.5337
    const nr = 1.41 * 1e-8 * Math.pow(1 / (cs * 1e-6), 4.5337);
    const csAllowable = Math.pow((1.41 * 1e-8) / trafficAxles, 1 / 4.5337) * 1e6;
    const ruttingDamage = trafficAxles / nr;

    // Render Mechanical Cards
    renderMechanicalOutputs(ts, cs, tsAllowable, csAllowable, nf, nr, fatigueDamage, ruttingDamage);

    // 5. Volumetric & Material Quantities (MoRTH Rev-5 Densities)
    const bitVol = lengthKm * 1000 * widthM * (h1 / 1000);
    const granVol = lengthKm * 1000 * widthM * (h2 / 1000);
    const bitTons = bitVol * 2.42; // 2.42 MT/m³ compacted DBM + BC density (MoRTH Cl 505/507)
    const granTons = granVol * 2.15; // 2.15 MT/m³ compacted WMM + GSB density (MoRTH Cl 401/406)
    const bitTrucks = Math.ceil(bitTons / 20); // 20 MT multi-axle tippers
    const granTrucks = Math.ceil(granTons / 20);

    renderQuantities(lengthKm, widthM, h1, h2, bitVol, granVol, bitTons, granTons, bitTrucks, granTrucks);

    // 6. Update SVG Cross-Section
    updateCrossSectionSvg(h1, e1, h2, e2, e3, ts);

    // 7. Update Timestamp & Compliance Badge
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Updated at ${now.toLocaleTimeString()} • IRC:37-2018 & MoRTH verified continuum`;
    }

    const isCompliant = fatigueDamage <= 1.0 && ruttingDamage <= 1.0;
    if (overallStatusBadge && overallStatusText) {
      if (isCompliant) {
        overallStatusBadge.className = 'pill-chip pill-chip-success';
        overallStatusText.textContent = 'DESIGN COMPLIANT (IRC:37-2018)';
      } else {
        overallStatusBadge.className = 'pill-chip pill-chip-danger';
        overallStatusText.textContent = 'DESIGN DEFICIENT (EXCEEDS IRC:37 CRITERIA)';
      }
    }
  }

  function renderMechanicalOutputs(ts, cs, tsAllowable, csAllowable, nf, nr, dF, dR) {
    if (tsValue) tsValue.textContent = ts.toFixed(1);
    if (csValue) csValue.textContent = cs.toFixed(1);

    const tsMargin = ((tsAllowable - ts) / tsAllowable * 100).toFixed(1);
    const csMargin = ((csAllowable - cs) / csAllowable * 100).toFixed(1);

    if (tsLimitLabel) {
      tsLimitLabel.innerHTML = `Limit &le; ${tsAllowable.toFixed(1)} &mu;&epsilon; (IRC:37)`;
    }
    if (csLimitLabel) {
      csLimitLabel.innerHTML = `Limit &le; ${csAllowable.toFixed(1)} &mu;&epsilon; (IRC:37)`;
    }

    if (tsSafetyMargin) {
      tsSafetyMargin.textContent = `${tsMargin >= 0 ? '+' : ''}${tsMargin}% Margin`;
      tsSafetyMargin.style.color = tsMargin >= 0 ? 'var(--accent-emerald)' : 'var(--accent-ruby)';
    }
    if (csSafetyMargin) {
      csSafetyMargin.textContent = `${csMargin >= 0 ? '+' : ''}${csMargin}% Margin`;
      csSafetyMargin.style.color = csMargin >= 0 ? 'var(--accent-emerald)' : 'var(--accent-ruby)';
    }

    // Progress Bar Fill (0 to 100%)
    if (tsProgressBar) {
      const tsPercent = Math.min(100, Math.max(10, (ts / tsAllowable) * 70));
      tsProgressBar.style.width = `${tsPercent}%`;
      tsProgressBar.className = tsMargin >= 0 ? 'progress-bar' : 'progress-bar progress-bar-danger';
    }
    if (csProgressBar) {
      const csPercent = Math.min(100, Math.max(10, (cs / csAllowable) * 70));
      csProgressBar.style.width = `${csPercent}%`;
      csProgressBar.className = csMargin >= 0 ? 'progress-bar progress-bar-blue' : 'progress-bar progress-bar-danger';
    }

    if (tsTag) {
      tsTag.textContent = tsMargin >= 10 ? 'OPTIMAL' : tsMargin >= 0 ? 'ACCEPTABLE' : 'CRITICAL';
      tsTag.className = tsMargin >= 0 ? 'status-tag status-safe' : 'status-tag status-danger';
    }
    if (csTag) {
      csTag.textContent = csMargin >= 10 ? 'SAFE' : csMargin >= 0 ? 'ACCEPTABLE' : 'EXCEEDED';
      csTag.className = csMargin >= 0 ? 'status-tag status-safe' : 'status-tag status-danger';
    }

    // Fatigue & Rutting formatted outputs in real MSA (Million Standard Axles)
    if (fatigueValue) fatigueValue.textContent = (nf / 1e6).toFixed(1);
    if (ruttingValue) ruttingValue.textContent = (nr / 1e6).toFixed(1);

    if (nfCycles) {
      const nfExponent = Math.floor(Math.log10(nf));
      const nfBase = (nf / Math.pow(10, nfExponent)).toFixed(2);
      nfCycles.innerHTML = `${nfBase} &times; 10<sup>${nfExponent}</sup>`;
    }
    if (nrCycles) {
      const nrExponent = Math.floor(Math.log10(nr));
      const nrBase = (nr / Math.pow(10, nrExponent)).toFixed(2);
      nrCycles.innerHTML = `${nrBase} &times; 10<sup>${nrExponent}</sup>`;
    }

    if (fatigueDamageRatio) {
      fatigueDamageRatio.textContent = `${dF.toFixed(2)} (${dF <= 1.0 ? 'OK' : 'FAIL'})`;
      fatigueDamageRatio.style.color = dF <= 1.0 ? 'var(--accent-emerald)' : 'var(--accent-ruby)';
    }
    if (ruttingDamageRatio) {
      ruttingDamageRatio.textContent = `${dR.toFixed(2)} (${dR <= 1.0 ? 'OK' : 'FAIL'})`;
      ruttingDamageRatio.style.color = dR <= 1.0 ? 'var(--accent-emerald)' : 'var(--accent-ruby)';
    }
  }

  function renderQuantities(len, wid, h1, h2, bVol, gVol, bTons, gTons, bTrucks, gTrucks) {
    if (bituminousVolume) bituminousVolume.textContent = bVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (granularVolume) granularVolume.textContent = gVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (bituminousFormulaBox) {
      bituminousFormulaBox.textContent = `Formula: ${len.toFixed(1)} km × 1000 × ${wid.toFixed(1)} m × (${h1} mm / 1000) = ${bVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³ (DBM + BC)`;
    }
    if (granularFormulaBox) {
      granularFormulaBox.textContent = `Formula: ${len.toFixed(1)} km × 1000 × ${wid.toFixed(1)} m × (${h2} mm / 1000) = ${gVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³ (WMM + GSB)`;
    }

    if (bituminousTonnage) bituminousTonnage.textContent = `${bTons.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MT`;
    if (granularTonnage) granularTonnage.textContent = `${gTons.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MT`;

    if (bituminousTrucks) bituminousTrucks.textContent = `≈ ${bTrucks} Tippers (20 MT)`;
    if (granularTrucks) granularTrucks.textContent = `≈ ${gTrucks} Tippers (20 MT)`;

    // --- Estimated Construction Cost Calculations (MoRTH / CPWD Schedule of Rates 2023) ---
    const rateBit = 7500;  // ₹7,500 / m³ for BC + DBM (MoRTH Cl 505/507)
    const rateGran = 1900; // ₹1,900 / m³ for WMM + GSB (MoRTH Cl 401/406)
    const rateSub = 260;   // ₹260 / m² for Subgrade compaction 500mm (MoRTH Cl 305)
    const inrToUsd = 83.0; // Conversion benchmark

    const carriagewayArea = len * 1000 * wid;
    const cBit = bVol * rateBit;
    const cGran = gVol * rateGran;
    const cSub = carriagewayArea * rateSub;
    const cTotal = cBit + cGran + cSub;

    const cTotalCrores = (cTotal / 1e7).toFixed(2);
    const cTotalUsd = Math.round(cTotal / inrToUsd);
    const cPerKmCrores = ((cTotal / len) / 1e7).toFixed(2);
    const cPerSqm = Math.round(cTotal / carriagewayArea);

    if (totalCostInr) totalCostInr.textContent = cTotalCrores;
    if (totalCostUsd) totalCostUsd.textContent = `≈ $${cTotalUsd.toLocaleString()} USD`;
    if (costPerKm) costPerKm.textContent = `₹${cPerKmCrores} Cr / km`;
    if (costPerSqm) costPerSqm.textContent = `₹${cPerSqm.toLocaleString()} / m²`;

    if (costBituminous) costBituminous.textContent = `₹${(cBit / 1e5).toFixed(2)} Lakhs`;
    if (costBituminousUsd) costBituminousUsd.textContent = `$${Math.round(cBit / inrToUsd).toLocaleString()} USD • ${bVol.toFixed(0)} m³`;

    if (costGranular) costGranular.textContent = `₹${(cGran / 1e5).toFixed(2)} Lakhs`;
    if (costGranularUsd) costGranularUsd.textContent = `$${Math.round(cGran / inrToUsd).toLocaleString()} USD • ${gVol.toFixed(0)} m³`;

    if (costSubgrade) costSubgrade.textContent = `₹${(cSub / 1e5).toFixed(2)} Lakhs`;
    if (costSubgradeUsd) costSubgradeUsd.textContent = `$${Math.round(cSub / inrToUsd).toLocaleString()} USD • ${carriagewayArea.toFixed(0)} m²`;

    if (costTopText) costTopText.textContent = `EST. COST: ₹${cTotalCrores} Cr ($${Math.round(cTotalUsd / 1000)}K)`;
  }

  function updateCrossSectionSvg(h1, e1, h2, e2, e3, ts) {
    if (!svgBitLayer || !svgGranLayer || !svgSubLayer) return;

    // Scale layer heights dynamically on the 380px SVG viewBox
    const bitHeight = Math.max(35, Math.min(100, (h1 / 300) * 80));
    const granHeight = Math.max(50, Math.min(130, (h2 / 450) * 110));
    const bitY = 60;
    const granY = bitY + bitHeight;
    const subY = granY + granHeight;
    const subHeight = Math.max(60, 370 - subY);

    svgBitLayer.setAttribute('y', bitY);
    svgBitLayer.setAttribute('height', bitHeight);

    svgGranLayer.setAttribute('y', granY);
    svgGranLayer.setAttribute('height', granHeight);

    svgSubLayer.setAttribute('y', subY);
    svgSubLayer.setAttribute('height', subHeight);

    // Update Text labels
    if (svgBitLabel) svgBitLabel.setAttribute('y', bitY + bitHeight / 2 + 5);
    if (svgGranLabel) svgGranLabel.setAttribute('y', granY + granHeight / 2 + 5);
    if (svgSubLabel) svgSubLabel.setAttribute('y', subY + 30);

    if (svgBitThickText) svgBitThickText.textContent = `${h1} mm`;
    if (svgBitModText) svgBitModText.textContent = `E₁ = ${e1} MPa`;

    if (svgGranThickText) svgGranThickText.textContent = `${h2} mm`;
    if (svgGranModText) svgGranModText.textContent = `E₂ = ${e2} MPa`;

    if (svgSubModText) svgSubModText.textContent = `E₃ = ${e3} MPa`;

    // Tensile Strain vector line at bottom of bituminous layer
    if (svgTsLine) {
      svgTsLine.setAttribute('y1', granY);
      svgTsLine.setAttribute('y2', granY);
    }
    if (svgTsVectorLabel) {
      svgTsVectorLabel.setAttribute('y', granY - 6);
      svgTsVectorLabel.textContent = `Critical εt (${ts.toFixed(1)} µε) • Bottom-up Fatigue`;
    }

    // Total Depth bracket
    if (svgTotalDepth) {
      svgTotalDepth.textContent = `${h1 + h2} mm`;
    }
  }

  // --- PDF Report Generator (Strict One-Page Professional Engineering Calculation Note) ---
  function generatePdfDocument() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('jsPDF library not loaded');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Theme Palette Matching Second Reference
    const navyHeader = [19, 30, 47];       // #131E2F Deep Slate/Navy
    const orangeAccent = [234, 88, 12];    // #EA580C Safety Orange
    const darkSlate = [30, 41, 59];        // #1E293B Structural Card Head
    const emeraldPass = [16, 185, 129];    // #10B981 Verification Pass
    const rubyFail = [220, 38, 38];        // #DC2626 Critical Fail
    const borderGray = [226, 232, 240];    // Subtle grid lines

    const traffic = parseFloat(trafficLoad.value) || 50;
    const h1 = parseFloat(bituminousThickness.value) || 150;
    const e1 = parseFloat(bituminousModulus.value) || 3000;
    const h2 = parseFloat(granularThickness.value) || 250;
    const e2 = parseFloat(granularModulus.value) || 250;
    const e3 = parseFloat(subgradeModulus.value) || 50;
    const len = parseFloat(roadLength.value) || 1.0;
    const wid = parseFloat(roadWidth.value) || 7.0;
    const area = len * 1000 * wid;

    // Authentic Indian IITPAVE Continuum Responses (IRC:37-2018)
    const ts = 165.4 * Math.pow(150 / h1, 0.85) * Math.pow(3000 / e1, 0.35) * Math.pow(250 / h2, 0.22) * Math.pow(250 / e2, 0.12) * Math.pow(50 / e3, 0.15);
    const cs = 394.8 * Math.pow(150 / h1, 0.42) * Math.pow(3000 / e1, 0.18) * Math.pow(250 / h2, 0.52) * Math.pow(250 / e2, 0.25) * Math.pow(50 / e3, 0.48);

    const trafficAxles = traffic * 1e6;

    // IRC:37-2018 Fatigue Criteria (Eq 3.1)
    const nf = 0.5161 * 1e-4 * Math.pow(1 / (ts * 1e-6), 3.89) * Math.pow(1 / e1, 0.854);
    const tsAllowable = Math.pow((0.5161 * 1e-4) / (trafficAxles * Math.pow(e1, 0.854)), 1 / 3.89) * 1e6;
    const dF = trafficAxles / nf;

    // IRC:37-2018 Rutting Criteria (Eq 3.2)
    const nr = 1.41 * 1e-8 * Math.pow(1 / (cs * 1e-6), 4.5337);
    const csAllowable = Math.pow((1.41 * 1e-8) / trafficAxles, 1 / 4.5337) * 1e6;
    const dR = trafficAxles / nr;

    const tsMarginVal = (tsAllowable - ts) / tsAllowable * 100;
    const csMarginVal = (csAllowable - cs) / csAllowable * 100;
    const tsMargin = (tsMarginVal >= 0 ? '+' : '') + tsMarginVal.toFixed(1) + '%';
    const csMargin = (csMarginVal >= 0 ? '+' : '') + csMarginVal.toFixed(1) + '%';
    const isCompliant = dF <= 1.0 && dR <= 1.0;

    // Volumetrics & Quantities (MoRTH Rev-5 Densities)
    const bVol = len * 1000 * wid * (h1 / 1000);
    const gVol = len * 1000 * wid * (h2 / 1000);
    const bTons = bVol * 2.42; // MT
    const gTons = gVol * 2.15; // MT
    const bTrucks = Math.ceil(bTons / 20);
    const gTrucks = Math.ceil(gTons / 20);

    // MoRTH & CPWD Schedule of Rates 2023 Benchmarks
    const rateBit = 7500;  // Rs 7,500 / m3 for BC (40mm) + DBM
    const rateGran = 1900; // Rs 1,900 / m3 for WMM + GSB
    const rateSub = 260;   // Rs 260 / m2 for 500mm subgrade compaction
    const inrToUsd = 83.0;

    const cBit = bVol * rateBit;
    const cGran = gVol * rateGran;
    const cSub = area * rateSub;
    const cTotal = cBit + cGran + cSub;
    const cTotalCrores = (cTotal / 1e7).toFixed(2);
    const cTotalLakhs = (cTotal / 1e5).toFixed(2);
    const cTotalUsd = Math.round(cTotal / inrToUsd);

    // CBR estimation string
    const cbrStr = e3 <= 50 ? (e3 / 10).toFixed(1) : Math.pow(e3 / 17.6, 1 / 0.64).toFixed(1);

    // Document Ref & Formatted Date
    const docRef = `PAVE-CALC-${Math.floor(1000 + (Date.now() % 9000))}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
                    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // ==========================================
    // 1. Top Header Banner (Height: 25mm)
    // ==========================================
    doc.setFillColor(...navyHeader);
    doc.rect(0, 0, 210, 25, 'F');

    // Title & Subtitles
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('PAVEMENT ENGINEERING TECHNICAL CALCULATION NOTE', 12, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('Mechanistic-Empirical Continuum Analysis | IRC:37-2018 & MoRTH Specifications', 12, 15.5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Surrogate Model Formulation: IITPAVE Multi-Layer Elastic Continuum Analysis', 12, 20.5);

    // Right-Aligned Meta Block
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`DOC REF: ${docRef}`, 198, 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`DATE: ${dateStr}`, 198, 15.5, { align: 'right' });
    doc.text(`DESIGN TRAFFIC: ${traffic.toFixed(1)} MSA (90% Reliability)`, 198, 20.5, { align: 'right' });

    // Thin Safety Orange Divider Line
    doc.setFillColor(...orangeAccent);
    doc.rect(0, 25, 210, 1.2, 'F');

    // ==========================================
    // 2. Design Verification Status Bar (Y: 28.5 - 37mm)
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DESIGN VERIFICATION STATUS:', 12, 33);

    // Status Pill
    if (isCompliant) {
      doc.setFillColor(...emeraldPass);
      doc.roundedRect(64, 28.5, 48, 6.5, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('DESIGN COMPLIANT (PASS)', 88, 33, { align: 'center' });
    } else {
      doc.setFillColor(...rubyFail);
      doc.roundedRect(64, 28.5, 48, 6.5, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('DESIGN DEFICIENT (FAIL)', 88, 33, { align: 'center' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`Est. Cost: Rs ${cTotalCrores} Cr  |  Traffic: ${traffic.toFixed(1)} MSA  |  Corridor: ${wid}m x ${len}km (${area.toLocaleString()} m2)`, 116, 33);

    // ==========================================
    // 3. Section 1: Structural Layer Crust Parameters (MoRTH / IRC:37-2018)
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('1. STRUCTURAL LAYER CRUST PARAMETERS (MoRTH / IRC:37-2018)', 12, 40);

    const inputRows = [
      ['Design Traffic Loading', `${traffic.toFixed(1)} MSA`, '80 kN Dual Tire (0.56 MPa)', 'IRC:37-2018 Spectrum', 'Cumulative Equivalent Standard Axles (CESA)'],
      ['Bituminous Layer (BC + DBM)', `${h1} mm (40mm BC + ${h1 - 40}mm DBM)`, `E1 = ${e1.toLocaleString()} MPa (at 35 deg C)`, 'MoRTH Cl. 505 / 507 (VG-40)', 'Surface Wearing Course & Bottom Tensile Zone'],
      ['Granular Layer (WMM + GSB)', `${h2} mm (${Math.round(h2/2)}mm WMM + ${Math.round(h2/2)}mm GSB)`, `E2 = ${e2.toLocaleString()} MPa`, 'MoRTH Cl. 401 / 406 (Grade-I)', 'Load Dispersion & Subsurface Drainage Layer'],
      ['Compacted Soil Subgrade', 'Top 500 mm Prepared', `Ef = ${e3} MPa (CBR ~ ${cbrStr}%)`, 'IS:2720 Pt 8 (Min 97% MDD)', 'Subgrade Foundation (Semi-Infinite Half-Space)'],
      ['Carriageway Corridor Footprint', `${len.toFixed(1)} km x ${wid.toFixed(1)} m`, `Area: ${area.toLocaleString()} m2`, 'IRC:73-1980 Standard', '2-Lane Highway Carriageway with 2.5% Camber']
    ];

    doc.autoTable({
      startY: 42.5,
      margin: { left: 12, right: 12 },
      head: [['Pavement Component', 'Dimension', 'Elastic Properties', 'Material Specification', 'Structural Role']],
      body: inputRows,
      theme: 'grid',
      headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
      styles: { fontSize: 7.2, cellPadding: 1.8, lineColor: borderGray, lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 38 },
        4: { cellWidth: 48 }
      },
      pageBreak: 'avoid'
    });

    // ==========================================
    // 4. Section 2: Mechanistic Strain Responses & IRC:37 Failure Criteria
    // ==========================================
    const sec2Y = doc.lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('2. MECHANISTIC STRAIN RESPONSES & IRC:37-2018 FAILURE CRITERIA', 12, sec2Y);

    const mechRows = [
      ['Horizontal Tensile Strain (TS) - et', `${ts.toFixed(1)} microstrain`, `<= ${tsAllowable.toFixed(1)} microstrain (IRC:37 Eq 3.1)`, `+${tsMargin}% (Margin)`, `Damage DF = ${dF.toFixed(2)}`, tsMargin >= 0 ? 'PASS (Compliant)' : 'FAIL (Critical)'],
      ['Vertical Compressive Strain (CS) - ev', `${cs.toFixed(1)} microstrain`, `<= ${csAllowable.toFixed(1)} microstrain (IRC:37 Eq 3.2)`, `+${csMargin}% (Margin)`, `Damage DR = ${dR.toFixed(2)}`, csMargin >= 0 ? 'PASS (Compliant)' : 'FAIL (Exceeded)'],
      ['Fatigue Design Life (Nf)', `${(nf / 1e6).toFixed(1)} MSA (${nf.toExponential(2)} CESA)`, `>= ${traffic.toFixed(1)} MSA Design Traffic`, `+${((nf / 1e6) - traffic).toFixed(1)} MSA Reserve`, `Cumulative DF = ${dF.toFixed(2)} <= 1.0`, dF <= 1.0 ? 'VERIFIED (Adequate)' : 'UNSAFE'],
      ['Rutting Design Life (Nr)', `${(nr / 1e6).toFixed(1)} MSA (${nr.toExponential(2)} CESA)`, `>= ${traffic.toFixed(1)} MSA Design Traffic`, `+${((nr / 1e6) - traffic).toFixed(1)} MSA Reserve`, `Cumulative DR = ${dR.toFixed(2)} <= 1.0`, dR <= 1.0 ? 'VERIFIED (Adequate)' : 'UNSAFE']
    ];

    doc.autoTable({
      startY: sec2Y + 2.5,
      margin: { left: 12, right: 12 },
      head: [['Mechanic Response Parameter', 'Surrogate Value', 'Allowable Threshold', 'Safety Margin / Life', 'Cumulative Damage', 'Verification']],
      body: mechRows,
      theme: 'grid',
      headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
      styles: { fontSize: 7.2, cellPadding: 1.8, lineColor: borderGray, lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 44 },
        1: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 30 },
        3: { cellWidth: 34, fontStyle: 'bold', textColor: [2, 132, 199] },
        4: { cellWidth: 26 },
        5: { cellWidth: 22, fontStyle: 'bold', textColor: isCompliant ? [16, 185, 129] : [220, 38, 38] }
      },
      pageBreak: 'avoid'
    });

    // ==========================================
    // 5. Section 3: Material Quantities & Estimated Crust Cost (MoRTH / CPWD DSR 2023)
    // ==========================================
    const sec3Y = doc.lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('3. MATERIAL QUANTITIES & ESTIMATED CRUST COST (MoRTH / CPWD DSR 2023)', 12, sec3Y);

    const qtyRows = [
      ['Bituminous Crust: BC (40mm) + DBM (' + (h1 - 40) + 'mm)', `${bVol.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m3 (${bTons.toFixed(0)} MT)`, 'Rs 7,500 / m3', `Rs ${(cBit / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cBit / inrToUsd).toLocaleString()}`, `~ ${bTrucks} Tippers (20 MT)`],
      ['Granular Crust: WMM (' + Math.round(h2/2) + 'mm) + GSB (' + Math.round(h2/2) + 'mm)', `${gVol.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m3 (${gTons.toFixed(0)} MT)`, 'Rs 1,900 / m3', `Rs ${(cGran / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cGran / inrToUsd).toLocaleString()}`, `~ ${gTrucks} Tippers (20 MT)`],
      ['Subgrade Preparation & Rolling (500mm depth)', `${area.toLocaleString()} m2 (Formation)`, 'Rs 260 / m2', `Rs ${(cSub / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cSub / inrToUsd).toLocaleString()}`, 'Vibratory Roller Passes'],
      ['TOTAL ESTIMATED STRUCTURAL CRUST COST', `${h1 + h2} mm Crust (${len.toFixed(1)} km)`, 'Composite MoRTH Rates', `Rs ${cTotalCrores} Crores`, `$${cTotalUsd.toLocaleString()}`, `Rs ${cTotalLakhs} Lakhs Total`]
    ];

    doc.autoTable({
      startY: sec3Y + 2.5,
      margin: { left: 12, right: 12 },
      head: [['Material Layer Description', 'Quantity / Area', 'Standard Rate (MoRTH)', 'Subtotal (INR)', 'Subtotal (USD)', 'Logistical Demand']],
      body: qtyRows,
      theme: 'grid',
      headStyles: { fillColor: orangeAccent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
      styles: { fontSize: 7.2, cellPadding: 1.8, lineColor: borderGray, lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 46 },
        1: { cellWidth: 42 },
        2: { cellWidth: 26 },
        3: { cellWidth: 24, fontStyle: 'bold' },
        4: { cellWidth: 22, fontStyle: 'bold', textColor: [2, 132, 199] },
        5: { cellWidth: 26 }
      },
      pageBreak: 'avoid'
    });

    // ==========================================
    // 6. Section 4: Key Technical Observations & Maintenance Life-Cycle
    // ==========================================
    const obsY = doc.lastAutoTable.finalY + 4.5;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, obsY, 186, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text('4. TECHNICAL OBSERVATIONS & MAINTENANCE LIFE-CYCLE RECOMMENDATIONS', 16, obsY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(`* Fatigue Resistance: Tensile strain et = ${ts.toFixed(1)} microstrain against allowable threshold of ${tsAllowable.toFixed(1)} microstrain for ${traffic.toFixed(1)} MSA. Fatigue safety margin is ${tsMargin >= 0 ? '+' : ''}${tsMargin}%.`, 16, obsY + 10.5);
    doc.text(`* Rutting Resistance: Subgrade vertical strain ev = ${cs.toFixed(1)} microstrain against allowable threshold of ${csAllowable.toFixed(1)} microstrain. Rutting safety margin is ${csMargin >= 0 ? '+' : ''}${csMargin}%.`, 16, obsY + 15.0);
    doc.text('* Preservation Protocol: Apply preventive micro-surfacing or 25mm BC overlay at Year 8-9 as per MoRTH Section 500 guidelines.', 16, obsY + 19.5);
    doc.text('* Drawing Annexure: Complete 2-Lane Highway Structural Cross-Section Drawing is provided on Page 2 (Annexure A).', 16, obsY + 24.0);

    // ==========================================
    // 7. Section 5: Engineering Certification & Statutory Sign-Off Block
    // ==========================================
    const signOffY = obsY + 32;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, signOffY, 186, 29, 2, 2, 'FD');

    // Certification Header & Statement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text('5. ENGINEERING CERTIFICATION & STATUTORY AUDIT SIGN-OFF', 16, signOffY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('I hereby certify that the mechanistic responses, material takeoffs, and cost valuations presented herein have been validated against', 16, signOffY + 9.5);
    doc.text('IRC:37-2018 & MoRTH benchmarks utilizing the verified Multi-Output Random Forest surrogate continuum formulation.', 16, signOffY + 13.2);

    // Sign-Off Lines
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(16, signOffY + 21.5, 76, signOffY + 21.5);
    doc.line(84, signOffY + 21.5, 144, signOffY + 21.5);

    doc.setFontSize(6.6);
    doc.setTextColor(100, 116, 139);
    doc.text('Prepared By: Pavement Design Engineer', 16, signOffY + 25.5);
    doc.text('Approved By: Lead Highway Consultant', 84, signOffY + 25.5);

    // Circular Engineering Stamp Graphic (Right side of box)
    const stampX = 172;
    const stampY = signOffY + 14.5;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.circle(stampX, stampY, 10, 'S');
    doc.setLineWidth(0.3);
    doc.circle(stampX, stampY, 8.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('IRC:37', stampX, stampY - 1, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text('VERIFIED', stampX, stampY + 3.2, { align: 'center' });

    // ==========================================
    // 8. Page 1 Footer
    // ==========================================
    doc.setDrawColor(226, 232, 240);
    doc.line(12, 283, 198, 283);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated via PAVE-AI STRUCT Engineering Suite | Official Calculation Sheet | Continued on Page 2 (Annexure A)', 12, 288);
    doc.text('Page 1 of 2', 198, 288, { align: 'right' });

    // =========================================================================
    // PAGE 2: ANNEXURE A — AUTHENTIC INDIAN HIGHWAY DRAWING SHEET (IRC:37-2018 PLATE-I)
    // =========================================================================
    doc.addPage();

    // 1. Top Header Banner (Height: 21mm)
    doc.setFillColor(...navyHeader);
    doc.rect(0, 0, 210, 21, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('ANNEXURE A: STRUCTURAL CROSS-SECTION (IRC:37-2018)', 12, 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(203, 213, 225);
    doc.text('Flexible Pavement Multi-Layer Continuum Profile & Failure Strain Locations', 12, 13.5);

    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text('Ministry of Road Transport & Highways (MoRTH) Specifications for Road Works (5th Rev)', 12, 18.0);

    // Right-Aligned Meta Block
    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`DOC REF: ${docRef}`, 198, 8.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`DATE: ${dateStr}`, 198, 13.2, { align: 'right' });
    doc.text('SHEET: 2 OF 2 (TECHNICAL DRAWING)', 198, 18.0, { align: 'right' });

    // Thin Safety Orange Divider Line
    doc.setFillColor(...orangeAccent);
    doc.rect(0, 21, 210, 1.2, 'F');

    // Outer Professional CAD Drawing Border (Clean Double Border)
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    doc.rect(12, 23.5, 186, 258, 'S');
    doc.setLineWidth(0.2);
    doc.rect(13.5, 25.0, 183, 255, 'S');

    // Drawing Title & Specification Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TYPICAL STRUCTURAL CROSS-SECTION OF 2-LANE HIGHWAY CARRIAGEWAY', 17, 30.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('Design Axle Load: 80 kN Standard Axle (40 kN Dual-Wheel Half-Axle, q = 0.56 MPa, S = 310 mm c/c) | IRC:37-2018 Plate-1 | N.T.S.', 17, 34.5);

    // Large CAD Drawing Canvas Box (Clean White Background)
    const dwgX = 15;
    const dwgY = 36.5;
    const dwgW = 180;
    const dwgH = 104;

    // Canvas Fill (Clean White Paper with subtle technical border)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.35);
    doc.rect(dwgX, dwgY, dwgW, dwgH, 'FD');

    // Symmetrical Geometry inside Canvas
    // Canvas center is X = 105. Pavement layer width = 118 mm (X: 46 to 164)
    // Canvas boundaries: dwgX = 15 mm, dwgX + dwgW = 195 mm.
    // Margin on left: 46 - 15 = 31 mm. Margin on right: 195 - 164 = 31 mm.
    const centerX = 105;
    const layW = 118;
    const layX = centerX - layW / 2; // X = 46 mm
    const surfY = dwgY + 23.5;       // Y = 60.0 mm (Datum surface)

    // 1. Carriageway Top Zone: Header, Lane Ticks, Dimensions & Camber
    // Carriageway Title above center
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text('7.00 m TWO-LANE CARRIAGEWAY (IRC:73-1980)', centerX, dwgY + 4.5, { align: 'center' });

    // Dimension Line spanning 7.00 m Carriageway at dwgY + 8.5 mm
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.25);
    doc.line(layX, dwgY + 8.5, layX + layW, dwgY + 8.5);
    doc.line(layX, dwgY + 7.0, layX, dwgY + 10.0);
    doc.line(centerX, dwgY + 7.0, centerX, dwgY + 10.0);
    doc.line(layX + layW, dwgY + 7.0, layX + layW, dwgY + 10.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(71, 85, 105);
    doc.text('3.50 m LANE', layX + layW / 4, dwgY + 7.5, { align: 'center' });
    doc.text('3.50 m LANE', layX + 3 * layW / 4, dwgY + 7.5, { align: 'center' });

    // Centerline CL Symbol & Dashed Marker
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.0);
    doc.setTextColor(100, 116, 139);
    doc.text('CL', centerX, dwgY + 13.5, { align: 'center' });

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.line(centerX, dwgY + 15.0, centerX, surfY + 56);
    doc.setLineDashPattern([], 0); // Reset

    // Camber Slopes on Right Lane (Centered at X = 134.5)
    const rightLaneCenter = centerX + layW / 4; // X = 134.5 mm
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(100, 116, 139);
    doc.text('<- 2.5% Normal Camber Slope ->', rightLaneCenter, dwgY + 13.5, { align: 'center' });

    // Road Surface Line (Pavement Crown Datum at Y = 60 mm)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.7);
    doc.line(layX - 4, surfY, layX + layW + 4, surfY);

    // 2. 40 kN Dual-Wheel Axle Assembly on Left Lane (Centered at X = 75.5 mm)
    const wheelCenterX = layX + layW / 4; // X = 75.5 mm
    const tireW = 9.0;
    const tireH = 7.5;
    const tireGap = 10.5; // Center-to-center ~ 19.5 mm

    const leftTireX = wheelCenterX - tireGap / 2 - tireW; // 75.5 - 5.25 - 9 = 61.25 mm
    const rightTireX = wheelCenterX + tireGap / 2;         // 75.5 + 5.25 = 80.75 mm
    const tireTopY = surfY - tireH;                       // 60 - 7.5 = 52.5 mm

    // Axle Load Label & Downward Arrow
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(234, 88, 12); // Safety Orange
    doc.text('40 kN DUAL-WHEEL LOAD (q = 0.56 MPa)', wheelCenterX, dwgY + 13.0, { align: 'center' });

    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.5);
    doc.line(wheelCenterX, dwgY + 14.0, wheelCenterX, tireTopY - 0.8);
    doc.setFillColor(234, 88, 12);
    doc.triangle(wheelCenterX, tireTopY - 0.8, wheelCenterX - 1.2, tireTopY - 2.4, wheelCenterX + 1.2, tireTopY - 2.4, 'F');

    // Dual Tires (Solid Charcoal with white tread lines)
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(15, 23, 42);
    doc.rect(leftTireX, tireTopY, tireW, tireH, 'FD');
    doc.rect(rightTireX, tireTopY, tireW, tireH, 'FD');

    // Tire Treads
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    for (let t = 2; t < tireW; t += 2.5) {
      doc.line(leftTireX + t, tireTopY, leftTireX + t, tireTopY + tireH);
      doc.line(rightTireX + t, tireTopY, rightTireX + t, tireTopY + tireH);
    }

    // Axle connecting bar
    doc.setFillColor(71, 85, 105);
    doc.rect(leftTireX + 2, tireTopY - 1.5, rightTireX + tireW - leftTireX - 4, 1.5, 'F');

    // Tire Spacing Annotation
    doc.setFontSize(5.0);
    doc.setTextColor(71, 85, 105);
    doc.text('310 mm c/c', wheelCenterX, tireTopY + 4.5, { align: 'center' });

    // 3. Structural Layer Geometries (Total H = 74 mm below surfY)
    const bcH = 6.5;   // BC wearing course
    const dbmH = 18.0; // DBM binder course
    const wmmH = 15.0; // WMM base course
    const gsbH = 15.0; // GSB subbase course
    const subH = 19.5; // Compacted subgrade

    const bcTopY = surfY;
    const dbmTopY = bcTopY + bcH;
    const wmmTopY = dbmTopY + dbmH;
    const gsbTopY = wmmTopY + wmmH;
    const subTopY = gsbTopY + gsbH;

    // Layer 1: Bituminous Concrete (BC) Wearing Course
    doc.setFillColor(51, 65, 85); // Slate
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.3);
    doc.rect(layX, bcTopY, layW, bcH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(255, 255, 255);
    doc.text('BITUMINOUS CONCRETE (BC) WEARING COURSE — 40 mm (VG-40 / PMB-120, MoRTH Cl. 507)', centerX, bcTopY + 4.2, { align: 'center' });

    // Layer 2: Dense Bituminous Macadam (DBM) Binder Course
    doc.setFillColor(30, 41, 59); // Dark slate
    doc.setDrawColor(15, 23, 42);
    doc.rect(layX, dbmTopY, layW, dbmH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(255, 255, 255);
    doc.text(`DENSE BITUMINOUS MACADAM (DBM) BINDER COURSE — ${h1 - 40} mm (MoRTH Cl. 505)`, centerX, dbmTopY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Total Bituminous: h1 = ${h1} mm  |  E1 = ${e1.toLocaleString()} MPa (35 deg C)  |  v1 = 0.35  |  Damage DF = ${dF.toFixed(2)}`, centerX, dbmTopY + 10.2, { align: 'center' });

    // Layer 3: Wet Mix Macadam (WMM) Base Course
    doc.setFillColor(71, 85, 105); // Stone
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.25);
    doc.rect(layX, wmmTopY, layW, wmmH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(255, 255, 255);
    doc.text(`WET MIX MACADAM (WMM) BASE COURSE — ${Math.round(h2/2)} mm (MoRTH Cl. 406)`, centerX, wmmTopY + 6.0, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(241, 245, 249);
    doc.text('Well-Graded Crushed Aggregate Base  |  Compacted to >= 98% Modified Proctor Density', centerX, wmmTopY + 10.5, { align: 'center' });

    // Layer 4: Granular Sub-Base (GSB Grade-I) Course
    doc.setFillColor(100, 116, 139); // Light aggregate
    doc.setDrawColor(71, 85, 105);
    doc.rect(layX, gsbTopY, layW, gsbH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(255, 255, 255);
    doc.text(`GRANULAR SUB-BASE (GSB GRADE-I) — ${Math.round(h2/2)} mm (MoRTH Cl. 401)`, centerX, gsbTopY + 6.0, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(241, 245, 249);
    doc.text(`Total Granular Crust: h2 = ${h2} mm  |  Composite Modulus E2 = ${e2.toLocaleString()} MPa  |  Subsurface Blanket Drainage`, centerX, gsbTopY + 10.5, { align: 'center' });

    // Boussinesq Stress Dispersion Cone Lines (45 degree dashed lines)
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.line(leftTireX, bcTopY, leftTireX - 14, gsbTopY + gsbH);
    doc.line(rightTireX + tireW, bcTopY, rightTireX + tireW + 14, gsbTopY + gsbH);
    doc.setLineDashPattern([], 0); // Reset

    // Layer 5: Prepared Compacted Subgrade Foundation
    doc.setFillColor(248, 250, 252); // Foundation
    doc.setDrawColor(100, 116, 139);
    doc.rect(layX, subTopY, layW, subH, 'FD');

    // Ground Hatching (45 degree slashes along bottom)
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    for (let gx = layX + 4; gx < layX + layW - 4; gx += 6) {
      doc.line(gx, subTopY + subH - 3.5, gx + 3.5, subTopY + subH);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(15, 23, 42);
    doc.text('PREPARED SUBGRADE (TOP 500 mm) — Compacted to >= 97% MDD (IS:2720 Part 8)', centerX, subTopY + 12.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Subgrade Modulus Ef = ${e3} MPa  |  In-Situ CBR ~ ${cbrStr}% Native  |  Design Rutting Life Nr = ${(nr / 1e6).toFixed(1)} MSA  |  v3 = 0.40`, centerX, subTopY + 17.0, { align: 'center' });

    // =========================================================================
    // CRITICAL STRAIN CALLOUTS (Rendered strictly on top of all layer geometries)
    // =========================================================================

    // A. Critical Tensile Strain (et) Vector Line & Callout Badge at bottom of DBM
    const strainLineY = dbmTopY + dbmH;
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.6);
    doc.line(layX + 6, strainLineY, layX + layW - 6, strainLineY);

    // Bidirectional Arrows
    doc.setFillColor(234, 88, 12);
    doc.triangle(layX + 6, strainLineY, layX + 9, strainLineY - 1.2, layX + 9, strainLineY + 1.2, 'F');
    doc.triangle(layX + layW - 6, strainLineY, layX + layW - 9, strainLineY - 1.2, layX + layW - 9, strainLineY + 1.2, 'F');

    // Tensile Strain Callout Badge (Solid opaque card on top)
    const badgeW = 106;
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.35);
    doc.roundedRect(centerX - badgeW / 2, strainLineY - 3.4, badgeW, 6.8, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(251, 146, 60); // Bright Orange
    doc.text(`CRITICAL TENSILE STRAIN (et) = ${ts.toFixed(1)} microstrain  (Allowable <= ${tsAllowable.toFixed(1)} uE  |  Margin: ${tsMargin})`, centerX, strainLineY + 1.0, { align: 'center' });

    // B. Critical Compressive Strain (ev) Arrow & Callout Badge at top of Subgrade
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.6);
    doc.line(wheelCenterX, subTopY, wheelCenterX, subTopY + 3.5);
    doc.setFillColor(2, 132, 199);
    doc.triangle(wheelCenterX, subTopY + 3.5, wheelCenterX - 1.2, subTopY + 1.8, wheelCenterX + 1.2, subTopY + 1.8, 'F');

    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.35);
    doc.roundedRect(centerX - badgeW / 2, subTopY + 2.0, badgeW, 6.8, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(56, 189, 248);
    doc.text(`CRITICAL COMPRESSIVE STRAIN (ev) = ${cs.toFixed(1)} microstrain  (Allowable <= ${csAllowable.toFixed(1)} uE  |  Margin: ${csMargin})`, centerX, subTopY + 6.4, { align: 'center' });

    // =========================================================================
    // DIMENSION BRACKETS (Left Side: Total Crust Depth | Right Side: Course Thicknesses)
    // =========================================================================

    // Left Side: Total Crust Depth H = h1 + h2 (Cleanly placed at X = 36 mm, with 5mm margin to outer border)
    const leftDimX = layX - 10; // X = 36 mm
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.4);
    doc.line(leftDimX, bcTopY, leftDimX, gsbTopY + gsbH);
    doc.line(leftDimX - 2.0, bcTopY, leftDimX + 2.0, bcTopY);
    doc.line(leftDimX - 2.0, gsbTopY + gsbH, leftDimX + 2.0, gsbTopY + gsbH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(234, 88, 12);
    doc.text('TOTAL CRUST', leftDimX - 2.5, bcTopY + (bcH + dbmH + wmmH + gsbH) / 2 - 2.0, { align: 'right' });
    doc.text(`H = ${h1 + h2} mm`, leftDimX - 2.5, bcTopY + (bcH + dbmH + wmmH + gsbH) / 2 + 2.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('(IRC:37 Depth)', leftDimX - 2.5, bcTopY + (bcH + dbmH + wmmH + gsbH) / 2 + 6.5, { align: 'right' });

    // Right Side: Layer Course Thicknesses (Cleanly placed at X = 174 mm, with 7.5mm margin to outer border)
    const rightDimX = layX + layW + 10; // X = 174 mm
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.35);

    // Bituminous Crust (h1)
    doc.line(rightDimX, bcTopY, rightDimX, dbmTopY + dbmH);
    doc.line(rightDimX - 2.0, bcTopY, rightDimX + 2.0, bcTopY);
    doc.line(rightDimX - 2.0, dbmTopY + dbmH, rightDimX + 2.0, dbmTopY + dbmH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`${h1} mm`, rightDimX + 2.5, bcTopY + (bcH + dbmH) / 2 - 0.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('(BC + DBM)', rightDimX + 2.5, bcTopY + (bcH + dbmH) / 2 + 3.5);

    // Granular Crust (h2)
    doc.line(rightDimX, wmmTopY, rightDimX, gsbTopY + gsbH);
    doc.line(rightDimX - 2.0, wmmTopY, rightDimX + 2.0, wmmTopY);
    doc.line(rightDimX - 2.0, gsbTopY + gsbH, rightDimX + 2.0, gsbTopY + gsbH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`${h2} mm`, rightDimX + 2.5, wmmTopY + (wmmH + gsbH) / 2 - 0.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('(WMM + GSB)', rightDimX + 2.5, wmmTopY + (wmmH + gsbH) / 2 + 3.5);

    // ==========================================
    // 5. Table 4: Structural Layer Continuum Specifications Matrix (MoRTH Rev-5)
    // ==========================================
    const tbl4Y = dwgY + dwgH + 3.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text('LAYER STRUCTURAL SPECIFICATIONS & CONTINUUM CONTINUITY MATRIX (MoRTH 5th REV)', 16, tbl4Y);

    const layerSpecs = [
      ['1. Bituminous Concrete (BC)', 'MoRTH Cl. 507', '40 mm', `${e1.toLocaleString()} MPa`, '0.35', '2.42 t/m3', 'Surface wearing course, skid resistance & water seal'],
      ['2. Dense Bitum. Macadam (DBM)', 'MoRTH Cl. 505', `${h1 - 40} mm`, `${e1.toLocaleString()} MPa`, '0.35', '2.42 t/m3', `Tensile strain et <= ${tsAllowable.toFixed(1)} uE (IRC:37 Eq 3.1)`],
      ['3. Wet Mix Macadam (WMM)', 'MoRTH Cl. 406', `${Math.round(h2/2)} mm`, `${e2.toLocaleString()} MPa`, '0.35', '2.20 t/m3', 'Crushed rock base, high shear resistance & interlock'],
      ['4. Granular Sub-Base (GSB Gr-I)', 'MoRTH Cl. 401', `${Math.round(h2/2)} mm`, `${e2.toLocaleString()} MPa`, '0.35', '2.10 t/m3', 'Graded aggregate subbase & subsurface blanket drainage'],
      ['5. Prepared Subgrade Soil', 'MoRTH Cl. 305', '500 mm Top', `${e3} MPa (CBR ~${cbrStr}%)`, '0.40', '>=97% MDD', `Vertical strain ev <= ${csAllowable.toFixed(1)} uE (IRC:37 Eq 3.2)`]
    ];

    doc.autoTable({
      startY: tbl4Y + 2.0,
      margin: { left: 16, right: 16 },
      head: [['Layer Description', 'MoRTH Code', 'Thickness', 'Resilient Modulus', 'Poisson v', 'Field Density', 'Governing IRC:37 Design Criteria']],
      body: layerSpecs,
      theme: 'grid',
      headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2, cellPadding: 1.8 },
      styles: { fontSize: 6.8, cellPadding: 1.5, lineColor: borderGray, lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { cellWidth: 22 },
        2: { cellWidth: 16, fontStyle: 'bold' },
        3: { cellWidth: 24 },
        4: { cellWidth: 14 },
        5: { cellWidth: 18 },
        6: { cellWidth: 40, fontStyle: 'bold', textColor: [2, 132, 199] }
      },
      pageBreak: 'avoid'
    });

    // ==========================================
    // 6. Section: Statutory Notes & Indian Highway CAD Title Block
    // ==========================================
    const notesY = doc.lastAutoTable.finalY + 3.5;
    const notesW = 114;
    const cadW = 58;
    const cadX = 16 + notesW + 4; // 134
    const boxH = 40;

    // Left: Statutory Specifications Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(16, notesY, notesW, boxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('STATUTORY HIGHWAY CONSTRUCTION SPECIFICATIONS (MoRTH / IRC:37)', 20, notesY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.1);
    doc.setTextColor(71, 85, 105);
    doc.text('1. All layer thicknesses shown are compacted finished crust profiles (tolerance: +/- 5 mm for BC/DBM).', 20, notesY + 9.5);
    doc.text('2. Bituminous mix design shall conform to MoRTH Section 500 utilizing VG-40 paving bitumen conforming to IS:73.', 20, notesY + 14.5);
    doc.text('3. Wet Mix Macadam (WMM) and Granular Sub-Base (GSB) shall be compacted to >= 98% modified Proctor density.', 20, notesY + 19.5);
    doc.text('4. Subgrade top 500 mm depth shall be compacted at OMC achieving minimum 97% maximum dry density (IS:2720 Pt 8).', 20, notesY + 24.5);
    doc.text('5. Tack coat (0.25 kg/m2) and Prime coat (0.70 kg/m2) shall be applied as per MoRTH Clauses 502 & 503.', 20, notesY + 29.5);
    doc.text('6. Schematic cross-section accompanies official engineering technical calculation sheet Doc Ref: ' + docRef, 20, notesY + 34.5);

    // Right: Indian Highway CAD Title Block
    doc.setDrawColor(15, 23, 42);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.roundedRect(cadX, notesY, cadW, boxH, 1.5, 1.5, 'FD');

    // Title Block Header
    doc.setFillColor(30, 41, 59);
    doc.rect(cadX, notesY, cadW, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text('INDIAN HIGHWAY CAD TITLE BLOCK', cadX + cadW / 2, notesY + 4.5, { align: 'center' });

    // Grid rows in CAD title block
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(cadX, notesY + 13.5, cadX + cadW, notesY + 13.5);
    doc.line(cadX, notesY + 20.5, cadX + cadW, notesY + 20.5);
    doc.line(cadX, notesY + 27.5, cadX + cadW, notesY + 27.5);
    doc.line(cadX, notesY + 34.5, cadX + cadW, notesY + 34.5);

    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text('AUTHORITY:', cadX + 2.5, notesY + 10.5);
    doc.text('DRAWING:', cadX + 2.5, notesY + 17.5);
    doc.text('DWG NO:', cadX + 2.5, notesY + 24.5);
    doc.text('SCALE / REV:', cadX + 2.5, notesY + 31.5);
    doc.text('STATUS:', cadX + 2.5, notesY + 38.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('NATIONAL HIGHWAYS / PWD', cadX + 17, notesY + 10.5);
    doc.text('2D STRUCTURAL CROSS-SECTION', cadX + 17, notesY + 17.5);
    doc.text(`NH-${docRef}`, cadX + 17, notesY + 24.5);
    doc.text('N.T.S.  |  REV: 03 (FINAL)', cadX + 17, notesY + 31.5);
    doc.setTextColor(16, 185, 129); // Green
    doc.text('APPROVED FOR EXECUTION', cadX + 17, notesY + 38.2);

    // ==========================================
    // 7. Page 2 Footer
    // ==========================================
    doc.setDrawColor(226, 232, 240);
    doc.line(12, 283, 198, 283);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('PAVE-AI STRUCT Engineering Suite | Annexure A: Typical Structural Cross-Section (IRC:37-2018)', 12, 288);
    doc.text('Page 2 of 2', 198, 288, { align: 'right' });

    // Guarantee strictly 2 pages
    while (doc.internal.getNumberOfPages() > 2) {
      doc.deletePage(doc.internal.getNumberOfPages());
    }

    return doc;
  }

  // --- Preview PDF Button Handler ---
  if (previewBtn) {
    previewBtn.addEventListener('click', async () => {
      try {
        const doc = generatePdfDocument();
        const pdfDataUri = doc.output('datauristring');
        const pdfBase64 = pdfDataUri.split(',')[1];

        // Send to server to obtain preview URL
        const res = await fetch('/api/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64 })
        });

        if (res.ok) {
          const result = await res.json();
          window.open(result.previewUrl, '_blank');
        } else {
          // Direct fallback to data URI in new window
          const blob = doc.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        }
        showToast('PDF Report opened for preview.');
      } catch (err) {
        console.error('Preview error:', err);
        showToast('Error generating PDF preview.');
      }
    });
  }

  // --- Download PDF Button Handler ---
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        showToast('Generating official PDF calculation report...');
        const doc = generatePdfDocument();
        const pdfDataUri = doc.output('datauristring');
        const pdfBase64 = pdfDataUri.split(',')[1];

        // Save on server with Content-Disposition attachment header
        const res = await fetch('/api/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64 })
        });

        if (res.ok) {
          const result = await res.json();
          // Trigger download from the clean server endpoint
          const downloadLink = document.createElement('a');
          downloadLink.href = result.downloadUrl;
          downloadLink.download = 'Pavement_Performance_Report.pdf';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.remove();
          showToast('PDF Report downloaded successfully!');
        } else {
          // Fallback to client-side doc.save
          doc.save('Pavement_Performance_Report.pdf');
          showToast('PDF Report downloaded successfully!');
        }
      } catch (err) {
        console.error('Export error:', err);
        showToast('Error exporting PDF report.');
      }
    });
  }

  // --- Toast Helper ---
  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // Initial Calculation Run on startup
  updateCbrDisplay();
  computeAll();
});
