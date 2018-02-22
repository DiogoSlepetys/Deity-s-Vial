
function loadLoginScene()
{
	loginCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	loginCamera.position.z = 120;
	loginCamera.position.x = 5;
	loginCamera.position.y = 10;
	loginCamera.rotation.x = -0.2;
	
	loginScene = new THREE.Scene();
	
	//Add stuff to scene//
	
	
	//tree
	new THREE.ObjectLoader().load( 'models/commonTrunk.js', function ( object ) {
		object.traverse( function ( o ) {
		if ( o.type == "Mesh" && o.material && ! o.material.transparent ) {
		o.material.side = THREE.DoubleSide;
		}
		var barkTex = new THREE.TextureLoader().load( 'textures/treeBark3.png' );
		var barkTex2 = new THREE.TextureLoader().load( 'textures/treeNorm.png' );
		barkTex.magFilter = THREE.NearestFilter;
		barkTex.minFilter = THREE.LinearMipMapLinearFilter;
		var material = new THREE.MeshPhongMaterial({
		 map: barkTex, shininess: 0.6});
		//material.normalMap = barkTex2;
		material.normalMap = barkTex2;
		material.normalScale = new THREE.Vector2(-1.6,0.1);
		var meshe = new THREE.Mesh(o.geometry, material);
		meshe.scale.x = meshe.scale.y = meshe.scale.z = 16;
		meshe.rotation.y = 1.4;
		meshe.position.y -= 74;
		meshe.position.x += 50;
		meshe.position.z += 0;
		meshe.castShadow = true;
		meshe.receiveShadow = true;
		loginScene.add( meshe );
		} );
	} );
	//end tree
	
	//tree 2
	new THREE.ObjectLoader().load( 'models/commonTrunk.js', function ( object ) {
		object.traverse( function ( o ) {
		if ( o.type == "Mesh" && o.material && ! o.material.transparent ) {
		o.material.side = THREE.DoubleSide;
		}
		var barkTex = new THREE.TextureLoader().load( 'textures/treeBark3.png' );
		var barkTex2 = new THREE.TextureLoader().load( 'textures/treeNorm.png' );
		barkTex.magFilter = THREE.NearestFilter;
		barkTex.minFilter = THREE.LinearMipMapLinearFilter;
		var material = new THREE.MeshPhongMaterial({
		 map: barkTex, shininess: 0.6});
		material.normalMap = barkTex2;
		material.normalScale = new THREE.Vector2(-0.6,0.1);
		var meshe = new THREE.Mesh(o.geometry, material);
		meshe.scale.x = meshe.scale.y = meshe.scale.z = 19;
		meshe.rotation.y = 0.8;
		meshe.position.y -= 74;
		meshe.position.x += -40;
		meshe.position.z += 75;
		meshe.castShadow = true;
		meshe.receiveShadow = true;
		loginScene.add( meshe );
		} );
	} );
	//end tree 2
	
	//caroussel
	new THREE.ObjectLoader().load( 'models/charStands.js', function ( object ) {
		object.traverse( function ( o ) {
		if ( o.type == "Mesh" && o.material && ! o.material.transparent ) {
		o.material.side = THREE.DoubleSide;
		}
		var barkTex = new THREE.TextureLoader().load( 'textures/charStands.png' );
		var barkTex2 = new THREE.TextureLoader().load( 'textures/charStandDis.png' );
		barkTex.magFilter = THREE.NearestFilter;
		barkTex.minFilter = THREE.LinearMipMapLinearFilter;
		var material = new THREE.MeshPhongMaterial({
		 map: barkTex, shininess: 0});
		material.normalMap = barkTex2;
		var glowMat = new OutGlowMaterial( new THREE.Color(0x00ffff));
		carousselChars = new THREE.Mesh(o.geometry, material);
		carousselChars.scale.x = carousselChars.scale.y = carousselChars.scale.z = 15;
		
		carousselChars.position.y -= 50;
		carousselChars.position.x += 50;
		carousselChars.position.z += 0;
		carousselChars.castShadow = true;
		carousselChars.receiveShadow = true;
		loginScene.add( carousselChars );
		} );
	} );
	//end caroussel
	
	//klebinho test//////////////
	{
		var klebGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
		
		klebTex = new THREE.TextureLoader().load( 'textures/fairy1.png' );
		klebTex.magFilter = THREE.NearestFilter;
		klebTex.minFilter = THREE.LinearMipMapLinearFilter;
		
		//klebTex.repeat.x = klebTex.repeat.y = 0.16667;
		//klebTex.offset.x = klebTex.offset.y = 0.8333;
		
		var klebMat = new THREE.MeshPhongMaterial( { map: klebTex, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, emissive: 0x999999 } );
		fairyMesh = new THREE.Mesh( klebGeometry, klebMat );
		fairyMesh.scale.x = fairyMesh.scale.y = fairyMesh.scale.z = 7;
		loginScene.add( fairyMesh );
			
	}
	//klebinho end //////////////
	
	//plane//////////////
	{
		var plGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
		
		var planTex = new THREE.TextureLoader().load( 'textures/grassTile2.png' );
		var dispTex = new THREE.TextureLoader().load( 'textures/normGrass.png' );
		planTex.magFilter = THREE.NearestFilter;
		planTex.minFilter = THREE.LinearMipMapLinearFilter;
		planTex.repeat.x = planTex.repeat.y = 15;
		planTex.wrapS = planTex.wrapT = THREE.RepeatWrapping;
		
		dispTex.magFilter = THREE.NearestFilter;
		dispTex.minFilter = THREE.LinearMipMapLinearFilter;
		dispTex.repeat.x = 15;
		dispTex.repeat.y = 15;
		dispTex.wrapS = dispTex.wrapT = THREE.RepeatWrapping;
		
		var planMat = new THREE.MeshPhongMaterial( { map: planTex, transparent: true, opacity: 1, depthWrite: true, shininess: 0 } );
		var planMesh = new THREE.Mesh( plGeometry, planMat );
		planMat.normalMap = dispTex;
		planMat.normalScale = new THREE.Vector2(-0.6,0.1);
		//planMat.displacementMap = dispTex;
		//planMat.displacementMapScale = 0.0001;
		//planMat.displacementMapBias = 0.0001;
		planMesh.scale.x = planMesh.scale.y = planMesh.scale.z = 280;
		planMesh.rotation.x = -1.56;
		planMesh.position.x = 50;
		planMesh.position.y = -50;
		planMesh.position.z = 0;	
		planMesh.receiveShadow = true;
		loginScene.add( planMesh );
	}
	//plane end //////////////
	
	//particle system///////////////////////////
	{			
		var particles = 600;
			
		logParticleMat = new ParticleMaterial('textures/leafParticle7.png');

		particleGeometry = new THREE.BufferGeometry();
		
		var positions = new Float32Array( particles * 3 );
		var sizes = new Float32Array( particles );
		var normalz = new Float32Array( particles * 3 ); 
		
		for ( var i = 0, i3 = 0; i < particles; i ++, i3 += 3 ) {
		
			positions[ i3 + 0 ] = -100 + Math.random()* 250;//x
			positions[ i3 + 2 ] = -100 + Math.random()* 240;//z
			positions[ i3 + 1 ] = 12 + Math.random()* 70 + positions[ i3 + 2 ]/6;//y
			
			
			normalz [ i3 + 0 ] = 0;
			normalz [ i3 + 1 ] = 1;
			normalz [ i3 + 2 ] = 0;
			
			sizes[ i ] = 30 + 5*(Math.random()*2 -2);
		}
		
		//adds attributes to our shader uniforms
		particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		particleGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		particleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalz, 3 ) );

		var particleSystem = new THREE.Points( particleGeometry, logParticleMat );
		particleSystem.scale = 2;
		loginScene.add( particleSystem );
	}
	//end particle sys
	
	//particle system fruits///////////////////////////
	{			
		var particles = 100;
			
		logParticleFruitsMat = new ParticleMaterial('textures/fruits.png');

		particleGeometry = new THREE.BufferGeometry();
		
		var positions = new Float32Array( particles * 3 );
		var sizes = new Float32Array( particles );
		var normalz = new Float32Array( particles * 3 ); 
		
		for ( var i = 0, i3 = 0; i < particles; i ++, i3 += 3 ) {
		
			positions[ i3 + 0 ] = -100 + Math.random()* 250;//x
			positions[ i3 + 2 ] = -100 + Math.random()* 240;//z
			positions[ i3 + 1 ] = 12 + Math.random()* 40 + positions[ i3 + 2 ]/6;//y
			
			
			normalz [ i3 + 0 ] = 0;
			normalz [ i3 + 1 ] = 1;
			normalz [ i3 + 2 ] = 0;
			
			sizes[ i ] = 30 + 5*(Math.random()*2 -2);
		}
		
		//adds attributes to our shader uniforms
		particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		particleGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		particleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalz, 3 ) );

		var particleSystem = new THREE.Points( particleGeometry, logParticleFruitsMat );
		particleSystem.scale = 2;
		loginScene.add( particleSystem );
	}
	//end particle sys fruits
	
	//particle systemgrass///////////////////////////
	{			
		var particles = 600;
			
		logParticleGrassMat = new ParticleMaterial('textures/deepGrass.png');

		particleGeometry = new THREE.BufferGeometry();
		
		var positions = new Float32Array( particles * 3 );
		var sizes = new Float32Array( particles );
		var normalz = new Float32Array( particles * 3 ); 
		
		for ( var i = 0, i3 = 0; i < particles; i ++, i3 += 3 ) {
		
			positions[ i3 + 0 ] = -100 + Math.random()* 300;
			positions[ i3 + 1 ] = -50;
			positions[ i3 + 2 ] = -150 + Math.random()* 200;
			
			normalz [ i3 + 0 ] = 0;
			normalz [ i3 + 1 ] = 1;
			normalz [ i3 + 2 ] = 0;
			
			sizes[ i ] = 34 - positions[ i3 + 2 ]*Math.random();
		}
		
		//adds attributes to our shader uniforms
		particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		particleGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		particleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalz, 3 ) );
		

		var particleSystem = new THREE.Points( particleGeometry, logParticleGrassMat );
		
		particleSystem.scale = 2;
		loginScene.add( particleSystem );
	}
	//end particle sysgrass

	//particle systemflowers///////////////////////////
	{			
	var particles = 60;
		
	logParticleFlowersMat = new ParticleMaterial('textures/flower1.png');

	particleGeometry = new THREE.BufferGeometry();
	
	var positions = new Float32Array( particles * 3 );
	var sizes = new Float32Array( particles );
	var normalz = new Float32Array( particles * 3 ); 
	
	for ( var i = 0, i3 = 0; i < particles; i ++, i3 += 3 ) {
	
		positions[ i3 + 0 ] = -100 + Math.random()* 300;
		positions[ i3 + 1 ] = -47;
		positions[ i3 + 2 ] = 40 + Math.random()* 30;
		
		normalz [ i3 + 0 ] = 0;
		normalz [ i3 + 1 ] = 1;
		normalz [ i3 + 2 ] = 0;
		
		sizes[ i ] = 22 + Math.random()*5;
	}
	
	//adds attributes to our shader uniforms
	particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	particleGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	particleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalz, 3 ) );
	

	var particleSystem = new THREE.Points( particleGeometry, logParticleFlowersMat );
	
	particleSystem.scale = 2;
	loginScene.add( particleSystem );
	}
	//end particle sysflowers
		
	//scene suspension particles///////////
	{
		var quantPar = 2000;
		var floatyGeometry = new THREE.BufferGeometry();
		
		var starsMaterial = new THREE.PointsMaterial( { transparent: true, opacity: 0.3, depthWrite: false, color: 0xaa9922 } )
		starsMaterial.size = 0.7;
		
		var positions = new Float32Array( quantPar * 3 );
		
		for ( var i = 0, i3 = 0; i < quantPar; i ++, i3 += 3 ) {
		
			positions[ i3 + 0 ] = -150 + Math.random()* 300;
			positions[ i3 + 1 ] =  -20 + Math.random()* 60;
			positions[ i3 + 2 ] = -150 + Math.random()* 300;
		}
		
		//adds attributes to our shader uniforms
		floatyGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		
		pFloatySystem = new THREE.Points( floatyGeometry, starsMaterial );
		loginScene.add( pFloatySystem );
	}
	//end scene suspension particles///////////////
	
	//god rays
	
	var partCount = 3;	
					
	myLightMats = new LightRayMaterial('textures/lightRay4.png');

	
	lightPGeometryx = new THREE.BufferGeometry();
	
	var positionsqw = new Float32Array( partCount * 3 );
	var sizesqw = new Float32Array( partCount );
	
	for ( var i = 0, i3 = 0; i < partCount; i ++, i3 += 3 ) {
	
		positionsqw[ i3 + 0 ] = -30 + Math.random()* 50;
		positionsqw[ i3 + 1 ] = Math.random()* 10;
		positionsqw[ i3 + 2 ] = -50 + Math.random()* 100;
		
		sizesqw[ i ] = 450 + 5*(Math.random()*2 -2);
	}
	//adds attributes to our shader uniforms
	lightPGeometryx.addAttribute( 'position', new THREE.BufferAttribute( positionsqw, 3 ) );
	lightPGeometryx.addAttribute( 'size', new THREE.BufferAttribute( sizesqw, 1 ) );
	
	
	var pLightSystemw = new THREE.Points( lightPGeometryx, myLightMats );
	loginScene.add( pLightSystemw );
	
	//end god rays
	
	initLoginLights();
		
		
}

function initLoginLights()
{
	loginLight = new THREE.PointLight(0xffffdd, 6, 80, 1.3);
	var areaSpots = new THREE.PointLight(0xffffdd, 3, 60, 0.8);
	var direcLight1 = new THREE.AmbientLight(0x303030);

	areaSpots.position.x =0;
	areaSpots.position.z = 40;
	
	loginLight.position.y = -13;
	loginLight.position.x = 0;
	loginLight.position.z = -30;
	loginLight.castShadow = true;
	loginLight.shadow.mapSize.width = 1024;
	loginLight.shadow.mapSize.height = 1024;
	loginLight.shadow.bias = 0.0001;

	loginScene.add(loginLight);
	loginScene.add(direcLight1);
	loginScene.add(areaSpots);
	
	renderer.setClearColor(0x000702);
	renderer.shadowMap.renderReverseSided = true;
	//renderer.gammaInput = true;
	//renderer.gammaOutput = true;
}