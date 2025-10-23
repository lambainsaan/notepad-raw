import { sampleSLUs, SLAs } from './data.js';

let slus = [];

const form = document.getElementById('slu-form');
const nameInput = document.getElementById('name');
const slaInput = document.getElementById('sla');
const importanceInput = document.getElementById('importance');
const satisfactionInput = document.getElementById('satisfaction');
const hoursInput = document.getElementById('hours');
const sluList = document.getElementById('slu-list');

const addBtn = document.getElementById('add-slu');
const loadSampleBtn = document.getElementById('load-sample');
const renderBtn = document.getElementById('render');
const downloadSvgBtn = document.getElementById('download-svg');
const clearBtn = document.getElementById('clear');
const saveSnapshotBtn = document.getElementById('save-snapshot');
const generateHtmlBtn = document.getElementById('generate-html');

let portfolioChart = null;
let timePie = null;

function renderList(){
  sluList.innerHTML = '';
  slus.forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'slu-item';
    div.innerHTML = `<div>${s.name} <small style="color:#666">(${s.sla})</small></div><div>${s.importance.toFixed(1)} / ${s.satisfaction.toFixed(1)} — ${s.hours}h <button data-index="${i}" class="rm">×</button></div>`;
    sluList.appendChild(div);
  });
  sluList.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',e=>{ const idx=+e.target.dataset.index; slus.splice(idx,1); renderList(); }));
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const item = { name: nameInput.value.trim(), sla: slaInput.value, importance: +importanceInput.value, satisfaction: +satisfactionInput.value, hours: +hoursInput.value };
  slus.push(item);
  renderList();
  form.reset();
});

loadSampleBtn.addEventListener('click', ()=>{ slus = sampleSLUs.slice(); renderList(); });
clearBtn.addEventListener('click', ()=>{ slus = []; renderList(); destroyCharts(); });
renderBtn.addEventListener('click', ()=>{ renderCharts(); });
downloadSvgBtn.addEventListener('click', ()=>{ downloadSVG(); });
saveSnapshotBtn.addEventListener('click', ()=>{ saveSnapshot(); });
generateHtmlBtn.addEventListener('click', ()=>{ generateHTMLFile(); });

function destroyCharts(){ if(portfolioChart){ portfolioChart.destroy(); portfolioChart=null } if(timePie){ timePie.destroy(); timePie=null }}

function renderCharts(){
  if(!slus || slus.length===0){ alert('No SLUs to render — add or load sample data.'); return }
  // Portfolio bubble chart: x = satisfaction, y = importance, r = hours
  const labels = slus.map(s => s.name);
  const data = slus.map(s => ({ x: s.satisfaction, y: s.importance, r: Math.max(4, Math.sqrt(s.hours) * 3), label: s.name, sla: s.sla, hours: s.hours }));

  const ctx = document.getElementById('portfolioChart').getContext('2d');
  destroyCharts();

  // Plugin: draw soft plotting background and solid quadrant divider lines (continuous)
  const quadrantPlugin = {
    id: 'quadrantPlugin',
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.fillStyle = '#f3f7fa';
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    },
    // draw divider lines before datasets so bubbles render on top
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales || !scales.x || !scales.y) return;
      const xScale = scales.x;
      const yScale = scales.y;
      const cx = xScale.getPixelForValue(5);
      const cy = yScale.getPixelForValue(5);

      ctx.save();
      // subtler dark line so it doesn't overpower bubbles
      ctx.strokeStyle = 'rgba(34,49,63,0.75)';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([]);

      // vertical continuous line
      ctx.beginPath();
      ctx.moveTo(cx, chartArea.top);
      ctx.lineTo(cx, chartArea.bottom);
      ctx.stroke();

      // horizontal continuous line
      ctx.beginPath();
      ctx.moveTo(chartArea.left, cy);
      ctx.lineTo(chartArea.right, cy);
      ctx.stroke();

      ctx.restore();
    }
  };

  // We removed on-canvas bubble labels for the snapshot generator UI.

  portfolioChart = new Chart(ctx, {
    type: 'bubble',
    data: { datasets: [{ label: 'SLUs', data, backgroundColor: data.map(d=>colorForSLA(d.sla)), borderColor: '#222', borderWidth:1 }] },
    plugins: [quadrantPlugin],
    options: {
      scales: {
        x: { title: { display:true, text: 'Satisfaction (0-10)' }, min:0, max:10 },
        y: { title: { display:true, text: 'Importance (0-10)' }, min:0, max:10 }
      },
      plugins: {
        tooltip: { callbacks: { label(ctx){ const d = ctx.raw; return `${d.label}: Importance ${d.y}, Satisfaction ${d.x}, ${Math.round((d.r/3)**2)}h/week`; } } },
        legend: { display:false }
      }
    }
  });

  // Time distribution pie by SLA
  const slaHours = {};
  SLAs.forEach(s=>slaHours[s]=0);
  slus.forEach(s=>{ slaHours[s.sla] = (slaHours[s.sla]||0) + s.hours });
  const pieCtx = document.getElementById('timePie').getContext('2d');
  const pieData = { labels: Object.keys(slaHours), datasets: [{ data: Object.values(slaHours), backgroundColor: Object.keys(slaHours).map(k=>colorForSLA(k)) }] };
  timePie = new Chart(pieCtx, { type:'pie', data:pieData, options:{ plugins:{ legend:{position:'right'} } } });
}

