/* Keep the current tutorial step visible; tuck occasional tools into drawers. */
for(const panel of document.querySelectorAll('.workspace>aside>.settings, .workspace>aside>.log')){
 const drawer=document.createElement('details'),summary=document.createElement('summary');
 drawer.className='bench-drawer';summary.textContent=panel.querySelector('h3')?.childNodes[0]?.textContent.trim()||'Practice details';
 panel.before(drawer);drawer.append(summary,panel);
}
