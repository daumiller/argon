use strict;
use warnings;
use CGI;
use JSON;
use File::Slurp;
use File::Path 'remove_tree';
use MIME::Base64;

my $relativeRoot = "/var/www.argon";
my $preferences  = $relativeRoot . "/preferences.json";
my $filesystem   = $relativeRoot . "/fs";
my $cgi = CGI->new();
argonHelper();

sub argonHelper {
  my $q = anyParam('q');
  four04() if(!defined $q);
  
  prefsRead ()  if($q eq 'prefs-read' );
  prefsWrite()  if($q eq 'prefs-write');
  fsList()      if($q eq 'fs-ls');
  fsRename()    if($q eq 'fs-mv');
  fsDelete()    if($q eq 'fs-rm');
  fsMakeDir()   if($q eq 'fs-mkdir');
  fsRead()      if($q eq 'fs-read');
  fsWrite()     if($q eq 'fs-write');
  fsWriteB64()  if($q eq 'fs-writeb64');
  perlCompile() if($q eq 'perlcomp');
  perlRun()     if($q eq 'perlrun');

  four04();
}

sub anyParam {
  my $name = shift;
  if(defined $cgi->    param($name)) { return $cgi->    param($name); }
  if(defined $cgi->url_param($name)) { return $cgi->url_param($name); }
  return undef;
}

sub prefsRead {
  prefsDefault() if(!-f $preferences);
  textPlain(read_file($preferences));
}

sub prefsWrite {
  four04() if(!defined $cgi->param('POSTDATA'));
  write_file($preferences, $cgi->param('POSTDATA'));
  textPlain(read_file($preferences));
}

sub prefsDefault {
  my %workspaceObj;
  $workspaceObj{'side'     } = 'right';
  $workspaceObj{'width'    } = '128px';
  $workspaceObj{'collapsed'} = 'false';
  # - - - - - - - - - -
  my %menuObj;
  $menuObj{'side'} = 'top';
  # - - - - - - - - - -
  my %editorObj;
  $editorObj{'theme'      } = 'monokai';
  $editorObj{'tabSize'    } = '2';
  $editorObj{'tabSoft'    } = 'true';
  $editorObj{'rulerShow'  } = 'true';
  $editorObj{'rulerColumn'} = '132';
  # - - - - - - - - - -
  my %prefObj;
  $prefObj{'workspace'} = \%workspaceObj;
  $prefObj{'menu'     } = \%menuObj;
  $prefObj{'editor'   } = \%editorObj;
  # - - - - - - - - - -
  textPlain(encode_json(\%prefObj));
}

sub fsList {
  my $path = anyParam('path');
  four04() if(!defined $path);
  $path = $filesystem . $path;
  four04() if(!-d $path);
  my @lst; my $handle;
  opendir($handle, $path);
  while(my $entry = readdir($handle)) {
    next if($entry eq '.' );
    next if($entry eq '..');
    my $fullPath = $path . '/' . $entry;
    if(-d $fullPath) {
      my %entryObj;
      $entryObj{'type'} = 'd';
      $entryObj{'name'} = $entry;
      push(@lst, \%entryObj);
    }
    if(-f $fullPath) {
      my %entryObj;
      $entryObj{'type'} = 'f';
      $entryObj{'name'} = $entry;
      push(@lst, \%entryObj);
    }
  }
  closedir($handle);
  textPlain(encode_json(\@lst));
}

sub fsRead {
  my $path = anyParam('path');
  four04() if(!defined $path);
  $path = $filesystem . $path;
  four04() if(!-f $path);
  my $content = read_file($path);
  textPlain($content);
}

sub fsWrite {
  my $name = anyParam('path');
  four04() if(!defined $name);
  four04() if(!defined $cgi->param('POSTDATA'));
  my $path = $filesystem . $name;
  eval {
    write_file($path, $cgi->param('POSTDATA'));
    1;
  } or do {
    my $err = $@;
    objError("Error writing to \"$name\" ($err).");
  };
  objSuccess();
}

sub fsWriteB64 {
  my $name = anyParam('path');
  four04() if(!defined $name);
  four04() if(!defined $cgi->param('POSTDATA'));
  my $path = $filesystem . $name;
  my $data = $cgi->param('POSTDATA');
  $data = substr($data, index($data, ',')+1); # read past first comma
  $data = decode_base64($data);               # decode
  eval {
    write_file($path, $data);
    1;
  } or do {
    my $err = $@;
    objError("Error writing to \"$name\" ($err).");
  };
  objSuccess();
}

sub fsRename {
  my $name = anyParam('pathold'); four04() if(!defined $name); my $old = $filesystem . $name;
  my $new  = anyParam('pathnew'); four04() if(!defined $new );    $new = $filesystem . $new ;
  four04() if((!-f $old) && (!-d $old));
  objError("Cannot rename. Destination path already exists.") if((-f $new) || (-d $new));
  if(rename($old,$new))
    { objSuccess(); }
  else
    { objError("Error renaming path ($@)."); }
}

sub fsDelete {
  my $name = anyParam('path'); four04() if(!defined $name);
  my $path = $filesystem . $name;
  four04() if((!-f $path) && (!-d $path));
  if(-f $path) {
    my $unlinked = unlink($path);
    if($unlinked != 1) { objError("Error deleting file \"$name\"."); } else { objSuccess(); }
  }
  if(-d $path) {
    remove_tree($path, {error => \my $err} );
    if(@$err) {
      objError("Error removing directory \"$name\".");
    } else { objSuccess(); }
  }
  four04();
}

sub fsMakeDir {
  my $name = anyParam('path'); four04() if(!defined $name);
  my $path = $filesystem . $name;
  if(mkdir($path)) { objSuccess(); } else { objError("Error creating directory \"$name\"."); }
}

sub perlCompile {
  my $path = anyParam('path'); four04() if(!defined $path);
  $path = $filesystem . $path;
  my $result = `perl -c $path 2>&1`;
  textPlain($result);
}

sub perlRun {
  my $path = anyParam('path'); four04() if(!defined $path);
  my $params = anyParam('params'); $params='' if(!defined $params);
  $path = $filesystem . $path;
  my $result = `perl $path $params 2>&1`;
  textPlain($result);
}

sub objError {
  my %obj;
  $obj{'error'} = shift;
  textPlain(encode_json(\%obj));
}

sub objSuccess {
  textPlain("{success:true}");
}

sub textPlain {
  my $content = shift;
  print "Content type: text/plain; charset=utf-8\r\n\r\n";
  print $content;
  exit 0;
}

sub four04 {
  print "Status: 404 Not Found\r\n\r\n";
  exit 0;
}
