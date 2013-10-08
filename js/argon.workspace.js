argon.workspace.init = function(){
  argon.workspace.el   = document.getElementById("argonWorkspace");
  argon.workspace.list = document.getElementById("argonWorkspaceList");
  argon.workspace.currentFile = null;
  argon.workspace.workFile = null;
  document.getElementById("argonWorkspaceCollapser").onclick = argon.workspace.toggleCollapsed;
};

argon.workspace.workNew = function(){
  var openFiles = argon.workspace.allFiles();
  var dirty = false;
  for(var i=0; i<openFiles.length; i++) if(openFiles[i].dirty) { dirty = true; break; }
  if(dirty) if(!confirm("Some workspace files are not saved. Proceed?")) return;
  for(var i=0; i<openFiles.length; i++) argon.workspace.close(openFiles[i], true);
  argon.workspace.workFile = null;
};

argon.workspace.workOpen = function(){
  if(argon.workspace.workFile != null) argon.workspace.workNew();
  if(argon.workspace.workFile != null) return;
  
  argon.fileDialog.show("Open Workspace", function(name,path){
    $.ajax({ type:"GET", url:"/pl/argon.pl?q=fs-read&path=" + encodeURIComponent(path) })
     .fail(function(a,b,err){ alert("Error reading workspace!\n(" + err + ')'); })
     .done(function(content){
      if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
      argon.workspace.workOpen_parse(content, path);
    });
  });
};
argon.workspace.workOpen_parse = function(content, workFile){
  content = content.replace('\r',"").trim().split('\n');
  for(var i=0; i<content.length; i++)
  {
    (function(path){
      if(path.length == 0) return;
      var name = path; if(path.indexOf('/') > -1) name = path.substring(path.lastIndexOf('/')+1);
      var final = (i == content.length-1);
      $.ajax({ type:"GET", url:"/pl/argon.pl?q=fs-read&path="+encodeURIComponent(path) })
       .fail(function(a,b,err){ alert("Error loading workspace file \"" + path + "\"!\n(" + err + ')'); })
       .done(function(content){
         if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
         argon.workspace.addFile(name, path, content);
         if(final) argon.workspace.workFile = workFile;
      });
    })(content[i].trim());
  }
};

argon.workspace.workSave = function(){
  if(argon.workspace.workFile != null)
    argon.workspace.workSave_path(argon.workspace.workFile);
  else
    argon.fileDialog.show("Save Workspace", function(name,path){ argon.workspace.workSave_path(path); });
};
argon.workspace.workSave_path = function(workFile){
  var workData="", openFiles=argon.workspace.allFiles();
  for(var i=0; i<openFiles.length; i++)
    workData += openFiles[i].path + '\n';
  
  $.ajax({
      type : "POST",
      url  : "/pl/argon.pl?q=fs-write&path=" + encodeURIComponent(workFile),
      data : workData,
      contentType : "text/plain; charset=UTF-8"
  }).fail(function(){alert("Error saving workspace!");})
    .done(function(content){
      if(content.beginsWith("{\"error\":\"")){ argon.menu.showServerError(content); return; }
      argon.workspace.workFile = workFile;
  });
};

argon.workspace.saveAll = function(){
  var openFiles = argon.workspace.allFiles();
  for(var i=0; i<openFiles.length; i++) openFiles[i].save();
};

argon.workspace.allFiles = function(){
  var openFiles = [], fileHandles = $("#argonWorkspaceList li");
  for(var i=0; i<fileHandles.length; i++)
    openFiles.push(fileHandles[i].argonOwner);
  return openFiles;
};

argon.workspace.setCollapsed = function(collapse){
  argon.workspace.el.style.width = collapse ? "16px" : argon.preferences.data.workspace.width;
  argon.preferences.data.workspace.collapsed = (collapse === true) ? "true" : "false";
  var wrkCnt = document.getElementById("argonWorkspaceContent");
  wrkCnt.style.display = collapse ? "none" : "inline-block";
  wrkCnt.style.width = ((argon.preferences.data.workspace.width.replace("px","") | 0) - 16) + "px";
  var wrkCol = document.getElementById("argonWorkspaceCollapser");
  if(argon.preferences.data.workspace.side == "left")
  {
    wrkCol.style.left  = collapse ? "0px" : wrkCnt.style.width;
    wrkCol.style.right = "";
    wrkCol.style.width = "16px";
    wrkCnt.style.left  = "0px";
    argon.editor.el.style.left = argon.workspace.el.style.width;
    argon.editor.el.style.right = "0px";
  }
  else
  {
    wrkCol.style.left  = "";
    wrkCol.style.right = collapse ? "0px" : wrkCnt.style.width;
    wrkCol.style.width = "16px";
    wrkCnt.style.left  = "16px";
    argon.editor.el.style.right = argon.workspace.el.style.width;
    argon.editor.el.style.left = "0px";
  }
  if(collapse)
  {
   try{ $(argon.workspace.el).resizable("destroy"); } catch(e){;}
  }
  else
    $(argon.workspace.el).resizable({
      handles:((argon.preferences.data.workspace.side == "left")?'e':'w'),
      resize:argon.workspace.resize
    });
};
argon.workspace.toggleCollapsed = function(){
  argon.workspace.setCollapsed(!(argon.preferences.data.workspace.collapsed == "true"));
};
argon.workspace.resize = function(event,ui){
  argon.preferences.data.workspace.width = ui.size.width + "px";
  var wrkCnt = document.getElementById("argonWorkspaceContent");
  wrkCnt.style.width = ((argon.preferences.data.workspace.width.replace("px","") | 0) - 16) + "px";
  var wrkCol = document.getElementById("argonWorkspaceCollapser");
  if(argon.preferences.data.workspace.side == "left")
  {
    wrkCol.style.left  = wrkCnt.style.width;
    wrkCol.style.right = "";
    wrkCol.style.width = "16px";
    argon.editor.el.style.left = argon.workspace.el.style.width;
    argon.editor.el.style.right = "0px";
  }
  else
  {
    wrkCol.style.left = "";
    wrkCol.style.right = wrkCnt.style.width;
    wrkCol.style.width = "16px";
    argon.workspace.el.style.left = "";
    argon.editor.el.style.right = argon.workspace.el.style.width;
    argon.editor.el.style.left = "0px";
  }
};

