argon.debug.compile = function(path, session){
  $.ajax({ type:"GET", url:"/pl/argon.pl?q=perlcomp&path=" + encodeURIComponent(path) })
   .fail(function(a,b,err){ alert("Error compiling file!\n(" + err + ')'); })
   .done(function(data){ argon.debug.compile_parse(data, session); });
};

argon.debug.compile_parse = function(data, session){
  if(data.beginsWith("Can't open perl script"))
  {
    alert("Error compiling file!\nUnable to open file (bad path?).");
    return;
  }
  data = data.trim().replace('\r',"").split('\n');
  if(data.length == 1) if(data[0].endsWith(" syntax OK")){ session.setAnnotations([]); alert("No errors found."); return; }
  var anns = []; var hit = -1;
  for(var i=0; i<data.length; i++)
  {
    var match = data[i].match(/ at (.+) line ([0-9]+)/);
    if(!match) continue;
    if(hit == -1) hit = match[2]-1;
    anns.push(new argon.debug.annotation(match[2], 1, data[i].replace(match[0],""), "warning"));
  }
  session.setAnnotations(anns);

  if(argon.workspace.currentFile)
    if(argon.workspace.currentFile.session == session)
      argon.editor.ace.scrollToLine(hit, true, false);
};

argon.debug.annotation = function(row,col,msg,type){
  return {
    row    : row-1,
    column : col-1,
    raw    : msg,
    text   : msg,
    type   : type // (error|warning|info)
  };
};

argon.debug.run = function(path, params){
  $.ajax({ type:"GET", url:"/pl/argon.pl?q=perlrun&path=" + encodeURIComponent(path) + "&params=" + encodeURIComponent(params) })
   .fail(function(a,b,err){ alert("Error running file!\n(" + err + ')'); })
   .done(function(data){
     if(data.beginsWith("Can't open perl script")) { alert("Error running file!\nUnable to open file (bad path?)."); return; }
     argon.workspace.addFile("(output)", "", data);
   });
};
