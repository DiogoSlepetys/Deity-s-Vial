/* Chunk Manager////////////////////////////////////////////////////////////////////////////

The chunk manager class will receive player position periodically, using those positions
as a reference to know wheter it should load, draw, stop drawing or unload chunks.

The update function shall receive the user spawn/teleport position, loading the
main and neighbour chunks

To make it smooth, we will call a webWorker, for loading those chunks
assinchronously, and await for them to return a loaded chunk, adding it to our scene.

The memory usage from those loaded chunks may be huge, we should clean buffers
every now and then, and when needed

*/// 03/07/2017 - DS ///////////////////////////////////////////////////////////////////////

class ChunkManager
{
	//initialize map generator
	constructor(){
		
		this.nonBufferMapGeometry = [];
		this.mapGeometry = GenerateMapGeometry( this.nonBufferMapGeometry );

		this.loadedTileMaps = [];
		this.loadedChunks = [];
		this.chunksOnLoad = [];
		
		this.tileSheets = [];//all loaded tilesheets: stores materials by texture name/path
		this.tileSheetsMaterials = [];//all materials from tilesheets
		this.tileSheetsOnLoad = [];//all tilesheets in loading state, to avoid duplicates
		this.tileSheetsLoaded = [];
		
		//instatiate AssetsManager
		this.assetManager = new AssetsManager();
		
		var thisClass = this;
		this.materialsLoaded = this.assetManager.materialsLoaded;
		
		//initialize webWorker
		this.chunkWorker = new Worker('classes/WorkerMapLoader.js');//initialize worker

		this.chunkWorker.onmessage = function(event){
			
			console.log("Chunk Merged & received, ID: " + event.data.cid);
			
			//objects
			var posBuffer = new THREE.BufferAttribute(event.data.pos, 3);
			var uvsBuffer = new THREE.BufferAttribute(event.data.uvs, 2);
			var norBuffer = new THREE.BufferAttribute(event.data.nor, 3);
			var idxBuffer = new THREE.BufferAttribute(event.data.idx, 1);

			var chunkBufferGeometry = new THREE.BufferGeometry();
			chunkBufferGeometry.addAttribute("position", posBuffer);
			chunkBufferGeometry.addAttribute("uv", uvsBuffer);
			chunkBufferGeometry.addAttribute("normal", norBuffer);
			chunkBufferGeometry.setIndex(idxBuffer);
			
			//map
			var posBuffer = new THREE.BufferAttribute(new Float32Array(event.data.map[0]), 3);
			var uvsBuffer = new THREE.BufferAttribute(new Float32Array(event.data.uvm), 2);
			var norBuffer = new THREE.BufferAttribute(new Float32Array(event.data.map[1]), 3);
			var idxBuffer = new THREE.BufferAttribute(new Uint32Array(event.data.map[2]), 1);

			var chunkMapGeometry = new THREE.BufferGeometry();
			chunkMapGeometry.addAttribute("position", posBuffer);
			chunkMapGeometry.addAttribute("uv", uvsBuffer);
			chunkMapGeometry.addAttribute("normal", norBuffer);
			chunkMapGeometry.setIndex(idxBuffer);
			
			
			
			//console.log(thisClass.materialsLoaded);

			var materials = thisClass.materialsLoaded;
			
			//add chunk material to materials array
			materials[event.data.tid] = thisClass.tileSheetsMaterials[event.data.tid];
	
			//generate mesh
			var chunkMesh = new THREE.Mesh(chunkBufferGeometry, materials);
			
			//console.log("TEXTURE FOUND:");
			//console.log(event.data.txt);
			//console.log(thisClass.tileSheets);
			//console.log(thisClass.tileSheetsOnLoad.indexOf(event.data.txt));
			
			var matson = new THREE.MeshPhongMaterial({ map: thisClass.tileSheets[thisClass.tileSheetsOnLoad.indexOf(event.data.txt)], shininess: 0.6});
			var mapTestMesh = new THREE.Mesh(chunkMapGeometry, matson);
			
			chunkMesh.geometry.groups = event.data.grp;

			//position chunks using their ID
			//var chunkLine = ~~(event.data.cid/256);
			//var chunkRow = event.data.cid - (chunkLine*256);
			var chunkRow = ~~(event.data.cid/256);
			var chunkLine = event.data.cid - (chunkRow*256);
			
			
			chunkMesh.position.x = chunkLine*1280;
			chunkMesh.position.z = chunkRow*1280;
			
			mapTestMesh.position.x = chunkMesh.position.x;
			mapTestMesh.position.z = chunkMesh.position.z;
			
			chunkMesh.castShadow = true;
			chunkMesh.receiveShadow = true;
			
			mapTestMesh.receiveShadow = true;
			
			//console.log(mapTestMesh);
			
			mapTestMesh.graph = event.data.gra;
			mapTestMesh.chunkId = event.data.id;
			//thisClass.loadedTileMaps.push(mapTestMesh);
			thisClass.loadedTileMaps[event.data.cid] = mapTestMesh;
			//console.log(thisClass.loadedTileMaps);
			//console.log(chunkMesh);
			

			scene.add(chunkMesh);
			scene.add(mapTestMesh);

			
			//save chunk to buffer
			//this.loadedChunks.push(chunkMesh);
			
			//console.log(event.data);
			//console.log(chunkMesh);
			
			//map has been loaded
			//event.data should hold the whole chunk
			//delete chunks when needed, save to memory
		
		}
		
		//this.update( 0, 0 );//initialize main chunk
		//chunkWorker.postMessage( chunkID );	
    }
	
