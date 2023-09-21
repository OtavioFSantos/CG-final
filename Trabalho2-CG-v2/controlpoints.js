var points = {
    point0: [-10.05, 4.5, 11.67],
    point1: [-18.35, 5.2, 29.85],
    point2: [-8.11, 5.8, 21.92],
    point3: [2.15, 4.8, 25.49],
    point4: [12.24, 1, 23.25],
    point5: [26.32, -0.5, 23.55],
    point6: [23.77, 1.5, 7.69],
    point7: [19.29, 0.8, -14.12],
    point8: [4.95, -0.2, -54.78],
    point9: [-11.05, 2.5, -42.89],
    point10: [-23.89, -1, -28.57],
    point11: [-6.72, 0.7, -4.18],
    point12: [-10.05, 4.5, 11.67],
};

function interpolateCoordinate(coord, targetCoord, t) {
    return coord + t * (targetCoord - coord);
}

function calculatePoint(points, t) {
    const segmentIndex = Math.floor(t * 4);
    const segmentT = t * 4 - segmentIndex;

    const startIndex = segmentIndex * 3;
    const X = points[`point${startIndex}`];
    const Y = points[`point${startIndex + 1}`];
    const Z = points[`point${startIndex + 2}`];
    const W = points[`point${startIndex + 3}`];

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