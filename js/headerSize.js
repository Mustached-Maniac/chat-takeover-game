function resizeHeaderFont() {
    const maxWidth = 1920; 
    const header = document.getElementById('pageTitle'); 
    const minFontSize = 72; 

    let fontSize = parseInt(window.getComputedStyle(header).fontSize, 10);

    while (header.scrollWidth > maxWidth && fontSize > minFontSize) {
        fontSize--;
        header.style.fontSize = `${fontSize}px`;
    }
}

resizeHeaderFont(); 

window.addEventListener('resize', resizeHeaderFont);
