$( document ).on( "ready", function () {
	
	
	deviceTools();
	updateStatus();
	
	
	if ( refreshtime ) {
		console.log( "[Global][Refreshtime]" + refreshtime + "ms" );
		setInterval( function () {
			updateStatus();
		}, refreshtime );
	} else {
		console.log( "[Global][Refreshtime]Dont refresh" );
	}
	
	
} );


function updateStatus() {
	$( '#content .box_device:not(#all_off)' ).each( function ( key, box ) {
		
		var device_ip     = $( box ).data( "device_ip" );
		var device_id     = $( box ).data( "device_id" );
		var device_relais = $( box ).data( "device_relais" );
		var device_group  = $( box ).data( "device_group" );
		
		if ( !$( box ).hasClass( "updating" ) ) {
			
			console.log( "[Start][updateStatus]get status from " + $( box ).data( "device_ip" ) );
			
			if ( device_group === "multi" && device_relais > 1 ) {
				console.log( "[Start][updateStatus]skip multi " + $( box ).data( "device_ip" ) );
				return; //relais 1 will update all others
			}
			
			
			$( box ).addClass( "updating" );
			
			Sonoff.getStatus( device_ip, device_id, device_relais, function ( data ) {
				
				                  if ( data
				                       && !data.ERROR
				                       && !data.WARNING
				                       && data !== ""
				                       && data !== undefined
				                       && data.statusText === undefined ) {
					
					                  if ( device_group === "multi" ) {
						                  $( '#content .box_device[data-device_group="multi"][data-device_ip="' + device_ip + '"]' )
							                  .each( function ( key, groupbox ) {
								                  //TODO: make function to set image
								                  var img = $( groupbox ).find( "img" );
								                  var src = _RESOURCESURL_ + "img/device_icons/"
								                            + img.data( "icon" )
								                            + "_%pw.png?v=160";
								
								                  var device_relais = $( groupbox ).data( "device_relais" );
								                  var device_status = Sonoff.parseDeviceStatus( data, device_relais );
								
								                  console.log( device_status.toLowerCase() );
								                  src = src.replace( "%pw", device_status.toLowerCase() );
								                  img.attr( "src", src ).parent().removeClass( "animated" );
								                  updateBox( $( groupbox ), data, device_status );
								                  $( groupbox ).removeClass( "error" ).find( ".animated" ).removeClass( "animated" );
								                  $( groupbox ).removeClass( "updating" );
							                  } );
					                  } else {
						                  var img = $( box ).find( "img" );
						                  var src = _RESOURCESURL_ + "img/device_icons/"
						                            + img.data( "icon" )
						                            + "_%pw.png?v=160";
						
						                  var device_status = Sonoff.parseDeviceStatus( data, 1 );
						
						                  console.log( "device_status", device_status );
						                  if ( device_status !== undefined ) {
							                  src = src.replace( "%pw", device_status.toLowerCase() );
							                  img.attr( "src", src ).parent().removeClass( "animated" );
							
							                  console.log( "$( box )", $( box ) );
							                  if ( device_status === "NONE" ) {
								                  //$( box ).attr( "data-device_group", "sensor" );
								                  $( box ).data( "device_group", "sensor" );
							                  }
						                  }
						                  updateBox( $( box ), data, device_status );
						                  $( box ).removeClass( "error" ).find( ".animated" ).removeClass( "animated" );
						                  $( box ).removeClass( "updating" );
					                  }
					
					
				                  } else {
					                  console.log( "ERROR => " + JSON.stringify( data ) );
					
					
					                  if ( device_group === "multi" ) {
						                  $( '#device-list tbody tr[data-device_group="multi"][data-device_ip="' + device_ip + '"]' )
							                  .each( function ( key, groupbox ) {
								                  $( groupbox ).addClass( "error" ).find( ".animated" ).removeClass( "animated" );
								                  $( groupbox ).removeClass( "updating" );
								                  var img = $( groupbox ).find( "img" );
								                  var src = _RESOURCESURL_ + "img/device_icons/"
								                            + img.data( "icon" )
								                            + "_error.png?v=160";
								                  img.attr( "src", src );
							                  } );
					                  } else {
						                  $( box ).addClass( "error" ).find( ".animated" ).removeClass( "animated" );
						                  $( box ).removeClass( "updating" );
						                  var img = $( box ).find( "img" );
						                  var src = _RESOURCESURL_ + "img/device_icons/"
						                            + img.data( "icon" )
						                            + "_error.png?v=160";
						                  img.attr( "src", src );
					                  }
				                  }
				                  //console.log( result );
				
			                  }
			);
		}
	} );
	
	
};

