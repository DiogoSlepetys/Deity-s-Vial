var tileArray = [];
var bau = "await";

	var image = document.createElement( 'img' );
	bau = "created";
	
	image.addEventListener( 'load', function ( ) {
		bau = "!!!";
		var tileArray = new Array();

		// texture 1

		var canvas = document.createElement( 'canvas' );    
		canvas.width = 32;
		canvas.height = 32;

		var context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0, 32, 32, 0, 0, 32, 32);

		var texture = new THREE.Texture( canvas );
		texture.needsUpdate = true; 

		tileArray[0] = new THREE.MeshBasicMaterial({map: texture});
		bau = "loaded";
		// texture 2

	}, false );
	image.src = 'textures/grassBeach512.png';
	