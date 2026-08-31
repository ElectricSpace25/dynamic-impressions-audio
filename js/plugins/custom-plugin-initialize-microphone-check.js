var jsPsychInitializeMicrophoneCheck = (function (jspsych) {
	'use strict';

	var version = "2.1.0";

	const info = {
		name: "initialize-microphone-check",
		version,
		parameters: {
			device_select_message: {
				type: jspsych.ParameterType.HTML_STRING,
				pretty_name: "Device Select Message",
				default: `<p>Please select the microphone you would like to use.</p>`,
				description: "Message to display above the dropdown list of available microphones."
			},
			button_label: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Button Label",
				default: "Use this microphone",
				description: "Label for the select button."
			},
			mime_type: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "MIME Type",
				default: "audio/webm;codecs=opus",
				description: "MIME type to use for recording."
			},
			bitrate: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Bitrate",
				default: 128000,
				description: "Bitrate to use for recording."
			},
			audio_processing: {
				type: jspsych.ParameterType.BOOL,
				pretty_name: "Audio Processing",
				default: false,
				description: "If true, allows the browser's default echo cancellation, noise suppression, and auto gain control."
			},

		},
		data: {
			/**  The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone. */
			device_id: {
				type: jspsych.ParameterType.STRING
			}
		},
		// prettier-ignore
		citations: {
			"apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
			"bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
		}
	};

	class InitializeMicrophoneCheckPlugin {
		constructor(jsPsych) {
			this.jsPsych = jsPsych;
			this.viz = null;
			this.previewStream = null;
		}
		static {
			this.info = info;
		}
		trial(display_element, trial) {
			this.run_trial(display_element, trial).then((id) => {
				this.stopVisualizer();
				this.jsPsych.finishTrial({ device_id: id });
			});
		}
		async run_trial(display_element, trial) {
			await this.askForPermission();
			this.showMicrophoneSelection(display_element, trial);
			await this.updateDeviceList(display_element);

			// Start visualizer for the initially selected device
			this.startVisualizerForSelected(display_element);

			// Restart visualizer when the dropdown selection changes
			display_element.querySelector("#which-mic").addEventListener("change", () => {
				this.startVisualizerForSelected(display_element);
			});

			navigator.mediaDevices.ondevicechange = () => {
				this.updateDeviceList(display_element);
			};

			const mic_id = await this.waitForSelection(display_element);

			// Audio processing control
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: mic_id,
					echoCancellation: trial.audio_processing,
					noiseSuppression: trial.audio_processing,
					autoGainControl: trial.audio_processing,
					channelCount: { exact: 1 } // Force mono recording
				}
			});

			// Create configured recorder and monkey patch jsPsych function
			if (!MediaRecorder.isTypeSupported(trial.mime_type)) {
				console.warn(`${trial.mime_type} is not supported in this browser; falling back to default recorder settings.`);
				this.jsPsych.pluginAPI.initializeMicrophoneRecorder(stream);
			} else {
				const recorder = new MediaRecorder(stream, {
					mimeType: trial.mime_type,
					audioBitsPerSecond: trial.bitrate
				});
				this.jsPsych.pluginAPI.getMicrophoneRecorder = () => recorder;
			}

			return mic_id;
		}
		async askForPermission() {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			return stream;
		}
		showMicrophoneSelection(display_element, trial) {
			let html = `
        ${trial.device_select_message}
        <select name="mic" id="which-mic" class="jspsych-select"></select>
        <canvas id="mic-visualizer"></canvas>
        <p></p>
        <button class="jspsych-btn" id="btn-select-mic">${trial.button_label}</button></p>`;
			display_element.innerHTML = html;
		}
		waitForSelection(display_element) {
			return new Promise((resolve) => {
				display_element.querySelector("#btn-select-mic").addEventListener("click", () => {
					const mic = display_element.querySelector("#which-mic").value;
					resolve(mic);
				});
			});
		}
		async updateDeviceList(display_element) {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const mics = devices.filter(
				(d) => d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications"
			);
			const unique_mics = mics.filter(
				(mic, index, arr) => arr.findIndex((v) => v.groupId == mic.groupId) == index
			);
			display_element.querySelector("#which-mic").innerHTML = "";
			unique_mics.forEach((d) => {
				let el = document.createElement("option");
				el.value = d.deviceId;
				el.innerHTML = d.label;
				display_element.querySelector("#which-mic").appendChild(el);
			});
		}
		async startVisualizerForSelected(display_element) {
			this.stopVisualizer();
			const deviceId = display_element.querySelector("#which-mic").value;
			if (!deviceId) return;

			this.previewStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } });
			const visualizer = display_element.querySelector("#mic-visualizer");
			this.viz = micVisualizer.setup(this.previewStream, visualizer);
			this.viz.start();
		}
		stopVisualizer() {
			if (this.viz) {
				this.viz.stop();
				this.viz = null;
			}
			if (this.previewStream) {
				this.previewStream.getTracks().forEach((t) => t.stop());
				this.previewStream = null;
			}
		}
	}

	return InitializeMicrophoneCheckPlugin;

})(jsPsychModule);