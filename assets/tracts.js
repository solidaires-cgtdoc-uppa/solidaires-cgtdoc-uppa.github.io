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

