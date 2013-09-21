String.prototype.trim=function(){
  return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.endsWith=function(suffix){
  return (this.indexOf(suffix, this.length-suffix.length) != -1);
};
String.prototype.beginsWith=function(prefix){
  return (this.indexOf(prefix) == 0);
};

jQuery.fn.center = function(){
    this.css("position","fixed");
    this.css("top" , Math.max(0,(($(window).height()-$(this).outerHeight())/2)+$(window).scrollTop ()) + "px");
    this.css("left", Math.max(0,(($(window).width() -$(this).outerWidth()) /2)+$(window).scrollLeft()) + "px");
    return this;
}
