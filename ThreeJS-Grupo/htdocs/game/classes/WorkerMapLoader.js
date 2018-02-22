/* Chunk WebWorker Loader////////////////////////////////////////////////////////////////////

This file is assinchronously run by webWorkers

Called from ChunkManager.js

It is responsible of merging chunks, returning a multi-material mesh.

Should receive a message with all geometries/materials array, for merging,
the Mesh will be generated on the main program, avoiding the need to load
THREE.js onto this worker.

*/// 03/07/2017 - DS ////////////////////////////////////////////////////////////////////////

//necessary to import THREE

onmessage = function(e){
	
	//we are working with numbers only inside this thread, no objects
	//we can't use DOM elements here
	
	//received info:
	//data[0] = tile values, to uvs
	//data[1] = [pos, norm, indx] from our mapGeometry
	//data[2] = object positions
	//data[3] = [id,pos,uv,norm,indx] from multiple objects
	//data[4] = indexes of data[3] by obj ID
	//data[5] = particle info, tbd
	//data[6] = texturepath
	//data[7] = chunkID for positioning
	//data[8] = texture/material Index for groups
	//data[9] = graph
	
	//console.log("onWorker, chunk:" + e.data[7]);
	
	//first we generate our map UV's////////////////////////////////////////////////////////////////
	
	var tx, ty;
	var count = 0;
	var mapUvArray = [];
	
	for(var i = 0; i < 64; i++){
		for(var j = 0; j < 64; j++){
			
			//grab tile id
			var tileID = e.data[0][count];
			
			tx = Math.floor((tileID-1)/16);
			ty = (tileID-1)%16;

			//select a tile from tilesheet
						//y 0         x 1          y 1                  x 0
			var uv = [ ty*0.0625, 1-(tx*0.0625), ty*0.0625 + 0.0625, (1-(tx*0.0625)) - 0.0625 ];
			
			mapUvArray.push(uv[0], uv[1],
							uv[2], uv[1],
							uv[0], uv[3],
							uv[2], uv[3]);
			
			count++;
		}
	}
	//console.log(mapUvArray);

	//foreach material, we shall: copy, rotate, scale and place object
	//add material to groups afterwards.
	var objectsByMaterial = [];
	
	var count = 0;
	
	var objPositionX, objPositionY, objPositionZ;
	
	//initialize objectsByMaterial
	//saves all object positions in here, adds some random rotations if needed, contains arrays of same material objects, by index
	for( var i = 0; i < e.data[4].length; i++ ){ objectsByMaterial[i] = { name: e.data[4][i], array: [] }; }
	
	for(var i = 0; i < 64; i++){//entire collision tilesheet
					
		for(var j = 0; j < 64; j++){	
		
			var objID = e.data[2][count];
				
			if( objID > 257 )//has object, 257 = collision tile, unused here
			{
				
				var object2Fill = objectsByMaterial.findIndex( function findObjects(object) { 
					return object.name === objID;
				});
				
				//calculate positions
				objPositionX = 20*j;
				objPositionZ = 20*i;
				objPositionY = e.data[3][object2Fill][6];
				
				
				var clone = [
								new Float32Array(e.data[3][object2Fill][0]),
								new Float32Array(e.data[3][object2Fill][1]),
								new Float32Array(e.data[3][object2Fill][2]),
								new Uint32Array(e.data[3][object2Fill][3]),
								e.data[3][object2Fill][4],
								e.data[3][object2Fill][5],
								e.data[3][object2Fill][6]
							];
							
				//has a random rot property, let's rotate...
				/*
				if( e.data[3][object2Fill][5] > 0 )
				{
					var rand = e.data[3][object2Fill][5] * Math.random();
					//rotates along Y axis
					for(var n = 0; n < clone[0].length; n+=3 )
					{
						//clone[n] //x //clone[n+1] //y //clone[n+2] //z
						
						clone[0][n] = clone[0][n]*Math.cos(rand) - clone[0][n]*Math.sin(rand);
						clone[0][n+2]  = clone[0][n+2]*Math.sin(rand) + clone[0][n+2]*Math.cos(rand);
						
					}
				}		
				*/				
				
				//scaling the object...
				
			    for( var n = 0; n < clone[0].length; n++ )
				{ 	
					clone[0][n] = clone[0][n] * clone[4];
				}

				//let's position the object properly on the map...
				
				for( var n = 0; n < clone[0].length; n+=3 )
				{
					clone[0][n] += objPositionX; 
					clone[0][n+1] += objPositionY;
					clone[0][n+2] += objPositionZ;
				}
					
				//end transforms...
				
				objectsByMaterial[object2Fill].array.push( clone );
			}
			
			count++;
		}
	}
	
	//console.log(objectsByMaterial);
	//console.log(e.data[1]);
	//console.log(e.data[4]);
	//All objects are now separated by materials, scaled, rotated, translated
	
	//create groups array...
	var groups = [];
	
	//start after mapGeometry indexes
	//var addedVertex = 24576; ///add plane indexes 
	var addedVertex = 0;
	
	//groups.push({count: addedVertex, materialIndex: e.data[8], start: 0});
	
	for( var len = 0; len < objectsByMaterial.length; len++ )
	{
		//console.log(objectsByMaterial);
		var vertexCount = objectsByMaterial[len].array.length * objectsByMaterial[len].array[0][3].length;
		var groupObj = {count: vertexCount, materialIndex: e.data[4][len], start: addedVertex};
		groups.push(groupObj);
		addedVertex += vertexCount;
	}
	//console.log(groups);
	
	//now, finnaly, create final arrays and... merge!
	
	var pos2Merge = new Float32Array();//e.data[1][0]
	var uvs2Merge = new Float32Array();//mapUvArray
	var nor2Merge = new Float32Array();//e.data[1][1]
	var idx2Merge = new Uint32Array();//e.data[1][2]
	var idx2Merge2;
	var indexOffset = 0;

	
	for( var i = 0; i < objectsByMaterial.length; i++ )
	{
		for( var j = 0; j < objectsByMaterial[i].array.length; j++ )
		{
			pos2Merge = new Float32Array( mergeTypedArraysUnsafe( pos2Merge, objectsByMaterial[i].array[j][0] ));
			uvs2Merge = new Float32Array( mergeTypedArraysUnsafe( uvs2Merge, objectsByMaterial[i].array[j][1] ));
			nor2Merge = new Float32Array( mergeTypedArraysUnsafe( nor2Merge, objectsByMaterial[i].array[j][2] ));
			
			idx2Merge2 = new Uint32Array( objectsByMaterial[i].array[j][3] );
			//offset indexes:
			for( var o = 0; o < idx2Merge2.length; o++ )//for each geometry we are merging, change indexes
			{
				idx2Merge2[o] = indexOffset + idx2Merge2[o];
			}
			
			idx2Merge = new Uint32Array ( mergeTypedArraysUnsafe( idx2Merge, idx2Merge2 ));
			
			indexOffset = pos2Merge.length/3;
		}
	}
	
	//merge tiles...
	/*
	pos2Merge = new Float32Array( mergeTypedArraysUnsafe( e.data[1], pos2Merge ));
	uvs2Merge = new Float32Array( mergeTypedArraysUnsafe( e.data[1], pos2Merge ));
	pos2Merge = new Float32Array( mergeTypedArraysUnsafe( e.data[1], pos2Merge ));
	*/
	//console.log(idx2Merge);
	

	//save info & send back
	var chunkBuffer = {
		pos: pos2Merge,
		uvs: uvs2Merge,
		nor: nor2Merge,
		idx: idx2Merge,
		grp: groups,
		txt: e.data[6],  //texture name
		cid: e.data[7],  
		tid: e.data[8],   //texture Index
		map: e.data[1],
		uvm: mapUvArray,  
		gra: e.data[9]  //graph map
	}

	//console.log(chunkBuffer);
	postMessage(chunkBuffer);
	//postMessage(workerResult);
}

function mergeTypedArraysUnsafe(a, b) 
{
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);

    return c;
}

