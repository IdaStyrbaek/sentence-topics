/* initialize jsPsych */
var jsPsych = initJsPsych({
  on_interaction_data_update: function (data) {
    console.log(data);
    saveData(subject_id + '_browserinteraction_data.csv', jsPsych.data.getInteractionData().csv())
  },
  on_finish: function() {
   console.log(jsPsych.data.get().csv());
  }
});

/* add data properties */
jsPsych.data.addProperties({start_time: (new Date()).toISOString()});
/* this is for allocating participant numbers*/
var participant_id = jsPsych.data.getURLVariable('participant');
var subject_id = jsPsych.randomization.randomID(8);
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

/* create timeline */
var timeline = [];

if (Math.floor((Math.random() * 2) + 1) == 1) {
  /* ENGLISH VERSION */
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
      "<p>The theme should only be identified as 'people' if the sentence refers to someone specific</p>" +
      "<p>or a group of people, such as 'my brother', 'the man', 'teachers' etc.</p>" +
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
    sound_files: window['UK_sound_files_' + Math.floor((Math.random() * 6) + 1)]
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
      },
      {
        prompt: "Are you a native Danish speaker with English as a second language?",
        name: 'language',
        options: ['Yes', 'No'],
        required: true
      },
      {
        prompt: "How would you describe your English language skills?",
        name: 'english',
        options: ['Basic', 'Conversational', 'Fluent', 'Native-like proficiency'],
        required: true
      }    
    ],
  };
  timeline.push(demo);

  /* check sound*/
  var calibrate = {
    type: jsPsychInstructions,
    pages: [
      '<audio id="testAudio"><source src="sound/tone.mp3" type="audio/mpeg"></audio><h1>Sound Test</h1>' +
      '<p>Please test your sound by clicking the button below. You may click it multiple times to adjust your volume so you can hear it clearly.</p><button onclick="playSound()" type="button" class="snd-btn"><img src="images/sound.jpg" alt="Click to test sound" /></button>' +
      "<p>When you have adjusted the sound to a comfortable level, press 'Continue'.</p>" 
    ], 
    show_clickable_nav: true,
    button_label_next: "Continue"
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

  /*define intertrial interval*/
  var interval = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "+",
    choices: "NO_KEYS",
    trial_duration: 300
  };

  /*define audio trial*/
  var audio_trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    prompt: "<p>What is the main theme?</p>",
    choices: ['images/animal1.png', 'images/people1.png', 'images/food1.png', 'images/none1.png'],
    button_html: '<button class="jspsych-btn"><img src="%choice%" height="200" width="200"/></button>',
    response_allowed_while_playing: true,
    response_ends_trial: false,
    trial_duration: 5000,
    data: jsPsych.timelineVariable('data'),
    on_finish: function(data){
      var correct = false;
      if(data.answer == data.response && data.rt > -1){
        correct = true;
      }
      data.correct = correct;
    }
  };


  /* define procedure for trials*/
  var procedure = {
    timeline: [interval, audio_trial],
    /*timeline_variables: sound_files,*/   
    timeline_variables: window['UK_sound_files_' + Math.floor((Math.random() * 6) + 1)],
    randomize_order: false
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
    pages: ['<p>Thank you very much for participating!</p>'],
    button_label_next: 'Continue',
    allow_keys: false,
    show_clickable_nav: true,
    on_load: function () {
      saveData(subject_id + '_browserinteraction_data_rep.csv', jsPsych.data.getInteractionData().csv())
      saveData(subject_id + '_switch_data_rep.csv', jsPsych.data.get().csv()); 
    }
  }

  /* create close-browser node */
  var close_page = {
    type: jsPsychInstructions,
    pages: ['<p>Your data have been saved, feel free to close this window.</p>'],
    allow_keys: false,
    show_clickable_nav: false,
  }

} else {
  /* DANISH VERSION */
  /* define welcome message trial */
  var instructions = {
    type: jsPsychInstructions,
    pages: [
      '<h2><b>Instruktioner</b></h2>' +
      '<p>I dette forsøg vil du høre nogle korte sætninger.</p>'+
      '<p>For hver sætning vil du blive bedt om at identificere det <b>overordnede</b> tema, ved at klikke på et billede.</p>' +
      '<p>Temaerne er:</p>' +
      '<br>' +
      '<img src="images/animal1.png" height="200" width="200"></img>' +
      '<img src="images/people1.png" height="200" width="200"></img>' +
      '<img src="images/food1.png" height="200" width="200"></img>' +
      '<img src="images/none1.png" height="200" width="200"></img>' +
      "<p>'dyr', 'mennesker', 'mad', and 'ingen af disse'.</p>" +
      "<p>Du skal svare 'ingen af delene' hvis temaet i sætningen ikke passer på nogle af de andre kategorier.</p>"+ 
      "<p>Mange af sætningerne indeholder pronominer som 'jeg', 'du', 'de' og så videre.</p>" +
      "<p>Temaet bør kun identiferes som 'mennesker' hvis der refereres til en specifik person</p>" +
      "<p>eller en gruppe af mennesker, som 'min bror', 'manden', 'lærere' og så videre.</p>" +
      '<p>Du skal prøve at svare så hurtigt som muligt, så snart du kan identificere temaet. God fornøjelse!</p>',

      '<h2><b>Samtykkeerklæring</b></h2>'+
      "<p>Når du trykker 'Fortsæt', vil eksperimentet starte.</p>"+
      "<p>Inden du trykker ”Fortsæt”, er det vigtigt at du har læst og forstået hvad opgaven er og hvad eksperimentet går ud på.</p>"+
      "<p>Ved at trykke ”Fortsæt” giver du samtykke og tilladelse til at vi gennem din deltagelse i eksperimentet</p>"+ 
      "<p>må indsamle og behandle data og bruge det i en speciale-opgave og evt. en udgivelse.</p>"+ 
      "<p>Der bliver ikke indsamlet følsomme oplysninger og din besvarelse er helt anonym.</p>"+
      "<p>Du kan til hver en tid trække dig ud af forsøget mens din besvarelse er i gang.</p>"+ 
      "<p>Så snart din besvarelse er afsluttet, bliver dine data anonymiseret, og vi kan dermed ikke gå tilbage</p>" +
      "<p>og identificere din specifikke besvarelse.</p>"+
      "<p>Tusind tak for din deltagelse!</p>"
    ],
    button_label_previous: 'Forrige',
    button_label_next: 'Fortsæt',
    allow_keys: false,
    show_clickable_nav: true
  }
  /* add this node to the timeline */
  timeline.push(instructions);

  /* preload audiofiles*/
  var preload = {
    type: jsPsychPreload,
    sound_files: window['DK_sound_files_' + Math.floor((Math.random() * 6) + 1)]
  }
  timeline.push(preload);

  /*demographics trial*/
  var demo = {
    type: jsPsychSurveyMultiChoice,
    button_label: 'Fortsæt',
    questions: [
      {
        prompt: "Køn", 
        name: 'køn', 
        options: ['Kvinde', 'Mand', 'Andet', 'Ønsker ikke at oplyse'], 
        required: true
      }, 
      {
        prompt: "Alder", 
        name: 'alder', 
        options: ['<20', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'], 
        required: true
      },
      {
        prompt: "Har du dansk som modersmål og engelsk som andetsprog?",
        name: 'sprog',
        options: ['Ja', 'Nej'],
        required: true
      },
      {
        prompt: "Hvordan vil du beskrive dine sprogfærdigheder i engelsk",
        name: 'engelsk',
        options: ['Basisniveau', 'Samtaleniveau', 'Flydende', 'Modersmålsniveau'],
        required: true
      }  
    ],
  };
  timeline.push(demo);

  /* check sound*/
  var calibrate = {
    type: jsPsychInstructions,
    pages: [
      '<audio id="testAudio"><source src="sound/tone.mp3" type="audio/mpeg"></audio><h1>Lydtest</h1>' +
      '<p>Vær venlig at tjekke dit lydniveau ved at klikke på knappen nedenfor. Du kan klikke på den flere gange for at justere dit lydniveau så du kan høre lyden tydeligt.</p><button onclick="playSound()" type="button" class="snd-btn"><img src="images/sound.jpg" alt="Click to test sound" /></button>' +
      "<p>Når du har justeret lyden til et behageligt niveau, så tryk 'Fortsæt'.</p>"
    ], 
    show_clickable_nav: true,
    button_label_previous: 'Forrige',
    button_label_next: "Fortsæt"
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
    fullscreen_mode: true,
    message: "<p>Eksperimentet vil blive vist i fuld skærm, når du trykker 'Fortsæt'</p>",
    button_label: "Fortsæt"
  });

  /*define intertrial interval*/
  var interval = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "+",
    choices: "NO_KEYS",
    trial_duration: 300
  };

  /*define audio trial*/
  var audio_trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    prompt: "<p>Hvad er hovedtemaet?</p>",
    choices: ['images/animal1.png', 'images/people1.png', 'images/food1.png', 'images/none1.png'],
    button_html: '<button class="jspsych-btn"><img src="%choice%" height="200" width="200"/></button>',
    response_allowed_while_playing: true,
    response_ends_trial: false,
    trial_duration: 5000,
    data: jsPsych.timelineVariable('data'),
    on_finish: function(data){
      var correct = false;
      if(data.answer == data.response && data.rt > -1){
        correct = true;
      }
      data.correct = correct;
    }
  };


  /* define procedure for trials*/
  var procedure = {
    timeline: [interval, audio_trial],
    // timeline_variables: sound_files,
    timeline_variables: window['DK_sound_files_' + Math.floor((Math.random() * 6) + 1)], 
    // timeline_variables: window['DK_sound_files_1'], //for testing purposes
    randomize_order: false
  }

  timeline.push(procedure)

  /*optional comment*/
  var comment = {
    type: jsPsychSurveyText,
    questions: [
      {prompt: 'Hvis du har nogle kommentarer til din oplevelse af eksperimentet, kan du skrive dem her.'}
    ],
    button_label: 'Fortsæt'
  }

  timeline.push(comment);

  /* create thank-you node */
  var thanks = {
    type: jsPsychInstructions,
    pages: ['<p>Tusind tak for din deltagelse!</p>'],
    button_label_previous: 'Forrige',
    button_label_next: 'Fortsæt',
    allow_keys: false,
    show_clickable_nav: true,
    on_load: function () {
      saveData(subject_id + '_browserinteraction_data_rep.csv', jsPsych.data.getInteractionData().csv())
      saveData(subject_id + '_switch_data_rep.csv', jsPsych.data.get().csv()); 
    }
  }

  /* create close-browser node */
  var close_page = {
    type: jsPsychInstructions,
    pages: ['<p>Dine data er gemt nu - du må gerne lukke dette vindue.</p>'],
    allow_keys: false,
    show_clickable_nav: false,
  }
}

timeline.push(thanks);
timeline.push(close_page);

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
var subject_id = jsPsych.randomization.randomID(8);
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


