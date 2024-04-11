let startPlace = null; // Variable to store the start place state
let endPlace = null; // Variable to store the end place state

function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgURL = 'assets/Lower_48_Map.svg';

    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            // Set the size of selectPlacesContainer to match the SVG dimensions
            const svgElement = svgContainer.querySelector('svg');
            const svgWidth = svgElement.clientWidth;
            const svgHeight = svgElement.clientHeight;
            const selectPlacesContainer = document.getElementById('selectPlacesContainer');
            selectPlacesContainer.style.width = `${svgWidth}px`;
            selectPlacesContainer.style.height = `${svgHeight}px`;

            // Initialize state interactions after SVG is loaded
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

function initializeStateInteractions() {
    // Select all path elements within the SVG
    const paths = document.querySelectorAll('#svgMapContainer svg path');

    // Add click event listener to each path element
    paths.forEach(path => {
        path.addEventListener('click', () => {
            // Log the id attribute of the clicked state
            console.log('Clicked state:', path.getAttribute('id'));

            // Check if a start place has been selected
            if (startPlace === null) {
                // Set start place
                startPlace = path.cloneNode(true);
                // Append startPlace to selectPlacesContainer
                selectPlacesContainer.appendChild(startPlace);
                // Enlarge and move startPlace to the left box
                enlargeAndMoveToBox(startPlace, 'left');
            } else if (endPlace === null) { // Check if an end place has been selected
                // Set end place
                endPlace = path.cloneNode(true);
                // Append endPlace to selectPlacesContainer
                selectPlacesContainer.appendChild(endPlace);
                // Enlarge and move endPlace to the right box
                enlargeAndMoveToBox(endPlace, 'right');

                // Bring selectPlacesContainer to the front
                selectPlacesContainer.style.zIndex = 1;
            } else {
                // Reset start and end places if both are already set
                resetPlaces();
            }
        });
    });
    // Add click event listener to selectPlacesContainer to reset selected states
    selectPlacesContainer.addEventListener('click', () => {
        resetPlaces();
        // Set z-index back to -1 to send selectPlacesContainer to the back
        selectPlacesContainer.style.zIndex = -1;
    });
}

function enlargeAndMoveToBox(state, boxPosition) {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    // Set the scale factor
    const scale = 2;

    // Calculate the position of the state within the container
    let stateX, stateY;

    if (boxPosition === 'left') {
        stateX = containerWidth / 4; // 25% from the left edge of the viewport
    } else if (boxPosition === 'right') {
        stateX = (containerWidth * 3) / 4; // 75% from the left edge of the viewport
    }

    stateY = containerHeight / 2; // Center vertically

    // Get the current transformation
    let currentTransform = state.getAttribute('transform');

    // Check if the current transform is null
    if (!currentTransform) {
        currentTransform = ''; // Set it to an empty string
    }

    // Append the new transformation to the existing one
    currentTransform += ` scale(${scale}) translate(${stateX}, ${stateY})`;

    // Set the updated transformation for the state element
    state.setAttribute('transform', currentTransform);
}

function resetPlaces() {
    // Reset transformation attributes
    startPlace.setAttribute('transform', '');
    endPlace.setAttribute('transform', '');

    // Remove clones of startPlace and endPlace from the selectPlacesContainer
    const selectedPlaces = selectPlacesContainer.querySelectorAll('path');
    selectedPlaces.forEach(place => {
        selectPlacesContainer.removeChild(place);
    });

    // Reset variables
    startPlace = null;
    endPlace = null;
}

// Load the SVG map when the document is ready
document.addEventListener('DOMContentLoaded', loadSVGMap);