"use strict";

function main() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  const bgMusic = new Audio('./music/music.mp3');
  bgMusic.volume = 0.2;
  bgMusic.loop = true;

  const skyboxProgramInfo = webglUtils.createProgramInfo(
    gl, ["sky_vs", "sky_fs"]);

  const quadBufferInfo = primitives.createXYQuadBufferInfo(gl);

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: './images/galaxy.bmp',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: './images/galaxy.bmp',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: './images/galaxy.bmp',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: './images/galaxy.bmp',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: './images/galaxy.bmp',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: './images/galaxy.bmp',
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const { target, url } = faceInfo;

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    const image = new Image();
    image.src = url;
    image.addEventListener('load', function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  requestAnimationFrame(drawScene);

  function drawScene(time) {
    time *= 0.001;

    bgMusic.play();
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      m4.perspective(fieldOfViewRadians, aspect, 0.1, 2000);
    var worldMatrix = m4.xRotation(time * 0.11);
    worldMatrix = m4.scale(worldMatrix, 50, 50, 50);

    var viewDirectionMatrix = m4.copy(view);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    var viewDirectionProjectionMatrix = m4.multiply(
      projectionMatrix, viewDirectionMatrix);
    var viewDirectionProjectionInverseMatrix =
      m4.inverse(viewDirectionProjectionMatrix);

    gl.depthFunc(gl.LEQUAL);

    gl.useProgram(skyboxProgramInfo.program);
    webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);
    webglUtils.setUniforms(skyboxProgramInfo, {
      u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
      u_skybox: texture,
    });
    webglUtils.drawBufferInfo(gl, quadBufferInfo);

    requestAnimationFrame(drawScene);
  }
}

main();