argon.workspace.addFile = function(name, path, content) {
  var file = new argon.workspace.file(name, path, content);
  argon.workspace.list.appendChild(file.handle);
  argon.workspace.setCurrentFile(file);
};

argon.workspace.close = function(file, force) {
  if((file.dirty) && (force !== true)){
    if(confirm('"' + file.name + "\" isn't saved. Save before closing?"))
    {
      argon.menu.file_save(file, function(){argon.workspace.close(file);});
      return;
    }
  }
  file.handle.parentNode.removeChild(file.handle);
  if(file != argon.workspace.currentFile) return;
  var files = $("#argonWorkspaceList li");
  if(files.length == 0){
    argon.workspace.currentFile = null;
    argon.editor.setText("");
    argon.editor.setMode("text");
    argon.menu.setCurrentLanguage("text");
  }
  else {
    argon.workspace.setCurrentFile(files[0].argonOwner);
  }
};

argon.workspace.setCurrentFile = function(file){
  if(argon.workspace.currentFile)
    argon.workspace.currentFile.getContent();
  argon.workspace.currentFile = file;
  var wasDirty = file.dirty;
  argon.editor.ace.setSession(file.session);
  file.session.setTabSize(argon.preferences.data.editor.tabSize);
  file.session.setUseSoftTabs(argon.preferences.data.editor.tabSoft == "true");
  file.setDirty(wasDirty);
  argon.menu.setCurrentLanguage(argon.workspace.currentFile.type);
  $("#argonWorkspaceList li.activeFile").removeClass("activeFile");
  $(file.handle).addClass("activeFile");
  argon.editor.focus();
};

argon.workspace.guessType = function(name){
  if(name.toLowerCase() == "makefile") return "makefile";
  if(name.beginsWith('.'))    return "dot";
  if(name.endsWith(".asm"  )) return "assembly_x86";
  if(name.endsWith(".ahk"  )) return "autohotkey";
  if(name.endsWith(".bat"  )) return "batchfile";
  if(name.endsWith(".c"    )) return "c_cpp";
  if(name.endsWith(".cpp"  )) return "c_cpp";
  if(name.endsWith(".cs"   )) return "csharp";
  if(name.endsWith(".css"  )) return "css";
  if(name.endsWith(".diff" )) return "diff";
  if(name.endsWith(".go"   )) return "golang";
  if(name.endsWith(".html" )) return "html";
  if(name.endsWith(".ini"  )) return "ini";
  if(name.endsWith(".java" )) return "java";
  if(name.endsWith(".js"   )) return "javascript";
  if(name.endsWith(".json" )) return "json";
  if(name.endsWith(".lua"  )) return "lua";
  if(name.endsWith(".md"   )) return "markdown";
  if(name.endsWith(".m"    )) return "objectivec";
  if(name.endsWith(".h"    )) return "objectivec";
  if(name.endsWith(".pl"   )) return "perl";
  if(name.endsWith(".php"  )) return "php";
  if(name.endsWith(".sh"   )) return "sh";
  if(name.endsWith(".sql"  )) return "sql";
  if(name.endsWith(".mysql")) return "mysql";
  if(name.endsWith(".vbs"  )) return "vbscript";
  if(name.endsWith(".v"    )) return "verilog";
  if(name.endsWith(".xml"  )) return "xml";
  return "text";
};

argon.workspace.file = function(name, path, content, type){
  this.name    = name;
  this.path    = path;
  this.dirty   = false;
  this.handle  = document.createElement("li");
  this.handle.innerText  = name;
  this.handle.argonOwner = this;
  this.handle.onclick    = argon.workspace.file.click;
  if(!type) type = argon.workspace.guessType(name);
  this.type = type;
  this.session = argon.editor.createSession(content, type);
};
argon.workspace.file.prototype.getContent  = function()   { return this.session.getValue();   };
argon.workspace.file.prototype.close       = function()   { argon.workspace.close(this);      };
argon.workspace.file.prototype.save        = function()   { argon.menu.file_save(this);       };
argon.workspace.file.prototype.delete      = function()   { argon.menu.file_delete(this);     };
argon.workspace.file.prototype.rename      = function(to) { argon.menu.file_rename(to, this); };
argon.workspace.file.prototype.setNamePath = function(name,path){
  this.name = name;
  this.path = path;
  this.handle.innerText = this.name + (this.dirty ? '*' : "");
};
argon.workspace.file.prototype.setDirty = function(dirty) {
  this.dirty = dirty;
  this.handle.innerText = this.name + (dirty ? '*' : "");
};
argon.workspace.file.click = function(){ argon.workspace.setCurrentFile(this.argonOwner); };
