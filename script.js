document.addEventListener('DOMContentLoaded', () => {
    // --- State and Config ---
    const scenes = {
        password: document.getElementById('scene-password'),
        frames: document.getElementById('scene-frames'),
        video: document.getElementById('scene-video'),
        dialogue: document.getElementById('scene-dialogue'),
        proposal: document.getElementById('scene-proposal')
    };

    // --- Scene 1: Password ---
    const passwordInput = document.getElementById('password-input');

    passwordInput.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase().trim() === 'cute') {
            passwordInput.disabled = true;
            passwordInput.style.borderColor = '#4CAF50';
            setTimeout(() => {
                transitionToScene('frames');
            }, 1000);
        }
    });

    // --- Scene 2: Frames (Cracking Effect) ---
    const crackContainer = document.getElementById('cracks-svg');
    const sceneFrames = document.getElementById('scene-frames');
    const clickMeBtn = document.getElementById('click-me-btn');
    let crackStage = 0;
    const maxStages = 8;

    clickMeBtn.addEventListener('click', () => {
        clickMeBtn.style.display = 'none';
        sceneFrames.addEventListener('click', advanceCrackStage);
        // Initial crack
        advanceCrackStage();
    });

    function advanceCrackStage() {
        crackStage++;
        playCrackSound();

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const maxDist = Math.max(cx, cy) * 1.5; // Ensure coverage

        const fragment = document.createDocumentFragment();

        // Always radiate from center now
        const count = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Lines always start near center
            const x1 = cx + (Math.random() - 0.5) * 50;
            const y1 = cy + (Math.random() - 0.5) * 50;

            // Go outwards
            const length = (Math.random() * 0.6 + 0.4) * maxDist;
            const x2 = cx + Math.cos(angle) * length;
            const y2 = cy + Math.sin(angle) * length;

            createLine(fragment, x1, y1, x2, y2, 2 + Math.random() * 2);
        }

        // Add some connecting webs if stage is advanced
        if (crackStage > 3) {
            const webCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < webCount; i++) {
                // Connect arbitrary points between radial lines could be complex calculation
                // Simpler: random jagged lines slightly further out
                const angle = Math.random() * Math.PI * 2;
                const dist = (Math.random() * 0.5 + 0.2) * maxDist;
                const x1 = cx + Math.cos(angle) * dist;
                const y1 = cy + Math.sin(angle) * dist;

                const x2 = x1 + (Math.random() - 0.5) * 150;
                const y2 = y1 + (Math.random() - 0.5) * 150;

                createLine(fragment, x1, y1, x2, y2, 1 + Math.random());
            }
        }

        crackContainer.appendChild(fragment);

        if (crackStage >= maxStages) {
            sceneFrames.removeEventListener('click', advanceCrackStage);
            finishCracking();
        }
    }

    function createLine(parent, x1, y1, x2, y2, width) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-width', width);
        line.setAttribute('class', 'crack-line');
        parent.appendChild(line);
    }

    function playCrackSound() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Synthesize a sharp snap/crunch
        // High pass filtered noise with very short envelope
        const bufferSize = audioCtx.sampleRate * 0.1; // 100ms
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8); // Sharp decay
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000; // Remove low rumble, keep the snap

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noise.start();
    }

    function finishCracking() {
        // Shatter effect simulation
        document.body.classList.add('shake-screen');
        setTimeout(() => {
            document.body.classList.remove('shake-screen');
            transitionToScene('dialogue');
        }, 500);
    }

    // --- Scene 3: Video ---
    const videoElement = document.getElementById('transition-video');

    function playVideo() {
        videoElement.play();
        videoElement.addEventListener('ended', () => {
            transitionToScene('dialogue');
        });
    }

    // --- Scene 4: Dialogue ---
    const dialogueText = document.getElementById('dialogue-text');
    const nextIndicator = document.querySelector('.next-indicator');
    const characterSprite = document.getElementById('character-sprite');
    let dialogueIndex = 0;
    let isTyping = false;
    let faceHasAppeared = false;
    let isFaceTrapped = false;

    // Trivia State
    const triviaContainer = document.getElementById('trivia-container');
    const triviaInput = document.getElementById('trivia-input');
    const triviaChoices = document.getElementById('trivia-choices');
    const triviaSubmit = document.getElementById('trivia-submit');
    const gameOverOverlay = document.getElementById('game-over-overlay');

    let currentTriviaIndex = 0;
    const triviaQuestions = [
        { q: "What is his favorite color?", a: "purple", type: "text" },
        { q: "What is his dog's name?", a: "berty", type: "text" },
        { q: "What is his favorite place he's traveled?", a: "egypt", type: "text" },
        { q: "How many days have you guys been dating?", a: "238", type: "text" },
        { q: "Does he love you more than anything in the world?", a: "yes", type: "choice", options: ["Yes", "No"] },
        { q: "Is he so down bad for you?", a: "yes", type: "choice", options: ["Yes", "No"] }
    ];

    // Creating vanilla Web Audio API context for beep
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playBeep() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    }

    const dialogues = [
        { text: "Hi sydeny", type: "heart" },
        { text: "Ive heard many things about you.", type: "heart" },
        { text: "...", type: "heart" },
        { text: "oh where's Nykin...", type: "heart" },
        { text: "he's... well,", type: "heart" },
        { text: "I hate to break it too you but", type: "heart" },
        { text: "there is no valentines.", type: "heart" },
        { text: "Im sorry", type: "heart" },
        { text: "i mean you can still go outside,", type: "heart" },
        { text: "play with friends,", type: "heart" },
        { text: "do something fun I guess,", type: "heart" },
        { text: "but I promise you theres nothing here for you", type: "heart" },
        { text: "...", type: "heart" },
        { text: "...", type: "heart" },
        { text: "...", type: "heart" },
        { text: "Why are you still here?", type: "heart" },
        { text: "I told you", type: "heart" },
        { text: "theres nothing here", type: "heart" },
        { text: "you're wasting your time", type: "heart" },
        { text: "...", type: "heart" },
        { text: "...", type: "heart" },
        { text: "...", type: "heart" },
        { text: "this isn't funny", type: "heart" },
        { text: "don't you have better things to do?", type: "heart" },
        { text: "THERES NOTHING HERE FOR YOU!!!", type: "heart", emotion: "angry" },
        { text: "", type: "heart", action: "shake" },
        { text: "what was that?", type: "heart", emotion: "evil" },
        { text: "NO IT CAN'T BE", type: "heart", emotion: "evil" },
        { text: "ITS IMPOSSIBLE", type: "heart", emotion: "evil" },
        { text: "SYDNEY", type: "face" },
        { text: "Help please Im trapped", type: "face", action: "trapFace" }, // Trapped starts here
        { text: "The heart...", type: "face", emotion: "sad" },
        { text: "He's evil", type: "face", emotion: "angry" },
        { text: "MUAHAHAHAHAHA", type: "heart", emotion: "evil" },
        { text: "I took ur cute boyfriend", type: "heart", emotion: "evil" },
        { text: "and theres nothing you can do.", type: "heart" },
        { text: "unless...", type: "heart" },
        { text: "unless you can prove you know him...", type: "heart" },
        { text: "BETTER THAN MEEEE", type: "heart", emotion: "angry" },
        { text: "oh your so screwed", type: "heart", emotion: "evil" },
        { text: "muahahahahah", type: "heart", emotion: "evil" },
        { text: "first question...", type: "heart" },
        { text: "", type: "heart", action: "startTrivia" }, // Starts trivia
        // Trivia happens here. 
        // If Win:
        { text: "NO IT CAN'T BE", type: "heart", emotion: "angry" },
        { text: "I'm melting!!", type: "heart", action: "shake", emotion: "angry" },
        { text: "...", type: "heart" },
        { text: "Omg you saved me!", type: "face", emotion: "happy", action: "freeFace" },
        { text: "ur kinda really attracting and sexy and hot", type: "face", emotion: "thinking" },
        { text: "wait...", type: "face", emotion: "happy" },
        { text: "you thought I would leave?! never!", type: "face", emotion: "angry" }, // referencing user request
        { text: "so then sydeny, will you be my valentnes?", type: "face", emotion: "happy" },
        { text: "I brought you flowers too", type: "face", action: "end", emotion: "sexy" }
    ];

    function typeWriter(text, index = 0) {
        if (index < text.length) {
            dialogueText.textContent += text.charAt(index);
            if (index % 2 === 0) playBeep(); // Beep every other char
            isTyping = true;
            setTimeout(() => {
                typeWriter(text, index + 1);
            }, 50); // Typing speed
        } else {
            isTyping = false;
            nextIndicator.style.display = 'block';

            // Auto advance for the shake action if text is empty
            if (dialogues[dialogueIndex].action === 'shake' && text === '') {
                performAction('shake');
            }
        }
    }

    function performAction(action) {
        if (action === 'shake') {
            document.body.classList.add('shake-screen');
            setTimeout(() => {
                document.body.classList.remove('shake-screen');
                advanceDialogue();
            }, 1000);
        } else if (action === 'end') {
            setTimeout(() => {
                transitionToScene('proposal');
            }, 2000);
        } else if (action === 'startTrivia') {
            startTrivia();
        }
        // trapFace and freeFace are handled in renderDialogue directly to avoid loops
    }

    // --- Trivia Logic ---
    function startTrivia() {
        dialogueText.style.display = 'none';
        nextIndicator.style.display = 'none';
        triviaContainer.style.display = 'flex';
        loadTriviaQuestion();
    }

    function loadTriviaQuestion() {
        const q = triviaQuestions[currentTriviaIndex];

        // Show question in the dialogue box (using a temporary text element or reusing dialogueText?)
        // Let's reuse dialogueText but make sure it's visible
        dialogueText.style.display = 'block';
        dialogueText.textContent = q.q;

        triviaInput.value = '';
        triviaInput.style.display = 'none';
        triviaChoices.style.display = 'none';
        triviaSubmit.style.display = 'none';

        if (q.type === 'text') {
            triviaInput.style.display = 'block';
            triviaSubmit.style.display = 'block';
            triviaInput.focus();
        } else if (q.type === 'choice') {
            triviaChoices.innerHTML = '';
            triviaChoices.style.display = 'flex';
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.textContent = opt;
                btn.className = 'trivia-choice-btn';
                btn.addEventListener('click', () => checkAnswer(opt));
                triviaChoices.appendChild(btn);
            });
        }
    }

    triviaSubmit.addEventListener('click', () => checkAnswer(triviaInput.value));
    triviaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(triviaInput.value);
    });

    function checkAnswer(answer) {
        const q = triviaQuestions[currentTriviaIndex];
        const correct = q.a.toLowerCase().trim();
        const userAns = answer.toLowerCase().trim();

        if (userAns === correct) {
            // Correct
            currentTriviaIndex++;
            if (currentTriviaIndex < triviaQuestions.length) {
                loadTriviaQuestion();
            } else {
                winTrivia();
            }
        } else {
            loseTrivia();
        }
    }

    function loseTrivia() {
        // Heart says wrong, fade to black
        dialogueText.textContent = "WRONG! YOU LOSE!";
        triviaContainer.style.display = 'none';

        setTimeout(() => {
            // Sad dialogue before black screen?
            // User requested: "heart tells them they lose and the face has some hurt sad dialog then it fades to black"
            // I'll just simulate it quickly here or create a mini-sequence.
            // Simpler: Just fade to black with overlay
            gameOverOverlay.style.display = 'flex';
            setTimeout(() => { gameOverOverlay.style.opacity = '1'; }, 100);
        }, 1500);
    }

    function winTrivia() {
        triviaContainer.style.display = 'none';
        dialogueText.style.display = 'block';
        // Advance to next dialogue after the trivia start point
        advanceDialogue();
    }

    function advanceDialogue() {
        if (isTyping) return; // Prevent skipping while typing

        dialogueIndex++;
        if (dialogueIndex < dialogues.length) {
            renderDialogue(dialogues[dialogueIndex]);
        }
    }

    function renderDialogue(line) {
        // Update state based on action BEFORE rendering if it affects rendering
        if (line.action === 'trapFace') isFaceTrapped = true;
        if (line.action === 'freeFace') isFaceTrapped = false;

        dialogueText.textContent = '';
        nextIndicator.style.display = 'none';

        // Handle Heart Sprite
        if (line.type === 'heart') {
            characterSprite.className = 'heart-sprite';
            characterSprite.style.background = 'transparent';
            characterSprite.style.boxShadow = 'none';
            characterSprite.style.transform = 'none';
            characterSprite.style.animation = 'float 2s infinite ease-in-out';

            // Heart Expressions (Normal, Evil, Angry)
            let eyes = '<circle cx="35" cy="40" r="4" fill="black" /><circle cx="65" cy="40" r="4" fill="black" />';
            let mouth = '<path d="M35 55 Q 50 65 65 55" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />';

            if (line.emotion === 'evil') {
                // Angled eyebrows, sharp grin
                eyes = `
                    <path d="M25 35 L40 42" stroke="black" stroke-width="2" />
                    <circle cx="35" cy="42" r="3" fill="black" />
                    <path d="M75 35 L60 42" stroke="black" stroke-width="2" />
                    <circle cx="65" cy="42" r="3" fill="black" />
                `;
                mouth = '<path d="M35 55 Q 50 70 65 55" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />';
            } else if (line.emotion === 'angry') {
                // Frown, narrow eyes
                eyes = `
                    <path d="M30 38 L40 42" stroke="black" stroke-width="2" />
                    <circle cx="35" cy="42" r="3" fill="black" />
                    <path d="M70 38 L60 42" stroke="black" stroke-width="2" />
                    <circle cx="65" cy="42" r="3" fill="black" />
                `;
                mouth = '<path d="M35 65 Q 50 55 65 65" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />';
            }

            characterSprite.innerHTML = `
            <svg width="100" height="100" viewBox="0 0 100 100" style="overflow:visible;">
                <path d="M50 88 C 10 60 -15 35 15 15 C 30 0 45 10 50 25 C 55 10 70 0 85 15 C 115 35 90 60 50 88 Z" 
                      fill="red" stroke="white" stroke-width="3" />
                ${eyes}
                ${mouth}
            </svg>
            `;

        } else if (line.type === 'face') {
            characterSprite.className = 'face-sprite';
            characterSprite.style.background = 'transparent';
            characterSprite.style.boxShadow = 'none';
            characterSprite.style.transform = 'none';
            characterSprite.style.animation = 'none';

            // Determine Image Source based on emotion
            let imgSrc = 'assets/face.jpeg';
            if (line.emotion === 'sad') imgSrc = 'assets/sad.jpeg';
            if (line.emotion === 'happy' || line.emotion === 'sexy') imgSrc = 'assets/smile.jpeg';
            if (line.emotion === 'angry') imgSrc = 'assets/angry.jpeg';
            if (line.emotion === 'thinking') imgSrc = 'assets/turned_on_or_thinking.jpeg';

            // Animation Logic: Only drop-in once
            let imgClass = '';
            if (!faceHasAppeared) {
                imgClass = 'drop-animation';
                faceHasAppeared = true;
            }

            const imgHtml = `<img src="${imgSrc}" class="${imgClass}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">`;

            // Trapped State Logic
            if (isFaceTrapped) {
                characterSprite.innerHTML = `<div class="trapped-container">${imgHtml}</div>`;
            } else {
                characterSprite.innerHTML = imgHtml;
            }
        }

        // Handle Special Actions immediately
        // We handle trapFace/freeFace above to avoid recursion loop with re-render
        if (line.action && line.action !== 'trapFace' && line.action !== 'freeFace') {
            performAction(line.action);
        }

        typeWriter(line.text);
    }

    // Start dialogue interaction
    document.querySelector('.dialogue-box').addEventListener('click', () => {
        if (!isTyping && dialogueIndex < dialogues.length - 1) {
            advanceDialogue();
        }
    });

    // --- Scene 5: Proposal ---
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('click', moveNoButton); // Just in case mobile tap

    function moveNoButton() {
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
        noBtn.style.position = 'absolute';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    }

    yesBtn.addEventListener('click', () => {
        startConfetti();
        // Replace content with Celebration text
        document.querySelector('.proposal-content h1').textContent = "yaaaayyy";
        document.querySelector('.buttons').style.display = 'none';
    });

    // --- Utilities ---
    function transitionToScene(sceneName) {
        // Hide all scenes
        Object.values(scenes).forEach(el => {
            el.classList.remove('active');
            el.style.opacity = '0';
            setTimeout(() => {
                if (!el.classList.contains('active')) el.classList.add('hidden');
            }, 1000); // match css transition
        });

        // Show target scene
        const target = scenes[sceneName];
        target.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity fade-in
        setTimeout(() => {
            target.classList.add('active');
            target.style.opacity = '1';
        }, 50);

        // Specific Scene Init
        if (sceneName === 'video') {
            playVideo();
        }
        if (sceneName === 'dialogue') {
            // Reset dialogue if needed or just start
            if (dialogueIndex === 0) renderDialogue(dialogues[0]);
        }
        if (sceneName === 'proposal') {
            // Generate flowers
            const flowerContainer = document.getElementById('flowers-container');
            flowerContainer.innerHTML = '';
            const flowers = ['🌹', '🌷', '💐', '🌺', '🌸', '🌻'];
            for (let i = 0; i < 30; i++) {
                const el = document.createElement('div');
                el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
                el.style.position = 'absolute';
                el.style.left = Math.random() * 100 + '%';
                el.style.top = Math.random() * 100 + '%';
                el.style.fontSize = (Math.random() * 2 + 1) + 'rem';
                el.style.transform = `rotate(${Math.random() * 360}deg)`;
                flowerContainer.appendChild(el);
            }
        }
    }

    // --- Confetti (Simple Canvas implementation) ---
    function startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Play initial big pop
        playFireworkSound();

        const pieces = [];
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4'];

        for (let i = 0; i < 300; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2
            });
        }

        let loopCount = 0;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                p.y += p.speed;
                p.angle += 0.1;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
            });

            // Random intermittent pops
            loopCount++;
            if (loopCount % 60 === 0 && Math.random() > 0.5) {
                playFireworkSound();
            }

            requestAnimationFrame(draw);
        }
        draw();
    }

    function playFireworkSound() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Simple noise burst for explosion/pop
        const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // White noise with exponential decay
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = audioCtx.createGain();
        // Randomize volume slightly
        gainNode.gain.setValueAtTime(0.1 + Math.random() * 0.1, audioCtx.currentTime);

        // Lowpass filter to dampen the harsh white noise
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noise.start();
    }
});
