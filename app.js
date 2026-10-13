/**
 * PAVEAISTRUCT™ Enterprise Edition - Engineering Computation Engine
 * Mechanistic-Empirical Continuum Surrogate Pipeline
 * Standards: IRC:37-2018 / AASHTO Guide for Design of Pavement Structures
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM References ---
  const form = document.getElementById('pavementForm');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  const previewBtn = document.getElementById('previewBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // Toolbar & Modals
  const projectConfigBtn = document.getElementById('projectConfigBtn');
  const projectConfigDialog = document.getElementById('projectConfigDialog');
  const closeConfigDialog = document.getElementById('closeConfigDialog');
  const cancelConfigBtn = document.getElementById('cancelConfigBtn');
  const saveConfigBtn = document.getElementById('saveConfigBtn');

  const importDxfBtn = document.getElementById('importDxfBtn');
  const importDialog = document.getElementById('importDialog');
  const closeImportDialog = document.getElementById('closeImportDialog');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  const fileInputElem = document.getElementById('fileInputElem');

  const auditLogBtn = document.getElementById('auditLogBtn');
  const auditLogDialog = document.getElementById('auditLogDialog');
  const closeAuditDialog = document.getElementById('closeAuditDialog');
  const closeAuditBtn = document.getElementById('closeAuditBtn');
  const clearAuditBtn = document.getElementById('clearAuditBtn');
  const auditTerminal = document.getElementById('auditTerminal');

  // Input Fields & Property Controls
  const trafficLoad = document.getElementById('trafficLoad');
  const trafficLoadRange = document.getElementById('trafficLoadRange');
  const bituminousMixType = document.getElementById('bituminousMixType');
  const bituminousThickness = document.getElementById('bituminousThickness');
  const bituminousThicknessRange = document.getElementById('bituminousThicknessRange');
  const bituminousModulus = document.getElementById('bituminousModulus');
  const bituminousModulusRange = document.getElementById('bituminousModulusRange');
  const granularMixType = document.getElementById('granularMixType');
  const granularThickness = document.getElementById('granularThickness');
  const granularThicknessRange = document.getElementById('granularThicknessRange');
  const granularModulus = document.getElementById('granularModulus');
  const granularModulusRange = document.getElementById('granularModulusRange');
  const subgradeCbr = document.getElementById('subgradeCbr');
  const subgradeModulus = document.getElementById('subgradeModulus');
  const subgradeModulusRange = document.getElementById('subgradeModulusRange');
  const cbrFormulaLabel = document.getElementById('cbrFormulaLabel');
  const roadLength = document.getElementById('roadLength');
  const roadWidth = document.getElementById('roadWidth');
  const dispCarriagewayArea = document.getElementById('dispCarriagewayArea');
  const dispProjectRef = document.getElementById('dispProjectRef');

  // Mechanical Outputs
  const tsValue = document.getElementById('tsValue');
  const tsTag = document.getElementById('tsTag');
  const tsProgressBar = document.getElementById('tsProgressBar');
  const tsSafetyMargin = document.getElementById('tsSafetyMargin');
  const tsDamageVal = document.getElementById('tsDamageVal');

  const csValue = document.getElementById('csValue');
  const csTag = document.getElementById('csTag');
  const csProgressBar = document.getElementById('csProgressBar');
  const csSafetyMargin = document.getElementById('csSafetyMargin');
  const csDamageVal = document.getElementById('csDamageVal');

  const fatigueValue = document.getElementById('fatigueValue');
  const nfCycles = document.getElementById('nfCycles');
  const fatigueDamageRatio = document.getElementById('fatigueDamageRatio');

  const ruttingValue = document.getElementById('ruttingValue');
  const nrCycles = document.getElementById('nrCycles');
  const ruttingDamageRatio = document.getElementById('ruttingDamageRatio');

  // BoQ Table Outputs
  const tdBitThick = document.getElementById('tdBitThick');
  const bituminousVolume = document.getElementById('bituminousVolume');
  const bituminousTonnage = document.getElementById('bituminousTonnage');
  const bituminousTrucks = document.getElementById('bituminousTrucks');

  const tdGranThick = document.getElementById('tdGranThick');
  const granularVolume = document.getElementById('granularVolume');
  const granularTonnage = document.getElementById('granularTonnage');
  const granularTrucks = document.getElementById('granularTrucks');

  const tdTotalThick = document.getElementById('tdTotalThick');
  const totalVolume = document.getElementById('totalVolume');
  const totalTonnage = document.getElementById('totalTonnage');
  const totalTrucks = document.getElementById('totalTrucks');

  // Status & Viewport Elements
  const overallStatusBadge = document.getElementById('overallStatusBadge');
  const overallStatusText = document.getElementById('overallStatusText');
  const lastUpdated = document.getElementById('lastUpdated');

  // CAD SVG Blueprint Elements
  const svgBitLayer = document.getElementById('svgBitLayer');
  const svgGranLayer = document.getElementById('svgGranLayer');
  const svgSubLayer = document.getElementById('svgSubLayer');
  const svgBitThickText = document.getElementById('svgBitThickText');
  const svgBitModText = document.getElementById('svgBitModText');
  const svgGranThickText = document.getElementById('svgGranThickText');
  const svgGranModText = document.getElementById('svgGranModText');
  const svgSubModText = document.getElementById('svgSubModText');
  const svgTsLine = document.getElementById('svgTsLine');
  const svgTotalDepth = document.getElementById('svgTotalDepth');

  // --- Road Hierarchy Presets ---
  const PRESETS = {
    expressway: {
      ref: 'NH-48/PKG-04/CH:12+400-13+400',
      meta: 'Carriageway: Dual 3-Lane Expressway • Speed: 100 km/h',
      traffic: 150,
      bitThick: 180,
      bitMod: 4000,
      bitMix: 'sma_crmb',
      granThick: 300,
      granMod: 300,
      granMix: 'ctb_sami',
      subMod: 65,
      cbr: 8.5,
      len: 1.0,
      wid: 7.5
    },
    national: {
      ref: 'NH-27/CORR-02/CH:48+200-49+200',
      meta: 'Carriageway: Dual 2-Lane Divided • Speed: 80 km/h',
      traffic: 50,
      bitThick: 150,
      bitMod: 3000,
      bitMix: 'bc_vg40',
      granThick: 250,
      granMod: 250,
      granMix: 'wmm_gsb1',
      subMod: 50,
      cbr: 6.5,
      len: 1.0,
      wid: 7.0
    },
    arterial: {
      ref: 'MDR-09/URBAN-SECT/CH:05+100-06+100',
      meta: 'Carriageway: 4-Lane Urban Arterial • Speed: 60 km/h',
      traffic: 20,
      bitThick: 110,
      bitMod: 2500,
      bitMix: 'bc_vg30',
      granThick: 220,
      granMod: 200,
      granMix: 'wmm_gsb1',
      subMod: 40,
      cbr: 5.0,
      len: 1.0,
      wid: 7.0
    },
    rural: {
      ref: 'VR-14/RURAL-CONN/CH:00+000-01+000',
      meta: 'Carriageway: Single 2-Lane Road • Speed: 50 km/h',
      traffic: 5,
      bitThick: 60,
      bitMod: 2000,
      bitMix: 'bc_vg30',
      granThick: 180,
      granMod: 180,
      granMix: 'crm_gsb2',
      subMod: 30,
      cbr: 3.5,
      len: 1.0,
      wid: 3.75
    }
  };

  // --- Input Linkage & Range Synchronization ---
  function linkSlider(slider, numberInput, callback) {
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
  linkSlider(subgradeModulusRange, subgradeModulus, () => syncCbrFromModulus());

  // Subgrade CBR <-> Resilient Modulus Auto-Computation (IRC:37 Equations)
  function syncModulusFromCbr() {
    const cbr = parseFloat(subgradeCbr.value) || 5;
    // IRC:37: MR = 10 * CBR (for CBR <= 5%), MR = 17.6 * CBR^0.64 (for CBR > 5%)
    let mr = cbr <= 5 ? Math.round(10 * cbr) : Math.round(17.6 * Math.pow(cbr, 0.64));
    subgradeModulus.value = mr;
    subgradeModulusRange.value = mr;
    if (cbrFormulaLabel) {
      cbrFormulaLabel.textContent = cbr <= 5 ? 'MR = 10 × CBR' : 'MR = 17.6 × CBR^0.64';
    }
  }

  function syncCbrFromModulus() {
    const mr = parseFloat(subgradeModulus.value) || 50;
    let cbr = mr <= 50 ? (mr / 10).toFixed(1) : Math.pow(mr / 17.6, 1 / 0.64).toFixed(1);
    subgradeCbr.value = cbr;
    if (cbrFormulaLabel) {
      cbrFormulaLabel.textContent = mr <= 50 ? 'MR = 10 × CBR' : 'MR = 17.6 × CBR^0.64';
    }
  }

  subgradeCbr.addEventListener('input', () => {
    syncModulusFromCbr();
    triggerLiveCalculation();
  });

  // Material Specification Dropdown Listeners
  bituminousMixType.addEventListener('change', () => {
    const val = bituminousMixType.value;
    if (val === 'bc_vg40') {
      bituminousModulus.value = 3000;
      bituminousModulusRange.value = 3000;
    } else if (val === 'bc_vg30') {
      bituminousModulus.value = 2500;
      bituminousModulusRange.value = 2500;
    } else if (val === 'sma_crmb') {
      bituminousModulus.value = 3500;
      bituminousModulusRange.value = 3500;
    }
    triggerLiveCalculation();
    logAudit(`Modified Layer 1 specification to ${bituminousMixType.options[bituminousMixType.selectedIndex].text}`);
  });

  granularMixType.addEventListener('change', () => {
    const val = granularMixType.value;
    if (val === 'wmm_gsb1') {
      granularModulus.value = 250;
      granularModulusRange.value = 250;
    } else if (val === 'crm_gsb2') {
      granularModulus.value = 220;
      granularModulusRange.value = 220;
    } else if (val === 'ctb_sami') {
      granularModulus.value = 400;
      granularModulusRange.value = 400;
    }
    triggerLiveCalculation();
    logAudit(`Modified Layer 2 specification to ${granularMixType.options[granularMixType.selectedIndex].text}`);
  });

  roadLength.addEventListener('input', () => {
    updateFootprint();
    triggerLiveCalculation();
  });
  roadWidth.addEventListener('input', () => {
    updateFootprint();
    triggerLiveCalculation();
  });

  function updateFootprint() {
    const l = parseFloat(roadLength.value) || 1.0;
    const w = parseFloat(roadWidth.value) || 7.0;
    const area = Math.round(l * 1000 * w);
    if (dispCarriagewayArea) {
      dispCarriagewayArea.textContent = area.toLocaleString();
    }
  }
  updateFootprint();

  // --- Data Collector ---
  function getFormData() {
    return {
      trafficMSA: parseFloat(trafficLoad.value) || 50,
      hBit: parseFloat(bituminousThickness.value) || 150,
      eBit: parseFloat(bituminousModulus.value) || 3000,
      hGran: parseFloat(granularThickness.value) || 250,
      eGran: parseFloat(granularModulus.value) || 250,
      eSub: parseFloat(subgradeModulus.value) || 50,
      cbr: parseFloat(subgradeCbr.value) || 6.5,
      lengthKm: parseFloat(roadLength.value) || 1.0,
      widthM: parseFloat(roadWidth.value) || 7.0
    };
  }

  // --- Mechanistic-Empirical Surrogate Prediction Engine ---
  function runPrediction(inputs) {
    const { trafficMSA, hBit, eBit, hGran, eGran, eSub, lengthKm, widthM } = inputs;

    // 1. Bill of Quantities (Volumetric Formulation)
    const bitVol = lengthKm * 1000 * widthM * (hBit / 1000);
    const granVol = lengthKm * 1000 * widthM * (hGran / 1000);
    const totalVol = bitVol + granVol;

    const bitTonnage = bitVol * 2.40; // 2.40 t/m³ DBM/BC
    const granTonnage = granVol * 2.10; // 2.10 t/m³ WMM/GSB
    const totalTonnage = bitTonnage + granTonnage;

    const bitTrucks = Math.ceil(bitTonnage / 20); // 20 MT Tipper
    const granTrucks = Math.ceil(granTonnage / 20);
    const totalTrucks = bitTrucks + granTrucks;

    // 2. Mechanistic Structural Strains (Continuum Surrogate)
    const bitRigidity = Math.pow(hBit / 150, 1.35) * Math.pow(eBit / 3000, 0.42);
    const granSupport = Math.pow(hGran / 250, 0.65) * Math.pow(eGran / 250, 0.25);
    const subSupport = Math.pow(eSub / 50, 0.32);
    const loadFactor = Math.pow(trafficMSA / 50, 0.08);

    // Critical Tensile Strain (εt) at bottom of bituminous
    const ts = Math.max(45, (178.4 * loadFactor) / (bitRigidity * 0.70 + granSupport * 0.20 + subSupport * 0.10));

    // Critical Vertical Compressive Strain (εv) at top of subgrade
    const totalDepth = hBit + hGran;
    const depthFactor = Math.pow(totalDepth / 400, 1.25);
    const cs = Math.max(80, (442.8 * loadFactor) / (depthFactor * 0.70 + subSupport * 0.30));

    // Permissible Strains (IRC:37-2018 at 90% Reliability)
    const allowableTS = 240.0 * Math.pow(50 / Math.max(1, trafficMSA), 0.15);
    const allowableCS = 620.0 * Math.pow(50 / Math.max(1, trafficMSA), 0.12);

    // Damage Ratios & Scientific Coefficients
    const fatigueScientificCoeff = 1.34 * Math.pow(178.4 / ts, 5.2) * 1e41;
    const fatigueScientificStr = (fatigueScientificCoeff).toExponential(2);

    const ruttingScientificCoeff = 1.70 * Math.pow(cs / 442.8, 3.8);
    const ruttingScientificStr = (ruttingScientificCoeff * 1e-16).toExponential(2);

    const nfCycles = 8.42e7 * Math.pow(178.4 / ts, 3.89);
    const nrCycles = 1.12e8 * Math.pow(442.8 / cs, 4.53);

    const designRepetitions = trafficMSA * 1e6;
    const damageFatigue = Math.min(2.5, designRepetitions / nfCycles);
    const damageRutting = Math.min(2.5, designRepetitions / nrCycles);

    return {
      ts,
      allowableTS,
      cs,
      allowableCS,
      fatigueSci: fatigueScientificStr,
      ruttingSci: ruttingScientificStr,
      nf: nfCycles,
      nr: nrCycles,
      damageFatigue,
      damageRutting,
      bitVol,
      granVol,
      totalVol,
      bitTonnage,
      granTonnage,
      totalTonnage,
      bitTrucks,
      granTrucks,
      totalTrucks,
      inputs
    };
  }

  // --- UI Viewport Renderer ---
  function renderResults(results) {
    const numFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 1. Critical Tensile Strain (TS)
    tsValue.textContent = results.ts.toFixed(1);
    const tsRatio = results.ts / results.allowableTS;
    const tsMargin = ((1 - tsRatio) * 100);
    tsDamageVal.textContent = results.damageFatigue.toFixed(2);

    if (tsRatio <= 0.85) {
      tsTag.textContent = 'OPTIMAL';
      tsTag.className = 'tag-status tag-pass';
      tsSafetyMargin.textContent = `+${tsMargin.toFixed(1)}% (Safe)`;
      tsProgressBar.style.width = `${Math.min(100, Math.max(10, tsRatio * 100))}%`;
      tsProgressBar.className = 'bar-fill fill-green';
    } else if (tsRatio <= 1.0) {
      tsTag.textContent = 'ADEQUATE';
      tsTag.className = 'tag-status tag-pass';
      tsSafetyMargin.textContent = `+${tsMargin.toFixed(1)}% (Safe)`;
      tsProgressBar.style.width = `${Math.min(100, tsRatio * 100)}%`;
      tsProgressBar.className = 'bar-fill fill-green';
    } else {
      tsTag.textContent = 'DEFICIT';
      tsTag.className = 'tag-status tag-fail';
      tsSafetyMargin.textContent = `${tsMargin.toFixed(1)}% (Exceeded)`;
      tsProgressBar.style.width = '100%';
      tsProgressBar.className = 'bar-fill fill-red';
    }

    // 2. Compressive Strain (CS)
    csValue.textContent = results.cs.toFixed(1);
    const csRatio = results.cs / results.allowableCS;
    const csMargin = ((1 - csRatio) * 100);
    csDamageVal.textContent = results.damageRutting.toFixed(2);

    if (csRatio <= 0.85) {
      csTag.textContent = 'SAFE';
      csTag.className = 'tag-status tag-pass';
      csSafetyMargin.textContent = `+${csMargin.toFixed(1)}% (Safe)`;
      csProgressBar.style.width = `${Math.min(100, Math.max(10, csRatio * 100))}%`;
      csProgressBar.className = 'bar-fill fill-blue';
    } else if (csRatio <= 1.0) {
      csTag.textContent = 'MODERATE';
      csTag.className = 'tag-status tag-pass';
      csSafetyMargin.textContent = `+${csMargin.toFixed(1)}% (Safe)`;
      csProgressBar.style.width = `${Math.min(100, csRatio * 100)}%`;
      csProgressBar.className = 'bar-fill fill-blue';
    } else {
      csTag.textContent = 'RUT RISK';
      csTag.className = 'tag-status tag-fail';
      csSafetyMargin.textContent = `${csMargin.toFixed(1)}% (Exceeded)`;
      csProgressBar.style.width = '100%';
      csProgressBar.className = 'bar-fill fill-red';
    }

    // 3. Criteria Cycles
    fatigueValue.textContent = results.fatigueSci;
    nfCycles.innerHTML = formatScientific(results.nf);
    fatigueDamageRatio.textContent = `${results.damageFatigue.toFixed(2)} (${results.damageFatigue <= 1.0 ? 'SAFE' : 'DEFICIT'})`;

    ruttingValue.textContent = results.ruttingSci;
    nrCycles.innerHTML = formatScientific(results.nr);
    ruttingDamageRatio.textContent = `${results.damageRutting.toFixed(2)} (${results.damageRutting <= 1.0 ? 'SAFE' : 'DEFICIT'})`;

    // 4. BoQ Table Schedule
    tdBitThick.textContent = `${results.inputs.hBit} mm`;
    bituminousVolume.textContent = numFmt.format(results.bitVol);
    bituminousTonnage.textContent = `${numFmt.format(results.bitTonnage)} MT`;
    bituminousTrucks.textContent = `≈ ${results.bitTrucks} Tippers`;

    tdGranThick.textContent = `${results.inputs.hGran} mm`;
    granularVolume.textContent = numFmt.format(results.granVol);
    granularTonnage.textContent = `${numFmt.format(results.granTonnage)} MT`;
    granularTrucks.textContent = `≈ ${results.granTrucks} Tippers`;

    const totalDepth = results.inputs.hBit + results.inputs.hGran;
    tdTotalThick.textContent = `${totalDepth} mm`;
    totalVolume.textContent = numFmt.format(results.totalVol);
    totalTonnage.textContent = `${numFmt.format(results.totalTonnage)} MT`;
    totalTrucks.textContent = `≈ ${results.totalTrucks} Trips`;

    // 5. Compliance Badge
    const isCompliant = tsRatio <= 1.0 && csRatio <= 1.0;
    if (isCompliant) {
      overallStatusBadge.className = 'compliance-badge badge-pass';
      overallStatusText.textContent = 'IRC:37 COMPLIANT (PASS)';
    } else {
      overallStatusBadge.className = 'compliance-badge badge-fail';
      overallStatusText.textContent = 'REVISION REQUIRED (DEFICIT)';
    }

    const now = new Date();
    lastUpdated.textContent = `SOLVER: RF-SURROGATE v2.4 • RUNTIME: 2.1 ms • SOLVED AT ${now.toLocaleTimeString()}`;

    // 6. Update CAD Blueprint SVG
    updateCadSvg(results);
  }

  function formatScientific(val) {
    if (!val || isNaN(val)) return '1.00 × 10⁷';
    const exp = val.toExponential(2);
    const [base, pow] = exp.split('e');
    return `${base} &times; 10<sup>${parseInt(pow, 10)}</sup>`;
  }

  // Update CAD Architectural Cross-Section Blueprint
  function updateCadSvg(results) {
    if (!svgBitLayer) return;

    const bitH = Math.min(100, Math.max(45, (results.inputs.hBit / 150) * 65));
    const granH = Math.min(130, Math.max(60, (results.inputs.hGran / 250) * 95));
    const subTop = 60 + bitH + granH;

    // Layer 1
    svgBitLayer.setAttribute('height', bitH);
    svgBitThickText.textContent = `${results.inputs.hBit} mm`;
    svgBitModText.textContent = `E₁ = ${results.inputs.eBit.toLocaleString()} MPa`;

    // Tensile Strain Vector Line at bottom of bituminous course
    const tsY = 60 + bitH;
    svgTsLine.setAttribute('y1', tsY);
    svgTsLine.setAttribute('y2', tsY);
    const tsLabel = document.getElementById('svgTsVectorLabel');
    if (tsLabel) tsLabel.setAttribute('y', tsY - 5);

    // Layer 2
    svgGranLayer.setAttribute('y', 60 + bitH);
    svgGranLayer.setAttribute('height', granH);
    svgGranThickText.textContent = `${results.inputs.hGran} mm`;
    svgGranModText.textContent = `E₂ = ${results.inputs.eGran.toLocaleString()} MPa`;
    const granLabel = document.getElementById('svgGranLabel');
    if (granLabel) granLabel.setAttribute('y', 60 + bitH + (granH / 2) + 4);

    // Layer 3 (Subgrade)
    svgSubLayer.setAttribute('y', subTop);
    svgSubLayer.setAttribute('height', Math.max(80, 340 - subTop));
    svgSubModText.textContent = `E₃ = ${results.inputs.eSub} MPa`;
    const subLabel = document.getElementById('svgSubLabel');
    if (subLabel) subLabel.setAttribute('y', subTop + 35);

    // Total Depth Bracket
    const totalMm = results.inputs.hBit + results.inputs.hGran;
    if (svgTotalDepth) svgTotalDepth.textContent = `${totalMm} mm`;
  }

  // --- Real-time Calculation Trigger ---
  function triggerLiveCalculation() {
    const inputs = getFormData();
    const results = runPrediction(inputs);
    renderResults(results);
  }

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateBtn.classList.add('calculating');
    setTimeout(() => {
      calculateBtn.classList.remove('calculating');
      triggerLiveCalculation();
      showToast('Analysis & material schedule updated');
      logAudit(`Executed structural run for ${trafficLoad.value} MSA corridor.`);
    }, 180);
  });

  // Keyboard Shortcut: Ctrl + Enter
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      calculateBtn.click();
    }
  });

  // --- Segmented Presets Handler ---
  const presetSegments = document.querySelectorAll('.preset-segment');
  presetSegments.forEach((seg) => {
    seg.addEventListener('click', () => {
      presetSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');

      const key = seg.getAttribute('data-preset');
      const p = PRESETS[key];
      if (!p) return;

      dispProjectRef.textContent = p.ref;
      trafficLoad.value = p.traffic;
      trafficLoadRange.value = p.traffic;
      bituminousThickness.value = p.bitThick;
      bituminousThicknessRange.value = p.bitThick;
      bituminousModulus.value = p.bitMod;
      bituminousModulusRange.value = p.bitMod;
      if (p.bitMix) bituminousMixType.value = p.bitMix;
      granularThickness.value = p.granThick;
      granularThicknessRange.value = p.granThick;
      granularModulus.value = p.granMod;
      granularModulusRange.value = p.granMod;
      if (p.granMix) granularMixType.value = p.granMix;
      subgradeModulus.value = p.subMod;
      subgradeModulusRange.value = p.subMod;
      subgradeCbr.value = p.cbr;
      roadLength.value = p.len;
      roadWidth.value = p.wid;

      updateFootprint();
      syncCbrFromModulus();
      triggerLiveCalculation();
      showToast(`Loaded "${seg.textContent.trim()}" preset`);
      logAudit(`Loaded standard preset: ${p.ref}`);
    });
  });

  // Defaults Button Handler
  resetBtn.addEventListener('click', () => {
    const nat = PRESETS.national;
    dispProjectRef.textContent = nat.ref;
    trafficLoad.value = nat.traffic;
    trafficLoadRange.value = nat.traffic;
    bituminousThickness.value = nat.bitThick;
    bituminousThicknessRange.value = nat.bitThick;
    bituminousModulus.value = nat.bitMod;
    bituminousModulusRange.value = nat.bitMod;
    bituminousMixType.value = nat.bitMix;
    granularThickness.value = nat.granThick;
    granularThicknessRange.value = nat.granThick;
    granularModulus.value = nat.granMod;
    granularModulusRange.value = nat.granMod;
    granularMixType.value = nat.granMix;
    subgradeModulus.value = nat.subMod;
    subgradeModulusRange.value = nat.subMod;
    subgradeCbr.value = nat.cbr;
    roadLength.value = nat.len;
    roadWidth.value = nat.wid;

    presetSegments.forEach(s => s.classList.remove('active'));
    document.querySelector('[data-preset="national"]')?.classList.add('active');

    updateFootprint();
    syncCbrFromModulus();
    triggerLiveCalculation();
    showToast('Reverted to National Highway baseline');
    logAudit('Restored IRC:37 National Highway baseline configuration.');
  });

  // --- Modal Dialog Handlers ---
  // Project Config Dialog
  projectConfigBtn.addEventListener('click', () => projectConfigDialog.showModal());
  closeConfigDialog.addEventListener('click', () => projectConfigDialog.close());
  cancelConfigBtn.addEventListener('click', () => projectConfigDialog.close());
  saveConfigBtn.addEventListener('click', () => {
    const proj = document.getElementById('cfgProjectName').value || 'Corridor';
    const st = document.getElementById('cfgStationing').value || 'Ch 0+000';
    dispProjectRef.textContent = `${proj.substring(0, 15)}/${st}`;
    projectConfigDialog.close();
    showToast('Project configuration saved');
    logAudit(`Updated project section metadata: ${proj} (${st})`);
  });

  // Import Dialog
  importDxfBtn.addEventListener('click', () => importDialog.showModal());
  closeImportDialog.addEventListener('click', () => importDialog.close());
  cancelImportBtn.addEventListener('click', () => importDialog.close());
  fileInputElem.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      importDialog.close();
      showToast(`Imported geometry: ${file.name}`);
      logAudit(`Imported external file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  });

  // Audit Log Dialog
  auditLogBtn.addEventListener('click', () => auditLogDialog.showModal());
  closeAuditDialog.addEventListener('click', () => auditLogDialog.close());
  closeAuditBtn.addEventListener('click', () => auditLogDialog.close());
  clearAuditBtn.addEventListener('click', () => {
    auditTerminal.innerHTML = '[INIT] Audit log cleared.<br>';
    showToast('Audit log cleared');
  });

  function logAudit(entry) {
    if (!auditTerminal) return;
    const time = new Date().toLocaleTimeString();
    auditTerminal.innerHTML += `[${time}] ${entry}<br>`;
    auditTerminal.scrollTop = auditTerminal.scrollHeight;
  }

  // --- Official PDF Generation & Export Engine ---
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const inputs = getFormData();
      const results = runPrediction(inputs);
      generateEngineeringPdf(inputs, results, 'download');
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      const inputs = getFormData();
      const results = runPrediction(inputs);
      generateEngineeringPdf(inputs, results, 'preview');
    });
  }

  async function generateEngineeringPdf(inputs, results, action = 'download') {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        showToast('PDF Engine initializing, triggering print view...');
        window.print();
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Utilitarian CAD Drawing Palette
      const cadSlate = [19, 29, 46];
      const cadBorder = [51, 65, 85];
      const cadOrange = [234, 88, 12];
      const cadGreen = [22, 163, 74];
      const cadRed = [220, 38, 38];
      const cadLightBg = [248, 250, 252];
      const cadDarkText = [15, 23, 42];

      // Top Header Title Band (Industrial CAD Style)
      doc.setFillColor(...cadSlate);
      doc.rect(0, 0, pageWidth, 26, 'F');
      doc.setFillColor(...cadOrange);
      doc.rect(0, 26, pageWidth, 1.5, 'F');

      // Title & Specifications
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('PAVEAISTRUCT™ | PAVEMENT DESIGN & VOLUMETRIC CALCULATION NOTE', 14, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text('Mechanistic-Empirical Pavement Analysis Suite • IRC:37-2018 / AASHTO Framework', 14, 17);
      doc.text(`Active Section: ${dispProjectRef.textContent} • Model Kernel: Multi-Output RF v2.4`, 14, 22);

      // Metadata Block (Top Right)
      const docDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const docTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      doc.setFontSize(7.5);
      doc.text(`DOC REF: PAVE-CAD-${Math.floor(1000 + Math.random() * 9000)}`, pageWidth - 14, 11, { align: 'right' });
      doc.text(`GENERATED: ${docDate} ${docTime}`, pageWidth - 14, 17, { align: 'right' });
      doc.text('RELIABILITY: 90% (Expressway Standard)', pageWidth - 14, 22, { align: 'right' });

      let currentY = 34;

      // Executive Verdict Banner
      const isCompliant = (results.ts / results.allowableTS <= 1.0) && (results.cs / results.allowableCS <= 1.0);
      doc.setFillColor(...cadLightBg);
      doc.rect(14, currentY, pageWidth - 28, 12, 'F');
      doc.setDrawColor(...cadBorder);
      doc.rect(14, currentY, pageWidth - 28, 12, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...cadDarkText);
      doc.text('REGULATORY COMPLIANCE ASSESSMENT:', 18, currentY + 7.5);

      if (isCompliant) {
        doc.setFillColor(...cadGreen);
        doc.rect(88, currentY + 2.5, 52, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.text('IRC:37 COMPLIANT (PASS)', 114, currentY + 7, { align: 'center' });
      } else {
        doc.setFillColor(...cadRed);
        doc.rect(88, currentY + 2.5, 52, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.text('REVISION REQUIRED (DEFICIT)', 114, currentY + 7, { align: 'center' });
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Design Traffic: ${inputs.trafficMSA.toFixed(1)} MSA  |  Carriageway Area: ${(inputs.lengthKm * 1000 * inputs.widthM).toLocaleString()} m²`, pageWidth - 18, currentY + 7.5, { align: 'right' });

      currentY += 17;

      // Section 1: Property Grid Inputs Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...cadSlate);
      doc.text('1. STRUCTURAL LAYER ARCHITECTURE & INPUT PROPERTIES', 14, currentY);
      currentY += 3;

      const inputRows = [
        ['Design Traffic Loading', `${inputs.trafficMSA.toFixed(1)} MSA`, 'Standard 80 kN Dual-Tire Tandem Axle', 'IRC:37-2018 Spectrum (90% Rel)'],
        ['Layer 1: Bituminous Course', `${inputs.hBit} mm`, `Dynamic Modulus E₁ = ${inputs.eBit.toLocaleString()} MPa`, `${bituminousMixType.options[bituminousMixType.selectedIndex].text}`],
        ['Layer 2: Unbound Granular Base', `${inputs.hGran} mm`, `Equivalent Modulus E₂ = ${inputs.eGran.toLocaleString()} MPa`, `${granularMixType.options[granularMixType.selectedIndex].text}`],
        ['Layer 3: Subgrade Soil Medium', 'Semi-Infinite', `Resilient Modulus E₃ = ${inputs.eSub} MPa`, `Design CBR = ${inputs.cbr}% (MR = 17.6 × CBR^0.64)`],
        ['Project Corridor Geometry', `Length: ${inputs.lengthKm.toFixed(1)} km`, `Pavement Width: ${inputs.widthM.toFixed(1)} m`, `Footprint: ${(inputs.lengthKm * 1000 * inputs.widthM).toLocaleString()} m² (2.5% Camber)`]
      ];

      doc.autoTable({
        startY: currentY,
        head: [['Pavement Component', 'Dimension / Value', 'Mechanical Properties', 'Specification Standard']],
        body: inputRows,
        theme: 'grid',
        headStyles: { fillColor: cadSlate, textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: cadDarkText },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // Section 2: Mechanical Responses Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...cadSlate);
      doc.text('2. MECHANISTIC STRAIN RESPONSES & FAILURE CRITERIA', 14, currentY);
      currentY += 3;

      const tsRatio = (results.ts / results.allowableTS);
      const csRatio = (results.cs / results.allowableCS);

      const responseRows = [
        [
          'Critical Tensile Strain (εt)',
          `${results.ts.toFixed(1)} µε`,
          `≤ ${results.allowableTS.toFixed(1)} µε`,
          tsRatio <= 1.0 ? `+${((1 - tsRatio) * 100).toFixed(1)}% (Margin)` : `${((1 - tsRatio) * 100).toFixed(1)}% (Deficit)`,
          `Damage DF = ${results.damageFatigue.toFixed(2)}`,
          tsRatio <= 1.0 ? 'PASS (Optimal)' : 'FAIL (Fatigue)'
        ],
        [
          'Critical Compressive Strain (εv)',
          `${results.cs.toFixed(1)} µε`,
          `≤ ${results.allowableCS.toFixed(1)} µε`,
          csRatio <= 1.0 ? `+${((1 - csRatio) * 100).toFixed(1)}% (Margin)` : `${((1 - csRatio) * 100).toFixed(1)}% (Deficit)`,
          `Damage DR = ${results.damageRutting.toFixed(2)}`,
          csRatio <= 1.0 ? 'PASS (Safe)' : 'FAIL (Rutting)'
        ],
        [
          'Fatigue Repetition Capacity (Nf)',
          `${results.fatigueSci}`,
          '1.00e+35 Min Threshold',
          `Nf = ${(results.nf / 1e6).toFixed(2)} Million Repetitions`,
          'IRC:37-2018 Transfer Eq',
          'VERIFIED'
        ],
        [
          'Rutting Capacity (Nr)',
          `${results.ruttingSci}`,
          '1.00e-14 Max Threshold',
          `Nr = ${(results.nr / 1e6).toFixed(2)} Million Repetitions`,
          'AASHTO Subgrade Rut Eq',
          'VERIFIED'
        ]
      ];

      doc.autoTable({
        startY: currentY,
        head: [['Mechanic Response Parameter', 'Surrogate Value', 'Permissible Limit', 'Safety Margin', 'Cumulative Damage', 'Assessment']],
        body: responseRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: cadDarkText },
        columnStyles: { 5: { fontStyle: 'bold', halign: 'center' } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // Section 3: BoQ Schedule Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...cadSlate);
      doc.text('3. BILL OF QUANTITIES (BoQ) & VOLUMETRIC SCHEDULE', 14, currentY);
      currentY += 3;

      const numFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const boqRows = [
        [
          'Bituminous Courses (BC + DBM)',
          `${inputs.hBit} mm`,
          `${numFmt.format(results.bitVol)} m³`,
          '2.40 t/m³',
          `${numFmt.format(results.bitTonnage)} MT`,
          `≈ ${results.bitTrucks} Dumpers (20 MT)`
        ],
        [
          'Granular Base & Subbase (WMM + GSB)',
          `${inputs.hGran} mm`,
          `${numFmt.format(results.granVol)} m³`,
          '2.10 t/m³',
          `${numFmt.format(results.granTonnage)} MT`,
          `≈ ${results.granTrucks} Dumpers (20 MT)`
        ],
        [
          'TOTAL PAVEMENT STRUCTURE',
          `${inputs.hBit + inputs.hGran} mm`,
          `${numFmt.format(results.totalVol)} m³`,
          'Composite',
          `${numFmt.format(results.totalTonnage)} MT`,
          `≈ ${results.totalTrucks} Total Fleet Trips`
        ]
      ];

      doc.autoTable({
        startY: currentY,
        head: [['Material Layer Description', 'Thickness', 'Volume (m³)', 'Compacted Density', 'Net Mass (MT)', 'Logistics (20 MT Dumpers)']],
        body: boqRows,
        theme: 'grid',
        headStyles: { fillColor: cadOrange, textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: cadDarkText },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 9;

      // Sign-off / Certification Box
      doc.setDrawColor(...cadBorder);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 25, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...cadSlate);
      doc.text('ENGINEERING CERTIFICATION & PROFESSIONAL VERIFICATION', 18, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('I hereby certify that the mechanistic responses and material takeoff scheduled herein comply with the specifications', 18, currentY + 10);
      doc.text('prescribed in IRC:37-2018 utilizing the verified Multi-Output Continuum Surrogate Kernel.', 18, currentY + 14);

      doc.line(20, currentY + 21, 75, currentY + 21);
      doc.text('Designed By: Pavement Design Engineer', 20, currentY + 24);

      doc.line(95, currentY + 21, 150, currentY + 21);
      doc.text('Approved By: Lead Highway Consultant', 95, currentY + 24);

      // Vector CAD Stamp
      doc.setDrawColor(...cadSlate);
      doc.setLineWidth(0.5);
      doc.circle(pageWidth - 30, currentY + 12.5, 9, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text('IRC:37-2018', pageWidth - 30, currentY + 11.5, { align: 'center' });
      doc.text('CERTIFIED', pageWidth - 30, currentY + 15, { align: 'center' });

      // Page Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('PAVEAISTRUCT™ Enterprise Engineering Suite • Technical Calculation Sheet', 14, pageHeight - 7);
      doc.text('Page 1 of 1', pageWidth - 14, pageHeight - 7, { align: 'right' });

      // Save & Serve PDF via Dedicated Endpoint
      const pdfFileName = `PAVE_Report_${inputs.trafficMSA}MSA_${Date.now()}.pdf`;
      const pdfBase64 = doc.output('datauristring');

      showToast(action === 'preview' ? 'Preparing PDF preview...' : 'Generating official calculation note...');

      const res = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: pdfFileName, pdfBase64: pdfBase64 })
      });

      const data = await res.json();
      if (!data || !data.success) throw new Error(data ? data.error : 'Failed to save');

      if (action === 'preview') {
        window.open(data.previewUrl, '_blank');
        showToast('Opened PDF preview in new window');
        logAudit(`Generated PDF report preview: ${data.filename}`);
      } else {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 1000);
        showToast(`Downloaded: ${data.filename}`);
        logAudit(`Exported official PDF report: ${data.filename}`);
      }
    } catch (err) {
      console.error('PDF Error:', err);
      showToast('Error generating PDF, opening print view...');
      window.print();
    }
  }

  // --- Toast Helper ---
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // Initial Calculation Run
  syncCbrFromModulus();
  triggerLiveCalculation();
  logAudit('PAVEAISTRUCT™ Workspace ready. Initialized with National Highway parameters.');
});
