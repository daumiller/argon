argon.editor.init = function(){
  argon.editor.el = document.getElementById("argonEditor");
  if(!argon.editor.ace)
  {
    argon.editor.ace = ace.edit("argonEditor");
    argon.editor.ace.getSession().setMode("ace/mode/text");
    argon.editor.ace.commands.addCommand({ name:"mnuFileNew"         , bindKey:{win:"Ctrl-N", mac:"Command-N"}, exec:function(){argon.menu.file_new();          }, readOnly:true });
    argon.editor.ace.commands.addCommand({ name:"mnuFileOpen"        , bindKey:{win:"Ctrl-O", mac:"Command-O"}, exec:function(){argon.menu.file_open();         }, readOnly:true });
    argon.editor.ace.commands.addCommand({ name:"mnuFileSave"        , bindKey:{win:"Ctrl-S", mac:"Command-S"}, exec:function(){argon.menu.file_save();         }, readOnly:true });
    argon.editor.ace.commands.addCommand({ name:"mnuFileClose"       , bindKey:{win:"Ctrl-W", mac:"Command-W"}, exec:function(){argon.menu.file_close();        }, readOnly:true });
    argon.editor.ace.commands.addCommand({ name:"mnuDebugCompile"    , bindKey:{win:"Ctrl-K", mac:"Command-K"}, exec:function(){argon.menu.debug_compile();     }, readOnly:true });
    argon.editor.ace.commands.addCommand({ name:"mnuWorkspaceSaveAll", bindKey:{win:"Ctrl-E", mac:"Command-E"}, exec:function(){argon.menu.workspace_saveAll(); }, readOnly:true });
  }
};

argon.editor.createSession = function(content, type){
  var sess = new ace.EditSession(content, "ace/mode/" + type);
  sess.argonLang = type;
  sess.on("change", argon.editor.dirty);
  sess.setUndoManager(new ace.UndoManager());
  return sess;
};

argon.editor.getText = function(){
  return argon.editor.ace.getSession().getDocument().getValue();
};

argon.editor.setText = function(text){
  argon.editor.ace.getSession().getDocument().setValue(text);  
};

argon.editor.setMode = function(mode){
  var sess = argon.editor.ace.getSession();
  sess.setMode("ace/mode/" + mode);
  sess.argonLang = mode;
};

argon.editor.dirty = function(){
  if(argon.workspace.currentFile)
    argon.workspace.currentFile.setDirty(true);
  //alert(argon.editor.ace.getSession().argonLang);
};

argon.editor.focus = function(){ argon.editor.ace.focus(); };
