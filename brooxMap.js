broox.map = {};
broox.map.bounds = undefined;
broox.map.canvas = undefined;
broox.map.canvasID = 'brooxMap';
broox.map.latLng = undefined;
broox.map.locationLatTolerance = 0.001;
broox.map.locationLngTolerance = 0.001;
broox.map.infoWindow = undefined;
broox.map.infoWindows = [];

broox.map.moved = false;
broox.map.ignore_movement = true;
broox.map.latestMarker = null;

broox.map.checkInPath = [];
broox.map.checkInMarkers = [];
broox.map.checkInPolylines = [];
broox.map.checkInPathColor = '0066CC'; //FF776B;

broox.map.trailPath = [];
broox.map.trailMarkers = [];
broox.map.trailPolylines = [];
broox.map.trailPathColor = 'B10000';

broox.map.markerColor = broox.map.checkInPathColor;
broox.map.markerIndex = 0;

broox.map.initialize = function() {
  if (this.canvas === undefined) {
    this.infoWindow = new google.maps.InfoWindow({ content: 'Finding broox...' });

    this.latLng = new google.maps.LatLng(37.7756, -122.41941);
    var options = {
      'zoom': 1,
      'center': this.latLng,
      'mapTypeId': google.maps.MapTypeId.TERRAIN,
      'mapTypeControl': true,
      'mapTypeControlOptions': {
        'style':google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        'position':google.maps.ControlPosition.LEFT_BOTTOM },
      'navigationControl': true,
      'navigationControlOptions': {
        'style': google.maps.NavigationControlStyle.SMALL,
        'position': google.maps.ControlPosition.RIGHT_BOTTOM
      }
    };
    this.canvas = new google.maps.Map(document.getElementById(this.canvasID), options);
    this.bounds = new google.maps.LatLngBounds();
  }

  google.maps.event.addListener(this.canvas, 'bounds_changed', function() {
    if (broox.map.ignore_movement) {
      broox.log('ignoring movement');
      return;
    }

    broox.map.moved = true;
    broox.log('map moved!');
  });

  broox.map.fetchLocation();

  // Refresh every 1 minute
  window.setInterval("broox.map.refreshLocation()",60000);

  $('.hideStream').click(function() {
    $('#brooxStream').hide();
  });
};

broox.map.addStreamButton = function() {
  broox.log('addStreamButton');
  var buttonDiv = document.createElement('div');
  buttonDiv.style.padding = '5px 5px 0 0';

  var buttonUI = document.createElement('DIV');
  buttonUI.style.backgroundColor = 'white';
  buttonUI.style.borderStyle = 'solid';
  buttonUI.style.borderWidth = '1px';
  buttonUI.style.cursor = 'pointer';
  buttonUI.style.textAlign = 'center';
  buttonUI.title = 'Click to set the map to Home';
  buttonUI.id = 'streamButton';
  buttonDiv.appendChild(buttonUI);

  var controlText = document.createElement('DIV');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.style.borderStyle = 'solid';
  controlText.style.borderWidth = '1px';
  controlText.style.borderTopColor = '#707070';
  controlText.style.borderLeftColor = '#707070';
  controlText.style.borderBottomColor = '#D0D0D0';
  controlText.style.borderRightColor = '#D0D0D0';
  controlText.innerHTML = '<b>Toggle Stream</b>';
  buttonUI.appendChild(controlText);

  google.maps.event.addDomListener(buttonUI, 'click', function() {
    if ($('#brooxStream').is(':visible')) {
      $('#brooxStream').hide();
      //controlText.innerHTML = '<b>View Stream</b>';
    } else {
      $('#brooxStream').show();
      //controlText.innerHTML = '<b>Hide Stream</b>';
    }
  });

  buttonDiv.index = 2;
  broox.map.canvas.controls[google.maps.ControlPosition.TOP].push(buttonDiv);
};

