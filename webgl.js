let vertexListProperties = [
	//Top middle
	0.0, 0.5
	// Bottom left
	-0.5, -0.5,
	// Bottom right
	0.5, -0.5,
]; 

function initWebGLStuff(canvas) {
	try {
		helloTriangle(canvas);
	} catch (e) {
		showError(`Uncaught Javascript Exception: ${e}`)
	}
}

function showError(errorText) {
	setTimeout(() => {
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

function helloTriangle(canvas) {
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
	// Here is unique weird webgl code because it uses 3 buffers
	gl.clear();
}





// Next is primitive assembly where GPU figures out what corners go to which triangles. 
// App developers simply tell WebGL to use triangles.

// Next is rasterization

// Last stage is blending/output merging - deciding how to combine fragment shader output and existing image together.
// Default is override.