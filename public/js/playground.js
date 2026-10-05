document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('endpoint-select');
  const input = document.getElementById('custom-path-input');
  const sendBtn = document.getElementById('send-request-btn');
  const curlPreview = document.getElementById('curl-preview');
  const statusBadge = document.getElementById('status-badge');
  const latencyBadge = document.getElementById('latency-badge');
  const jsonOutput = document.getElementById('json-output');
  const copyJsonBtn = document.getElementById('copy-json-btn');

  function updateCurl() {
    const path = input.value.trim();
    curlPreview.textContent = `curl "${window.location.origin}${path}"`;
  }

  select.addEventListener('change', () => {
    input.value = select.value;
    updateCurl();
  });

  input.addEventListener('input', () => {
    updateCurl();
  });

  async function executeRequest() {
    const path = input.value.trim();
    if (!path) return;

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span>⏳ Executing...</span>';
    jsonOutput.textContent = '// Loading local response...';
    statusBadge.textContent = '...';
    statusBadge.className = 'badge-status';

    const startTime = performance.now();

    try {
      const response = await fetch(path);
      const latency = Math.round(performance.now() - startTime);

      statusBadge.textContent = `${response.status} ${response.statusText}`;
      if (response.ok) {
        statusBadge.className = 'badge-status badge-200';
      } else {
        statusBadge.className = 'badge-status badge-400';
      }

      latencyBadge.textContent = `Latency: ${latency} ms`;

      const data = await response.json();
      jsonOutput.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      statusBadge.textContent = 'ERROR';
      statusBadge.className = 'badge-status badge-400';
      latencyBadge.textContent = `Latency: ${latency} ms`;
      jsonOutput.textContent = JSON.stringify({ error: err.message }, null, 2);
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span>🚀 Send Request</span>';
    }
  }

  sendBtn.addEventListener('click', executeRequest);

  copyJsonBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput.textContent);
      const originalText = copyJsonBtn.textContent;
      copyJsonBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyJsonBtn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  });

  updateCurl();
  // Auto execute default request on load
  executeRequest();
});
