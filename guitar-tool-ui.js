/**
 * ============================================================
 * GUITAR TOOL UI — Acordes Rafa
 * ============================================================
 * Handles all UI rendering for the chord generator & identifier.
 * Depends on: guitar-theory.js (GuitarTheory)
 * ============================================================
 */

// ── State ──
const muteState = [false, false, false, false, false, false];
let selectedVoicingIdx = 0;
let currentChordData = null;
let liveTimer = null;
let isManualInput = false;

// ── Fingering Logic ──

function calculateFingerings(voicing) {
    const nonOpen = voicing.filter(v => v.fret !== 'x' && v.fret > 0);
    if (nonOpen.length === 0) return voicing.map(v => ({ ...v, finger: null }));

    const sortedFrets = [...new Set(nonOpen.map(v => v.fret))].sort((a, b) => a - b);
    const minFret = sortedFrets[0];

    return voicing.map(v => {
        if (v.fret === 'x' || v.fret === 0) return { ...v, finger: null };
        const fretDiff = v.fret - minFret;
        let finger = 1 + fretDiff;
        return { ...v, finger: Math.min(finger, 4) };
    });
}

// ── Unified Tool Logic ──

function clearUnified() {
    isManualInput = true;
    const input = document.getElementById('chordInput');
    if (input) input.value = '';
    for (let i = 0; i < 6; i++) {
        const strInput = document.getElementById('str' + i);
        if (strInput) strInput.value = '';
        muteState[i] = false;
    }
    const res = document.getElementById('unifiedResult');
    if (res) {
        res.innerHTML = `
            <div class="card placeholder">
                <div class="icon">🎸</div>
                <p>Usa el buscador o haz clic en el mástil para comenzar</p>
            </div>`;
    }
    currentChordData = null;
    renderInteractiveFretboard();
    isManualInput = false;
}

function generateChord() {
    isManualInput = false;
    const rawInput = document.getElementById('chordInput').value.trim();
    if (!rawInput) return;
    const input = GuitarTheory.spanishToEnglish(rawInput);
    try {
        const data = GuitarTheory.generateChord(input);
        currentChordData = data;
        selectedVoicingIdx = 0;
        if (data.error) {
            document.getElementById('unifiedResult').innerHTML =
                `<div class="card"><p class="error-msg">⚠️ ${data.error}</p></div>`;
            return;
        }
        renderUnifiedResult(data, true);
    } catch (e) { console.error(e); }
}

function identifyChord(fromClick = false) {
    const frets = [];
    for (let i = 0; i < 6; i++) {
        const el = document.getElementById('str' + i);
        const val = el ? el.value.trim() : '';
        if (muteState[i] || val === 'x' || val === 'X') frets.push('x');
        else if (val === '') frets.push('x');
        else {
            const n = parseInt(val);
            frets.push(isNaN(n) ? 'x' : n);
        }
    }
    const played = frets.filter(f => f !== 'x');
    if (played.length < 2) return;
    try {
        const result = GuitarTheory.identifyChord(frets);
        if (result.candidates && result.candidates.length > 0) {
            const chordName = result.candidates[0].displayName;
            document.getElementById('chordInput').value = chordName;
            const data = GuitarTheory.generateChord(chordName);
            currentChordData = data;
            selectedVoicingIdx = -1;
            renderUnifiedResult(data, false);
        }
    } catch (e) { console.error(e); }
}

