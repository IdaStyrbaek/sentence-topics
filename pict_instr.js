function new_timeline() {
    /* defining test timeline*/
    var pict = {
        timeline: [{
	        type: "image-button-response",
	        stimulus: 'animal.png',
	        choices: ['Fortsæt'],
	        prompt: "<p>kateogorien 'dyr' er repræsenteret med dette billede</p>"
            // post_trial_gap: 500
    }],
};
return [pict];
}