
//Outer Glow///////////////////////////////
function OutGlowMaterial( glowColor ) {
	
	this.glowColor = glowColor;
	
		return new THREE.ShaderMaterial({
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
		fog: true,

		uniforms: THREE.UniformsUtils.merge([
		  THREE.UniformsLib["fog"], {
			"c": {
			  type: "f",
			  value: 0.4
			},
			"p": {
			  type: "f",
			  value: 2.5
			},
			glowColor: {
			  type: "c",
			  value: glowColor
			},
			viewVector: {
			  type: "v3",
			  value: {
				x: 0,
				y: 0,
				z: 400
			  }
			},
			fog: true
		  },
		]),

		fragmentShader: [
			'uniform vec3 glowColor;',
			'varying float intensity;',
			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],
			'void main()',
			'{',
			  'vec3 outgoingLight = vec3( 0.0 );',
			  'vec3 glow = glowColor * intensity;',                    
			  
			  'gl_FragColor = vec4(glow, intensity );',
			  THREE.ShaderChunk[ "fog_fragment" ],
			'}'
		  ].join('\n'),

		vertexShader: [
			'uniform vec3 viewVector;',
			'uniform float c;',
			'uniform float p;',
			'varying float intensity;',
			THREE.ShaderChunk[ "fog_pars_vertex" ],
			'void main()',
			'{',
			  'vec3 vNormal = normalize( normalMatrix * normal );',
			  'vec3 vNormel = normalize( normalMatrix * viewVector );',
			  'intensity = pow( c - dot(vNormal, vNormel), p );',
			  'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			  //THREE.ShaderChunk[ "fog_vertex" ],
			'}'
		  ].join("\n")
	  });
}

//Light enabled particles//////////////////////////////
function ParticleMaterial( texPath ) {

	this.texPath = texPath;
	var tex = new THREE.TextureLoader().load(texPath);
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.LinearMipMapLinearFilter;

	var pUniforms= THREE.UniformsUtils.merge([
		THREE.UniformsLib['common'],
		THREE.UniformsLib["fog"],
		THREE.UniformsLib["points"],
		THREE.UniformsLib["distanceRGBA"],
		THREE.UniformsLib["shadowmap"],
		{
		
		fog: true, 
		
		texture: { value: null },
		"sun": {
			  type: "f",
			  value: null
			},
		"light": {
			  type: "v3",
			  value:{x: 0, y: 0, z: 0}
			}
		},
		]);

	pUniforms.texture.value = tex;
	
		return new THREE.ShaderMaterial({
			
			fog: true,
			
			uniforms : pUniforms,	
			
			vertexShader:[
				'attribute float size;',
				'varying lowp vec4 pointCoord;',
				'uniform lowp vec3 light;',
				'varying lowp float distl;',
				'uniform lowp float sun;',
				THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
				THREE.ShaderChunk[ "fog_pars_vertex" ],
				
				'void main() {',
					
					'lowp vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
					'gl_PointSize = size * ( 300.0 / -mvPosition.z );',
					
					'gl_Position = projectionMatrix * mvPosition;',
					//'vertexWorldPos = modelMatrix * vec4( position, 1.0 );',
					
					THREE.ShaderChunk[ "fog_vertex" ],
					THREE.ShaderChunk[ "shadowmap_vertex" ],
					'pointCoord = vec4( position, 1.0 );',
					
					//'lowp float dist = sqrt( ((pointCoord.x - light.x)*(pointCoord.x - light.x)) + ((pointCoord.z - light.z)*(pointCoord.z - light.z)) );',
					
					'lowp vec2 diff = pointCoord.xz - light.xz;',
					'lowp float mult = dot(diff,diff);',
					'lowp float dist = inversesqrt(mult);',
					
					'dist = 80.0*(dist);',
					'lowp vec4 light = vec4(dist*dist, dist, dist, 1.0);',
					'light = normalize(light);',
					'dist = pow(light.x, 4.0);',
					
					'distl = dist + sun;',
					
				'}'
			].join("\n"),
			
			fragmentShader:[
			
				'uniform sampler2D texture;',
				'varying lowp float distl;',

				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				'void main() {',
				
					'float dist = distl;',
					'lowp vec4 light = vec4( dist, dist, dist, 1.0);',
					
					THREE.ShaderChunk[ "fog_fragment" ],
					THREE.ShaderChunk[ "shadowmap_fragment" ],
					'gl_FragColor = vec4(light.rgb, 1.0) * texture2D( texture, gl_PointCoord ).rgba;',

					
					
					'if (gl_FragColor.a < 0.5)//transparency cutout, no blending',
					'{',
						'discard;',
					'}',
					
				'}'
			
			].join("\n"),
			//blending:       THREE.AdditiveBlending,
			depthTest:      true,
			transparent:    true
			
		});
}

