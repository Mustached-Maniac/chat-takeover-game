let startPlace = null; // Variable to store the start place state
let endPlace = null; // Variable to store the end place state

// Function to load the SVG map and add it to the HTML document
function loadSVGMap() {
    const svgContainer = document.getElementById('svgMapContainer');
    const svgURL = 'assets/Full_US_Map.svg'; // Path to your SVG file

    fetch(svgURL)
        .then(response => response.text())
        .then(svgData => {
            svgContainer.innerHTML = svgData;
            // Initialize state interactions after SVG is loaded
            initializeStateInteractions();
        })
        .catch(error => console.error('Error loading the SVG:', error));
}

// Function to add click event listener to each state in the SVG
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
                // Set start place, enlarge it, and bring to front
                startPlace = path;
                startPlace.setAttribute('transform', 'scale(2) translate(0, 0)');
                startPlace.style.transformOrigin = 'center'; // Set transform origin to center
                startPlace.parentNode.appendChild(startPlace); // Append to move to front
            } else if (endPlace === null) { // Check if an end place has been selected
                // Set end place, enlarge it, and bring to front
                endPlace = path;
                endPlace.setAttribute('transform', 'scale(2) translate(0, 0)');
                endPlace.style.transformOrigin = 'center'; // Set transform origin to center
                endPlace.parentNode.appendChild(endPlace); // Append to move to front
            } else {
                // Reset start and end places if both are already set
                startPlace.setAttribute('transform', ''); // Reset transformation
                endPlace.setAttribute('transform', ''); // Reset transformation

                // Reset variables
                startPlace = null;
                endPlace = null;
            }
        });
    });
}

// Load the SVG map when the document is ready
document.addEventListener('DOMContentLoaded', loadSVGMap);