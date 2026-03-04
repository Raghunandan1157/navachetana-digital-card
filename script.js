document.addEventListener('DOMContentLoaded', () => {

    // Form input elements
    const inputs = {
        name: document.getElementById('name'),
        designation: document.getElementById('designation'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email'),
        location: document.getElementById('location')
    };

    // Preview elements on the card
    const preview = {
        name: document.getElementById('preview-name'),
        designation: document.getElementById('preview-designation'),
        phone: document.getElementById('preview-phone'),
        email: document.getElementById('preview-email'),
        location: document.getElementById('preview-location')
    };

    const jsonOutput = document.getElementById('json-output');
    const qrContainer = document.getElementById('qr-code');

    // Initialize QR code instance
    let qrCode = new QRCode(qrContainer, {
        text: ' ',
        width: 180,
        height: 180,
        colorDark: '#0d7068',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    /**
     * Escapes HTML special characters and converts newlines to <br> tags
     */
    function formatMultiline(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    /**
     * Generates a vCard string from the current form data
     */
    function generateVCard(data) {
        // Clean phone number (remove spaces and dashes for tel: format)
        const cleanPhone = data.phone.replace(/[\s\-]/g, '');

        // Split name for vCard N field (last;first)
        const nameParts = data.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const firstName = nameParts.slice(0, -1).join(' ') || data.name;

        return [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${data.name}`,
            `N:${lastName};${firstName};;;`,
            `TITLE:${data.designation}`,
            `ORG:Navachetana Livelihoods Private Limited`,
            `TEL;TYPE=CELL:${cleanPhone}`,
            `EMAIL:${data.email}`,
            `URL:https://navachetanalivelihoods.com`,
            `ADR;TYPE=WORK:;;${data.location.replace(/\n/g, ', ')};;;;`,
            'END:VCARD'
        ].join('\n');
    }

    // Debounce timer for QR code updates
    let qrTimer = null;

    /**
     * Core update function: reads form → builds JSON → updates card preview + QR
     */
    function updateCard() {
        // 1. Gather all values into a JSON-ready object
        const cardData = {
            name: inputs.name.value.trim(),
            designation: inputs.designation.value.trim(),
            phone: inputs.phone.value.trim(),
            email: inputs.email.value.trim(),
            location: inputs.location.value.trim(),
            company: 'Navachetana Livelihoods Private Limited',
            website: 'https://navachetanalivelihoods.com'
        };

        // 2. Output the JSON to the code block
        jsonOutput.textContent = JSON.stringify(cardData, null, 2);

        // 3. Update the live card preview
        preview.name.textContent = cardData.name || 'Your Name';
        preview.designation.textContent = cardData.designation || 'Designation';
        preview.phone.textContent = cardData.phone || '+00 - 0000000000';
        preview.email.textContent = cardData.email || 'email@example.com';
        preview.location.innerHTML = formatMultiline(cardData.location) || 'Office Address';

        // 4. Regenerate QR code (debounced so it doesn't flash on every keystroke)
        clearTimeout(qrTimer);
        qrTimer = setTimeout(() => {
            const vCardString = generateVCard(cardData);
            qrCode.clear();
            qrCode.makeCode(vCardString);
        }, 300);
    }

    // Attach live event listeners on every form input
    Object.values(inputs).forEach(el => {
        el.addEventListener('input', updateCard);
        el.addEventListener('change', updateCard);
    });

    // Initial render
    updateCard();

    // Share button functionality
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            // Get current card data
            const cardData = {
                name: inputs.name.value.trim(),
                designation: inputs.designation.value.trim(),
                phone: inputs.phone.value.trim(),
                email: inputs.email.value.trim(),
                location: inputs.location.value.trim()
            };

            // Create shareable URL with encoded data
            const shareData = btoa(JSON.stringify(cardData));
            const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(shareData)}`;

            // Generate QR code for sharing
            const qrCodeData = generateVCard(cardData);

            // Try Web Share API first (works on iOS 12.2+ and Android)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${cardData.name}'s Business Card`,
                        text: `Check out ${cardData.name}'s digital business card:\n${shareUrl}`,
                        url: shareUrl
                    });
                    console.log('Share successful');
                } catch (error) {
                    console.error('Web Share API error:', error);
                    // If user cancels or error occurs, show copy option
                    if (error.name !== 'AbortError') {
                        showCopyOption(shareUrl);
                    }
                }
            } else {
                // Fallback for browsers without Web Share API
                showCopyOption(shareUrl);
            }
        });
    }

    // Show copy option with a nice UI
    function showCopyOption(shareUrl) {
        // Create a modal/dialog for copying
        const copyDialog = document.createElement('div');
        copyDialog.style.position = 'fixed';
        copyDialog.style.top = '50%';
        copyDialog.style.left = '50%';
        copyDialog.style.transform = 'translate(-50%, -50%)';
        copyDialog.style.background = 'white';
        copyDialog.style.padding = '24px';
        copyDialog.style.borderRadius = '12px';
        copyDialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        copyDialog.style.zIndex = '1000';
        copyDialog.style.maxWidth = '90%';
        copyDialog.style.textAlign = 'center';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.value = shareUrl;
        urlInput.readOnly = true;
        urlInput.style.width = '100%';
        urlInput.style.padding = '12px';
        urlInput.style.margin = '12px 0';
        urlInput.style.border = '1px solid #ddd';
        urlInput.style.borderRadius = '6px';
        urlInput.style.fontSize = '14px';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Link';
        copyButton.style.background = 'linear-gradient(135deg, #0d7068 0%, #5a9e1e 100%)';
        copyButton.style.color = 'white';
        copyButton.style.border = 'none';
        copyButton.style.padding = '12px 24px';
        copyButton.style.borderRadius = '8px';
        copyButton.style.fontSize = '16px';
        copyButton.style.fontWeight = '600';
        copyButton.style.cursor = 'pointer';
        copyButton.style.marginTop = '12px';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.background = '#f0f0f0';
        closeButton.style.color = '#333';
        closeButton.style.border = 'none';
        closeButton.style.padding = '10px 20px';
        closeButton.style.borderRadius = '6px';
        closeButton.style.fontSize = '14px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginLeft = '12px';

        copyDialog.innerHTML = `<h3 style="margin-bottom: 16px; color: #0d7068;">Share This Card</h3>
                                <p style="margin-bottom: 12px; color: #666;">Copy this link to share your business card:</p>`;
        copyDialog.appendChild(urlInput);
        copyDialog.appendChild(copyButton);
        copyDialog.appendChild(closeButton);

        document.body.appendChild(copyDialog);

        // Copy functionality
        copyButton.addEventListener('click', () => {
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    copyButton.textContent = 'Copied! ✓';
                    copyButton.style.background = '#8CC63F';
                    setTimeout(() => {
                        document.body.removeChild(copyDialog);
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Copy failed:', error);
                    alert('Copy failed. Please manually copy the URL above.');
                });
        });

        // Close functionality
        closeButton.addEventListener('click', () => {
            document.body.removeChild(copyDialog);
        });

        // Close when clicking outside
        copyDialog.addEventListener('click', (e) => {
            if (e.target === copyDialog) {
                document.body.removeChild(copyDialog);
            }
        });
    }

    // Check URL for shared data on page load
    function loadSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');

        if (sharedData) {
            try {
                const decodedData = JSON.parse(atob(decodeURIComponent(sharedData)));
                
                // Populate form fields
                if (decodedData.name) inputs.name.value = decodedData.name;
                if (decodedData.designation) inputs.designation.value = decodedData.designation;
                if (decodedData.phone) inputs.phone.value = decodedData.phone;
                if (decodedData.email) inputs.email.value = decodedData.email;
                if (decodedData.location) inputs.location.value = decodedData.location;

                // Update card preview
                updateCard();
                
                console.log('Loaded shared card data');
            } catch (error) {
                console.error('Error loading shared data:', error);
            }
        }
    }

    // Load shared data when page loads
    loadSharedData();
});