broox.map.addRefreshButton = function() {
  broox.log('addRefreshButton');
  var buttonDiv = document.createElement('div');
  buttonDiv.style.padding = '5px 5px 0 0';

  var buttonUI = document.createElement('DIV');
  buttonUI.style.backgroundColor = 'white';
  buttonUI.style.borderStyle = 'solid';
  buttonUI.style.borderWidth = '1px';
  buttonUI.style.cursor = 'pointer';
  buttonUI.style.textAlign = 'center';
  buttonUI.title = 'Click to set the map to Home';
  buttonDiv.appendChild(buttonUI);

  var controlText = document.createElement('DIV');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.style.borderStyle = 'solid';
  controlText.style.borderWidth = '1px';
  controlText.style.borderTopColor = '#707070';
  controlText.style.borderLeftColor = '#707070';
  controlText.style.borderBottomColor = '#D0D0D0';
  controlText.style.borderRightColor = '#D0D0D0';
  controlText.innerHTML = '<b>Refresh</b>';
  buttonUI.appendChild(controlText);

  google.maps.event.addDomListener(buttonUI, 'click', function() {
    $('#brooxStream li').remove();
    broox.map.refreshLocation();
  });

  buttonDiv.index = 1;
  broox.map.canvas.controls[google.maps.ControlPosition.TOP].push(buttonDiv);
};

broox.map.createMarker = function(point,checkIns,html) {
  broox.log('createMarker');
  var marker,
      icon,
      listener,
      letter = this.markerIndex.toString();

  if (this.markerIndex > 0) {
    var image = new google.maps.MarkerImage('/circleMarker0066CC.png',
      new google.maps.Size(8,8),
      new google.maps.Point(0,0),
      new google.maps.Point(4,4));

    marker = new google.maps.Marker({ 'position':point,
                                      'icon':image,
                                      'title':letter+' checkins ago' });
  } else {
    // Current location
    var faceImage = new google.maps.MarkerImage('/faceMarker.png',
      new google.maps.Size(44,56),
      new google.maps.Point(0,0),
      new google.maps.Point(22,54));

    var faceShadow = new google.maps.MarkerImage('/faceMarkerShadow.png',
      new google.maps.Size(67,42),
      new google.maps.Point(0,0),
      new google.maps.Point(22,40));

    marker = new google.maps.Marker({ 'position':point,
                                      'icon':faceImage,
                                      'shadow':faceShadow,
                                      'title':'broox was last seen here!' });

    this.latestMarker = marker;
  }

  marker.setMap(this.canvas);
  this.bounds.extend(marker.getPosition());

  marker.infoWindow = new google.maps.InfoWindow({ 'content':html,
                                                   'maxWidth':400 });
  listener = google.maps.event.addListener(marker, 'click', function() {
    broox.map.closeInfoWindows();
    marker.infoWindow.open(broox.map.canvas, this);
  });

  for(var i in checkIns) {
    $('li[rel='+checkIns[i].id+']').click(function() {
      broox.map.closeInfoWindows();
      marker.infoWindow.open(broox.map.canvas,marker);
    });
    broox.map.infoWindows[checkIns[i].id] = marker.infoWindow;
  }

  this.checkInMarkers.push(marker);
  this.fitAndCenter();
  this.markerIndex++;
};

broox.map.fitAndCenter = function() {
  if (this.moved && this.latestMarker !== null) {
    broox.log("Map has moved. Pan to current location.");
    this.canvas.panTo(this.latestMarker.getPosition());
    return;
  }

  this.ignore_movement = true;
  this.canvas.fitBounds(this.bounds);
  this.canvas.setCenter(this.bounds.getCenter());
};

broox.map.drawPath = function(points, pathType) {
  broox.log('drawPath');
  var path,
      lastPoint = points[0],
      legs = points.length,
      minOpacity = 0.1,
      opacity = 1.0,
      opacityChange = (opacity - minOpacity) / legs,
      minWidth = 1,
      width = 5,
      widthChange = (width - minWidth) / legs,
      strokeColor = pathType == 'trail'
                  ? '#'+broox.map.trailPathColor
                  : '#'+broox.map.checkInPathColor;

  points.shift();

  for (var point in points) {
    //if 2 points are the same, don't draw them.
    if (points[point].lat() == lastPoint.lat() && points[point].lng() == lastPoint.lng()) {
      broox.log('points are the same');
      opacity -= opacityChange;
      width -= widthChange;
      continue;
    }

    path = new google.maps.Polyline({
      'path'         : [lastPoint,points[point]],
      'strokeColor'  : strokeColor,
      'strokeOpacity': opacity,
      'strokeWeight' : width,
      'geodisc'      : true
    });
    path.setMap(this.canvas);

    if (pathType == 'trail')
      this.trailPolylines.push(path);
    else
      this.checkInPolylines.push(path);

    opacity  -= opacityChange;
    width    -= widthChange;
    lastPoint = points[point];
  }
};

