const fs = require('fs');
function replaceStatic(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/export async function generateStaticParams\(\) \{[\s\S]*?\n\}/g, 'export async function generateStaticParams() {\n  return [];\n}');
  fs.writeFileSync(file, c);
  console.log('Fixed', file);
}
replaceStatic('src/app/songs/[movieSlug]/[songIndex]/page.tsx');
replaceStatic('src/app/songs/[movieSlug]/[songIndex]/[songSlug]/page.tsx');
