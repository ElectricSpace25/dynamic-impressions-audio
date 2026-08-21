// Imports
import { jsPsych, saveAudio, setComplete } from "./init.js";
import { config } from "./config.js";
import * as utils from "./utils.js";
import * as content from "./content.js";

const startTime = new Date().toLocaleString(); // Records the date and time at the start of the study
export let complete = false; // This is set to true at the end of the study to indicate completion and 
const timeline = []; // Creates the experiment timeline

// --- Get Prolific ID from URL ---

const urlParams = new URLSearchParams(window.location.search);
const prolificID = urlParams.get("participant_id") || "unknown"; // If no Prolific ID is provided in the URL, the ID will be reported as 'unknown'


// --- Safari Warning ---

const browserCheck = {
    type: jsPsychBrowserCheck,
    features: ["browser"],
    data: { trial_name: "browser_check" }
}

// Traps the user on a warning message if using Safari (which does not support fullscreen)
function checkSafari() {
    const safariWarning = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<p>You cannot use Safari to participate in this study.</p>
                   <p>Please re-open the study in Chrome or Firefox.</p>`,
        choices: []
    };

    const checkSafariNode = {
        timeline: [safariWarning],
        conditional_function: function () {
            var browser = jsPsych.data.get().last(1).values()[0].browser;
            if (browser == "safari") {
                return true;
            } else {
                return false;
            }
        }
    }
    return checkSafariNode;
};


// --- Setup and preload videos/audio ---

// Get list of videos to show the participant, as provided by utils.js
const videoTimelineVariables = utils.setupMedia();
const videoPaths = videoTimelineVariables.map(t => t.video);
if (config.DEBUG_LOGS) {
    console.log("Final video timeline variables:");
    console.log(videoTimelineVariables);
}

// Preload the videos to prevent loading time during video trials
const preloadVideos = {
    type: jsPsychPreload,
    video: [...videoPaths],
    message: "Please wait while we load the study.",
    data: { trial_name: "preload" }
}


// --- Screener ---

const screenerTrial = {
    type: jsPsychSurvey,
    survey_json: content.screenerContent,
    on_finish: function (data) {
        if (data.response.english == "No" || data.response.attention_check != "Other" || data.response.mic == "no_mic") {
            // Attention/Language check failed -> study will terminate with a failure code and no data saved
            jsPsych.abortExperiment();
        }
    },
    data: { trial_name: "screener" }
};


// --- Instructions ---

const instructionsTrial = {
    type: jsPsychSurvey,
    survey_json: content.instructionsContent,
    data: { trial_name: "instructions" }
};


// --- Audio check ---

const audioCheckTrial = {
    type: jsPsychSurvey,
    survey_json: content.audioCheckContent,
    data: { trial_name: "audio_check" }
};


// --- Initialize Mic ---

const allowMicInstructionsTrial = {
    type: jsPsychSurvey,
    survey_json: content.allowMicInstructionsContent,
    data: { trial_name: "allow__mic_instructions" }
}

const initMicTrial = {
    type: jsPsychInitializeMicrophoneCheck,
    data: { trial_name: "init_mic" }
};


// --- Fullscreen ---

const fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: `<p>The experiment will switch to full screen mode when you press the button below.</p>
              <p>Do not exit fullscreen until the study is complete.<p>`,
    button_label: "Continue",
    data: { trial_name: "fullscreen" }
}

function checkFullscreen() {
    const reFullscreen = {
        type: jsPsychFullscreen,
        fullscreen_mode: true,
        message: `<p>Please do not exit fullscreen mode.</p>
                  <p>Click the button below to return to fullscreen mode.</p>`,
        button_label: "Continue",
        data: { trial_name: "re-fullscreen" }
    };

    const checkFullscreenNode = {
        timeline: [reFullscreen],
        conditional_function: function () {
            if (!document.fullscreenElement) {
                return true;
            } else {
                return false;
            }
        }
    }
    return checkFullscreenNode;
}


// --- Video trial ---

const videoTrial = {
    type: jsPsychVideoAudioDescription,
    video: jsPsych.timelineVariable("video"),
    debug_logs: config.DEBUG_LOGS,
    on_finish: function (data) {
        const cleanVideoName = data.video.split('/').pop().replace(/\.[^/.]+$/, "");
        data.audio = saveAudio(cleanVideoName, data.audio);
    },
    data: { trial_name: "video" }
};


// --- Rating trial ---

const ratingTrial = {
    type: jsPsychSurvey,
    survey_json: content.ratingContent,
    data: { trial_name: "ratings" }
};


// --- Ending trials ---

const demographicsTrial = {
    type: jsPsychSurvey,
    survey_json: content.demographicsContent,
    data: { trial_name: "demographics" }
};

// This is a critical trial that indicates study completion, prompting the data to be saved
// It also saves the Prolific ID and start/end time
const completionTrial = {
    type: jsPsychSurvey,
    survey_json: content.completionContent,
    data: { trial_name: "info", prolific_id: prolificID, start_time: startTime },
    on_finish: function (data) {
        // Can't add end_time with data: {} because it will calculate time at start
        data.end_time = new Date().toLocaleString();
        setComplete(true);

    },
};


// --- Main timeline ---

const videoTimeline = {
    timeline: [
        checkFullscreen(),
        videoTrial,
        ratingTrial
    ],
    timeline_variables: videoTimelineVariables
};

timeline.push(
    browserCheck,
    checkSafari(),
    preloadVideos,
    screenerTrial,
    instructionsTrial,
    audioCheckTrial,
    allowMicInstructionsTrial,
    initMicTrial,
    fullscreen,
    // demo
    videoTimeline,
    // demographicsTrial,
    completionTrial
);

jsPsych.run(timeline);