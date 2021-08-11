import init, {Parser} from "./imzml_validator.js";
init().then(imzml => {	
	console.log(imzml);

	var enc = new TextEncoder();

	var t0 = performance.now()
	let p = Parser.parse(enc.encode("<test></test>"));
	var t1 = performance.now()
	console.log("Parsing test took " + (t1 - t0) + " milliseconds.")
	console.log(p);
	while(p.errors()) {
	    console.log(p.get_next_error());
	}
});

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
	reader.onload = function (e) {
		// binary data
		var t0 = performance.now()
		
		let array = new Uint8Array(e.target.result);
		let parser = Parser.parse(array);

		var t1 = performance.now()

		//console.log(p);
		validationResults.innerHTML = '';
		validationResults.innerText = "Parsing imzML took " + Math.round(t1 - t0) + " milliseconds.";

		document.getElementById('dataSummary').style.display = 'block';

		let list = document.createElement('ul');
		let numErrors = 0;
		let maxErrors = 30;

		while (parser.errors()) {
			if (numErrors < maxErrors) {
				let item = document.createElement('li');
				let span = document.createElement('span');
				span.classList.add("error");
				span.innerText = parser.get_next_error();
				item.appendChild(span);
				list.appendChild(item);
			}

			numErrors += 1;
		}

		let errorText = document.createElement('span');
		errorText.innerText = " Found " + numErrors + " errors.";
		if (numErrors > maxErrors) {
			errorText.innerText += " Displaying the first " + maxErrors + "."
		}
		validationResults.appendChild(errorText);

		validationResults.appendChild(list);

		// Now include details about the imzML, if possible
		let width = parser.get_width();
		let height = parser.get_height();

		let dimensions = document.getElementById('dimensions');
		dimensions.innerHTML = "";
		if (width && height) {
			dimensions.innerHTML = "" + width + " x " + height
		} else {
			dimensions.innerHTML = "Missing information."
		}

		let pixelSizeX = parser.get_pixel_size_x();
		let pixelSizeY = parser.get_pixel_size_y();

		let pixelSize = document.getElementById('pixelSize');
		pixelSize.innerHTML = "";
		if (pixelSizeX) {
			if (pixelSizeY) {
				pixelSize.innerHTML = "" + pixelSizeX + " x " + pixelSizeY
			} else {
				pixelSize.innerHTML = "" + pixelSizeX + " x " + pixelSizeX
			}
		} else {
			let errorText = document.createElement('p');
			errorText.classList.add("error");
			errorText.innerText = "Missing information.";
			pixelSize.appendChild(errorText)
		}


		let xLocations = parser.get_x_locations();
		let yLocations = parser.get_y_locations();
		let ticData = parser.get_tic_image();

		let ticImage = document.getElementById('ticImage');
		ticImage.innerHTML = "";
		if (ticData) {
			let maxValue = 0;
			ticData.forEach((value) => {
				if (value > maxValue) {
					maxValue = value;
				}
			});

			let canvas = document.createElement('canvas');
			canvas.width = Number(width);
			canvas.height = Number(height);
			let context = canvas.getContext('2d');

			let imageData = context.createImageData(Number(width), Number(height));

			let minX = Number(width);
			let minY = Number(height);

			ticData.forEach((value, index) => {
				let xPos = xLocations[index];
				let yPos = yLocations[index];

				if (xPos < minX) {
					minX = xPos;
				}
				if (yPos < minY) {
					minY = yPos;
				}

				let pixelIndex = ((yPos - 1) * Number(width)) + xPos - 1

				imageData.data[pixelIndex * 4] = value / maxValue * 255;
				imageData.data[pixelIndex * 4 + 1] = value / maxValue * 255;
				imageData.data[pixelIndex * 4 + 2] = value / maxValue * 255;
				imageData.data[pixelIndex * 4 + 3] = 255;
			});

			context.putImageData(imageData, 0, 0);

			if (minX != 1 || minY != 1) {
				let errorText = document.createElement('p');
				errorText.classList.add("error");
				errorText.innerText = "This imzML file is recorded using absolute coordinates. The actual data dimensions are " +
					(Number(width) - minX) + " x " + (Number(height) - minY) + ", but the recorded dimensions are " + width + " x " + height + ".";
				ticImage.appendChild(errorText);
			}
			ticImage.appendChild(canvas);
		} else {
			let errorText = document.createElement('p');
			errorText.classList.add("error");
			errorText.innerText = "Missing information.";
			ticImage.appendChild(errorText)
		}

	};
	reader.onerror = function (e) {
		// error occurred
		console.log('Error : ' + e.type);
	};

	reader.readAsArrayBuffer(file);
});
