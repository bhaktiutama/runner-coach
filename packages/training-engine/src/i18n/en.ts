import type { EngineMessageKey } from './id';

// English engine catalog (F-22, TRD 8). Same keys and placeholders as id.ts; a missing key is a
// typecheck error. Wording must not overstate evidence (07 section 1).
export const engineEn: Record<EngineMessageKey, string> = {
  'rule.E-01':
    'Your estimated time is {range_min_s} - {range_max_s}, most likely {likely_s}. Riegel formula: your {baseline_code} time ({baseline_s}) x (target distance / reference distance)^1.06. For the marathon this formula is on average 10 minutes too fast for recreational runners, so the fast end is a best case.',
  'rule.E-02':
    "Training paces use Daniels' framework (VDOT {vdot}). Easy runs at {easy_min_pace} - {easy_max_pace}, slow enough to keep chatting.",
  'rule.E-03': 'This {distance_code} plan is {weeks} weeks, a common length coaches use for this goal.',
  'rule.E-04':
    'The plan has Base {base} weeks, Build {build} weeks, Peak {peak} weeks and Taper {taper} weeks, so load rises gradually with enough recovery.',
  'rule.E-05':
    'Volume this week is {week_m}, up {pct}% from last week. We increase gradually (max 10%) as a safety limit; research has not shown that the 10% figure itself prevents injury.',
  'rule.E-06':
    'This run is {distance_m}. The single-session limit is {cap_m}: your longest run in the last 30 days ({longest_30d_m}) plus 10%. A study of 5,205 runners found injury risk rises when one run goes past this limit.',
  'rule.E-06.plan':
    "First-week long run {distance_m}. There are two limits and the smaller one applies: max {cap_m} (your longest run in the last 30 days {longest_30d_m} plus 10%) and max {limit_pct}% of that week's volume ({week_volume_m}). The long run grows each week with volume.",
  'rule.E-07':
    'Week {week} is a lighter week: volume drops {pct}% so your body absorbs the training of the previous weeks.',
  'rule.E-08':
    "Long run {distance_m} is {share_pct}% of this week's volume ({week_volume_m}), below the {limit_pct}% limit so load doesn't pile up in one session.",
  'rule.E-21':
    'Recovery run {min} minutes, very slow, the day after a long run or hard session. Helps you recover without adding load.',
  'rule.E-22':
    'Progression run: start easy, then the last {fast_min} minutes at marathon pace. Trains a strong finish with less load than a tempo session.',
  'rule.E-23':
    'Strength training {per_week}x a week in this phase. A meta-analysis of 25 randomised trials found strength training lowers sports injury risk, and another review found running economy improves in trained runners. The number of sessions per phase is coaching practice, not directly tested.',
  'rule.E-24':
    'This session is on a non-running day, and not the day before a long run or interval, so your legs are fresh for key sessions.',
  'rule.E-24.after_run':
    "Do it after today's run. Hard days stay hard, easy days stay easy, and there is no strength the day before a long run or interval.",
  'rule.E-25':
    'Level {level} exercises. The level goes up every {weeks} weeks (e.g. squat -> split squat) so load increases gradually. If it feels too hard, the next session is made easier.',
  'rule.E-25.down': 'Your last session felt too hard, so this session uses easier level {level} exercises.',
  'rule.E-26':
    'Taper week: light core only, no leg work, so your legs are fresh on race day. No strength in race week.',
  'rule.E-09':
    'About {easy_pct}% of your running time is at easy pace. A large easy share builds endurance with a low recovery cost.',
  'rule.E-10':
    'Max {hard_per_week} hard sessions a week, at least 1 day apart so you recover; recovery after hard sessions takes longer than after easy runs.',
  'rule.E-11':
    'Taper week: volume drops {pct}% but intensity stays. A meta-analysis found this pattern helps race performance the most.',
  'rule.E-12':
    'Because you answered "Yes" to a health question, the plan has no hard sessions. Check with a doctor first; you can change this in Profile.',
  'rule.E-13':
    'Back-to-running week: low volume and no hard sessions, because fitness drops fairly quickly after {days} days without running.',
  'rule.E-14':
    'Your runs include walk breaks: {run_min} minutes running, {walk_min} minutes walking. This reduces soreness and fatigue without slowing progress; the running block grows each week until you run 20 minutes non-stop.',
  'rule.E-15':
    '{drill_min} minutes of ABC drills after the warm-up wake up your muscles and tidy your stride before the fast part. Warming up has been shown to help performance.',
  'rule.E-16':
    'The RPE (effort 1-10) you enter is used to adjust the plan. It is a valid way to measure training load.',
  'rule.E-17':
    'Your easy run RPE was {rpe1} and {rpe2} (easy target: 3-5). Next week volume drops 10% and 1 hard session becomes easy so you can recover.',
  'rule.E-18':
    'Your quality sessions felt easy {count} times in a row (RPE 4 or less). Quality session paces can go up 1 level, or try a time trial to re-measure.',
  'rule.E-19':
    "{missed} workouts missed this week. This week is repeated at the same volume so you don't jump too far.",
  'rule.E-20': 'Your latest time is used to recalculate training paces (VDOT {vdot}).',

  'grade.A': 'Strong evidence',
  'grade.B': 'Moderate evidence',
  'grade.C': 'Limited evidence',
  'grade.D': 'Coaching practice',

  'distance.5k': '5K',
  'distance.10k': '10K',
  'distance.hm': 'Half Marathon',
  'distance.fm': 'Full Marathon',
  'distance.fitness': 'Fitness',

  'phase.base': 'Base',
  'phase.build': 'Build',
  'phase.peak': 'Peak',
  'phase.taper': 'Taper',
  'phase.return': 'Return',

  'workout.easy': 'Easy',
  'workout.run_walk': 'Run-walk',
  'workout.long': 'Long run',
  'workout.tempo': 'Tempo',
  'workout.interval': 'Interval',
  'workout.strides': 'Easy + strides',
  'workout.recovery': 'Recovery',
  'workout.progression': 'Progression',
  'workout.rest': 'Rest',
  'workout.strength': 'Strength',
  'workout.core': 'Core',

  'workout.why.easy':
    'An easy run to build endurance. You can still talk in full sentences. Effort: 3-4 out of 10.',
  'workout.why.run_walk':
    'Running with walk breaks so your body adapts without exhaustion. The running block grows each week. Effort: 3-4 out of 10.',
  'workout.why.long':
    'The long run trains your body to keep going longer. Pace stays easy; you train duration, not speed. Effort: 4-5 out of 10.',
  'workout.why.tempo':
    'Trains you to hold a "comfortably hard" pace. You can say 2-3 words, not chat. Effort: 6-7 out of 10.',
  'workout.why.interval':
    'Short fast reps with jog recoveries to raise your maximal aerobic capacity. Effort: 8 out of 10 on the fast parts.',
  'workout.why.strides':
    'An easy run finished with relaxed 20-second fast strides to train your stride without extra fatigue. Effort: 3-4 out of 10.',
  'workout.why.progression':
    'Start easy and get faster at the end. Trains a strong finish. Effort: 4-6 out of 10, rising to 6-7 in the last 10 minutes.',
  'workout.why.recovery': 'A very slow run to help recovery. Effort: 2-3 out of 10.',
  'workout.why.strength':
    'Leg and core strength without equipment. Strong muscles keep your stride stable when tired. Effort: 5-6 out of 10, with clean form.',
  'workout.why.core':
    'Light core work without equipment to keep your body stable while running. Effort: 4-5 out of 10.',
  'workout.why.drill': 'The ABC drills beforehand wake up your muscles and tidy your stride.',

  'step.finishFast': 'Faster finish',
  'step.warmup': 'Warm-up',
  'step.work': 'Run',
  'step.recovery': 'Easy jog',
  'step.cooldown': 'Cool-down',
  'step.walk': 'Walk',
  'step.drill': 'ABC drills',
  'step.stride': 'Stride',
  'step.exercise': 'Exercise',
  'step.rest': 'Rest',

  'zone.recovery': 'Recovery',
  'zone.easy': 'Easy',
  'zone.long': 'Long',
  'zone.tempo': 'Tempo',
  'zone.interval': 'Interval',
  'zone.threshold': 'Tempo',
  'zone.marathon': 'Marathon',
  'zone.repetition': 'Repetition',

  'drill.askip.name': 'A-skip',
  'drill.askip.cue': 'Knee up to hip height. Land on the ball of the foot, arms swing opposite.',
  'drill.bskip.name': 'B-skip',
  'drill.bskip.cue': 'Lift the knee, then extend the leg forward. Pull the foot down and back like a sweep.',
  'drill.cskip.name': 'C-skip (butt kick)',
  'drill.cskip.cue': 'Pull the heel toward your bottom. Thigh points down, quick short steps.',
  'drill.highknees.name': 'High knees',
  'drill.highknees.cue': 'Knees up quickly in turn, body tall, short steps in place moving slowly forward.',
  'drill.carioca.name': 'Carioca',
  'drill.carioca.cue':
    'Move sideways, the back leg crosses in front then behind. Hips rotate, shoulders face forward.',

  'exercise.squat.name': 'Squat',
  'exercise.squat.cue':
    'Feet shoulder-width apart, push the hips back, lower until thighs are parallel to the floor. Knees in line with toes.',
  'exercise.split_squat.name': 'Split squat',
  'exercise.split_squat.cue': 'One foot forward, one back. Lower the back knee straight down, body upright.',
  'exercise.bulgarian_split_squat.name': 'Bulgarian split squat',
  'exercise.bulgarian_split_squat.cue':
    'Back foot on a chair or bench. Lower slowly until the front thigh is parallel to the floor, push through the front heel.',
  'exercise.glute_bridge.name': 'Glute bridge',
  'exercise.glute_bridge.cue':
    'Lie down, knees bent. Lift the hips until the body is straight from shoulders to knees, hold 1 second.',
  'exercise.single_leg_glute_bridge.name': 'Single-leg glute bridge',
  'exercise.single_leg_glute_bridge.cue':
    'Like a glute bridge with one leg straight up. Keep the hips level.',
  'exercise.single_leg_deadlift.name': 'Single-leg deadlift',
  'exercise.single_leg_deadlift.cue':
    'Stand on one leg, hinge forward while the other leg extends back. Flat back, return slowly.',
  'exercise.reverse_lunge.name': 'Reverse lunge',
  'exercise.reverse_lunge.cue':
    'Step back, lower the back knee close to the floor. Push through the front leg to stand.',
  'exercise.step_up.name': 'Step-up',
  'exercise.step_up.cue':
    'Step onto a stair or bench with one leg, push until straight. Step down slowly with the same leg.',
  'exercise.calf_raise.name': 'Calf raise',
  'exercise.calf_raise.cue': 'Rise onto your toes as high as you can, hold 1 second, lower slowly.',
  'exercise.single_leg_calf_raise.name': 'Single-leg calf raise',
  'exercise.single_leg_calf_raise.cue': 'Like a calf raise on one leg. Hold a wall for balance.',
  'exercise.plank.name': 'Plank',
  'exercise.plank.cue': 'On forearms and toes. Body straight from head to heels, brace your stomach.',
  'exercise.side_plank.name': 'Side plank',
  'exercise.side_plank.cue': 'On one forearm, body sideways and straight. Keep the hips from dropping.',
  'exercise.dead_bug.name': 'Dead bug',
  'exercise.dead_bug.cue':
    'Lie on your back, arms and knees up. Slowly lower the opposite arm and leg, lower back stays on the floor.',
  'exercise.bird_dog.name': 'Bird dog',
  'exercise.bird_dog.cue': 'On hands and knees. Extend the opposite arm and leg, hold 2 seconds, hips level.',
  'exercise.copenhagen_plank.name': 'Copenhagen plank',
  'exercise.copenhagen_plank.cue':
    'Side plank with the top leg on a bench, bottom leg hanging. Start with the knee on the bench if it is too hard.',
};
