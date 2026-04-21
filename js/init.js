import { config } from "./config.js";
import { complete } from "./main.js";

const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);

// Function to save data to server
function saveData(id, data) {
    var dataToSend = JSON.stringify({ id: id, filedata: data });
    var success = navigator.sendBeacon("./php/write_data.php", dataToSend);
    if (config.DEBUG_LOGS) console.log("Data saved to data/" + id + ": " + success);
}

// Initialize jsPsych and export it
export const jsPsych = initJsPsych({
    on_finish: function () {
        if (complete) {
            if (config.DEBUG_SAVE) {
                jsPsych.data.get().localSave("csv", `data-${sessionId}.csv`);
            } else {
                saveData(`data-${sessionId}`, jsPsych.data.get().csv());
                jsPsych.abortExperiment(config.COMPLETION_MESSAGE);
                setTimeout(() => {
                    window.location.href = config.COMPLETION_LINK;
                }, 2000);
            }
        } else {
            jsPsych.abortExperiment(config.FAILURE_MESSAGE);
            setTimeout(() => {
                window.location.href = config.FAILURE_LINK;
            }, 2000);
        }
    }
});