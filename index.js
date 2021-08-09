import * as imzml from "./imzml_validator.js";

var enc = new TextEncoder();

var t0 = performance.now()
let p = imzml.Parser.parse(enc.encode("<test></test>"));
var t1 = performance.now()
console.log("Parsing test took " + (t1 - t0) + " milliseconds.")
console.log(p);
while(p.errors()) {
    console.log(p.get_next_error());
}

//var tickAddDot;

document.querySelector("#read-file").addEventListener('click', function() {
	// no file selected to read
	if(document.querySelector("#file").value == '') {
		console.log('No file selected');
		return;
	}

	let validationResults = document.getElementById('validationResults');
	validationResults.innerText = "Validating, please wait...";
	/*tickAddDot = window.setInterval(() => {
		validationResults.innerText += '.';
	}, 100)*/

	var file = document.querySelector("#file").files[0];

	var reader = new FileReader();
	reader.onload = function(e) {
		// binary data
        var t0 = performance.now()

        let array = new Uint8Array(e.target.result);
        let p = imzml.Parser.parse(array);

        var t1 = performance.now()

        //console.log(p);
		validationResults.innerHTML = '';
        validationResults.innerText = "Parsing imzML took " + Math.round(t1 - t0) + " milliseconds.";
		
		let list = document.createElement('ul');
		let numErrors = 0;
		let maxErrors = 30;

        while(p.errors()) {
			if(numErrors < maxErrors) {
				let item = document.createElement('li');
				item.innerText = p.get_next_error();
				list.appendChild(item);
			}

			numErrors += 1;
        }

		let errorText = document.createElement('span');
		errorText.innerText = "Found " + numErrors + " errors.";
		if(numErrors > maxErrors) {
			errorText.innerText += " Displaying the first " + maxErrors + "."
		}
		validationResults.appendChild(errorText);

		validationResults.appendChild(list);

	};
	reader.onerror = function(e) {
		// error occurred
		console.log('Error : ' + e.type);
	};
	
	reader.readAsArrayBuffer(file);
});
