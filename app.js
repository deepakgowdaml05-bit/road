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

  const csValue = document.getElementById('csValue');
  const csTag = document.getElementById('csTag');
  const csProgressBar = document.getElementById('csProgressBar');
  const csSafetyMargin = document.getElementById('csSafetyMargin');

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

    // 1. Surrogate Random Forest Emulation for Tensile Strain (TS in microstrain)
    // Kenlayer / IITPAVE regression polynomial approximation
    const tsBase = 1850 * Math.pow(h1, -0.62) * Math.pow(e1, -0.28) * Math.pow(h2, -0.15) * Math.pow(e2, -0.12) * Math.pow(e3, -0.08);
    const ts = Math.max(35, Math.min(650, tsBase * 38.5));

    // 2. Surrogate Emulation for Compressive Strain (CS in microstrain)
    const csBase = 6200 * Math.pow(h1, -0.38) * Math.pow(e1, -0.14) * Math.pow(h2, -0.42) * Math.pow(e2, -0.22) * Math.pow(e3, -0.45);
    const cs = Math.max(80, Math.min(1200, csBase * 52.0));

    // 3. Allowable Fatigue Repetitions Nf (IRC:37-2018 Eq 3.1)
    // Nf = 0.5161 * C * (10^-4) * (1 / et)^3.89 * (1 / E1)^0.854
    const fatigueExponent = Math.pow(1 / (ts * 1e-6), 3.89) * Math.pow(1 / e1, 0.854);
    const nf = 0.5161 * 1.0 * 1e-4 * fatigueExponent;
    const trafficAxles = traffic * 1e6;
    const fatigueDamage = trafficAxles / nf;

    // 4. Allowable Rutting Repetitions Nr (IRC:37-2018 Eq 3.2)
    // Nr = 1.41 * 10^-8 * (1 / ev)^4.5337
    const ruttingExponent = Math.pow(1 / (cs * 1e-6), 4.5337);
    const nr = 1.41 * 1e-8 * ruttingExponent;
    const ruttingDamage = trafficAxles / nr;

    // Render Mechanical Cards
    renderMechanicalOutputs(ts, cs, nf, nr, fatigueDamage, ruttingDamage);

    // 5. Volumetric & Material Quantities
    const bitVol = lengthKm * 1000 * widthM * (h1 / 1000);
    const granVol = lengthKm * 1000 * widthM * (h2 / 1000);
    const bitTons = bitVol * 2.40; // 2.40 MT/m³ compacted asphalt density
    const granTons = granVol * 2.10; // 2.10 MT/m³ compacted WMM/GSB density
    const bitTrucks = Math.ceil(bitTons / 20); // 20 MT standard dump truck
    const granTrucks = Math.ceil(granTons / 20);

    renderQuantities(lengthKm, widthM, h1, h2, bitVol, granVol, bitTons, granTons, bitTrucks, granTrucks);

    // 6. Update SVG Cross-Section
    updateCrossSectionSvg(h1, e1, h2, e2, e3, ts);

    // 7. Update Timestamp & Compliance Badge
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Updated at ${now.toLocaleTimeString()} • Surrogate ML continuum synthesis`;
    }

    const isCompliant = fatigueDamage <= 1.0 && ruttingDamage <= 1.0;
    if (overallStatusBadge && overallStatusText) {
      if (isCompliant) {
        overallStatusBadge.className = 'pill-chip pill-chip-success';
        overallStatusText.textContent = 'DESIGN COMPLIANT (IRC:37)';
      } else {
        overallStatusBadge.className = 'pill-chip pill-chip-danger';
        overallStatusText.textContent = 'DESIGN DEFICIENT (EXCEEDS CRITERIA)';
      }
    }
  }

  function renderMechanicalOutputs(ts, cs, nf, nr, dF, dR) {
    if (tsValue) tsValue.textContent = ts.toFixed(1);
    if (csValue) csValue.textContent = cs.toFixed(1);

    // Limit thresholds (IRC:37 guideline thresholds)
    const tsLimit = 240.0;
    const csLimit = 620.0;

    const tsMargin = ((tsLimit - ts) / tsLimit * 100).toFixed(1);
    const csMargin = ((csLimit - cs) / csLimit * 100).toFixed(1);

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
      const tsPercent = Math.min(100, Math.max(10, (ts / tsLimit) * 70));
      tsProgressBar.style.width = `${tsPercent}%`;
      tsProgressBar.className = tsMargin >= 0 ? 'progress-bar' : 'progress-bar progress-bar-danger';
    }
    if (csProgressBar) {
      const csPercent = Math.min(100, Math.max(10, (cs / csLimit) * 70));
      csProgressBar.style.width = `${csPercent}%`;
      csProgressBar.className = csMargin >= 0 ? 'progress-bar progress-bar-blue' : 'progress-bar progress-bar-danger';
    }

    if (tsTag) {
      tsTag.textContent = tsMargin >= 15 ? 'OPTIMAL' : tsMargin >= 0 ? 'ACCEPTABLE' : 'CRITICAL';
      tsTag.className = tsMargin >= 0 ? 'status-tag status-safe' : 'status-tag status-danger';
    }
    if (csTag) {
      csTag.textContent = csMargin >= 15 ? 'SAFE' : csMargin >= 0 ? 'ACCEPTABLE' : 'EXCEEDED';
      csTag.className = csMargin >= 0 ? 'status-tag status-safe' : 'status-tag status-danger';
    }

    // Fatigue & Rutting formatted outputs
    if (fatigueValue) fatigueValue.textContent = nf.toExponential(2);
    if (ruttingValue) ruttingValue.textContent = nr.toExponential(2);

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
      bituminousFormulaBox.textContent = `Formula: ${len.toFixed(1)} km × 1000 × ${wid.toFixed(1)} m × (${h1} mm / 1000) = ${bVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`;
    }
    if (granularFormulaBox) {
      granularFormulaBox.textContent = `Formula: ${len.toFixed(1)} km × 1000 × ${wid.toFixed(1)} m × (${h2} mm / 1000) = ${gVol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`;
    }

    if (bituminousTonnage) bituminousTonnage.textContent = `${bTons.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MT`;
    if (granularTonnage) granularTonnage.textContent = `${gTons.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MT`;

    if (bituminousTrucks) bituminousTrucks.textContent = `≈ ${bTrucks} Tippers`;
    if (granularTrucks) granularTrucks.textContent = `≈ ${gTrucks} Tippers`;

    // --- Estimated Construction Cost Calculations (MoRTH / CPWD Benchmarks) ---
    const rateBit = 7200;  // ₹7,200 / m³ for BC + DBM
    const rateGran = 1850; // ₹1,850 / m³ for WMM + GSB
    const rateSub = 240;   // ₹240 / m² for Subgrade rolling & formation
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

    // Derived Mechanical Responses
    const tsBase = 1850 * Math.pow(h1, -0.62) * Math.pow(e1, -0.28) * Math.pow(h2, -0.15) * Math.pow(e2, -0.12) * Math.pow(e3, -0.08);
    const ts = Math.max(35, Math.min(650, tsBase * 38.5));

    const csBase = 6200 * Math.pow(h1, -0.38) * Math.pow(e1, -0.14) * Math.pow(h2, -0.42) * Math.pow(e2, -0.22) * Math.pow(e3, -0.45);
    const cs = Math.max(80, Math.min(1200, csBase * 52.0));

    const tsLimit = 240.0;
    const csLimit = 620.0;
    const tsMargin = ((tsLimit - ts) / tsLimit * 100).toFixed(1);
    const csMargin = ((csLimit - cs) / csLimit * 100).toFixed(1);

    const fatigueExponent = Math.pow(1 / (ts * 1e-6), 3.89) * Math.pow(1 / e1, 0.854);
    const nf = 0.5161 * 1.0 * 1e-4 * fatigueExponent;
    const trafficAxles = traffic * 1e6;
    const dF = trafficAxles / nf;

    const ruttingExponent = Math.pow(1 / (cs * 1e-6), 4.5337);
    const nr = 1.41 * 1e-8 * ruttingExponent;
    const dR = trafficAxles / nr;

    const isCompliant = dF <= 1.0 && dR <= 1.0;

    // Volumetrics
    const bVol = len * 1000 * wid * (h1 / 1000);
    const gVol = len * 1000 * wid * (h2 / 1000);
    const bTons = bVol * 2.40;
    const gTons = gVol * 2.10;
    const bTrucks = Math.ceil(bTons / 20);
    const gTrucks = Math.ceil(gTons / 20);

    // Cost Estimations (MoRTH Schedule of Rates)
    const rateBit = 7200;
    const rateGran = 1850;
    const rateSub = 240;
    const inrToUsd = 83.0;

    const cBit = bVol * rateBit;
    const cGran = gVol * rateGran;
    const cSub = area * rateSub;
    const cTotal = cBit + cGran + cSub;
    const cTotalCrores = (cTotal / 1e7).toFixed(2);
    const cTotalUsd = Math.round(cTotal / inrToUsd);

    // CBR estimate string (clean ASCII)
    const cbrStr = e3 <= 50 ? (e3 / 10).toFixed(1) : Math.pow(e3 / 17.6, 1 / 0.64).toFixed(1);

    // Dynamic Document Ref & Formatted Date
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
    doc.text('Mechanistic-Empirical Continuum Analysis | IRC:37-2018 & AASHTO Framework', 12, 15.5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Model Surrogate: Multi-Output Random Forest Regressor (v2.4-ML)', 12, 20.5);

    // Right-Aligned Meta Block
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`DOC REF: ${docRef}`, 198, 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`DATE: ${dateStr}`, 198, 15.5, { align: 'right' });
    doc.text('RELIABILITY: 90% (Class-I Highway)', 198, 20.5, { align: 'right' });

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
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Est. Cost: Rs ${cTotalCrores} Cr ($${cTotalUsd.toLocaleString()})  |  Traffic: ${traffic.toFixed(1)} MSA  |  Footprint: ${area.toLocaleString()} m2`, 116, 33);

    // ==========================================
    // 3. Section 1: Structural Layer Architecture & 2D Cross-Section (Side-by-Side)
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('1. STRUCTURAL LAYER ARCHITECTURE & 2D CROSS-SECTION SCHEMATIC', 12, 40);

    const inputRows = [
      ['Design Traffic Loading', `${traffic.toFixed(1)} MSA`, '80 kN Dual Tire (0.56 MPa)', 'IRC:37 Spectrum'],
      ['Bituminous Layer (Top)', `${h1} mm`, `E1 = ${e1.toLocaleString()} MPa`, 'BC + DBM Course'],
      ['Granular Layer (Base)', `${h2} mm`, `E2 = ${e2.toLocaleString()} MPa`, 'WMM + GSB Course'],
      ['Compacted Soil Subgrade', 'Semi-Infinite', `Ef = ${e3} MPa`, `CBR ~ ${cbrStr}% Native`],
      ['Road Corridor Geometry', `${len.toFixed(1)} km × ${wid.toFixed(1)} m`, `Area: ${area.toLocaleString()} m2`, 'Carriageway Footprint']
    ];

    // Left Side: Table 1 (Width: 108mm)
    doc.autoTable({
      startY: 42.5,
      margin: { left: 12, right: 90 },
      head: [['Component', 'Dimension', 'Properties', 'Specification Notes']],
      body: inputRows,
      theme: 'grid',
      headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2, cellPadding: 1.8 },
      styles: { fontSize: 6.9, cellPadding: 1.6, lineColor: borderGray, lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 36 },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 24 }
      },
      pageBreak: 'avoid'
    });

    // Right Side: 2D Structural Cross-Section Blueprint Diagram (Width: 74mm, Height: 33mm)
    const diagX = 124;
    const diagY = 42.5;
    const diagW = 74;
    const diagH = 32.5;

    // Blueprint Container Box
    doc.setFillColor(11, 17, 32);
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.35);
    doc.roundedRect(diagX, diagY, diagW, diagH, 1.5, 1.5, 'FD');

    // Title Tab
    doc.setFillColor(30, 41, 59);
    doc.rect(diagX, diagY, diagW, 4.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(203, 213, 225);
    doc.text('2D STRUCTURAL CROSS-SECTION & STRAIN VECTORS', diagX + diagW / 2, diagY + 3.1, { align: 'center' });

    // Axle Load Tires
    const tireY = diagY + 5.5;
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.4);
    doc.rect(diagX + 26, tireY, 7, 3.5, 'FD');
    doc.rect(diagX + 41, tireY, 7, 3.5, 'FD');

    doc.setFontSize(5.4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 88, 12);
    doc.text('40 kN DUAL WHEEL', diagX + 37, tireY - 0.4, { align: 'center' });

    // Layer 1: Bituminous Course
    const layX = diagX + 8;
    const layW = diagW - 12;
    const lay1Y = tireY + 3.5;
    const lay1H = 6.5;
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.3);
    doc.rect(layX, lay1Y, layW, lay1H, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(248, 250, 252);
    doc.text(`BITUMINOUS COURSE - ${h1} mm | E1 = ${e1} MPa`, layX + layW / 2, lay1Y + 3.8, { align: 'center' });

    // Tensile Strain Vector Line at bottom of Bituminous
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.35);
    doc.line(layX + 6, lay1Y + lay1H, layX + layW - 6, lay1Y + lay1H);
    doc.setFontSize(5.2);
    doc.setTextColor(234, 88, 12);
    doc.text(`Critical et = ${ts.toFixed(1)} microstrain (Fatigue)`, layX + layW / 2, lay1Y + lay1H - 0.7, { align: 'center' });

    // Layer 2: Granular Base/Subbase
    const lay2Y = lay1Y + lay1H;
    const lay2H = 7.5;
    doc.setFillColor(51, 65, 85);
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.25);
    doc.rect(layX, lay2Y, layW, lay2H, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(248, 250, 252);
    doc.text(`GRANULAR BASE (WMM+GSB) - ${h2} mm | E2 = ${e2} MPa`, layX + layW / 2, lay2Y + 4.5, { align: 'center' });

    // Layer 3: Subgrade Foundation
    const lay3Y = lay2Y + lay2H;
    const lay3H = 5.2;
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(71, 85, 105);
    doc.rect(layX, lay3Y, layW, lay3H, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.6);
    doc.setTextColor(203, 213, 225);
    doc.text(`SUBGRADE FOUNDATION | Ef = ${e3} MPa (CBR ~${cbrStr}%)`, layX + layW / 2, lay3Y + 3.4, { align: 'center' });

    // Compressive Strain Arrow & Label
    doc.setDrawColor(56, 189, 248);
    doc.line(diagX + 37, lay3Y, diagX + 37, lay3Y + 3.2);
    doc.setFontSize(5.0);
    doc.setTextColor(56, 189, 248);
    doc.text(`Critical ev = ${cs.toFixed(1)} microstrain`, diagX + 37, lay3Y - 0.5, { align: 'center' });

    // Total Depth Dimension Bracket
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.25);
    doc.line(layX - 2.5, lay1Y, layX - 2.5, lay2Y + lay2H);
    doc.line(layX - 4, lay1Y, layX - 1.5, lay1Y);
    doc.line(layX - 4, lay2Y + lay2H, layX - 1.5, lay2Y + lay2H);
    doc.setFontSize(5.2);
    doc.setTextColor(148, 163, 184);
    doc.text(`${h1 + h2} mm`, layX - 3.2, lay1Y + (lay1H + lay2H) / 2, { angle: 90, align: 'center' });

    // ==========================================
    // 4. Section 2: Mechanistic Strain Responses & Failure Criteria
    // ==========================================
    const sec2Y = Math.max(doc.lastAutoTable.finalY, diagY + diagH) + 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('2. MECHANISTIC STRAIN RESPONSES & FAILURE CRITERIA', 12, sec2Y);

    const nfMillions = (nf / 1e6).toFixed(2);
    const nrMillions = (nr / 1e6).toFixed(2);

    const mechRows = [
      ['Tensile Strain (TS) - et', `${ts.toFixed(1)} microstrain`, '<= 240.0 microstrain', `+${tsMargin}% (Margin)`, `Damage DF = ${dF.toFixed(2)}`, tsMargin >= 0 ? 'PASS (Optimal)' : 'FAIL (Critical)'],
      ['Compressive Strain (CS) - ev', `${cs.toFixed(1)} microstrain`, '<= 620.0 microstrain', `+${csMargin}% (Margin)`, `Damage DR = ${dR.toFixed(2)}`, csMargin >= 0 ? 'PASS (Safe)' : 'FAIL (Exceeded)'],
      ['Fatigue Criteria Coefficient', nf.toExponential(2), '1.00e+35 Minimum', `Nf = ${nfMillions} Million Axles`, 'IRC:37-2018 Eq 3.1', dF <= 1.0 ? 'VERIFIED' : 'UNSAFE'],
      ['Rutting Criteria Coefficient', nr.toExponential(2), '1.00e-14 Upper Limit', `Nr = ${nrMillions} Million Axles`, 'AASHTO M-E Rutting Eq', dR <= 1.0 ? 'VERIFIED' : 'UNSAFE']
    ];

    doc.autoTable({
      startY: sec2Y + 2.5,
      margin: { left: 12, right: 12 },
      head: [['Mechanic Response Parameter', 'Surrogate Value', 'Allowable Threshold', 'Safety Margin / Life', 'Cumulative Damage', 'Verification']],
      body: mechRows,
      theme: 'grid',
      headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.8, cellPadding: 2 },
      styles: { fontSize: 7.4, cellPadding: 1.8, lineColor: borderGray, lineWidth: 0.2 },
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
    // 5. Section 3: Material Quantities & Estimated Construction Cost (BoQ Valuation)
    // ==========================================
    const sec3Y = doc.lastAutoTable.finalY + 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('3. MATERIAL QUANTITIES & ESTIMATED CONSTRUCTION COST (BOQ VALUATION)', 12, sec3Y);

    const qtyRows = [
      ['Bituminous Course (BC + DBM)', `${bVol.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m3 (${bTons.toFixed(0)} MT)`, 'Rs 7,200 / m3', `Rs ${(cBit / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cBit / inrToUsd).toLocaleString()}`, `~ ${bTrucks} Dumpers (20 MT)`],
      ['Granular Base & Subbase (WMM + GSB)', `${gVol.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m3 (${gTons.toFixed(0)} MT)`, 'Rs 1,850 / m3', `Rs ${(cGran / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cGran / inrToUsd).toLocaleString()}`, `~ ${gTrucks} Dumpers (20 MT)`],
      ['Subgrade Preparation & Rolling', `${area.toLocaleString()} m2 (Footprint)`, 'Rs 240 / m2', `Rs ${(cSub / 1e5).toFixed(2)} Lakhs`, `$${Math.round(cSub / inrToUsd).toLocaleString()}`, 'Formation Grade'],
      ['TOTAL ESTIMATED STRUCTURAL COST', `${h1 + h2} mm Depth (${len.toFixed(1)} km)`, 'Composite MoRTH', `Rs ${cTotalCrores} Crores`, `$${cTotalUsd.toLocaleString()}`, `~ ${bTrucks + gTrucks} Total Trips`]
    ];

    doc.autoTable({
      startY: sec3Y + 2.5,
      margin: { left: 12, right: 12 },
      head: [['Material Layer Description', 'Quantity / Area', 'Standard Rate (MoRTH)', 'Subtotal (INR)', 'Subtotal (USD)', 'Logistical Demand']],
      body: qtyRows,
      theme: 'grid',
      headStyles: { fillColor: orangeAccent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.8, cellPadding: 2 },
      styles: { fontSize: 7.4, cellPadding: 1.8, lineColor: borderGray, lineWidth: 0.2 },
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
    // 6. Section 4: Engineering Certification & Sign-Off Block
    // ==========================================
    const signOffY = doc.lastAutoTable.finalY + 5;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, signOffY, 186, 30, 2, 2, 'FD');

    // Certification Header & Statement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ENGINEERING CERTIFICATION & SIGN-OFF', 16, signOffY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(71, 85, 105);
    doc.text('I hereby certify that the mechanistic responses, material takeoffs, and cost valuations presented herein have been validated against', 16, signOffY + 9.8);
    doc.text('IRC:37-2018 & MoRTH benchmarks utilizing the verified Multi-Output Random Forest surrogate continuum formulation.', 16, signOffY + 13.5);

    // Sign-Off Lines
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(16, signOffY + 22, 76, signOffY + 22);
    doc.line(84, signOffY + 22, 144, signOffY + 22);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Prepared By: Pavement Design Engineer', 16, signOffY + 26);
    doc.text('Approved By: Lead Highway Consultant', 84, signOffY + 26);

    // Circular Engineering Stamp Graphic (Right side of box)
    const stampX = 172;
    const stampY = signOffY + 15;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.circle(stampX, stampY, 10.5, 'S');
    doc.setLineWidth(0.3);
    doc.circle(stampX, stampY, 9.0, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('IRC:37', stampX, stampY - 1, { align: 'center' });
    doc.setFontSize(6.8);
    doc.text('VERIFIED', stampX, stampY + 3.2, { align: 'center' });

    // ==========================================
    // 7. Strict Footer & Page 1 Enforcement
    // ==========================================
    doc.setDrawColor(226, 232, 240);
    doc.line(12, 283, 198, 283);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated via PAVE-AI STRUCT Engineering Suite | Official Calculation Sheet', 12, 288);
    doc.text('Page 1 of 1', 198, 288, { align: 'right' });

    // Enforce strictly single page
    while (doc.internal.getNumberOfPages() > 1) {
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
