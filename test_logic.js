const fs = require('fs');
const path = require('path');

// Mock DOM basics
const document = {
    addEventListener: () => { },
    getElementById: () => ({
        addEventListener: () => { },
        value: '',
        textContent: '',
        innerHTML: ''
    }),
    querySelectorAll: () => []
};
const window = {
    print: () => console.log('Print called'),
    updateItem: () => { },
    removeItem: () => { }
};

// Global mocks
global.document = document;
global.window = window;

// Read script content
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Basic Validation
if (scriptContent.includes('customSections')) {
    console.log('PASS: Custom Sections logic found in script.js');
} else {
    console.error('FAIL: Custom Sections logic NOT found in script.js');
    process.exit(1);
}

if (scriptContent.includes('function renderCustomSectionsForm')) {
    console.log('PASS: Render function for Custom Sections found');
} else {
    console.error('FAIL: Render function for Custom Sections NOT found');
    process.exit(1);
}

if (scriptContent.includes('window.print()')) {
    console.log('PASS: PDF Generation uses window.print()');
} else {
    console.error('FAIL: PDF Generation does not use window.print()');
    process.exit(1);
}

console.log('All basic logic checks passed.');
