/* JS Map/Chunk Async File Loader////////////////////////////////////////////////////////////

To load chunks, we first need to download their info from a CDN, then, load resources.

This function loads a chunk file, then, callbacks.

*/// 27/07/2017 - DS ////////////////////////////////////////////////////////////////////////

var loadedChunkInfoFiles = []
var lddIsInit = false;

function initializeLoadedChunkInfoFilesArray()
{
	for(var i = 0; i < 65535; i++)
	{
		loadedChunkInfoFiles[i] = 0;
	}
	lddIsInit = true;
}

function loadJsFileAsync( path, chunkID, callback )
{
	if(!lddIsInit)
	{
		initializeLoadedChunkInfoFilesArray()
	}
	//console.log(loadedChunkInfoFiles);
	
	if( loadedChunkInfoFiles[parseInt(chunkID)] != 1 ) //if we have NOT loaded this chunkInfo
	{
		var s, ready, t;
		
		ready = false;
		
		s = document.createElement('script'); 
		s.src = path;
		s.type = 'text/javascript';
		s.async = 'true';
		
		
		s.onload = s.onreadystatechange = function() {
	  
			ready = this.readyState;
			//console.log(ready);
			if ( ready && ready != 'complete' && ready != 'loaded' ) return;
			
			try {
				
				//console.log("loaded chunk info");
				callback(); //all loaded, back to main script
				
			} catch(e) { console.log(e); }
		};
		
		//append script
		
		t = document.getElementsByTagName('script')[0];
		t.parentNode.insertBefore(s, t);
		
		//console.log(document.getElementsByTagName('script'));
		
		//save a value in a list, so we know we have the file
		loadedChunkInfoFiles[parseInt(chunkID)] = 1;

	}
}



