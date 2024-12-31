
function initWebGLStuff(canvas) {
	try {
		helloTriangle(canvas);
	} catch (e) {
		showError(`Uncaught Javascript Exception: ${e}`)
	}
}

function showError(errorText) {
	setTimeout(() => {
		console.log("error text: ", errorText)
	const errorDiv = document.getElementById('preload-notice');
	errorDiv.innerHTML = errorDiv.innerHTML + '\n' + errorText;
	}, 100)

}
// We have to send this raw data to the GPU as a GPU BUFFER. Buffer = chunk of bytes
// Each number is 4 bytes, 6x4 = 24 bytes GPU buffer data
// Next is specify how GPU reads data out of that buffer by declaring ATTRIBUTES for that buffer.
// Only attribute defined here is position, two numbers each a 32 bit float.
// NOW VERTEXT SHADER
// Each vertex is run through program we write to determine where it should go.
// x = -1 left, 1 right, y = -1 bottom, 1 top, z = ..., w = ...

let mywebgl = null;
function helloTriangle(canvas) {
	console.log("hello triangle")
	if (!canvas) {
		showError('Cannot get demo canvas')
		return;
	}
	const gl = canvas.getContext('webgl2');
	if (!gl) {
		const isWebGL1Supported = !!canvas.getContext('webgl');
		if (isWebGL1Supported) {
			showError('This browser supports WebGL 1 but not 2.\nMake sure WebGl2 isn\'t disabled in your browser.')
		} else {
			showError('This browser does not support WebGL 2\nThis demo will not work!')
		}
		return;
	}
	mywebgl = gl;
	// Here is unique weird webgl code because it uses 3 buffers
	// Color buffer - the actual image that has all the colors you're drawing things onto
	// Depth buffer -  stores depth information for each pixel on the output image
	// Stencil buffer - graphics effects
	gl.clearColor(0.48, 0.08, 0.08, 1.0); // defines the preset values for buffers to be cleared to
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // both color and depth are integers with a single bit set to 1, rest 0, so you can | them

	const triangleVerticies = [
		//Top middle
		0.0, 0.5
		// Bottom left
		-0.5, -0.5,
		// Bottom right
		0.5, -0.5,
	]; 
	// GPUs like 32 bit float, JS arrays also not guaranteed that all numbers are
	// next to each other in memory and we want just one chunk of data
	const triangleVerticesCpuBuffer = new Float32Array(triangleVerticies);
	// Create a buffer on the gpu end with gl.createBuffer();
	// webgl buffers are called "Opaque Handles"
	const triangleGeoBuffer = gl.createBuffer();
	// But memory isn't actually created yet and it could be null.
	// Need to first attach this memory to a webgl attachment point
	// Array buffer attachment point for vertex info:
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
	// ARRAY_BUFFER = vertex data
	// STATIC_DRAW = update infrequent, but use often
	// bufferData - initialize and create buffer object's data store
	gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW);
	// Now for gpu code, first tell which version of code to use, 3.0 mobile standard
	// glsl takes inputs through ATTRIBUTES (in)
	// glsl does outputs through gl_Position, every vertex shader needs this set
	const vertexShaderSourceCode = `#version 300 es
		precision mediump float;

		in vec2 vertexPosition;

		void main() {
			gl_Position = vec4(vertexPosition, 0.0, 1.0);
		}
	`;
	// To send this code to the gpu:
	// 1. Create shader
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSourceCode)
	// 2. Setting the source code and compiling it
	gl.compileShader(vertexShader);
	// double check for compilation problems
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		const compileError = gl.getShaderInfoLog(vertexShader);
		showError(`Failed to COMPILE vertex shader - ${compileError}`);
		return;
	}


}





// Next is primitive assembly where GPU figures out what corners go to which triangles. 
// App developers simply tell WebGL to use triangles.

// Next is rasterization

// Last stage is blending/output merging - deciding how to combine fragment shader output and existing image together.
// Default is override.