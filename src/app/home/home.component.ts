import { Component, OnInit, NgZone, Self, SkipSelf } from '@angular/core';
import{ Http , Response} from '@angular/http';
import { FormControl, FormGroup, NgForm, FormBuilder ,Validators} from '@angular/forms';
import { AuthService,FacebookLoginProvider,GoogleLoginProvider } from 'angular5-social-login';
import * as tokml from 'tokml';
import {saveAs as importedSaveAs} from "file-saver";
import {PlatformLocation } from '@angular/common';
import { DeleteMenu } from '../helper/vertaxmenu';
import 'rxjs/add/operator/toPromise';
// import {} from '@types/googlemaps';
declare var $: any;
declare var geoXML3:any;
declare var map;
declare var google;
declare var window;
declare var pako;
var icons = {
  url: "assets/icons/ic_marker.png",
  scaledSize: new google.maps.Size(40, 40),
};
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  EmptyDist:any = "";
  EmptyArea:any = "";
  user:any = "";
  cleanmap:any = ""; 
  viewkmlUrl:any = "";
  viewkmlFile:any = "";
  linecalType:any;
  areacalType:any;
  Fileview:any;
  markers:any;
  Vtype:any;
  marker:any;
  infowindow:any;
  markerconfirmwindow: any;
  UserPoints:any;
  UserDrawtype:any;
  map: any;
  sucMsg:any;
  errMsg:any;
  forMsg:any;
  fileerr:any;
  typeErr:any;
  uriErr:any;
  Dlatitude:any;
  Dlongitude:any;
  mapDefaultZoom:any = 17;
  clickedPoint:any;
  polygonPoint:any;
  coordinate:any;
  checkvalid:any;
  meter:any = 0;
  newArea:any = 0;
  area:any = 0;
  drawPolygon:any;
  // areadata:any;
  selectedColor:any = "#2A9C5B";
  allMarker:any = [];
  userAllFile:any = [];
  allFile:any = [];
  linedata:any;
  distancepoint:any = [];
  areapoint:any = [];
  polyLineArr: any = [];
  isAreaOnceCompleted: boolean = false;
  polyShape:any;
  checkFile:any = "";
  checkurl:any = "";
  suclogin:any = false;
  myParser:any = "";
  userlat:any;
  userlng:any;
  addMarker:any = 0;
  completePolyline:boolean = false;
  uploadtype:any = 'url';
  locationset: any = true;
  trashpoints: any = [];
  redopoints: any = [];
  latitude: any = '';
  longitude: any = '';
  loginemail: any = '';
  loginpassword: any = '';
  regfirstname: any = '';
  reglastname: any = '';
  regemail: any = '';
  regpassword: any = '';
  forgotemail: any = '';
  locationdegree: any = '';
  locationdegree1: any = '';
  locationminute: any = '';
  locationminute1: any = '';
  locationsecond: any = '';
  locationsecond1: any = '';
  freehandlayer: any;
  deleteMenu: any;
  whitespaceCharacters = [' ', '  ', '\b', '\t', '\n', '\v', '\f', '\r', `\"`, `\'`, `\\`, '\u0008', '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u0020','\u0022', '\u0027', '\u005C', '\u00A0', '\u2028', '\u2029', '\uFEFF'];
  constructor(
    private _ngzone:NgZone,
    public platformLocation: PlatformLocation,
    private socialAuthService: AuthService,
    private http:Http) {
      const self = this;
      window.closeinfowindow = function() {
        self.markerconfirmwindow.close()
      }
      self.deleteMenu = new DeleteMenu();
      $(document).on('click', '.vdelete', function(e){
        e.preventDefault();e.stopPropagation();
        self.deleteMenu.removeVertex(function(vertex){
          for(let i=0; i < self.trashpoints.length; i++) {
            if(self.trashpoints[i].point.lat() == vertex.lat() && self.trashpoints[i].point.lng() == vertex.lng()) {
              self.trashpoints.splice(i, 1);
              self.trashpoints.push({type: 'delete', point:vertex});
            }
          }
        });
        if(self.UserDrawtype === 'polyline') { 
          self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
        } else if (self.UserDrawtype === 'polygon') { 
          self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
        }
        self.calculation();
        return false;
      });
      $(document).on('click', '.vcancel', function(e){
        e.preventDefault();e.stopPropagation();self.deleteMenu.close();return false;
      });
    }
  ngOnInit() {  
      var self = this;
      if(localStorage.getItem('logintoken')){
        self.suclogin = true;
      }
      $('#map').hide();
      setTimeout(function(){
        $('#map').show();
        $('.splash').hide();
        // $('#verifyotp').modal('show');
      },1000);
      $('#totalMeter').attr('readonly', 'true');
      $.get("http://ip-api.com/json", function (response) {
      // $.get("https://ipinfo.io/json", function (response) {
        // var str = response.loc;
        // var location =  str.split(",");
        // self.userlat = parseInt(location[0]);
        // self.userlng = parseInt(location[1]);
        self.userlat = response.lat;
        self.userlng = response.lon;
        self.initMap(self.userlat,self.userlng);
      });
      $('.storedata').hide();
      $('.drawpoi').slideUp();
      $('#userregister').slideUp();
      $('#forgot').slideUp();
      $('.degreeDraw').slideUp(); 
      $('input[name="loginemail"],input[name="loginpassword"],input[name="regfirstname"],input[name="reglastname"],input[name="regemail"],input[name="regpassword"],input[name="femail"],input[name="filename"]').blur(function() {
        var $this = $(this);
        if ($this.val() !== '') {
          $this.addClass('used');
        }
        else
          $this.removeClass('used');
      });
      var input = document.getElementById('searchPlace');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function() {     
        var place = autocomplete.getPlace(); 
        var sPlace = place.geometry.location;         
        self.map.setCenter({lat:parseFloat(sPlace.lat()),lng:parseFloat(sPlace.lng())});
      });
      self.Userallfile();
      $('#url').keyup(function(){
        if($('#url').val() === ""){
            $('#Openfile').attr('disabled','disabled');  
            self.checkurl = "";
        }else{
          $('#Openfile').removeAttr('disabled');
          self.checkurl = $('#url').val();
        }
      });
      $(document).on('click','#totalMeter',function(){
        if(self.UserDrawtype === "polygon"){
          $('#selctarea').modal('show');
        }else if(self.UserDrawtype === "polygon"){
          $('#selctdistance').modal('show');
        }else{
          $('#selctdistance').modal('show');
        }
      });
      $('#selctdistance input[type="checkbox"]').on('change', function() {
        self.linecalType = $(this).val();
        if(self.meter !== 0){
          self.calculation();
        } 
        $('input[name="' + this.name + '"]').not(this).prop('checked', false);
        $('#selctdistance').modal('hide');
      });
      $('#selctarea input[type="checkbox"]').on('change', function() {
        self.areacalType = $(this).val();
        if(self.newArea !== 0){
          self.calculation();
        }
        $('input[name="' + this.name + '"]').not(this).prop('checked', false);
        $('#selctarea').modal('hide');
      });
      $('input[name="upload"]').attr('disabled','disabled');
      $('#upload input[type="radio"]').on('change',function(){
        self.uploadtype  = $(this).val();
        if(self.uploadtype === "file"){
          $('#url').attr('readonly', true);
          $('input[name="upload"]').removeAttr('disabled');
        }else if(self.uploadtype === "url"){
          $('#url').attr('readonly', false);
          $('input[name="upload"]').attr('disabled','disabled');
        }
      });
      $(document).on('click', '#FreehnadPolyline', function(e){
        e.preventDefault();
        self.cleanMap();
        self.UserDrawtype = "polyline";
        $('#menu').hide();
        $('#totalMeter').attr('placeholder','Distance is: 0.00');
        $('.storedata').show();
        self.disable()
        google.maps.event.addDomListener(self.map,'mousedown',function(e){
          self.drawFreeHandPolyline();
        });
      });
      $(document).on('click', '#FreehnadPolygon', function(e){
        e.preventDefault();
        self.cleanMap();
        self.UserDrawtype = "polygon";
        $('#menu').hide();
        $('#totalMeter').attr('placeholder','Area is: 0.00');
        $('.storedata').show();
        self.disable()
        google.maps.event.addDomListener(self.map,'mousedown',function(e){
          self.drawFreeHandPolygon();
        });
      });
      $('.searchbar input').focus(function() {
        $(this).addClass('inputfocus');
      }).blur(function(){
        if(!$(this).val()) {
          $(this).removeClass('inputfocus');
        }
      });
      $('#material-tabs').each(function() {
				var $active, $content, $links = $(this).find('a');
				$active = $($links[0]);
				$active.addClass('active');
				$content = $($active[0].hash);
				$links.not($active).each(function() {
						$(this.hash).hide();
				});
				$(this).on('click', 'a', function(e) {
						$active.removeClass('active');
						$content.hide();
						$active = $(this);
						$content = $(this.hash);
						$active.addClass('active');
						$content.show();
						e.preventDefault();
				});
      });
      $(document).on('keypress', '.float', function(event) {
        if (event.which != 46 && event.which != 45 && (event.which < 47 || event.which > 59)) {
          event.preventDefault();
          if ((event.which == 46) && ($(this).indexOf('.') != -1)) {
            event.preventDefault();
          }
          if ((event.which == 45) && ($(this).indexOf('-') != -1)) {
            event.preventDefault();
          }
        }
      });
      $(document).on('keypress', '.otp-verify', function(event) {
        if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) { 
          event.preventDefault();
        }
      });
      $(document).on('keypress', '.degree', function(event) {
        if (event.which != 46 && event.which != 45 && event.which != 46 && !(event.which >= 48 && event.which <= 57)) {
          event.preventDefault();
        }
      });
      $(document).on('click', '.calc-copy', function(){
        if(self.meter != 0 || self.newArea != 0) {
          var copyText: any = document.getElementById("totalMeter");
          copyText.select();
          document.execCommand("copy");
          $(this).popover('show');
          setTimeout(function(){
            $('.calc-copy').popover('hide');
          }, 1500);
        }
      });
     
    // self.initMap();
  }
  view(){
    var self = this;
    if(self.user !== ""){
      self.user.setMap(null);
    } 
    if(self.cleanmap !== ""){
      self.Clearmap();
    }
    if(self.viewkmlUrl){
      self.myParser.hideDocument();
      self.viewkmlUrl = "";
    }
    if(self.viewkmlFile){
      self.myParser.hideDocument(self.myParser.docs[0]);
      self.viewkmlFile = "";
    }
  }
  poi(){
    $('.degreeDraw').slideUp("fast");
    $('.drawpoi').slideToggle("fast");
  }
  degree(){
    $('.drawpoi').slideUp("fast");
    $('.degreeDraw').slideToggle("fast");
  }
  SidebarmenuControl(sidebarmenu, map){
    var controlUI = document.createElement('div');
    sidebarmenu.appendChild(controlUI);
    $(controlUI).append($('.sidebar-menu'));
  }
  ErasebtnControl(erasebtn, map) {
    var controlUI = document.createElement('div');
    erasebtn.appendChild(controlUI);
    $(controlUI).append($('.freehanderase'));
  }
  initMap(lt,lg) {
  // initMap() {
    let self = this;
    self.map = new google.maps.Map(document.getElementById('map'), {
      rotateControl: true,
      clickableIcons: false,
      draggableCursor: 'default',
      draggingCursor: 'pointer',
      center: {
        lat: lt,//22.3039
        lng: lg//70.8022
      },
      zoom: self.mapDefaultZoom,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      fullscreenControl: false,
      streetViewControl: false,
      // mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    var sidebarmenus = document.createElement('div');
    var sidebar = new self.SidebarmenuControl(sidebarmenus,self.map);
    var erasebtn = document.createElement('div');
    var erase = new self.ErasebtnControl(erasebtn, self.map);
    self.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(sidebarmenus);
    self.map.controls[google.maps.ControlPosition.LEFT_TOP].push(erasebtn);
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(function(position) {
    //     var pos = {
    //       lat: position.coords.latitude,
    //       lng: position.coords.longitude
    //     };
    //     self.map.setCenter(pos);
    //   });
    // }
    // self.map.addDomListener(sidebarmenus, 'click', self.cancelEvent);
    self.map.addListener('zoom_changed', function() {
      self.mapDefaultZoom = self.map.getZoom();
    });
    // self.map.addListener('mousemove',function(point){ 
    //   if(self.checkvalid === "polyline"){
    //     // self.insertPolyPoints(point);
    //   }
    //   if(self.checkvalid === "polygon"){
    //     self.insertPolygonPoints(point);
    //   }
    // });
    self.listenerAdd();
  }

  cancelEvent(e) { 
    e.cancelBubble = true; 
    if (e.stopPropagation) e.stopPropagation(); 
  } 

  listenerAdd(){
    let self = this;
    self.map.addListener("click", function (event) {
        if(self.deleteMenu.isOpen) {
          return;
        }
        if(self.checkvalid === "polyline"){
          (self.clickedPoint == 'ready') ? self.clickedPoint = 1 : null;
          self.trashpoints.push({type: 'add', point: event.latLng});
          self.redopoints = [];
          self.insertPolyPoints(event);
        }
        if(self.checkvalid === "polygon"){
          (self.polygonPoint == 'ready') ? self.polygonPoint = 1 : null;
          self.trashpoints.push({type: 'add', point: event.latLng});
          self.redopoints = [];
          self.insertPolygonPoints(event);
        }
    });
  }
  
  drawarea(){
    $('#menu').hide();
    $('#totalMeter').attr('placeholder','Area is: 0.00');
    $('.storedata').show();
    var self = this;
    self.cleanMap();
    self.addMarker = 0;
    self.UserDrawtype = "polygon";
    self.checkvalid = "polygon";
    self.polygonPoint = "ready";
    var polygonOptions = { 
      clickable: true, draggable: true,  editable: false,
      geodesic: true , visible: true  ,  fillColor:"#1ffc00",
      fillOpacity:null, strokeColor:"black"
    };
    // polygonOptions = $.extend({},polygonOptions,self.toolColors['area']);
    self.drawPolygon = new google.maps.Polygon(polygonOptions);
    var gon = self.drawPolygon;
    self.drawPolygon.addListener("click", function (point) { self.insertPolygonPoints(point,"count"); self.map.setOptions({draggableCursor:'default'}) });
    // self.drawPolygon.addListener("dblclick", function (point) { self.insertPolygonPoints(point,'close'); });
    // self.drawPolygon.addListener("mousemove", function (point) { self.insertPolygonPoints(point); self.map.setOptions({draggableCursor:'default'}) });
    google.maps.event.addListener(self.drawPolygon.getPath(), "insert_at", function(){
      // self.areadata = "";
      self.UserPoints = "";
      self.area = 0;
      // self.areadata = gon.getPath().getArray();
      // self.UserPoints = self.areadata;
      self.UserPoints = gon.getPath().getArray();
      // if(!parseInt(self.polygonPoint)){
        self.newArea = (google.maps.geometry.spherical.computeArea(gon.getPath())).toFixed(4);
        $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
        // self.getarea(self.areadata);
        self.drawMarker();
      // }
    });
    google.maps.event.addListener(self.drawPolygon.getPath(), 'remove_at', function () {
      // self.areadata = "";
      self.UserPoints = "";
      self.area = 0;
      // self.areadata = gon.getPath().getArray();
      // self.UserPoints = self.areadata;
      self.UserPoints = gon.getPath().getArray();
      // if(!parseInt(self.polygonPoint)){
        self.newArea = (google.maps.geometry.spherical.computeArea(gon.getPath())).toFixed(4);
        $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
        // self.getarea(self.areadata);
        self.drawMarker();
      // }
    });
    // google.maps.event.addListener(self.drawPolygon, 'rightclick', function(e) {
    //   self.allMarker[e.vertex].setMap(null);
    //   self.allMarker.splice(e.vertex,1);
    //   gon.getPath().removeAt(e.vertex);
    //   // self.areadata = "";
    //   self.UserPoints = "";
    //   self.area = 0;
    //   // self.areadata = gon.getPath().getArray();
    //   // self.UserPoints = self.areadata;
    //   self.UserPoints = gon.getPath().getArray();
    //   self.newArea = (google.maps.geometry.spherical.computeArea(gon.getPath())).toFixed(4);
    //   $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
    //   // self.getarea(self.areadata);
    // });
    google.maps.event.addListener(self.drawPolygon.getPath(), "set_at", function(){
      // self.areadata = "";
      self.UserPoints = "";
      self.area = 0;
      // self.areadata = gon.getPath().getArray();
      // self.UserPoints = self.areadata;
      self.UserPoints = gon.getPath().getArray();
      self.newArea = (google.maps.geometry.spherical.computeArea(gon.getPath())).toFixed(4);
      $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
      // self.getarea(self.areadata);
      self.drawMarker();
    });
    self.user = self.drawPolygon;
    self.drawPolygon.setMap(self.map);
  }

  drawdistance() {
    // $('#menu').hide();
    $('#totalMeter').attr('placeholder','Distance is: 0.00');
    $('.storedata').show();
    let self = this;
    self.cleanMap();
    self.addMarker = 0;
    self.UserDrawtype = "polyline";
    self.checkvalid = "polyline";
    self.clickedPoint = 'ready';
    var polyOptions = { 
          clickable: true, draggable: true,  editable: false,
          geodesic: true , visible: true  ,  fillColor:self.selectedColor,
          fillOpacity:null, strokeWeight:4, strokeColor:"black",
    };
    // polyOptions = $.extend({},polyOptions,self.toolColors['area']);
    self.polyShape = new google.maps.Polyline(polyOptions);
    var poly = self.polyShape;
    self.polyShape.addListener("click", function (point) { self.insertPolyPoints(point,"count"); });
    // self.polyShape.addListener("dblclick", function (point) { self.insertPolyPoints(point,'close'); });
    // self.polyShape.addListener("mousemove", function (point) { self.insertPolyPoints(point); });
    google.maps.event.addListener(self.polyShape.getPath(), "insert_at", function(){
      // self.linedata = "";
      self.UserPoints = "";
      self.meter = 0;
      // self.linedata = poly.getPath().getArray();
      // self.UserPoints = self.linedata;
      self.UserPoints = poly.getPath().getArray();
      // if(!parseInt(self.clickedPoint)){
        self.meter = (google.maps.geometry.spherical.computeLength(poly.getPath())).toFixed(4);
        // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
        self.calculation();
        self.drawMarker();
      // }
    });
    google.maps.event.addListener(self.polyShape.getPath(), 'remove_at', function () {
        // self.linedata = "";
        self.UserPoints = "";
        self.meter = 0;
        // self.linedata = poly.getPath().getArray();
        // self.UserPoints = self.linedata;
        self.UserPoints = poly.getPath().getArray();
        // if(!parseInt(self.clickedPoint)){
          self.meter = (google.maps.geometry.spherical.computeLength(poly.getPath())).toFixed(4);
          // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
          self.calculation();
          self.drawMarker();
        // }
    });
    // google.maps.event.addListener(self.polyShape, 'rightclick', function(e) {
    //     self.allMarker[e.vertex].setMap(null);
    //     self.allMarker.splice(e.vertex,1);
    //     poly.getPath().removeAt(e.vertex);
    //     // self.linedata = "";
    //     self.UserPoints = "";
    //     self.meter = 0;
    //     // self.linedata = poly.getPath().getArray();
    //     // self.UserPoints = self.linedata;
    //     self.UserPoints = poly.getPath().getArray();
    //     self.meter = (google.maps.geometry.spherical.computeLength(poly.getPath())).toFixed(4);
    //     $('#totalMeter').val("Distance is: "+self.meter+" Meter");
    // });
    google.maps.event.addListener(self.polyShape.getPath(), "set_at", function(){
      // self.linedata = "";
      self.UserPoints = "";
      self.meter = 0;
      // self.linedata = poly.getPath().getArray();
      // self.UserPoints = self.linedata;
      self.UserPoints = poly.getPath().getArray();
      self.meter = (google.maps.geometry.spherical.computeLength(poly.getPath())).toFixed(4);
      // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
      self.calculation();
      self.drawMarker();
    });
    self.user = self.polyShape;
    self.polyShape.setMap(self.map);
  }

  insertPolyPoints(point,type=""){
    var self = this;
    if(type=="count"){
      if(parseInt(self.clickedPoint)){
        self.clickedPoint ++;
        self.allMarker = self.polyShape.getPath();
        if(self.addMarker === 0){
          self.drawMarker();
          // for(var i=0;i<self.markers.j.length;i++){
          //   if(i === self.markers.j.length -1){
          //     var demo = new google.maps.Marker({position: new google.maps.LatLng(self.markers.j[i].lat(), self.markers.j[i].lng()),icon:icons,map: self.map, draggable:true});
          //     self.allMarker.push(demo);
          //   }
          // }
        }        
      }
    }else if(type=='close'){
      if(parseInt(self.clickedPoint)){
        // self.linedata = self.polyShape.getPath().getArray();
        // self.getDistance(self.linedata);
        self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
        // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
        self.calculation();
        // self.polyShape = null;
        self.clickedPoint = 0;
        self.addMarker = 1;
      }
    }else{
      if(parseInt(self.clickedPoint)){
        var polyPoints = self.polyShape.getPath();
        self.markers = self.polyShape.getPath();
        (type=='start')?self.clickedPoint ++ :null;
        polyPoints.insertAt(polyPoints.length, point.latLng);
        self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
        $('#totalMeter').val("Distance is: "+self.meter+" Meter");
        self.calculation();
      }
    }
  }

  insertPolygonPoints(point,type=""){
    var self = this;
    if(type=="count"){
      if(parseInt(self.polygonPoint)){
        self.polygonPoint ++;
        self.markers = self.drawPolygon.getPath();
        if(self.addMarker === 0){
          self.drawMarker();
          // for(var i=0;i<self.markers.j.length;i++){ 
          //   if(i === self.markers.j.length -1){
          //     var demo = new google.maps.Marker({position: new google.maps.LatLng(self.markers.j[i].lat(), self.markers.j[i].lng()),icon:icons,map: self.map, draggable:true});
          //     self.allMarker.push(demo);
          //   }
          // }
        }
      }
    }else if(type=='close'){
      if(parseInt(self.polygonPoint)){
        // self.areadata = self.drawPolygon.getPath().getArray();   
        // self.getarea(self.areadata);
        self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
        // $('#totalMeter').val("Area is: "+self.newArea+" Square Meter");
        self.calculation();

        // self.drawPolygon = null;
        self.polygonPoint = 0;
        self.addMarker = 1;
      }
    }else{
      if(parseInt(self.polygonPoint)){
        var polygoPoints = self.drawPolygon.getPath();  
        self.markers =  self.drawPolygon.getPath();       
        (type=='start')?self.polygonPoint ++ :null;
        polygoPoints.insertAt(polygoPoints.length, point.latLng);
        self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
        // $('#totalMeter').val("Area is: "+self.newArea+" Square Meter");
        self.calculation();
      }
    }
  }
  erasemeasure() {
    let self = this;
    google.maps.event.addListener(self.map,'click',function(e){
      let latlng = e.latLng;
      let line = self.freehandlayer.getPath().j;
      var zoom  = self.map.getZoom() >= 16 ? 0.00005 : 0.005;
      for(let i=0; i < line.length; i++) {
        if(Math.abs(latlng.lat() - line[i].lat()) < zoom && Math.abs(latlng.lng() - line[i].lng()) < zoom) {
          self.freehandlayer.getPath().removeAt(i);
        }
      }
      if(self.UserDrawtype === 'polyline') {
        self.meter = (google.maps.geometry.spherical.computeLength(self.freehandlayer.getPath())).toFixed(4);
      }
      if(self.UserDrawtype === 'polygon') {
        self.newArea = (google.maps.geometry.spherical.computeArea(self.freehandlayer.getPath())).toFixed(4);
      }
      self.calculation();
    });
  }
  removeLastPoint() {
    const self = this;
    if(self.trashpoints.length > 0) {
      let points = self.trashpoints[self.trashpoints.length -1];
      if(points.type == 'add') {
        self.redopoints.push({type: 'delete', point: points.point})
        self.polyShape.getPath().removeAt(self.trashpoints.length -1);
        self.trashpoints.pop();
      }
      if(points.type == 'delete') {
        self.redopoints.push({type: 'add', point: points.point});
        self.polyShape.getPath().insertAt(self.polyShape.getPath().j.length + 1, points.point);
        self.trashpoints.pop();
      }
    }
    // if(self.UserDrawtype === 'polyline' && self.polyShape !== undefined) {
    //   if(self.polyShape.getPath().j.length > 0) {
    //     for(let i = self.trashpoints.length - 1; i >= 0; i--) {
    //       if(i === self.trashpoints.length - 1) { 
    //         if(self.trashpoints[i].type == 'add') {
    //           let polyline = self.polyShape.getPath().j;
    //           for(let j = 0; j < polyline.length; j++) {
    //             if(polyline[j].lat() == self.trashpoints[i].point.lat() && polyline[j].lng() == self.trashpoints[i].point.lng()) {
    //               self.polyShape.getPath().removeAt(i);
    //               self.redopoints.push({type: 'delete', point: self.trashpoints[i].point});          
    //             }
    //           } 
    //         }
    //         if(self.trashpoints[i].type == 'delete') {
    //           self.polyShape.getPath().insertAt(self.polyShape.getPath().j.length + 1, self.trashpoints[i].point);
    //           self.redopoints.push({type: 'add', point: self.trashpoints[i].point});
    //         }
    //       }
    //     }
    //     // self.polyShape.getPath().removeAt(self.polyShape.getPath().j.length -1);
    //     // if(self.polyShape.getPath().j.length === 1) {
    //     //   $('#RedrawConfirmModal').modal('show');
    //     // } else {
    //     //   self.trashpoints.push({point: self.polyShape.getPath().j[self.polyShape.getPath().j.length -1], index: self.polyShape.getPath().j.length -1});
    //     //   self.polyShape.getPath().removeAt(self.polyShape.getPath().j.length -1);
    //     //   self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
    //     //   // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
    //     //   self.calculation();
    //     //   self.drawMarker();
    //     // }
    //   }
    // } else if (self.UserDrawtype === 'polygon' && self.drawPolygon !== undefined) {
    //   if(self.drawPolygon.getPath().j.length > 0) {
    //     if(self.drawPolygon.getPath().j.length === 1) {
    //       $('#RedrawConfirmModal').modal('show');
    //     } else {
    //       self.trashpoints.push(self.drawPolygon.getPath().j[self.drawPolygon.getPath().j.length -1]);
    //       self.drawPolygon.getPath().removeAt(self.drawPolygon.getPath().j.length -1);
    //       self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
    //       // $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
    //       self.calculation();
    //       self.drawMarker();
    //     }
    //   }
    // }
  }
  addDeletedPoint() {
    const self = this;
    if(self.redopoints.length > 0) {
      let points = self.redopoints[self.redopoints.length-1];
      if(points.type == 'delete') {
        self.polyShape.getPath().insertAt(self.redopoints.length+1, points.point);
      }
      if(points.type == 'add') {
        self.polyShape.getPath().removeAt(self.polyShape.getPath().j.length - 1);
      }
      self.redopoints.pop();
    }
    // console.log(self.redopoints);
    // for(let i = self.trashpoints.length - 1; i >= 0; i--) {
    //   if(i === self.trashpoints.length - 1) {
    //     if(self.UserDrawtype === 'polyline') {
    //       self.polyShape.getPath().insertAt(self.trashpoints[i].index, self.trashpoints[i].point);
    //       self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
    //       // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
    //       self.calculation();
    //     } else if (self.UserDrawtype === 'polygon') { 
    //       self.drawPolygon.getPath().insertAt(self.drawPolygon.getPath().length, self.trashpoints[i]);
    //       self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
    //       // $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
    //       self.calculation();
    //     }
    //     self.trashpoints.pop();
    //     self.drawMarker();
    //     return;
    //   }
    // }
  }
  ClearandRedraw() {
    const self = this;
    if(self.UserDrawtype === 'polyline') { 
      self.polyShape.getPath().removeAt(self.polyShape.getPath().j.length -1);
      self.cleanMap();
      self.drawdistance();
    }
    if(self.UserDrawtype === 'polygon') {
      self.drawPolygon.getPath().removeAt(self.drawPolygon.getPath().j.length -1);
      self.cleanMap();
      self.drawarea();
    }
    self.trashpoints = [];
  }
  hide(){
    $('.drawpoi').slideUp();
    $('.degreeDraw').slideUp();
    $('#latlngForm').trigger('reset');
    $('#location').trigger('reset');
    const self = this;
    self.latitude = '';
    self.longitude = '';
    self.locationdegree = '';
    self.locationdegree1 = '';
    self.locationminute = '';
    self.locationminute1 = '';
    self.locationsecond = '';
    self.locationsecond1 = '';
  }
  userCursor(){
    var self = this;
    let lat = $("input[name=latitude]").val();
    let lng = $("input[name=longitude]").val();
    if($.isNumeric(lat) && $.isNumeric(lng)) { 
      if((lat > -90 && lat < 90) && (lng > -180 && lng < 180)) {
        self.cleanMap();
        self.cleanmap = 1;
        var degree = [lat,lng]
        $('#poi').modal('hide'); 
        self.marker = new google.maps.Marker({position: new google.maps.LatLng(lat, lng),map: self.map,animation: google.maps.Animation.DROP});
        self.map.setCenter({lat:parseFloat(lat), lng:parseFloat(lng)});
        for(var i=0;i<degree.length;i++){
          if(i===0){
            self.Dlatitude=Math.sign(degree[i]) >= 0 ? "N" : "S";
            self.Dlatitude+=self.toDegreesMinutesAndSeconds(degree[i]);    
          }else{
            self.Dlongitude=Math.sign(degree[i]) >= 0 ? "E" : "W";
            self.Dlongitude+=self.toDegreesMinutesAndSeconds(degree[i]);    
          }
        }   
        var contentString ="<div style='text-align:center'>Latitude : "+lat +"</div>";
          contentString += "<div style='text-align:center'>Longitude : "+lng +"</div>";
          contentString += "<div style='text-align:center'>Degree Latitude : "+self.Dlatitude+"</div>";
          contentString += "<div style='text-align:center'>Degree Longitude : "+self.Dlongitude+"</div>";
        self.infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        self.marker.addListener('click', function() {
          self.infowindow.open(self.map, self.marker);
        });
        self.infowindow.open(self.map,self.marker);   
        $('.drawpoi').slideUp();
        $('#latlngForm').trigger('reset');
        self.latitude = '';
        self.longitude = '';
      } else if (!(lat > -90 && lat < 90) && !(lng > -180 && lng < 180)) {
        self.latitude = 'Invalid Latitude.';
        self.longitude = 'Invalid Longitude.';
      } else if(!(lat > -90 && lat < 90)) {
        self.latitude = 'Invalid Latitude.';
        self.longitude = '';
      } else if (!(lng > -180 && lng < 180)) {
        self.latitude = '';
        self.longitude = 'Invalid Longitude.';
      } 
    } else if(lat === '' && lng === '') {
      self.latitude = 'Latitude is required.';
      self.longitude = 'Longitude is required.';
    } else if (lat === '') {
      self.latitude = 'Latitude is required.';
      self.longitude = '';
    } else if (lng === '') {
      self.latitude = '';
      self.longitude = 'Longitude is required.';
    }
  }
  toDegreesMinutesAndSeconds(coordinate) {
    var degrees = Math.floor(coordinate);
    var minutesNotTruncated = (coordinate - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    return Math.abs(degrees)+"°"+minutes+"'"+ seconds+'"';
  }
  getLocation(){
    var self = this;
    let degree = $("input[name='degree']").val();
    let minute = $("input[name='minute']").val();
    let second = $("input[name='second']").val();
    let direction  = $("#dropdown1").val();
    let degree1 = $("input[name='degree1']").val();
    let minute1 = $("input[name='minute1']").val();
    let second1 = $("input[name='second1']").val();
    let direction1 = $("#dropdown2").val();
    if(!degree) { self.locationdegree = 'Degree is required.' } else { 
      if(direction === 'N' && !(degree >= 0 && degree <= 90)) { self.locationdegree = 'Invalid degree0.' } 
      else if (direction === 'S' && !(degree >= -90 && degree < 0)) { self.locationdegree = 'Invalid degree1.' }
      else { self.locationdegree = '' } }
    if(!degree1) { self.locationdegree1 = 'Degree is required.' } else {
      if(direction1 === 'W' && !(degree1 >= -180 && degree1 < 0)) { self.locationdegree1 = 'Invalid degree0.'}
      else if(direction1 === 'E' && !(degree1 >= 0 && degree1 <= 180)) { self.locationdegree1 = 'Invalid degree1.'}
      else { self.locationdegree1 = '' } }
    if(!minute) { self.locationminute = 'Minute is required.' } else { if(minute > 60) { self.locationminute = 'Invalid minute' }  else { self.locationminute = '' }}
    if(!minute1) { self.locationminute1 = 'Minute is required.' } else { if(minute1 > 60) { self.locationminute1 = 'Invalid minute' }  else { self.locationminute1 = '' } }
    if(!second) { self.locationsecond = 'Second is required.' } else { if(second > 60) { self.locationsecond = 'Invalid second' }  else { self.locationsecond = '' } }
    if(!second1) { self.locationsecond1 = 'Second is required.' } else { if(second1 > 60) { self.locationsecond1 = 'Invalid second' }  else { self.locationsecond1 = '' } }
    if(self.locationdegree == '' && self.locationdegree1 == '' && self.locationminute == '' && self.locationminute1 == '' && self.locationsecond == '' && self.locationsecond1 == '') {
      var lat,lng;
      self.cleanmap = 1;
      self.cleanMap();
      $('#poi').modal('hide'); 
      $('#location').trigger('reset');
      var latitude = (parseInt(degree) + parseInt(minute) /60 + parseInt(second) / 3600).toFixed(7);
      var longitude = (parseInt(degree1) + parseInt(minute1) /60 + parseInt(second1) / 3600).toFixed(7);
      if(direction === "S"){
        lat = -latitude;
      }else{
        lat = latitude;
      }
      if(direction1 === "W"){
        lng = -longitude;
      }else{
        lng = longitude;
      }
      self.map.setCenter({lat:parseFloat(lat),lng:parseFloat(lng)});     
      self.marker = new google.maps.Marker({position: new google.maps.LatLng(latitude,longitude),map: self.map,animation: google.maps.Animation.DROP});
      var contentString ="<div style='text-align:center'>Latitude : "+lat +"</div>";
      contentString += "<div style='text-align:center'>Longitude : "+lng +"</div>";
      contentString += "<div style='text-align:center'>Degree Latitude : "+ direction+ degree+"°"+ minute+"'"+ second+'"'+"</div>";
      contentString += "<div style='text-align:center'>Degree Longitude : "+ direction1+ degree1+"°"+ minute1+"'"+ second1+'"'+"</div>";
      self.infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      self.marker.addListener('click', function() {
        self.infowindow.open(self.map, self.marker);
      });
      self.infowindow.open(self.map,self.marker);
      $('.degreeDraw').slideUp();
    }
  }
  storePoints(){
    var self = this;
    let filename = $("input[name='filename']").val();
    if(localStorage.getItem('logintoken')){
      if(filename){
        if(self.UserPoints.length <= 2 && self.UserDrawtype === "polygon"){
          self.fileerr ="Please clear map and complete again your Area.";
          setTimeout(function(){
            self.fileerr = '';
          },4000);
          return;
        }else if(self.UserPoints.length <= 1 && self.UserDrawtype === "polyline"){
          self.fileerr ="Please clear map and complete again your Distance.";
          setTimeout(function(){
            self.fileerr = '';
          },4000);
          return;
        }else{
          var allmeasure = JSON.parse(localStorage.getItem('allFiles'));
          if(self.allFile.length === 0){
            if(allmeasure === null){
              self.allFile.push({file:JSON.stringify(self.UserPoints),type:self.UserDrawtype,name:filename});
              localStorage.setItem('allFiles',JSON.stringify(self.allFile));
            }else{
              for(var i=0;i<allmeasure.length;i++){
                if(filename !== allmeasure[i].name){
                  self.allFile.push({file:allmeasure[i].file,type:allmeasure[i].type,name:allmeasure[i].name});
                }else{
                  self.allFile = [];
                  self.fileerr = 'File already exists.';
                  setTimeout(function(){
                    self.fileerr = '';
                  },3000);
                  return;
                }
              }
              self.allFile.push({file:JSON.stringify(self.UserPoints),type:self.UserDrawtype,name:filename});
              localStorage.removeItem('allFiles');
              localStorage.setItem('allFiles',JSON.stringify(self.allFile));
            }
          }else{
            self.allFile = [];
            for(var i=0;i<allmeasure.length;i++){
              if(filename !== allmeasure[i].name){  
                self.allFile.push({file:allmeasure[i].file,type:allmeasure[i].type,name:allmeasure[i].name});
              }else{
                self.allFile = [];
                self.fileerr = 'File already exists.';
                setTimeout(function(){
                  self.fileerr = '';
                },3000);
                return;
              }
            }
            self.allFile.push({file:JSON.stringify(self.UserPoints),type:self.UserDrawtype,name:filename});
            localStorage.removeItem('allFiles');
            localStorage.setItem('allFiles',JSON.stringify(self.allFile));
          }
          $('#Savemeasurement').modal('hide');
          $('#storepointform').trigger('reset');
          self.Userallfile();
          $('.storedata').hide();
          self.user.setMap(null);
          for(var i=0; i< self.allMarker.length;i++){
            self.allMarker[i].setMap(null);
          }
          $('#totalMeter').val("");
          if(self.UserDrawtype === 'polyline') {
            self.polyShape = null;
            self.clickedPoint = 0;
            self.addMarker = 1;
          } else if (self.UserDrawtype === 'polygon') { 
            self.drawPolygon = null;
          }
          self.cleanMap();
      }
      }else{
        self.fileerr = 'Please enter file name.';
      }
    }else{
      self.fileerr = 'Please login first to save your measurement.';
      setTimeout(function(){
        self.fileerr = '';
      },3000);
      return;
    }
  }
  fileView(file){
    var self = this;
    var viewLat,viewLng;
    var Points = [];
    self.cleanMap();
    var Files = JSON.parse(localStorage.getItem('allFiles'));
    for(var j=0;j<Files.length;j++){
      if(file.name === Files[j].name){
        var newData = JSON.parse(Files[j].file);
        self.Vtype = Files[j].type;
        for(var i=0;i<newData.length; i++){
          Points.push({lat:newData[i].lat,lng:newData[i].lng});
          if(i === 0){
              viewLat = newData[i].lat;
          }
          if(i === newData.length -1){
              viewLng = newData[i].lng;
          }
        }
      }
    }
    if(self.Vtype === "polyline"){
      var userPolyline = new google.maps.Polyline({
        path: Points,
        strokeColor: 'black',
        strokeWeight: 4,
        fillOpacity:null,
        geodesic: true
      });
      if(self.user !== ""){
        self.user.setMap(null);
      }
      $('#allMeasure').modal('hide');
      self.user = userPolyline;
      userPolyline.setMap(self.map);
      self.zoomToObject(newData);
    }
    if(self.Vtype === "polygon"){
      var userPolygon = new google.maps.Polygon({
        paths: Points,
        strokeColor: 'black',
        strokeOpacity: null,
        strokeWeight: 4,
        fillColor: '#1ffc00',
        fillOpacity: null,
        geodesic: true
      });
      if(self.user !== ""){
        self.user.setMap(null);
      }
      $('#allMeasure').modal('hide');
      self.user = userPolygon;
      userPolygon.setMap(self.map);
      self.zoomToObject(newData);
    }  
  }
  zoomToObject(obj){
    var self = this;
    var bounds = new google.maps.LatLngBounds();
    var points = obj;
    for (var n = 0; n < points.length ; n++){
        bounds.extend(points[n]);
    }
    self.map.fitBounds(bounds);
  }
  fileDownload(file){
    var self = this;
    var newfiledata,Dtype;
    var Files = JSON.parse(localStorage.getItem('allFiles'));
    for(var j=0;j<Files.length;j++){
      if(file.name === Files[j].name){
        newfiledata = JSON.parse(Files[j].file);
        Dtype = Files[j].type;
      }
    }
    if(Dtype === "polyline"){
      var polylinefile = "<?xml version='1.0' encoding='UTF-8'?>\n";
      polylinefile +="<kml xmlns='http://www.opengis.net/kml/2.2'>\n"
      polylinefile +="<Document>\n";
      polylinefile +="<Style id='straightLineStyle'>\n";
      polylinefile +="<LineStyle>\n";
      polylinefile +="<color>ff0000ff</color>\n";
      polylinefile +="<width>1.0</width>\n";
      polylinefile +="</LineStyle>\n";
      polylinefile +="</Style>\n";
      polylinefile +="<Placemark>\n";
      polylinefile +="<name>"+file.name+"</name>\n";
      polylinefile +="<description>GeoMeasure</description>\n";
      polylinefile +="<styleUrl>#straightLineStyle</styleUrl>\n";
      polylinefile +="<LineString>\n";
      polylinefile +="<tessellate>1</tessellate>\n";
      polylinefile +="<coordinates>";
      for(var i=0;i<newfiledata.length;i++){
        polylinefile += newfiledata[i].lng +","+ newfiledata[i].lat +",0\n";
      }
      polylinefile +="</coordinates>\n";
      polylinefile +="</LineString>\n";
      polylinefile +="</Placemark>\n";
      polylinefile +="</Document>\n";
      polylinefile +="</kml>";
      importedSaveAs(new Blob([polylinefile], { type:'text/kml' }), file.name+'.kml');
    }
    if(Dtype === "polygon"){
      var polygonfile = "<?xml version='1.0' encoding='UTF-8'?>\n";
      polygonfile +="<kml xmlns='http://www.opengis.net/kml/2.2'>\n";
      polygonfile +="<Document>\n";
      polygonfile +="<Style id='BMPoly'>\n";
      polygonfile +="<LineStyle>\n";
      polygonfile +="<color>ffff0000</color>\n";
      polygonfile +="<width>1.2</width>\n";
      polygonfile +="</LineStyle>\n";
      polygonfile +="<PolyStyle>\n";
      polygonfile +="<color>ff00ff00</color>\n";
      polygonfile +="<fill>1</fill>\n";
      polygonfile +="</PolyStyle>\n";
      polygonfile +="</Style>\n";
      polygonfile +="<Placemark>\n";
      polygonfile +="<styleUrl>#BMPoly</styleUrl>\n";
      polygonfile += "<name>"+file.name+"</name>\n";
      polygonfile +="<Polygon>\n";
      polygonfile +="<outerBoundaryIs>\n";
      polygonfile +="<LinearRing>\n";
      polygonfile +="<coordinates>\n";
      for(var i=0;i<newfiledata.length;i++){
        polygonfile += newfiledata[i].lng +","+ newfiledata[i].lat +",0\n";
      }
      polygonfile +="</coordinates>\n";
      polygonfile +="</LinearRing>\n";
      polygonfile +="</outerBoundaryIs>\n";
      polygonfile +="</Polygon>\n";
      polygonfile +="</Placemark>\n";
      polygonfile +="</Document>\n";
      polygonfile +="</kml>";
      importedSaveAs(new Blob([polygonfile], { type:'text/kml' }), file.name+'.kml');
    }
  }
  onFileChange(event){
    let self = this;
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      self.checkFile = event.target.files;
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        var type = file.name.split('.').pop();
        if(type !== "kml"){
          self.typeErr = "Upload only kml file";
        }else{
          self.Fileview = event;
          self.typeErr = "";
        }
      };
    }
    if(event.target.files.length === 0){
      self.checkFile = "";
    }
  }
  clearFile() {
    const self = this;
    self.uriErr = '';
    self.typeErr = '';
    $('#uploadfile').trigger('reset');

  }
  viewKml(){
    let self = this;
    let url = $('input[name="url"]').val();
    let file = $('input[type="file"]').val();
    const checkurl = new RegExp('^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$');
    if(url && self.uploadtype === 'url') {
      if(checkurl.test(url)) {
        var kmlfile = url.split('.').pop();
          if(kmlfile === "kml"){
            $.ajax({
              url  : url,
              type : 'GET',
              error: function(data){
                self.uriErr = "Invalid url. Please check your url.";
              }
            }).done(function(data,statusText, xhr){
              var status = xhr.status;
              if(status === 200) {
                self.uriErr= '';
                self.cleanMap();
                self.viewkmlUrl = url;
                self.myParser = new geoXML3.parser({map: self.map});
                self.myParser.parse(self.viewkmlUrl);
                $('#uploadfile').trigger('reset');
                $('#upload').modal('hide');
              }else{
                self.uriErr = "Invalid url. Please check your url.";
              }
            });
          }else{
            self.uriErr = "Invalid url. Please check your url.";
          }
      } else {
        self.uriErr = "Invalid url. Please check your url.";  
      }
    } else {
      if(self.uploadtype === 'url') {
        self.uriErr = "Url is required."
        self.typeErr = '';
      }
    }
    if(file &&  self.uploadtype === 'file') {
      self.cleanMap();
      let file = self.Fileview.target.files[0];
      let reader = new FileReader();     
      reader.readAsText(file, "UTF-8");
      reader.onload = function(e){
        let t:any = e.target;
        let newurl:string = t.result;
        self.viewkmlFile = newurl;
        self.myParser = new geoXML3.parser({map: self.map}); 
        self.myParser.parseKmlString(self.viewkmlFile,self.myParser.docs);
        $('#upload').modal('hide');
      }
      $('#uploadfile').trigger('reset');
    } else {
      if(self.uploadtype === 'file') {
        self.typeErr = 'File is requires';
        self.uriErr = '';
      }
    }
  }
  cleanMap(){
    var self = this;     
    $('#menu').show();
    $('.storedata').hide();
    // if(!$('.zoom-btn-sm').hasClass('scale-out')){
    //   $('.zoom-btn-sm').toggleClass('scale-out');
    // }
    // $('#zoomBtn span').addClass('rotate-reset').removeClass('rotate');
    if($('.freehanderase .btn').hasClass('erase-btn')) {
      $('.freehanderase .btn').removeClass('erase-btn');
    }
    $('#totalMeter').val('');
    $('#totalMeter').attr('placeholder','Distance is: 0.00');
    self.UserPoints = "";
    // self.areadata = "";
    self.UserDrawtype = "";
    self.checkvalid = "";
    self.locationset = true;
    $('#totalMeter').width(250);
    if(self.user !== ""){
      self.user.setMap(null) 
    }
    if(self.allMarker.length > 0){
      for(var i=0; i< self.allMarker.length;i++){
        self.allMarker[i].setMap(null);
      }
    }
    if(self.viewkmlUrl){
      self.myParser.hideDocument();
      self.viewkmlUrl = "";
    }
    if(self.viewkmlFile){
      self.myParser.hideDocument(self.myParser.docs[0]);
      self.viewkmlFile = "";
    }
    if(self.marker) {
      self.marker.setMap(null);
    }
  }
  Clearmap(){
    var self = this;
    self.infowindow.close();
    self.marker.setMap(null);
    $('.clearMap').hide();
    $('#menu').show();
    $('#latlngForm').trigger('reset');
    $('#location').trigger('reset');
    if(self.allMarker.length > 0){
      for(var i=0; i< self.allMarker.length;i++){
        self.allMarker[i].setMap(null);
      }
    }
  }
  Registerlogin(a){
    if(a === 0){
      $('#userlogin').slideUp();
      $('#userregister').slideDown();
      $('#forgot').slideUp();
    } 
    if(a === 1){
      $('#userlogin').slideDown();
      $('#forgot').slideUp();
      $('#userregister').slideUp();  
    } 
    if(a === 2){
      $('#userlogin').slideUp();
      $('#userregister').slideUp();  
      $('#forgot').slideDown();
    }  
  }  
  newmodal(){
    $('#userloginform').trigger('reset');
    $('#userregisterform').trigger('reset');
    $('#forgotform').trigger('reset');
    $('#userlogin').slideDown();
    $('#userregister').slideUp();
    $('#forgot').slideUp();
    $('input[name="email"],input[name="password"],input[name="username"],input[name="phone"],input[name="remail"],input[name="rpassword"],input[name="femail"]').removeClass('used');
  }
  userlogin(){
    var self = this;
    let email = $("input[name=loginemail]").val();
    let password = $("input[name=loginpassword]").val();
    if(email && password) {
      var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
      if (re.test(email)) {
        var login = "http://192.168.0.9/laravelstructure/public/api/login";
        var Loginform = new FormData;
        Loginform .append('email', email);
        Loginform .append('password', password);
        Loginform .append('responsetype', 'gzip');
        self.http.post(login,Loginform).subscribe((response: any)=>{
          let b64Data = response.text();
          let strData = atob(b64Data);
          var charData = strData.split('').map(function(x){return x.charCodeAt(0);});
          var binData = new Uint8Array(charData);
          var data = pako.inflate(binData);
          var userdata = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(data)));
          if(userdata.success === true) {
            $('#login').modal('hide'); 
            localStorage.setItem('logintoken', userdata.data.token);
            self.suclogin = true;
            $('#userloginform').trigger('reset');
          }
          if(userdata.success === false){
            self.errMsg = userdata.message;
            $('#mesg').addClass('message alert-warning');
            var temp = this;
            setTimeout(function(){
              temp.errMsg = '';
              $('#mesg').removeClass('message alert-warning');
            },2000);
          }
        });
      } else {
        self.loginemail = 'Invalid Email.'
      }
    } else if (email === '' && password === '')  {
      self.loginemail = 'E-mail is required.';
      self.loginpassword = 'Password is required.';
    } else if (email === '')  {
      self.loginemail = 'E-mail is required.';
      self.loginpassword = '';
    } else if (password === '')  {
      var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
      if (!re.test(email)) {
        self.loginemail = 'Invalid Email.'
      } else {
        self.loginemail = '';
      }
      self.loginpassword = 'Password is required.';
    }
  }
  userregister(){
    const self = this;
    let firstname = $("input[name='regfirstname']").val();
    let lastname= $("input[name='reglastname']").val();
    let email = $("input[name='regemail']").val();
    let password = $("input[name='regpassword']").val();
    if(firstname && lastname && email && password) {
      var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
      if (re.test(email)) {
        var register = "http://192.168.0.9/laravelstructure/public/api/register";
        const regForm = new FormData;
        regForm.append('name', firstname+" "+lastname);
        regForm.append('email', email);
        regForm.append('password', password);
        regForm .append('responsetype', 'gzip');
        self.http.post(register,regForm).subscribe((response: any) => {
          let b64Data = response.text();
          let strData = atob(b64Data);
          var charData = strData.split('').map(function(x){return x.charCodeAt(0);});
          var binData = new Uint8Array(charData);
          var data = pako.inflate(binData);
          var res = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(data)));
          if(res.success === false) {
            this.sucMsg = res.message;
            $('#regErr').addClass('message alert-warning');
            var temp = this;
            setTimeout(function(){
              temp.sucMsg = '';
              $('#regErr').removeClass('message alert-warning');
            },3000); 
          }
          if(res.success === true) {
            $('#userregisterform').trigger('reset');
            $('input[name="loginemail"],input[name="loginpassword"],input[name="regfirstname"],input[name="reglastname"],input[name="regemail"],input[name="regpassword"]').removeClass('used');
            this.sucMsg = res.message;
            $('#regErr').addClass('message alert-success');
            localStorage.setItem('logintoken', res.data.token);
            self.suclogin = true;
            var temp = this;
            setTimeout(function(){
              temp.sucMsg = '';
              $('#regErr').removeClass('message alert-success');
              $('#login').modal('hide'); 
            },1500);
          }
        });
      } else {
        if(!re.test(email)) {
          self.regemail = 'Email Invalid.';
        } else {
          self.regemail = '';
        }
      }
    } else {
      if(!firstname) { self.regfirstname = 'Firstname is required.'; } else { self.regfirstname = ''; } 
      if(!lastname) { self.reglastname = 'Lastname is required.'; } else { self.reglastname = ''; } 
      if(!password) { self.regpassword = 'Password is required.'; } else { self.regpassword = ''; }
      if(email) { 
        var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
        if(!re.test(email)) {
          self.regemail = 'Invalid E-mail.';
        }  else {
          self.regemail = '';
        }
      } else { 
        self.regemail = 'E-mail is required.';
      }
    }
  }
  forgot(){
    const self  = this;
    let email = $("input[name='femail']").val();
    if(email) {
      var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
      if(re.test(email)) {
        var forgotUrl ="http://192.168.0.9/laravelstructure/public/api/forgotpassword";
        var resetForm = new FormData;
        resetForm.append('email', email);
        resetForm .append('responsetype', 'gzip');
        this.http.post(forgotUrl,resetForm).subscribe((response: any)=>{
          let b64Data = response.text();
          let strData = atob(b64Data);
          var charData = strData.split('').map(function(x){return x.charCodeAt(0);});
          var binData = new Uint8Array(charData);
          var data = pako.inflate(binData);
          var forgotdata = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(data)));
          if(forgotdata.success === true){
            $('#forgotform').trigger('reset');
            $('input[name="femail"]').removeClass('used');
            $('#forErr').addClass('message alert-success');
            $('#forErr').addClass('forErr');
            self.forMsg = forgotdata.message;
            var temp = this;
            setTimeout(function(){
              temp.forMsg = '';
              $('#forErr').removeClass('message alert-success');
              $('#forErr').removeClass('forErr');
            },1500);
          }
          if(forgotdata.success === false){
            this.forMsg = forgotdata.message;
            $('#forErr').addClass('message alert-warning');
            var temp = this;
            setTimeout(function(){
              temp.forMsg = '';
              $('#regErr').removeClass('message alert-warning');
            },3000);
          }
        });
      } else {
        self.forgotemail = 'Invalid E-mail.';
      }
    } else {
      self.forgotemail = 'E-mail is required.';
    }
  }
  verifyOtp() {
    const self = this;
    let otp = $('input[name="verify"]').val();
    console.log(otp);
  }
  socialSignIn(socialPlatform : string) {
    let socialPlatformProvider;
    let self = this;
    if(socialPlatform === "facebook"){
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    }else if(socialPlatform === "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        var regUrl = "http://geomeasure.in/apiv3/api/register";
        if(socialPlatform === "facebook"){
          var facebookdata = new FormData;
          facebookdata.append('username',userData.name);
          facebookdata.append('email',userData.email);
          facebookdata.append('fbid',userData.id);
          facebookdata.append('password',userData.id);
          this.http.post(regUrl,facebookdata).subscribe((data:any)=>{
            var fbdata = data.json();
            if(fbdata.success === 1 || fbdata.success === 0){
              localStorage.setItem('logintoken','axfjbdfeiwns79sc88ea5dad551ed');
              self.suclogin = true;
            }
          });
        }else if(socialPlatform === "google"){
          var googledata = new FormData;
          googledata.append('username',userData.name);
          googledata.append('email',userData.email);
          googledata.append('gplus',userData.id);
          googledata.append('password',userData.id);
          this.http.post(regUrl,googledata).subscribe((data:any)=>{
            var logdata = data.json();
            if(logdata.success === 1 || logdata.success === 0){
              localStorage.setItem('logintoken','axfjbdfeiwns79sc88ea5dad551ed');
              self.suclogin = true;
            }
          });
        }
      }
    );
  }
  logout(){
    var self = this;
    localStorage.removeItem('logintoken');
    self.suclogin = false;
  }
  Userallfile(){
    var self = this;
    var fileData = JSON.parse(localStorage.getItem('allFiles'));
    if(fileData !== null){
      self.userAllFile = [];
      for(var i=0;i<fileData.length;i++){
        self.userAllFile.push({name:fileData[i].name,type:fileData[i].type});
      }
      let polyline = Object.keys(self.userAllFile).filter(function(key) {
        return self.userAllFile[key].type === 'polyline';
      });
      let polygon = Object.keys(self.userAllFile).filter(function(key) {
        return self.userAllFile[key].type === 'polygon';
      });
      if (polyline.length === 0) {
        self.EmptyDist = "Empty Measurement.";
      } else {
        self.EmptyDist = '';
      }
      if (polygon.length === 0) {
        self.EmptyArea = "Empty Measurement.";
      } else {
        self.EmptyArea = '';
      }
    }else{
      self.EmptyDist = "Empty Measurement.";
      self.EmptyArea = "Empty Measurement.";
    }
  }

  //Uisng Animation set map location 
  home(){
    var self =this;
    // self.map.panTo( new google.maps.LatLng(self.userlat,self.userlng));
    self.map.setCenter({lat: parseFloat(self.userlat),lng: parseFloat(self.userlng)});
    self.map.setZoom(17);
  }
  calculation(){
    var self = this;
    if(self.linecalType === "Kilometer" && self.UserDrawtype == "polyline"){
      var total = (self.meter * 0.001).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Kilometer");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Meter" && self.UserDrawtype == "polyline"){
      var total = (parseFloat(self.meter)).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Meter");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Centimeter" && self.UserDrawtype == "polyline"){
      var total = (self.meter * 100).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Centimeter");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Milimeter" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 0.0010000).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Milimeter");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Micrometer" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 0.0000010000).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Micrometer");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Nanometer" && self.UserDrawtype == "polyline"){
      var total = (self.meter * 1000000000).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Nanometer");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Miles" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 1609.344).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Miles");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Yard" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 0.9144).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Yard");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Feet" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 0.3048).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Feet");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Inch" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 0.0254).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Inch");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.linecalType === "Nauticalmeter" && self.UserDrawtype == "polyline"){
      var total = (self.meter / 1852).toFixed(4);
      $('#totalMeter').val("Distance is: "+total+" Nauticalmeter");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "skilometer" && self.UserDrawtype == "polygon"){
      var total = (self.newArea / 1000000).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square kilometer");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "smeter" && self.UserDrawtype == "polygon"){
      var total = (parseFloat(self.newArea)).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square Meter");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "smiles" && self.UserDrawtype == "polygon"){
      var total = (self.newArea / 1609.344).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square Miles");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "syard" && self.UserDrawtype == "polygon"){
      var total = (self.newArea / 0.9144).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square Yard");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }
    }else if(self.areacalType === "sfeet" && self.UserDrawtype == "polygon"){
      var total = (self.newArea * 10.764).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square Feet");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "sinch" && self.UserDrawtype == "polygon"){
      var total = (self.newArea / 0.0254).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Square Inch");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "hectare" && self.UserDrawtype == "polygon"){
      var total = (self.newArea / 10000).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Hectare");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    }else if(self.areacalType === "acre" && self.UserDrawtype == "polygon"){
      var total = (self.newArea * 0.00024711).toFixed(4);
      $('#totalMeter').val("Area is: "+total+" Acre");
      if($('#totalMeter').val().length > 33){
        var w = $('#totalMeter').val().length -33;
        $('#totalMeter').width(250+(w*10));
      }else{
        $('#totalMeter').width(250);
      }
    } else {
      if(self.UserDrawtype == "polyline") {
        var total = (parseFloat(self.meter)).toFixed(4);
        $('#totalMeter').val("Distance is: "+total+" Meter");
        if($('#totalMeter').val().length > 33){
          var w = $('#totalMeter').val().length -33;
          $('#totalMeter').width(250+(w*10));
        }else{
          $('#totalMeter').width(250);
        }
      }
      if(self.UserDrawtype == "polygon") {
        var total = (parseFloat(self.newArea)).toFixed(4);
        $('#totalMeter').val("Area is: "+total+" Square Meter");
        if($('#totalMeter').val().length > 33){
          var w = $('#totalMeter').val().length -33;
          $('#totalMeter').width(250+(w*10));
        }else{
          $('#totalMeter').width(250);
        }
      }
    }
  }
  drawMarker(){
    var self = this;
    for(var i=0; i< self.allMarker.length;i++){
      self.allMarker[i].setMap(null);
      // self.allMarker.slice(i,1);
    }
    self.allMarker = [];
    for(var i=0;i<self.markers.j.length;i++){
      var demo = new google.maps.Marker({position: new google.maps.LatLng(self.markers.j[i].lat(),self.markers.j[i].lng()),icon:icons,map: self.map, draggable:true});
      google.maps.event.addListener(demo, 'position_changed', function(location) {
        var newpath = [];
        for(let i = 0; i < self.allMarker.length; i++) {
          newpath.push(self.allMarker[i].position);
        }
        if(self.UserDrawtype === 'polyline') {
          self.polyShape.setPath(newpath);
          self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
          // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
          self.calculation();
        } else if (self.UserDrawtype === 'polygon') {
          self.drawPolygon.setPath(newpath);
          self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
          // $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
          self.calculation();
        }
      });
      google.maps.event.addListener(demo, 'dragend', function(location) {
        if(self.UserDrawtype === 'polyline') {
          google.maps.event.addListener(self.polyShape.getPath(), "insert_at", function(){
            self.UserPoints = "";
            self.meter = 0;
            self.UserPoints = self.polyShape.getPath().j;
            self.markers = self.polyShape.getPath();
            self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
            // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
            self.calculation();
            self.drawMarker();
            
          });
          google.maps.event.addListener(self.polyShape.getPath(), 'remove_at', function () {
              self.UserPoints = "";
              self.meter = 0;
              self.UserPoints = self.polyShape.getPath().j;
              self.markers = self.polyShape.getPath();
              self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
              // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
              self.calculation();
              self.drawMarker();
          });
          google.maps.event.addListener(self.polyShape.getPath(), "set_at", function(){
            self.UserPoints = "";
            self.meter = 0;
            self.UserPoints = self.polyShape.getPath().j;
            self.markers = self.polyShape.getPath();
            self.meter = (google.maps.geometry.spherical.computeLength(self.polyShape.getPath())).toFixed(4);
            // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
            self.calculation();
            self.drawMarker();
          });
        } else if (self.UserDrawtype === 'polygon') {
          google.maps.event.addListener(self.drawPolygon.getPath(), "insert_at", function(){
            self.UserPoints = "";
            self.area = 0;
            self.UserPoints = self.drawPolygon.getPath().j;
            self.markers = self.drawPolygon.getPath();
            self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
            // $('#totalMeter').val("Area is: "+self.newArea+" Square Meter");
            self.calculation();
            self.drawMarker();
          });
          google.maps.event.addListener(self.drawPolygon.getPath(), 'remove_at', function () {
            self.UserPoints = "";
            self.area = 0;
            self.UserPoints = self.drawPolygon.getPath().j;
            self.markers = self.drawPolygon.getPath();
            self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
            // $('#totalMeter').val("Area is: "+self.newArea+" Square Meter");
            self.calculation();
            self.drawMarker();
            
          });
          google.maps.event.addListener(self.drawPolygon.getPath(), "set_at", function(){
            self.UserPoints = "";
            self.area = 0;
            self.UserPoints = self.drawPolygon.getPath().j;
            self.markers = self.drawPolygon.getPath();
            self.newArea = (google.maps.geometry.spherical.computeArea(self.drawPolygon.getPath())).toFixed(4);
            // $('#totalMeter').val("Area is: "+self.newArea+" Square Meter");
            self.calculation();
            self.drawMarker();
          });
        }
        self.addConfirmwindowtoMarker();
      });
      self.allMarker.splice(i,0,demo);
    }
    self.addConfirmwindowtoMarker();
  }
  addConfirmwindowtoMarker() {
    const self = this;
    for (let i = 0; i < self.allMarker.length; i++) {
      google.maps.event.addListener(self.allMarker[i], 'rightclick', function() {
        self.deleteMenu.open(self.map, self.polyShape.getPath(), i);
      });
    }
  }
  drawFreeHandPolyline(){
    var self = this;
    $('.freehanderase .btn').addClass('erase-btn');
    var polyline=new google.maps.Polyline({map:self.map,clickable:false});
    var move=google.maps.event.addListener(self.map,'mousemove',function(e){
      polyline.getPath().push(e.latLng);
    });
    google.maps.event.addListenerOnce(self.map,'mouseup',function(e){
        google.maps.event.removeListener(move);
        var path=polyline.getPath();
        google.maps.event.clearListeners(self.map, 'mousedown');
        self.user = polyline;
        self.UserPoints = path.j;
        self.freehandlayer = polyline;
        self.meter = (google.maps.geometry.spherical.computeLength(path.j)).toFixed(4);
        // $('#totalMeter').val("Distance is: "+self.meter+" Meter");
        // self.getDistance(path.b);
        self.calculation();
        self.enable()
    });
  }
  drawFreeHandPolygon(){
    var self = this;
    $('.freehanderase .btn').addClass('erase-btn');
    var polygon=new google.maps.Polyline({map:self.map,clickable:false});
    var move= google.maps.event.addListener(self.map,'mousemove',function(e){
      polygon.getPath().push(e.latLng);
    });
    google.maps.event.addListenerOnce(self.map,'mouseup',function(e){
        google.maps.event.removeListener(move);
        var path=polygon.getPath();
        polygon.setMap(null);
        polygon=new google.maps.Polygon({map:self.map,path:path,fillColor:'#1ffc00'});
        google.maps.event.clearListeners(self.map, 'mousedown');
        self.user = polygon;
        self.UserPoints = path.j;
        self.freehandlayer = polygon;
        self.newArea = (google.maps.geometry.spherical.computeArea(path.j)).toFixed(4);
        $('#totalMeter').val("Distance is: "+self.newArea+" Square Meter");
        if($('#totalMeter').val().length > 33){
          var w = $('#totalMeter').val().length -33;
          $('#totalMeter').width(250+(w*10));
        }else{
          $('#totalMeter').width(250);
        }
        // self.getarea(path.b);
        self.enable()
    });
  }
  disable(){
    this.map.setOptions({
        draggable: false, 
        zoomControl: false, 
        scrollwheel: false, 
        disableDoubleClickZoom: false
    });
  }
  enable(){
    this.map.setOptions({
        draggable: true, 
        zoomControl: true, 
        scrollwheel: true, 
        disableDoubleClickZoom: true
    });
  }
  storepointfunc() {
    let today = new Date();
    $('input[name="filename"]').addClass('used');
    $('input[name="filename"]').val('Geomeasure_'+ today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear() + '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds());
    $('#Savemeasurement').modal('show');
  }

  Cancel(){
    var self = this;
    $('#storepointform').trigger('reset');
    $('input[name="filename"]').removeClass('used');
  }

  getLcoationinfo() {
    const self = this;
    $('#poi').modal('hide'); 
    self.cleanMap();
    self.locationset = false;
    google.maps.event.addListener(self.map, 'click', function(e) {
      if(self.locationset === false) {
        self.cleanmap = 1;
        var degree = [e.latLng.lat(),e.latLng.lng()]
        self.marker = new google.maps.Marker({position: new google.maps.LatLng( e.latLng.lat(), e.latLng.lng()),map: self.map,animation: google.maps.Animation.DROP});
        // self.map.setCenter({lat:parseFloat(e.latLng.lat()),lng:parseFloat(e.latLng.lng())});
        for(var i=0;i<degree.length;i++){
          if(i===0){
            self.Dlatitude=Math.sign(degree[i]) >= 0 ? "N" : "S";
            self.Dlatitude+=self.toDegreesMinutesAndSeconds(degree[i]);    
          }else{
            self.Dlongitude=Math.sign(degree[i]) >= 0 ? "E" : "W";
            self.Dlongitude+=self.toDegreesMinutesAndSeconds(degree[i]);    
          }
        }   
        var contentString ="<div style='text-align:center'>Latitude : "+ e.latLng.lat() +"</div>";
          contentString += "<div style='text-align:center'>Longitude : "+ e.latLng.lng() +"</div>";
          contentString += "<div style='text-align:center'>Degree Latitude : "+self.Dlatitude+"</div>";
          contentString += "<div style='text-align:center'>Degree Longitude : "+self.Dlongitude+"</div>";
        self.infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        self.marker.addListener('click', function() {
          self.infowindow.open(self.map, self.marker);
        });
        self.infowindow.open(self.map,self.marker);
        self.locationset = true;
      }
    });
  }
}  