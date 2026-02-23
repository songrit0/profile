/* =========================================
   แมวเป้า.dev_ — Premium Portfolio Script
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initThemeSwitcher();
    initSmoothScrolling();
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initActiveSectionTracking();

    console.log('Website loaded successfully!');
});

/* === Particle Background === */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += this.fadeDirection * this.fadeSpeed;

            if (this.opacity >= 0.5) this.fadeDirection = -1;
            if (this.opacity <= 0.05) this.fadeDirection = 1;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(var(--primary-light), ${this.opacity})`;

            // Get computed color
            const style = getComputedStyle(document.body);
            const primaryLight = style.getPropertyValue('--primary-light').trim();
            ctx.fillStyle = `rgba(${primaryLight}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles — fewer for performance
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const style = getComputedStyle(document.body);
                    const primaryLight = style.getPropertyValue('--primary-light').trim();
                    const opacity = (1 - dist / 120) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${primaryLight}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab not visible
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

/* === Theme Switcher === */
function initThemeSwitcher() {
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setTheme(savedTheme);

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function () {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            localStorage.setItem('theme', theme);
        });
    });
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    const themeBtn = document.querySelector('.theme-btn');
    const themeNames = {
        'purple': 'สีม่วง',
        'blue': 'สีน้ำเงิน',
        'pink': 'สีชมพู',
        'green': 'สีเขียว',
        'orange': 'สีส้ม',
        'white': 'สีขาว',
        'minimal': 'มินิมอล'
    };
    if (themeBtn) {
        themeBtn.setAttribute('title', themeNames[theme] || 'เปลี่ยนสี');
    }
}

/* === Smooth Scrolling === */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                e.preventDefault();
                const headerOffset = window.innerWidth <= 768 ? 60 : 70;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

/* === Header Scroll Effect === */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* === Mobile Menu === */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    // Close on escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');

    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* === Scroll Reveal === */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* === Active Section Tracking === */
function initActiveSectionTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[data-section]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-70px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

/* === Copy to Clipboard === */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function () {
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        button.classList.add('copied');

        setTimeout(function () {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(function (err) {
        console.error('Failed to copy: ', err);
        alert('ไม่สามารถคัดลอกได้');
    });
}