broox.map.locationText = function(location) {
  var locationText = '',
       locationParts = [],
       address = '';

    if (!location)
      return '';

    if (location.address) {
      address = location.address.trim();
      locationParts.push(address);
    }

    if (location.city) {
      locationParts.push(location.city);
    }

    if (location.state) {
      locationParts.push(location.state);
    }

    if (location.country && !broox.inArray(location.country,['US','USA','United States']))
      locationParts.push(location.country);

    //if (address == '' && location.trim() != '')
    //  location = location;

    locationText = locationParts.join(', ');

    if (locationText.trim() == '')
      return 'at ' + location.latitude + ', ' + location.longitude;

    if (address == '')
      return 'in ' + locationText;

    return 'at ' + locationText;
};

broox.map.createStream = function(checkIns) {
  broox.log('createStream');
  var location = '',
      address,
      html,
      minOpacity = 0.0,
      opacity = 1.0,
      opacityChange = (opacity - minOpacity) / this.checkInCount,
      lastOpacity;
  
  for (i in checkIns) {
    var checkIn = checkIns[i];
    location = broox.map.locationText(checkIn.location);
    html = '<li style="opacity:'+opacity+'" rel="'+checkIn.id+'">' +
             '<h2>' +
               '<span class="location">'+location+'</span> ' +
               '<span class="time">'+checkIn.relativeTime+'</span>' +
             '</h2>' +
             '<p>' + checkIn.text + '</p>' +
           '</li>';
    $('#brooxStream ul').append(html);
    opacity -= opacityChange;
  }
  
  $('#brooxStream li').hover(function() {
    lastOpacity = $(this).css('opacity');
    $(this).css('opacity','1.0');
    
    //TODO: set top border and set previous LI or ULs bottom border to nothing
  },function() {
    $(this).css('opacity',lastOpacity);
  });

/*
  $('#brooxStream li').click(function() {
    broox.map.closeInfoWindows();
    window.console.log(broox.map.infoWindows[$(this).attr('rel')]);
    window.console.log(broox.map.infoWindows[$(this).attr('rel')].getPosition());
    broox.map.infoWindows[$(this).attr('rel')].open(broox.map.canvas);
  });
*/
};

broox.map.closeInfoWindows = function() {
  broox.log('closeInfoWindows');
  for (var i in broox.map.infoWindows) {
    broox.map.infoWindows[i].close();
  }
};

broox.map.hideCheckIns = function() {
  for(var i=0; i < this.checkInMarkers.length; i++){
    this.checkInMarkers[i].setMap(null);
  }
  for(var i=0; i < this.checkInPolylines.length; i++){
    this.checkInPolylines[i].setMap(null);
  }  
};

broox.map.showCheckIns = function() {
  broox.log('showCheckIns');
  for(var i=0; i < this.checkInMarkers.length; i++){
    this.checkInMarkers[i].setMap(broox.map.canvas);
  }
  for(var i=0; i < this.checkInPolylines.length; i++){
    this.checkInPolylines[i].setMap(broox.map.canvas);
  }
};

broox.map.hideTrail = function() {
  for(var i=0; i < this.trailMarkers.length; i++){
    this.trailMarkers[i].setMap(null);
  }
  for(var i=0; i < this.trailPolylines.length; i++){
    this.trailPolylines[i].setMap(null);
  }
}

broox.map.showTrail = function() {
  for(var i=0; i < this.trailMarkers.length; i++){
    this.trailMarkers[i].setMap(broox.map.canvas);
  }
  for(var i=0; i < this.trailPolylines.length; i++){
    this.trailPolylines[i].setMap(broox.map.canvas);
  }
}

broox.map.clearCheckIns = function() {
  broox.log('clearCheckIns');
  this.hideCheckIns();
  this.markerIndex = 0;
  this.checkInPath = new Array();
  this.checkInMarkers = new Array();
  this.checkInPolylines = new Array();
};

broox.map.clearTrail = function() {
  this.hideTrail();
  this.markerIndex = 0;
  this.trailPath = new Array();
  this.trailMarkers = new Array();
  this.trailPolylines = new Array();
};

broox.map.clear = function() {
  broox.log('clear');
  this.clearCheckIns();
  //this.clearTrail();
};

broox.map.fetchLocation = function() {
  broox.log('fetchLocation');
  this.fetchRecentCheckins();
  //this.fetchTrail(); 
};

broox.map.refreshLocation = function() {
  broox.log('refreshLocation');
  //this.clear();
  this.fetchLocation();
};

