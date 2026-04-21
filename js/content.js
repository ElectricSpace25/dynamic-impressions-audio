// --- Screener ---
export const screenerContent = {
    title: "Welcome to the experiment!",
    elements:
        [
            {
                type: "html",
                name: "instructions",
                html: "<p>Please answer the following questions to determine your eligibility.</p>",
            },
            {
                type: "radiogroup",
                name: "english",
                title: "Are you fluent in English?",
                choices: ["Yes", "No"],
                isRequired: true
            },
            {
                type: "radiogroup",
                name: "attention_check",
                title: "Please read the following instructions carefully",
                description: "Recent research on decision making has shown that choices are affected by political party affiliation. To help us understand how people from different backgrounds make decisions, we are interested in information about you. Specifically, we want to know if you actually read any of the instructions we give at the beginning of our survey; if not, some results may not tell us very much about decision making and perception in the real world. To show that you have read the instructions, please ignore the questions about political party affiliation below and simply select \"Other\" at the bottom.",
                choices: ["Democratic", "Republican", "Independent", "Libertarian", "Green Party", "Other"],
                isRequired: true
            }
        ]
};

// --- Instructions ---
export const instructionsContent = {
    title: "Instructions",
    pages: [
        {
            title: "Welcome to the Experiment",
            elements: [
                {
                    type: "html",
                    html: `
                        <p>Thank you for participating in our experiment!</p>
                        <p>We are researchers interested in how we understand other people.</p>
                        <p>Your job today is simple. <b>There are three parts to our task.</b></p>
                        <div class="callout-box">
                            <ol class="bold-numbers">
                                <li>View videos and type your impressions of the speaker.</li>
                                <li>Form a final impression of the speaker in the video.</li>
                                <li>Rate the speaker on several attributes.</li>
                            </ol>
                        </div>
                        <p>You will repeat these steps for each video.</p>
                        <p>In the next few pages, you will learn more about each step of the experiment.</p>
                    `
                }
            ]
        },
        {
            title: "Step 1: Watch and describe the speaker in the video",
            elements: [
                {
                    type: "html",
                    html: `
                        <video width="100%" autoplay loop muted src="assets/instruct/submitting.mp4"></video>
                        <p>Pause the video whenever you <b>notice a new characteristic</b> about the person or think of a <b>new way to describe them.</b> Pause by clicking anywhere on the video or pressing the spacebar.</p>
                        <p><b>Enter one word at a time</b>, but you can enter multiple words each time you pause (see video). For example, if you feel like the person is being an annoying student, pause and enter “annoying” and “student” separately. Order does not matter. You can remove words before submitting by clicking the "X" next to the word.</p>
                        <p>Enter whatever comes to mind spontaneously. There are no limits on what you enter! We only ask that you <b>pause and describe the person multiple times.</b></p>
                        <p>Based on past experience, <b>we expect you will pause 2-5 times per video.</b> Please note there is a minimum amount of time that needs to pass between each time you pause the video (2 seconds).</p>
                    `
                }
            ]
        },
        {
            title: "Step 2: Form a final impression",
            elements: [
                {
                    type: "html",
                    html: `
                        <video width="100%" autoplay loop muted src="assets/instruct/final.mp4"></video>
                        <p>Form your final impression of the speaker. <b>Think of this as a list of words you'd use to describe this person to someone else, your summary impression of a person.</b> Once again, enter one word at a time, for as many words as you"d like.</p>
                    `
                }
            ]
        },
        {
            title: "Step 3: Rate the speaker on several attributes",
            elements: [
                {
                    type: "html",
                    html: `
                        <video width="100%" autoplay loop muted src="assets/instruct/rating.mp4"></video>
                        <p>Once you finish watching the video, you will rate the speaker in the video on several attributes using sliders. <b>Please go with your gut feelings, and don't overthink it.</b> You will be evaluating the speaker on these attributes:</p>
                        <p><b>Please read the category descriptions carefully below:</b></p>
                        <div class="callout-box">
                            <ul>
                                <li><b>Openness to new experiences:</b> willingness to try new things and to explore new ideas</li>
                                <li><b>Conscientiousness:</b> extent to which the person seems organized, hardworking, and goal-oriented</li>
                                <li><b>Extroversion:</b> extent to which the person seems energized by social interaction and enjoys being around other people</li>
                                <li><b>Agreeableness:</b> extent to which the person seems cooperative, kind, and trusting</li>
                                <li><b>Neuroticism:</b> extent to which the person seems prone to negative emotions such as anxiety, anger, and sadness</li>
                                <li><b>Warmth:</b> extent to which the person seems friendly, approachable, and likeable</li>
                                <li><b>Competence:</b> extent to which the person seems capable, skilled, and knowledgeable</li>
                            </ul>
                        </div>
                    `
                }
            ]
        }
    ]
};

