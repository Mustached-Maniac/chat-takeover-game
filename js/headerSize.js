function resizeHeaderFont() {
    const maxWidth = 1920; // Set the max width for the header text
    const header = document.getElementById('pageTitle'); // Ensure you have this reference
    const minFontSize = 72; // Set a comfortable minimum font size

    let fontSize = parseInt(window.getComputedStyle(header).fontSize, 10);

    // Only scale down if necessary
    while (header.scrollWidth > maxWidth && fontSize > minFontSize) {
        fontSize--;
        header.style.fontSize = `${fontSize}px`;
    }
}

// Initial resize
resizeHeaderFont(); 

// Resize on viewport size change
window.addEventListener('resize', resizeHeaderFont);
