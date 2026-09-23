#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float circleShape(vec2 p, vec2 center, float radius) {
    float d = length(p - center);
    return 1.0 - smoothstep(radius, radius + 0.01, d);
}

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // center to (0,0)
    vec2 p = st - vec2(0.5);

    // hor, ver edit
    p.x *= u_resolution.x / u_resolution.y;

    // bg color
    vec3 color = vec3(1.000,0.086,0.358);

    for (int i = 0; i < 100; i++) {

        float fi = float(i);

        float angle = fi / 20.0 * 6.28318;

        angle += u_time * 0.6;

        float orbit = 0.23 + 0.08 * sin(u_time + fi * 0.4);

        vec2 center = vec2(
            cos(angle),
            sin(angle)
        ) * orbit;

        // size of the each circles
        float radius = 0.035 + 0.015 * sin(u_time * 2.0 + fi);

        float c = circleShape(p, center, radius);

        // color of the each circles
        vec3 circleColor = vec3(
            0.5 + 0.5 * sin(fi * 0.4 + u_time),
            0.5 + 0.5 * sin(fi * 0.6 + u_time + 2.0),
            0.5 + 0.5 * sin(fi * 0.8 + u_time + 4.0)
        );

        // layer circle color to bg
        color = mix(color, circleColor, c);
    }

    gl_FragColor = vec4(color, 1.0);
}