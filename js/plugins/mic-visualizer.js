var micVisualizer = {
    // Visualizer configuration
    bars: 5,
    start: 10,     // RMS threshold to light up the first bar
    step: 30,      // RMS step between bars
    barWidth: 8,   // Pixel width per bar
    barGap: 4,     // Pixel gap between bars
    height: 30,    // Visualizer height (width calculated from bars)

    setup(stream, canvas) {
        // Audio setup
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        // Calculate canvas size
        const totalWidth = this.bars * this.barWidth + (this.bars + 1) * this.barGap;
        canvas.style.width = `${totalWidth}px`;
        canvas.style.height = `${this.height}px`;

        // Container and mic icon
        const wrapper = document.createElement("div");
        wrapper.id = "mic-visualizer-wrapper";
        wrapper.innerHTML = `<span style="font-size:20px;">\u{1F399}\u{FE0F}</span>`;
        canvas.replaceWith(wrapper);
        wrapper.append(canvas);

        // Drawing
        const ctx = canvas.getContext("2d");
        let raf = null;
        const draw = () => {
            raf = requestAnimationFrame(draw);

            // DPR canvas sizing (to look crisp)
            const dpr = window.devicePixelRatio || 1;
            const W = canvas.width = canvas.offsetWidth * dpr;
            const H = canvas.height = canvas.offsetHeight * dpr;

            // Calculate active bars
            analyser.getByteFrequencyData(freqData);
            const rms = Math.sqrt(freqData.reduce((sum, v) => sum + v * v, 0) / freqData.length);
            const count = rms >= this.start
                ? Math.min(this.bars, Math.floor((rms - this.start) / this.step) + 1)
                : 0;

            // Render bars
            const w = Math.round(this.barWidth * dpr);
            const gap = Math.round(this.barGap * dpr);

            for (let i = 0; i < this.bars; i++) {
                ctx.fillStyle = i < count ? "#c0392b" : "#e0e0e0";
                ctx.fillRect(Math.round(gap + i * (w + gap)), 0, w, H);
            }
        };

        // Start and stop functions
        return {
            start() {
                if (!raf) draw();
                wrapper.style.display = "flex";
            },
            stop() {
                cancelAnimationFrame(raf);
                raf = null;
                wrapper.style.display = "none";
            }
        };
    }
};