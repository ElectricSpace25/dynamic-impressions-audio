var jsPsychVideoAudioDescription = (function (jspsych) {
    "use strict";

    const info = {
        name: "video-audio-description-trial",
        version: 1.0,
        parameters: {
            video: {
                type: jspsych.ParameterType.VIDEO,
                pretty_name: "Video",
                default: undefined,
                description: "The full path to the video."
            },
            initial_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Initial Instruction Text",
                default: "Click \"Start Recording\" to begin recording your audio.",
                description: "Text displayed above the video before starting the recording."
            },
            pre_start_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Pre-Start Instruction Text",
                default: "After verbalizing your initial impressions, start the video by clicking it or pressing the spacebar",
                description: "Text displayed above the video before starting the video."
            },
            default_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Default Instruction Text",
                default: "Verbalize your impressions as they occur. For longer impressions, you can pause the video by clicking it or pressing the space bar.",
                description: "Text displayed above the video when it is playing."
            },
            paused_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Pause Instruction Text",
                default: "Resume the video by clicking it or pressing the spacebar when ready.",
                description: "Text displayed above the video when it is paused."
            },
            end_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "End Instruction Text",
                default: "After you finish verbalizing your impression, click the \"Continue\" button.",
                description: "Text displayed above the video after it ends."
            },
            early_pause_instruction_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Early Pause Instruction Text",
                default: "Please wait slightly longer before pausing again.",
                description: "Text displayed above the video when trying to pause before the pause cooldown has passed."
            },
            final_impressions_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Final Instruction Text",
                default: "Click \"Start Recording\" and verbalize your final impression of the speaker. Click \"Submit\" when done.",
                description: "Text displayed above the audio visualizer during final impressions."
            },
            pause_cooldown: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Pause Cooldown",
                default: 2000,
                description: "Duration in milliseconds before the video can be paused again after resuming."
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
            /* Path of the video played */
            video: {
                type: jspsych.ParameterType.STRING
            },
            /* Array containing all events and associated timestamps */
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
                        <h3 id="instructions" class="instruction-text">${trial.initial_instruction_text}</h3>
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
                videoPlayer.src = `${trial.video}`;
                videoPlayer.removeAttribute("controls"); //TODO: Is this necessary??

                // Get elements
                const trialContainer = document.querySelector(".trial-container");
                const videoContainer = document.querySelector(".video-container");
                const instructions = display_element.querySelector("#instructions")
                const recordBtn = display_element.querySelector("#record-btn");
                const visualizer = display_element.querySelector("#mic-visualizer");
                const continueBtn = display_element.querySelector("#continue-btn");
                const submitBtn = display_element.querySelector("#submit-btn");

                let lastPauseTime = -(trial.pause_cooldown / 1000);
                let events = [];
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
                    instructions.textContent = trial.pre_start_instruction_text;
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
                        toggleVideo();
                    }
                };

                const videoClickListener = (event) => {
                    toggleVideo();
                };

                const addEvent = (event) => {
                    events.push({
                        event: event,
                        video_timestamp: videoPlayer.currentTime,
                        audio_timestamp: (performance.now() - recordingStartTime) / 1000,
                    });
                    console.log(events);
                }

                const toggleVideo = () => {
                    // If playing, pause
                    if (!videoPlayer.paused) {
                        if (videoPlayer.currentTime - lastPauseTime <= (trial.pause_cooldown / 1000)) {
                            console.log(videoPlayer.currentTime)
                            console.log(lastPauseTime)
                            console.log(trial.pause_cooldown / 1000)
                            // Don't pause if too early
                            instructions.textContent = trial.early_pause_instruction_text;
                            setTimeout(() => {
                                instructions.textContent = trial.default_instruction_text;
                            }, 1500);
                            return;
                        } else {
                            // Change to paused state
                            changeState("paused");
                        }
                    }

                    // If paused, play
                    else {
                        lastPauseTime = videoPlayer.currentTime;
                        changeState("playing")
                    }
                }

                const changeState = (state, record = true) => {
                    switch (state) {
                        case "playing":
                            // Resume video
                            videoPlayer.play();

                            //Change instructions
                            instructions.textContent = trial.default_instruction_text;

                            // Add event
                            if (record) addEvent("resume");
                            break;
                        case "paused":
                            // Pause video
                            videoPlayer.pause();

                            //Change instructions
                            if (instructions.textContent == trial.default_instruction_text) instructions.textContent = trial.paused_instruction_text;

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

                    // Change instructions
                    instructions.textContent = trial.end_instruction_text;

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
                        addEvent("end");
                        await stopRecording();
                        let rt = Math.round(performance.now() - startTime);
                        const trialData = {
                            response: events,
                            audio: audioBase64,
                            video: trial.video,
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