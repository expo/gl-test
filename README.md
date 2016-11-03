Testing OpenGL on Exponent!
---------------------------

`Scenes/` shows a few different scenes that use OpenGL rendering in Exponent.
The REGL* scenes use http://regl.party/ and the THREE* scenes use
https://threejs.org/, both of which work directly on Exponent with their WebGL
rendering. Not all features of WebGL are implemented yet.

`Scenes/Conformance/` includes code for automated testing of conformance with
Khronos' WebGL specification, based on
https://www.khronos.org/webgl/wiki/Testing/Conformance, using
https://github.com/stackgl/gl-conformance to provide DOM-independent code.