broox.map.fetchRecentCheckins = function() {
  broox.log('fetchRecentCheckins');
  $('.hideStream').fadeOut();
  $('img.pulse').fadeIn();
  $.getJSON('http://derek.broox.com/api/recentCheckins.jsonp?limit=5&callback=?', broox.map.processCheckins);
};

broox.map.fetchTrail = function() {
  $.getJSON('http://derek.broox.com/api/trail.jsonp?callback=?', broox.map.processTrail);
};

broox.map.checkInTime = function(mysqlDateTime) {
  var checkInDate = broox.dateFromMysql(mysqlDateTime),
      checkInHour = checkInDate.getHours(),
      checkInMeridiem = 'AM',
      checkInMinute = checkInDate.getMinutes();

  if (checkInHour >= 12) {
    checkInMeridiem = 'PM';
  }
  if (checkInHour === 0) {
    checkInHour = 12;
  }
  if (checkInHour > 12) {
    checkInHour = checkInHour - 12;
  }
  if (checkInMinute < 10) {
    checkInMinute = '0' + checkInMinute;
  }

  return checkInHour + ':' + checkInMinute + ' ' + checkInMeridiem;
};

// Trail is based off of automatic pings to my phone with Google Latitude, etc
broox.map.processTrail = function(points) {
  broox.log('processTrail');
  if (!points.length)
    return;

  var image = new google.maps.MarkerImage('/circleMarkerB10000.png',
              new google.maps.Size(8,8),
              new google.maps.Point(0,0),
              new google.maps.Point(4,4));

  for (var i = 0; i < points.length; i++) {
    var trailPoint = points[i],
        point = new google.maps.LatLng(trailPoint.latitude, trailPoint.longitude),
        marker = null;

    if (i === 0) {
        marker = new google.maps.Marker({ 'position' : point,
                                          'icon'     : image,
                                          'title'    : trailPoint.relativeTime });
        // circle = new google.maps.Circle({ 'strokeColor'   : '#000000',
        //                                   'strokeWeight'  : 2,
        //                                   'strokeOpacity' : 1,
        //                                   'fillColor'     : broox.map.trailPathColor,
        //                                   'fillOpacity'   : 1,
        //                                   'center'        : point,
        //                                   'radius'        : broox.map.canvas.getZoom() * 10,
        //                                   'map'           : broox.map.canvas,
        //                                   'zIndex'        : 1337 })

      marker.setMap(broox.map.canvas);
      broox.map.trailMarkers.push(marker);
    }

    broox.map.trailPath.push(point);
    broox.map.bounds.extend(point);
    broox.map.canvas.fitBounds(broox.map.bounds);
    broox.map.canvas.setCenter(broox.map.bounds.getCenter());
    $('img.pulse').fadeOut();
  }

  $('#lastTracked').html('<input type="checkbox" id="trailToggle" checked="checked"/><label for="trailToggle">Tracked ' + points[0].relativeTime + ' ' + broox.map.locationText(points[0]) + '</label>').show();
  $('#trailToggle').click(function() {
    if ($(this).is(':checked'))
      broox.map.showTrail();
    else
      broox.map.hideTrail();
  });

  broox.map.drawPath(broox.map.trailPath, 'trail');
};

