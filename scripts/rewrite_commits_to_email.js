#!/usr/bin/env node
const { execSync } = require('child_process');
function run(cmd, opts) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
  } catch (err) {
    console.error('Command failed:', cmd);
    console.error(err.stdout || err.message);
    throw err;
  }
}

if (process.argv.length < 5) {
  console.error('Usage: node rewrite_commits_to_email.js <name> <email> <sha1> [sha2 ...]');
  process.exit(1);
}

const name = process.argv[2];
const email = process.argv[3];
const inputShas = process.argv.slice(4);

console.log('Name:', name);
console.log('Email:', email);
console.log('Shas:', inputShas.join(', '));

// Resolve full SHAs
const shas = inputShas.map(s => run(`git rev-parse --verify ${s}`));
console.log('Full SHAs:', shas.join(', '));

// Determine N (number of commits to replace)
const N = shas.length;
const parentRef = run(`git rev-parse HEAD~${N}`);
console.log('Parent ref (HEAD~' + N + '):', parentRef);

// Backup current main
const backupBranch = `backup-main-before-author-fix-${Date.now()}`;
console.log('Creating backup branch:', backupBranch);
run(`git branch -f ${backupBranch} main`);

// Create rewrite branch at parent
const tmpBranch = `rewrite-temp-${Date.now()}`;
console.log('Creating temporary branch:', tmpBranch, 'at', parentRef);
run(`git checkout -b ${tmpBranch} ${parentRef}`);

// Apply commits in order oldest -> newest
// Input shas were provided newest-first (likely); we should sort by commit date ascending
const shasByDate = shas.slice().sort((a,b) => {
  const ad = new Date(run(`git show -s --format=%at ${a}`) * 1000);
  const bd = new Date(run(`git show -s --format=%at ${b}`) * 1000);
  return ad - bd;
});
console.log('Processing SHAs in order:', shasByDate.join(', '));

for (const sha of shasByDate) {
  const msg = run(`git show -s --format=%B ${sha}`).replace(/"/g, '\\"');
  console.log('Cherry-pick (no commit):', sha);
  run(`git cherry-pick -n ${sha}`);
  console.log('Committing with new author/committer...');
  run(`git -c user.name="${name}" -c user.email="${email}" commit -m "${msg}"`);
}

// Move main to new history
console.log('Resetting main to temp branch head...');
run(`git checkout main`);
run(`git reset --hard ${tmpBranch}`);

// Force-push updated main
console.log('Force-pushing to origin/main (with --force-with-lease)...');
run(`git push --force-with-lease origin main`);

console.log('Rewrite complete. Backup branch created:', backupBranch);
console.log('Temporary branch left as:', tmpBranch);
console.log('Done.');
