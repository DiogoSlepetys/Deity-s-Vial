
var sectorObjects = []; //every mapID contains an array of all objects from a sector

var loadedTextures = []; //every texture processed by THREE loader

var loadedObjects = []; //every full object loaded, to copy faster

function initObjArray()
{
	for(var i = 0; i < 8191; i++)
	{
		loadedObjects[i] = 0;
	}
}

function preloadSector( mapID )
{
	//save only existent, and repeated, IDs to obj2Load
	var obj2Load = [];
	//variables, we have to populate
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
	
	for(var i = 0; i < FirstCon.length; i++)//check all objects we have to load
	{
		if(!loadedObjects[FirstCon])//if the object is not into buffer
		{
			obj2Load.push(FirstCon[i]);//push reference into buffer
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
	}
	
	//now wait for all objects to get loaded into buffer:
	var itemsProcessed = 0;
	
	obj2Load.forEach((item, index, array) => 
	{
		
		//generate a object for each mesh
		
		gameObject[index] = new generateObj(item);
	
		modelPath[index] = 'models/' + gameObject[index].modelFile;
		
		texturePath[index] = 'textures/' + gameObject[index].textureFile;
		
		normalPath[index] = 'textures/' + gameObject[index].normalMapFile;
		
		yPosition[index] = gameObject[index].yPos;
		
		objRand[index] = gameObject[index].random;
		
		scale[index] = gameObject[index].scale;
		
		loadNormal[index] = false;
		
		
	
		objTexture[index] = new THREE.TextureLoader().load( texturePath[index],
		function()
		{	
			objNormalMap[index] = new THREE.TextureLoader().load( normalPath[index],
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
						
						var material = new THREE.MeshPhongMaterial({ map: objTexture[index], shininess: 0.6});
						material.normalMap = objNormalMap[index];
						
						var loaderMesh = new THREE.Mesh(o.geometry, material);
						loaderMesh.scale.x = loaderMesh.scale.y = loaderMesh.scale.z = scale[index];
						loaderMesh.position.y = yPosition[index];
						//loaderMesh.rotation.y = objRand[index];
						//loaderMesh.position.z = objRand[index] * Math.random();
						
						//save mesh to buffer
						loadedObjects[item] = loaderMesh;

						itemsProcessed++;
						//console.log("Sector items processed:"+itemsProcessed + "/" + array.length + "...");
								
					});
					
					if(itemsProcessed == array.length){
						//console.log("Sector Loaded!");
						loadSector( mapID, true );	
					}
				
				});//object loader
			});//normal loader		
		});//texture loader
	});//loop
}


