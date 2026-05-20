const { execFileSync } = require('node:child_process');
const path = require('node:path');

const files = [
  'backend/server.js',
  'backend/db.js',
  'backend/routes/api.js',
  'public/js/script.js',
  'public/js/historico.js',
  'public/js/confirmacao.js'
];

for (const file of files) {
  const target = path.resolve(__dirname, '..', file);
  execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
  console.log(`OK: ${file}`);
}

console.log('Validação de sintaxe concluída com sucesso.');
