function new_timeline() {
  /* defining test timeline*/
  var instr = {
    timeline: [{
      type: "html-button-response",
      choices: ['Fortsæt'],
      stimulus: "<p>Når du trykker ”Fortsæt”, giver du tilladelse til, </p><p>at vi må indsamle data gennem din deltagelse i eksperimentet.</p> <p>Der bliver ikke indsamlet følsomme oplysninger, </p><p>og din besvarelse er helt anonym. </p><p>Du kan til hver en tid trække dig ud af undersøgelsen.</p> <p>Når du trykker ”Fortsæt”, vil eksperimentet starte.</p> <p>Tusind tak for din deltagelse! </p>",
      // post_trial_gap: 500
  }],
  sample: {type: 'fixed-repetitions', size: 1}
};
return [instr];
}
