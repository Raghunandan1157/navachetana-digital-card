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
});