//position enabled particles//////////////////////////////
function LightRayMaterial( texPath ) {

	this.texPath = texPath;
	var tex = new THREE.TextureLoader().load(texPath);
	//tex.magFilter = THREE.NearestFilter;
	//tex.minFilter = THREE.LinearMipMapLinearFilter;

	var pUniforms= THREE.UniformsUtils.merge([
		THREE.UniformsLib['common'],
		THREE.UniformsLib["fog"], 
		THREE.UniformsLib["points"],
		THREE.UniformsLib["distanceRGBA"],
		{
		
		fog: true, 
		
		texture: { value: null },

		"light": {
			  type: "v3",
			  value:{x: 0, y: 0, z: 0}
			}
		},
		]);

	pUniforms.texture.value = tex;
	
		return new THREE.ShaderMaterial({
			
			fog: true,
			uniforms : pUniforms,	
			
			vertexShader:[
				'attribute float size;',
				'lowp vec4 pointCoord;',
				'uniform lowp vec3 light;',
				'lowp vec3 lightPos;',
				'varying lowp float disto;',
				THREE.ShaderChunk[ "fog_pars_vertex" ],
				'void main() {',

					'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
					'gl_PointSize = size * ( 200.0 / -mvPosition.z );',
					'gl_Position = projectionMatrix * mvPosition;',
					
					//vertexWorldPos = modelMatrix * vec4( position, 1.0 );,
					//'lightPos = light;',

					'pointCoord = vec4( position, 1.0 );',
					
					'lowp vec2 diff = pointCoord.xz - light.xz;',
					'lowp float mult = dot(diff,diff);',
					'lowp float dist = inversesqrt(mult);',
					
					//'float dist = sqrt( ((pointCoord.x - light.x)*(pointCoord.x - light.x)) - ((pointCoord.z - light.z)*(pointCoord.z - light.z)) );',
					
					'dist = 140.0*(dist);',
					'lowp vec4 light = vec4(dist*dist, dist, dist, 1.0);',
					'light = normalize(light);',
					'dist = pow(light.x, 4.0);',
					'disto = dist + 0.17;',
					THREE.ShaderChunk[ "fog_vertex" ],
				'}'
			].join("\n"),
			
			fragmentShader:[
				'uniform sampler2D texture;',
				'varying lowp float disto;',
				
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				'void main() {',
				
					'float dist = disto;',
					'vec4 lighte = vec4( dist, dist, dist, dist);',		
					THREE.ShaderChunk[ "fog_fragment" ],					
					'gl_FragColor = lighte * texture2D( texture, gl_PointCoord ).rgba;',
					
					'if (gl_FragColor.a < 0.01)//transparency cutout, no blending',
					'{',
						'discard;',
					'}',
				'}'
			
			].join("\n"),
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true
			
		});
}

//unlit particles//////////////////////////////
function UnlitParticleMaterial( texPath ) {

	this.texPath = texPath;
	var tex = new THREE.TextureLoader().load(texPath);
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.LinearMipMapLinearFilter;

	var pUniforms= THREE.UniformsUtils.merge([
		THREE.UniformsLib['common'],
		THREE.UniformsLib["fog"], {
		
		fog: true, 
		
		texture: { value: null }
		},
		]);

	pUniforms.texture.value = tex;
	
		return new THREE.ShaderMaterial({
			
			fog: true,
			uniforms : pUniforms,	
			
			vertexShader:[
				'attribute float size;',
				'vec4 pointCoord;',
				
				'void main() {',

					'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
					'gl_PointSize = size * ( 500.0 / -mvPosition.z );',
					'gl_Position = projectionMatrix * mvPosition;',
					
				'}'
			].join("\n"),
			
			fragmentShader:[
				'uniform sampler2D texture;',
				
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				'void main() {',
												
					'gl_FragColor = texture2D( texture, gl_PointCoord ).rgba;',
					THREE.ShaderChunk[ "fog_fragment" ],
					'if (gl_FragColor.a < 0.01)//transparency cutout, no blending',
					'{',
						'discard;',
					'}',
				'}'
			
			].join("\n"),
			//blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true
			
		});
}

