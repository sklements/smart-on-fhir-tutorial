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

			var context = {};
			context.tenantId = smart.tokenResponse.tenant;
			context.patient = {};
			context.practitioner = {};
			
			var patient = smart.patient;
			var patientRead = patient.read();

			var practitioner = {};
			practitioner.type = "Practitioner";
			practitioner.id = smart.tokenResponse.user; // "605926"

			var practitionerRead = smart.api.read(practitioner);

			$.when(patientRead, practitionerRead).fail(onError);
			$.when(patientRead, practitionerRead).done(function (patient, practitioner) {

				console.log('patient: ' + JSON.stringify(patient));
				console.log('practitioner: ' + JSON.stringify(practitioner));

				context.patient = defaultPatient();
				context.patient.id = patient.id;
				context.patient.mrn = patient.id;
				var identifiers = patient.identifier;

				if (identifiers !== undefined) {
					for (var j = 0; j < identifiers.length; j++) {
						if (identifiers[j].type.coding !== undefined
							 && identifiers[j].type.coding.length > 0
							 && identifiers[j].type.coding[0].code == "MR"
							 && identifiers[j].type.text.search(/^MRN$/i) !== -1) {
							context.patient.mrn = identifiers[j].value;
						}
					}
				}

				practitioner = practitioner.data;
				context.practitioner.id = practitioner.id;
				context.practitioner.npi = practitioner.id;
				identifiers = practitioner.identifier;

				if (identifiers !== undefined) {
					for (var i = 0; i < identifiers.length; i++) {
						if (identifiers[i].type.coding !== undefined
							 && identifiers[i].type.coding.length > 0
							 && identifiers[i].type.coding[0].code == "PRN"
							 && identifiers[i].type.text.search(/^National Provider Identifier$/i) !== -1) {
							context.practitioner.npi = identifiers[i].value;
						}
					}
				}

				ret.resolve(context);
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

	window.drawVisualization = function (context) {

		$('#holder').show();
		$('#patientId').html(context.patient.id);
		$('#mrn').html(context.patient.mrn);
		$('#practitionerId').html(context.practitioner.id);
		$('#npi').html(context.practitioner.npi);
	};

})(window);
