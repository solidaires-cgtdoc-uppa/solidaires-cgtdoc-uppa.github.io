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

	// Mode massicot : 2 tracts complets par feuille A4.
	// Construit une zone d'impression avec le recto ×2 puis le verso ×2,
	// disposés en planches A4 paysage (une par page imprimée).
	const btnMassicot = document.getElementById('btn-massicot');
	btnMassicot.addEventListener('click', function () {
		const on = document.body.classList.toggle('massicot');
		btnMassicot.classList.toggle('on', on);
		btnMassicot.textContent = on
			? 'Massicot activé \u2014 v\u00e9rifiez : A4 PAYSAGE, marges aucune, 100 %'
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
					planche.appendChild(document.getElementById(id).cloneNode(true));
				});
				zone.appendChild(planche);
			});
			zone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
			document.body.appendChild(zone);
		}
	});
