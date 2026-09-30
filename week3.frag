#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_camera;

uniform vec2 u_resolution;
uniform vec2 u_videoResolution;

uniform vec2 u_mouse;

uniform float u_time;

varying vec2 v_uv;


// ----------------------------------------
// RANDOM
// ----------------------------------------

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
        43758.5453
    );
}


// ----------------------------------------
// CAMERA UV
// ----------------------------------------

vec2 cameraUV(vec2 uv) {

    // selfie mirror
    uv.x =
        1.0 - uv.x;


    float screenAspect =
        u_resolution.x /
        u_resolution.y;


    float videoAspect =
        u_videoResolution.x /
        u_videoResolution.y;


    if (
        screenAspect >
        videoAspect
    ) {

        float scale =
            videoAspect /
            screenAspect;


        uv.y =
            (uv.y - 0.5)
            *
            scale
            +
            0.5;
    }

    else {

        float scale =
            screenAspect /
            videoAspect;


        uv.x =
            (uv.x - 0.5)
            *
            scale
            +
            0.5;
    }


    return uv;
}


// ----------------------------------------
// BRIGHTNESS
// ----------------------------------------

float brightness(vec3 color) {

    return dot(

        color,

        vec3(
            0.299,
            0.587,
            0.114
        )

    );
}


// ----------------------------------------
// MAIN
// ----------------------------------------

void main() {

    vec2 uv =
        v_uv;


    float aspect =
        u_resolution.x /
        u_resolution.y;


    // ----------------------------------------
    // GRID
    // ----------------------------------------

    float columns =
        58.0;


    float rows =
        columns /
        aspect;


    vec2 grid =
        vec2(
            columns,
            rows
        );


    vec2 gridUV =
        uv *
        grid;


    vec2 cellID =
        floor(
            gridUV
        );


    vec2 local =
        fract(
            gridUV
        )
        -
        0.5;


    // ----------------------------------------
    // RANDOM VALUES FOR EACH CIRCLE
    // ----------------------------------------

    float r1 =
        random(
            cellID
        );


    float r2 =
        random(
            cellID +
            12.4
        );


    float r3 =
        random(
            cellID +
            45.6
        );


    // ----------------------------------------
    // MOVEMENT
    // ----------------------------------------

    float speed =
        mix(
            0.20,
            0.60,
            r1
        );


    float movementAmount =
        mix(
            0.03,
            0.16,
            r2
        );


    vec2 movement =
        vec2(

            sin(
                u_time *
                speed +
                r1 *
                6.28318
            ),

            cos(
                u_time *
                speed *
                0.8 +
                r2 *
                6.28318
            )

        )
        *
        movementAmount;


    // ----------------------------------------
    // CELL CENTER
    // ----------------------------------------

    vec2 cellCenter =
        (
            cellID +
            0.5
        )
        /
        grid;


    // ----------------------------------------
    // MOUSE INTERACTION
    // ----------------------------------------

    vec2 toMouse =
        u_mouse -
        cellCenter;


    float mouseDistance =
        length(
            toMouse
        );


    float mouseInfluence =
        1.0 -
        smoothstep(
            0.0,
            0.25,
            mouseDistance
        );


    movement +=
        toMouse *
        mouseInfluence *
        0.65;


    // ----------------------------------------
    // CAMERA SAMPLE
    // ----------------------------------------

    vec2 samplePosition =
        cellCenter +
        movement /
        grid *
        0.4;


    samplePosition =
        clamp(
            samplePosition,
            0.001,
            0.999
        );


    vec2 sampleUV =
        cameraUV(
            samplePosition
        );


    vec3 cameraColor =
        texture2D(
            u_camera,
            sampleUV
        ).rgb;


    float b =
        brightness(
            cameraColor
        );


    // ----------------------------------------
    // CIRCLE
    // ----------------------------------------

    vec2 circlePosition =
        local -
        movement;


    float d =
        length(
            circlePosition
        );


    // darker pixels = larger circle

    float radius =
        mix(
            0.38,
            0.15,
            b
        );


    radius *=
        mix(
            0.92,
            1.08,
            r3
        );


    float circle =
        1.0 -
        smoothstep(
            radius,
            radius + 0.018,
            d
        );


    // ----------------------------------------
    // COLOR
    // ----------------------------------------

    float gray =
        brightness(
            cameraColor
        );


    vec3 circleColor =
        mix(
            vec3(gray),
            cameraColor,
            1.18
        );


    circleColor =
        clamp(
            circleColor,
            0.0,
            1.0
        );


    vec3 background =
        vec3(
            0.965,
            0.955,
            0.935
        );


    vec3 color =
        mix(
            background,
            circleColor,
            circle
        );


    gl_FragColor =
        vec4(
            color,
            1.0
        );
}