declare var $, google;
export function DeleteMenu() {
    this.div_ = document.createElement('div');
    this.div_.className = 'vertex-menu';
    this.div_.innerHTML = '\
      <button id="vdelete" class="vdelete">Delete</button>\
      <button id="vcancel" class="vcancel">Cancel</button>';
    var menu = this;
    this.isOpen = false;
  }
 
  DeleteMenu.prototype = new google.maps.OverlayView();
  DeleteMenu.prototype.onAdd = function() {
    var deleteMenu = this;
    var map = this.getMap();
    this.getPanes().floatPane.appendChild(this.div_);
    this.divListener_ = google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(e) {
      if (!$(".vertex-menu").find(e.target).length) {
        deleteMenu.close();
      }
    }, true);
  }
  DeleteMenu.prototype.onRemove = function() {
    google.maps.event.removeListener(this.divListener_);
    this.div_.parentNode.removeChild(this.div_);
    this.set('position');
    this.set('path');
    this.set('vertex');
  }
  DeleteMenu.prototype.close = function() {
    if(this) {
      this.setMap(null);
    }
    setTimeout(() => {
      this.isOpen = false;
    }, 200);
  }
  DeleteMenu.prototype.draw = function() {
    var position = this.get('position');
    var projection = this.getProjection();
    if (!position || !projection) {return;}
    var point = projection.fromLatLngToDivPixel(position);
    if(point.x > ((this.getPanes().floatPane.parentNode.offsetLeft) - this.div_.offsetWidth)){
      point.x = point.x - this.div_.offsetWidth - 20;
    }
    if(point.y > ((this.getPanes().floatPane.parentNode.offsetTop) - this.div_.offsetHeight)){
      point.y = point.y - this.div_.offsetHeight;
    }
    this.div_.style.top = point.y + 'px';
    this.div_.style.left = point.x + 'px';
  }
  DeleteMenu.prototype.open = function(map, path, vertex) {
    this.set('position', path.getAt(vertex));
    this.set('path', path);
    this.set('vertex', vertex);
    this.setMap(map);
    this.draw();
    this.isOpen = true;
  }
  DeleteMenu.prototype.removeVertex = function(calllback = null) {
    var path = this.get('path');
    var vertex = this.get('vertex');
    if (!path || vertex == undefined) {
      this.close();
      return;
    }
    if(calllback) {
      calllback(path.j[vertex]);
    }
    path.removeAt(vertex);
    this.close();
  }