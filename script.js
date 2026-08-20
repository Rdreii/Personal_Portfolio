const canvas = document.getElementById('grid-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const spacing = 20;
const maxDistance = 100;

let weights = {};
let jitters = {};

function getKey(x, y) {
    return `${x},${y}`;
}

function getJitter(key) {
    if (!(key in jitters)) {
        jitters[key] = (Math.random() - 0.5) * 60;
    }
    return jitters[key];
}

const waveSpeed = 12;
const waveWidth = 220;

let waves = [];

function triggerWave() {
    let angle = Math.random() * Math.PI * 2;
    let maxProj = Math.abs(canvas.width * Math.cos(angle)) + Math.abs(canvas.height * Math.sin(angle));

    waves.push({
        angle: angle,
        pos: -waveWidth,
        maxProj: maxProj
    });
}

function scheduleNextWave() {
    const delay = 6000 + Math.random() * 2000;
    setTimeout(() => {
        triggerWave();
        scheduleNextWave();
    }, delay);
}

const starColors = [
    '79, 140, 255',   // blue
    '255, 220, 130',  // soft yellow
    '255, 255, 255'   // white
];

const stars = [];
const starCount = 120;

for (let i = 0; i < starCount; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.75 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 1,
        color: starColors[Math.floor(Math.random() * starColors.length)]
    });
}

let time = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            let key = getKey(x, y);
            if (!(key in weights)) weights[key] = 0.05;

            let dx = mouseX - x;
            let dy = mouseY - y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < spacing * 2) {
                weights[key] = 1;
            } else {
                weights[key] = Math.max(0.05, weights[key] * 0.96);
            }

            let opacity = weights[key];

            let waveBoost = 0;
            let jitter = getJitter(key);
            waves.forEach(wave => {
                let projection = x * Math.cos(wave.angle) + y * Math.sin(wave.angle);
                let waveDist = Math.abs(projection - (wave.pos + jitter));
                let closeness = Math.max(0, 1 - waveDist / waveWidth);
                waveBoost = Math.max(waveBoost, (closeness * closeness) * 0.4);
            });

            let combinedOpacity = Math.max(opacity, waveBoost);
            let radius = 1 + combinedOpacity * 1.2;

            let r = 90 + waveBoost * 40;
            let g = 100 + waveBoost * 40;
            let b = 255;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${combinedOpacity})`;
            ctx.fill();
        }
    }
    time += 0.02;

    stars.forEach(star => {
        let twinkle = (Math.sin(time * star.speed + star.phase) + 1) / 2;
        let opacity = 0.2 + twinkle * 0.8;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
        ctx.fill();
    });

    waves.forEach(wave => {
        wave.pos += waveSpeed;
    });
    waves = waves.filter(wave => wave.pos < wave.maxProj + waveWidth);

    requestAnimationFrame(draw);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

const greetings = ["Hi", "Hello", "Ciao", "Hola", "Bonjour", "Kumusta", "Konnichiwa"];
const typewriterEl = document.getElementById('typewriter');

let greetingIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
    const currentWord = greetings[greetingIndex];

    if (!isDeleting) {
        charIndex++;
        typewriterEl.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeLoop, 1200);
            return;
        }
    } else {
        charIndex--;
        typewriterEl.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
            isDeleting = false;
            greetingIndex = (greetingIndex + 1) % greetings.length;
        }
    }

    let speed = isDeleting ? 60 : 120;
    setTimeout(typeLoop, speed);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        triggerWave();
    }
});

const magneticStrength = 0.5;
const magneticRadius = 60;

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        link.style.transform = `translate(${distX * magneticStrength}px, ${distY * magneticStrength}px)`;
    });

    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translate(0, 0)';
    });
});

const sections = document.querySelectorAll('main > section');
const navLinks = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, {
    rootMargin: '-45% 0px -45% 0px',
    threshold: 0
});

sections.forEach(section => navObserver.observe(section));

const aboutOverlay = document.getElementById('about-overlay');
const overlayContent = document.getElementById('about-overlay-content');
const overlayClose = document.querySelector('.about-overlay-close');
let lastFocusedTrigger = null;

document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const panelInner = item.querySelector('.accordion-panel-inner');
        const label = trigger.querySelector('.fill-text').textContent;
        lastFocusedTrigger = trigger;

        overlayContent.innerHTML = `
            <h2 class="overlay-title">${label}</h2>
            <div class="overlay-divider"></div>
            ${panelInner.innerHTML}
        `;
        aboutOverlay.classList.add('opening');
        aboutOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        setTimeout(() => aboutOverlay.classList.add('open'), 500);
    });
});

function closeAboutOverlay() {
    aboutOverlay.classList.remove('open');
    setTimeout(() => {
        aboutOverlay.classList.remove('opening');
        aboutOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedTrigger) lastFocusedTrigger.focus();
    }, 400);
}

overlayClose.addEventListener('click', closeAboutOverlay);
aboutOverlay.querySelector('.about-overlay-backdrop').addEventListener('click', closeAboutOverlay);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutOverlay.classList.contains('opening')) closeAboutOverlay();
});

const projectsTrack = document.getElementById('projects-track');
const projectsDots = document.getElementById('projects-dots');

if (projectsTrack && projectsDots) {
    const cards = Array.from(projectsTrack.querySelectorAll('.carousel-card'));

    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to project ${i + 1}`);
        dot.addEventListener('click', () => {
            cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        projectsDots.appendChild(dot);
    });

    const dots = Array.from(projectsDots.querySelectorAll('.carousel-dot'));

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = cards.indexOf(entry.target);
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                entry.target.classList.add('active');
                dots.forEach(d => d.classList.remove('active'));
                dots[index].classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { root: projectsTrack, threshold: [0.6] });

    cards.forEach(card => cardObserver.observe(card));

    document.querySelector('.carousel-arrow--prev').addEventListener('click', () => {
        projectsTrack.scrollBy({ left: -projectsTrack.clientWidth * 0.75, behavior: 'smooth' });
    });
    document.querySelector('.carousel-arrow--next').addEventListener('click', () => {
        projectsTrack.scrollBy({ left: projectsTrack.clientWidth * 0.75, behavior: 'smooth' });
    });

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('active')) {
                e.preventDefault();
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });
    });

    let isDragging = false;
    let dragStartX = 0;
    let scrollStartX = 0;

    projectsTrack.addEventListener('pointerdown', (e) => {
        isDragging = true;
        projectsTrack.classList.add('dragging');
        dragStartX = e.clientX;
        scrollStartX = projectsTrack.scrollLeft;
    });

    window.addEventListener('pointerup', () => {
        isDragging = false;
        projectsTrack.classList.remove('dragging');
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        projectsTrack.scrollLeft = scrollStartX - (e.clientX - dragStartX);
    });
}

