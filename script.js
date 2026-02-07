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

    // --- Scene 2: Frames ---
    let frameIndex = 1;
    const totalFrames = 8; // Actually we handle logic to play video after frame 7
    const frameBg = document.getElementById('frame-bg');
    const clickMeBtn = document.getElementById('click-me-btn');

    // Init first frame
    frameBg.style.backgroundImage = `url('assets/frame1.png')`;

    clickMeBtn.addEventListener('click', () => {
        clickMeBtn.style.display = 'none';
        frameIndex++;
        updateFrame();
    });

    function updateFrame() {
        if (frameIndex < 8) {
            frameBg.style.backgroundImage = `url('assets/frame${frameIndex}.png')`;
        }

        // Setup click listener for the full screen after button click
        if (frameIndex === 2) {
            scenes.frames.addEventListener('click', handleFrameClick);
        }
    }

    function handleFrameClick() {
        // Prevent rapid clicks if needed, but for now simple increment
        frameIndex++;
        if (frameIndex < 8) {
            frameBg.style.backgroundImage = `url('assets/frame${frameIndex}.png')`;
        } else if (frameIndex === 8) {
            // Trigger video scene
            scenes.frames.removeEventListener('click', handleFrameClick);
            transitionToScene('video');
        }
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
        { text: "hi you must be sydney! Ive heard many things about you.", type: "heart" },
        { text: "oh wheres nykin... hes... well, I hate to break it too you but there is no valentines. Im sorry", type: "heart" },
        { text: "i mean you can still go outside, play with friends, but I promise you theres nothing here for you", type: "heart" },
        { text: "...", type: "heart", action: "shake" },
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
        }
    }

    function performAction(action) {
        if (action === 'shake') {
            document.body.classList.add('shake-screen');
            setTimeout(() => {
                document.body.classList.remove('shake-screen');
                // Auto advance after shake if desired, or wait for click. 
                // User script implies "..." then face drops.
            }, 2000);
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
            characterSprite.innerHTML = '';
            characterSprite.style.background = 'red';
            characterSprite.style.boxShadow = '0 0 10px red';
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
        if (line.action) {
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
            requestAnimationFrame(draw);
        }
        draw();
    }
});
