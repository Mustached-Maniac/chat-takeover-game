function resizeHeaderFont() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgWidth = svgContainer.clientWidth;
    
    // Use a starting font size and then reduce it until the header no longer causes a scrollbar
    let fontSize = 240; // Start with a high value that you reduce
    header.style.fontSize = `${fontSize}px`;

    // Check if the header is causing a scrollbar and reduce font size until it doesn't
    while (header.scrollWidth > svgWidth && fontSize > 0) {
        fontSize--;
        header.style.fontSize = `${fontSize}px`;
    }
}

// Initial resize
resizeHeaderFont(); 

// Resize on viewport size change
window.addEventListener('resize', resizeHeaderFont);
