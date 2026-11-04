#!/usr/bin/env python3
"""Membangun docs/ANIMATION_PROMPTS.md: prompt ilustrasi 4x4 (16 keyframe), versi pria dan wanita, 15 gerakan."""
import sys

OUT = sys.argv[1]
N = 16

# ---------------------------------------------------------------- karakter
PERSON = {
    "m": dict(
        noun="man", he="he", He="He", his="his", His="His", him="him",
        desc="an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm "
        "neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm "
        "above the knee, a black smartwatch on the wrist, and white running shoes with orange accents",
    ),
    "f": dict(
        noun="woman", he="she", He="She", his="her", His="Her", him="her",
        desc="an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm "
        "neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts "
        "ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents",
    ),
}

STYLE = (
    "Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark "
    "outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism)"
)
BG = (
    "Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma "
    "key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground."
)
PROP = "Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green."

VIEW = {
    "side": "exact side profile, {he} faces the RIGHT edge of the panel and the camera sees {his} right side "
    "(the right arm and right leg are the near limbs), the camera is at hip height",
    "lying": "exact side profile at floor level, {he} lies with the head toward the LEFT edge of the panel and the "
    "feet toward the RIGHT edge, the camera sees {his} right side (the right arm and right leg are the near "
    "limbs)",
    "quad": "exact side profile at low height, {he} faces the RIGHT edge of the panel and the camera sees {his} "
    "right side (the right arm and right leg are the near limbs)",
    "front": "front view, the camera faces {his} chest squarely; {his} body lies horizontally across the panel "
    "with the head toward the LEFT edge and the feet toward the RIGHT edge, resting on {his} right side",
}
SIZE = {
    "side": "{He} is the same size in every panel, about 80 percent of the panel height, centered, with clear "
    "margin on every side.",
    "lying": "{He} is the same size in every panel, the body about 85 percent of the panel width, centered "
    "vertically, with clear margin on every side.",
    "quad": "{He} is the same size in every panel, the body about 85 percent of the panel width, with clear "
    "margin on every side.",
    "front": "{He} is the same size in every panel, the body about 85 percent of the panel width, with clear "
    "margin on every side.",
}
PROP_ID = {
    "bulgarian_split_squat": "bangku 45 cm",
    "step_up": "kotak 40 cm",
    "single_leg_calf_raise": "panel dinding (pegangan)",
    "copenhagen_plank": "bangku 45 cm x 100 cm",
}
VIEW_ID = {"side": "samping", "lying": "samping, lantai", "quad": "samping, lantai", "front": "depan, lantai"}

NEG_BASE = (
    "photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, "
    "logo, extra people, different person between panels, different face between panels, different hair between "
    "panels, different clothes between panels, different size between panels, different camera angle between "
    "panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra "
    "limbs, distorted hands, distorted feet"
)
NEG_VIEW = {
    "side": "three-quarter view, front view, back view",
    "lying": "three-quarter view, view from above",
    "quad": "three-quarter view, view from above",
    "front": "three-quarter view, side view from the feet, back view",
}

# ---------------------------------------------------------------- data gerakan
# p = parameter (label, nilai panel 1, nilai panel 16, satuan). Panel 2-15 = langkah sama besar.
EX = []


def add(**kw):
    EX.append(kw)


