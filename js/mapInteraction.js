let startPlace = null;
let endPlace = null;

function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgURL = 'assets/Lower_48_Map.svg';
    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

function initializeStateInteractions() {
    const svgContainer = document.getElementById('svgMapContainer');
    
    // Use event delegation for path clicks
    svgContainer.addEventListener('click', function(event) {
        let target = event.target;
        
        // Proceed only if a path was clicked
        if (target.tagName !== 'path') {
            return;
        }
        
        // If the path is already the startPlace or endPlace, reset it
        if (target === startPlace || target === endPlace) {
            resetState(target);
            if (target === startPlace) startPlace = null;
            if (target === endPlace) endPlace = null;
        } else {
            // Set as startPlace or endPlace
            if (!startPlace) {
                startPlace = target;
                setTransform(startPlace, 'left');
            } else if (!endPlace) {
                endPlace = target;
                setTransform(endPlace, 'right');
            }
        }
    });
}

function setTransform(element, position) {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgRect = svgContainer.getBoundingClientRect();
    const scale = 2;  // The scale factor for enlargement

    // Reset transformations to get the unscaled bounding box
    element.style.transform = '';
    const bbox = element.getBBox();

    // Calculate the new center position after scaling
    const centerX = (bbox.x + bbox.width / 2) * scale;
    const centerY = (bbox.y + bbox.height / 2) * scale;

    // Determine the offset to position the center of the element at the desired point
    // taking into account the element's current position on the screen
    const elementRect = element.getBoundingClientRect();
    const offsetX = (position === 'left' ? svgRect.left + svgRect.width * 0.35 : svgRect.right - svgRect.width * 0.35) - (elementRect.left + elementRect.width / 2);
    const offsetY = svgRect.top + svgRect.height / 2 - (elementRect.top + elementRect.height / 2);

    // Apply the new transformation
    element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    element.style.transformOrigin = 'center center';
    element.style.fill = 'red';

    // Set the transition to ensure smooth movement
    element.style.transition = 'transform 0.5s ease, fill 0.5s ease';

    // Re-append the element to its parent to ensure it is on top
    element.parentNode.appendChild(element);
}

function resetState(element) {
    element.style.transition = 'none';
    element.style.transform = '';
    element.style.fill = '';
    // Remove the transition style after the transform to ensure it can be reapplied later
    setTimeout(() => {
        element.style.transition = '';
    }, 0);
}

function resetState(element) {
    element.classList.remove('selected');
    element.style.transform = '';
    element.style.fill = '';
}
document.addEventListener('DOMContentLoaded', loadSVGMap);
