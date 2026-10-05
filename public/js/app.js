// Landing page interactive behaviors
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copy-curl-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const curlCommand = `curl -X GET "${window.location.origin}/v1/ayahs/2:255"`;
      try {
        await navigator.clipboard.writeText(curlCommand);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.color = '#10b981';
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    });
  }
});