add(
    id="squat", name="Squat", en="bodyweight parallel squat", view="side", prop="", hold=0.4,
    cue="Kaki selebar bahu, dorong pinggul ke belakang, turun sampai paha sejajar lantai. Lutut searah jari kaki.",
    anchor="{His} feet stay at exactly the same spot in every panel.",
    setup="Feet shoulder-width apart, toes turned out slightly, heels flat on the floor, knees always in line "
    "with the toes, back always flat and neutral, head looking straight ahead.",
    legend="thigh angle is measured above horizontal (90 = vertical when standing, 0 = parallel to the floor); "
    "torso and shin lean are measured forward from vertical; arm angle is measured forward from hanging straight "
    "down (90 = straight forward at shoulder height)",
    p=[("thighs", 90, 0, ""), ("torso lean", 0, 40, ""), ("shin lean", 0, 22, ""), ("arms", 0, 90, "")],
    start="standing tall, legs straight, arms hanging at {his} sides",
    end="lowest point: thighs exactly parallel to the floor, hips level with the knees and clearly above the "
    "floor (about 45 cm, like sitting on a chair), arms straight forward at shoulder height. A parallel squat, "
    "NOT a deep squat, NOT a crouch",
    bad="deep squat, crouching, hips below the knees, heels lifting, knees caving inward, rounded back, hands "
    "touching the floor",
    check="Paha sejajar lantai di panel 16 (tidak lebih dalam), tumit menempel, punggung rata, kaki tidak bergeser.",
)
add(
    id="split_squat", name="Split squat", en="split squat (static lunge)", view="side", prop="", hold=0.4,
    cue="Satu kaki di depan, satu di belakang. Turunkan lutut belakang lurus ke bawah, badan tetap tegak.",
    anchor="{His} feet stay at exactly the same spots in every panel.",
    setup="Split stance: the near (right) leg is the FRONT leg and the far (left) leg is the BACK leg, about 90 "
    "cm between the feet front to back. Front foot flat, back heel raised with the toes on the floor. Both hands "
    "on {his} hips. Torso always vertical, pelvis level. {He} moves straight down; the feet never move.",
    legend="knee angle is the inside angle of the knee joint (180 = straight leg, 90 = right angle); back knee "
    "height is measured from the floor",
    p=[("front knee", 170, 90, ""), ("back knee", 170, 90, ""), ("back knee height", 45, 5, " cm")],
    start="standing tall in the split stance, both legs almost straight",
    end="lowest point: front thigh parallel to the floor, front shin vertical with the knee directly above the "
    "ankle (not past the toes), back thigh vertical, back knee hovering just above the floor without touching "
    "it, torso upright",
    bad="feet stepping, torso leaning forward, front knee past the toes, front heel lifting, back knee touching "
    "the floor, hips tilting",
    check="Lutut belakang turun lurus ke bawah, badan tegak, lutut depan di atas pergelangan kaki, kaki tidak pindah.",
)
add(
    id="bulgarian_split_squat", name="Bulgarian split squat", en="Bulgarian split squat", view="side", hold=0.4,
    prop="A plain flat dark grey bench about 45 cm high and 40 cm long stands on the LEFT side of the panel "
    "behind {him}; it is the only prop.",
    cue="Punggung kaki belakang di kursi atau bangku. Turun pelan sampai paha depan sejajar lantai, dorong lewat tumit depan.",
    anchor="{His} front foot and the bench stay at exactly the same spots in every panel.",
    setup="The far (left) foot is the REAR foot: the top of the foot (laces down) rests on the bench behind "
    "{him}. The near (right) leg is the FRONT leg, foot flat on the floor about 75 cm in front of the bench. Both "
    "hands on {his} hips, pelvis level, back flat. The front foot and the rear foot never move.",
    legend="knee angle is the inside angle of the knee joint (180 = straight leg); rear knee height is measured "
    "from the floor; torso lean is measured forward from vertical",
    p=[("front knee", 170, 90, ""), ("rear knee", 135, 100, ""), ("rear knee height", 50, 15, " cm"),
       ("torso lean", 0, 10, "")],
    start="standing tall, front leg almost straight",
    end="lowest point: front thigh parallel to the floor, front shin nearly vertical with the knee over the "
    "ankle, rear knee pointing down and hovering above the floor, rear foot still on the bench, weight on the "
    "front heel",
    bad="rear foot off the bench, front knee past the toes, front heel lifting, rear knee touching the floor, "
    "rounded back, torso leaning far forward",
    check="Kaki belakang tetap di bangku, paha depan sejajar lantai di panel 16, lutut depan di atas pergelangan kaki.",
)
add(
    id="glute_bridge", name="Glute bridge", en="glute bridge", view="lying", prop="", hold=1.0,
    cue="Berbaring, lutut ditekuk. Angkat pinggul sampai badan lurus dari bahu ke lutut, tahan 1 detik.",
    anchor="{His} head, shoulders and feet stay at exactly the same spots in every panel.",
    setup="{He} lies on {his} back with both knees bent, feet flat on the floor hip-width apart, heels about 30 "
    "cm from the glutes, arms resting on the floor along {his} sides with the palms down. Head and shoulders "
    "stay on the floor; the feet never move.",
    legend="hip height is the gap between the hips and the floor; thigh angle is measured above horizontal",
    p=[("hip height", 0, 30, " cm"), ("thighs", 45, 25, "")],
    start="lying flat on the back, knees bent, hips resting on the floor",
    end="top: shoulders, hips and knees form one straight diagonal line, shins vertical with the feet directly "
    "below the knees, glutes squeezed, ribs down, no arch in the lower back",
    bad="lower back arching, hips above the shoulder-to-knee line, shoulders lifting off the floor, head lifting, "
    "feet sliding, knees falling outward",
    check="Bahu, pinggul, lutut satu garis di panel 16 (tidak melengkung), bahu dan kepala tetap di lantai.",
)
add(
    id="single_leg_glute_bridge", name="Glute bridge satu kaki", en="single-leg glute bridge", view="lying",
    prop="", hold=1.0,
    cue="Seperti glute bridge, satu kaki lurus ke atas. Pinggul tetap rata, tidak miring.",
    anchor="{His} head, shoulders and near foot stay at exactly the same spots in every panel.",
    setup="{He} lies on {his} back. The near (right) foot is flat on the floor with the knee bent: this is the "
    "working leg. The far (left) leg is held straight, its thigh parallel to the near thigh, the foot flexed, "
    "never touching the floor. Arms rest on the floor along {his} sides, palms down. Head and shoulders stay on "
    "the floor, the near foot never moves, the pelvis stays level without twisting.",
    legend="hip height is the gap between the hips and the floor; thigh angle is measured above horizontal",
    p=[("hip height", 0, 30, " cm"), ("thighs", 45, 25, "")],
    start="lying flat on the back, near knee bent, far leg straight in the air, hips resting on the floor",
    end="top: shoulders, hips and the near knee form one straight diagonal line, near shin vertical, the straight "
    "far leg continues the line of the near thigh, pelvis level and square",
    bad="far foot touching the floor, far leg bent, hips dropping on one side, pelvis twisting, lower back "
    "arching, shoulders lifting",
    check="Kaki atas tetap lurus dan sejajar paha, pinggul rata, bahu di lantai.",
)
add(
    id="single_leg_deadlift", name="Single-leg deadlift", en="bodyweight single-leg deadlift", view="side",
    prop="", hold=0.4,
    cue="Berdiri satu kaki, badan condong ke depan sambil kaki lain lurus ke belakang. Punggung rata, kembali pelan.",
    anchor="{His} standing foot stays at exactly the same spot in every panel.",
    setup="{He} stands on the near (right) leg; the standing foot never moves. The far (left) leg is the free "
    "leg: it stays straight and swings back as the torso tips forward, so the torso and the free leg move like a "
    "seesaw. Arms hang straight down toward the floor. Back flat, hips square, no weights.",
    legend="torso lean is measured forward from vertical; free leg angle is measured backward from hanging "
    "straight down; standing knee is the inside angle of the knee joint",
    p=[("torso lean", 0, 80, ""), ("free leg", 0, 80, ""), ("standing knee", 170, 155, "")],
    start="standing tall on the near leg, free leg hanging beside it with the toes just above the floor",
    end="lowest point: torso and free leg form one long straight line almost parallel to the floor, free foot "
    "flexed with the toes pointing down, arms hanging straight down from the shoulders, head neutral",
    bad="rounded back, bent free leg, hips opening to the side, free foot touching the floor, standing foot "
    "moving, arms reaching forward, head looking up",
    check="Badan dan kaki bebas satu garis lurus di panel 16, punggung rata, lengan menggantung lurus.",
)
add(
    id="reverse_lunge", name="Reverse lunge", en="reverse lunge", view="side", prop="", hold=0.4,
    cue="Langkah mundur, turunkan lutut belakang hampir ke lantai. Dorong lewat kaki depan untuk berdiri.",
    anchor="{His} front foot stays at exactly the same spot in every panel.",
    setup="Hands on {his} hips. The far (left) foot is the FRONT foot and never moves. The near (right) foot "
    "steps straight BACK; once it lands only the toes touch the floor and the heel stays raised. Torso always "
    "vertical, pelvis level.",
    legend="step length is measured from the front heel to the back toes; knee angle is the inside angle of the "
    "knee joint; back knee height is measured from the floor",
    p=[("step length", 0, 85, " cm"), ("front knee", 175, 90, ""), ("back knee", 175, 90, ""),
       ("back knee height", 50, 3, " cm")],
    start="standing tall, feet hip-width apart side by side, legs straight",
    end="lowest point: front thigh parallel to the floor with the shin vertical and the knee above the ankle, "
    "back thigh vertical, back knee hovering just above the floor, back heel raised, torso upright",
    bad="front foot moving, torso leaning forward, front knee past the toes, back knee touching the floor, "
    "stepping sideways",
    check="Kaki depan tidak pindah, badan tegak, lutut belakang hampir menyentuh lantai di panel 16.",
)
add(
    id="step_up", name="Step-up", en="step-up onto a box", view="side", hold=0.6,
    prop="A plain flat dark grey box about 40 cm high and 50 cm long stands on the RIGHT side of the panel in "
    "front of {him}; it is the only prop.",
    cue="Naik ke anak tangga atau bangku dengan satu kaki, dorong sampai lurus. Turun pelan dengan kaki yang sama.",
    anchor="The box and {his} near foot on the box stay at exactly the same spot in every panel.",
    setup="The near (right) foot is the working foot and stays flat on top of the box. The far (left) foot "
    "starts flat on the floor behind the box and is lifted as {he} rises. Hands on {his} hips, torso upright, "
    "pelvis level.",
    legend="near knee is the inside angle of the knee joint; far foot height is measured from the floor; far "
    "thigh angle is measured forward from hanging straight down",
    p=[("near knee", 100, 180, ""), ("far foot height", 0, 70, " cm"), ("far thigh", 0, 90, "")],
    start="the near foot on the box with the knee bent, the far foot flat on the floor behind the box",
    end="top: standing tall on the box on the straight near leg, far knee raised to hip height with the shin "
    "hanging down, the far foot touching nothing",
    bad="pushing off the back foot, knee caving inward, leaning far forward, near foot moving on the box, jumping",
    check="Kaki kerja tetap di kotak, lurus penuh di panel 16, badan tegak.",
)
add(
    id="calf_raise", name="Calf raise", en="standing calf raise", view="side", prop="", hold=1.0,
    cue="Berdiri di ujung kaki, naik setinggi mungkin, tahan 1 detik, turun pelan.",
    anchor="{His} toes stay at exactly the same spot in every panel.",
    setup="Feet hip-width apart and parallel, hands on {his} hips, legs straight, torso tall and vertical. Only "
    "the heels and ankles move.",
    legend="heel height is measured from the floor",
    p=[("heel height", 0, 15, " cm")],
    start="standing tall, both feet flat",
    end="top: on the balls of both feet as high as possible, ankles fully extended, knees straight, body tall, "
    "hips over the balls of the feet",
    bad="bent knees, leaning forward, leaning back, rolling onto the outside of the feet, jumping",
    check="Tumit naik bertahap tiap panel, lutut lurus, badan tidak condong.",
)
add(
    id="single_leg_calf_raise", name="Single-leg calf raise", en="single-leg calf raise", view="side", hold=1.0,
    prop="A plain flat dark grey vertical wall panel about 1.4 m tall stands at the RIGHT edge of the panel in "
    "front of {him}, used only for balance; it is the only prop.",
    cue="Seperti calf raise dengan satu kaki. Pegang dinding untuk keseimbangan.",
    anchor="{His} near toes and the wall panel stay at exactly the same spots in every panel.",
    setup="{He} stands on the near (right) leg only. The far (left) knee is bent about 90 degrees with the foot "
    "raised behind, touching nothing. The near fingertips rest lightly on the wall panel at shoulder height, for "
    "balance only. Standing leg straight, torso tall and vertical.",
    legend="heel height is measured from the floor",
    p=[("near heel height", 0, 15, " cm")],
    start="standing tall on the near foot flat",
    end="top: on the ball of the near foot as high as possible, ankle fully extended, knee straight, body tall",
    bad="bent standing knee, far foot touching the floor, leaning on the wall, pushing with the hand, leaning "
    "forward",
    check="Hanya satu kaki di lantai, jari menyentuh dinding ringan, tumit naik bertahap.",
)
add(
    id="plank", name="Plank", en="forearm plank", view="quad", prop="", hold=2.0,
    cue="Bertumpu lengan bawah dan ujung kaki. Badan lurus dari kepala ke tumit, perut dikencangkan.",
    anchor="{His} forearms and toes stay at exactly the same spots in every panel.",
    setup="Forearms flat on the floor, parallel and pointing forward, elbows directly below the shoulders. Toes "
    "on the floor. Head neutral, eyes on the floor just ahead of the hands. {He} lifts from a knee plank into a "
    "full plank.",
    legend="knee angle is the inside angle of the knee joint; knee height is measured from the floor",
    p=[("knees", 140, 180, ""), ("knee height", 0, 18, " cm")],
    start="knee plank: forearms, knees and toes on the floor, body straight from the head to the knees",
    end="full forearm plank: knees off the floor, body one straight line from the back of the head to the heels, "
    "hips neither sagging nor piking, abs and glutes braced",
    bad="hips sagging, hips piking up, rounded back, head dropping, elbows in front of the shoulders, hands "
    "clasped",
    check="Panel 16 lurus dari kepala ke tumit, siku di bawah bahu, pinggul tidak turun atau naik.",
)
add(
    id="side_plank", name="Side plank", en="side plank on the forearm", view="front", prop="", hold=2.0,
    cue="Bertumpu satu lengan bawah, badan miring dan lurus. Pinggul jangan turun.",
    anchor="{His} right forearm and feet stay at exactly the same spots in every panel.",
    setup="{He} lies on {his} right side with the legs straight and stacked. The right forearm lies flat on "
    "the floor with the elbow directly below the right shoulder. The left hand rests on the left hip. The chest "
    "faces the camera, no rotation.",
    legend="hip height is the gap between the hips and the floor",
    p=[("hip height", 0, 22, " cm")],
    start="lying on {his} right side, hips resting on the floor",
    end="top: body one straight line from the head through the hips to the stacked feet, hips lifted and not "
    "dropping, neck neutral",
    bad="hips dropping, hips piking, body rotating forward or backward, elbow away from below the shoulder, head "
    "dropping",
    check="Panel 16 lurus dari kepala ke kaki, siku di bawah bahu, dada menghadap kamera.",
)
add(
    id="dead_bug", name="Dead bug", en="dead bug", view="lying", prop="", hold=0.4,
    cue="Berbaring, lengan dan lutut ke atas. Turunkan lengan dan kaki yang berlawanan pelan, punggung bawah tetap menempel lantai.",
    anchor="{His} head, shoulders and hips stay at exactly the same spots in every panel.",
    setup="{He} lies on {his} back with the lower back pressed to the floor. The far (left) arm stays pointing "
    "straight up to the ceiling and the near (right) leg stays in tabletop (hip and knee bent 90 degrees, shin "
    "parallel to the floor). The near (right) arm and the far (left) leg move together. Head and shoulders stay "
    "on the floor.",
    legend="near arm angle is measured from vertical toward the head (180 = flat overhead); far knee is the "
    "inside angle of the knee joint; far thigh angle is measured from vertical toward the feet (90 = parallel "
    "to the floor)",
    p=[("near arm", 0, 170, ""), ("far knee", 90, 180, ""), ("far thigh", 0, 80, "")],
    start="tabletop: both arms straight up, both hips and knees bent 90 degrees",
    end="extended: near arm straight overhead hovering about 10 cm above the floor, far leg straight hovering "
    "about 10 cm above the floor, lower back still flat",
    bad="lower back arching, head lifting, arm or leg touching the floor, both legs moving, bent arm",
    check="Lengan dekat dan kaki jauh yang bergerak, punggung bawah tetap menempel, tidak menyentuh lantai.",
)
add(
    id="bird_dog", name="Bird dog", en="bird dog", view="quad", prop="", hold=2.0,
    cue="Posisi merangkak. Luruskan lengan dan kaki yang berlawanan, tahan 2 detik, pinggul tetap rata.",
    anchor="{His} supporting hand and supporting knee stay at exactly the same spots in every panel.",
    setup="On hands and knees: hands directly below the shoulders, knees directly below the hips. The far (left) "
    "hand and the near (right) knee stay on the floor. The near (right) arm and the far (left) leg extend "
    "together. Back flat and level, hips square, neck neutral.",
    legend="near arm angle is measured forward from pointing straight down (90 = horizontal at shoulder "
    "height); far thigh angle is measured backward from vertical (90 = horizontal at hip height); far knee is "
    "the inside angle of the knee joint",
    p=[("near arm", 0, 90, ""), ("far thigh", 0, 90, ""), ("far knee", 90, 180, "")],
    start="on hands and knees, back flat",
    end="fully extended: near arm straight forward at shoulder height, far leg straight back at hip height, "
    "fingertips to heel one straight horizontal line, far foot flexed",
    bad="back arching, hips rotating, leg raised above hip height, head lifting, rounded back",
    check="Panel 16 lengan dan kaki satu garis horizontal, pinggul rata, punggung tidak melengkung.",
)
add(
    id="copenhagen_plank", name="Copenhagen plank", en="Copenhagen plank", view="front", hold=2.0,
    prop="A plain flat dark grey bench about 45 cm high and 100 cm long lies along the RIGHT side of the panel "
    "and supports the top leg; it is the only prop.",
    cue="Side plank dengan kaki atas di bangku, kaki bawah menggantung. Mulai dari lutut di bangku jika masih berat.",
    anchor="{His} right forearm, the top foot and the bench stay at exactly the same spots in every panel.",
    setup="{He} lies on {his} right side. The right forearm is on the floor with the elbow directly below the "
    "right shoulder. The TOP (left) leg rests with the inside of the foot and ankle on the bench. The BOTTOM "
    "(right) leg hangs below the top leg. The left hand rests on the left hip. The chest faces the camera.",
    legend="hip height and bottom foot height are measured from the floor",
    p=[("hip height", 0, 30, " cm"), ("bottom foot height", 0, 40, " cm")],
    start="lying on {his} right side next to the bench, hips and bottom leg on the floor, top foot on the bench",
    end="top: body one straight line from the head through the hips to the top foot on the bench, bottom leg "
    "lifted and held straight just under the top leg, hips not dropping",
    bad="hips dropping, top foot sliding off the bench, body rotating, bottom leg bent, elbow away from below "
    "the shoulder",
    check="Panel 16 lurus dari kepala ke kaki di bangku, kaki bawah terangkat, dada menghadap kamera.",
)


