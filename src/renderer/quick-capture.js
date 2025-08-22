const { ipcRenderer } = require('electron');

let currentType = 'idea';
let pastedImage = null;

// Type selection
document.addEventListener('DOMContentLoaded', () => {
    // Type selector buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click-outside from closing
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
        });
    });

    // Handle paste events for images
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    pastedImage = event.target.result;
                    document.getElementById('pasted-image').src = pastedImage;
                    document.getElementById('image-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    });

    // Remove image
    document.getElementById('remove-image').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click-outside from closing
        pastedImage = null;
        document.getElementById('image-preview').style.display = 'none';
    });

    // Save note
    document.getElementById('save-btn').addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent click-outside from closing
        const title = document.getElementById('title-input').value.trim();
        const content = document.getElementById('content-input').value.trim();
        if (!content && !pastedImage) return;
        
        const note = {
            title: title || null,
            content: content || (pastedImage ? 'Image note' : ''),
            type: currentType,
            tags: extractTags(content),
            screenshot: pastedImage
        };
        
        await ipcRenderer.invoke('save-note', note);
        
        // Animate out and clear
        const container = document.querySelector('.glass-container');
        container.classList.add('closing');
        
        setTimeout(() => {
            document.getElementById('title-input').value = '';
            document.getElementById('content-input').value = '';
            pastedImage = null;
            document.getElementById('image-preview').style.display = 'none';
            ipcRenderer.send('hide-quick-capture');
            // Remove the closing class after hiding
            setTimeout(() => {
                container.classList.remove('closing');
            }, 100);
        }, 200);
    });

    // Close/Cancel function
    function closeQuickCapture() {
        const container = document.querySelector('.glass-container');
        container.classList.add('closing');
        
        setTimeout(() => {
            document.getElementById('title-input').value = '';
            document.getElementById('content-input').value = '';
            pastedImage = null;
            document.getElementById('image-preview').style.display = 'none';
            ipcRenderer.send('hide-quick-capture');
            // Remove the closing class after hiding
            setTimeout(() => {
                container.classList.remove('closing');
            }, 100);
        }, 200);
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!document.querySelector('.glass-container').contains(e.target)) {
            closeQuickCapture();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuickCapture();
        }
    });

    // Ctrl+Enter to save from content input
    document.getElementById('content-input').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('save-btn').click();
        }
    });

    // Auto-focus when window shows
    window.addEventListener('focus', () => {
        document.getElementById('content-input').focus();
    });

    // Clear on window show
    window.addEventListener('show', () => {
        try {
            document.getElementById('title-input').value = '';
            document.getElementById('content-input').value = '';
            pastedImage = null;
            document.getElementById('image-preview').style.display = 'none';
            
            // Reset type selector to default
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.type-btn[data-type="idea"]').classList.add('active');
            currentType = 'idea';
        } catch (error) {
            console.error('Error clearing form:', error);
        }
    });

    // Also clear when window becomes visible
    ipcRenderer.on('window-shown', () => {
        try {
            // Ensure closing class is removed when showing
            const container = document.querySelector('.glass-container');
            container.classList.remove('closing');
            
            document.getElementById('title-input').value = '';
            document.getElementById('content-input').value = '';
            pastedImage = null;
            document.getElementById('image-preview').style.display = 'none';
            document.getElementById('content-input').focus();
        } catch (error) {
            console.error('Error on window shown:', error);
        }
    });
});

function extractTags(content) {
    const tagRegex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        tags.push(match[1]);
    }
    return tags;
}