function deviceTools() {
	$( '#content .box_device:not(#all_off)' ).on( "click", function ( e ) {
		e.preventDefault();
		
		var device_box    = $( this );
		var device_ip     = device_box.data( "device_ip" );
		var device_id     = device_box.data( "device_id" );
		var device_relais = device_box.data( "device_relais" );
		var device_group  = device_box.data( "device_group" );
		
		if ( device_group === "sensor" ) {
			console.log( "[Start][updateStatus]skip sensor " + $( box ).data( "device_ip" ) );
			return; //relais 1 will update all others
		}
		
		if ( $( this ).hasClass( "toggled" ) ) {
			console.log( "[Start][updateStatus]is toggling " + $( box ).data( "device_ip" ) );
			return;
		}
		$( this ).addClass( "toggled" );
		device_box.find( "img" ).shake( 3, 5, 500 );
		
		Sonoff.toggle( device_ip, device_id, device_relais, function ( data ) {
			if ( data && !data.ERROR && !data.WARNING ) {
				var img = device_box.find( "img" );
				var src = _RESOURCESURL_ + "img/device_icons/" + img.data( "icon" ) + "_%pw.png?v=160";
				
				var device_status = Sonoff.parseDeviceStatus( data, device_relais );
				
				if ( device_status !== undefined ) {
					src = src.replace( "%pw", device_status.toLowerCase() );
					img.attr( "src", src );
				}
				img.parent().removeClass( "animated" );
				device_box.removeClass( "error" );
			} else {
				device_box.addClass( "error" );
				var img = device_box.find( "img" );
				var src = _RESOURCESURL_ + "img/device_icons/" + img.data( "icon" ) + "_error.png?v=160";
				img.attr( "src", src ).parent().removeClass( "animated" );
				console.log( "[Start][toggle]ERROR "
				             + device_ip
				             + " => "
				             + data.ERROR
				             || "Unknown Error" );
			}
			$( '#content .box_device' ).removeClass( "toggled" );
			
		} );
		
		
	} );
	
	$( "#all_off" ).on( "click", function ( e ) {
		e.preventDefault();
		$( '#content .box_device:not(#all_off)' ).each( function ( key, box ) {
			var device_ip     = $( box ).data( "device_ip" );
			var device_id     = $( box ).data( "device_id" );
			var device_relais = $( box ).data( "device_relais" );
			var device_group  = $( box ).data( "device_group" );
			
			
			console.log( "[Start][updateStatus]get status from " + $( box ).data( "device_ip" ) );
			
			if ( device_group === "multi" && device_relais > 1 ) {
				console.log( "[Start][updateStatus]skip multi " + $( box ).data( "device_ip" ) );
				return; //relais 1 will update all others
			}
			if ( device_group === "sensor" ) {
				console.log( "[Start][updateStatus]skip sensor " + $( box ).data( "device_ip" ) );
				return; //relais 1 will update all others
			}
			
			
			Sonoff.off( device_ip, device_id, device_relais, function ( data ) {
				if ( data && !data.ERROR && !data.WARNING ) {
					var img = $( box ).find( "img" );
					var src = _RESOURCESURL_ + "img/device_icons/" + img.data( "icon" ) + "_%pw.png?v=160";
					
					var device_status = Sonoff.parseDeviceStatus( data, device_relais );
					
					if ( device_status !== undefined ) {
						src = src.replace( "%pw", device_status.toLowerCase() );
						img.attr( "src", src );
					}
					img.parent().removeClass( "animated" );
					$( box ).removeClass( "error" );
				} else {
					$( box ).addClass( "error" );
					var img = device_box.find( "img" );
					var src = _RESOURCESURL_ + "img/device_icons/" + img.data( "icon" ) + "_error.png?v=160";
					img.attr( "src", src ).parent().removeClass( "animated" );
					console.log( "[Start][toggle]ERROR "
					             + device_ip
					             + " => "
					             + data.ERROR
					             || "Unknown Error" );
				}
				
			} );
		} );
		
	} );
}


