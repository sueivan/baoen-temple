const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
test('every HTML asset uses a repository-relative path and exists',()=>{
  const refs=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]);
  for(const ref of refs){
    assert.ok(ref.startsWith('./'),ref);
    assert.ok(fs.existsSync(path.join(base,ref.split('?')[0])),ref);
  }
  assert.ok(html.includes('lang="zh-Hant"'));
});
test('all mobile labels and generated action messages exist in all three languages',()=>{
  const scope={window:{Temple:{}}};
  vm.runInNewContext(fs.readFileSync(path.join(base,'assets/js/i18n.js'),'utf8'),scope);
  const keys=[...html.matchAll(/data-(?:i18n|label)="([^"]+)"/g)].map(m=>m[1]);
  keys.push('palmMsg','bowMsg','woodMsg','beadsMsg','contextLost','audioError');
  for(const [lang,dict] of Object.entries(scope.window.Temple.I18N)){
    for(const key of keys)assert.equal(typeof dict[key],'string',lang+':'+key);
  }
});
test('PWA install icons match their declared PNG dimensions',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
  for(const icon of manifest.icons){
    const bytes=fs.readFileSync(path.join(base,icon.src));
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,icon.sizes);
  }
});
test('the offline worker precaches a complete set of same-origin local files',()=>{
  const scope={URL,self:{location:new URL('https://example.test/repository/sw.js'),addEventListener(){}}};
  const source=fs.readFileSync(path.join(base,'sw.js'),'utf8');
  vm.runInNewContext(source+'\nglobalThis.files=FILES;',scope);
  for(const file of scope.files){
    assert.ok(file.startsWith('./'));
    assert.ok(fs.existsSync(path.join(base,file.split('?')[0])),file);
  }
});
