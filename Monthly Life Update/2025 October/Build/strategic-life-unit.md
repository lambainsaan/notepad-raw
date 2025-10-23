---
title: Strategic Thinking to Create the Life You Want
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Strategic Life Portfolio — Demo</title>
    <link rel="stylesheet" href="styles.css" />
    <!-- Chart.js UMD build -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
    <script type="module" src="./app.js"></script>
  </head>
  <body>
    <header>
      <h1>Strategic Life Portfolio — Interactive Demo</h1>
      <p>Enter Strategic Life Units (SLUs) with importance (0-10), satisfaction (0-10), and hours per week. Render a 2×2 bubble portfolio like the HBR example.</p>
    </header>
    <main>
      <section class="controls">
        <form id="slu-form">
          <input id="name" placeholder="Activity name (e.g. Family)" required />
          <select id="sla">
            <option value="Relationships">Relationships</option>
            <option value="Body">Body, Mind & Spirituality</option>
            <option value="Community">Community & Society</option>
            <option value="Job">Job, Learning & Finances</option>
            <option value="Interests">Interests & Entertainment</option>
            <option value="Personal">Personal Care</option>
          </select>
          <input id="importance" type="number" min="0" max="10" step="0.1" placeholder="Importance (0-10)" required />
          <input id="satisfaction" type="number" min="0" max="10" step="0.1" placeholder="Satisfaction (0-10)" required />
          <input id="hours" type="number" min="0" step="0.1" placeholder="Hours/week" required />
          <button id="add-slu" type="submit">Add SLU</button>
          <button id="load-sample" type="button">Load sample data</button>
          <div style="display:flex;align-items:center;gap:8px">
          </div>
          <button id="render" type="button">Render Graph</button>
          <button id="download-svg" type="button">Download SVG</button>
          <button id="clear" type="button">Clear</button>
        </form>
        <div id="slu-list" class="slu-list" aria-live="polite"></div>
      </section>
      <section class="charts">
        <div class="chart-card">
          <b>Strategic Life Portfolio (Importance vs Satisfaction)</b>
          <canvas id="portfolioChart" width="800" height="600"></canvas>
        </div>
        <div class="chart-card">
          <b>Time distribution by SLA</b>
          <canvas id="timePie" width="400" height="300"></canvas>
        </div>
      </section>
    </main>
    <footer>
      <small>Demo inspired by HBR: "Use Strategic Thinking to Create the Life You Want" — bubble sizes represent hours/week.</small>
    </footer>
  </body>
</html>