// --- Audio Check ---
export const audioCheckContent = {
    title: "Audio Check",
    completeText: "Submit",
    elements: [
        {
            type: "panel",
            elements: [
                {
                    type: "html",
                    html: `<p>In the audio clip below, you will hear a sequence of five numbers. Please type those numbers in the box to continue.<p style="color: red">Please make sure your sound is on.</p><audio controls src="assets/audiocheck.wav"></audio>`
                },
                {
                    type: "text",
                    name: "audio_check",
                    title: "Press play and enter the numbers you hear.",
                    inputType: "number",
                    isRequired: true,
                    validators: [
                        {
                            type: "expression",
                            text: "Incorrect. Please listen carefully and try again.",
                            expression: "{audio_check} == 42359"
                        }
                    ]
                },
            ]
        }
    ]
};

// --- Rating Impressions ---

// name = name used in data, title = name shown in study
const traits = [
    { name: "openness", title: "Open to new experiences" },
    { name: "conscientiousness", title: "Conscientious" },
    { name: "extraversion", title: "Extroverted" },
    { name: "agreeableness", title: "Agreeable" },
    { name: "neuroticism", title: "Neurotic" },
    { name: "warmth", title: "Warm" },
    { name: "competence", title: "Competent" },
];

// Dynamically builds sliders based on the above list of traits
const traitSliders = traits.map(trait => ({
    type: "slider",
    name: trait.name,
    title: trait.title,
    min: 0,
    max: 10,
    defaultValue: 5,
    tooltipVisibility: "never",
    customLabels: [
        {
            value: 0,
            text: "Least",
            showValue: true
        },
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        {
            value: 10,
            text: "Most",
            showValue: true
        }
    ]
}));

export const ratingContent = {
    autoAdvanceEnabled: true,
    pages: [
        {
            title: "Rating Impressions",
            elements:
                [
                    {
                        type: "html",
                        name: "instructions",
                        html: "<p>Rate the person in the video on the following parameters.</p>"
                    },
                    ...traitSliders
                ]
        }
    ],

};

// --- Demographics ---
export const demographicsContent = {
    pages: [
        {
            title: "Demographics",
            elements:
                [
                    {
                        type: "text",
                        name: "age",
                        title: "What is your age?",
                        inputType: "number",
                        isRequired: true
                    },
                    {
                        type: "checkbox",
                        name: "gender",
                        title: "What gender do you identify with? (Select all that apply)",
                        choices: ["Male", "Female", "Transgender", "Non-binary", "Not otherwise specified", "I do not wish to provide this information"],
                        isRequired: true
                    },
                    {
                        type: "checkbox",
                        name: "race",
                        title: "What race/ethnicity do you identify with? (Select all that apply)",
                        choices: ["American Indian or Alaska Native", "Asian", "Black or African-American", "Native Hawaiian or Other Pacific Islander", "White", "Latino", "Other"],
                        isRequired: true
                    },
                    {
                        type: "radiogroup",
                        name: "education",
                        title: "What is the highest level of education you have received?",
                        choices: ["Less than High School", "High School Diploma", "Some College", "Associate's Degree", "Bachelor's Degree", "Some Graduate School", "Master's Degree", "Doctoral Degree"],
                        isRequired: true
                    }
                ]
        },
        {
            title: "Feedback",
            completeText: "Submit",
            elements:
                [
                    {
                        type: "comment",
                        name: "feedback",
                        title: "Please let us know if any part of the study was confusing, unclear, or in need of improvement. We appreciate your feedback greatly!",
                    }
                ]
        }
    ]
};

// --- Finished ---
export const finishedContent = {
    title: "Study Completed",
    completeText: "Click here to return to Prolific",
    elements:
        [
            {
                type: "html",
                html: "<p>Thank you for participating in the study!</p>",
            }
        ]
};