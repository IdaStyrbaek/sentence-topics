function new_timeline() {
  /* defining test timeline*/
  var instr = {
    timeline: [{
      type: "html-button-response",
      choices: ['Fortsæt'],
      stimulus: "<p>Du vil i eksperimentet høre nogle korte sætninger. </p><p>For hver sætning vil du blive bedt om at identificere det overordnede tema, </p><p>ved at klikke på et billede. Temaerne er 'dyr', 'mennesker' og 'mad', </p><p>og ved hver sætning vil der være mulighed for at svarer 'ingen af delene'.</p><p> Du skal prøve at svare så hurtigt som muligt, </p><p>så snart du kan identificere temaet. </p><p>God fornøjelse!",
      // post_trial_gap: 500
  }],
  sample: {type: 'fixed-repetitions', size: 1}
};
return [instr];
}
