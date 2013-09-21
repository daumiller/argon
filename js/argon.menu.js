argon.menu.init = function(){
  //root menu element
  argon.menu.el = document.getElementById("argonMenu");
  //clicking outside of a floating menu will hide() that menu
  $(document).click(function(){$(".argonMenuFloat").hide();});
  //$(".argonMenuFloat").click(function(e){e.stopPropagation();}); //if we had sub-sub menus
  //set handlers
  var mnuMain = $("li", "#argonMenuMain");
  $(mnuMain[0]).click(argon.menu.showSub);     // Workspace
  $(mnuMain[1]).click(argon.menu.showSub);     // File
  $(mnuMain[2]).click(argon.menu.showSub);     // Language
  $(mnuMain[3]).click(argon.preferences.show); // Preferences
  $(mnuMain[4]).click(argon.menu.showSub);     // Debug
  var mnuWork = $("li", "#argonMenuWorkspace");
  $(mnuWork[0]).click(function(){argon.menu.workspace_new    ();});
  $(mnuWork[1]).click(function(){argon.menu.workspace_open   ();});
  $(mnuWork[2]).click(function(){argon.menu.workspace_save   ();});
  $(mnuWork[3]).click(function(){argon.menu.workspace_saveAll();});
  var mnuFile = $("li", "#argonMenuFile");
  $(mnuFile[0]).click(function(){argon.menu.file_new   ();});
  $(mnuFile[1]).click(function(){argon.menu.file_open  ();});
  $(mnuFile[2]).click(function(){argon.menu.file_save  ();});
  $(mnuFile[3]).click(function(){argon.menu.file_saveAs();});
  $(mnuFile[4]).click(function(){argon.menu.file_close ();});
  $(mnuFile[5]).click(function(){argon.menu.file_rename();});
  $(mnuFile[6]).click(function(){argon.menu.file_delete();});
  $(mnuFile[7]).click(function(){argon.menu.file_create_directory();});
  $(mnuFile[8]).click(function(){argon.menu.file_delete_directory();});
  var mnuLang = $("li", "#argonMenuLanguage");
  $(mnuLang).click(argon.menu.language_click);
  var mnuDebug = $("li", "#argonMenuDebug");
  $(mnuDebug[0]).click(function(){argon.menu.debug_compile   ();});
  $(mnuDebug[1]).click(function(){argon.menu.debug_run       ();});
  //fun colors
  var mnuWorking = $("li", ".argonMenuList");
  for(var i=0; i<mnuWorking.length; i++)
  {
    var h=Math.random();
    var r=(1.0-(Math.abs(0.33-h)*1.5))*155.0; r=Math.floor(100.0+r).toString(16); if(r.length<2) r='0'+r;
    var g=(1.0-(Math.abs(0.66-h)*1.5))*155.0; g=Math.floor(100.0+g).toString(16); if(g.length<2) g='0'+g;
    var b=(1.0-(Math.abs(0.99-h)*1.5))*155.0; b=Math.floor(100.0+b).toString(16); if(b.length<2) b='0'+b;
    mnuWorking[i].style.color = '#' + r + g + b;
  }
  mnuWorking = $("li", ".argonMenuFloat");
  for(var i=0; i<mnuWorking.length; i++)
  {
    var h=Math.random();
    var r=(1.0-(Math.abs(0.33-h)*1.5))*155.0; r=Math.floor(100.0+r).toString(16); if(r.length<2) r='0'+r;
    var g=(1.0-(Math.abs(0.66-h)*1.5))*155.0; g=Math.floor(100.0+g).toString(16); if(g.length<2) g='0'+g;
    var b=(1.0-(Math.abs(0.99-h)*1.5))*155.0; b=Math.floor(100.0+b).toString(16); if(b.length<2) b='0'+b;
    mnuWorking[i].style.color = '#' + r + g + b;
  }
};

argon.menu.showSub = function(e){
  e.stopPropagation();
  $(".argonMenuFloat").hide();
  var myPos = $(this).offset();
  var mnuSub = $("#argonMenu" + this.innerText).toggle()[0];
  mnuSub.style.left = myPos.left + "px";
  if(argon.preferences.data.menu.side == "top")
    { mnuSub.top="28px"; mnuSub.bottom=""; }
  else
    { msnuSub.top=""; mnuSub.bottom="28px"; }
};

argon.menu.workspace_new     = function(){ argon.workspace.workNew();  };
argon.menu.workspace_open    = function(){ argon.workspace.workOpen(); };
argon.menu.workspace_save    = function(){ argon.workspace.workSave(); };
argon.menu.workspace_saveAll = function(){ argon.workspace.saveAll();  };