	get loadedMaps()
	{
		return this.loadedTileMaps;
	}
	
	//refresh chunks, call from game loop periodically
	update( initPositionX, initPositionY ){
		
		this.initPositionX = initPositionX;
		this.initPositionY = initPositionY;
		
		//calculates the chunk ID
		var chunkRow = ~~( initPositionX / 1280 );//remainder of div
		var chunkCol = ~~( initPositionY / 1280 );
		
		this.chunkID = chunkCol*256 + chunkRow;
		//this.chunkID = chunkRow*256 + chunkCol;
		//this.chunkID = chunkRow + ~~( chunkCol / 256 ); // 256x256 chunks map
		
		playerCurrentChunk = this.chunkID;
		//console.log("you are at chunk: " + this.chunkID);
		
		//try to load all 9 surrounding chunks
		this.loadChunk( this.chunkID - 257 ); this.loadChunk( this.chunkID - 256 ); this.loadChunk( this.chunkID -255 );
		this.loadChunk( this.chunkID - 1);    this.loadChunk( this.chunkID );       this.loadChunk( this.chunkID + 1 );
		this.loadChunk( this.chunkID + 255 ); this.loadChunk( this.chunkID + 256 ); this.loadChunk( this.chunkID + 257);
    }

	loadChunk( chunkID )
	{
		var thisClass = this;
		
		//if the requested chunk exists...
		if( chunkID >= 0 && chunkID <= 65535 )
		{
			
			//if the requested chunk is loaded
			if( this.chunksOnLoad[chunkID] >= 0 )
			{
				//console.log("chunk is already loaded or loading, ID:" + chunkID);	
			}
			else{//else, load assets from CDN
			
				this.chunksOnLoad[chunkID] = 1;
				//console.log("loading chunk ID: " + chunkID);
				//we must pass the reference into a new variable to use it inside our callbacks
				var assetManagerRef;
				assetManagerRef = this.assetManager;
				
				//loading must be on a callback:
				//first we need the chunk description files, from our CDN:
				
				loadJsFileAsync( cdnServer + "/chunks/" + chunkID + ".js", chunkID, function() {
			
					//the file with chunk info has been loaded, back to chunk generation...		
					var chunkValues = window["chunk" + parseInt(chunkID)];
					//console.log(chunkValues);
					
					//the received file contains:
					//chunkValues[0] //tiles
					//chunkValues[1] //object list
					//chunkValues[2] //equal objs list
					//chunkValues[3] //tilesheet image URL
					
					console.log("text info from chunk: " + chunkID + " received, loading CDN resources...");
					
					//we have a map geometry and info, we still need objects and textures...
					//so we call AssetsManager to manage our loaded stuff by Material indexes.
					//each ID represents both a material, texture, normal map and object.
					//we call it using IDs only, from chunkValues[2].
					//added a final callback...
					
					
					assetManagerRef.loadArrayByMaterial( chunkValues[2], function( objectArrayFromLoader )
					{
						var mArray = objectArrayFromLoader;
						//console.log(mArray);
						
						thisClass.manageTextures( chunkValues[3], function()
						{
							console.log("resources loaded, let's call the worker!!");
							
							//textures are stored as DOM elements, we can't send them to Workers
							//since DOM elements are not thread-safe
							
							//so...
							
							//that's what we need to send to our worker:
							//tiles uv
							//mapGeometry
							//tiles obj
							//the attributes from our objectlArrayFromLoader
							var attributes = [];
							var indexes = [];
							var att;
							
							//separate objects to load:
							for( var i = 0; i < chunkValues[2].length; i++ )
							{
								//console.log(mArray[chunkValues[2][i]]);
								att = mArray[chunkValues[2][i]];
								
								attributes.push([
								    att.geometry.attributes.position.array,//0
									att.geometry.attributes.uv.array,      //1
									att.geometry.attributes.normal.array,  //2
									att.geometry.index.array,              //3 
									att.scale,                             //4
									att.random,                            //5
									att.yPos                               //6
								]);
								
								indexes.push(chunkValues[2][i]);//indexes of objects
							}
							
							//material/texture index
							var texIndex = thisClass.tileSheetsOnLoad.indexOf(chunkValues[3]);
							
							///TO-DO
							//the particle info, to create more geometries
							
							//then...
							
							//the merging will happen into this worker:
							//console.log(thisClass.nonBufferMapGeometry);
							//           tile2uvs       mapGeometry                      tiles2pos        objects[pos,uv,norm,indx] ids    particleinfo   texturepath                        //obj to graph
							var stuff = [chunkValues[0], thisClass.nonBufferMapGeometry, chunkValues[1], attributes,               indexes, "tbd",        chunkValues[3], chunkID, texIndex, chunkValues[1]];	
							thisClass.chunkWorker.postMessage( stuff );
							
							//and finally, the result will receive all materials, at the worker return
							
						});
							
					});	
					
				});		
					
			}
		}
		//this.chunkWorker.terminate();
		
			//if our memmory contains more chunks than it should,
			//clean memmory FIFO way!
			
			//send out chunks to drawing line, remove unnecesssary chunks
			//scene.remove( old chunks )
			//scene.add( new chunks! )
		
	}
	
