var jsPsychVideoDescription = (function (jspsych) {
    "use strict";

    const info = {
        name: "video-description-trial",
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
                description: "Text displayed under the word list when the video is paused."
            },
            default_notice_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Pause Notice Text",
                default: "Click on the video or press space to pause and make an entry.",
                description: "Text displayed under the video when the video is playing."
            },
            paused_notice_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Paused Notice Text",
                default: "You cannot unpause until you submit your list of words.",
                description: "Text displayed under the video when the video is paused."
            },
            too_early_notice_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Too Early Notice Text",
                default: "Please wait slightly longer before pausing again.",
                description: "Text displayed under the video when trying to pause before the pause cooldown has passed."
            },
            repeat_word_notice_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Repeat Word Notice Text",
                default: "You cannot add a word already in the list.",
                description: "Text displayed under the word entry form upon entering a repeat word."
            },
            final_impressions_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Final Impressions Text",
                default: "Please add any final words that you feel describe this person. You must include at least two.",
                description: "Text displayed below the word list after the video ended."
            },
            input_placeholder_text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Input Placeholder Text",
                default: "e.g. 'happy', 'trustworthy'",
                description: "Gray text displayed inside the textbox when empty. Should provide examples of what to type. Cannot contain double quotes."
            },
            pause_cooldown: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Pause Cooldown",
                default: 2000,
                description: "Duration in milliseconds before the video can be paused again after resuming."
            },
            break_start: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: "Break Start Time (Seconds)",
                default: null,
                description: "Time in seconds when the disruption starts."
            },
            break_end: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: "Break End Time (Seconds)",
                default: null,
                description: "Time in seconds when the disruption ends."
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
            response: {
                type: jspsych.ParameterType.COMPLEX,
                array: true,
                nested: {
                    /* The word entered */
                    word: {
                        type: jspsych.ParameterType.STRING
                    },
                    /* The timestamp of the video when the word was entered */
                    timestamp: {
                        type: jspsych.ParameterType.FLOAT
                    },
                    /* When the word was entered
                       - "inital" - before playing the video
                       - "during" - during the video
                       - "final" - after the video ended */
                    response_state: {
                        type: jspsych.ParameterType.STRING
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
            /* The response time in milliseconds for the participant to complete the trial */
            rt: {
                type: jspsych.ParameterType.INT
            }
        }
    };

    class VideoDescriptionPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        async trial(display_element, trial) {
            return new Promise((resolve) => {
                const startTime = performance.now();
                const loop = trial.demo ? "loop" : "";
                const demo_text = trial.demo ? trial.demo_text : "";

                // Set up HTML
                display_element.innerHTML = `
                <div class="trial-container">
                    <div>
                        <div class="video-container">
                            <video class="video-player" oncontextmenu="return false;" ${loop}></video>
                            <div class="video-overlay">
                                ${demo_text}
                            </div>
                        </div>
                        <div>
                            <h3 id="video-notice" class="notice-text notice-text--warn">${trial.paused_notice_text}</h3>
                        </div>
                    </div>
                    <div>
                        <div class="word-list">
                        </div>
                        <h4 id="instructions">${trial.instruction_text}</h4>
                        <h4 id="repeat-word-notice" class="notice-text notice-text--warn" style="display: none;">${trial.repeat_word_notice_text}</h4>
                        <form class="word-entry-form">
                            <input type="text" class="word-input-box" placeholder="${trial.input_placeholder_text}" autocomplete="off" onkeydown="return /[a-z\-]/i.test(event.key)" maxlength="19" disabled>
                            <button type="submit" class="jspsych-btn add-word-btn" disabled>+</button>
                        </form>
                        <button id="submit-btn" class="jspsych-btn" disabled>Submit Word List</button>
                    </div>
                </div>`;

                // Set up video
                const videoPlayer = display_element.querySelector(".video-player");
                videoPlayer.src = `${trial.video_path}`;
                videoPlayer.removeAttribute("controls"); //TODO: Is this necessary??

                // Get elements
                const trialContainer = document.querySelector(".trial-container");
                const wordInputBox = display_element.querySelector(".word-input-box");
                const wordEntryForm = display_element.querySelector(".word-entry-form");
                const submitBtn = display_element.querySelector("#submit-btn");
                const wordList = display_element.querySelector(".word-list");
                const repeatWordNotice = display_element.querySelector("#repeat-word-notice");
                const videoNotice = display_element.querySelector("#video-notice");
                const instructions = display_element.querySelector("#instructions")

                let descriptorsData = [];
                let currentTerms = [];
                let lastPauseTime = -2;
                let isDisrupted = false;
                let response_state = "initial"; // initial, during, final

                // Helper function to update video notice text
                const updateNotice = (type) => {
                    switch (type) {
                        case "playing":
                            videoNotice.textContent = trial.default_notice_text;
                            videoNotice.className = "notice-text";
                            break;
                        case "paused":
                            videoNotice.textContent = trial.paused_notice_text;
                            videoNotice.className = "notice-text notice-text--warn";
                            break;
                        case "early":
                            videoNotice.textContent = trial.too_early_notice_text;
                            videoNotice.className = "notice-text notice-text--warn";
                            break;
                    }
                };

                // Spacebar listener to pause video
                const spacebarListener = (event) => {
                    if (event.code === "Space") {
                        event.preventDefault();
                        if (document.activeElement.tagName === "INPUT") return;
                        pauseVideo();
                    }
                };

                const pauseVideo = () => {
                    if (isDisrupted) {
                        // Don't pause if disrupted
                        return;
                    } else if (videoPlayer.currentTime - lastPauseTime <= 2) {
                        // Don't pause if too early
                        updateNotice("early");
                        // last_pause_time = video_player.currentTime;
                        setTimeout(() => {
                            updateNotice("playing");
                        }, 1500);
                        return;
                    } else {
                        // Change to paused state
                        changeState("paused");
                    }
                };

                const changeState = (state) => {
                    switch (state) {
                        case "playing":
                            // Change notice
                            updateNotice("playing");

                            // Disable input
                            wordInputBox.disabled = true;
                            wordEntryForm.querySelector("button").disabled = true;
                            submitBtn.disabled = true;

                            // Hide instructions
                            instructions.style.display = "none";
                            repeatWordNotice.style.display = "none";

                            // Play video and set cursor to pointer
                            videoPlayer.play();
                            videoPlayer.style.cursor = "pointer";

                            // Clicking video or pressing spacebar pauses
                            videoPlayer.onclick = () => { pauseVideo(); };
                            window.addEventListener("keydown", spacebarListener);

                            break;
                        case "paused":
                            // Change notice
                            updateNotice("paused");

                            // Enable and focus input
                            wordInputBox.disabled = false;
                            wordEntryForm.querySelector("button").disabled = false;
                            wordInputBox.focus();

                            // Show instructions
                            instructions.style.display = "block";

                            // Pause video and set cursor to not allowed
                            videoPlayer.pause();
                            videoPlayer.style.cursor = "not-allowed";

                            // Clicking video or pressing spacebar does nothing
                            videoPlayer.onclick = null;
                            window.removeEventListener("keydown", spacebarListener);

                            break;
                    }
                }

                // Set initial state
                if (trial.demo) {
                    changeState("playing");
                } else {
                    changeState("paused");
                }

                // On video end, hide video and request final 2+ words
                videoPlayer.onended = () => {
                    response_state = "final";

                    videoPlayer.style.display = "none";
                    videoNotice.style.display = "none";
                    instructions.style.display = "block";
                    instructions.textContent = trial.final_impressions_text;

                    // Enable input
                    trialContainer.classList.add("is-centered");
                    wordInputBox.disabled = false;
                    wordInputBox.focus();
                    wordEntryForm.querySelector("button").disabled = false;
                };

                videoPlayer.ontimeupdate = () => {
                    if (trial.break_start !== null && trial.break_end !== null) {
                        const t = videoPlayer.currentTime;
                        // Check if current time is inside the disruption window
                        if (t >= trial.break_start && t < trial.break_end) {
                            if (trial.debug_logs) console.log("Disruption occuring")
                            isDisrupted = true;
                        } else {
                            isDisrupted = false;
                        }
                    }
                };

                // Add words to list
                wordEntryForm.onsubmit = (e) => {
                    e.preventDefault();
                    const newWord = wordInputBox.value.trim();
                    if (newWord === "") return;
                    if (currentTerms.includes(newWord)) {
                        repeatWordNotice.style.display = "block";
                        return;
                    }
                    repeatWordNotice.style.display = "none";
                    currentTerms.push(newWord);
                    const listItem = document.createElement("div");
                    listItem.className = "word-list-item";
                    listItem.innerText = newWord;
                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerText = "x";
                    deleteBtn.className = "delete-btn"
                    deleteBtn.onclick = function () {
                        currentTerms = currentTerms.filter(word => word !== newWord);
                        listItem.remove();
                        if (currentTerms.length === 0 || (response_state === "final" && currentTerms.length < 2)) {
                            submitBtn.disabled = true;
                        }
                    };
                    listItem.appendChild(deleteBtn);
                    wordList.appendChild(listItem);
                    wordList.scrollTop = wordList.scrollHeight;
                    wordInputBox.value = "";
                    if (response_state === "final") {
                        submitBtn.disabled = currentTerms.length < 2;
                    } else {
                        submitBtn.disabled = false;
                    }
                };

                // Submit words and resume video
                submitBtn.onclick = () => {
                    const currentTimestamp = videoPlayer.currentTime;
                    lastPauseTime = currentTimestamp;
                    const newData = currentTerms.map(word => ({
                        word: word,
                        timestamp: currentTimestamp,
                        response_state: response_state,
                        video: trial.video_name ?? trial.video_path,
                        video_id: trial.video_id,
                        condition: trial.condition
                    }));
                    descriptorsData = descriptorsData.concat(newData);
                    currentTerms = [];
                    wordList.innerHTML = "";
                    wordInputBox.value = "";
                    if (trial.demo) {
                        // End the demo trial
                        resolve();
                    }
                    if (response_state === "initial") {
                        response_state = "during";
                    }
                    else if (response_state === "final") {
                        // End the trial
                        window.removeEventListener("keydown", spacebarListener);
                        let rt = Math.round(performance.now() - startTime);
                        const trial_data = {
                            response: descriptorsData,
                            rt: rt
                        };
                        resolve(trial_data);
                    }
                    changeState("playing");
                };
            });
        }
    }
    VideoDescriptionPlugin.info = info;

    return VideoDescriptionPlugin;
})(jsPsychModule);