import { jsPsych } from "./init.js";
import { config, videoLists } from "./config.js";

// Function to build filepaths for videos and create stimuli video list
export function setupMedia() {
    if (config.DEBUG_LOGS) console.log("Setting up videos");
    if (config.DEBUG_LOGS) console.log(`Exclusive Index Mode: ${config.EXCLUSIVE_INDEX_MODE}`);

    let videoIndices = new Set();
    let videoTimelineVariableLists = [];

    for(let i = 0; i < videoLists.length; i++) {
        const originalList = videoLists[i].videos;
        let shuffledList = originalList;
        if (videoLists[i].shuffle || config.SHUFFLE_ALL) shuffledList = jsPsych.randomization.shuffle(originalList);
        const selectionNum = videoLists[i].selectionNum;
        const conditionName = videoLists[i].condition;

        if (config.EXCLUSIVE_INDEX_MODE && videoIndices.size > 0) {
            shuffledList = shuffledList.filter(video => {
                const index = originalList.indexOf(video);
                return !videoIndices.has(index);
            })
        }

        // Select from list
        const chosenVideos = shuffledList.slice(0, selectionNum);

        // Add indices to set
        chosenVideos.forEach(video => {
            const index = originalList.indexOf(video);
            videoIndices.add(index);
        });

        // Timeline variables
        const timelineVariables = chosenVideos.map(video => ({
            video_name: video.substring(0, video.lastIndexOf('.')),
            video_path: `${config.VIDEO_PATH}/${video}`,
            video_id: originalList.indexOf(video),
            condition: conditionName
        }));

        // Add to list
        videoTimelineVariableLists.push(timelineVariables);

        // Debug printing
        if (config.DEBUG_LOGS) console.log(`List ${i}: ${conditionName}`);
        if (config.DEBUG_LOGS) console.log(`Original: ${originalList}`);
        if (config.DEBUG_LOGS && videoLists[i].shuffle) console.log(`Shuffled: ${shuffledList}`);
        if (config.DEBUG_LOGS) console.log(`Choosing ${selectionNum} videos:`);
        if (config.DEBUG_LOGS) console.log(timelineVariables);
    }

    if (config.SHUFFLE_ALL) {
        return jsPsych.randomization.shuffle(videoTimelineVariableLists.flat());
    } else if (config.SHUFFLE_LIST_ORDER) {
        return jsPsych.randomization.shuffle(videoTimelineVariableLists).flat();
    } else {
        return videoTimelineVariableLists.flat();
    }
}

// Helper function to convert disruption time code to seconds
export function parseTimeCode(timeString) {
    if (!timeString) return null;
    const parts = timeString.split(/[:.]/); // Split by colon or dot
    if (parts.length < 2) return null;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    // If the 3rd part exists (centiseconds), use it. Otherwise 0.
    const centiseconds = parts[2] ? parseInt(parts[2], 10) : 0;

    return (minutes * 60) + seconds + (centiseconds / 100);
}