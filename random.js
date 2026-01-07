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
        track.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: rgba(255,255,255,0.6); font-family: \'Chakra Petch\', sans-serif;">เพิ่มไอเทมเพื่อเริ่มใช้งาน</div>';
        return;
    }

    const winningIndex = 25;

    for (let i = 0; i < 50; i++) {
        let itemToUse;

        // วางไอเทมที่ชนะไว้ที่ตำแหน่งเดียวที่ indicator ชี้
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
        resultDisplay.innerHTML = '<p style="color: #ec4899;">กรุณาเพิ่มไอเทมก่อนสุ่ม!</p>';
        setTimeout(function() {
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

    // เลือกผลลัพธ์ก่อน (สุ่มครั้งเดียว)
    const winningItem = items[Math.floor(Math.random() * items.length)];

    // สร้าง roller items พร้อมวางไอเทมที่ชนะไว้ที่ตำแหน่งที่ถูกต้อง
    generateRollerItems(winningItem);

    setTimeout(function () {
        const winningIndex = 25;
        const rollerItems = track.querySelectorAll('.roller-item');

        // วัด width จริงของ item (รวม margin ทั้งซ้ายและขวา)
        const firstItem = rollerItems[0];
        const itemWidth = firstItem.getBoundingClientRect().width;
        const itemStyle = window.getComputedStyle(firstItem);
        const marginLeft = parseFloat(itemStyle.marginLeft);
        const marginRight = parseFloat(itemStyle.marginRight);
        const totalItemWidth = itemWidth + marginLeft + marginRight;

        // ดึง padding ของ track (padding: 0 50%)
        const trackStyle = window.getComputedStyle(track);
        const trackPaddingLeft = parseFloat(trackStyle.paddingLeft);

        // ใช้ container width จริง
        const containerCenter = wrapper.offsetWidth / 2;

        // คำนวณตำแหน่งของไอเทมที่ชนะ (นับจาก edge ซ้ายของ track รวม padding)
        // ตำแหน่งกึ่งกลางของไอเทมที่ชนะ = paddingLeft + (winningIndex * itemWidth) + (itemWidth / 2)
        const itemCenterPosition = trackPaddingLeft + (winningIndex * totalItemWidth) + (totalItemWidth / 2);

        // offset ที่ต้องเลื่อน = ตำแหน่งกึ่งกลาง container - ตำแหน่งกึ่งกลางของไอเทม
        const offset = containerCenter - itemCenterPosition;

        // เริ่มการหมุน
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

// Theme Switcher
function initThemeSwitcher() {
    // Load saved theme or default to blue
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setTheme(savedTheme);

    // Add click handlers to theme options
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
    // Set theme attribute on body
    document.body.setAttribute('data-theme', theme);

    // Update active state on theme options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Update theme button title
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

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Initialize theme switcher
    initThemeSwitcher();

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
                    // Edit existing item
                    items[editingIndex] = newItem;
                } else {
                    // Add new item
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
