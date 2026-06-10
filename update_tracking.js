const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/page.{js,jsx}', { cwd: process.cwd(), absolute: true });

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('await kv.incr(`builder_views:') && !content.includes('if (process.env.NODE_ENV')) {
    content = content.replace(/await kv\.incr\(`builder_views:(.*?)`\);/g, 'if (process.env.NODE_ENV !== \'development\') { await kv.incr(`builder_views:$1`); }');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
