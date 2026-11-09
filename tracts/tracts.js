// Marque les feuilles dont le contenu dépasse une page A5 (écran uniquement),
// pour y afficher la ligne rouge de limite de page définie dans le CSS.
function marquerDépassements() {
    const sonde = document.createElement('div');
    sonde.style.cssText = 'position:absolute;visibility:hidden;height:209.5mm';
    document.body.appendChild(sonde);
    const pageH = sonde.offsetHeight;
    sonde.remove();
    document.querySelectorAll('.sheet').forEach(f => {
        if (f.closest('#massicot-zone')) {
            // planches du massicot : hauteur imposée 210 mm ; on détecte un
            // contenu coupé (scrollHeight) : sert à l'alerte avant impression
            f.classList.toggle('overflows', f.scrollHeight > f.offsetHeight + 1);
            return;
        }
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
        // Rédaction et massicot s'excluent : on coupe l'édition avant de
        // construire les planches, ainsi aucun clone n'est éditable.
        if (on) { couperEdition(); }
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
                    const copie = document.getElementById(id).cloneNode(true);
                    copie.dataset.source = id; // l'édition d'une planche remonte vers la feuille d'origine
                    slot.appendChild(copie);
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
// Les feuilles A5 originales sont masquées en mode massicot : la détection
// se fait sur les planches, et on compte les faces distinctes (chaque
// face étant dupliquée ×2 sur sa planche).
window.addEventListener('beforeprint', function () {
    if (document.body.classList.contains('massicot')) {
        const faces = new Set();
        document.querySelectorAll('#massicot-zone .sheet.overflows').forEach(function (el) {
            faces.add(el.dataset.source || '?');
        });
        if (faces.size > 0) {
            alert('Attention : le contenu de ' + faces.size +
                (faces.size > 1 ? ' faces dépasse' : ' face dépasse') + ' une page A5. ' +
                'En mode massicot, le contenu excédentaire sera coupé à l\u2019impression.');
        }
    }
});

// ===== Rédaction et massicot : deux modes exclusifs =====
// Activer l'un coupe automatiquement l'autre : on ne rédige pas sur les
// planches du massicot, et on ne massicote pas pendant la rédaction.
function couperEdition() {
    document.body.classList.remove("edition");
    if (btnEdition) {
        btnEdition.classList.remove("on");
        btnEdition.textContent = "Activer la rédaction";
    }
    document.querySelectorAll(".sheet").forEach(function (f) {
        f.removeAttribute("contenteditable");
    });
}
function couperMassicot() {
    document.body.classList.remove("massicot");
    if (btnMassicot) {
        btnMassicot.classList.remove("on");
        btnMassicot.textContent = "Mode massicot : 2 tracts par A4";
    }
    if (pageMassicot) { pageMassicot.media = "not print"; }
    const zone = document.getElementById("massicot-zone");
    if (zone) { zone.remove(); }
}

// ===== Mode rédaction : retaper les textes directement dans la page =====
// Les copains cliquent sur « Activer la rédaction », puis sur n'importe quel
// texte du tract : contenteditable permet de retaper sur place, sans code.
// Chaque frappe est enregistrée dans localStorage : le brouillon survit à la
// fermeture du navigateur, mais reste propre à CE navigateur sur CET ordinateur.
// Pour transmettre une version finie : Ctrl+S (copie HTML modifiable) ou Ctrl+P.
// En cas de mise à jour du modèle par l'équipe, incrémenter le numéro de
// version ci-dessous : les navigateurs repartiront du nouveau modèle au lieu
// de restaurer l'ancien texte enregistré.
const CLE = "tract-edition-v1";
const btnEdition = document.getElementById("btn-edition");
const btnReset = document.getElementById("btn-reset");

function restaurer() {
    try {
        const contenu = JSON.parse(localStorage.getItem(CLE) || "null");
        if (!contenu) { return; }
        if (contenu.recto) { document.getElementById("recto").innerHTML = contenu.recto; }
        if (contenu.verso) { document.getElementById("verso").innerHTML = contenu.verso; }
    } catch (e) { /* stockage illisible ou vide : on garde le modèle */ }
}

function sauver() {
    try {
        localStorage.setItem(CLE, JSON.stringify({
            recto: document.getElementById("recto").innerHTML,
            verso: document.getElementById("verso").innerHTML
        }));
    } catch (e) { /* stockage indisponible : pas de brouillon persistant */ }
}

if (btnEdition) {
    restaurer(); // reprise du brouillon précédent dès l'ouverture

    btnEdition.addEventListener("click", function () {
        const on = !document.body.classList.contains("edition");
        couperEdition();
        if (on) {
            // Rédaction et massicot s'excluent : on quitte le massicot d'abord.
            couperMassicot();
            document.body.classList.add("edition");
            btnEdition.classList.add("on");
            btnEdition.textContent = "Rédaction activée — cliquez sur les textes du tract";
            document.querySelectorAll(".sheet").forEach(function (f) {
                f.setAttribute("contenteditable", "true");
            });
        }
        marquerDépassements();
    });

    // Chaque frappe est sauvegardée. Les planches du mode massicot portent
    // data-source : leurs modifications remontent à la feuille d'origine.
    let rebond;
    document.addEventListener("input", function (e) {
        const feuille = e.target.closest && e.target.closest(".sheet");
        if (!feuille || !feuille.isContentEditable) { return; }
        const origine = document.getElementById(feuille.dataset.source || feuille.id);
        if (origine && feuille !== origine) { origine.innerHTML = feuille.innerHTML; }
        sauver();
        clearTimeout(rebond);
        rebond = setTimeout(marquerDépassements, 300);
    });

    // Coller sans mise en forme (évite les surprises venues de Word / Docs)
    document.addEventListener("paste", function (e) {
        const feuille = e.target.closest && e.target.closest(".sheet");
        if (!feuille || !feuille.isContentEditable) { return; }
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    });

    // Barre de mise en forme : gras, italique, titres. Le mousedown est
    // neutralisé pour que le clic sur un bouton ne perde pas la sélection.
    const barreFormat = document.getElementById("format-bar");
    if (barreFormat) {
        barreFormat.querySelectorAll("button").forEach(function (b) {
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () {
                const cible = document.activeElement;
                const feuille = cible && cible.closest ? cible.closest(".sheet") : null;
                if (!feuille || !feuille.isContentEditable) { return; }
                if (b.dataset.cmd === "createLink") {
                    const sel = window.getSelection();
                    if (!sel || sel.isCollapsed) {
                        alert("Sélectionnez d'abord le texte à transformer en lien.");
                        return;
                    }
                    let url = prompt("Adresse du lien (ex. https://univpop-pau.fr) :", "https://");
                    if (!url) { return; }
                    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) { url = "https://" + url; } // https:// ajouté si absent
                    document.execCommand("createLink", false, url);
                } else {
                    document.execCommand(b.dataset.cmd, false, b.dataset.val || null);
                }
                sauver();
            });
        });
    }

    if (btnReset) {
        btnReset.addEventListener("click", function () {
            if (!confirm("Revenir aux textes d'origine du modèle ?\nLes modifications enregistrées dans ce navigateur seront effacées.")) { return; }
            try { localStorage.removeItem(CLE); } catch (e) { /* rien */ }
            location.reload();
        });
    }
}

// ===== Boutons « Imprimer » et « Télécharger la copie modifiable » =====
const btnPrint = document.getElementById("btn-print");
const btnSave = document.getElementById("btn-save");

if (btnPrint) {
    btnPrint.addEventListener("click", function () { window.print(); });
}

if (btnSave) {
    btnSave.addEventListener("click", function () {
        // Photographie de la page « au repos » : textes en cours inclus, mais
        // sans les modes rédaction/massicot ni les repères propres à l'écran.
        const racine = document.documentElement.cloneNode(true);
        racine.querySelector("body").classList.remove("edition", "massicot");
        const zone = racine.querySelector("#massicot-zone");
        if (zone) { zone.remove(); }
        const stylePage = racine.querySelector("#page-massicot");
        if (stylePage) { stylePage.setAttribute("media", "not print"); }
        racine.querySelectorAll(".toolbar button").forEach(function (b) { b.classList.remove("on"); });
        const bE = racine.querySelector("#btn-edition");
        if (bE) { bE.textContent = "Activer la rédaction"; }
        const bM = racine.querySelector("#btn-massicot");
        if (bM) { bM.textContent = "Mode massicot : 2 tracts par A4"; }
        racine.querySelectorAll(".sheet").forEach(function (f) {
            f.removeAttribute("contenteditable");
            f.classList.remove("overflows");
        });
        const html = "<!doctype html>\n" + racine.outerHTML;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const lien = document.createElement("a");
        lien.href = URL.createObjectURL(blob);
        lien.download = "tract-modifie.html";
        document.body.appendChild(lien);
        lien.click();
        setTimeout(function () {
            lien.remove();
            URL.revokeObjectURL(lien.href);
        }, 1000);
    });
}
