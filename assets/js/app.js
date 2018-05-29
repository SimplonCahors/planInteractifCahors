$(document).ready(function() {

    $('.sidenav').sidenav({
        edge: 'right',
        onOpenStart: function onOpen(el) {
            $('.sidenav-trigger').find('i').html('keyboard_arrow_right');
            $('.sidenav-close').css('display', 'block');
        },
        onCloseEnd: function onClose(el) {
            $('.sidenav-trigger').find('i').html('keyboard_arrow_left');
            $('.sidenav-close').css('display', 'none');
        }
    }).sidenav('open');

    $('.collapsible').collapsible();
    
    getDataJson();

});

// VARIABLES 
var markerGroup = L.featureGroup();
var corner1 = L.latLng(44.60904581939581,1.7481994628906252);
var corner2 = L.latLng(44.30714395830852,1.1295318603515627);
var bounds = L.latLngBounds(corner1, corner2);
var oldMarkers = [];

var map = L.map('mapid').setView([44.4581259,1.4387865], 14);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    minZoom: 6,
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYmlib3VuIiwiYSI6ImNqaGhvdTc1ZzAyYXIzZW5yN3ZnaThrdnMifQ.-m9db8kuRMAOEiSsdvQTQA'
}).addTo(map);
map.setMaxBounds(bounds);

function getDataJson() {
    $.ajax({
        dataType:"json",
        url:"dist/js/places.json",
        success:function(resultat,status) {
            GetInfoCategory(resultat);
        },
        error:function(resultat,status,error) {
            // console.log(error);
        },
        complete:function(resultat,status) {
            // console.log(status);
        }
    })
}

function GetInfoCategory(data) {
    var nav = document.getElementById("coll-nav");
    nav.innerHTML = '';

    data.forEach(element => {
        var elem = document.createElement("li");
        elem.style.backgroundColor = element.color;
        elem.style.color = "#FFF"
        var name = document.createElement("div");
        var sub = document.createElement("ul");
        sub.id = element.name;
        name.classList.add("collapsible-header");
        sub.classList.add("collapsible-body");
        name.innerHTML = '<i class="material-icons up">expand_less</i>'
        + '<i class="material-icons down">expand_more</i>'
        + element.name
        elem.appendChild(name);
        elem.appendChild(sub);
        nav.appendChild(elem); 
        GetSubCategory(element)

    });

}

function GetSubCategory(Parent) {
    Parent.children.forEach(element => {
        var relatif = document.getElementById(Parent.name); 

        var subCat = document.createElement("li");

        var link = document.createElement("a");
        link.setAttribute("visible","false");

        var name = document.createElement("p");
        name.innerHTML = element.name;

        var icon = createIcon(element);
        subCat.id = element.name;

        link.appendChild(icon);
        link.appendChild(name);
        subCat.appendChild(link);
        relatif.appendChild(subCat);

        link.addEventListener('click',function() {
            if(link.getAttribute("visible") === "false") {
                link.setAttribute("visible","true");
            }
            else {
                link.setAttribute("visible","false");
            }
            setPlacesFromSelectedSub(link,element,Parent)
        });
        

    });
}

function setPlacesFromSelectedSub(anchor,sub,parent) {
    var status = anchor.getAttribute("visible");
    if(status === "true") {
        anchor.style.color = parent.color;
        anchor.style.opacity = 1;
        addMarker(sub,parent);
    }
    else {
        anchor.style.color = "#272727";
        anchor.style.opacity = .5;
        removeMarker(sub,parent);
    }
}

function removeMarker(sub,parent) {
    var idToRemove =[];
    var toRemove = [];
    var enfant = sub.places;

    enfant.forEach(elem => {
        toRemove.push(elem.id)
    });

    oldMarkers.forEach( element => {
        toRemove.forEach( nameElem => {
            if(nameElem === element[1]) {
                idToRemove.push(element[0]);
            }
        });
    });

    idToRemove.forEach( id => {
        markerGroup.removeLayer(id);
        var idMark = oldMarkers.indexOf(id)
        oldMarkers.splice(idMark);
    });

}

function addMarker(sub,parent) {
    // ICON FOR MARKER 
    var color = parent.color;

    sub.places.forEach(element => {
        var markIcon = new L.divIcon({
            title:element.name,
            className:"test",
            html:'<svg fill="'+color+'" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="41px" height="41px" viewBox="0 0 485.213 485.212" style="enable-background:new 0 0 485.213 485.212;" xml:space="preserve">'
            +'<path d="M242.606,0C142.124,0,60.651,81.473,60.651,181.955c0,40.928,13.504,78.659,36.31,109.075l145.646,194.183L388.252,291.03   c22.808-30.416,36.31-68.146,36.31-109.075C424.562,81.473,343.089,0,242.606,0z M242.606,303.257   c-66.989,0-121.302-54.311-121.302-121.302c0-66.989,54.313-121.304,121.302-121.304c66.991,0,121.302,54.315,121.302,121.304   C363.908,248.947,309.598,303.257,242.606,303.257z">'
            +'</path>'
            +'<image class="marker-icon" href="./dist/img/'+sub.icon+'"  height="200" width="200" x="140" y="80"/>'
            +'</svg>'
        })

        var lat = element.lat;
        var long = element.lon;
        var marker = new L.marker([lat,long],{
            icon:markIcon
        }).addTo(markerGroup);

        marker.bindPopup("<b>"+element.name+"</b><br>"+element.description)
        oldMarkers.push([marker._leaflet_id,element.id]);
        markerGroup.addTo(map);
    });

    map.fitBounds(getCoordGroup(markerGroup));
}

function createIcon(sub) {
    var icon = document.createElement('img');
    icon.setAttribute("class","sub-icon");
    icon.setAttribute("src","./dist/img/"+sub.icon);
    return icon;

}

function getCoordGroup(group) {
    var obj = markerGroup.getBounds();
    return [[obj._northEast.lat, obj._northEast.lng], [obj._southWest.lat, obj._southWest.lng]];
}