// CheckIns are based off of manual CheckIns, Tweets, and Photos
broox.map.processCheckins = function(checkIns) {
  //try to combine any posts at the same location
  broox.log('processCheckins');

  var point,
      nearbyLocation,
      combinedLocations = [];

  broox.map.clearCheckIns();

  broox.map.checkInCount = checkIns.length;
  for(var i in checkIns) {
    nearbyLocation = false;
    var checkIn = checkIns[i];

    //build text
    if (checkIn.attachedType == 'Twitter' || checkIn.attachedType == 'Tweet') {
      checkIn.text = checkIn.status.text;
      checkIn.via = 'via Twitter';

    } else if (checkIn.attachedType == 'Brightkite') {
      checkIn.text = 'Checked in';
      if (checkIn.location.name.length > 0) {
        checkIn.text += ' at ' + checkIn.location.name;
      } else if (checkIn.location.address.length > 0) {
        checkIn.text += ' at ' + checkIn.location.address;
      }
      checkIn.via = 'via Brightkite';

    } else if (checkIn.attachedType == 'Foursquare') {
      checkIn.text = 'Checked in';
      if (checkIn.location.name.length > 0) {
        checkIn.text += ' at ' + checkIn.location.name;
      }
      checkIn.via = 'via Foursquare';

    } else if (checkIn.attachedType == 'Photo') {
      checkIn.text = '<img src="' + checkIn.photo.thumbnail + '" height="100"/>';
      checkIn.text += checkIn.photo.description;
      if (checkIn.location.name.length) {
        checkIn.text += ' at ' + checkIn.location.name;
      }
      checkIn.text += '<br class="clear"/>';
      checkIn.via = 'via derek.broox.com';

    }

    //try to find a nearby checkin to pair this with
    for(var i in combinedLocations) {
      var existingLatitude = combinedLocations[i].latitude,
          existingLongitude = combinedLocations[i].longitude,
          newLatitude = parseFloat(checkIn.location.latitude),
          newLongitude = parseFloat(checkIn.location.longitude);

      if (Math.abs(existingLatitude - newLatitude) < broox.map.locationLatTolerance &&
          Math.abs(existingLongitude - newLongitude) < broox.map.locationLngTolerance) {

        combinedLocations[i].latitude = (existingLatitude + newLatitude) / 2;
        combinedLocations[i].longitude = (existingLongitude + newLongitude) / 2;
        combinedLocations[i].checkIns.push(checkIn);

        //update old check in path coordinates to new combinedLocation coordinates
        point = new google.maps.LatLng(combinedLocations[i].latitude, combinedLocations[i].longitude);
        for(var i in broox.map.checkInPath) {
          if (broox.map.checkInPath[i].b == existingLatitude && broox.map.checkInPath[i].c == existingLongitude) {
            broox.map.checkInPath[i].b = point.b;
            broox.map.checkInPath[i].c = point.c;
          }
        }
        broox.map.checkInPath.push(point);

        nearbyLocation = true;
        break;
      }
    }

    if (!nearbyLocation) {
      combinedLocations.push({
        latitude:parseFloat(checkIn.location.latitude),
        longitude:parseFloat(checkIn.location.longitude),
        checkIns:[checkIn]
      });
      point = new google.maps.LatLng(checkIn.location.latitude, checkIn.location.longitude);
      broox.map.checkInPath.push(point);
    }
  }

  //broox.map.createStream(checkIns);
  broox.map.drawPath(broox.map.checkInPath,'checkIns');

  //add points to the map
  for(var location in combinedLocations) {
    var checkInHTML = '';
    //TODO: consider adding these as tabs?
    for(var c in combinedLocations[location].checkIns) {
      var checkIn = combinedLocations[location].checkIns[c];

      var checkInDate = broox.dateFromMysql(checkIn.checkedInAt),
          checkInHour = checkInDate.getHours(),
          checkInMeridiem = 'AM',
          checkInMinute = checkInDate.getMinutes();
      if (checkInHour >= 12) {
        checkInMeridiem = 'PM';
      }
      if (checkInHour == 0) {
        checkInHour = 12;
      }
      if (checkInHour > 12) {
        checkInHour = checkInHour - 12;
      }
      if (checkInMinute < 10) {
        checkInMinute = '0' + checkInMinute;
      }
      $('#brooxBubble h6').text(checkInHour + ':' + checkInMinute + ' ' + checkInMeridiem);

        $('#brooxBubble p').html(checkIn.text);
        $('#brooxBubble span').text(checkIn.via);

      //$('#brooxBubble p').append('<br/>'+checkIn.location.latitude+','+checkIn.location.longitude);
      checkInHTML += $('#brooxBubble').html();
    }
    point = new google.maps.LatLng(combinedLocations[location].latitude, combinedLocations[location].longitude);
    broox.map.createMarker(point,combinedLocations[location].checkIns,'<div class="brooxBubbleContent"><h6>&nbsp;</h6><div>'+checkInHTML+'</div></div>');
    //TODO: need to somehow add this info window to our checkin so that we can open it from the stream.
    $('img.pulse').fadeOut();
    $('.hideStream').fadeIn();
  }

  //var checkInHTML = ['<input type="checkbox" id="checkInToggle" checked="checked"/>',
  var checkInHTML = ['<label for="checkInToggle">Checked in ',
                     checkIns[0].relativeTime,
                     ' ',
                     broox.map.locationText(checkIns[0].location),
                     '</label>'];

  $('#lastCheckIn').html(checkInHTML.join('')).show();
  $('#checkInToggle').click(function() {
    if ($(this).is(':checked'))
      broox.map.showCheckIns();
    else
      broox.map.hideCheckIns();
  });
  broox.map.ignore_movement = false;
};
