const jsPsych = initJsPsych();

const timeline = [];

var subject_id = jsPsych.randomization.randomID(6);

const condition = jsPsych.randomization.sampleWithoutReplacement(['moral-first', 'fashion-first'])[0]

const instruction = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
  <div style='width: 700px;'>
    <p>Press 1 if you see a word, and press 5 if you see a non-word.</p>
    <p>Press any key to begin.</p>
  </div>
`,
  post_trial_gap: 2000
};

const trial = [];

const fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  css_classes: ['fixation'],
  trial_duration: () => {
    var duration = Math.random() * 300 + 400; // min time is 400ms, max time is 700ms
    // round duration to the nearest 16.667 ms
    duration = Math.round(duration / 16.667) * 16.667;
    return duration;
  }
};

const word = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  choices: "NO_KEYS",
  trial_duration: 50,
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const mask = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: () => {
    const mask_length = jsPsych.timelineVariable('word').length;
    const mask = "&".repeat(mask_length);
    return mask;
  },
  data: {
    task: 'mask'
  },
  css_classes: ['mask'],
  choices: "NO_KEYS",
  trial_duration: 200, // deviation from original because we only could get 60Hz refresh
};

const response = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: "",
  choices: ['1', '5'],
  trial_duration: 1500,
  response_ends_trial: false,
  data: {
    is_word: jsPsych.timelineVariable('is_word'),
    word_type: jsPsych.timelineVariable('word_type'),
    word: jsPsych.timelineVariable('word'),
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: function (data) {
    data.correct = (data.response == '1' && data.is_word == true) || (data.response == '5' && data.is_word == false);
  }
}

trial.push(fixation, word, mask, response);

timeline.push(instruction);

const fashion_shuffled = jsPsych.randomization.shuffle(fashion_stimuli);
const fashion_blocks = [
  fashion_shuffled.slice(0,100),
  fashion_shuffled.slice(100,200),
  fashion_shuffled.slice(200,300)
]

const moral_shuffled = jsPsych.randomization.shuffle(moral_stimuli);
const moral_blocks = [
  moral_shuffled.slice(0,100),
  moral_shuffled.slice(100,200),
  moral_shuffled.slice(200,300)
]

const test_block_1_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[0],
  data: {
    block: 1
  }
}

const test_block_2_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[1],
  data: {
    block: 2
  }
}

const test_block_3_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[2],
  data: {
    block: 3
  }
}

const test_block_1_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[0],
  data: {
    block: 1
  }
}

const test_block_2_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[1],
  data: {
    block: 2
  }
}

const test_block_3_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[2],
  data: {
    block: 3
  }
}

const block_break = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <p>You can take a short break.</p>
    <p>When you are ready to continue, press the spacebar.</p>
  `,
  choices: [' '],
  post_trial_gap: 2000
}

const test_procedure_fashion = {
  timeline: [test_block_1_fashion, block_break, test_block_2_fashion, block_break, test_block_3_fashion],
  data: {
    phase: 'fashion'
  },
}

const test_procedure_moral = {
  timeline: [test_block_1_moral, block_break, test_block_2_moral, block_break, test_block_3_moral],
  data: {
    phase: 'moral'
  },
}

const if_procedure_f = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the button trial,
    // and check which key was pressed
    return condition == "fashion-first";
  }
}

const if_procedure_m = {
  timeline: [test_procedure_moral],
  conditional_function: function () {
    // get the data from the button trial,
    // and check which key was pressed
    return condition == "moral-first"
  }
}

const halfway_break = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <p>You are halfway done! You can take a short break.</p>
    <p>Please wait for the experimenter to signal that you can continue.</p> 
    <p>Once the experimenter has said you can continue, press the spacebar.</p>
  `,
  choices: [' '],
  post_trial_gap: 2000
};

const if_procedure_f2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the previous trial,
    // and check which key was pressed
    return condition = "moral-first";
  }
}

const if_procedure_m2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the previous trial,
    // and check which key was pressed
    return condition = "fashion-first"
  }
}

const debrief_block =
{
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <div style='width: 700px;'>
      <p>You have now completed the experiment.</p>
      <p>Thank you for your participation.</p>
    </div>
  `,
  choices: "NO_KEYS",
  on_start: function () {
    jsPsych.data.get().localSave('json', `219_2024_behavioral_${subject_id}.json`);
  }
};

timeline.push(
  if_procedure_m, 
  if_procedure_f, 
  halfway_break, 
  if_procedure_f2, 
  if_procedure_m2, 
  debrief_block
);

jsPsych.run(timeline);
