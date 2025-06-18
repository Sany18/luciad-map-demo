// Load local JSON files
async function loadReports() {
  try {
    const response = await fetch('/list-reports');
    const reportsList = await response.json();

    let data = [];

    for (const reportFodler of Object.keys(reportsList)) {
      data = [];
      const reportFolderEl = document.createElement('button');
      reportFolderEl.className = 'report-folder';
      reportFolderEl.innerHTML = `${reportFodler} (${reportsList[reportFodler].files.length})`;

      const loadReport = (folder, reportFiles) => {
        const targetEl = document.getElementById('report-files');
        targetEl.innerHTML = '';

        const reportPromises = reportFiles.map(url => {
          const showEl = document.createElement('li');
          showEl.style.cssText = 'cursor: pointer; text-decoration: underline;';
          showEl.className = 'report-file';
          showEl.innerHTML = url;

          targetEl.appendChild(showEl);

          const _url = `/reports_data/${folder}/${url}`;
          return fetch(_url)
            .then(res => res.json())
            .then(json => {
              data.push(json);

              showEl.onclick = () => {
                console.log(`Show report:`, _url, json);
                showReport(json);
              };

              return json;
            });
        });

        return Promise.all(reportPromises);
      }

      reportFolderEl.onclick = () => loadReport(reportFodler, reportsList[reportFodler].files);
      document.getElementById('reports-list').appendChild(reportFolderEl);
    }

    return data;
  } catch (err) {
    console.error('Failed to load reports list:', err);
    return [];
  }
}

// Initialize the page
async function init() {
  await loadReports();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

function drawFramerateChart(data) {
  // Render the framerate chart
  const canvas = document.getElementById('framerate-chart');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas dimensions
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const chartData = data.framerate.record;
  if (chartData.length === 0) return;

  // Find min and max values for scaling
  const maxFps = data.framerate.max + 10; // Add a buffer for better visibility
  const maxTime = chartData[chartData.length - 1].timestamp;

  // Chart styling
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add vertical padding
  const padding = 10;
  const chartHeight = canvas.height - (padding * 2);

  // Draw grid lines
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  // Draw horizontal grid lines
  for (let fps = 0; fps <= 120; fps += 20) {
    const y = canvas.height - padding - (fps / maxFps) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    // Label the grid line
    ctx.fillStyle = '#777';
    ctx.font = '10px Arial';
    ctx.fillText(`${fps} fps`, 5, y - 5);
  }

  // Draw the data as vertical lines
  chartData.forEach(record => {
    const x = (record.timestamp / maxTime) * canvas.width;
    const height = (record.fps / maxFps) * chartHeight;

    // Color based on framerate (red for low, green for high)
    const hue = Math.min(120, Math.max(0, (record.fps / 60) * 120));
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

    ctx.fillRect(
      x,
      canvas.height - padding - height,
      Math.max(1, canvas.width / chartData.length / 2),
      height
    );
  });
}

function showReport(data) {
  const reportDetailsEl = document.getElementById('report-details');
  reportDetailsEl.innerHTML = '';

  const reportEl = document.createElement('div');
  reportEl.id = 'performance-report';
  reportEl.style.cssText = `
      gap: 1rem;
      top: 0;
      left: 0;
      color: white;
      padding: 0.5rem 1rem;
      display: flex;
      overflow: auto;
      max-height: 100svh;
      background: rgba(0, 0, 0, 0.8);
    `;

  reportEl.innerHTML = `
      <div style='color: red; font-size: 1.5rem; cursor: pointer;' onclick='this.parentElement.remove()'>X</div>
      <div style='overflow: auto;'>
        <h2 style='color: lightgray;'>Performance Measurement Report</h2>

        <h3 style='color: lightgreen;'>Browser Information</h3>
        <p><strong>Platform:</strong> ${data.browser.platform}</p>
        <p><strong>Browser: product, system, engine, browser:</strong></p>
        <p>${data.browser.userAgent}</p>
        <p><strong>GPU Renderer:</strong> ${data.browser.GPU.renderer}</p>
        <p><strong>GPU Vendor:</strong> ${data.browser.GPU.vendor}</p>

        <h3 style='color: lightgreen;'>Framerate</h3>
        <p><strong>Min:</strong> ${data.framerate.min} fps</p>
        <p><strong>Max:</strong> ${data.framerate.max} fps</p>
        <p><strong>Avarage:</strong> ${data.framerate.avarage} fps</p>
      </div>
      <div style='flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 1rem; gap: 1rem;'>
        FPS over time:
        <canvas id='framerate-chart' style='width: 100%; height: 300px;'></canvas>
      </div>
    `;

  reportDetailsEl.appendChild(reportEl);
  this.drawFramerateChart(data);
}
