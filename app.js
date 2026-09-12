// Main Application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('interactive-btn');
    const outputBox = document.getElementById('output-box');

    if (btn && outputBox) {
        btn.addEventListener('click', () => {
            outputBox.classList.remove('hidden');
            outputBox.textContent = `✨ Interactive test success! Local time: ${new Date().toLocaleTimeString()}`;
            
            // Subtle button animation feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    }

    console.log('My GitHub Project app loaded successfully!');
});
