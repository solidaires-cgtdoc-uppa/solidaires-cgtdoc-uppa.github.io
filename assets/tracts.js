// Marque les feuilles dont le contenu dépasse une page A5 (écran uniquement),
// pour y afficher la ligne rouge de limite de page définie dans le CSS.
function marquerDépassements() {
    const sonde = document.createElement('div');
    sonde.style.cssText = 'position:absolute;visibility:hidden;height:209.5mm';
    document.body.appendChild(sonde);
    const pageH = sonde.offsetHeight;
    sonde.remove();
    document.querySelectorAll('.sheet').forEach(f => {
        if (f.closest('#massicot-zone')) { return; } // clones des planches : hauteur imposée 210 mm, jamais de marqueur
        f.classList.toggle('overflows', f.offsetHeight > pageH + 1);
    });
}
window.addEventListener('load', marquerDépassements);
window.addEventListener('resize', marquerDépassements);

// Mode massicot : 2 tracts complets par feuille A4 PAYSAGE.
// Construit une zone d'impression avec le recto ×2 puis le verso ×2,
// deux A5 posés droits côte à côte par planche (coupe verticale au milieu).
// Au passage, le script bascule le format de page par défaut en A4 paysage
// via le bloc <style id="page-massicot"> du HTML : chaque impression n'utilise
// ainsi qu'UNE SEULE taille de page, ce que Firefox exige (il ignore la
// taille des pages nommées « @page massicot » et réduisait les planches
// sur du A5 portrait).
const btnMassicot = document.getElementById('btn-massicot');
const pageMassicot = document.getElementById('page-massicot');
if (btnMassicot) {
    btnMassicot.addEventListener('click', function () {
        const on = document.body.classList.toggle('massicot');
        btnMassicot.classList.toggle('on', on);
        btnMassicot.textContent = on
            ? 'Massicot activé — vérifiez : A4 paysage, marges aucune, 100 %, bord court'
            : 'Mode massicot : 2 tracts par A4';
        if (pageMassicot) { pageMassicot.media = on ? 'print' : 'not print'; }
        const ancienne = document.getElementById('massicot-zone');
        if (ancienne) { ancienne.remove(); }
        if (on) {
            const zone = document.createElement('div');
            zone.id = 'massicot-zone';
            [['recto', 'recto'], ['verso', 'verso']].forEach(function (groupe) {
                const planche = document.createElement('div');
                planche.className = 'a4page';
                groupe.forEach(function (id) {
                    const slot = document.createElement('div');
                    slot.className = 'slot';
                    slot.appendChild(document.getElementById(id).cloneNode(true));
                    planche.appendChild(slot);
                });
                zone.appendChild(planche);
            });
            zone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
            document.body.appendChild(zone);
        }
        marquerDépassements();
    });
}

// Garde-fou : en mode massicot, un contenu qui dépasse une page A5
// serait coupé à l'impression (overflow: hidden sur les emplacements).
window.addEventListener('beforeprint', function () {
    if (document.body.classList.contains('massicot')) {
        const tropLongues = document.querySelectorAll('body > .sheet.overflows').length;
        if (tropLongues > 0) {
            alert('Attention : ' + tropLongues + ' feuille(s) dépassent une page A5. ' +
                'En mode massicot, le contenu excédentaire sera coupé à l\u2019impression.');
        }
    }
});
