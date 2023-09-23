"use strict";

async function main() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");

  if (!gl) {
    return;
  }

  const pew = new Audio('./music/pew.mp3');
  const explosion = new Audio('./music/explosion.mp3');
  pew.volume = 0.1;

  const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 0.1);

  var programInfo = webglUtils.createProgramInfo(gl, ["cube_vs", "cube_fs"]);
  var sphereProgramInfo = webglUtils.createProgramInfo(gl, ["ball_vs", "ball_fs"]);

  const cubeTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTex);

  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: './images/toto.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: './images/toto.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: './images/toto.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: './images/toto.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: './images/toto.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: './images/toto.jpg',
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
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTex);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  var cubes = cubePositions.map((position) => ({
    position,
    visible: true,
  }));

  var cubeUniforms = {
    u_matrix: m4.identity(),
    u_texture: cubeTex,
    u_LightPosition: ballPosition,
    u_CameraPosition: cameraPosition,
  };

  function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation, scale) {
    var matrix = m4.identity();
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, xRotation);
    matrix = m4.yRotate(matrix, yRotation);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    return m4.multiply(viewProjectionMatrix, matrix);
  }

  const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 5, 6, 3);

  var ballVelocity = [0, 0, 0];
  var ballVerticalVelocity = 0.5;

  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      shootBall();
    }
  });

  function shootBall() {
    if (ammo > 0) {
      pew.play();
      var rayDirection = m4.normalize(m4.subtractVectors(target, cameraPosition));

      ballPosition = cameraPosition.slice();
      ballVelocity = [rayDirection[0] * 2, rayDirection[1] * 2 + ballVerticalVelocity, rayDirection[2] * 2];
      ammo -= 1;
    }
  }

  function updateBallPosition() {
    ballVelocity[1] += -0.015;

    for (var i = 0; i < 3; i++) {
      ballPosition[i] += ballVelocity[i] * 2;
    }
  }

  function checkCollision(position) {
    var i = 0;
    for (const cube of cubes) {
      if (cube.visible) {
        const distance = m4.distance(position, cube.position);
        if (distance < 60) {
          cube.visible = false;
          melons[i].visible = false;
          explosion.play();
          return true;
        }
      }
      i++
    }
    return false;
  }

  requestAnimationFrame(drawScene);

  function drawScene(time) {
    time *= 0.001;

    const cubeMovement = [
      [35, -30 * Math.sin(time * 1), 80],
      [-40, 10 * Math.sin(time * 1), -90],
      [150, 50 * Math.sin(time * 1), -400],
      [80, -70 * Math.sin(time * 1), -600],
      [-80, -50 * Math.sin(time * 1), -500],
    ]

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    updateBallPosition();

    ballPosition[0] += ballVelocity[0] * 2;
    ballPosition[1] += ballVelocity[1] * 2;
    ballPosition[2] += ballVelocity[2] * 2;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      m4.perspective(fov, aspect, 0.1, 2000);
    var invertedCamera = m4.inverse(camera);
    var viewProjectionMatrix = m4.multiply(
      projectionMatrix,
      invertedCamera
    )

    var melonCenter = [ballPosition[0], ballPosition[1] - 50, ballPosition[2]];

    if (checkCollision(melonCenter)) {
      ballPosition = [0, -1000, 0];
      ballVelocity = [0, 0, 0];
    }

    var cubeYRotation = time;
    var cubeScale = [1, 1, 1];

    var sphereXRotation = -time * 20;
    var sphereScale = [1, 1, 1];

    gl.useProgram(sphereProgramInfo.program);

    webglUtils.setBuffersAndAttributes(gl, sphereProgramInfo, sphereBufferInfo);

    var sphereUniforms = {
      u_colorMult: [0.5, 1, 0.5, 1],
      u_matrix: m4.identity(),
      u_LightPosition: ballPosition,
    };

    sphereUniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      ballPosition,
      sphereXRotation,
      0,
      sphereScale
    );

    webglUtils.setUniforms(sphereProgramInfo, sphereUniforms);
    gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);
    gl.useProgram(programInfo.program);

    webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);

    var i = 0;
    for (const cube of cubes) {
      if (cube.visible) {
        cube.position[0] = +cubeMovement[i][0];
        cube.position[1] = +cubeMovement[i][1];
        cube.position[2] = +cubeMovement[i][2];

        cubeUniforms.u_matrix = computeMatrix(
          viewProjectionMatrix,
          cube.position,
          0,
          cubeYRotation,
          cubeScale
        );
        cubeUniforms.u_CameraPosition = cameraPosition;
        cubeUniforms.u_LightPosition = ballPosition;

        webglUtils.setUniforms(programInfo, cubeUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);
      }
      i += 1;
    }
    requestAnimationFrame(drawScene);
  }
}

main();
