var sliderPositions = {
    R: 0,
    T: 0,
};

var points = {
    P0: [-10.05, 4.5, 11.67],
    P1: [-18.35, 5.2, 29.85],
    P2: [-8.11, 5.8, 21.92],
    P3: [2.15, 4.8, 25.49],
    P4: [12.24, 1, 23.25],
    P5: [26.32, -0.5, 23.55],
    P6: [23.77, 1.5, 7.69],
    P7: [19.29, 0.8, -14.12],
    P8: [4.95, -0.2, -54.78],
    P9: [-11.05, 2.5, -42.89],
    P10: [-23.89, -1, -28.57],
    P11: [-6.72, 0.7, -4.18],
    P12: [-10.05, 4.5, 11.67],
};

function interpolateCoordinate(coord, targetCoord, t) {
    return coord + t * (targetCoord - coord);
}

function calculatePoint(points, t) {
    const segmentIndex = Math.floor(t * 4);
    const segmentT = t * 4 - segmentIndex;

    const startIndex = segmentIndex * 3;
    const X = points[`P${startIndex}`];
    const Y = points[`P${startIndex + 1}`];
    const Z = points[`P${startIndex + 2}`];
    const W = points[`P${startIndex + 3}`];

    const A = X.map((coord, index) =>
        interpolateCoordinate(coord, Y[index], segmentT)
    );
    const B = Y.map((coord, index) =>
        interpolateCoordinate(coord, Z[index], segmentT)
    );
    const C = Z.map((coord, index) =>
        interpolateCoordinate(coord, W[index], segmentT)
    );
    const D = A.map((coord, index) =>
        interpolateCoordinate(coord, B[index], segmentT)
    );
    const BC = B.map((coord, index) =>
        interpolateCoordinate(coord, C[index], segmentT)
    );
    const ABC = D.map((coord, index) =>
        interpolateCoordinate(coord, BC[index], segmentT)
    );

    return ABC.map((element) => 10 * element);
}