function renderUnifiedResult(data, syncFretboard) {
    const { displayName, chordNotes, formula, voicings } = data;
    const resDiv = document.getElementById('unifiedResult');
    if (!resDiv) return;

    const noteRows = chordNotes.map(cn => {
        const spanNote = GuitarTheory.ENG_TO_SPANISH[cn.note] || cn.note;
        return `<tr>
            <td><span class="interval-badge">${cn.interval}</span></td>
            <td style="font-weight:700">${cn.note} <span style="font-weight:400;color:var(--muted);font-size:0.8rem">(${spanNote})</span></td>
            <td style="color:var(--muted)">${semitonesToName(cn.semitones)}</td>
        </tr>`;
    }).join('');

    const voicingCards = voicings.length > 0
        ? voicings.map((v, i) => buildVoicingCard(v, data, i)).join('')
        : '<p style="color:var(--muted);font-size:0.9rem;padding:20px 0;">No se encontraron digitaciones.</p>';

    let displayVoicing = null;
    if (syncFretboard && voicings.length > 0) {
        selectedVoicingIdx = 0;
        displayVoicing = voicings[0];
    } else if (isManualInput) {
        displayVoicing = [];
        for(let i=0; i<6; i++) {
            const val = document.getElementById('str'+i).value;
            if (muteState[i] || val === 'x') displayVoicing.push({fret:'x', note:null});
            else {
                const f = parseInt(val);
                displayVoicing.push({fret:f, note: GuitarTheory.noteAtFret(i, f)});
            }
        }
    } else if (selectedVoicingIdx >= 0 && voicings[selectedVoicingIdx]) {
        displayVoicing = voicings[selectedVoicingIdx];
    }

    const fretDiagram = displayVoicing
        ? renderHorizontalFretDiagram(displayVoicing, data, "active-diag")
        : (voicings[0] ? renderHorizontalFretDiagram(voicings[0], data, "active-diag") : '<p style="color:var(--muted)">Sin digitación</p>');

    const spanishChordName = GuitarTheory.toSpanishDisplayName(displayName);
    resDiv.innerHTML = `
        <div class="card">
            <div class="two-col">
                <div>
                    <p class="section-subtitle">Acorde Detectado</p>
                    <div style="font-family:'Outfit',sans-serif;font-size:2.4rem;font-weight:700;
                        background:linear-gradient(135deg,#635bff,#a259ff);
                        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                        background-clip:text;margin-bottom:4px;">${displayName}</div>
                    ${spanishChordName !== displayName ? `<div style="font-family:'Outfit',sans-serif;font-size:1.1rem;color:var(--muted);margin-bottom:12px;font-weight:600;">${spanishChordName}</div>` : '<div style="margin-bottom:12px;"></div>'}
                    <div class="chord-info"><div class="info-badge"><div class="label">Fórmula</div><div class="value" style="font-size:0.85rem">${formula.join(' - ')}</div></div></div>
                    <table class="notes-table" style="margin-top:16px"><thead><tr><th>Intervalo</th><th>Nota</th><th>Nombre</th></tr></thead><tbody>${noteRows}</tbody></table>
                </div>
                <div><p class="section-subtitle">Diagrama de digitación</p><div id="activeDiagram">${fretDiagram}</div></div>
            </div>
        </div>
        <div class="card"><p class="section-subtitle">Otras Posibilidades (la 2ª con cejilla)</p><div class="voicings-grid" id="voicingsGrid">${voicingCards}</div></div>
    `;
    if (syncFretboard && displayVoicing) syncFretboardWithVoicing(displayVoicing);
}

function syncFretboardWithVoicing(voicing) {
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById('str' + i);
        if (input) {
            if (voicing[i].fret === 'x') { muteState[i] = true; input.value = 'x'; }
            else { muteState[i] = false; input.value = voicing[i].fret; }
        }
    }
    renderInteractiveFretboard();
}

function selectVoicing(idx) {
    if (!currentChordData) return;
    isManualInput = false;
    selectedVoicingIdx = idx;
    const v = currentChordData.voicings[idx];
    if (v) { syncFretboardWithVoicing(v); renderUnifiedResult(currentChordData, false); }
}

function buildVoicingCard(voicing, data, idx) {
    const svgMini = renderHorizontalFretDiagram(voicing, data, "mini-diag", true);
    const fretsStr = voicing.map(f => f.fret === 'x' ? 'x' : f.fret).join('-');
    return `
        <div class="voicing-card ${idx === selectedVoicingIdx ? 'selected' : ''}" id="voicing-${idx}" onclick="selectVoicing(${idx}); setTimeout(() => openZoomModal(${idx}), 50);" style="cursor:pointer;">
            ${svgMini}
            <div class="voicing-label">${fretsStr}</div>
        </div>`;
}

