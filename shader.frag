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
                vec2(
                    12.9898,
                    78.233
                )
            )
        )
        *
        43758.5453123
    );
}


// ------------------------------------
// NOISE
// ------------------------------------

float noise(vec2 st) {

    vec2 i =
        floor(st);

    vec2 f =
        fract(st);


    float a =
        random(i);


    float b =
        random(
            i +
            vec2(1.0, 0.0)
        );


    float c =
        random(
            i +
            vec2(0.0, 1.0)
        );


    float d =
        random(
            i +
            vec2(1.0, 1.0)
        );


    // smooth interpolation

    vec2 u =
        f *
        f *
        (3.0 - 2.0 * f);


    return

        mix(
            a,
            b,
            u.x
        )

        +

        (c - a)
        *
        u.y
        *
        (1.0 - u.x)

        +

        (d - b)
        *
        u.x
        *
        u.y;
}


// ------------------------------------
// FBM
// multiple layers of noise
// ------------------------------------

float fbm(vec2 st) {

    float value =
        0.0;


    float amplitude =
        0.5;


    for (
        int i = 0;
        i < 6;
        i++
    ) {

        value +=
            amplitude *
            noise(st);


        st *=
            2.0;


        amplitude *=
            0.5;
    }


    return value;
}


// ------------------------------------
// MAIN
// ------------------------------------

void main() {


    // --------------------------------
    // SCREEN COORDINATES
    // --------------------------------

    vec2 uv =
        gl_FragCoord.xy /
        u_resolution.xy;


    float aspect =
        u_resolution.x /
        u_resolution.y;


    vec2 p =
        uv -
        0.5;


    p.x *=
        aspect;


    // --------------------------------
    // MOUSE POSITION
    // --------------------------------

    vec2 mouse =
        u_mouse /
        u_resolution.xy;


    mouse -=
        0.5;


    mouse.x *=
        aspect;


    // vector from mouse
    vec2 mouseVector =
        p -
        mouse;


    float mouseDistance =
        length(
            mouseVector
        );


    // strongest close to cursor
    float influence =
        exp(
            -mouseDistance *
            5.5
        );


    // --------------------------------
    // MOUSE VELOCITY
    // --------------------------------

    vec2 velocity =
        u_mouseVelocity /
        u_resolution.xy;


    velocity.x *=
        aspect;


    float speed =
        length(
            velocity
        );


    speed =
        clamp(
            speed * 45.0,
            0.0,
            1.0
        );


    // --------------------------------
    // NOISE SPACE
    // --------------------------------

    vec2 field =
        p * 4.0;


    // --------------------------------
    // MOUSE PUSH
    // --------------------------------

    // moving mouse pushes noise
    field -=

        velocity
        *
        influence
        *
        8.0;


    // --------------------------------
    // DRAG SWIRL
    // --------------------------------

    vec2 tangent =
        vec2(
            -mouseVector.y,
             mouseVector.x
        );


    field +=

        tangent
        *
        influence
        *
        u_mouseDown
        *
        4.0;


    // pull field toward cursor
    field -=

        normalize(
            mouseVector +
            vec2(0.0001)
        )

        *
        influence
        *
        u_mouseDown
        *
        0.7;


    // --------------------------------
    // CLICK RIPPLE
    // --------------------------------

    vec2 click =
        u_click /
        u_resolution.xy;


    click -=
        0.5;


    click.x *=
        aspect;


    vec2 clickVector =
        p -
        click;


    float clickDistance =
        length(
            clickVector
        );


    float clickAge =
        max(
            u_time -
            u_clickTime,
            0.0
        );


    float rippleFade =
        exp(
            -clickAge *
            1.1
        );


    float ripple =
        sin(
            clickDistance *
            38.0
            -
            clickAge *
            10.0
        );


    field +=

        normalize(
            clickVector +
            vec2(0.0001)
        )

        *
        ripple
        *
        0.18
        *
        rippleFade;


    // --------------------------------
    // DOMAIN WARPING
    // --------------------------------

    vec2 q;


    q.x =
        fbm(
            field
            +
            vec2(
                u_time * 0.08,
                0.0
            )
        );


    q.y =
        fbm(
            field
            +
            vec2(
                5.2,
                1.3
            )
            -
            vec2(
                u_time * 0.05,
                0.0
            )
        );


    vec2 r;


    r.x =
        fbm(
            field
            +
            q * 2.2
            +
            vec2(
                1.7,
                9.2
            )
            +
            u_time * 0.04
        );


    r.y =
        fbm(
            field
            +
            q * 2.2
            +
            vec2(
                8.3,
                2.8
            )
            -
            u_time * 0.035
        );


    // mouse speed changes turbulence

    float turbulence =
        1.5
        +
        speed * 4.0;


    float n =
        fbm(
            field
            +
            r * turbulence
        );


    // --------------------------------
    // CONTOUR
    // --------------------------------

    float contour =
        sin(
            (
                n +
                r.x * 0.3
            )
            *
            16.0
        );


    contour =
        smoothstep(
            0.50,
            0.95,
            contour
        );


    // --------------------------------
    // COLOR
    // --------------------------------

    vec3 dark =
        vec3(
            0.015,
            0.018,
            0.04
        );


    vec3 pink =
        vec3(
            1.0,
            0.05,
            0.30
        );


    vec3 cyan =
        vec3(
            0.00,
            0.90,
            0.82
        );


    vec3 yellow =
        vec3(
            1.00,
            0.74,
            0.15
        );


    vec3 color =
        mix(
            dark,
            pink,
            smoothstep(
                0.18,
                0.80,
                n
            )
        );


    color =
        mix(
            color,
            cyan,
            smoothstep(
                0.45,
                0.88,
                r.x
            )
        );


    color =
        mix(
            color,
            yellow,
            contour * 0.35
        );


    // --------------------------------
    // MOUSE ENERGY
    // --------------------------------

    color +=

        influence
        *
        speed
        *
        vec3(
            0.45,
            0.18,
            0.30
        );


    // brighter while dragging

    color +=

        influence
        *
        u_mouseDown
        *
        vec3(
            0.08,
            0.18,
            0.22
        );


    // --------------------------------
    // OUTPUT
    // --------------------------------

    gl_FragColor =
        vec4(
            color,
            1.0
        );
}