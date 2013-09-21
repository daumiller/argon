var argon = { preferences:{}, menu:{}, workspace:{}, editor:{}, fileDialog:{}, debug:{} };

argon.init = function(){
  argon.menu.init();
  argon.workspace.init();
  argon.editor.init();
  argon.fileDialog.init();
  argon.preferences.init();
  argon.preferences.load();
};
