// Marque les feuilles dont le contenu dépasse une page A5 (écran uniquement),
// pour y afficher la ligne rouge de limite de page définie dans le CSS.
function marquerDépassements() {
    const sonde = document.createElement('div');
    sonde.style.cssText = 'position:absolute;visibility:hidden;height:209.5mm';
    document.body.appendChild(sonde);
    const pageH = sonde.offsetHeight;
    sonde.remove();
    document.querySelectorAll('.sheet').forEach(f => {
        f.classList.toggle('overflows', f.offsetHeight > pageH + 1);
    });
}
window.addEventListener('load', marquerDépassements);
window.addEventListener('resize', marquerDépassements);

// Mode massicot : 2 tracts complets par feuille A4 portrait.
// Construit une zone d'impression avec le recto ×2 puis le verso ×2,
// chaque A5 tourné à 90° dans son emplacement (coupe horizontale au milieu).
const btnMassicot = document.getElementById('btn-massicot');
if (btnMassicot) {
    btnMassicot.addEventListener('click', function () {
        const on = document.body.classList.toggle('massicot');
        btnMassicot.classList.toggle('on', on);
        btnMassicot.textContent = on
            ? 'Massicot activé — vérifiez : A4 portrait, marges aucune, 100 %, bord long'
            : 'Mode massicot : 2 tracts par A4';
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
    });
}

// Garde-fou : en mode massicot, un contenu qui dépasse une page A5
// serait coupé à l'impression (overflow: hidden sur les emplacements).
window.addEventListener('beforeprint', function () {
    if (document.body.classList.contains('massicot')) {
        const tropLongues = document.querySelectorAll('.sheet.overflows').length;
        if (tropLongues > 0) {
            alert('Attention : ' + tropLongues + ' feuille(s) dépassent une page A5. ' +
                'En mode massicot, le contenu excédentaire sera coupé à l\u2019impression.');
        }
    }
});
