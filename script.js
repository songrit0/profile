document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        } else {
            header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }
    });

    // Theme Switcher
    initThemeSwitcher();

    console.log('Website loaded successfully!');
});

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

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function () {
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
