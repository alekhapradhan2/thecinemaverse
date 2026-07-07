const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'src', 'app'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Undo my inline awaits for params
    content = content.replace(/\(await params\)\./g, 'params.');
    
    // Undo my inline awaits for searchParams
    content = content.replace(/\(await searchParams\)\?\./g, 'searchParams?.');
    content = content.replace(/\(await searchParams\)\./g, 'searchParams.');

    // Inject "params = await params;" if it's an async function that takes params
    // But since `params` is passed as a destructured object, it's better to just do `const resolvedParams = await params;` 
    // Wait, the Next.js 15 recommendation is:
    // `export default async function Page(props: { params: Promise<{ slug: string }> }) { const params = await props.params; }`
    // Since the props are currently destructured like `({ params })`, I can do:
    // `const resolvedParams = await params;` and change `params.` to `resolvedParams.`?
    
    // Actually, an easier way: just let my regex replace `params.` with `resolvedParams.` ONLY in the body, not in the signature!
    // But how?
    
    // Let's just restore everything to how it was before!
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Restored inline awaits in', filePath);
    }
  }
});
