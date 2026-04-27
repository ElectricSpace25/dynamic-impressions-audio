var micVisualizer = {

    // --- Visualizer styles ---

    _drawBar(ctx, W, H, analyser, freqData) {
        analyser.getByteFrequencyData(freqData);
        const rms = Math.sqrt(freqData.reduce((sum, v) => sum + v * v, 0) / freqData.length);
        ctx.fillStyle = `hsl(${120 - rms}, 80%, 45%)`;
        ctx.fillRect(0, 0, (rms / 128) * W, H);
    },

    _drawBars(ctx, W, H, analyser, freqData) {
        analyser.getByteFrequencyData(freqData);
        const rms = Math.sqrt(freqData.reduce((sum, v) => sum + v * v, 0) / freqData.length);
        const count = rms < 10 ? 0 : rms < 40 ? 1 : rms < 80 ? 2 : 3;
        const gap = W / 8;
        const barW = (W - gap * 4) / 3;
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < count ? "#c0392b" : "#e0e0e0";
            ctx.fillRect(gap + i * (barW + gap), 0, barW, H);
        }
    },

    // --- Canvas sizes and styles per type ---

    _canvasSize: {
        bar:    { width: 300, height: 30 },
        bars:   { width: 60,  height: 30 },
    },

    _canvasStyle: {
        bar:    "border-radius: 4px; background: #f0f0f0;",
        bars:   "",
    },

    // --- Setup ---

    setup(stream, canvasElement, type = "circle") {
        // Audio setup
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        // Pick draw function and apply canvas size
        const drawFn = {
            bar:    this._drawBar,
            bars:   this._drawBars,
        }[type] ?? this._drawCircle;

        const size = this._canvasSize[type] ?? this._canvasSize.circle;
        canvasElement.style.width = size.width + "px";
        canvasElement.style.height = size.height + "px";
        canvasElement.style.cssText += this._canvasStyle[type] ?? "";

        // Mic icon
        const icon = document.createElement("span");
        icon.textContent = "\u{1F399}\u{FE0F}";
        icon.style.cssText = "font-size:20px;";

        // Container
        const wrapper = document.createElement("div");
        wrapper.id = "mic-visualizer-wrapper";
        canvasElement.replaceWith(wrapper);
        wrapper.append(icon, canvasElement);

        // Drawing
        let raf = null;
        const draw = () => {
            raf = requestAnimationFrame(draw);
            const ctx = canvasElement.getContext("2d");
            const W = canvasElement.width = canvasElement.offsetWidth;
            const H = canvasElement.height = canvasElement.offsetHeight;
            ctx.clearRect(0, 0, W, H);
            drawFn(ctx, W, H, analyser, freqData);
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