argon.menu.file_new  = function(){ argon.workspace.addFile("(new file)", "", ""); };
argon.menu.file_open = function(){
  argon.fileDialog.show("Open File", function(name,path){
    $.ajax({
      type : "GET",
      url  : "/pl/argon.pl?q=fs-read&path=" + encodeURIComponent(path)
    })
    .fail(function(a,b,err){ alert("Error loading file!\n(" + err + ')'); })
    .done(function(content){
      if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
      argon.workspace.addFile(name, path, content);
    });
  });
};
argon.menu.file_save = function(saving, success){
  if((!saving) || (!saving.handle))
  {
    if(!argon.workspace.currentFile) return;
    saving = argon.workspace.currentFile;
  }
  if(saving.path == "")
    argon.menu.file_saveAs(saving, success);
  else
  {
    $.ajax({
      type : "POST",
      url  : "/pl/argon.pl?q=fs-write&path=" + encodeURIComponent(saving.path),
      data : saving.getContent(),
      contentType : "text/plain; charset=UTF-8"
    }).fail(function(){alert("Error saving file \"" + name + "\"!");})
      .done(function(content){
        if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
        saving.setDirty(false);
        if(success) success();
      });
  }
};
argon.menu.file_saveAs = function(saving, success){
  if(!saving)
  {
    if(!argon.workspace.currentFile) return;
    saving = argon.workspace.currentFile;
  }
  argon.fileDialog.show("Save File", function(name,path){
    $.ajax({
      type : "POST",
      url  : "/pl/argon.pl?q=fs-write&path=" + encodeURIComponent(path),
      data : saving.getContent(),
      contentType : "text/plain; charset=UTF-8"
    }).fail(function(){alert("Error saving file \"" + name + "\"!");})
      .done(function(content){
        if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
        saving.setNamePath(name,path);
        saving.setDirty(false);
        if(success) success();
      });
  });
};
argon.menu.file_close = function(closing){
  if(!closing)
  {
    if(!argon.workspace.currentFile) return;
    closing = argon.workspace.currentFile;
  }
  argon.workspace.close(closing);
};
argon.menu.file_rename = function(renaming){
  if(!renaming)
  {
    if(!argon.workspace.currentFile) return;
    renaming = argon.workspace.currentFile;
  }
  argon.fileDialog.show("Rename File To", function(name,path){
    $.ajax({
      type : "GET",
      url  : "/pl/argon.pl?q=fs-mv&pathold=" + encodeURIComponent(renaming.path) + "&pathnew=" + encodeURIComponent(path)
    }).fail(function(){alert("Error renaming file!");})
      .done(function(content){
        if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
        renaming.setNamePath(name,path);
      });
  });
};
argon.menu.file_delete = function(deleting){
  if(!deleting)
  {
    if(!argon.workspace.currentFile) return;
    deleting = argon.workspace.currentFile;
  }
  if(!confirm("Really delete file:\n  \"" + deleting.path + '"')) return;
  $.ajax({
    type : "GET",
    url  : "/pl/argon.pl?q=fs-rm&path=" + encodeURIComponent(deleting.path)
  }).fail(function(){alert("Error deleting file (" + deleting.name + ")!");})
    .done(function(content){
      if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
      argon.workspace.close(deleting, true);
    });
};

argon.menu.file_create_directory = function(){
  argon.fileDialog.show("Create Directory", function(name,path){
    name = name.trim(); if(name.length == 0) { alert("New directory name not entered..."); return; }
    $.ajax({ type:"GET", url:"/pl/argon.pl?q=fs-mkdir&path=" + encodeURIComponent(path) })
     .fail(function(a,b,err){ alert("Error creating directory!\n(" + err + ')'); })
     .done(function(content){
       if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
       alert("Created directory " + path);
     });
  });
};

argon.menu.file_delete_directory = function(){
  argon.fileDialog.show("Delete Directory", function(name,path){
    if(path.endsWith('/')) path = path.substring(0, path.length-1);
    path = path.trim(); if(path.length == 0) { alert("Not deleting root directory..."); return; }
    if(!confirm("Really delete directory \"" + path + "\" (and all of its contents)?")) return;
    $.ajax({ type:"GET", url:"/pl/argon.pl?q=fs-rm&path=" + encodeURIComponent(path) })
     .fail(function(a,b,err){ alert("Error deleting directory!\n(" + err + ')'); })
     .done(function(content){
       argon.fileDialog.directory = '/';
       if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
     });
  });
};

argon.menu.language_click = function(){
  argon.editor.setMode(this.innerText);
  $(".argonMenuChecked").removeClass("argonMenuChecked");
  $(this).addClass("argonMenuChecked");
};

argon.menu.debug_compile = function(file){
  if(!file)
  {
    if(!argon.workspace.currentFile) return;
    file = argon.workspace.currentFile;
  }
  if(file.session.argonLang != "perl")
  {
    alert("Compile not available for '" + file.session.argonLang + "' mode.");
    return;
  }
  argon.debug.compile(file.path, file.session);
};
argon.menu.debug_run = function(file, params){
  if(!file)
  {
    if(!argon.workspace.currentFile) return;
    file = argon.workspace.currentFile;
  }
  if(file.session.argonLang != "perl")
  {
    alert("Compile not available for '" + file.session.argonLang + "' mode.");
    return;
  }
  if(!params)
  {
    var params = prompt("Command line parameters: ");
    if(params == null) return;
  }
  argon.debug.run(file.path, params);
};

argon.menu.setCurrentLanguage = function(lang){
  $(".argonMenuChecked").removeClass("argonMenuChecked");
  var langs = $("#argonMenuLanguage li");
  for(var i=0; i<langs.length; i++){
    if(langs[i].innerText == lang)
      { $(langs[i]).addClass("argonMenuChecked"); return; }
  }
};

argon.menu.showServerError = function(content){
  var obj = eval("(function(){ return " + content + "; })();");
  alert(obj.error);
};
