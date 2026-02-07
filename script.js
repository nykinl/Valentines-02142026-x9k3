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
    let crackCount = 0;
    const maxCracks = 10;

    clickMeBtn.addEventListener('click', () => {
        clickMeBtn.style.display = 'none';
        // Enable clicking anywhere on the scene
        sceneFrames.addEventListener('click', createCrack);
        // Initial crack center
        createCrack({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    });

    function createCrack(e) {
        crackCount++;

        // Audio placeholder for crack sound if desired (optional)
        // playCrackSound();

        const x = e.clientX;
        const y = e.clientY;

        // Generate random crack pattern
        const numLines = Math.floor(Math.random() * 3) + 3; // 3-5 lines per click

        for (let i = 0; i < numLines; i++) {
            const angle = Math.random() * 360;
            const length = Math.random() * 100 + 50;
            const x2 = x + Math.cos(angle * Math.PI / 180) * length;
            const y2 = y + Math.sin(angle * Math.PI / 180) * length;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'crack-line');
            crackContainer.appendChild(line);
        }

        if (crackCount >= maxCracks) {
            sceneFrames.removeEventListener('click', createCrack);
            finishCracking();
        }
    }

    function finishCracking() {
        // Shatter effect simulation
        document.body.classList.add('shake-screen');
        setTimeout(() => {
            document.body.classList.remove('shake-screen');
            // Transition directly to dialogue (skipping video as per plan/feedback implication)
            // Or if video was specifically for the shatter, we can keep it? 
            // User said "blurry images for frames... cracking effect doesn't work".
            // Let's assume the "video" was the shatter transition. 
            // We'll proceed to 'dialogue' directly for a clean break, or use 'video' if it's a specific asset they want.
            // Plan said "Remove/bypass video transition... transition to next scene".
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
        { text: "oh wheres nykin...", type: "heart" },
        { text: "hes... well,", type: "heart" },
        { text: "I hate to break it too you but", type: "heart" },
        { text: "there is no valentines.", type: "heart" },
        { text: "Im sorry", type: "heart" },
        { text: "i mean you can still go outside,", type: "heart" },
        { text: "play with friends,", type: "heart" },
        { text: "but I promise you theres nothing here for you", type: "heart" },
        { text: "...", type: "heart" },
        // Logic will handle shake here via a special empty entry or just action on previous? 
        // User asked for "..." then shake then "what was that?"
        { text: "", type: "heart", action: "shake" }, // Invisible Shake step
        { text: "what was that?", type: "heart" },
        { text: "you thought I would leave?! never!", type: "face" },
        { text: "so then sydeny, will you be my valentnes?", type: "face" },
        { text: "I brought you flowers too", type: "face", action: "end" }
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
            // Play sound if available?
            setTimeout(() => {
                document.body.classList.remove('shake-screen');
                advanceDialogue(); // Auto advance after shake
            }, 1000);
        } else if (action === 'end') {
            setTimeout(() => {
                transitionToScene('proposal');
            }, 2000);
        }
    }

    function advanceDialogue() {
        if (isTyping) return; // Prevent skipping while typing

        dialogueIndex++;
        if (dialogueIndex < dialogues.length) {
            renderDialogue(dialogues[dialogueIndex]);
        }
    }

    function renderDialogue(line) {
        dialogueText.textContent = '';
        nextIndicator.style.display = 'none';

        // Handle Sprite Changes
        if (line.type === 'heart') {
            characterSprite.className = 'heart-sprite';
            // Reset styles that might have been set by CSS class or previous runs
            characterSprite.style.background = 'transparent';
            characterSprite.style.boxShadow = 'none';
            characterSprite.style.transform = 'none';
            characterSprite.style.animation = 'float 2s infinite ease-in-out';

            // SVG Heart with Border and Face
            characterSprite.innerHTML = `
            <svg width="100" height="100" viewBox="0 0 100 100" style="overflow:visible;">
                <!-- Heart Shape with Border -->
                <path d="M50 88 C 10 60 -15 35 15 15 C 30 0 45 10 50 25 C 55 10 70 0 85 15 C 115 35 90 60 50 88 Z" 
                      fill="red" stroke="white" stroke-width="3" />
                
                <!-- Face -->
                <!-- Eyes -->
                <circle cx="35" cy="40" r="4" fill="black" />
                <circle cx="65" cy="40" r="4" fill="black" />
                
                <!-- Mouth (Smile) -->
                <path d="M35 55 Q 50 65 65 55" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />
            </svg>
            `;

        } else if (line.type === 'face') {
            characterSprite.className = 'face-sprite';
            characterSprite.style.background = 'transparent';
            characterSprite.style.boxShadow = 'none';
            characterSprite.style.transform = 'none';
            characterSprite.style.animation = 'none';
            // Insert Image with animation
            characterSprite.innerHTML = `<img src="assets/face.jpeg" class="drop-animation" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">`;
        }

        // Handle Special Actions immediately or after text?
        if (line.action && line.text !== '') {
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
