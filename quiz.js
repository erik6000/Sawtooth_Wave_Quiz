const quizData = [
    { center: 63 },
    { center: 125 },
    { center: 250 },
    { center: 500 },
    { center: 1000 },
    { center: 2000 },
    { center: 4000 },
    { center: 8000 },
    { center: 16000 },
];

function createSawtoothWave(centerFreq, duration = 5, sampleRate = 44100) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = centerFreq;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 0.01);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return oscillator;
}

function getNextSawtoothWave() {
    if (quizData.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * quizData.length);
    const selectedCenter = quizData.splice(randomIndex, 1)[0];
    const oscillator = createSawtoothWave(selectedCenter.center);
    oscillator.center = selectedCenter.center;
    return oscillator;
}

function flashFeedback(color, centerFrequency) {
    const feedback = document.getElementById('feedback');
    feedback.style.backgroundColor = color;
    feedback.style.display = 'block';

    const centerFrequencyElement = document.getElementById('centerFrequency');
    centerFrequencyElement.innerText = centerFrequency;
    centerFrequencyElement.style.display = 'block';

    setTimeout(() => {
        feedback.style.display = 'none';
        centerFrequencyElement.style.display = 'none';
    }, 1000);
}

document.getElementById('startQuiz').addEventListener('click', () => {
    document.getElementById('startQuiz').style.display = 'none';
	document.getElementById('questionText').style.display = 'block';
	document.getElementById('playAudio').style.display = 'block';
	
	let correctAnswers = 0;
	let totalQuestions = quizData.length;
	let currentOscillator = getNextSawtoothWave();

	function playNextSound() {
		if (!currentOscillator) {
			alert(`Quiz finished! You scored ${correctAnswers} out of ${totalQuestions}`);
			return;
		}

		// User interaction is required to play audio on mobile devices.
		const playAudio = () => {
			currentOscillator.start();
			setTimeout(() => {
				currentOscillator.stop();
				const answer = prompt('Enter the fundamental frequency (e.g., "500"):');
				if (answer) {
					const frequency = Number(answer);
					const found = currentOscillator.center === frequency;

					if (found) {
						flashFeedback('green', currentOscillator.center);
						correctAnswers++;
					} else {
						flashFeedback('red', currentOscillator.center);
					}
				}
				currentOscillator = getNextSawtoothWave();
			}, 5000);
		};

		// Check if the AudioContext is in the "suspended" state and resume it.
		if (currentOscillator.context.state === 'suspended') {
			currentOscillator.context.resume().then(playAudio);
		} else {
			playAudio();
		}
	}

	document.getElementById('playAudio').addEventListener('click', playNextSound);
	document.getElementById('nextQuestion').addEventListener('click', playNextSound);
});