# ---------------------------------------------------------------- penyusun prompt
def fill(s, g):
    return s.format(**PERSON[g])


def values(e, k):
    out = []
    for label, a, b, unit in e["p"]:
        v = round(a + (b - a) * k / (N - 1))
        out.append(f"{label} {v}{unit}")
    return ", ".join(out)


def image_prompt(e, g):
    P = PERSON[g]
    view = fill(VIEW[e["view"]], g)
    lines = [
        f"{STYLE} of ONE {P['noun']} performing ONE {e['en']}, drawn as a sheet of sixteen sequential keyframes "
        "of the movement in one direction.",
        "",
        f"The {P['noun']}: {P['desc']}. No green anywhere on the character. {P['He']} is drawn identically in every "
        f"panel: same face, same hair, same clothes, same proportions, same size. If a character reference image "
        f"is attached, draw exactly that {P['noun']}.",
        "",
        "Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right "
        "and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. "
        "Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.",
        "",
        f"Camera (identical in all sixteen panels): {view}, orthographic, no perspective, no tilt, no zoom. "
        f"{fill(e['anchor'], g)} {fill(SIZE[e['view']], g)} {BG}"
        + (f" {fill(e['prop'], g)} {PROP}" if e["prop"] else ""),
        "",
        f"Setup (all panels): {fill(e['setup'], g)}",
        "",
        f"Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, "
        "evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw "
        f"the return movement. Measurements (angles in degrees): {fill(e['legend'], g)}.",
    ]
    for k in range(N):
        v = values(e, k)
        if k == 0:
            lines.append(f"Panel 1: start, {fill(e['start'], g)}: {v}.")
        elif k == N - 1:
            lines.append(f"Panel 16: end, {v}. {fill(e['end'], g)[0].upper()}{fill(e['end'], g)[1:]}.")
        else:
            lines.append(f"Panel {k + 1}: {v}.")
    return "\n".join(lines)


