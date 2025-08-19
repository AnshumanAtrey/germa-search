document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('settingsForm');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    const successMessage = document.getElementById('successMessage');

    // Load existing settings
    try {
        const result = await chrome.storage.sync.get(['openrouterApiKey', 'selectedModel']);
        
        if (result.openrouterApiKey) {
            apiKeyInput.value = result.openrouterApiKey;
        }
        
        if (result.selectedModel) {
            modelSelect.value = result.selectedModel;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const apiKey = apiKeyInput.value.trim();
        const selectedModel = modelSelect.value;
        
        if (!apiKey) {
            alert('Please enter your OpenRouter API key');
            return;
        }
        
        try {
            await chrome.storage.sync.set({
                openrouterApiKey: apiKey,
                selectedModel: selectedModel
            });
            
            // Show success message
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    });
});