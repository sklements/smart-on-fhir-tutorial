(function (window) {
	window.extractData = function () {
		var ret = $.Deferred();

		function onError() {
			console.log('Loading error', arguments);
			ret.reject();
		}

		function onReady(smart) {
			console.log('smart: ' + JSON.stringify(smart));

			$('#smartTenantId').html(smart.tokenResponse.tenant);
	        $('#smartPatientId').html(smart.tokenResponse.patient);
			$('#smartUserId').html(smart.tokenResponse.user);

			var patient = smart.patient;
			var pt = patient.read();

			var practObj = {};
			practObj.type = "Practitioner";
			practObj.id = "605926"; // smart.tokenResponse.user;

			var pract = smart.api.read(practObj);

			$.when(pt, pract).fail(onError);
			$.when(pt, pract).done(function (patient, practitioner) {

				console.log('patient: ' + JSON.stringify(patient));
				console.log('practitioner: ' + JSON.stringify(practitioner));

				var pt = defaultPatient();
				pt.id = patient.id;
				var identifiers = patient.identifier;

				for (var j = 0; j < identifiers.length; j++) {
					if (identifiers[j].type.coding !== undefined
						 && identifiers[j].type.coding.length > 0
						 && identifiers[j].type.coding[0].code == "MR"
						 && identifiers[j].type.text.search(/^MRN$/i) !== -1) {
						pt.mrn = identifiers[j].value;
					}
				}

				practitioner = practitioner.data;
				var pract = {};
				pract.id = practitioner.id;
				pract.npi = "";
				identifiers = practitioner.identifier;

				for (var i = 0; i < identifiers.length; i++) {
					if (identifiers[i].type.coding !== undefined
						 && identifiers[i].type.coding.length > 0
						 && identifiers[i].type.coding[0].code == "PRN"
						 && identifiers[i].type.text.search(/^National Provider Identifier$/i) !== -1) {
						pract.npi = identifiers[i].value;
					}
				}

				ret.resolve(pt, pract);
			});
		}

		FHIR.oauth2.ready(onReady, onError);

		return ret.promise();
	};

	function defaultPatient() {
		return {
			id: {
				value: ''
			},
			mrn: {
				value: ''
			},
		};
	}

	window.drawVisualization = function (pt, pract) {

		$('#holder').show();
		$('#patientId').html(pt.id);
		$('#mrn').html(pt.mrn);
		$('#practId').html(pract.id);
		$('#npi').html(pract.npi);
	};

})(window);