// ── Zoom Modal ──

function openZoomModal(idx) {
    if (!currentChordData || !currentChordData.voicings[idx]) return;
    const voicing = currentChordData.voicings[idx];
    const modal = document.getElementById('zoomModal');
    const body = document.getElementById('zoomModalBody');
    const btn = document.getElementById('zoomSelectBtn');

    if (!modal || !body) return;

    // Render large version
    body.innerHTML = renderHorizontalFretDiagram(voicing, currentChordData, "zoom-diag", false);
    
    btn.onclick = () => {
        selectVoicing(idx);
        closeZoomModal();
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeZoomModal() {
    const modal = document.getElementById('zoomModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ── SVG Renderers ──

function renderHorizontalFretDiagram(voicing, data, cssClass, isMini = false) {
    const STRINGS = 6, FRETS = 14;
    const isZoom = cssClass === 'zoom-diag';
    const W = isZoom ? 800 : isMini ? 320 : 560;
    const H = isZoom ? 300 : isMini ? 150 : 210;
    const LEFT = isZoom ? 30 : isMini ? 15 : 20;
    const RIGHT = isZoom ? W - 60 : isMini ? W - 40 : W - 56;
    const TOP = isZoom ? 50 : isMini ? 25 : 40;
    const BOTTOM = isZoom ? H - 70 : isMini ? H - 35 : H - 55;
    const strH = (BOTTOM - TOP) / (STRINGS - 1), fretW = (RIGHT - LEFT) / FRETS;
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
    const voicingWithFingers = calculateFingerings(voicing);
    let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" class="fretboard-svg ${cssClass}" preserveAspectRatio="xMidYMid meet">`;

    const fretNumSize = isZoom ? 14 : isMini ? 8 : 11;
    for (let f = 1; f <= FRETS; f++) {
        const x = RIGHT - (f - 0.5) * fretW;
        svg += `<text x="${x}" y="${TOP - (isMini ? 10 : (isZoom ? 20 : 16))}" font-size="${fretNumSize}" fill="var(--muted)" font-weight="700" text-anchor="middle" font-family="var(--mono)">${f}</text>`;
    }
    for (let f = 0; f <= FRETS; f++) {
        const x = RIGHT - f * fretW;
        svg += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BOTTOM}" stroke="${f === 0 ? 'var(--text)' : '#d1d5db'}" stroke-width="${f === 0 ? (isZoom ? 5 : isMini ? 2 : 4) : (isZoom ? 2 : 1)}" />`;
    }
    for (let i = 0; i < STRINGS; i++) {
        const y = TOP + i * strH;
        const v = voicingWithFingers[i];
        const isMuted = v.fret === 'x';
        const isOpen = !isMuted && v.fret === 0;
        svg += `<line x1="${LEFT}" y1="${y}" x2="${RIGHT}" y2="${y}" stroke="#9ca3af" stroke-width="${1 + (5-i)*(isMini ? 0.2 : (isZoom ? 0.6 : 0.4))}" />`;
        if (isMuted) svg += `<text x="${RIGHT + (isMini ? 15 : (isZoom ? 50 : 42))}" y="${y + 4}" font-size="${isZoom ? 16 : isMini ? 10 : 12}" fill="#ef4444" font-weight="700" text-anchor="middle" font-family="var(--mono)">✕</text>`;
        if (isOpen) {
            svg += `<circle cx="${RIGHT + (isMini ? 15 : (isZoom ? 25 : 21))}" cy="${y}" r="${isZoom ? 12 : isMini ? 5 : 8}" fill="transparent" stroke="var(--accent)" stroke-width="${isZoom ? 3 : isMini ? 1 : 2}" />`;
            const spanNote = GuitarTheory.ENG_TO_SPANISH[v.note] || v.note;
            svg += `<text x="${RIGHT + (isMini ? 15 : (isZoom ? 25 : 21)) + 8}" y="${y + (isZoom ? 14 : 10)}" font-size="${isZoom ? 10 : isMini ? 6 : 7.5}" text-anchor="start" fill="#ef4444" font-weight="700">${spanNote || ''}</text>`;
        }
        if (!isMuted && v.fret > 0) {
            const cx = RIGHT - (v.fret - 0.5) * fretW;
            const color = intervalColor(v.interval);
            svg += `<circle cx="${cx}" cy="${y}" r="${isZoom ? 18 : isMini ? 8 : 12}" fill="${color}" />`;
            svg += `<text x="${cx}" y="${y + (isZoom ? 6 : isMini ? 3 : 4)}" font-size="${isZoom ? 16 : isMini ? 8 : 11}" text-anchor="middle" fill="white" font-weight="700">${v.finger || ''}</text>`;
            const spanNote = GuitarTheory.ENG_TO_SPANISH[v.note] || v.note;
            svg += `<text x="${cx + (isZoom ? 13 : isMini ? 6 : 9)}" y="${y + (isZoom ? 16 : isMini ? 8 : 11)}" font-size="${isZoom ? 10 : isMini ? 6 : 7.5}" text-anchor="start" fill="#ef4444" font-weight="700">${spanNote || ''}</text>`;
        }
    }
    svg += '</svg>';
    return svg;
}

function intervalColor(interval) {
    const colors = { '1':'#635bff', 'R':'#635bff', '3':'#10b981', 'b3':'#f59e0b', '5':'#6b7280', 'b7':'#ec4899', '7':'#a259ff' };
    return colors[interval] || '#635bff';
}

function semitonesToName(semitones) {
    const names = { 0:'Unísono', 1:'2ª menor', 2:'2ª mayor', 3:'3ª menor', 4:'3ª mayor', 5:'4ª justa', 6:'Tritono', 7:'5ª justa', 8:'5ª aumentada', 9:'6ª mayor', 10:'7ª menor', 11:'7ª mayor' };
    return names[semitones] || `${semitones} semitonos`;
}

function renderInteractiveFretboard() {
    const STRINGS = 6, FRETS = 14, W = 800, H = 260;
    const LEFT = 20, RIGHT = W - 80, TOP = 40, BOTTOM = H - 50;
    const strH = (BOTTOM - TOP) / (STRINGS - 1), fretW = (RIGHT - LEFT) / FRETS;
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
    const container = document.getElementById('unifiedFretboardContainer');
    if(!container) return;
    const currentVoicing = [];
    for (let i = 0; i < 6; i++) {
        const el = document.getElementById('str' + i);
        const val = el ? el.value.trim() : '';
        if (muteState[i] || val === 'x') currentVoicing.push({fret:'x', note:null});
        else {
            const f = parseInt(val);
            currentVoicing.push({fret: isNaN(f) ? 'x' : f, note: isNaN(f) ? null : GuitarTheory.noteAtFret(i, f)});
        }
    }
    const vF = calculateFingerings(currentVoicing);
    let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" class="fretboard-interactive" preserveAspectRatio="xMidYMid meet" style="max-width:800px; background:var(--surface); border-radius:12px; border: 1px solid var(--border);">`;
    for(let f = 1; f <= FRETS; f++) {
        const x = RIGHT - (f - 0.5) * fretW;
        svg += `<text x="${x}" y="${TOP - 16}" font-size="12" fill="var(--muted)" font-weight="700" text-anchor="middle" font-family="var(--mono)">${f}</text>`;
    }
    for(let f = 0; f <= FRETS; f++) {
        const x = RIGHT - f * fretW;
        svg += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BOTTOM}" stroke="${f===0 ? 'var(--text)' : '#d1d5db'}" stroke-width="${f===0 ? 4 : 2}" />`;
    }
    for(let i = 0; i < STRINGS; i++) {
        const y = TOP + i * strH;
        const v = vF[i], isMuted = muteState[i], isOpen = !isMuted && v.fret === 0;
        svg += `<line x1="${LEFT}" y1="${y}" x2="${RIGHT}" y2="${y}" stroke="#9ca3af" stroke-width="${1 + (5-i)*0.5}" />`;
        // Open string/Mute area
        svg += `<g class="fret-cell" style="cursor:pointer" onclick="handleFretClick(${i}, 0)" ondblclick="handleFretDblClick(${i})"><rect x="${RIGHT}" y="${y - strH/2}" width="40" height="${strH}" fill="transparent" /><text x="${RIGHT + 25}" y="${y + 4}" font-size="14" fill="${isMuted ? 'var(--muted)' : 'var(--accent)'}" font-weight="700" text-anchor="middle" font-family="var(--mono)">${stringNames[i]}</text></g>`;
        svg += `<g class="fret-cell" style="cursor:pointer" onclick="handleFretClick(${i}, 'x')" ondblclick="handleFretDblClick(${i})"><rect x="${RIGHT + 40}" y="${y - strH/2}" width="30" height="${strH}" fill="transparent" /><text x="${RIGHT + 55}" y="${y + 5}" font-size="14" fill="${isMuted ? '#ef4444' : 'var(--muted)'}" font-weight="700" text-anchor="middle" font-family="var(--mono)">✕</text></g>`;
        if(isOpen) {
            svg += `<circle cx="${RIGHT + 25}" cy="${y - 1}" r="10" fill="transparent" stroke="var(--accent)" stroke-width="2" style="pointer-events:none;" />`;
            const spanNote = GuitarTheory.ENG_TO_SPANISH[v.note] || v.note;
            svg += `<text x="${RIGHT + 25 + 8}" y="${y + 11}" font-size="8.5" text-anchor="start" fill="#ef4444" font-weight="700" style="pointer-events:none;">${spanNote || ''}</text>`;
        }
        for(let f = 1; f <= FRETS; f++) {
            const cx = RIGHT - (f - 0.5) * fretW;
            const isActive = !isMuted && v.fret === f;
            svg += `<g class="fret-cell" style="cursor:pointer" onclick="handleFretClick(${i}, ${f})" ondblclick="handleFretDblClick(${i})"><rect x="${RIGHT - f * fretW}" y="${y - strH/2}" width="${fretW}" height="${strH}" fill="transparent" /></g>`;
            if (isActive) {
                svg += `<circle cx="${cx}" cy="${y}" r="13" fill="var(--accent)" style="pointer-events:none;"/><text x="${cx}" y="${y + 4}" font-size="12" text-anchor="middle" fill="white" font-weight="700" style="pointer-events:none;">${v.finger || ''}</text>`;
                const spanNote = GuitarTheory.ENG_TO_SPANISH[v.note] || v.note;
                svg += `<text x="${cx + 10}" y="${y + 12}" font-size="8.5" text-anchor="start" fill="#ef4444" font-weight="700" style="pointer-events:none;">${spanNote || ''}</text>`;
            }
        }
    }
    svg += '</svg>';
    container.innerHTML = svg;
}

function handleFretClick(strIdx, fretVal) {
    isManualInput = true;
    const input = document.getElementById('str' + strIdx);
    if(!input) return;
    
    // Toggle logic: if clicking same fret, mute it
    if (input.value == fretVal && !muteState[strIdx]) {
        muteState[strIdx] = true;
        input.value = 'x';
    } else {
        muteState[strIdx] = (fretVal === 'x');
        input.value = fretVal;
    }
    
    renderInteractiveFretboard();
    identifyChord(true);
}

function handleFretDblClick(strIdx) {
    isManualInput = true;
    const input = document.getElementById('str' + strIdx);
    if(!input) return;
    
    // Force mute/clear on double click
    muteState[strIdx] = true;
    input.value = 'x';
    
    renderInteractiveFretboard();
    identifyChord(true);
}

function setChord(name) {
    const input = document.getElementById('chordInput');
    if (input) { input.value = name; generateChord(); }
}

function liveGenerate() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(generateChord, 400);
}

document.addEventListener('DOMContentLoaded', () => {
    renderInteractiveFretboard();
});
