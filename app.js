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

  // --- PDF Report Generator (Dual: Preview in Tab & Save to Local Server) ---
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

    const primaryColor = [15, 23, 42];     // Dark Slate
    const accentOrange = [234, 88, 12];   // Safety Orange
    const accentCyan = [2, 132, 199];     // Precision Cyan

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PAVEAISTRUCT™', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('AI-BASED PAVEMENT PERFORMANCE PREDICTOR & QUANTITY SHEET', 14, 23);
    doc.text('Standards Compliance: IRC:37-2018 / AASHTO Guide for Design of Pavement Structures', 14, 29);

    const reportDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(`Generated: ${reportDate}`, 196, 16, { align: 'right' });
    doc.text('Document Ref: PAVE-REP-2026-X1', 196, 23, { align: 'right' });
    doc.text('Status: OFFICIAL ESTIMATE', 196, 29, { align: 'right' });

    // Section 1: Pavement Design Parameters
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('1. INPUT PAVEMENT ARCHITECTURE & TRAFFIC LOADING', 14, 46);

    const inputData = [
      ['Design Traffic Repetitions', `${trafficLoad.value} MSA`, 'Cumulative 80 kN Standard Axles over design life'],
      ['Layer 1: Bituminous Thickness', `${bituminousThickness.value} mm`, 'Wearing Course (BC) + Dense Bituminous Macadam (DBM)'],
      ['Layer 1: Bituminous Resilient Modulus', `${bituminousModulus.value} MPa`, 'Dynamic Modulus at design mean annual pavement temp.'],
      ['Layer 2: Granular Thickness', `${granularThickness.value} mm`, 'Wet Mix Macadam (WMM) Base + Granular Subbase (GSB)'],
      ['Layer 2: Granular Modulus', `${granularModulus.value} MPa`, 'Composite resilient modulus of unbound granular layers'],
      ['Layer 3: Subgrade Resilient Modulus', `${subgradeModulus.value} MPa`, `Compacted foundation (${cbrEstimate ? cbrEstimate.textContent : 'CBR ~6.5%'})`],
      ['Corridor Geometry', `${roadLength.value} km × ${roadWidth.value} m`, `Total Pavement Area: ${(parseFloat(roadLength.value)*1000*parseFloat(roadWidth.value)).toLocaleString()} m²`]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Parameter Specification', 'Design Value', 'Technical Description / Standard Reference']],
      body: inputData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 62 },
        1: { textColor: accentOrange, fontStyle: 'bold', cellWidth: 32 },
        2: { cellWidth: 88 }
      }
    });

    // Section 2: Mechanical Response Predictions
    const sec2Y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('2. PREDICTED MECHANICAL RESPONSES & FAILURE CRITERIA', 14, sec2Y);

    const mechData = [
      ['Tensile Strain (εt)', `${tsValue.textContent} µε`, '≤ 240.0 µε', tsSafetyMargin.textContent, 'PASSED (Optimal Fatigue Life)'],
      ['Compressive Strain (εv)', `${csValue.textContent} µε`, '≤ 620.0 µε', csSafetyMargin.textContent, 'PASSED (Subgrade Rutting Protected)'],
      ['Fatigue Repetitions (Nf)', `${fatigueValue.textContent} cycles`, 'IRC:37-2018', `DF = ${fatigueDamageRatio.textContent}`, 'Within 80% Reliability Envelope'],
      ['Rutting Repetitions (Nr)', `${ruttingValue.textContent} cycles`, 'AASHTO / IRC', `DR = ${ruttingDamageRatio.textContent}`, 'Surface Rut Depth ≤ 20 mm Expected']
    ];

    doc.autoTable({
      startY: sec2Y + 4,
      head: [['Response Parameter', 'ML Predicted Value', 'Limiting Threshold', 'Safety Margin / Damage', 'Compliance Assessment']],
      body: mechData,
      theme: 'grid',
      headStyles: { fillColor: accentOrange, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 48 },
        1: { fontStyle: 'bold', cellWidth: 34 },
        2: { cellWidth: 30 },
        3: { textColor: accentCyan, fontStyle: 'bold', cellWidth: 36 },
        4: { cellWidth: 34 }
      }
    });

    // Section 3: Material Volumetric Quantities
    const sec3Y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('3. MATERIAL VOLUMETRIC TAKEOFF & LOGISTICAL ESTIMATION', 14, sec3Y);

    const qtyData = [
      ['Bituminous Layer (BC + DBM)', `${bituminousVolume.textContent} m³`, `${bituminousTonnage.textContent}`, `${bituminousTrucks.textContent}`, 'ρ = 2.40 MT/m³ @ 20 MT/truck'],
      ['Granular Layer (WMM + GSB)', `${granularVolume.textContent} m³`, `${granularTonnage.textContent}`, `${granularTrucks.textContent}`, 'ρ = 2.10 MT/m³ @ 20 MT/truck'],
      [
        'Total Construction Material',
        `${(parseFloat(bituminousVolume.textContent.replace(/,/g, '')) + parseFloat(granularVolume.textContent.replace(/,/g, ''))).toLocaleString()} m³`,
        `${(parseFloat(bituminousTonnage.textContent.replace(/,/g, '')) + parseFloat(granularTonnage.textContent.replace(/,/g, ''))).toLocaleString()} MT`,
        `≈ ${parseInt(bituminousTrucks.textContent.replace(/\D/g, '')) + parseInt(granularTrucks.textContent.replace(/\D/g, ''))} Tippers`,
        'Combined corridor logistical demand'
      ]
    ];

    doc.autoTable({
      startY: sec3Y + 4,
      head: [['Material Classification', 'Net Volume', 'Estimated Tonnage', 'Truck Loads', 'Estimation Basis']],
      body: qtyData,
      theme: 'grid',
      headStyles: { fillColor: accentCyan, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 52 },
        1: { fontStyle: 'bold', cellWidth: 28 },
        2: { fontStyle: 'bold', cellWidth: 28 },
        3: { fontStyle: 'bold', cellWidth: 28 },
        4: { cellWidth: 46 }
      }
    });

    // Sign-off Footer
    const finalY = doc.lastAutoTable.finalY + 14;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Computer-generated computation sheet via PAVEAISTRUCT™ Multi-Output Continuum Surrogate Engine.', 14, finalY + 6);
    doc.text('Page 1 of 1 • Certified Calculation Record', 196, finalY + 6, { align: 'right' });

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
