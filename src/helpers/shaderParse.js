function replaceThreeChunkFn(a, b) {
    return THREE.ShaderChunk[b] + '\n';
}

function shaderParse(glsl) {
    return glsl.replace(/\/\/\s?chunk\(\s?(\w+)\s?\);/g, replaceThreeChunkFn);
}

module.exports = shaderParse;