let vertexListProperties = [
	//Top middle
	0.0, 0.5
	// Bottom left
	-0.5, -0.5,
	// Bottom right
	0.5, -0.5,
]; 

function initWebGLStuff(canvas) {
	console.log(canvas);
}

function showError(errorText) {
	const errorDiv = document.getElementById('preload-notice');
	errorDiv.innerHTML = errorDiv.innerHTML + '\n' + errorText;
}

setTimeout(() => {
	console.log("try erro")
	showError("this is what an error looks like");

}, 500)
// We have to send this raw data to the GPU as a GPU BUFFER. Buffer = chunk of bytes
// Each number is 4 bytes, 6x4 = 24 bytes GPU buffer data
// Next is specify how GPU reads data out of that buffer by declaring ATTRIBUTES for that buffer.
// Only attribute defined here is position, two numbers each a 32 bit float.
// NOW VERTEXT SHADER
// Each vertex is run through program we write to determine where it should go.
// x = -1 left, 1 right, y = -1 bottom, 1 top, z = ..., w = ...



// Next is primitive assembly where GPU figures out what corners go to which triangles. 
// App developers simply tell WebGL to use triangles.

// Next is rasterization

// Last stage is blending/output merging - deciding how to combine fragment shader output and existing image together.
// Default is override.