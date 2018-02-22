/* Player Model Loader ///////////////////////////////////////////////////////////////////////////

This Class loads all players and npc's

The constructor generates arrays and a simple quad geometry (not a buffer one, in case we merge stuff)

The loadCharArray function, receives an array of drawing info


/
*/// 03/09/2017 - DS ///////////////////////////////////////////////////////////////////////

class PlayerModelLoader
{
	constructor(){
	
		this.loadedSpriteMaterials = []; //by spritesheet material id
		this.loadedSpriteSheets = []; //by wearable-spritesheet id
		this.onloadSpriteSheets = []; //by material id
		
		//this.loadedPlayers = []; //by player id
		//this.loadedNPCs = []; //by npc id
		
		//Can't use buffer geometry, cuz if we merge it, we lose our UVs:
		this.plane1x2Geometry = new THREE.PlaneGeometry( 1, 1 ); //quad geometry
		
	}
	
	loadCharArray( charsArray )
	{
		var thisClass = this;
		console.log("loading this array:");
		console.log(charsArray);
		
		var spritesheetFolder = cdnServer + '/spritesheets/';
		console.log(spritesheetFolder);
		
		var itemsProcessed = 0;
		
		//load textures:
		for(var i = 0; i < charsArray.length; i++)//for all player models on array:
		{
			
			var equipArray = [
			charsArray[i][3],//head
			charsArray[i][4],//face
			charsArray[i][5],//chest
			charsArray[i][6],//back
			charsArray[i][7],//l-hand
			charsArray[i][8],//r-hand
			charsArray[i][9],//hands
			charsArray[i][10],//legs
			charsArray[i][11],//feet
			charsArray[i][17],//sex
			charsArray[i][18],//hair
			charsArray[i][19],//hair color
			charsArray[i][27]//eyes
			];
			
			console.log("loading this array:");
			console.log(equipArray);
			
			for(var j = 0; j < equipArray.length; j++)//for all equipments
			{
				var elemID = equipArray[j];
				
				if( this.loadedSpriteSheets.indexOf(elemID) > -1 || this.onloadSpriteSheets.indexOf(elemID) > -1 )
				{
					console.log("spritesheet is already loaded or loading...");
					
					itemsProcessed++;
					console.log("loaded " + itemsProcessed + " / " + equipArray.length + " player textures...");
					//console.log(elemID);
				}
				else if( !isNaN(elemID) )//is it a valid ID?
				{
					
					this.onloadSpriteSheets.push(elemID);
					//at id x, push element
					this.loadedSpriteSheets[elemID] = new THREE.TextureLoader().setCrossOrigin('').load( spritesheetFolder + elemID + ".png",
					function()
					{
						console.log("spritesheetFound: " + elemID + ".png");
						console.log(thisClass.loadedSpriteSheets);
						
						var tex = thisClass.loadedSpriteSheets[thisClass.onloadSpriteSheets.indexOf(elemID)];
						tex.magFilter = THREE.NearestFilter;
						tex.minFilter = THREE.LinearMipMapLinearFilter;	
					
						thisClass.loadedSpriteMaterials.push( new THREE.MeshPhongMaterial({ map: tex, shininess: 0.6}));
						
						itemsProcessed++;

						console.log("loaded " + itemsProcessed + " / " + equipArray.length + " player textures...");
						
						if(itemsProcessed == equipArray.length){
							console.log("All Player Textures Loaded!");
							itemsProcessed = 0;
							thisClass.buildCharMesh(equipArray);
						}
					});
				}
			}
		}
		
		//build player mesh group:
		
		//layer 0: skin
		//layer 1: eyes mask
		//layer 2: hair armor
		//layer 3: weapons
		//layer 4: wings
		
	}
	buildCharMesh(equipArray)
	{
		console.log("building Char Mesh");
	}
	
}