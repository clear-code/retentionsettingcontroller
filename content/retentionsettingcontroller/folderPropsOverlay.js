window.addEventListener('DOMContentLoaded', function() {
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	var hiddenBox = document.createElement('box');
	hiddenBox.setAttribute('hidden', true);

	var tab = document.getElementById('Retention');
	var panel = document.getElementById('folderPropTabBox')
				.getElementsByTagName('tabpanels')[0]
				.childNodes[1];

	var range = document.createRange();
	range.selectNodeContents(panel);
	hiddenBox.appendChild(range.extractContents());

	range.selectNode(tab);
	range.deleteContents();
	range.selectNode(panel);
	range.deleteContents();
	range.detach();

	document.documentElement.appendChild(hiddenBox);

}, false);

