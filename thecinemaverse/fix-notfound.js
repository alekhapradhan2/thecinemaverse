const fs = require('fs');
const path = require('path');

const files = [
  'src/app/songs/[movieSlug]/[songIndex]/[songSlug]/page.tsx',
  'src/app/songs/[movieSlug]/[songIndex]/page.tsx',
  'src/app/songs/category/[category]/page.tsx',
  'src/app/movie/[slug]/page.tsx',
  'src/app/movies/[category]/page.tsx',
  'src/app/movies/year/[year]/page.tsx',
  'src/app/box-office/[slug]/page.tsx',
  'src/app/cast/[id]/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/blog/odia-guides/[slug]/page.tsx'
];

for (const f of files) {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    
    // Add import NotFound if not present
    if (!c.includes('import NotFound from')) {
      c = c.replace(/import \{ notFound \} from ["']next\/navigation["'];?/, 'import { notFound } from "next/navigation";\nimport NotFound from "@/app/not-found";');
    }
    
    // Replace notFound() with return <NotFound />
    // we should be careful to only replace `notFound();` or `return notFound();`
    c = c.replace(/return notFound\(\);/g, 'return <NotFound />;');
    c = c.replace(/notFound\(\);?/g, 'return <NotFound />;');
    
    fs.writeFileSync(p, c);
    console.log('Fixed', f);
  }
}
