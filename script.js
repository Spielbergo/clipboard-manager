// Get references to the clipboard list and copied message elements
const clipboardList = document.getElementById('clipboard-list');
const copiedMessage = document.getElementById('copied-message');
const noSelectionMessage = document.getElementById('no-selection-message');

// Initialize clipboard items from local storage or an empty array
let clipboardItems = JSON.parse(localStorage.getItem('clipboardItems')) || [];
let clearedItems = [];
let draggedIndex = null;

// Event listener for DOMContentLoaded to set up the dark mode toggle
document.addEventListener('DOMContentLoaded', (event) => {
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('change', toggleMode);

    // Set the initial mode based on the user's system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        modeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        modeToggle.checked = false;
    }
});

// Event listener for copy events to handle copying text
document.addEventListener('copy', (event) => {
    if (event.clipboardData) {
        const text = window.getSelection().toString();
        handleCopy(text);
    }
});

// Event listener for paste events to handle pasting text
document.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text');
    handleCopy(text);
});

// Paste text from the clipboard
function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
        handleCopy(text);
    }).catch(err => {
        alert('Failed to read clipboard. Try pasting manually.');
        console.error(err);
    });
}

// Handle copying text and adding it to the clipboard items
function handleCopy(text) {
    if (text && !clipboardItems.includes(text)) {
        clipboardItems.unshift(text);
        localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
        renderClipboardItems();
    }
}

// Render the clipboard items in the table
function renderClipboardItems() {
    clipboardList.innerHTML = '';

    // Loop through clipboard items and create table rows
    clipboardItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.draggable = true;
        row.ondragstart = (event) => dragStart(event, index);
        row.ondragover = (event) => dragOver(event);
        row.ondrop = (event) => drop(event, index);

        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'item-checkbox';
        selectCell.appendChild(checkbox);

        const textCell = document.createElement('td');
        textCell.textContent = item;

        const copyCell = document.createElement('td');
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => copyToClipboard(item, copyButton);
        copyCell.appendChild(copyButton);

        const removeCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.onclick = () => removeItem(index);
        removeCell.appendChild(removeButton);

        const moveCell = document.createElement('td');
        moveCell.innerHTML = '⋮⋮';

        row.appendChild(selectCell);
        row.appendChild(textCell);
        row.appendChild(copyCell);
        row.appendChild(removeCell);
        row.appendChild(moveCell);
        clipboardList.appendChild(row);
    });

    // Add copy selected items button at the bottom
    const bottomCopyButton = document.createElement('button');
    bottomCopyButton.textContent = 'Copy Selected';
    bottomCopyButton.onclick = copySelectedItems;
    clipboardList.appendChild(bottomCopyButton);
}

// Drag and drop functions
function dragStart(event, index) {
    draggedIndex = index;
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function drop(event, index) {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
        const draggedItem = clipboardItems[draggedIndex];
        clipboardItems.splice(draggedIndex, 1);
        clipboardItems.splice(index, 0, draggedItem);
        localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
        renderClipboardItems();
    }
    draggedIndex = null;
}

// Copy selected items to the clipboard
function copySelectedItems() {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    if (checkboxes.length === 0) {
        noSelectionMessage.style.display = 'block';
        setTimeout(() => noSelectionMessage.style.display = 'none', 1000);
        return;
    }
    const selectedItems = Array.from(checkboxes).map(checkbox => checkbox.closest('tr').children[1].textContent);
    const textToCopy = selectedItems.join('\n');
    copyToClipboard(textToCopy);
}

// Remove an item from the clipboard items
function removeItem(index) {
    clipboardItems.splice(index, 1);
    localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
    renderClipboardItems();
}

// Copy text to the clipboard and show a copied message
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Change button appearance to green with a check mark
        const originalText = button.textContent;
        button.textContent = '✔️';
        button.style.backgroundColor = 'green';
        button.style.color = 'white';

        // Revert button appearance after 1 second
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 1000);

        // Show copied message
        copiedMessage.style.display = 'block';
        setTimeout(() => copiedMessage.style.display = 'none', 1000);
    });
}

// Clear all clipboard items
function clearAll() {
    clearedItems = [...clipboardItems];
    clipboardItems = [];
    localStorage.removeItem('clipboardItems');
    renderClipboardItems();
    document.getElementById('redo-button').style.display = 'inline';
}

// Redo the clear action and restore clipboard items
function redoClear() {
    clipboardItems = [...clearedItems];
    localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
    renderClipboardItems();
    document.getElementById('redo-button').style.display = 'none';
}

// Change the window size based on the selected value
function changeWindowSize() {
    const size = document.getElementById('window-size').value;
    const [width, height] = size.split('x').map(Number);
    window.resizeTo(width, height);
}

// Pop out the current window with the selected size
function popOut() {
    const size = document.getElementById('window-size').value;
    const [width, height] = size.split('x').map(Number);
    window.open(window.location.href, '_blank', `width=${width},height=${height}`);
}

// Toggle the selection of all checkboxes
function toggleSelectAll(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Toggle between dark and light modes
function toggleMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
}

// Render the clipboard items initially
renderClipboardItems();