// --- Snapshot / HTML generator utilities ---
function getSnapshots(){
  try{ return JSON.parse(localStorage.getItem('slu_snapshots')||'[]') }catch(e){ return [] }
}
function saveSnapshots(arr){ localStorage.setItem('slu_snapshots', JSON.stringify(arr)); }

function saveSnapshot(){
  if(!slus || slus.length===0){ alert('No SLUs to snapshot'); return }
  const snaps = getSnapshots();
  snaps.push({ ts: new Date().toISOString(), data: slus.slice() });
  saveSnapshots(snaps);
  alert('Snapshot saved — you can generate an HTML file with your snapshots.');
}

function generateHTMLFile(){
  const snaps = getSnapshots();
  if(!snaps || snaps.length===0){ alert('No snapshots saved — save a snapshot first.'); return }
  const html = buildStandaloneHTML(snaps);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'slu_snapshots.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function buildStandaloneHTML(snaps){
  // Minimal standalone viewer that embeds the snapshots as JSON and uses Chart.js CDN
  const payload = JSON.stringify(snaps);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>SLU Snapshots</title>
<style>body{font-family:Arial;margin:16px} #timeline{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px} .snapBtn{padding:6px 10px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer} .snapBtn.active{background:#222;color:#fff}</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
</head>
<body>
<h1>SLU Snapshots</h1>
<div id="timeline"></div>
<canvas id="viewer" width="800" height="600"></canvas>
<script>
const snaps = ${payload};
const timeline = document.getElementById('timeline');
const ctx = document.getElementById('viewer').getContext('2d');
let chart;
function colorForSLA(s){ const map = { Relationships:'#4caf50', Body:'#f44336', Community:'#ff9800', Job:'#2196f3', Interests:'#9c27b0', Personal:'#607d8b' }; return map[s]||'#777' }
function renderSnap(i){ const s = snaps[i]; const data = s.data.map(x=>({x:x.satisfaction,y:x.importance,r:Math.max(4,Math.sqrt(x.hours)*3),label:x.name,sla:x.sla,hours:x.hours})); if(chart) chart.destroy(); chart = new Chart(ctx,{type:'bubble',data:{datasets:[{label:'SLUs',data,backgroundColor:data.map(d=>colorForSLA(d.sla)),borderColor:'#222',borderWidth:1}]},options:{scales:{x:{title:{display:true,text:'Satisfaction (0-10)'},min:0,max:10},y:{title:{display:true,text:'Importance (0-10)'},min:0,max:10}},plugins:{legend:{display:false}}}); }
snaps.forEach((s,i)=>{ const btn = document.createElement('button'); btn.className='snapBtn'; btn.textContent = new Date(s.ts).toLocaleString(); btn.addEventListener('click',()=>{ document.querySelectorAll('.snapBtn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderSnap(i); }); timeline.appendChild(btn) });
if(snaps.length) timeline.children[0].click();
else document.body.insertAdjacentHTML('beforeend','<p>No snapshots</p>');
</script>
</body>
</html>`;
}

// Build a simple SVG representation of the current portfolio chart and download it
function downloadSVG(){
  if(!slus || slus.length===0){ alert('No SLUs to export.'); return }
  const canvas = document.getElementById('portfolioChart');
  const width = canvas.width || 800;
  const height = canvas.height || 600;

  // chart margins matched roughly to Chart.js defaults used in canvas
  const margin = { left: 60, right: 20, top: 20, bottom: 60 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;

  function sx(v){ return margin.left + (v/10) * chartW }
  function sy(v){ return margin.top + chartH - (v/10) * chartH }

  // background and grid
  let svg = `<?xml version="1.0" encoding="utf-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#fff"/>`;
  svg += `<rect x="${margin.left}" y="${margin.top}" width="${chartW}" height="${chartH}" fill="#f3f7fa"/>`;

  // draw grid lines (10 steps)
  for(let i=0;i<=10;i++){
    const gx = margin.left + (i/10)*chartW;
    svg += `<line x1="${gx}" y1="${margin.top}" x2="${gx}" y2="${margin.top+chartH}" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>`;
    const gy = margin.top + (i/10)*chartH;
    svg += `<line x1="${margin.left}" y1="${gy}" x2="${margin.left+chartW}" y2="${gy}" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>`;
  }

  // quadrant dividers at 5
  const cx = sx(5);
  const cy = sy(5);
  svg += `<line x1="${cx}" y1="${margin.top}" x2="${cx}" y2="${margin.top+chartH}" stroke="#22313f" stroke-width="2"/>`;
  svg += `<line x1="${margin.left}" y1="${cy}" x2="${margin.left+chartW}" y2="${cy}" stroke="#22313f" stroke-width="2"/>`;

  // bubbles with simple SVG label placement and collision avoidance
  const placedBoxes = [];
  slus.forEach(s => {
    const cxv = sx(s.satisfaction);
    const cyv = sy(s.importance);
    const r = Math.max(6, Math.sqrt(s.hours)*6);
    const fill = colorForSLA(s.sla);
    svg += `<circle cx="${cxv}" cy="${cyv}" r="${r}" fill="${fill}" stroke="#222" stroke-width="1.2"/>`;
    if(showBubbleLabels){
      // approximate text width using character measure (~7px per char for 12px Arial)
      const text = `${s.name} — ${s.hours}h`;
      const approxWidth = text.length * 7;
      const centerXpx = sx(5);
      const centerYpx = sy(5);
      const leftSpace = cxv - margin.left;
      const rightSpace = margin.left + chartW - cxv;
      const labelGap = 8; // keep same gap as canvas
      let candidates = [ [r+6+labelGap,0], [-(r+6)-approxWidth-labelGap,0], [r+6+labelGap,-16], [r+6+labelGap,16], [-(r+6)-approxWidth-labelGap,-16], [-(r+6)-approxWidth-labelGap,16] ];
      if(leftSpace > rightSpace){
        candidates = [ [-(r+6)-approxWidth,0], [-(r+6)-approxWidth,-16], [-(r+6)-approxWidth,16], [r+6,0], [r+6,-16], [r+6,16] ];
      }
      let placed = false;
      for(const c of candidates){
        const tx = cxv + c[0];
        const ty = cyv + c[1];
        const box = { x1: tx - 2, y1: ty - 10, x2: tx + approxWidth + 2, y2: ty + 10 };
        // inside chart with inner margin
        const innerMargin = 8;
        if(box.x1 < margin.left + innerMargin || box.x2 > margin.left+chartW - innerMargin || box.y1 < margin.top + innerMargin || box.y2 > margin.top+chartH - innerMargin) continue;
        // avoid crossing the central axes
        if(box.x1 < centerXpx && box.x2 > centerXpx) continue;
        if(box.y1 < centerYpx && box.y2 > centerYpx) continue;
        // overlaps bubbles? include labelGap
        let overlap = false;
        slus.forEach(o=>{ const opx = sx(o.satisfaction); const opy = sy(o.importance); const or = Math.max(6, Math.sqrt(o.hours)*6); if(!(box.x2 < opx-or-labelGap || box.x1 > opx+or+labelGap || box.y2 < opy-or-labelGap || box.y1 > opy+or+labelGap)) overlap = true; });
        if(overlap) continue;
        // overlaps placed labels?
        let overlapLabel = false;
        for(const p of placedBoxes) if(!(box.x2 < p.x1 || box.x1 > p.x2 || box.y2 < p.y1 || box.y1 > p.y2)) { overlapLabel = true; break }
        if(overlapLabel) continue;

        // place with rounded black rect behind and white text (center text vertically)
        const padX = 6, padY = 4, rx = 6;
        const rectX = tx - padX; // tx is left edge of text
        const rectW = approxWidth + padX*2;
        const rectH = 16;
        const rectY = ty - (rectH/2);
        svg += `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" fill="#000" fill-opacity="0.85"/>`;
        svg += `<text x="${tx}" y="${ty}" font-family="Arial" font-size="12" fill="#fff" dominant-baseline="middle">${text}</text>`;
        placedBoxes.push(box);
        placed = true;
        break;
      }
      if(!placed){ // fallback near right inside bounds
        const tx = Math.min(cxv + r + 6, margin.left+chartW-approxWidth-10);
        const ty = cyv;
        const padX = 6, padY = 4, rx = 6;
        const rectX = tx - padX;
        const rectW = approxWidth + padX*2;
        const rectH = 16;
        const rectY = ty - (rectH/2);
        svg += `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" fill="#000" fill-opacity="0.85"/>`;
        svg += `<text x="${tx}" y="${ty}" font-family="Arial" font-size="12" fill="#fff" dominant-baseline="middle">${text}</text>`;
      }
    }
  });

  // axis labels
  svg += `<text x="${margin.left + chartW/2}" y="${height - 16}" font-family="Arial" font-size="14" fill="#222" text-anchor="middle">Satisfaction (0-10)</text>`;
  svg += `<text transform="translate(14 ${margin.top + chartH/2}) rotate(-90)" font-family="Arial" font-size="14" fill="#222">Importance (0-10)</text>`;

  svg += `</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'strategic-life-portfolio.svg';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function colorForSLA(sla){
  const map = { Relationships:'#4caf50', Body:'#f44336', Community:'#ff9800', Job:'#2196f3', Interests:'#9c27b0', Personal:'#607d8b' };
  return map[sla] || '#777';
}

// Expose small API for tests
window.__SLU_APP__ = { setData(arr){ slus = arr.slice(); renderList(); }, getData(){ return slus.slice(); }, renderCharts };