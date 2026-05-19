const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/dark:bg-\[\#050505\]/g, 'dark:bg-slate-950');
    content = content.replace(/dark:bg-\[\#0a0a0a\]/g, 'dark:bg-slate-900');
    content = content.replace(/dark:bg-\[\#111111\]/g, 'dark:bg-slate-800');
    content = content.replace(/dark:bg-\[\#0f1115\]/g, 'dark:bg-slate-900');
    content = content.replace(/dark:ring-\[\#0a0a0a\]/g, 'dark:ring-slate-900');
    content = content.replace(/dark:border-\[\#0a0a0a\]/g, 'dark:border-slate-900');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.jsx')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
};

const files = walkSync(srcDir);
files.forEach(replaceInFile);
console.log('Done replacing hardcoded hexes.');
