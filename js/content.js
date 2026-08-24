// --- Screener ---
export const screenerContent = {
    pages: [
        {
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
        },
        {
            elements:
                [
                    {
                        type: "radiogroup",
                        name: "mic",
                        title: "This study requires the use of a microphone to record yourself speaking.",
                        choices: [
                            {
                                value: "yes_mic",
                                text: "I have a functioning microphone and am able to record myself speaking in a quiet location."
                            },
                            {
                                value: "no_mic",
                                text: "I am unable/unwilling to use my microphone to record myself speaking."
                            }
                        ],
                        isRequired: true
                    },
                ]
        }
    ],
    completeText: "Continue",
};

// --- Traits List ---
const traits = [
    // name = name used in data, title = name shown in study, def = definition shown in instructions and tooltips
    { name: "openness", title: "Open to new experiences", def: "willingness to try new things and to explore new ideas" },
    { name: "conscientiousness", title: "Conscientious", def: "extent to which the candidate seems organized, hardworking, and goal-oriented" },
    { name: "extraversion", title: "Extroverted", def: "extent to which the candidate seems energized by social interaction and enjoys being around other people" },
    { name: "agreeableness", title: "Agreeable", def: "extent to which the candidate seems cooperative, kind, and trusting" },
    { name: "neuroticism", title: "Neurotic", def: "extent to which the candidate seems prone to negative emotions such as anxiety, anger, and sadness" },
    { name: "warmth", title: "Warm", def: "extent to which the candidate seems friendly, approachable, and likeable" },
    { name: "competence", title: "Competent", def: "extent to which the candidate seems capable, skilled, and knowledgeable" },
    { name: "confidence", title: "Confident", def: "extent to which the candidate displays self-assurance, decisiveness, and belief in their own abilities" },
    { name: "leadership capacity", title: "Leader-like", def: "extent to which the candidate seems like someone who can guide, inspire, and manage others effectively" },
    { name: "ambitiousness", title: "Ambitious", def: "extent to which the candidate displays a strong desire for achievement, advancement, and success" },
    { name: "trustworthiness", title: "Trustworthy", def: "extent to which the candidate seems reliable, honest, and dependable in their actions and communications" },
];

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
                        <p>We are researchers interested in how we understand other people in professional settings.</p>
                        <p>Your job today is simple. <b>There are four parts to our task.</b></p>
                        <div class="callout-box">
                            <ol class="bold-numbers">
                                <li>View professional video introductions and type your impressions of the speaker.</li>
                                <li>Form a final impression of the speaker in the video.</li>
                                <li>Rate the job candidate on several attributes.</li>
                                <li>Decide whether to offer the job candidate an interview at the company</li>
                            </ol>
                        </div>
                        <p>You will repeat these steps for each video.</p>
                        <div class="callout-box">
                            <p>Today, you will take on the role of a professional recruiter. A set of companies (i.e., your clients) have tasked you with reviewing professional video introductions by job candidates. While viewing each video, you should form impressions about the person. Once you have watched the video and formed your impressions, you will make a decision about whether or not the candidate should be offered an interview at the company they applied to.</p>
                        </div>
                        <p>In the next few pages, you will learn more about each step of the experiment.</p>
                    `
                }
            ]
        },
        {
            title: "Step 1: Watch and describe the job candidate in the video",
            elements: [
                {
                    type: "html",
                    html: `
                        <video width="100%" autoplay loop muted src="assets/instruct/submitting.mp4"></video>
                        <p>NEED TO CHANGE FOR AUDIO RECORDING</p>
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
                        <p>NEED TO CHANGE FOR AUDIO RECORDING</p>
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
                        <p>Once you finish watching the video, you will rate the candidate in the video on several attributes using sliders. <b>Please go with your gut feelings, and don't overthink it.</b> You will be evaluating the candidate on these attributes:</p>
                        <p><b>Please read the category descriptions carefully below:</b></p>
                        <div class="callout-box">
                            <ul>
                                ${traits.map(trait => `<li><b>${trait.title}:</b> ${trait.def}</li>`).join('')}
                            </ul>
                        </div>
                    `
                }
            ]
        },
        {
            title: "Step 4: Make a recruitment decision",
            elements: [
                {
                    type: "html",
                    html: `
                        <video width="100%" autoplay loop muted src="assets/instruct/rating.mp4"></video>
                        <p>NEED TO CHANGE FOR AUDIO RECORDING</p>
                        <p>After evaluating the candidate on all attributes, decide whether to invite them for an interview at the company they applied to.</p>
                        <p>You will repeat these 4 steps for 10 videos. We encourage you to have fun with this task. Writing more is better than writing less!</p>
                        <p>After completing all videos, there will be a textbox to provide feedback. We welcome any of your thoughts about ways to improve the task and appreciate your time and effort.</p>
                    `
                }
            ]
        }
    ],
    completeText: "Continue",
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
    ],
    completeText: "Continue",
};

// --- Allow Mic Instructions ---
export const allowMicInstructionsContent = {
    title: "Instructions",
    completeText: "Click here to return to Prolific",
    elements:
        [
            {
                type: "html",
                html: `
                    <p>After pressing the \"Continue\" button below, you will see a pop-up message from your browser requesting permission to use your microphone. Examples have been provided below. The style will vary depending on your browser.</p>
                    <img src="assets/instruct/allow_mic.png" style="width: 100%;">
                    <p>When you see this message, please use the dropdown (if provided) to select the microphone you want to use, then click \"Allow\".</p>
                `
            }
        ],
    completeText: "Continue",
};

// --- Rating Impressions ---

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
        },
        {
            title: "Recruitment Decision",
            elements: [
                {
                    type: "rating",
                    name: "interview",
                    title: "Please decide whether to invite this candidate for an interview.",
                    autoGenerate: false,
                    rateCount: 2,
                    rateValues: [
                        {
                            value: "1",
                            text: "Invite for interview"
                        },
                        {
                            value: "0",
                            text: "Do not invite for interview"
                        }
                    ],
                    rateMax: 2,
                    displayMode: "buttons",
                    isRequired: true
                }
            ],
            showNavigationButtons: false
        }
    ]
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
    ],
    completeText: "Submit",
};

// --- Completion ---
export const completionContent = {
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