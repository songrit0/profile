/* =========================================
   Random System — Premium Script
   ========================================= */

// Random System
const items = [];
let isSpinning = false;
let editingIndex = -1;

// Load items from localStorage
function loadItems() {
    const savedItems = localStorage.getItem('randomItems');
    if (savedItems) {
        const parsed = JSON.parse(savedItems);
        items.push(...parsed);
    }
}

// Save items to localStorage
function saveItems() {
    localStorage.setItem('randomItems', JSON.stringify(items));
}

// Display items in the list
function displayItems() {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;

    itemsList.innerHTML = '';

    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-card-icon">${item.icon}</div>
            <div class="item-card-name">${item.name}</div>
            <div class="item-card-actions">
                <button class="item-edit-btn" onclick="editItem(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="item-delete-btn" onclick="deleteItem(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        itemsList.appendChild(itemCard);
    });
}

// Edit item
function editItem(index) {
    editingIndex = index;
    const item = items[index];

    const addItemForm = document.getElementById('addItemForm');
    const iconInput = document.getElementById('itemIcon');
    const nameInput = document.getElementById('itemName');
    const formTitle = addItemForm.querySelector('h3');

    iconInput.value = item.icon;
    nameInput.value = item.name;
    formTitle.textContent = 'แก้ไขไอเทม';
    addItemForm.style.display = 'block';

    // Scroll to form
    addItemForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Delete item
function deleteItem(index) {
    if (confirm('คุณต้องการลบไอเทมนี้ใช่หรือไม่?')) {
        items.splice(index, 1);
        saveItems();
        displayItems();
        generateRollerItems();
    }
}

// Create item element
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'roller-item';
    itemDiv.innerHTML = `
        <div class="roller-item-icon">${item.icon}</div>
        <div class="roller-item-name">${item.name}</div>
    `;
    return itemDiv;
}

// Generate roller items with fixed winning position
function generateRollerItems(winningItem = null) {
    const track = document.getElementById('rollerTrack');
    if (!track) return;

    track.innerHTML = '';

    if (items.length === 0) {
        track.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: rgba(255,255,255,0.5); font-family: \'Chakra Petch\', sans-serif; font-size: 0.95rem;">เพิ่มไอเทมเพื่อเริ่มใช้งาน</div>';
        return;
    }

    const winningIndex = 25;

    for (let i = 0; i < 50; i++) {
        let itemToUse;

        if (winningItem && i === winningIndex) {
            itemToUse = winningItem;
        } else {
            itemToUse = items[Math.floor(Math.random() * items.length)];
        }

        track.appendChild(createItemElement(itemToUse));
    }
}

// Spin function
function spin() {
    if (isSpinning) return;

    if (items.length === 0) {
        const resultDisplay = document.getElementById('resultDisplay');
        resultDisplay.innerHTML = '<p style="color: #f87171;">กรุณาเพิ่มไอเทมก่อนสุ่ม!</p>';
        setTimeout(function () {
            resultDisplay.innerHTML = '<p>กดปุ่ม Spin เพื่อสุ่ม!</p>';
        }, 2000);
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    const track = document.getElementById('rollerTrack');
    const resultDisplay = document.getElementById('resultDisplay');
    const wrapper = document.querySelector('.roller-wrapper');

    spinBtn.disabled = true;
    spinBtn.classList.add('spinning');
    resultDisplay.classList.remove('show-result');
    resultDisplay.innerHTML = '<p>กำลังสุ่ม...</p>';

    // Reset position
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    // Choose result
    const winningItem = items[Math.floor(Math.random() * items.length)];

    // Generate roller items with winning item at position
    generateRollerItems(winningItem);

    setTimeout(function () {
        const winningIndex = 25;
        const rollerItems = track.querySelectorAll('.roller-item');

        const firstItem = rollerItems[0];
        const itemWidth = firstItem.getBoundingClientRect().width;
        const itemStyle = window.getComputedStyle(firstItem);
        const marginLeft = parseFloat(itemStyle.marginLeft);
        const marginRight = parseFloat(itemStyle.marginRight);
        const totalItemWidth = itemWidth + marginLeft + marginRight;

        const trackStyle = window.getComputedStyle(track);
        const trackPaddingLeft = parseFloat(trackStyle.paddingLeft);

        const containerCenter = wrapper.offsetWidth / 2;

        const itemCenterPosition = trackPaddingLeft + (winningIndex * totalItemWidth) + (totalItemWidth / 2);
        const offset = containerCenter - itemCenterPosition;

        track.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        track.style.transform = `translateX(${offset}px)`;

        setTimeout(function () {
            resultDisplay.classList.add('show-result');
            resultDisplay.innerHTML = `
                <div class="result-icon">${winningItem.icon}</div>
                <p>คุณได้: ${winningItem.name}!</p>
            `;

            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.classList.remove('spinning');
        }, 5000);
    }, 100);
}

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
            const style = getComputedStyle(document.body);
            const primaryLight = style.getPropertyValue('--primary-light').trim();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${primaryLight}, ${this.opacity})`;
            ctx.fill();
        }
    }

    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 30000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const style = getComputedStyle(document.body);
                    const primaryLight = style.getPropertyValue('--primary-light').trim();
                    const opacity = (1 - dist / 120) * 0.06;
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

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initThemeSwitcher();
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();

    loadItems();
    displayItems();
    generateRollerItems();

    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spin);
    }

    // Quick add button
    const quickAddBtn = document.getElementById('quickAddBtn');
    const addItemForm = document.getElementById('addItemForm');
    if (quickAddBtn && addItemForm) {
        quickAddBtn.addEventListener('click', function () {
            editingIndex = -1;
            addItemForm.querySelector('h3').textContent = 'เพิ่มไอเทมใหม่';
            addItemForm.style.display = addItemForm.style.display === 'none' ? 'block' : 'none';

            if (addItemForm.style.display === 'block') {
                document.getElementById('itemIcon').focus();
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            editingIndex = -1;
            addItemForm.style.display = 'none';
            document.getElementById('itemIcon').value = '';
            document.getElementById('itemName').value = '';
        });
    }

    // Emoji shortcut buttons
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    if (emojiButtons.length > 0) {
        emojiButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const emoji = this.getAttribute('data-emoji');
                const iconInput = document.getElementById('itemIcon');
                if (iconInput) {
                    iconInput.value = emoji;
                    iconInput.focus();
                }
            });
        });
    }

    // Form submit
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const iconInput = document.getElementById('itemIcon');
            const nameInput = document.getElementById('itemName');

            const newItem = {
                icon: iconInput.value.trim(),
                name: nameInput.value.trim()
            };

            if (newItem.icon && newItem.name) {
                if (editingIndex >= 0) {
                    items[editingIndex] = newItem;
                } else {
                    items.push(newItem);
                }

                saveItems();
                displayItems();
                generateRollerItems();

                iconInput.value = '';
                nameInput.value = '';
                editingIndex = -1;
                addItemForm.style.display = 'none';

                // Show success feedback
                const addBtn = itemForm.querySelector('.add-btn');
                const originalHTML = addBtn.innerHTML;
                addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>สำเร็จ!</span>';

                setTimeout(function () {
                    addBtn.innerHTML = originalHTML;
                }, 1500);
            }
        });
    }
});
