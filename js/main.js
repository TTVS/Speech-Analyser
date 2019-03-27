/******************** SPEECH RECOGNITION ********************/

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recordButton = document.querySelector("#voice-button");
var speechResult = document.querySelector(".result");
var confidenceResult = document.querySelector(".confidence");

function recordSpeech() {
  // Cleanup button content
  recordButton.disabled = true;
  recordButton.textContent = "Listening...";
  speechResult.textContent = "";

  var recognition = new SpeechRecognition();
  recognition.lang = "en-US"; //TODO: provide user with selection
  recognition.interimResults = false;
  recognition.maxAlternatives = 1; //TODO: research if these can be more

  recognition.start();

  recognition.onresult = event => {
    var result = event.results[0][0].transcript.toLowerCase();
    speechResult.textContent = "Speech received: " + result + ".";

    confidenceResult.textContent =
      "Confidence: " + event.results[0][0].confidence;
  };

  recognition.onspeechend = () => {
    recognition.stop();
    recordButton.disabled = false;
    recordButton.textContent = "Start Recording";
  };

  recognition.onerror = event => {
    recordButton.disabled = false;
    recordButton.textContent = "Start new test";
    speechResult.textContent = "Error occurred in recognition: " + event.error;
  };

  recognition.onaudiostart = event => {
    //Fired when the user agent has started to capture audio.
    console.log("SpeechRecognition.onaudiostart");
  };

  recognition.onaudioend = event => {
    //Fired when the user agent has finished capturing audio.
    console.log("SpeechRecognition.onaudioend");
  };

  recognition.onend = event => {
    //Fired when the speech recognition service has disconnected.
    console.log("SpeechRecognition.onend");

    if (speechResult.textContent == "") {
      speechResult.textContent =
        "You were incomprehensible. Even aliens wouldn't understand you. Imbecile.";
    }
  };

  recognition.onnomatch = event => {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log("SpeechRecognition.onnomatch");
  };

  recognition.onsoundstart = event => {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log("SpeechRecognition.onsoundstart");
  };

  recognition.onsoundend = event => {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log("SpeechRecognition.onsoundend");
  };

  recognition.onspeechstart = event => {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log("SpeechRecognition.onspeechstart");
  };
  recognition.onstart = event => {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log("SpeechRecognition.onstart");
  };
}

recordButton.addEventListener("click", recordSpeech);

/******************** SPEECH SYNTHESISER ********************/

// Init SpeechSynth API
const synth = window.speechSynthesis;

// DOM Elements
const dictationForm = document.querySelector("#dictation-form");
const inputTxt = document.querySelector("#text-input");
const voiceSelect = document.querySelector("#voice-select");

const rate = document.querySelector("#rate");
const rateValue = document.querySelector("#rate-value");
const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector("#pitch-value");

// Init voices array
let voices = [];

function populateVoiceList() {
  // Sort list of voices based on name of voice
  voices = synth.getVoices().sort((a, b) => {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) return -1;
    else if (aname == bname) return 0;
    else return +1;
  });

  var selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";
  for (i = 0; i < voices.length; i++) {
    var option = document.createElement("option");
    option.textContent = voices[i].name + " (" + voices[i].lang + ")";

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.log("speechSynthesis.speaking");
    return;
  }

  if (inputTxt.value !== "") {
    var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
    utterThis.onend = event => {
      console.log("SpeechSynthesisUtterance.onend");
    };
    utterThis.onerror = function(event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    var selectedOption = voiceSelect.selectedOptions[0].getAttribute(
      "data-name"
    );
    for (i = 0; i < voices.length; i++) {
      if (voices[i].name == selectedOption) {
        utterThis.voice = voices[i];
      }
    }

    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
  }
}

dictationForm.onsubmit = event => {
  event.preventDefault();

  speak();

  inputTxt.blur();
};

pitch.onchange = () => {
  pitchValue.textContent = pitch.value;
};

rate.onchange = () => {
  rateValue.textContent = rate.value;
};

voiceSelect.onchange = () => {
  speak();
};