def neg(e):
    return f"{NEG_BASE}, {NEG_VIEW[e['view']]}, {e['bad']}"


def card_prompt(g):
    P = PERSON[g]
    return (
        f"{STYLE} character reference sheet of ONE {P['noun']}: {P['desc']}. No green anywhere on the character.\n\n"
        "Layout: ONE square image (1:1) split into two equal tall panels side by side, separated by a thin "
        "straight white line. No text, no numbers, no labels, no arrows.\n"
        f"Left panel: full body from the front, standing relaxed, feet hip-width apart, arms hanging at the "
        f"sides, looking straight ahead.\n"
        f"Right panel: the same {P['noun']}, full body, exact side profile facing the RIGHT edge of the panel "
        f"(the camera sees {P['his']} right side), standing relaxed and tall, arms hanging at the sides.\n\n"
        f"In both panels the whole body from head to shoes is visible, at the same scale, about 85 percent of "
        f"the panel height, with clear margin. Face, hair, proportions, clothes and colors are identical in both "
        f"panels. Orthographic camera at chest height. {BG}"
    )


NEG_CARD = (
    "photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, "
    "logo, extra people, different face between panels, different clothes between panels, cropped head, cropped "
    "feet, green clothing, extra limbs, distorted hands, distorted feet, hat, glasses, jewelry"
)


