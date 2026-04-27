import { config } from "./config.js";
import { complete } from "./main.js";

const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);

// Function to save data to server
function saveData(name, data) {
    const dataToSend = JSON.stringify({ name: name, filedata: data });
    const success = navigator.sendBeacon("./php/write_data.php", dataToSend);
    if (config.DEBUG_LOGS) console.log(`Data saved to data/${name}: ${success}`);
}

// Function to save audio to server
export function saveAudio(video, data) {
    const name = `${sessionId}_${video}.webm`;
    const dataToSend = JSON.stringify({ name: name, filedata: data });
    fetch('./php/write_audio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dataToSend
    });
    return name;
}

// Initialize jsPsych and export it
export const jsPsych = initJsPsych({
    on_finish: function () {
        if (complete) {
            if (config.DEBUG_SAVE) {
                jsPsych.data.get().localSave("csv", `${sessionId}`);
            } else {
                saveData(`${sessionId}_data.csv`, jsPsych.data.get().csv());
                jsPsych.abortExperiment(config.COMPLETION_MESSAGE);
                setTimeout(() => {
                    // window.location.href = config.COMPLETION_LINK;
                }, 2000);
            }
        } else {
            jsPsych.abortExperiment(config.FAILURE_MESSAGE);
            setTimeout(() => {
                // window.location.href = config.FAILURE_LINK;
            }, 2000);
        }
    }
});