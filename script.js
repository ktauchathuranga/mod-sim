/**
 * Digital Modulation Simulator - Signal Processing Logic
 * Uses Plotly.js for rendering.
 */

const CONFIG = {
    SAMPLING_RATE: 1000, // Samples per second
    BIT_DURATION: 0.1,    // 100ms per bit
    X_LIMIT: 1.0          // Show 1 second of data
};

const UI = {
    amp1: document.getElementById('amp1'),
    amp2: document.getElementById('amp2'),
    freq1: document.getElementById('freq1'),
    freq2: document.getElementById('freq2'),
    digitalData: document.getElementById('digitalData'),
    status: document.getElementById('status'),
    buttons: document.querySelectorAll('.run-btn')
};

// State to hold current data
let currentModulation = 'ASK';

/**
 * Initialize Event Listeners
 */
function init() {
    UI.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentModulation = btn.getAttribute('data-type');
            updateUIActiveButton(btn);
            runSimulation();
        });
    });

    // Auto-update on input change
    [UI.amp1, UI.amp2, UI.freq1, UI.freq2, UI.digitalData].forEach(input => {
        input.addEventListener('input', runSimulation);
    });
    // Initial run
    runSimulation();
}

function updateUIActiveButton(activeBtn) {
    UI.buttons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    UI.status.innerText = `Running ${currentModulation}...`;
}

/**
 * Core Logic: Run Simulation
 */
function runSimulation() {
    const dataString = UI.digitalData.value.replace(/[^01]/g, '') || "1010";
    const A1 = parseFloat(UI.amp1.value);
    const A2 = parseFloat(UI.amp2.value);
    const F1 = parseFloat(UI.freq1.value);
    const F2 = parseFloat(UI.freq2.value);

    // Timing parameters
    const fs = CONFIG.SAMPLING_RATE;
    const Tb = CONFIG.BIT_DURATION;
    const totalBits = dataString.length;
    const totalTime = Tb * totalBits;

    // Generate Time Array
    const t = [];
    for (let i = 0; i < totalTime * fs; i++) {
        t.push(i / fs);
    }

    const digitalWave = generateDigitalWave(dataString, t, Tb);
    const carrierWave = generateCarrierWave(A1, F1, t);
    const modulatedWave = generateModulatedWave(currentModulation, dataString, t, Tb, A1, A2, F1, F2);

    plotAll(t, digitalWave, carrierWave, modulatedWave);
}

/**
 * Mapping bits to time-domain square wave
 */
function generateDigitalWave(bits, t, Tb) {
    return t.map(time => {
        const bitIndex = Math.floor(time / Tb);
        if (bitIndex >= bits.length) return 0;
        return parseInt(bits[bitIndex]);
    });
}

/**
 * Reference carrier wave (Standard Sine)
 */
function generateCarrierWave(A, f, t) {
    return t.map(time => A * Math.sin(2 * Math.PI * f * time));
}

/**
 * Modulation Math
 */
function generateModulatedWave(type, bits, t, Tb, A1, A2, F1, F2) {
    return t.map(time => {
        const bitIndex = Math.floor(time / Tb);
        if (bitIndex >= bits.length) return 0;
        const bit = parseInt(bits[bitIndex]);

        switch (type) {
            case 'ASK':
                // Amplitude Shift Keying (OOK): A1 for '1', 0 for '0'
                const amp = bit === 1 ? A1 : 0;
                return amp * Math.sin(2 * Math.PI * F1 * time);

            case 'FSK':
                // Frequency Shift Keying: F1 for '0', F2 for '1'
                const freq = bit === 0 ? F1 : F2;
                return A1 * Math.sin(2 * Math.PI * freq * time);

            case 'BPSK':
                // Binary Phase Shift Keying: Phase shift of PI for '0'
                const phase = bit === 1 ? 0 : Math.PI;
                return A1 * Math.sin(2 * Math.PI * F1 * time + phase);

            case 'DPSK':
                // Differential PSK (Simplified visualization)
                // In practice, it's relative to previous bit.
                // Here we'll simulate the phase transitions.
                let dpskPhase = 0;
                for (let i = 0; i <= bitIndex; i++) {
                    if (parseInt(bits[i]) === 1) dpskPhase += Math.PI;
                }
                return A1 * Math.sin(2 * Math.PI * F1 * time + dpskPhase);

            case 'QPSK':
                // Quadrature Phase Shift Keying
                // Combines 2 bits into one of 4 phases: 45, 135, 225, 315 degrees
                const dibitIndex = Math.floor(bitIndex / 2) * 2;
                if (dibitIndex + 1 >= bits.length) return 0;

                const b1 = parseInt(bits[dibitIndex]);
                const b2 = parseInt(bits[dibitIndex + 1]);

                // I = b1, Q = b2 map to +/- 1
                const I = b1 === 1 ? 1 : -1;
                const Q = b2 === 1 ? 1 : -1;

                // s(t) = I*cos(w*t) - Q*sin(w*t)
                return (A1 / Math.sqrt(2)) * (I * Math.cos(2 * Math.PI * F1 * time) - Q * Math.sin(2 * Math.PI * F1 * time));

            case 'QAM':
                // 16-QAM (Simplified for 4-bit/symbol visualization in same way)
                // Just showing a variant of multi-level amplitude/phase
                const qamIndex = Math.floor(bitIndex / 2) * 2;
                const i_bit = parseInt(bits[qamIndex] || 0);
                const q_bit = parseInt(bits[qamIndex + 1] || 0);

                const amI = i_bit === 1 ? A1 : A1 * 0.5;
                const amQ = q_bit === 1 ? A2 : A2 * 0.5;

                return amI * Math.cos(2 * Math.PI * F1 * time) - amQ * Math.sin(2 * Math.PI * F1 * time);

            default:
                return 0;
        }
    });
}

/**
 * Rendering with Plotly
 */
function plotAll(t, digital, carrier, modulated) {
    const commonLayout = {
        margin: { t: 30, b: 30, l: 50, r: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { gridcolor: '#eee', zerolinecolor: '#ccc', title: 'Time (s)' },
        yaxis: { gridcolor: '#eee', zerolinecolor: '#ccc' }
    };

    Plotly.react('plot-digital', [{
        x: t, y: digital, mode: 'lines', line: { shape: 'hv', color: '#28a745', width: 3 }
    }], { ...commonLayout, title: 'Digital Data Sequence' });

    Plotly.react('plot-carrier', [{
        x: t, y: carrier, mode: 'lines', line: { color: '#007bff', width: 1.5 }
    }], { ...commonLayout, title: 'Carrier Wave (Reference)' });

    Plotly.react('plot-modulated', [{
        x: t, y: modulated, mode: 'lines', line: { color: '#dc3545', width: 2 }
    }], { ...commonLayout, title: `Modulated Signal (${currentModulation})` });
}

// Kickstart
document.addEventListener('DOMContentLoaded', init);