document.querySelectorAll('.card-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.closest('.carousel-card').classList.toggle('flipped');
    });
});

document.addEventListener('mousedown', () => {
    cursor.classList.add('cursor-click');
});

document.addEventListener('mouseup', () => {
    cursor.classList.remove('cursor-click');
});

const photoWrap = document.getElementById('about-photo');

photoWrap.addEventListener('mousemove', (e) => {
    const rect = photoWrap.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    const maxTilt = 15; // max degrees of rotation
    const rotateY = (offsetX / (rect.width / 2)) * maxTilt;
    const rotateX = -(offsetY / (rect.height / 2)) * maxTilt;

    photoWrap.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
});

photoWrap.addEventListener('mouseleave', () => {
    photoWrap.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
});

document.querySelector('.logo-wrap').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('note-name').value;
    const email = document.getElementById('note-email').value;
    const message = document.getElementById('note-message').value;

    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

    window.location.href = `mailto:ronandre0123@gmail.com?subject=${subject}&body=${body}`;
});

fetch('https://api.countapi.xyz/hit/rondreii-portfolio/visits')
    .then(res => res.json())
    .then(data => {
        document.getElementById('site-views').textContent = data.value.toLocaleString();
    })
    .catch(() => {
        document.getElementById('site-views').textContent = 'N/A';
});

let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('header-hidden');
    } else {
        header.classList.remove('header-hidden');
    }

    lastScroll = currentScroll;
});

document.querySelectorAll('.fade-line').forEach(el => observer.observe(el));

typeLoop();

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

draw();
scheduleNextWave();