function updateBox( row, data, device_status ) {
	
	var version = parseVersion( data.StatusFWR.Version );
	console.log( "version => " + version );
	
	if ( version >= 510009 ) {//no json translations since 5.10.0j
		var rssi   = data.StatusSTS.Wifi.RSSI;
		var ssid   = data.StatusSTS.Wifi.SSId;
		var uptime = data.StatusSTS.Uptime;
	} else { //try german else use english
		var rssi   = data.StatusSTS.WLAN ? data.StatusSTS.WLAN.RSSI : data.StatusSTS.Wifi.RSSI;
		var ssid   = data.StatusSTS.WLAN ? data.StatusSTS.WLAN.SSID : data.StatusSTS.Wifi.SSId;
		var uptime = data.StatusSTS.Laufzeit !== "undefined" ? data.StatusSTS.Laufzeit : data.StatusSTS.Uptime;
		//console.log( uptime );
	}
	
	var infoBoxCounter = 1;
	
	//var fakeData = JSON.parse(
	//	"{\"StatusSNS\":{\"Time\":\"2018-02-10T22:46:34\",\"BMP280\":{\"Temperature\":80.9,\"Pressure\":984.4}}}" );
	
	var temp = getTemp( data, ", " );
	
	if ( temp !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( temp ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	var humidity = getHumidity( data, ", " );
	
	if ( humidity !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( humidity ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	var pressure = getPressure( data, ", " );
	
	if ( pressure !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( pressure ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	
	
	var seapressure = getSeaPressure( data, ", " );
	
	if ( seapressure !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( seapressure ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	
	var distance = getDistance( data, ", " );
	
	if ( distance !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( distance ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	
	
	var energyPower = getEnergyPower( data, ", " );
	
	if ( energyPower !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( energyPower ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	
	//var energyTodayYesterday = getEnergyTodayYesterday( data );
	//
	//if ( energyTodayYesterday !== "" ) {
	//	$( row )
	//		.find( ".info-" + infoBoxCounter + " span" )
	//		.html( energyTodayYesterday )
	//		.parent()
	//		.removeClass( "hidden" );
	//	infoBoxCounter++;
	//}
	
	var gas = getGas( data, ", " );
	
	if ( gas !== "" ) {
		$( row ).find( ".info-" + infoBoxCounter + " span" ).html( gas ).parent().removeClass( "hidden" );
		infoBoxCounter++;
	}
	
	
	var idx = (
		data.idx ? data.idx : ""
	);
	if ( idx !== "" ) {
		$( row ).find( ".idx span" ).html( idx );
		$( "#device-list .idx" ).removeClass( "hidden" ).show();
	}
	
	$( row ).find( ".version span" ).html( data.StatusFWR.Version );
	
	if ( device_status === "ON" ) {
		$( row ).find( ".status" ).find( "input" ).prop( "checked", "checked" ).parent().removeClass( "error" );
	} else {
		$( row ).find( ".status" ).find( "input" ).removeProp( "checked" ).parent().removeClass( "error" );
	}
	$( row ).find( ".rssi span" ).html( rssi + "%" ).attr( "title", ssid );
	$( row ).find( ".runtime span" ).html( "~" + uptime + "h" );
	
	
	//MORE
	$( row ).find( ".hostname span" ).html( data.StatusNET.Hostname !== undefined ? data.StatusNET.Hostname : "?" );
	$( row ).find( ".mac span" ).html( data.StatusNET.Mac !== undefined ? data.StatusNET.Mac : "?" );
	$( row ).find( ".mqtt span" ).html( data.StatusMQT !== undefined ? "1" : "0" );
	$( row ).find( ".poweronstate span" ).html( data.Status.PowerOnState
	                                            !== undefined
	                                            ? data.Status.PowerOnState
	                                            : "?" );
	$( row ).find( ".ledstate span" ).html( data.Status.LedState !== undefined ? data.Status.LedState : "?" );
	$( row ).find( ".savedata span" ).html( data.Status.SaveData !== undefined ? data.Status.SaveData : "?" );
	$( row ).find( ".sleep span" ).html( data.StatusPRM.Sleep !== undefined ? data.StatusPRM.Sleep + "ms" : "?" );
	$( row ).find( ".bootcount span" ).html( data.StatusPRM.BootCount !== undefined ? data.StatusPRM.BootCount : "?" );
	$( row ).find( ".savecount span" ).html( data.StatusPRM.SaveCount !== undefined ? data.StatusPRM.SaveCount : "?" );
	$( row ).find( ".log span" ).html( (
		                                   data.StatusLOG.SerialLog !== undefined ? data.StatusLOG.SerialLog : "?"
	                                   )
	                                   + "|"
	                                   + (
		                                   data.StatusLOG.WebLog !== undefined ? data.StatusLOG.WebLog : "?"
	                                   )
	                                   + "|"
	                                   + (
		                                   data.StatusLOG.SysLog !== undefined ? data.StatusLOG.SysLog : "?"
	                                   ) );
	$( row ).find( ".wificonfig span" ).html( data.StatusNET.WifiConfig
	                                          !== undefined
	                                          ? data.StatusNET.WifiConfig
	                                          : "?" );
	$( row ).find( ".vcc span" ).html( data.StatusSTS.Vcc !== undefined ? data.StatusSTS.Vcc + "V" : "?" );
	
	
	$( row ).removeClass( "updating" );
}
