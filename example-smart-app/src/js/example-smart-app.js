var NPI = "";
var MRN = "";

(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart) {
    	console.log('smart: ' + JSON.stringify(smart));
    	
        $('#fhirid').html(smart.tokenResponse.patient);

        var patient = smart.patient;
        var pt = patient.read();
      
        var practObj = {};
        practObj.type = "Practitioner";
        practObj.id = "605926"; // smart.tokenResponse.user;

        smart.api.read( practObj ).then( (pract) => {
              var identifiers = pract.data.identifier;
          
              for( var i=0 ; i<identifiers.length ; i++ )
              {
                if( identifiers[i].type.coding[0].code == "PRN" )
                {
                  NPI = identifiers[i].value;
                  $('#pract').html( identifiers[i].value );
                  if( MRN != "" && NPI != "" )
                  {
//                    window.location = "http://localhost:1080/cernercontext/?partnerId=999999999999999-9999999999999" + 
//                    "&mrn=" + MRN + "&npi=" + NPI ;                 
                  }                  
                }
              }
        })

        $.when(pt).fail(onError);
        $.when(pt).done(function (patient) {

          var p = defaultPatient();
          p.id = patient.id;
          var identifiers = patient.identifier;
          
          for( var j=0 ; j<identifiers.length ; j++ )
          {
            if( identifiers[j].type.coding[0].code == "MR" )
            {
               MRN = identifiers[j].value;
               $('#mrn').html( identifiers[j].value );
               if( MRN != "" && NPI != "" )
               {
//                 window.location = "http://localhost:1080/cernercontext/?partnerId=999999999999999-9999999999999" + 
//                  "&mrn=" + MRN + "&npi=" + NPI ;                         
               }
            }
          }          

          ret.resolve(p);
        });
    }

    FHIR.oauth2.ready(onReady, onError);

    return ret.promise();
  };

  function defaultPatient(){
    return {
      id: {value: ''},
      mrn: {value: ''},
    };
  }

  window.drawVisualization = function(p) {

    $('#holder').show();
    $('#fhirid').html(p.id);
    $('#mrn').html(p.mrn);
  };

})(window);
