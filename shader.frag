#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

uniform vec2 u_mouse;
uniform vec2 u_mouseVelocity;

uniform float u_mouseDown;

uniform vec2 u_click;
uniform float u_clickTime;


// ------------------------------------
// RANDOM
// ------------------------------------

float random(vec2 st) {

    return fract(
        sin(
            dot(
                st,
                vec2(12.9898, 78.233)
            )
        ) * 43758.5453
    );
}


// ------------------------------------
// NOISE
// ------------------------------------

float noise(vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u =
        f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
        + (c - a) * u.y * (1.0 - u.x)
        + (d - b) * u.x * u.y;
}


// ------------------------------------
// FBM
// ------------------------------------

float fbm(vec2 p) {

    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {

        value +=
            amplitude *
            noise(p);

        p *= 2.0;

        amplitude *= 0.5;
    }

    return value;
}


void main() {

    // ------------------------------------
    // SCREEN
    // ------------------------------------

    vec2 uv =
        gl_FragCoord.xy /
        u_resolution.xy;

    vec2 mouse =
        u_mouse /
        u_resolution.xy;

    vec2 click =
        u_click /
        u_resolution.xy;


    // aspect ratio
    float aspect =
        u_resolution.x /
        u_resolution.y;


    vec2 p = uv;

    p.x *= aspect;


    vec2 mouseP = mouse;
    mouseP.x *= aspect;


    vec2 clickP = click;
    clickP.x *= aspect;


    // ------------------------------------
    // MOUSE DISTANCE
    // ------------------------------------

    vec2 toMouse =
        p - mouseP;

    float mouseDist =
        length(toMouse);


    float influence =
        exp(
            -mouseDist * 7.0
        );


    // ------------------------------------
    // MOUSE VELOCITY
    // ------------------------------------

    vec2 velocity =
        u_mouseVelocity /
        u_resolution.xy;

    velocity.x *= aspect;


    float speed =
        length(velocity);


    // cap extreme values
    speed =
        min(speed * 45.0, 1.0);


    // ------------------------------------
    // PUSH FIELD WITH MOUSE
    // ------------------------------------

    // moving the mouse literally pushes
    // the coordinate field

    p -=
        velocity *
        influence *
        6.0;


    // ------------------------------------
    // CLICK + DRAG
    // ------------------------------------

    // when mouse is held down,
    // pull nearby space toward cursor

    vec2 direction =
        normalize(
            toMouse +
            vec2(0.0001)
        );


    float dragStrength =
        influence *
        u_mouseDown;


    p -=
        direction *
        dragStrength *
        0.22;


    // rotate space slightly while dragging

    vec2 swirl =
        vec2(
            -toMouse.y,
             toMouse.x
        );


    p +=
        swirl *
        dragStrength *
        1.2;


    // ------------------------------------
    // CLICK RIPPLE
    // ------------------------------------

    vec2 clickDelta =
        p - clickP;

    float clickDistance =
        length(clickDelta);


    float clickAge =
        u_time -
        u_clickTime;


    // ripple disappears after click
    float clickFade =
        exp(
            -max(clickAge, 0.0) * 1.2
        );


    float ripple =
        sin(
            clickDistance * 45.0
            - clickAge * 8.0
        );


    p +=
        normalize(
            clickDelta +
            vec2(0.0001)
        )
        *
        ripple
        *
        0.055
        *
        clickFade;


    // ------------------------------------
    // DOMAIN WARP
    // ------------------------------------

    p *= 5.0;


    vec2 q;

    q.x =
        fbm(
            p +
            vec2(
                u_time * 0.08,
                0.0
            )
        );


    q.y =
        fbm(
            p +
            vec2(
                5.2,
                1.3
            )
        );


    vec2 r;

    r.x =
        fbm(
            p +
            2.0 * q +
            vec2(
                1.7,
                9.2
            )
            +
            u_time * 0.05
        );


    r.y =
        fbm(
            p +
            2.0 * q +
            vec2(
                8.3,
                2.8
            )
            -
            u_time * 0.04
        );


    // turbulence responds to mouse speed

    float turbulence =
        1.2 +
        speed * 3.5;


    float n =
        fbm(
            p +
            r * turbulence
        );


    // ------------------------------------
    // COLOR
    // ------------------------------------

    vec3 background =
        vec3(
            0.015,
            0.02,
            0.04
        );


    vec3 pink =
        vec3(
            1.0,
            0.08,
            0.35
        );


    vec3 cyan =
        vec3(
            0.0,
            0.95,
            0.8
        );


    vec3 color =
        mix(
            background,
            pink,
            smoothstep(
                0.25,
                0.75,
                n
            )
        );


    color =
        mix(
            color,
            cyan,
            smoothstep(
                0.45,
                0.85,
                r.x
            )
        );


    // moving faster and brightens the field
    color +=
        speed *
        influence *
        vec3(
            0.25,
            0.15,
            0.35
        );


    gl_FragColor =
        vec4(
            color,
            1.0
        );
}