(function(window) {
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart) {
    	console.log('smart: ' + JSON.stringify(smart));
    	
//        $('#fhirid').html(smart.tokenResponse.patient);

        var patient = smart.patient;
        var pt = patient.read();
      
        var practObj = {};
        practObj.type = "Practitioner";
        practObj.id = "605926"; // smart.tokenResponse.user;
        $('#userId').html(smart.tokenResponse.user);
        
        var pract = smart.api.read( practObj );

        $.when(pt, pract).fail(onError);
        $.when(pt, pract).done(function (patient, practitioner) {

          var pt = defaultPatient();
          pt.id = patient.id;
          var identifiers = patient.identifier;
          
          for( var j=0 ; j<identifiers.length ; j++ )
          {
            if( identifiers[j].type.coding !== undefined
            	&& identifiers[j].type.coding.length > 0
            	&& identifiers[j].type.coding[0].code == "MR" )
            {
               pt.mrn = identifiers[j].value;
            }
          }          

          var pract = {};
          pract.id = practitioner.id;
          pract.npi = "";
          identifiers = practitioner.data.identifier;
          
          for( var i=0 ; i<identifiers.length ; i++ )
          {
              if( identifiers[i].type.coding !== undefined
        		  && identifiers[i].type.coding.length > 0
        		  && identifiers[i].type.coding[0].code == "PRN" )
              {
            	  pract.npi = identifiers[i].value;
              }
          }

          if( pt.mrn != "" && pract.npi != "" )
          {
        	  var url = "http://localhost:1080/cernercontext/?partnerId=999999999999999-9999999999999&mrn=" + pt.mrn + "&npi=" +pract.npi;
        	  window.location = url;
        	  console.log('launch Mirth Cerner Context channel: ' + url);
          }

          ret.resolve(pt, pract);
        });
    }

    FHIR.oauth2.ready(onReady, onError);

    return ret.promise();
  };

  function defaultPatient() {
    return {
      id: {value: ''},
      mrn: {value: ''},
    };
  }

  window.drawVisualization = function(pt, pract) {

    $('#holder').show();
    $('#patientId').html(pt.id);
    $('#mrn').html(pt.mrn);
    $('#npi').html(pract.npi);
  };

})(window);
