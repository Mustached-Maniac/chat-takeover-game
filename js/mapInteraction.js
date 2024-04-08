let startPlace = null; // Variable to store the starting place
let endPlace = null; // Variable to store the ending place

// Function to load the SVG map and add it to the HTML document
function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    // Adjusted path to reference SVG file from the "assets" folder, considering the location of the JavaScript file in the "js" folder
    const svgURL = 'assets/Full_US_Map.svg';

    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            // Initialize event listeners after SVG is loaded
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

// Function to add interaction events to each state in the SVG
function initializeStateInteractions() {
    const states = document.querySelectorAll('#svgMapContainer path'); // Assuming each state is a path element
    states.forEach(state => {
        state.addEventListener('click', () => {
            handleClick(state); // Handle click event
        });
    });
}

// Function to handle click events on states
function handleClick(state) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (startPlace === null) {
        startPlace = state.getAttribute('id'); // Set startPlace on first click
        moveAndEnlargeState(state, viewportWidth * 0.25, viewportHeight / 2, 1.5); // Move and enlarge the state
        state.style.fill = '#00ff00'; // Example: Change color to green on click
    } else if (endPlace === null && startPlace !== state.getAttribute('id')) {
        endPlace = state.getAttribute('id'); // Set endPlace on second click
        moveStateToLocation(document.getElementById(startPlace), viewportWidth * 0.25, viewportHeight / 2); // Move startPlace to the left side of the screen
        setTimeout(() => {
            moveAndEnlargeState(state, viewportWidth * 0.75, viewportHeight / 2, 1.5); // Move and enlarge the state after a brief pause
        }, 1000); // Adjust the duration of the pause (in milliseconds) as needed
        startPlace = null;
        endPlace = null;
    }
}

// Function to move a state to a specific location
function moveStateToLocation(state, newX, newY) {
    state.style.position = 'absolute'; // Set position to absolute
    state.style.left = `${newX - state.getBBox().width / 2}px`; // Center horizontally
    state.style.top = `${newY - state.getBBox().height / 2}px`; // Center vertically
}

// Function to move and enlarge a state
function moveAndEnlargeState(state, newX, newY, scaleFactor) {
    // Move the state to the specified location
    moveStateToLocation(state, newX, newY);
    
    // Apply transformation to enlarge the state
    state.style.transformOrigin = 'center center';
    state.style.transform = `scale(${scaleFactor})`;

    // Bring the state to the top layer
    state.parentNode.appendChild(state);
}

// Load the SVG map when the document is ready
document.addEventListener('DOMContentLoaded', loadSVGMap);