	manageTextures( texturePath, callback )
	{
		//console.log("loading chunk tilesheet...");
		var thisClass = this;
		//if is loaded or loading, stop this loading, we should be good to go!
		if( this.tileSheetsLoaded.indexOf(texturePath) > -1 || this.tileSheetsOnLoad.indexOf(texturePath) > -1 )
		{
			console.log("tilesheet state: loaded | loading...");
			callback();
		}
		else
		{
			//add to loading 
			thisClass.tileSheetsOnLoad.push(texturePath);
			//load
			thisClass.tileSheets.push(new THREE.TextureLoader().load( texturePath,
			function()
			{
				thisClass.tileSheetsLoaded.push( texturePath );
				
				//console.log(thisClass.tileSheets[thisClass.tileSheetsOnLoad.indexOf(texturePath)]);
				var tex = thisClass.tileSheets[thisClass.tileSheetsOnLoad.indexOf(texturePath)];
				tex.magFilter = THREE.NearestFilter;
				tex.minFilter = THREE.LinearMipMapLinearFilter;	
				
				thisClass.tileSheetsMaterials.push( new THREE.MeshPhongMaterial({ map: tex, shininess: 0.6}));
				//thisClass.tileSheetsMaterials.push( new THREE.MeshLambertMaterial({ map: tex, shininess: 0.6}));
				
				//console.log(thisClass.tileSheets);
				//console.log(thisClass.tileSheetsMaterials);
				callback();
			}));
			
		}
		
	}

}

function GenerateMapGeometry( nonBufferGeometry )//returns a indexed geometry plane, formed from independent quads
{
	var mapGeometry = new THREE.BufferGeometry();
	
	var count = 0;
	var normArrayPart = [];
	var xyzArrayPart  = [];
	var uvArrayPart   = [];
	var indxArrayPart = [];
	
	var tSize = 20;
	var k, l;
	var m = -20;
	
	for(var i = 0; i < 64; i++){
					
		for(var j = 0; j < 64; j++){
			
			k = j*tSize -10;
			l = i*tSize -10;
	
			xyzArrayPart.push(k, m, l, k + tSize, m, l, k, m, l + tSize, k + tSize, m, l + tSize);
			uvArrayPart.push(0, 0, 0, 1, 1, 0, 1, 1);
			normArrayPart.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
			indxArrayPart.push(1+count,0+count,2+count,1+count,2+count,3+count);
			
			count+=4;
		}
	}

	var posBufferP = new THREE.BufferAttribute(new Float32Array(xyzArrayPart), 3);
	var uvBufferP = new THREE.BufferAttribute(new Float32Array(uvArrayPart), 2);
	var normBufferP = new THREE.BufferAttribute(new Float32Array(normArrayPart), 3);
	var indxBuffer = new THREE.BufferAttribute(new Uint16Array(indxArrayPart), 1);

	mapGeometry.addAttribute("position", posBufferP);
	mapGeometry.addAttribute("normal", normBufferP);
	mapGeometry.addAttribute("uv", uvBufferP);
	mapGeometry.addAttribute("index", indxBuffer);
	
	nonBufferGeometry.push(xyzArrayPart, normArrayPart, indxArrayPart);//no need for uvs, we will generate 'em
		
	return mapGeometry;
}

