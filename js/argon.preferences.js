argon.preferences.init = function(){
  argon.preferences.el = document.getElementById("argonPrefsDialog");
  $(argon.preferences.el).dialog({
    dialogClass : "jqui-no-close",
    autoOpen    : false,
    modal       : true,
    width       : 380
  });
};

argon.preferences.load = function(success){
  $.getJSON("/pl/argon.pl?q=prefs-read")
  .fail(function(a,b,err){ alert("Error loading preferences!\n(" + err + ')'); })
  .done(function(data){
    argon.preferences.data = data;
    argon.preferences.dialogTo();
    argon.preferences.apply();
    if(success) success();
  });
};

argon.preferences.save = function(){
  $.ajax({
    type : "POST",
    url  : "/pl/argon.pl?q=prefs-write",
    data : JSON.stringify(argon.preferences.data),
    contentType : "text/plain; charset=UTF-8"
  }).fail(function(){alert("Error saving perefences!");});
};

argon.preferences.dialogTo = function(){
  document.getElementById("prefsWorkspaceSideLeft"      ).checked = (argon.preferences.data.workspace.side == "left" );
  document.getElementById("prefsWorkspaceSideRight"     ).checked = (argon.preferences.data.workspace.side == "right");
  document.getElementById("prefsWorkspaceWidth"         ).value   = argon.preferences.data.workspace.width;
  document.getElementById("prefsWorkspaceCollapsedTrue" ).checked = (argon.preferences.data.workspace.collapsed == "true" );
  document.getElementById("prefsWorkspaceCollapsedFalse").checked = (argon.preferences.data.workspace.collapsed == "false");
  document.getElementById("prefsMenuSideTop"            ).checked = (argon.preferences.data.menu.side == "top"   );
  document.getElementById("prefsMenuSideBottom"         ).checked = (argon.preferences.data.menu.side == "bottom");
  document.getElementById("prefsEditorTheme"            ).value   = argon.preferences.data.editor.theme;
  document.getElementById("prefsEditorTabSize"          ).value   = argon.preferences.data.editor.tabSize;
  document.getElementById("prefsEditorSoftTabsTrue"     ).checked = (argon.preferences.data.editor.tabSoft == "true" );
  document.getElementById("prefsEditorSoftTabsFalse"    ).checked = (argon.preferences.data.editor.tabSoft == "false");
  document.getElementById("prefsEditorRulerShowTrue"    ).checked = (argon.preferences.data.editor.rulerShow == "true" );
  document.getElementById("prefsEditorRulerShowFalse"   ).checked = (argon.preferences.data.editor.rulerShow == "false");
  document.getElementById("prefsEditorRulerColumn"      ).value   = argon.preferences.data.editor.rulerColumn;
};

argon.preferences.dialogFrom = function(){
  argon.preferences.data.workspace.side      = (document.getElementById("prefsWorkspaceSideLeft").checked ? "left" : "right");
  argon.preferences.data.workspace.width     =  document.getElementById("prefsWorkspaceWidth").value;
  argon.preferences.data.workspace.collapsed = (document.getElementById("prefsWorkspaceCollapsedTrue").checked ? "true" : "false");
  argon.preferences.data.menu.side           = (document.getElementById("prefsMenuSideTop").checked ? "top" : "bottom");
  argon.preferences.data.editor.theme        =  document.getElementById("prefsEditorTheme").value;
  argon.preferences.data.editor.tabSize      =  document.getElementById("prefsEditorTabSize").value;
  argon.preferences.data.editor.tabSoft      = (document.getElementById("prefsEditorSoftTabsTrue").checked ? "true" : "false");
  argon.preferences.data.editor.rulerShow    = (document.getElementById("prefsEditorRulerShowTrue").checked ? "true" : "false");
  argon.preferences.data.editor.Column       =  document.getElementById("prefsEditorRulerColumn").value;
};

argon.preferences.show = function(){
  argon.preferences.dialogTo();
  $(argon.preferences.el).dialog({
    title   : "Preferences",
    buttons : [ { text:"Save"  , click:argon.preferences.show_save   },
                { text:"Cancel", click:argon.preferences.show_cancel }]
  }).dialog("open");
};

argon.preferences.show_save   = function(){
  argon.preferences.dialogFrom();
  argon.preferences.apply();
  $(argon.preferences.el).dialog("close");
  argon.preferences.save();
};
argon.preferences.show_cancel = function(){ $(argon.preferences.el).dialog("close"); };

argon.preferences.apply = function(){
  var p=argon.preferences.data, w=argon.workspace.el, m=argon.menu.el;
  var e=argon.editor.el, a=argon.editor.ace;
  var workSize = (p.workspace.collapsed == "true") ? "16px" : p.workspace.width;
  switch(p.workspace.side)
  {
    case "left" :
      w.style.left="0px"; w.style.right=""; w.style.width=workSize;
      e.style.left=workSize; e.style.right="0px";
      break;
    case "right":
      w.style.left=""; w.style.right="0px";
      e.style.left="0px"; e.style.right=workSize;
      break;
  }
  switch(p.menu.side)
  {
    case "top":
      m.style.top="0px";  m.style.bottom="";
      w.style.top="28px"; w.style.bottom="0px";
      e.style.top="28px"; e.style.bottom="0px";
      break;
    case "bottom":
      m.style.top="";    m.style.bottom="0px";
      w.style.top="0px"; w.style.bottom="28px";
      e.style.top="0px"; e.style.bottom="28px";
      break;
  }
  a.setTheme("ace/theme/" + p.editor.theme);
  a.setShowPrintMargin(p.editor.rulerShow == "true");
  a.setPrintMarginColumn(p.editor.rulerColumn);
  if(argon.workspace.currentFile)
  {
      argon.workspace.currentFile.session.setTabSize(p.editor.tabSize);
      argon.workspace.currentFile.session.setUseSoftTabs(p.editor.tabSoft == "true");
  }
  argon.workspace.setCollapsed(p.workspace.collapsed == "true");
};