def fence(s):
    return "```text\n" + s + "\n```"


def build():
    o = []
    w = o.append
    w("# Prompt ilustrasi gerakan strength (lembar 4x4, pria dan wanita)")
    w("")
    w("Status: Draft v0.2 (2026-11-04). Melengkapi `docs/ANIMATION_PIPELINE.md` dan `apps/app/assets/exercises/README.md`. "
      "Dibuat oleh `python3 -I scripts/gen-animation-prompts.py docs/ANIMATION_PROMPTS.md` (ubah data gerakan di skrip itu, jangan edit file ini langsung). Prompt video Seedance dan prompt foto 3x3 versi sebelumnya dihapus "
      "(masih ada di riwayat git, commit `a8c35f6`).")
    w("")
    w("## Ringkasan")
    w("")
    w("- Tiap gerakan: **satu lembar ilustrasi 4x4 (16 keyframe)** per model, dipotong dengan `scripts/slice-keyframes.py` menjadi 16 WebP transparan, lalu diputar bertahap di app.")
    w("- Dua model: **pria** dan **wanita**, pakaian sama, supaya pengguna nanti bisa memilih. 15 gerakan x 2 = 30 lembar.")
    w("- Panel 1 = posisi awal, panel 16 = posisi akhir (puncak gerakan). Gerakan balik **tidak digambar**: app memutar 1 ke 16 lalu kembali 16 ke 1 (bolak-balik), jadi satu repetisi = 30 langkah dari 16 gambar.")
    w("- Sudut tiap panel ditulis sebagai angka yang naik rata dari panel 1 ke 16, karena kata seperti \"bottom\" terbukti membuat model jongkok terlalu dalam.")
    w("")
    w("## Alur per gerakan")
    w("")
    w("| # | Langkah | Yang dilakukan |")
    w("|---|---|---|")
    w("| 0 | Card karakter (sekali per model) | Generate card pria dan wanita (bagian \"Card karakter\"), simpan yang terbaik. Lampirkan sebagai gambar referensi di setiap prompt gerakan agar wajah dan baju konsisten |")
    w("| 1 | Generate lembar | Tempel prompt pria (atau wanita) + prompt negatif gerakan itu. Resolusi setinggi mungkin (minimal 2048 x 2048, supaya tiap panel sekitar 512 px) |")
    w("| 2 | Periksa lembar | 16 panel berurutan, orang sama, ukuran sama, kaki atau titik tumpu tidak bergeser, panel 16 sesuai \"Periksa\" |")
    w("| 3 | Jadikan transparan | Latar harus transparan sebelum dipotong. Jika hasil berlatar hijau, hapus latar dulu (garis pemisah putih boleh tetap ada) |")
    w("| 4 | Potong | `python3 -I scripts/slice-keyframes.py lembar.png apps/app/assets/exercises <exercise_id>-m` (atau `-f`). Hasil: 16 file `<exercise_id>-m-1.webp` ... `-16.webp` |")
    w("| 5 | Kirim ke Claude | Untuk pemasangan di app (daftar frame, lama tiap frame, putar bolak-balik) |")
    w("")
    w("## Aturan bersama")
    w("")
    w("| Hal | Nilai |")
    w("|---|---|")
    w("| Gaya | Ilustrasi warna datar (cel-shading, outline gelap rapi, 2 sampai 3 tone per warna), sama dengan lembar squat yang sudah dipakai app |")
    w("| Pria | Asia, akhir 20-an, atletis ramping, rambut hitam pendek rapi |")
    w("| Wanita | Asia, akhir 20-an, atletis ramping, rambut hitam panjang dikuncir tinggi |")
    w("| Pakaian (keduanya) | Kaos atletik teal lengan pendek (tidak crop), celana atletik hitam 10 cm di atas lutut, smartwatch hitam, sepatu lari putih aksen oranye. Tanpa hijau |")
    w("| Latar | Transparan; jika tidak bisa, hijau chroma rata (#00B140). Tanpa garis lantai dan bayangan |")
    w("| Kamera | Ortografis, identik di 16 panel. Tampak samping menghadap kanan, kecuali side plank dan Copenhagen plank (tampak depan) |")
    w("| Properti | Hanya bila perlu (bangku, kotak, panel dinding): abu tua datar (#3A3A3C), tanpa logo |")
    w("| Sisi kerja | Anggota badan terdekat kamera (kanan). Sisi lain tidak dibuat terpisah (app menyebut \"per sisi\") |")
    w("| Nama file | `<exercise_id>-m-N.webp` (pria), `<exercise_id>-f-N.webp` (wanita), N = 1 sampai 16 |")
    w("")
    w("## Daftar gerakan")
    w("")
    w("| # | `exercise_id` | Nama di app | Tampak | Properti | Tahan di panel 16 (usulan) |")
    w("|---|---|---|---|---|---|")
    for i, e in enumerate(EX, 1):
        prop = PROP_ID.get(e["id"], "-")
        hold = f"{e['hold']:.1f}".replace(".", ",")
        w(f"| {i} | `{e['id']}` | {e['name']} | {VIEW_ID[e['view']]} | {prop} | {hold} dtk |")
    w("")
    w("Urutan pengerjaan yang disarankan: squat dulu (pria, lalu wanita) untuk mengunci tampilan kedua karakter, lalu gerakan berdiri, lantai, dan terakhir yang memakai properti.")
    w("")
    w("## Card karakter (langkah 0)")
    w("")
    w("Satu kali per model. Hasilnya dilampirkan sebagai gambar referensi di prompt gerakan (kalimat \"If a character reference image is attached...\" sudah ada di setiap prompt). Lembar squat pria yang sudah ada di app juga bisa dipakai sebagai referensi pria.")
    for g, title in (("m", "Pria"), ("f", "Wanita")):
        w("")
        w(f"### Card {title}")
        w("")
        w(fence(card_prompt(g)))
        w("")
        w("Prompt negatif:")
        w("")
        w(fence(NEG_CARD))
    w("")
    w("**Periksa card:** orang yang sama di dua panel, tampak samping benar-benar profil menghadap kanan, seluruh badan masuk, tanpa hijau di pakaian.")
    for i, e in enumerate(EX, 1):
        w("")
        w("---")
        w("")
        w(f"## {i}. {e['name']} (`{e['id']}`)")
        w("")
        w(f"**Cue di app:** {e['cue']}")
        w("")
        w(f"### Prompt pria (`{e['id']}-m`)")
        w("")
        w(fence(image_prompt(e, "m")))
        w("")
        w(f"### Prompt wanita (`{e['id']}-f`)")
        w("")
        w(fence(image_prompt(e, "f")))
        w("")
        w("### Prompt negatif (pria dan wanita)")
        w("")
        w(fence(neg(e)))
        w("")
        w(f"**Periksa:** {e['check']} Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.")
    w("")
    w("---")
    w("")
    w("## Catatan dan batasan")
    w("")
    w("- **Pilihan model pria/wanita di app belum ada di spec.** Dokumen ini hanya menyiapkan gambarnya. Fitur pilihan (pengaturan, penyimpanan lokal, teks ID/EN) perlu usulan perubahan `docs/specs/` dulu sesuai CLAUDE.md.")
    w("- App saat ini masih memakai 9 frame squat pria dari lembar 3x3 (`squat-1.webp` ... `squat-9.webp`, diputar 1 ke 9 lalu kembali ke 1). Pemutaran bolak-balik 16 frame perlu perubahan kecil di `ExerciseAnimation`/`frameTiming.ts` saat lembar 4x4 pertama masuk.")
    w("- Angka sudut adalah panduan untuk generator gambar, bukan ukuran biomekanik yang presisi. Generator biasanya tidak menggambar beda 5 sampai 6 derajat dengan tepat; yang penting urutannya naik rata dan panel 16 benar.")
    w("- 16 panel di satu gambar membuat tiap panel lebih kecil daripada 3x3. Jika generator hanya memberi 1024 x 1024, tiap panel sekitar 256 px dan figur akan sedikit buram setelah diperbesar.")
    w("- Skrip potong meluruskan titik tumpu dari tengah dan dasar sepatu. Untuk gerakan yang kakinya berpindah (reverse lunge) atau berbaring, periksa hasil potongan apakah figur bergoyang.")
    w("- Jika gerakan antarpanel masih kasar, frame perantara bisa ditambah dengan FILM (notebook Colab dari sesi sebelumnya), lalu dipasang sebagai frame tambahan.")
    w("- Lisensi atau izin pemakaian gambar hasil AI belum dikonfirmasi pemilik produk.")
    w("")
    open(OUT, "w").write("\n".join(o))


build()
