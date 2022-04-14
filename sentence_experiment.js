/* initialize jsPsych */
var jsPsych = initJsPsych({
  on_interaction_data_update: function (data) {
    console.log(data);
    saveData(subject_id + '_browserinteraction_data.csv', jsPsych.data.getInteractionData().csv())
  },
  on_finish: function() {
   console.log(jsPsych.data.get().csv());
   /*window.location = 'https://github.com/alberteseeberg'*/
  }
});

/* create timeline */
var timeline = [];

/* define welcome message trial */
var instructions = {
  type: jsPsychInstructions,
  pages: [
    '<h2><b>Instructions</b></h2>' +
    '<p>In this experiment, you will hear some short sentences.</p>'+
    '<p>For each sentence you will be asked to identify the <b>main</b> theme, by clicking on a picture.</p>' +
    '<p>The themes are:</p>' +
    '<br>' +
    '<img src="images/animal1.png" height="200" width="200"></img>' +
    '<img src="images/people1.png" height="200" width="200"></img>' +
    '<img src="images/food1.png" height="200" width="200"></img>' +
    '<img src="images/none1.png" height="200" width="200"></img>' +
    "<p>'animals', 'people', 'food', and 'none of these'.</p>" +
    "<p>You should choose 'none of these' if the theme does not fit any of the other categories.</p>"+ 
    "<p>Many of the sentences include pronouns such as 'I', 'you', 'they' and so on.</p>" +
    "<p>The theme should only be identified as 'people' if the sentence refers to someone specific,</p>" +
    "<p>such as 'my brother', 'the man', 'my teacher' etc.</p>" +
    '<p>You have to try to answer as fast as possible, as soon as you can identify the theme.</p>',

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
/* add this node to the timeline */
timeline.push(instructions);

/* preload audiofiles*/
var preload = {
  type: jsPsychPreload,
  sound_files: sound_files,
}
timeline.push(preload);

/*demographics trial*/
/*var demo = {
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
    },
		{
      prompt: "Are you a bilingual speaker of Danish and English?",
		  name: 'language',
		  options: ['yes', 'no']
      required: true
    }    
  ],
};
timeline.push(demo); */

/* check sound*/
var calibrate = {
  type: jsPsychInstructions,
  pages: [
    '<audio id="testAudio"><source src="sound/tone.mp3" type="audio/mpeg"></audio><h1>Sound Test</h1>' +
    "<p>When you have adjusted the sound to a comfortable level, press 'Continue'.</p>" +
    '<p>Please test your sound by clicking the button below. You may click it multiple times to adjust your volume so you can hear it clearly.</p><button onclick="playSound()" type="button" class="snd-btn"><img src="images/sound.jpg" alt="Click to test sound" /></button>'
  ], 
  show_clickable_nav: true,
  button_label: "Continue",
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

/**	This function plays the sound in the sound check **/
function playSound(){
	var x = document.getElementById("testAudio");
	x.play();
}

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
  prompt: "<p>What is the main theme?</p>",
  choices: ['images/animal1.png', 'images/people1.png', 'images/food1.png', 'images/none1.png'],
  button_html: '<button class="jspsych-btn"><img src="%choice%" height="200" width="200"/></button>',
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

/*optional comment*/
var comment = {
  type: jsPsychSurveyText,
  questions: [
    {prompt: 'If you have any comments about your experience doing the experiment, you can write them here'}
  ]
}

timeline.push(comment);

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


