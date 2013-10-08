argon.fileDialog.init = function(){
  argon.fileDialog.el = document.getElementById("argonFileDialog");
  argon.fileDialog.directory = "/";
  $(argon.fileDialog.el).dialog({
      dialogClass : "jqui-no-close",
      autoOpen    : false,
      modal       : true,
      width       : 500
    });
};

argon.fileDialog.show = function(title, success, cancelled){
  var dir = argon.fileDialog.directory;
  document.getElementById("argonFileName").value = "";
  argon.fileDialog.setDirectory(dir, function(){
    $(argon.fileDialog.el).dialog({
      title   : title,
      buttons : [
        { text: "OK"    , click:function(){ argon.fileDialog.commit(success); $(this).dialog("close"); } },
        { text: "Cancel", click:function(){ if(cancelled) cancelled();        $(this).dialog("close"); } }
      ]
    }).dialog("open");
  });
};

argon.fileDialog.commit = function(fn){
  var name = document.getElementById("argonFileName").value;
  var path = argon.fileDialog.directory; if(path!="/")path+='/'; path+=name; path=path.replace("//",'/');
  fn(name, path);
};

argon.fileDialog.setDirectory = function(dir,success){
  var crumbParent = document.getElementById("argonFileCrumbs");
  var listParent  = document.getElementById("argonFileBody"  );
  while(crumbParent.childNodes.length > 0) crumbParent.removeChild(crumbParent.childNodes[0]);
  while(listParent .childNodes.length > 0) listParent .removeChild(listParent .childNodes[0]);
  document.getElementById("argonFileName").value = "";
  
  $.getJSON("/pl/argon.pl?q=fs-ls&path=" + encodeURIComponent(dir))
    .fail(function(a,b,err){ argon.fileDialog.directory='/'; alert("Error changing directory!"); })
    .done(function(data){
      //populate breadcrumbs
      crumbParent.appendChild(argon.fileDialog.createCrumbEntry("/","/"));
      var fsup = dir.split('/'), running = '/';
      for(var i=0; i<fsup.length; i++)
      {
        if(fsup[i].trim().length == 0) continue;
        running = running + ((running == '/') ? "" : '/') + fsup[i];
        crumbParent.appendChild(argon.fileDialog.createCrumbEntry(fsup[i], running));
      }
      //populate table/list
      data.sort(argon.fileDialog.sortFiles);
      argon.fileDialog.directory = dir;
      for(var i=0; i<data.length; i+=3)
      {
        var r = document.createElement("tr");
        if(i+0<data.length){var c=argon.fileDialog.createListEntry(dir,data[i+0].name,data[i+0].type); r.appendChild(c);}
        if(i+1<data.length){var c=argon.fileDialog.createListEntry(dir,data[i+1].name,data[i+1].type); r.appendChild(c);}
        if(i+2<data.length){var c=argon.fileDialog.createListEntry(dir,data[i+2].name,data[i+2].type); r.appendChild(c);}
        listParent.appendChild(r);
      }
      if(success) success();
    });
};

argon.fileDialog.sortFiles = function(a,b)
{
  if(a.type == b.type) return (a.name > b.name) ? 1 : -1;
  if(a.type == 'd') return -1;
  return 1;
};

argon.fileDialog.createListEntry = function(dir, name, type){
  var span = document.createElement("span");
  span.className = "argonFileListItem";
  span.argonDir  = dir;
  span.argonName = name;
  span.argonType = type;
  span.onclick = argon.fileDialog.listEntryClicked;
  span.innerText = ' ' + name;
  var icon = document.createElement("img");
  icon.src = "/img/" + ((type == 'd') ? "directory" : "file") + ".png";
  span.insertBefore(icon, span.childNodes[0]);
  var td = document.createElement("td");
  td.appendChild(span);
  return td;
};

argon.fileDialog.listEntryClicked = function(){
  if(this.argonType == 'f')
    document.getElementById("argonFileName").value = this.argonName;
  else
    argon.fileDialog.setDirectory(this.argonDir + ((this.arginDir == '/') ? "": '/') + this.argonName);
};

argon.fileDialog.createCrumbEntry = function(name, path){
  var li = document.createElement("li");
  li.innerText = name;
  li.argonPath = path;
  li.onclick   = argon.fileDialog.crumbEntryClicked;
  return li;
};

argon.fileDialog.crumbEntryClicked = function(){ argon.fileDialog.setDirectory(this.argonPath); };
