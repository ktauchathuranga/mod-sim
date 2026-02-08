# Digital Modulation Simulator

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ktauchathuranga.github.io/mod-sim/)

A web-based scientific dashboard for simulating and visualizing digital and analog modulation techniques. This application mimics the behavior of a MATLAB GUI, providing real-time signal processing visualization through a browser.

## Features

- Digital Modulation: ASK (OOK), FSK, BPSK, DPSK, QPSK, and QAM.
- Analog Modulation: AM (DSB-WC), FM, and PM.
- Dynamic Visualization: Three vertically stacked graphs for Digital/Message Data, Carrier Wave, and Modulated Signal.
- Real-time Interaction: Immediate graph updates when input parameters (Amplitude, Frequency, Data) are changed.
- Lab Statistics: Interactive axes and zooming via Plotly.js.

## Technical Architecture

- Frontend: HTML5, CSS3 (Flexbox/Grid), and Vanilla JavaScript.
- Visualization: Plotly.js via CDN.
- Processing logic: Discrete sampling math ($Fs = 1000 Hz$) with time-aligned bit transitions.

## Installation and Setup

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Build and start the container:

```bash
docker compose up --build -d
```

4. Access the simulator in your browser at: `http://localhost:8081`

## Usage

- Inputs: Modify Amplitude and Frequency for Carrier 1 (Main) and Carrier 2 (Message/Secondary).
- Digital Data: Enter a binary string (e.g., 10110) for digital modulation modes.
- Modulation Selection: Click any modulation button in the sidebar to switch modes and update the visualization instantly.
- Documentation: Refer to the included walkthrough for specific mathematical models used.
