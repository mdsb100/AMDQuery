define( "hash/cubicBezier.tween", function() {
  this.describe( "CubicBezier parameter" );
  /**
   * @pubilc
   * @module hash/cssColors
   * @property {Array<Number>} back.easeInOut  - [ 0.680, -0.550, 0.265, 1.550 ]
   * @property {Array<Number>} circ.easeInOut  - [ 0.785, 0.135, 0.150, 0.860 ]
   * @property {Array<Number>} expo.easeInOut  - [ 1.000, 0.000, 0.000, 1.000 ]
   * @property {Array<Number>} sine.easeInOut  - [ 0.445, 0.050, 0.550, 0.950 ]
   * @property {Array<Number>} quint.easeInOut - [ 0.860, 0.000, 0.070, 1.000 ]
   * @property {Array<Number>} quart.easeInOut - [ 0.770, 0.000, 0.175, 1.000 ]
   * @property {Array<Number>} cubic.easeInOut - [ 0.645, 0.045, 0.355, 1.000 ]
   * @property {Array<Number>} quad.easeInOut  - [ 0.455, 0.030, 0.515, 0.955 ]
   *
   * @property {Array<Number>} back.easeOut    - [ 0.175, 0.885, 0.320, 1.275 ]
   * @property {Array<Number>} circ.easeOut    - [ 0.075, 0.820, 0.165, 1.000 ]
   * @property {Array<Number>} expo.easeOut    - [ 0.190, 1.000, 0.220, 1.000 ]
   * @property {Array<Number>} sine.easeOut    - [ 0.390, 0.575, 0.565, 1.000 ]
   * @property {Array<Number>} quint.easeOut   - [ 0.230, 1.000, 0.320, 1.000 ]
   * @property {Array<Number>} quart.easeOut   - [ 0.165, 0.840, 0.440, 1.000 ]
   * @property {Array<Number>} cubic.easeOut   - [ 0.215, 0.610, 0.355, 1.000 ]
   * @property {Array<Number>} quad.easeOut    - [ 0.250, 0.460, 0.450, 0.940 ]
   *
   * @property {Array<Number>} back.easeIn     - [ 0.600, -0.280, 0.735, 0.045 ]
   * @property {Array<Number>} circ.easeIn     - [ 0.600, 0.040, 0.980, 0.335 ]
   * @property {Array<Number>} expo.easeIn     - [ 0.950, 0.050, 0.795, 0.035 ]
   * @property {Array<Number>} sine.easeIn     - [ 0.470, 0.000, 0.745, 0.715 ]
   * @property {Array<Number>} quint.easeIn    - [ 0.755, 0.050, 0.855, 0.060 ]
   * @property {Array<Number>} quart.easeIn    - [ 0.895, 0.030, 0.685, 0.220 ]
   * @property {Array<Number>} cubic.easeIn    - [ 0.550, 0.055, 0.675, 0.190 ]
   * @property {Array<Number>} quad.easeIn     - [ 0.550, 0.085, 0.680, 0.530 ]
   */
  return {
    "back.easeInOut": [ 0.680, -0.550, 0.265, 1.550 ],
    "circ.easeInOut": [ 0.785, 0.135, 0.150, 0.860 ],
    "expo.easeInOut": [ 1.000, 0.000, 0.000, 1.000 ],
    "sine.easeInOut": [ 0.445, 0.050, 0.550, 0.950 ],
    "quint.easeInOut": [ 0.860, 0.000, 0.070, 1.000 ],
    "quart.easeInOut": [ 0.770, 0.000, 0.175, 1.000 ],
    "cubic.easeInOut": [ 0.645, 0.045, 0.355, 1.000 ],
    "quad.easeInOut": [ 0.455, 0.030, 0.515, 0.955 ],

    "back.easeOut": [ 0.175, 0.885, 0.320, 1.275 ],
    "circ.easeOut": [ 0.075, 0.820, 0.165, 1.000 ],
    "expo.easeOut": [ 0.190, 1.000, 0.220, 1.000 ],
    "sine.easeOut": [ 0.390, 0.575, 0.565, 1.000 ],
    "quint.easeOut": [ 0.230, 1.000, 0.320, 1.000 ],
    "quart.easeOut": [ 0.165, 0.840, 0.440, 1.000 ],
    "cubic.easeOut": [ 0.215, 0.610, 0.355, 1.000 ],
    "quad.easeOut": [ 0.250, 0.460, 0.450, 0.940 ],

    "back.easeIn": [ 0.600, -0.280, 0.735, 0.045 ],
    "circ.easeIn": [ 0.600, 0.040, 0.980, 0.335 ],
    "expo.easeIn": [ 0.950, 0.050, 0.795, 0.035 ],
    "sine.easeIn": [ 0.470, 0.000, 0.745, 0.715 ],
    "quint.easeIn": [ 0.755, 0.050, 0.855, 0.060 ],
    "quart.easeIn": [ 0.895, 0.030, 0.685, 0.220 ],
    "cubic.easeIn": [ 0.550, 0.055, 0.675, 0.190 ],
    "quad.easeIn": [ 0.550, 0.085, 0.680, 0.530 ]
  };
} );