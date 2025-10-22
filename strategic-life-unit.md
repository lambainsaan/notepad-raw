---
title: Strategic Thinking to Create the Life You Want
---



## Summary — HBR: "Use Strategic Thinking to Create the Life You Want"

The HBR piece argues that strategic thinking is a deliberate practice for shaping a preferred future rather than only reacting to the urgent. Key ideas:




## Interactive snapshot widget (Hugo-compatible)

Below is a small, self-contained HTML + JavaScript widget you can run directly on this Hugo page. Hugo supports raw HTML in Markdown files, so the widget will render as-is on the generated site.

This widget helps you build a quick "life snapshot" JSON, preview it, copy it to clipboard, download it, or convert it into an Obsidian-friendly note (YAML frontmatter + sections) for easier pasting into your vault.

<!-- snapshot-widget start -->
<div id="snapshot-widget" style="max-width:880px;margin:1.25rem 0;padding:1rem;border:1px solid var(--accent) ;border-radius:6px;">
	<style>
		#snapshot-widget label{display:block;font-weight:600;margin-top:0.5rem}
		#snapshot-widget input[type=text],#snapshot-widget input[type=date],#snapshot-widget textarea{width:100%;padding:8px;margin-top:6px;border-radius:4px;border:1px solid #ddd}
		#snapshot-widget .row{display:flex;gap:8px}
		#snapshot-widget .row > *{flex:1}
		#snapshot-widget button{margin-top:10px;padding:8px 12px;border-radius:6px;border:0;background:#0b74de;color:#fff;cursor:pointer}
		#snapshot-widget .muted{color:#666;font-size:0.9rem}
		#snapshot-widget pre{background:#0f1720;color:#e6eef8;padding:12px;border-radius:6px;overflow:auto}
		.sw-role {border:1px dashed #ccc;padding:8px;border-radius:6px;margin-top:8px}
		.sw-controls{display:flex;gap:8px;flex-wrap:wrap}
	</style>

	<h3>Life snapshot — builder</h3>
	<div class="muted">Fill values below and press "Generate JSON". Use the buttons to copy/download or convert to Obsidian markdown.</div>

	<label>Date</label>
	<input id="sw-date" type="date">

	<label>Roles (add one or more)</label>
	<div id="sw-roles"></div>
	<div class="sw-controls">
		<button id="sw-add-role">+ Add role</button>
	</div>

	<label>Priorities (comma-separated)</label>
	<input id="sw-priorities" type="text" placeholder="Deep work blocks, Quarterly review, 4-week experiment">

	<label>Experiments (one per line, format: name | goal | metric)</label>
	<textarea id="sw-experiments" rows="3" placeholder="4-week focus | ship MVP | feature-complete %"></textarea>

	<label>Next actions (comma-separated)</label>
	<input id="sw-next-actions" type="text" placeholder="Schedule weekly reflection, Build 1-page rubric">

	<div class="sw-controls">
		<button id="sw-generate">Generate JSON</button>
		<button id="sw-copy-json">Copy JSON</button>
		<button id="sw-download-json">Download JSON</button>
		<button id="sw-to-obsidian">Convert to Obsidian Markdown</button>
	</div>

	<h4 style="margin-top:12px">Preview</h4>
	<pre id="sw-preview">{ }</pre>

	<h4 style="margin-top:12px">Obsidian markdown (preview)</h4>
	<pre id="sw-obsidian"><!-- markdown preview -->
	</pre>
</div>
<script>
(function(){
	const $ = id => document.getElementById(id);
	const rolesEl = $('sw-roles');
	const dateEl = $('sw-date');
	const addRoleBtn = $('sw-add-role');
	const genBtn = $('sw-generate');
	const copyJsonBtn = $('sw-copy-json');
	const downloadJsonBtn = $('sw-download-json');
	const toObsBtn = $('sw-to-obsidian');
	const preview = $('sw-preview');
	const obsPreview = $('sw-obsidian');

	// set default date to today
	const today = new Date().toISOString().slice(0,10);
	dateEl.value = today;

	function makeRoleNode(role){
		const id = 'r'+Math.random().toString(36).slice(2,8);
		const wrap = document.createElement('div');
		wrap.className = 'sw-role';
		wrap.innerHTML = `
			<div class="row">
				<div><label>Name</label><input class="sw-name" type="text" value="${role?.name||''}" placeholder="Role name"></div>
				<div><label>Hours / week</label><input class="sw-hours" type="text" value="${role?.hours||''}" placeholder="e.g. 10"></div>
			</div>
			<label>Alignment</label>
			<input class="sw-align" type="text" value="${role?.alignment||''}" placeholder="high / medium / low">
			<label>Notes</label>
			<input class="sw-notes" type="text" value="${role?.notes||''}" placeholder="Short note">
			<div style=\"margin-top:8px;display:flex;gap:8px\">
				<button class=\"sw-remove\">Remove</button>
			</div>
		`;
		wrap.querySelector('.sw-remove').addEventListener('click',()=>wrap.remove());
		return wrap;
	}

	addRoleBtn.addEventListener('click',function(e){
		e.preventDefault();
		rolesEl.appendChild(makeRoleNode());
	});

	// initial role
	rolesEl.appendChild(makeRoleNode({name:'Work - Product',hours:30,alignment:'high',notes:'Main job'}));

	function readRoles(){
		const nodes = rolesEl.querySelectorAll('.sw-role');
		const out = [];
		nodes.forEach(n=>{
			const name = n.querySelector('.sw-name').value.trim();
			const hours = parseFloat(n.querySelector('.sw-hours').value) || 0;
			const alignment = n.querySelector('.sw-align').value.trim();
			const notes = n.querySelector('.sw-notes').value.trim();
			if(name) out.push({name, time_hours_per_week: hours, alignment, notes});
		});
		return out;
	}

	function readExperiments(){
		return $('sw-experiments').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
			const parts = l.split('|').map(p=>p.trim());
			return {name:parts[0]||'', goal:parts[1]||'', metric:parts[2]||'', status:'planned'};
		});
	}

	function generateSnapshot(){
		const snapshot = {
			date: dateEl.value || new Date().toISOString().slice(0,10),
			roles: readRoles(),
			priorities: $('sw-priorities').value.split(',').map(s=>s.trim()).filter(Boolean),
			experiments: readExperiments(),
			next_actions: $('sw-next-actions').value.split(',').map(s=>s.trim()).filter(Boolean)
		};
		return snapshot;
	}

	function toObsMarkdown(obj){
		// simple YAML frontmatter + sections
		const fm = ['---'];
		fm.push(`title: "Life snapshot — ${obj.date}"`);
		fm.push(`date: ${obj.date}`);
		fm.push('---\n');
		fm.push('## Roles');
		obj.roles.forEach(r=>{
			fm.push(`- **${r.name}** — ${r.time_hours_per_week} hrs/wk — alignment: ${r.alignment}` + (r.notes?` — ${r.notes}`:''));
		});
		fm.push('\n## Priorities');
		obj.priorities.forEach(p=>fm.push(`- ${p}`));
		fm.push('\n## Experiments');
		obj.experiments.forEach(e=>fm.push(`- **${e.name}** — ${e.goal} — metric: ${e.metric} — status: ${e.status}`));
		fm.push('\n## Next actions');
		obj.next_actions.forEach(a=>fm.push(`- ${a}`));
		return fm.join('\n');
	}

	genBtn.addEventListener('click',function(e){
		e.preventDefault();
		const s = generateSnapshot();
		preview.textContent = JSON.stringify(s,null,2);
		obsPreview.textContent = toObsMarkdown(s);
	});

	copyJsonBtn.addEventListener('click',function(){
		const s = generateSnapshot();
		navigator.clipboard.writeText(JSON.stringify(s,null,2)).then(()=>{
			copyJsonBtn.textContent = 'Copied ✓';
			setTimeout(()=>copyJsonBtn.textContent='Copy JSON',1200);
		});
	});

	downloadJsonBtn.addEventListener('click',function(){
		const s = generateSnapshot();
		const blob = new Blob([JSON.stringify(s,null,2)],{type:'application/json'});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `life-snapshot-${s.date}.json`;
		document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
	});

	toObsBtn.addEventListener('click',function(){
		const s = generateSnapshot();
		const md = toObsMarkdown(s);
		navigator.clipboard.writeText(md).then(()=>{
			toObsBtn.textContent = 'Copied ✓';
			setTimeout(()=>toObsBtn.textContent='Convert to Obsidian Markdown',1200);
		});
	});

	// initial generate
	genBtn.click();
})();
</script>
<!-- snapshot-widget end -->

I couldn't access the tool repository at `/Users/macbook16/codes/strategic-life-unit` from within this vault (outside the workspace). Paste the tool's main file(s) here or tell me which file to copy and I'll embed the code and provide exact run instructions.

### Snapshot template (example)

```json
{
	"date": "2025-10-23",
	"roles": [
		{"name": "Work - Product", "time_hours_per_week": 30, "alignment": "high", "notes": "Main job"},
		{"name": "Side project - Open source", "time_hours_per_week": 5, "alignment": "medium", "notes": "Sporadic"}
	],
	"priorities": ["Deep work blocks", "Quarterly review", "Experiment: 4-week focus"],
	"experiments": [
		{"name": "4-week focus", "goal": "ship MVP", "metric": "feature-complete %", "status": "planned"}
	],
	"next_actions": ["Schedule weekly reflection", "Build 1-page rubric"]
}
```

