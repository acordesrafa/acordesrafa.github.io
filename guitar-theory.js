/**
 * ============================================================
 * GUITAR THEORY ENGINE — Acordes Rafa
 * ============================================================
 * Motor de teoría musical formal para guitarra estándar.
 * Afinación estándar: E2 A2 D3 G3 B3 E4
 * ============================================================
 */

const GuitarTheory = (() => {

  // ── 1. SISTEMA CROMÁTICO ──────────────────────────────────

  const CHROMATIC  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT_NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

  const ENHARMONIC_MAP = {
    'Db':'C#','Eb':'D#','Fb':'E', 'Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B',
    'E#':'F', 'B#':'C',
    'Abb':'G','Bbb':'A','Cbb':'A#','Dbb':'C','Ebb':'D','Fbb':'D#','Gbb':'F',
    'Ax':'B','Bx':'C#','Cx':'D','Dx':'E','Ex':'F#','Fx':'G','Gx':'A',
  };

  function noteToIndex(note) {
    const n = note.charAt(0).toUpperCase() + note.slice(1);
    if (ENHARMONIC_MAP[n] !== undefined) return CHROMATIC.indexOf(ENHARMONIC_MAP[n]);
    return CHROMATIC.indexOf(n);
  }

  function indexToNote(idx, preferFlats) {
    const i = ((idx % 12) + 12) % 12;
    return preferFlats ? FLAT_NAMES[i] : CHROMATIC[i];
  }

  function transposeNote(note, semitones, preferFlats) {
    const base = noteToIndex(note);
    if (base === -1) throw new Error('Nota desconocida: ' + note);
    return indexToNote(base + semitones, preferFlats);
  }

  function normaliseNote(note) {
    const n = note.charAt(0).toUpperCase() + note.slice(1);
    return ENHARMONIC_MAP[n] ? ENHARMONIC_MAP[n] : n;
  }

  // ── 2. INTERVALOS ─────────────────────────────────────────

  const INTERVAL = {
    '1':0,'R':0,'b2':1,'2':2,'#2':3,'b3':3,'3':4,'#3':5,'4':5,
    '#4':6,'b5':6,'A4':6,'T':6,'5':7,'#5':8,'b6':8,'A5':8,
    '6':9,'bb7':9,'dim7':9,'b7':10,'7':11,
    'b9':13,'9':14,'#9':15,'11':17,'#11':18,'b13':20,'13':21,
  };

  const SEMITONES_TO_INTERVAL = {0:'1',1:'b2',2:'2',3:'b3',4:'3',5:'4',6:'b5',7:'5',8:'#5',9:'6',10:'b7',11:'7'};

  // ── 3. FÓRMULAS ───────────────────────────────────────────

  const CHORD_FORMULAS = {
    'maj':['1','3','5'], 'm':['1','b3','5'], 'dim':['1','b3','b5'], 'aug':['1','3','#5'],
    'sus2':['1','2','5'], 'sus4':['1','4','5'],
    'maj7':['1','3','5','7'], '7':['1','3','5','b7'], 'm7':['1','b3','5','b7'],
    'mmaj7':['1','b3','5','7'], 'dim7':['1','b3','b5','bb7'], 'm7b5':['1','b3','b5','b7'],
    'aug7':['1','3','#5','b7'], 'augmaj7':['1','3','#5','7'],
    '6':['1','3','5','6'], 'm6':['1','b3','5','6'],
    'add9':['1','3','5','9'], 'madd9':['1','b3','5','9'],
    'add11':['1','3','5','11'], 'add13':['1','3','5','13'],
    'maj9':['1','3','5','7','9'], '9':['1','3','5','b7','9'],
    'm9':['1','b3','5','b7','9'], 'mmaj9':['1','b3','5','7','9'],
    'dim9':['1','b3','b5','bb7','9'],
    '7b9':['1','3','5','b7','b9'], '7#9':['1','3','5','b7','#9'],
    '7b9b13':['1','3','5','b7','b9','b13'], '7#9b13':['1','3','5','b7','#9','b13'],
    '7#9#11':['1','3','5','b7','#9','#11'], '7b9#11':['1','3','5','b7','b9','#11'],
    'maj11':['1','3','5','7','9','11'], '11':['1','3','5','b7','9','11'], 'm11':['1','b3','5','b7','9','11'],
    'maj13':['1','3','5','7','9','11','13'], '13':['1','3','5','b7','9','11','13'], 'm13':['1','b3','5','b7','9','11','13'],
    '7#11':['1','3','5','b7','#11'], 'maj7#11':['1','3','5','7','#11'],
    '9#11':['1','3','5','b7','9','#11'], '13#11':['1','3','5','b7','9','#11','13'],
    '7b13':['1','3','5','b7','b13'], '9b13':['1','3','5','b7','9','b13'],
  };

  const QUALITY_ALIAS = {
    'M':'maj','major':'maj','minor':'m','min':'m','augmented':'aug','diminished':'dim',
    'dominant':'7','half-dim':'m7b5','ø':'m7b5','o':'dim7','°':'dim7','+':'aug',
    'Δ':'maj7','Δ7':'maj7','^7':'maj7','mM7':'mmaj7',
  };

  const QUALITY_DISPLAY = {
    'maj':'','m':'m','dim':'dim','aug':'aug','sus2':'sus2','sus4':'sus4',
    'maj7':'maj7','7':'7','m7':'m7','mmaj7':'mMaj7','dim7':'dim7','m7b5':'m7b5',
    'aug7':'7#5','augmaj7':'Maj7#5','6':'6','m6':'m6',
    'add9':'add9','madd9':'madd9','9':'9','m9':'m9','maj9':'maj9',
    'mmaj9':'mMaj9','dim9':'dim9',
    '7b9':'7b9','7#9':'7#9','7b9b13':'7b9b13','7#9b13':'7#9b13',
    '7#9#11':'7#9#11','7b9#11':'7b9#11',
    '11':'11','m11':'m11','maj11':'maj11',
    '13':'13','m13':'m13','maj13':'maj13',
    '7#11':'7#11','maj7#11':'maj7#11','9#11':'9#11','9b13':'9b13',
    '7b13':'7b13','13#11':'13#11',
  };

  // ── 4. PARSER ─────────────────────────────────────────────

  function parseChordName(chordStr) {
    chordStr = chordStr.trim();

    let bass = null, bassDisplay = null;
    const si = chordStr.lastIndexOf('/');
    if (si > 0) {
      bassDisplay = chordStr.slice(si + 1).trim();
      bass = normaliseNote(bassDisplay);
      chordStr = chordStr.slice(0, si).trim();
    }

    let rootEnd = 1;
    if (chordStr.length > 1 && (chordStr[1] === '#' || chordStr[1] === 'b')) rootEnd = 2;
    const rootRaw = chordStr.slice(0, rootEnd);
    const qualityRaw = chordStr.slice(rootEnd);

    const preferFlats = rootRaw.includes('b') && rootRaw.length > 1;
    const root = normaliseNote(rootRaw);
    const rootDisplay = rootRaw.charAt(0).toUpperCase() + rootRaw.slice(1);
    const quality = resolveQuality(qualityRaw);

    return { root, rootDisplay, quality, bass, bassDisplay, preferFlats };
  }

  function resolveQuality(raw) {
    if (!raw) return 'maj';
    if (QUALITY_ALIAS[raw]) return QUALITY_ALIAS[raw];
    const lo = raw.toLowerCase();
    if (CHORD_FORMULAS[lo]) return lo;
    for (const k of Object.keys(CHORD_FORMULAS)) { if (k === lo) return k; }
    for (const [a, k] of Object.entries(QUALITY_ALIAS)) { if (a.toLowerCase() === lo) return k; }
    return 'maj';
  }

  // ── 5. NOTAS DEL ACORDE ───────────────────────────────────

  function getChordNotes(root, quality, preferFlats) {
    const formula = CHORD_FORMULAS[quality];
    if (!formula) throw new Error('Calidad desconocida: ' + quality);
    const rootIdx = noteToIndex(root);
    if (rootIdx === -1) throw new Error('Nota desconocida: ' + root);
    return formula.map(interval => {
      const sem = INTERVAL[interval];
      if (sem === undefined) throw new Error('Intervalo desconocido: ' + interval);
      return { interval, semitones: sem % 12, semitonesFull: sem, note: indexToNote(rootIdx + sem, preferFlats) };
    });
  }

  // ── 6. DIAPASÓN ───────────────────────────────────────────

  const OPEN_NOTES   = ['E','A','D','G','B','E'];
  const OPEN_INDICES = OPEN_NOTES.map(n => noteToIndex(n)); // [4,9,2,7,11,4]

  function noteIndexAtFret(s, f) { return ((OPEN_INDICES[s] + f) % 12 + 12) % 12; }
  function noteAtFret(s, f, pf)  { return indexToNote(OPEN_INDICES[s] + f, pf); }

  function mapChordToFretboard(chordNotes, maxFret) {
    if (maxFret === undefined) maxFret = 12;
    const cnIdx = chordNotes.map(cn => ((noteToIndex(cn.note)) + 12) % 12);
    return Array.from({ length: 6 }, (_, s) => {
      const pos = [];
      for (let f = 0; f <= maxFret; f++) {
        const idx = noteIndexAtFret(s, f);
        const mi = cnIdx.indexOf(idx);
        if (mi !== -1) pos.push({ fret: f, note: chordNotes[mi].note, interval: chordNotes[mi].interval, semitones: chordNotes[mi].semitones });
      }
      return pos;
    });
  }

  // ── 7. GENERADOR DE DIGITACIONES ─────────────────────────

  /**
   * Genera digitaciones usando un enumerador iterativo de dígitos.
   * Sin recursión, seguro de cuelgues.
   */
  function generateVoicings(chordNotes, root, opts) {
    if (!opts) opts = {};
    const maxFret     = opts.maxFret     !== undefined ? opts.maxFret     : 12;
    const maxSpan     = opts.maxSpan     !== undefined ? opts.maxSpan     : 4;
    const maxVoicings = opts.maxVoicings !== undefined ? opts.maxVoicings : 21;

    const rootIdx = noteToIndex(root);

    // chord note → Map(noteIdx mod12 → chordNote)
    const cnMap = new Map();
    chordNotes.forEach(cn => { cnMap.set(((noteToIndex(cn.note)) + 12) % 12, cn); });

    // Essential intervals: root, 3rd, 7th variants
    const essSet = new Set();
    chordNotes.forEach(cn => {
      if (['1','3','b3','7','b7','bb7'].indexOf(cn.interval) !== -1) essSet.add(cn.interval);
    });

    const voicings = [];
    const seenKeys = new Set();

    for (let sf = 0; sf <= 9; sf++) {
      if (voicings.length >= maxVoicings * 5) break;
      const ef = sf + maxSpan;

      // Per-string option list: chord tones in [sf..ef] window + null (mute)
      const strOpts = [];
      for (let s = 0; s < 6; s++) {
        const opts2 = [];
        for (let f = (sf === 0 ? 0 : sf); f <= Math.min(ef, maxFret); f++) {
          const idx = noteIndexAtFret(s, f);
          if (cnMap.has(idx)) {
            const cn = cnMap.get(idx);
            opts2.push({ fret: f, noteIdx: idx, note: cn.note, interval: cn.interval });
          }
        }
        opts2.push(null); // mute
        strOpts.push(opts2);
      }

      const lens = [strOpts[0].length, strOpts[1].length, strOpts[2].length,
                    strOpts[3].length, strOpts[4].length, strOpts[5].length];
      // Safe clamped product: stop multiplying once we exceed cap
      const CAP = 20000;
      let total = 1;
      for (let li = 0; li < 6; li++) {
        total = total * lens[li];
        if (total > CAP) { total = CAP; break; }
      }

      for (let combo = 0; combo < total; combo++) {
        let rem = combo;
        const a0 = strOpts[0][rem % lens[0]]; rem = (rem / lens[0]) | 0;
        const a1 = strOpts[1][rem % lens[1]]; rem = (rem / lens[1]) | 0;
        const a2 = strOpts[2][rem % lens[2]]; rem = (rem / lens[2]) | 0;
        const a3 = strOpts[3][rem % lens[3]]; rem = (rem / lens[3]) | 0;
        const a4 = strOpts[4][rem % lens[4]]; rem = (rem / lens[4]) | 0;
        const a5 = strOpts[5][rem % lens[5]];
        const asgn = [a0, a1, a2, a3, a4, a5];

        // At least 3 played
        let pc = 0;
        for (let s = 0; s < 6; s++) { if (asgn[s]) pc++; }
        if (pc < 3) continue;

        // Essential intervals check
        const used = new Set();
        for (let s = 0; s < 6; s++) { if (asgn[s]) used.add(asgn[s].interval); }
        let fail = false;
        for (const e of essSet) { if (!used.has(e)) { fail = true; break; } }
        if (fail) continue;

        // Root on lowest played string
        let low = -1;
        for (let s = 0; s < 6; s++) { if (asgn[s]) { low = s; break; } }
        if (low === -1 || asgn[low].noteIdx !== rootIdx) continue;

        // Span check (non-open frets)
        let mn = 99, mx = 0;
        for (let s = 0; s < 6; s++) {
          if (asgn[s] && asgn[s].fret > 0) {
            if (asgn[s].fret < mn) mn = asgn[s].fret;
            if (asgn[s].fret > mx) mx = asgn[s].fret;
          }
        }
        if (mx > 0 && mn < 99 && (mx - mn) > maxSpan) continue;

        const key = (a0 ? a0.fret : 'x') + '-' + (a1 ? a1.fret : 'x') + '-' + (a2 ? a2.fret : 'x') + '-' +
                    (a3 ? a3.fret : 'x') + '-' + (a4 ? a4.fret : 'x') + '-' + (a5 ? a5.fret : 'x');
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        voicings.push(asgn.map(a => a
          ? { fret: a.fret, note: a.note, interval: a.interval }
          : { fret: 'x', note: null, interval: null }
        ));
      }
    }

    const scored = voicings.map(v => {
      const sc = scoreVoicing(v, chordNotes);
      // Fingering calculation
      const fingers = calculateFingering(v);
      v.forEach((str, i) => { str.finger = fingers[i]; });

      // Determine if it has a barre for forcing logic
      const frets = v.map(str => str.fret);
      const fretCounts = {};
      frets.forEach(f => { if (f !== 'x' && f > 0) { if (!fretCounts[f]) fretCounts[f] = { start: -1, end: -1, count: 0 }; fretCounts[f].count++; } });
      let isBarre = false;
      for (const fStr in fretCounts) {
        const f = parseInt(fStr);
        let start = -1, end = -1;
        for (let s = 0; s < 6; s++) { if (frets[s] === f) { if (start === -1) start = s; end = s; } }
        if (end - start >= 2) {
          let valid = true;
          for (let s = start + 1; s < end; s++) { if (frets[s] === 0 || (frets[s] !== 'x' && frets[s] > 0 && frets[s] < f)) { valid = false; break; } }
          if (valid) { isBarre = true; break; }
        }
      }
      return { v, sc, isBarre };
    });

    scored.sort((a, b) => b.sc - a.sc);

    let top = scored.slice(0, maxVoicings);

    // Force best barre at second position (index 1) if possible
    const barreCandidates = scored.filter((o, i) => o.isBarre);
    
    if (barreCandidates.length > 0 && top.length >= 2) {
      let selectedBarre = barreCandidates[0];
      if (top[0].isBarre && barreCandidates.length > 1) selectedBarre = barreCandidates[1];
      const currentIdxInTop = top.findIndex(o => o.v === selectedBarre.v);
      if (currentIdxInTop !== -1) top.splice(currentIdxInTop, 1);
      else top.pop();
      top.splice(1, 0, selectedBarre);
    }

    return top.map(o => o.v);
  }

  function calculateFingering(voicing) {
    const frets = voicing.map(v => v.fret);
    const fingers = Array(6).fill(null);
    const played = [];
    for (let s = 0; s < 6; s++) {
      if (frets[s] !== 'x' && frets[s] > 0) played.push({ s, f: frets[s] });
    }
    if (played.length === 0) return fingers;

    played.sort((a, b) => a.f - b.f || a.s - b.s);
    const minF = played[0].f;

    // Detect barre at minF
    let start = -1, end = -1;
    for (let s = 0; s < 6; s++) { if (frets[s] === minF) { if (start === -1) start = s; end = s; } }
    let isBarre = false;
    if (end - start >= 2) {
      isBarre = true;
      for (let s = start + 1; s < end; s++) {
        if (frets[s] === 0 || (frets[s] !== 'x' && frets[s] > 0 && frets[s] < minF)) { isBarre = false; break; }
      }
    }

    let currentFinger = 1;
    if (isBarre) {
      for (let s = start; s <= end; s++) { if (frets[s] === minF) fingers[s] = 1; }
      currentFinger = 2;
    }

    const unassigned = played.filter(p => fingers[p.s] === null);
    const fretGroups = {};
    unassigned.forEach(p => { if (!fretGroups[p.f]) fretGroups[p.f] = []; fretGroups[p.f].push(p.s); });

    Object.keys(fretGroups).sort((a, b) => a - b).forEach(f => {
      fretGroups[f].forEach(s => {
        fingers[s] = currentFinger;
        if (currentFinger < 4) currentFinger++;
      });
    });

    return fingers;
  }

  function scoreVoicing(voicing, chordNotes) {
    let score = 100;
    const played = voicing.filter(f => f.fret !== 'x');
    if (!played.length) return 0;

    score += played.length * 8;
    const fretsOnly = played.map(f => f.fret);
    const maxFretUsed = Math.max(...fretsOnly);
    const avgFret = fretsOnly.reduce((s, f) => s + f, 0) / played.length;
    score -= avgFret * 8;

    const used = new Set(played.map(f => f.interval));
    const all  = new Set(chordNotes.map(cn => cn.interval));
    score += [...all].filter(i => used.has(i)).length * 15;

    // Penalise internal muted strings
    const fi = voicing.findIndex(f => f.fret !== 'x');
    const li = 5 - [...voicing].reverse().findIndex(f => f.fret !== 'x');
    for (let i = fi + 1; i < li; i++) { if (voicing[i] && voicing[i].fret === 'x') score -= 20; }

    score += played.filter(f => f.fret === 0).length * 25;

    // First position bonus: Very high priority for chords in the first 4 frets
    if (maxFretUsed <= 4) score += 40;

    // Reward barre chords (same fret played on multiple strings)
    const fretCounts = {};
    for (let s = 0; s < 6; s++) {
      const f = voicing[s] ? voicing[s].fret : 'x';
      if (f !== 'x' && f > 0) {
        if (!fretCounts[f]) fretCounts[f] = { start: s, end: s };
        fretCounts[f].end = s;
      }
    }

    for (const fStr in fretCounts) {
      const f = parseInt(fStr);
      const data = fretCounts[f];
      if (data.end - data.start >= 2) {
        let valid = true;
        for (let s = data.start + 1; s < data.end; s++) {
          const midFret = voicing[s] ? voicing[s].fret : 'x';
          if (midFret === 0) {
            valid = false; break;
          }
          if (midFret !== 'x' && midFret > 0 && midFret < f) {
            valid = false; break;
          }
        }
        if (valid) {
          if (data.end - data.start >= 4) score += 20; // Standard E or A shape barre
          else score += 10; // Smaller barre
        }
      }
    }

    return score;
  }

  // ── 8. GENERADOR PRINCIPAL ────────────────────────────────

  function generateChord(chordName) {
    const parsed = parseChordName(chordName);
    const { root, rootDisplay, quality, bass, bassDisplay, preferFlats } = parsed;

    const formula = CHORD_FORMULAS[quality];
    if (!formula) return { error: 'Calidad no reconocida: "' + quality + '"', input: chordName };

    const chordNotes = getChordNotes(root, quality, preferFlats);

    let bassNote = null;
    if (bass) {
      bassNote = { note: indexToNote(noteToIndex(bass), preferFlats), bassDisplay };
    }

    let voicings = [];
    try {
      voicings = generateVoicings(chordNotes, root, {
        maxFret: 12, maxSpan: 4, maxVoicings: 21,
        allowOmitFifth: chordNotes.length > 3,
      });
    } catch(e) { voicings = []; }

    const qualityDisplay = QUALITY_DISPLAY[quality] || quality;
    const displayName = rootDisplay + qualityDisplay + (bassDisplay ? '/' + bassDisplay : '');

    return { input: chordName, displayName, root, rootDisplay, quality, qualityDisplay, formula, chordNotes, bassNote, voicings, fretboard: mapChordToFretboard(chordNotes) };
  }

  // ── 9. IDENTIFICADOR DE ACORDES ─────────────────────────

  function identifyChord(frets) {
    if (!Array.isArray(frets) || frets.length !== 6) return { error: 'Array de 6 valores requerido' };

    const playedNotes = [];
    frets.forEach((fret, s) => {
      if (fret !== 'x' && fret !== null && fret !== undefined) {
        const f = parseInt(fret);
        if (!isNaN(f) && f >= 0 && f <= 24) {
          const ni = noteIndexAtFret(s, f);
          playedNotes.push({ string: s, fret: f, noteIdx: ni, note: indexToNote(ni) });
        }
      }
    });

    if (playedNotes.length < 2) return { error: 'Se necesitan al menos 2 cuerdas tocadas', playedNotes };

    const uniqueIdx = [...new Set(playedNotes.map(n => n.noteIdx))];
    const uniqueNotes = uniqueIdx.map(i => indexToNote(i));

    const candidates = [];

    for (const ri of uniqueIdx) {
      const intervals = uniqueIdx.map(i => ({ noteIdx: i, sem: ((i - ri) + 12) % 12 }));

      for (const [quality, formula] of Object.entries(CHORD_FORMULAS)) {
        const fSems = new Set(formula.map(iv => { const s = INTERVAL[iv]; return s > 12 ? s % 12 : s; }));
        const iSems = new Set(intervals.map(i => i.sem));

        const matched = [...fSems].filter(s => iSems.has(s)).length;
        const missing = [...fSems].filter(s => !iSems.has(s));
        const extra   = [...iSems].filter(s => !fSems.has(s));

        if (matched < Math.min(2, formula.length)) continue;
        if (extra.length > 2) continue;
        if (!iSems.has(0)) continue;

        const missEss = missing.filter(s => [3, 4].includes(s));
        if (missEss.length > 0) continue;

        const hasThird = iSems.has(3) || iSems.has(4);
        const score = matched * 20 - missing.length * 5 - extra.length * 10
          + (hasThird ? 10 : 0)
          + (matched === formula.length ? 30 : 0);

        const lowestPlayed = playedNotes.slice().sort((a,b) => a.string - b.string)[0];
        const isInversion = lowestPlayed.noteIdx !== ri;
        const root = indexToNote(ri);
        const qd = QUALITY_DISPLAY[quality] || quality;
        const displayName = isInversion
          ? root + qd + '/' + lowestPlayed.note
          : root + qd;

        candidates.push({
          root, quality, qualityDisplay: qd, displayName, score, matched,
          missing: missing.map(s => SEMITONES_TO_INTERVAL[s] || s + 'st'),
          extra:   extra.map(s => SEMITONES_TO_INTERVAL[s] || s + 'st'),
          isInversion, inversionBass: isInversion ? lowestPlayed.note : null,
          isIncomplete: missing.length > 0, formula,
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const seen2 = new Set();
    const top = candidates.filter(c => {
      if (seen2.has(c.displayName)) return false;
      seen2.add(c.displayName); return true;
    }).slice(0, 5);

    const primary = top[0];
    return {
      playedNotes, uniqueNotes, frets,
      primaryName: primary ? primary.displayName : 'No identificado',
      alternativeNames: top.slice(1).map(c => c.displayName),
      candidates: top,
      harmonicFunction: primary ? inferHarmonicFunction(primary.root, primary.quality) : '',
    };
  }

  function inferHarmonicFunction(root, quality) {
    const fn = {
      'maj':'Tónica (I, IV)','maj7':'Tónica (Imaj7, IVmaj7)',
      'm':'Subdominante/Supertónica (ii, iii, vi)','m7':'Subdominante (iim7) / Mediante (vim7)',
      '7':'Dominante (V7) o secundaria','dim':'Sensible (vii°) / Acorde de paso',
      'dim7':'Dominante sustituta (vii°7)','m7b5':'Semidisminuido (iiø7 menor)',
      'aug':'Dominante alterada','sus4':'Dominante suspendida (Vsus4)',
      'sus2':'Tónica o Dominante suspendida',
    };
    return fn[quality] || 'Función armónica variable';
  }

  // ── 10. UTILIDADES ────────────────────────────────────────

  function listQualities() {
    return Object.keys(CHORD_FORMULAS).map(q => ({
      key: q, display: QUALITY_DISPLAY[q] || q, formula: CHORD_FORMULAS[q],
    }));
  }

  function chromaticScale(root, preferFlats) {
    if (!root) root = 'C';
    const ri = noteToIndex(root);
    return Array.from({ length: 12 }, (_, i) => indexToNote(ri + i, preferFlats));
  }

  function getScale(root, type) {
    if (!type) type = 'major';
    const SCALES = {
      'major':[0,2,4,5,7,9,11],'minor':[0,2,3,5,7,8,10],
      'harmonic':[0,2,3,5,7,8,11],'melodic':[0,2,3,5,7,9,11],
      'dorian':[0,2,3,5,7,9,10],'phrygian':[0,1,3,5,7,8,10],
      'lydian':[0,2,4,6,7,9,11],'mixolydian':[0,2,4,5,7,9,10],
      'locrian':[0,1,3,5,6,8,10],'pentatonic':[0,2,4,7,9],
      'minor_pentatonic':[0,3,5,7,10],'blues':[0,3,5,6,7,10],
    };
    const ri = noteToIndex(root);
    return (SCALES[type] || SCALES['major']).map(s => indexToNote(ri + s));
  }

  // ── 11. ESPAÑOL ──────────────────────────────────────────

  // Spanish note names → English roots (order: SOL first, longest match)
  const SPANISH_TO_ENG = { SOL:'G', DO:'C', RE:'D', MI:'E', FA:'F', LA:'A', SI:'B' };

  // English note (root only) → Spanish display
  const ENG_TO_SPANISH = {
    'C':'DO', 'C#':'DO#', 'Db':'REb',
    'D':'RE', 'D#':'RE#', 'Eb':'MIb',
    'E':'MI',
    'F':'FA', 'F#':'FA#', 'Gb':'SOLb',
    'G':'SOL', 'G#':'SOL#', 'Ab':'LAb',
    'A':'LA', 'A#':'LA#', 'Bb':'SIb',
    'B':'SI',
  };

  /**
   * Converts Spanish note names in a chord string to English.
   * Examples: "DO" → "C", "MIm7" → "Em7", "SOL7" → "G7",
   *           "LA/DO#" → "A/C#", "SIb13" → "Bb13"
   */
  function spanishToEnglish(input) {
    if (!input) return input;
    const str = input.trim();

    // Handle slash chord: convert both sides
    const si = str.lastIndexOf('/');
    if (si > 0) {
      return spanishToEnglish(str.slice(0, si)) + '/' + spanishToEnglish(str.slice(si + 1));
    }

    const up = str.toUpperCase();
    // Try longest match first (SOL=3, then 2-char names)
    for (const sp of ['SOL', 'DO', 'RE', 'MI', 'FA', 'LA', 'SI']) {
      if (up.startsWith(sp)) {
        return SPANISH_TO_ENG[sp] + str.slice(sp.length);
      }
    }
    return str; // already English notation
  }

  /**
   * Converts an English chord display name to Spanish.
   * Examples: "Em7" → "MIm7", "F#maj7#11" → "FA#maj7#11",
   *           "Bb13/Eb" → "SIb13/MIb"
   */
  function toSpanishDisplayName(name) {
    if (!name) return name;

    // Handle slash
    let main = name, bass = '';
    const si = name.lastIndexOf('/');
    if (si > 0) {
      main = name.slice(0, si);
      const bn = name.slice(si + 1);
      bass = '/' + (ENG_TO_SPANISH[bn] || bn);
    }

    // Extract root (1 or 2 chars: e.g. C, C#, Bb)
    let rLen = 1;
    if (main.length > 1 && (main[1] === '#' || main[1] === 'b')) rLen = 2;
    const root = main.slice(0, rLen);
    const quality = main.slice(rLen);

    return (ENG_TO_SPANISH[root] || root) + quality + bass;
  }

  // ── EXPORTS ───────────────────────────────────────────────
  return {
    noteToIndex, indexToNote, transposeNote, normaliseNote,
    parseChordName, getChordNotes, generateChord,
    mapChordToFretboard, noteAtFret,
    identifyChord,
    calculateFingering,
    listQualities, chromaticScale, getScale,
    spanishToEnglish, toSpanishDisplayName,
    ENG_TO_SPANISH,
    OPEN_NOTES, CHORD_FORMULAS, INTERVAL, CHROMATIC, FLAT_NAMES,
  };

})();

if (typeof module !== 'undefined' && module.exports) { module.exports = GuitarTheory; }
