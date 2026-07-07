const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const paramsToAwait = [
  'slug', 'id', 'year', 'category', 'songIndex', 'movieSlug', 'songSlug', 'genre'
];

walkDir(path.join(__dirname, 'src', 'app'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix params
    for (const p of paramsToAwait) {
      const regex = new RegExp(`params\\.${p}`, 'g');
      content = content.replace(regex, `(await params).${p}`);
    }

    // Fix searchParams
    content = content.replace(/searchParams\?\.lang/g, '(await searchParams)?.lang');
    content = content.replace(/searchParams\.lang/g, '(await searchParams).lang');
    content = content.replace(/searchParams\?\.q/g, '(await searchParams)?.q');
    content = content.replace(/searchParams\.q/g, '(await searchParams).q');
    content = content.replace(/searchParams\?\.page/g, '(await searchParams)?.page');
    content = content.replace(/searchParams\.page/g, '(await searchParams).page');
    content = content.replace(/searchParams\?\.genre/g, '(await searchParams)?.genre');
    content = content.replace(/searchParams\.genre/g, '(await searchParams).genre');
    content = content.replace(/searchParams\?\.industry/g, '(await searchParams)?.industry');
    content = content.replace(/searchParams\.industry/g, '(await searchParams).industry');
    content = content.replace(/searchParams\?\.musicDirector/g, '(await searchParams)?.musicDirector');
    content = content.replace(/searchParams\.musicDirector/g, '(await searchParams).musicDirector');
    content = content.replace(/searchParams\?\.singer/g, '(await searchParams)?.singer');
    content = content.replace(/searchParams\.singer/g, '(await searchParams).singer');
    content = content.replace(/searchParams\?\.movie/g, '(await searchParams)?.movie');
    content = content.replace(/searchParams\.movie/g, '(await searchParams).movie');
    content = content.replace(/searchParams\?\.year/g, '(await searchParams)?.year');
    content = content.replace(/searchParams\.year/g, '(await searchParams).year');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
