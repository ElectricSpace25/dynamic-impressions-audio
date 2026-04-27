var jsPsychVideoAudioDescription = (function (jspsych) {
    "use strict";

    const info = {
        name: "video-audio-description-trial",
        version: 1.0,
        parameters: {
            video_path: {
                type: jspsych.ParameterType.VIDEO,
                pretty_name: "Video Path",
                default: undefined,
                description: "The full path to the video."
            },
            video_name: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Video Name",
                default: null,
                description: "The name of the video to be saved in the data output."
            },
            video_id: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Video ID",
                default: null,
                description: "The index of the video within its list (only relevant for Exclusive Index Mode)."
            },
            condition: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Condition",
                default: null,
                description: "The condition associated with the video."
            },
            instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Instruction Text",
                default: "Enter one word at a time, using as many words as would be helpful.",
                description: "Text displayed above the audio visualizer."
            },
            final_impressions_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Final Impressions Text",
                default: "Please add any final words that you feel describe this person. You must include at least two.",
                description: "Text displayed above the audio visualizer during final impressions."
            },
            demo: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Demo",
                default: false,
                description: "If true, enable demo mode."
            },
            demo_text: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Demo Text",
                default: "<p>Before we start, let's do a practice trial</p><p>Please pause the video and practice entering words</p><p>The study will begin after this practice trial</p>",
                description: "Text to display on the video when in demo mode."
            },
            debug_logs: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Debug Logs",
                default: false,
                description: "If true, display prints useful for debugging."
            }
        },
        data: {
            /* Array of events and the corresponding timestamps and video*/
            response: {
                type: jspsych.ParameterType.COMPLEX,
                array: true,
                nested: {
                    /* The event type 
                    - "pause" - the video was paused
                    - "resume" - the video was resumed
                    - "final" - the final recording started
                    */
                    event: {
                        type: jspsych.ParameterType.STRING
                    },
                    /* The timestamp of the video when the event occured */
                    video_timestamp: {
                        type: jspsych.ParameterType.FLOAT
                    },
                    /* The timestamp of the audio recording when the event occured */
                    audio_timestamp: {
                        type: jspsych.ParameterType.FLOAT
                    },
                    /* The name of the video played.
                       Will be video_path if video_name was not provided */
                    video: {
                        type: jspsych.ParameterType.STRING
                    },
                    /* The index of the video in the order given before shuffling.
                       Will be null if video_id not provided */
                    video_id: {
                        type: jspsych.ParameterType.STRING
                    },
                    /* The condition the video is assigned to.
                       Will be null if condition not provided */
                    condition: {
                        type: jspsych.ParameterType.STRING
                    },
                }
            },
            /* Base64 encoded audio */
            audio: {
                type: jspsych.ParameterType.STRING
            },
            /* The response time in milliseconds for the participant to complete the trial */
            rt: {
                type: jspsych.ParameterType.INT
            }
        }
    };

    class VideoAudioDescriptionPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        async trial(display_element, trial) {
            const recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();

            return new Promise((resolve) => {
                const startTime = performance.now();
                let recordingStartTime;
                const loop = trial.demo ? "loop" : "";
                const demo_text = trial.demo ? trial.demo_text : "";

                // Set up HTML
                display_element.innerHTML = `
                <div class="trial-container">
                    <div class="instructions-container">
                        <h4 id="instructions">${trial.instruction_text}</h4>
                    </div>
                    <div class="video-container">
                        <video class="video-player" oncontextmenu="return false;" ${loop}></video>
                        <div class="video-overlay">
                            ${demo_text}
                        </div>
                    </div>
                    <div class="response-container">
                        <button id="record-btn" class="jspsych-btn">Start Recording</button>
                        <canvas id="mic-visualizer"></canvas>
                        <button id="continue-btn" class="jspsych-btn" style="display:none;">Continue</button>
                        <button id="submit-btn" class="jspsych-btn" style="display:none;">Submit</button>
                    </div>
                </div>`;

                // Set up video
                const videoPlayer = display_element.querySelector(".video-player");
                videoPlayer.src = `${trial.video_path}`;
                videoPlayer.removeAttribute("controls"); //TODO: Is this necessary??

                // Get elements
                const trialContainer = document.querySelector(".trial-container"); 
                const videoContainer = document.querySelector(".video-container"); 
                const instructions = display_element.querySelector("#instructions")
                const recordBtn = display_element.querySelector("#record-btn");
                const visualizer = display_element.querySelector("#mic-visualizer");
                const continueBtn = display_element.querySelector("#continue-btn");
                const submitBtn = display_element.querySelector("#submit-btn");

                let events = [];
                let isDisrupted = false;
                let recordedChunks = [];
                let audioBase64 = null;
                let loadResolver = null;

                // Set up audio visualizer
                const viz = micVisualizer.setup(recorder.stream, visualizer, "bars");

                // Recording handlers
                const onData = (e) => {
                    if (e.data.size > 0) recordedChunks.push(e.data);
                };

                const onStop = () => {
                    const blob = new Blob(recordedChunks, { type: recordedChunks[0].type });
                    const reader = new FileReader();
                    reader.addEventListener("load", () => {
                        audioBase64 = reader.result.split(",")[1];
                        if (loadResolver) loadResolver();
                    });
                    reader.readAsDataURL(blob);
                };

                const stopRecording = () => {
                    return new Promise((res) => {
                        loadResolver = res;
                        recorder.stop();
                    });
                };

                recorder.addEventListener("dataavailable", onData);
                recorder.addEventListener("stop", onStop);

                recordBtn.addEventListener('click', () => {
                    recordBtn.style.display = "none";
                    viz.start();
                    recordingStartTime = performance.now();
                    recorder.start();
                    window.addEventListener("keydown", spacebarListener);
                    videoPlayer.addEventListener("click", videoClickListener);
                }, { once: true });


                const spacebarListener = (event) => {
                    if (event.code === "Space") {
                        event.preventDefault();
                        if (videoPlayer.paused) changeState("playing");
                        else changeState("paused");
                    }
                };

                const videoClickListener = (event) => {
                    if (videoPlayer.paused) changeState("playing");
                    else changeState("paused");
                };

                const addEvent = (event) => {
                    events.push({
                        event: event,
                        video_timestamp: videoPlayer.currentTime,
                        audio_timestamp: (performance.now() - recordingStartTime) / 1000,
                        video: trial.video_name ?? trial.video_path,
                        video_id: trial.video_id,
                        condition: trial.condition
                    });
                }

                const changeState = (state, record = true) => {
                    switch (state) {
                        case "playing":
                            // Resume video
                            videoPlayer.play();

                            // Add event
                            if (record) addEvent("resume");
                            break;
                        case "paused":
                            // Pause video
                            videoPlayer.pause();

                            // Add event
                            if (record) addEvent("pause");
                            break;
                    }
                }

                // Set initial state
                if (trial.demo) {
                    changeState("playing", false);
                } else {
                    changeState("paused", false);
                }

                // On video end, show continue button
                videoPlayer.onended = () => {

                    // Remove pausing
                    window.removeEventListener("keydown", spacebarListener);
                    videoPlayer.removeEventListener("click", videoClickListener);
                    videoPlayer.style.cursor = "default";

                    // Continue to final impressions button
                    continueBtn.style.display = "block";
                    continueBtn.addEventListener('click', () => {
                        recorder.pause();
                        addEvent("final");
                        continueBtn.style.display = "none";
                        videoContainer.style.display = "none";
                        trialContainer.style.justifyContent = "center";
                        trialContainer.classList.add("is-centered");
                        instructions.textContent = trial.final_impressions_text;
                        viz.stop();
                        recordBtn.style.display = "block";
                    }, { once: true });

                    // Start final recording button
                    recordBtn.addEventListener('click', () => {
                        recorder.resume();
                        recordBtn.style.display = "none";
                        viz.start();
                        submitBtn.style.display = "block";
                    }, { once: true });

                    // Submit button
                    submitBtn.onclick = async () => {
                        // End the trial
                        await stopRecording();
                        let rt = Math.round(performance.now() - startTime);
                        const trialData = {
                            response: events,
                            audio: audioBase64,
                            rt: rt
                        };
                        resolve(trialData);
                    }
                };
            });
        }
    }
    VideoAudioDescriptionPlugin.info = info;

    return VideoAudioDescriptionPlugin;
})(jsPsychModule);