function loadSector( mapID, toAdd )
{
	var objDrawn = []; //the objects we already placed on the scene
	var objMerge = []; //the merged objects
	var objMater = []; //save Materials
	
	if(!toAdd)
	{
		scene.remove(sectorObjects[mapID]);
	}
	else
		switch(mapID)
		{
			case 1:
			{
				var group = new THREE.Group(); //holds all the scenery static stuff
				
				mapPositionX = 0;
				mapPositionZ = 0;
				mapPositionY = -20;
				
				//load the terrain
				//tile system /////////////////////////////	
				var mapPlane = new THREE.BufferGeometry();
				
				var mapNormalMap = new THREE.TextureLoader().load( 'textures/NormalMap.png' );
				mapNormalMap.wrapS = mapNormalMap.wrapT = THREE.ClampToEdgeWrapping;
				mapNormalMap.magFilter = THREE.NearestFilter;
				mapNormalMap.minFilter = THREE.LinearMipMapLinearFilter;
				
				var mapDisplaMap = new THREE.TextureLoader().load( 'textures/DisplacementMap3.png' );
				mapDisplaMap.wrapS = mapNormalMap.wrapT = THREE.ClampToEdgeWrapping;
				mapDisplaMap.magFilter = THREE.NearestFilter;
				mapDisplaMap.minFilter = THREE.LinearMipMapLinearFilter;
																
				var mapTexture = new THREE.TextureLoader().load( 'textures/grassBeach512-2.png' );
				mapTexture.wrapS = mapTexture.wrapT = THREE.ClampToEdgeWrapping;
				mapTexture.magFilter = THREE.NearestFilter;
				mapTexture.minFilter = THREE.LinearMipMapLinearFilter;
				
				//normal map cabable material
				var mapMaterial = new THREE.MeshPhongMaterial( { map: mapTexture, shininess: 1 } );
				var mapMaterialMob = new THREE.MeshBasicMaterial( {map: mapTexture} );
				//lay down a 64x64 tiles map
				var count = 0;
				var normArray = [];
				var xyzArray = [];
				var uvArray = [];
				var idxArray = [];
				var tx, ty;
				
				for(var i = 0; i < 64; i++){
					
					for(var j = 0; j < 64; j++){																					
									
						//merge geometries here
						if(FirstCon.includes(FirstCol[count]))//add the preloaded objects to group
						{
							var bufferedMesh = loadedObjects[FirstCol[count]].clone();
					
							bufferedMesh.position.x += j * 20;
							bufferedMesh.position.z += i * 20;

							//mesh merging/////////////////
							
							if(objDrawn.includes(bufferedMesh.geometry))//works!
							{  
								var geo = new THREE.BufferGeometry();//new geometry to merge all and draw afterwards
								
								
								var indexNow = objDrawn.indexOf(bufferedMesh.geometry);
								
								//merge both equal geometries
								
								//get positions
								var arrayOfPositions = new Float32Array(objMerge[indexNow].attributes.position.array);	
								var offset = arrayOfPositions.length/3;
								var arrayOfPositions2 = new Float32Array(bufferedMesh.geometry.attributes.position.array);
	
								for(var it = 0; it < arrayOfPositions2.length/3; it++)
								{
									arrayOfPositions2[ 3*it ] *= bufferedMesh.scale.x;
									arrayOfPositions2[ 3*it + 1] *= bufferedMesh.scale.y;
									arrayOfPositions2[ 3*it + 2 ] *= bufferedMesh.scale.z;
									
									arrayOfPositions2[ 3*it ] += bufferedMesh.position.x;
									arrayOfPositions2[3*it + 1] += bufferedMesh.position.y;
									arrayOfPositions2[ 3*it + 2 ] += bufferedMesh.position.z;
								}
								
								//concat positions
								var concatPos = new Float32Array(mergeTypedArraysUnsafe(arrayOfPositions, arrayOfPositions2));

								var PositionsBuffer = new THREE.BufferAttribute(concatPos, 3);
								
								geo.addAttribute("position", PositionsBuffer);
								
								//get normals
								var arrayOfNormals = new Float32Array(objMerge[indexNow].attributes.normal.array);	
								var arrayOfNormals2 = new Float32Array(bufferedMesh.geometry.attributes.normal.array);
								
								//concat normals
								var concatNor = new Float32Array(mergeTypedArraysUnsafe(arrayOfNormals, arrayOfNormals2));

								var normBuffer = new THREE.BufferAttribute(concatNor , 3);
								
								geo.addAttribute("normal", normBuffer);
								
								//get uvs
								var arrayOfUvs = new Float32Array(objMerge[indexNow].attributes.uv.array);	
								var arrayOfUvs2 = new Float32Array(bufferedMesh.geometry.attributes.uv.array);
								
								//concat uvs
								var concatUvs = new Float32Array(mergeTypedArraysUnsafe(arrayOfUvs,arrayOfUvs2));
								
								var UvsBuffer = new THREE.BufferAttribute(concatUvs, 2);
								
								geo.addAttribute("uv", UvsBuffer);
									
								//get indexes
								var arrayOfIndex = new Uint32Array(objMerge[indexNow].getIndex().array);	
								var arrayOfIndex2 = new Uint32Array(bufferedMesh.geometry.getIndex().array);
								
								for(var n = 0; n < arrayOfIndex2.length; n++)
								{
									arrayOfIndex2[n] = offset + arrayOfIndex2[n];	
								}
			
								//concat indexes
								var concatInd = new Uint32Array(mergeTypedArraysUnsafe(arrayOfIndex, arrayOfIndex2));
								
								var IndexBuffer = new THREE.BufferAttribute(concatInd, 1);
							
								arrayOfIndex.needsUpdate = true;
								
								geo.setIndex(IndexBuffer);
								//geo.attributes.setIndex(f32Index, 1);
	
								//console.log("merged!");
								
								objMerge[indexNow] = geo;

							}
							else{
								
								objDrawn.push(bufferedMesh.geometry);
								//console.log(objDrawn[0]);
								objMerge.push(bufferedMesh.geometry.clone());
								//console.log(objMerge[0].attributes);
								objMater.push(bufferedMesh.material);
								//console.log(objMater[0]);
							}
							//end mesh merging//////////////////////////////	
							
						}

									
						//grab tile id from map file
						var tileID = FirstMap[count];
						
						tx = Math.floor((tileID-1)/16);
						ty = (tileID-1)%16;
						
						var xz = [ [20*j, 20*i], [20*j+20, 20*i+20] ];
						//select a tile from tilesheet
						var uv = [ [ty*0.0625, 1-(tx*0.0625)], [ty*0.0625 + 0.0625, (1-(tx*0.0625)) - 0.0625] ];
						
						xyzArray.push(xz[0][0], 0, xz[0][1], xz[0][0], 0, xz[1][1], xz[1][0], 0, xz[0][1]);
						xyzArray.push(xz[0][0], 0, xz[1][1], xz[1][0], 0, xz[1][1], xz[1][0], 0, xz[0][1]);
						uvArray.push(uv[0][0], uv[0][1], uv[0][0], uv[1][1], uv[1][0], uv[0][1]);
						uvArray.push(uv[0][0], uv[1][1], uv[1][0], uv[1][1], uv[1][0], uv[0][1]);
						
						normArray.push(0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0);
				
						count++;
					}
				}
				
				//console.log("Finalized");
				//console.log(objMerge);		
				
				for(var objs = 0; objs < objMerge.length; objs++)
				{
					//objBuffGeom = new THREE.BufferGeometry().fromGeometry(objMerge[objs]);
					var sceneMesh = new THREE.Mesh( objMerge[objs], objMater[objs]);
					//var sceneMesh = new THREE.Mesh( objBuffGeom, objMater[objs]);
					//console.log(objMerge[objs]);
					sceneMesh.castShadow = true;
					group.add(sceneMesh);
					//console.log(sceneMesh);
				}
				
				
				var f32pos = new Float32Array(xyzArray);
				var posBuffer = new THREE.BufferAttribute(f32pos, 3);
				var f32uv = new Float32Array( uvArray );
				var uvBuffer = new THREE.BufferAttribute(f32uv, 2);
				var f32norm = new Float32Array( normArray );
				var normBuffer = new THREE.BufferAttribute(f32norm, 3);

				mapPlane.addAttribute("position", posBuffer);
				mapPlane.addAttribute("normal", normBuffer);
				mapPlane.addAttribute("uv", uvBuffer);

				mapMesh = new THREE.Mesh( mapPlane, mapMaterial );
				//center the first tile at 0,-20,0
				mapMesh.position.x = mapPositionX -10;
				mapMesh.position.z = mapPositionZ -10;
				mapMesh.position.y = mapPositionY;
				
				group.add(mapMesh);
				
				mapMesh.receiveShadow = true;
				
				mapMesh.material.normalMap = mapNormalMap;		
				mapMesh.material.displacementMap = mapDisplaMap;
                mapMesh.material.displacementScale = 2.436143;
                mapMesh.material.displacementBias = - 2.428408;			
				//end tile system 3/////////////////////////
				
				//save group for posterior removal
				sectorObjects[mapID] = group; 
				
				//console.log(group);
				
				scene.add(group);
				
				//loginScene.add(group);
				break;
			}
		}
}

function mergeTypedArraysUnsafe(a, b) {
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);

    return c;
}
