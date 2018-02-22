/* Assets Manager///////////////////////////////////////////////////////////////////////////

The Assets Manager class will be responsible of keeping track of loaded assets,
loading necessary assets to buffer.

Every object has a Material, and every texture is part of a Material.
This way, our Buffer will be Material-Oriented

Buffer[

	(ID) [[Material1] [object] [texture] [normalmap]],
	...
]//materialBuffer

This way, when merging our chunk, Materials will hold the same ID as objects, and
the chunk merger will know how to merge everything.

every time a chunk is loaded, we'll update our count/usage buffer:

Buffer[

	(ID) Material [uses] [lastTimeUsed],
	...
]//usesBuffer

If uses reach 0 and lastTimeUsed reaches a number higher than 40 seconds, we
shall remove the Material from Buffer.

*/// 12/07/2017 - DS ///////////////////////////////////////////////////////////////////////

class AssetsManager
{
	constructor(){

		this.materialBuffer = [];//all loaded materials
		this.objectsBuffer = [];//all loaded objects and their params
		this.usesBuffer = [];
		this.timeout = 40;
		
		this.initBuffers();
	}
	get materialsLoaded() {
	
		return this.materialBuffer;	
    }
	
	loadArrayByMaterial( objectID, callback )
	{
		var thisClass = this; // we need a reference
		var itemsProcessed = 0;
		var loadedMeshes = [];
		var idsToLoad = []; 
		
		var gameObject = [];
		var objTexture = [];
		var objNormalMap = [];
		var modelPath = [];
		var texturePath = [];
		var normalPath = [];
		var yPosition = [];
		var scale = [];
		var objRand = [];
		var loadNormal = [];

		//first, check if the ID exists in our array:
		for( var i = 0; i < objectID.length; i++ ){//foreach ID
			
			if( this.materialBuffer[objectID[i]] == 0 )//the object doesn't exist, add to buffer
			{
				idsToLoad.push([objectID[i]]);
				//console.log("Object not in buffer yet!");
			}
			else//the object exists, no need to load, add to itemsProcessed
			{
				itemsProcessed++;
				//console.log("Object already in buffer!!");
			}
			//for each object requested, increase usage buffer
			this.usesBuffer[objectID[i]] += 1; 
		}
		
		console.log("Load The Following IDs: "+ idsToLoad); //ALL FINE!
		
		if(idsToLoad.length < 1)//everything is already loaded, get back!
		{
			callback(thisClass.objectsBuffer);
		}
		
		for(var i = 0; i < idsToLoad.length; i++)//populate arrays
		{
			gameObject.push(0);
			objTexture.push(0);
			objNormalMap.push(0);
			modelPath.push(0);
			texturePath.push(0);
			normalPath.push(0);
			yPosition.push(0);
			scale.push(0);
			objRand.push(0);
			loadNormal.push(0);
		}
		
		//now we load the missing objects
		idsToLoad.forEach((item, index, array) => 
		{
			//generate a object for each mesh
			
			gameObject[index] = getObj(item);
		
			modelPath[index] = cdnServer + '/models/' + gameObject[index].modelFile;
			
			texturePath[index] = cdnServer + '/textures/' + gameObject[index].textureFile;
			
			normalPath[index] = cdnServer + '/textures/' + gameObject[index].normalMapFile;
			
			yPosition[index] = gameObject[index].yPos;
			
			objRand[index] = gameObject[index].random;
			
			scale[index] = gameObject[index].scale;
			
			loadNormal[index] = false;
			
			
			objTexture[index] = new THREE.TextureLoader().setCrossOrigin('').load( texturePath[index],
			function()
			{	
				objNormalMap[index] = new THREE.TextureLoader().setCrossOrigin('').load( normalPath[index],
				function()
				{   
					new THREE.ObjectLoader().load( modelPath[index], function ( object )
					{	
						object.traverse( function ( o ) {
							//if ( o.type == "Mesh" && o.material && ! o.material.transparent ) {
							//o.material.side = THREE.DoubleSide;
							//}
							objTexture[index].magFilter = THREE.NearestFilter;
							objTexture[index].minFilter = THREE.LinearMipMapLinearFilter;	
							
							///TO-DO:
							//if in mobile, we should use a cheap material...
							//var material = new THREE.MeshBasicMaterial({ map: objTexture[index], shininess: 0.6});
							var material = new THREE.MeshPhongMaterial({ map: objTexture[index], shininess: 0.6});
							material.normalMap = objNormalMap[index];
							
							//var material = new THREE.MeshBasicMaterial({map: objTexture[index]});
							
							
							var myMaterialObject = { geometry: o.geometry, scale: scale[index], random: objRand[index], yPos: yPosition[index] };
							
							//save object to buffer
							//thisClass.materialBuffer[item] = loaderMesh;
							thisClass.materialBuffer[item] = material;
							thisClass.objectsBuffer[item] = myMaterialObject;

							itemsProcessed++;
							//console.log("Lazy Loader Processed:"+itemsProcessed + "/" + array.length + "...");
									
						});
						
						if(itemsProcessed == array.length){
							//console.log("All Chunk Meshes Loaded!");
							//console.log(thisClass.materialBuffer);
							callback(thisClass.objectsBuffer);
						}
					
					});//object loader
				});//normal loader		
			});//texture loader
			
			
		});
	}
	
	initBuffers()// suposing we'll have 9000 diferent objects in our game...
	{
		for(var i = 0; i < 9000; i++){
			this.materialBuffer[i] = 0;
			this.objectsBuffer[i] = 0;
		}//now we can change values by position, and this array will ocupy a small space in memory
	}
	
	cleanBuffer()
	{
		for( var i = 0; i < this.usesBuffer.lenght; i++ ){
			
			//if material has 0 uses and exceeded timeout, clean it
			if( this.usesBuffer[i][0] == 0 && this.usesBuffer[i][1] > this.timeout ){
				materialBuffer[i] == null; // remove material from memory
			}
		}
	}
}