//Light enabled particles plane sys//
function ParticlePlaneMaterial( texPath ) {

	this.texPath = texPath;
	var tex = new THREE.TextureLoader().load(texPath);
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.LinearMipMapLinearFilter;

	var pUniforms= THREE.UniformsUtils.merge([
		THREE.UniformsLib["fog"],
		{
		
		fog: true, 
		texture: { type: "t", value: null },
		
		"camera": {
			  type: "v3",
			  value:{x: 0, y: 0, z: 0}
			},
		"cameraup": {
		  type: "v3",
		  value:{x: 0, y: 0, z: 0}
		},
		"camerart": {
		  type: "v3",
		  value:{x: 0, y: 0, z: 0}
		},
		"sun": {
			  type: "f",
			  value: null
			},
		"light": {
			  type: "v3",
			  value:{x: 0, y: 0, z: 0}
			}
		},
		]);
	
	pUniforms.texture.value = tex;
	
		return new THREE.ShaderMaterial({
			
			fog: true,
			
			uniforms : pUniforms,	
			
			vertexShader:[
				'varying vec2 vUv;',
				'uniform lowp vec3 light;',
				'uniform lowp vec3 camera;',
				'uniform lowp vec3 cameraup;',
				'uniform lowp vec3 camerart;',
				'varying lowp float distl;',
				'uniform lowp float sun;',
				'attribute lowp vec3 centers;',
				THREE.ShaderChunk[ "fog_pars_vertex" ],
				
				'void main() {',
					
					'vUv = uv;',				 //zero rotation
					'lowp vec4 c = modelMatrix * vec4(0.0,0.0,0.0,1.0) + vec4(centers,1.0);',
					'lowp vec3 centers2 = c.xyz/c.w;',
					
					//billboarding
					'lowp vec3 oset = position - centers;',
					'lowp vec3 vertexPosition = centers2 + camerart * oset.x + cameraup * oset.z;',
					
					'lowp vec3 offsetS = vec3(0.0,-30.0,0.0);',
																			//added translation(centers2) fixed shadow glitch(offsetS)
					'lowp vec4 mvPosition = viewMatrix * vec4(vertexPosition+centers2+offsetS, 1.0);',
					'gl_Position = projectionMatrix * mvPosition;',
					
					THREE.ShaderChunk[ "fog_vertex" ],
					
					//lights
					'lowp vec3 lightCenter = vec3(vertexPosition+centers2);',
					'lowp vec2 diff = lightCenter.xz - light.xz;',
					'lowp float mult = dot(diff,diff);',
					'lowp float dist = inversesqrt(mult);',
					
					'dist = 80.0*(dist);',
					'lowp vec4 light = vec4(dist*dist, dist, dist, 1.0);',
					'light = normalize(light);',
					'dist = pow(light.x, 4.0);',
					
					'distl = dist + sun;',
					
					
					
					//this fluctuates fog color, from 0 to 100%, sin
					//'lowp vec4 mvPosition = modelViewMatrix * vec4( centers, 1.0 );',
					
					//this is for single quad particle
					//'gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(-position.x, -position.y, 0.0, 0.0));',
					
					//this pastes stuff directly to HUD
					//'gl_Position = projectionMatrix * (vec4(0.0, 0.0, -1.0, 1.0) + vec4(-position.x, -position.y, -position.z, 0.0));',

					
				'}'
			].join("\n"),
			
			fragmentShader:[

				'varying vec2 vUv;',
				'uniform sampler2D texture;',
				'varying lowp float distl;',
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				
				'void main() {',

					'float dist = distl;',
					'lowp vec4 light = vec4( dist, dist, dist, 1.0);',

					'gl_FragColor = vec4(light.rgb, 1.0) * texture2D( texture, vUv ).rgba;',
					THREE.ShaderChunk[ "fog_fragment" ],
					'if (gl_FragColor.a < 0.1)//transparency cutout',
					'{',
						'discard;',
					'}',
				'}'
			
			].join("\n"),
			
			depthTest: true,
		});
}


//depth material test////////////////
function ParticleDepthMaterial( texPath ) {

	this.texPath = texPath;
	var tex = new THREE.TextureLoader().load(texPath);
	//tex.magFilter = THREE.NearestFilter;
	//tex.minFilter = THREE.LinearMipMapLinearFilter;
	//tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	//tex.anisotropy = 16;

	var pUniforms= THREE.UniformsUtils.merge([
		{ 
		texture: { value: tex }
		},
	]);
	
	pUniforms.texture.value = tex;
	
		return new THREE.ShaderMaterial({
				
			uniforms : pUniforms,	
			
			vertexShader:[
				'varying vec2 vUv;',
				
				'void main() {',
					
					'vUv = uv;',
					
					'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
					
					'gl_Position = projectionMatrix * mvPosition;',
					
					//'gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(position.x, position.y, 0.0, 0.0));',
					
				'}'
			].join("\n"),
			
			fragmentShader:[
				'#include <packing>',
				'varying vec2 vUv;',
				'uniform sampler2D texture;',

				'void main() {',

					'vec4 pixel = texture2D( texture, vUv );',

					'if (pixel.a < 0.5)//transparency cutout, no blending',
					'{',
						'discard;',
					'}',
					'gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );',
	
				'}'
			
			].join("\n"),
			depthTest: false,
			side: THREE.DoubleSide,
		});
}

