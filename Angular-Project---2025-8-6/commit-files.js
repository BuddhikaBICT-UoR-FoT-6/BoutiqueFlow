const { execSync } = require('child_process');
const fs = require('fs');

const start = new Date('2026-05-11T00:00:00Z').getTime();
const end = new Date('2026-05-16T23:59:59Z').getTime();

function getRandomDate() {
  const time = start + Math.random() * (end - start);
  return new Date(time).toISOString();
}

function generateCommitMessage(filePath) {
  const filename = filePath.split('/').pop() || filePath.split('\\').pop();
  if (filename.endsWith('.css')) return `style(ui): redesign ${filename}`;
  if (filename.endsWith('.ts')) return `feat(logic): update ${filename}`;
  if (filename.endsWith('.html')) return `feat(ui): update ${filename} layout`;
  if (filename === 'server.js') return `fix(backend): add local db fallback`;
  if (filename.endsWith('.json')) return `chore(deps): update lockfile`;
  return `chore: update ${filename}`;
}

try {
  const statusOutput = execSync('git status --porcelain -uall').toString();
  const lines = statusOutput.split('\n').map(l => l.trim()).filter(Boolean);
  
  let ps1Content = '';

  for (const line of lines) {
    let file = line.substring(3).replace(/^"|"$/g, '');
    const msg = generateCommitMessage(file);
    const date = getRandomDate();
    
    ps1Content += `$env:GIT_AUTHOR_DATE="${date}"\n`;
    ps1Content += `$env:GIT_COMMITTER_DATE="${date}"\n`;
    ps1Content += `git add "${file}"\n`;
    ps1Content += `git commit -m "${msg}"\n\n`;
  }
  
  fs.writeFileSync('commit-all.ps1', ps1Content);
  console.log('Created commit-all.ps1');
} catch (e) {
  console.error(e.toString());
}
