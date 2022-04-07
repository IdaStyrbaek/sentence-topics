/* initialize jsPsych */
var jsPsych = initJsPsych({
  on_interaction_data_update: function (data) {
    console.log(data);
    saveData(subject_id + '_browserinteraction_data.csv', jsPsych.data.getInteractionData().csv())
  },
  on_finish: function() {
   console.log(jsPsych.data.get().csv());
   window.location = 'https://github.com/alberteseeberg'
  }
});

/* create timeline */
var timeline = [];

/* define welcome message trial */
var instructions = {
  type: jsPsychInstructions,
  pages: [
    '<p>In this experiment, you will hear some short sentences.</p>'+
    '<p>For each sentence you will be asked to identify the overall theme, by clicking on a picture.</p>' +
    '<p>The themes are:</p>' +
    '<br>' +
    '<img src="animal.png" height="200" width="250"></img>' +
    '<img src="people.png" height="200" width="250"></img>' +
    '<img src="food.png" height="200" width="250"></img>' +
    '<img src="none.png" height="200" width="250"></img>' +
    "<p>You should choose 'none of these' if the theme does not fit any of the other categories.</p>"+ 
    '<p>You have to try to answer as fast as possible, as soon as you can identify the theme.</p>'
],
  allow_keys: false,
  show_clickable_nav: true
}
/* add this node to the timeline */
timeline.push(instructions);

/* define consent page */
var consent = {
  type: jsPsychInstructions,
  pages: [
    '<h2><b>Consent form</b></h2>'+
    "<p>When you press 'Continue' the experiment will begin.</p>"+
    "<p>Before you press 'Continue', it is important that you have read and understood what the task is and what the experiment is about.</p>"+
    "<p>By pressing 'Continue' you consent and give permission for us to collect data through your participation in the study</p>"+ 
    "<p>and to analyze and use these data in a master's thesis and possibly in a later publication.</p>"+ 
    "<p>No sensitive information will be obtained, and your response is completely anonymous.</p>"+
    "<p>You can withdraw from the study at any time during the experiment.</p>"+ 
    "<p>As soon as the experiment is over, your data will be anonymized, and we cannot go back and identify your specific response.</p>"+
    "<p>Thank you for your participation!</p>"
  ],
  button_label_next: 'Continue',
  allow_keys: false,
  show_clickable_nav: true
}
timeline.push(consent);

/* preload audiofiles*/
var preload = {
  type: jsPsychPreload,
  sound_files: sound_files,
}
timeline.push(preload);

/*demographics trial*/
var demo = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Sex", 
      name: 'sex', 
      options: ['Female', 'Male', 'Other', 'Do not wish to inform'], 
      required: true
    }, 
    {
      prompt: "Age", 
      name: 'age', 
      options: ['<20', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'], 
      required: true
    }
  ],
};
timeline.push(demo);

/* check sound*/
var calibrate = {
  type: jsPsychAudioButtonResponse,
  stimulus: 'animal-animals1.mp3',
  prompt:
    "<h4><strong>Quick sound check</strong></h4>" +
    "<p class='gap-above'>Please adjust the volume of your device to a comfortable level where you can clearly hear the sounds. Then click 'Continue!' above.</p>" +
    "<p class='gap-above'>..........</p>" +
    "<p class='font15'>If the experiment fails to load, or you cannot hear the sounds despite having turned up the volume, close the window and open it in a different browser, e.g., Chrome, Firefox or Edge.</p>",
  choices: ["<p class='font15'><strong>Play sound</strong></p>"+"<p class='font15'><strong> again</strong></p>","<p class='font15'><strong>Volume is comfortable now.</strong></p>" +
    "<p class='font15'><strong> Continue!</strong></p>"],
  margin_vertical: '2px'
};

loop_calibrate = {
  timeline: [calibrate],
  loop_function: function (data) {
    if (data.values()[0].button_pressed == 0) {
      return true;
    } else {
      return false;
    }
  }
};

timeline.push(loop_calibrate);

/* enter fullscreen */
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});


/*define audio trial*/
var audio_trial = {
  type: jsPsychAudioButtonResponse,
  stimulus: jsPsych.timelineVariable('sound'),
  choices: ['animal.png', 'people.png', 'food.png', 'none.png'],
  prompt: "<p>What is the main theme?</p>",
  button_html: '<button class="jspsych-btn"><img src="%choice%" /></button>',
  response_allowed_while_playing: true,
  response_ends_trial: false,
  trial_duration: 4000
};


/* define procedure for trials*/
var procedure = {
  timeline: [audio_trial],
  timeline_variables: sound_files,
  randomize_order: true
}

timeline.push(procedure)

/* create thank-you node */
var thanks = {
  type: jsPsychInstructions,
  pages: ['<p>Thank you very much for participating!'],
  allow_keys: false,
  show_clickable_nav: true,
  on_load: function () {
    saveData(subject_id + '_browserinteraction_data_rep.csv', jsPsych.data.getInteractionData().csv())
    saveData(subject_id + '_groove_data_rep.csv', jsPsych.data.get().csv()); 
  }
}

timeline.push(thanks);

/* saving data */
function saveData(name, data){
    var url = 'record_result.php';
    var data = {filename: name, filedata: data};
  
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
              'Content-Type': 'application/json'
      })
    });
}

/* add data properties */
jsPsych.data.addProperties({start_time: (new Date()).toISOString()});
/* this is for allocating participant numbers*/
var participant_id = jsPsych.data.getURLVariable('participant');
var subject_id = jsPsych.randomization.randomID(15);
jsPsych.data.addProperties({participant: subject_id});
/* add properties from prolific */
var prol_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
    prol_id: prol_id,
    study_id: study_id,
    session_id: session_id,
  });

/* when all nodes have been added to the timeline, initiate the experiment */
jsPsych.run(timeline);


