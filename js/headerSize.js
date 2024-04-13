const header = document.getElementById('pageTitle');

function resizeHeaderFont() {

    const svgContainer = document.getElementById('svgMapContainer');
    const svgWidth = svgContainer.clientWidth;
    const maxWidth = svgWidth * 1;
    const textLength = header.textContent.length;
    const fontSize = Math.min(maxWidth / textLength, maxWidth);
    header.style.fontSize = `${fontSize}px`;
}

window.addEventListener('resize', resizeHeaderFont);

resizeHeaderFont(); 