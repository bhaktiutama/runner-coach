import type { HelpGroup } from './help';

// English Guide & glossary (F-20, F-22). Same group/topic ids and rules as help.ts (test checks).

export const helpTextEn = {
  title: 'Guide & glossary',
  intro:
    'A short explanation of how the plan is built, the terms used in the app, and the research behind each rule.',
  hintLabel: 'What is {term}?',
  rulePrefix: 'Rule {id}',
  noSource: 'No direct research yet. This is common coaching practice.',
} as const;

export const HELP_EN: HelpGroup[] = [
  {
    id: 'plan',
    title: 'HOW THE PLAN WORKS',
    topics: [
      {
        id: 'cara-kerja',
        title: 'How the plan is built',
        body: 'The plan is built on your phone from your onboarding answers: goal, race date, current ability, weekly distance and the days you have. Training load rises slowly, there are lighter weeks to recover, and it is reduced before race day. Every rule has an explanation and research sources in the Science behind the plan section.',
      },
      {
        id: 'volume',
        title: 'Weekly volume',
        body: 'Your total running distance in one week, added up across all sessions. Example: Tuesday 5 km + Thursday 6 km + Saturday 5 km + Sunday 10 km = 26 km. Volume rises by at most 10% a week, for example from 20 km to at most 22 km.',
      },
      {
        id: 'volume-puncak',
        title: 'Peak volume',
        body: 'The highest weekly volume in the whole plan, the hardest week before it is reduced for race day. Example FM goal: start at 15 km a week, build gradually to about 60 km in the Peak phase, then drop during the taper. Peak volume is only reached if the plan is long enough.',
      },
      {
        id: 'fase',
        title: 'Phases: Base, Build, Peak, Taper',
        body: 'Base: building a foundation with easy running. Build: hard sessions start (tempo or intervals). Peak: the hardest weeks. Taper: distance is reduced before the race so you are fresh on the day. The phase bar colour on the Plan screen shows which phase you are in.',
      },
      {
        id: 'cutback',
        title: 'Lighter week (cutback)',
        body: 'Every 4th week, training distance drops 20-30% so your body can recover and adapt. It does not mean the plan is going backwards; the next week goes up again.',
      },
      {
        id: 'taper',
        title: 'Taper',
        body: 'The 1-3 weeks before a race. Training distance drops by about half, but workouts and their speed stay. A combined analysis of 27 studies found this approach helps race performance the most.',
      },
      {
        id: 'pace',
        title: 'Pace',
        body: 'The time it takes you to cover 1 km, written minutes:seconds per km. A pace of 7:30 /km means 1 km takes 7 minutes 30 seconds. The smaller the number, the faster the run.',
      },
      {
        id: 'zona',
        title: 'Pace zones',
        body: 'Pace ranges for each type of workout, worked out from your fitness. Easy: relaxed, you can still chat. Tempo: comfortably hard, only a few words. Interval: fast, heavy breathing. Follow the zones so easy runs are truly easy and hard sessions hit the target.',
      },
      {
        id: 'vdot',
        title: 'Fitness score (VDOT)',
        body: 'One number that describes your running fitness, worked out from your latest race or test run. Example: a 5K in about 28 minutes is roughly VDOT 33. From this score the app works out your pace zones and race time estimates. If you do not know your time yet, the app uses a rough estimate until you do a test run.',
      },
      {
        id: 'prediksi',
        title: 'Estimated finish time',
        body: 'Your most likely finish time at the goal distance, worked out from the run time you entered with the Riegel formula: reference time x (goal distance / reference distance)^1.06. Example: 5K in 40 minutes -> half marathon 40 x (21.1 / 5)^1.06 = about 3 hours 4 minutes. For 5K to half marathon the app shows a +-3% range; for the full marathon this formula is on average 10 minutes too fast, so the range is the formula time to +20 minutes. If you chose "I don\'t know", the app uses a rough estimate from your level. This is an estimate, not a required target, and it is updated after a test run. Compare it with your race cut-off time: if the estimate is close to or past the cut-off, choose a race with a more generous cut-off or a shorter distance.',
      },
      {
        id: 'rpe',
        title: 'RPE (rate of perceived exertion)',
        body: 'A 1-10 score for how hard a workout felt. 1-2 very light, 3-5 easy and you can still chat, 6-7 hard, 8-10 very hard. Enter it after each workout. The app uses it to adjust the plan, for example reducing load if easy runs feel too hard.',
      },
      {
        id: 'kepatuhan',
        title: 'Adherence',
        body: 'The percentage of scheduled workouts you complete. Example: 11 of 13 workouts = 85%. Workouts that you moved and then completed still count. Strength sessions are counted separately.',
      },
      {
        id: 'adaptasi',
        title: 'Automatic adjustments',
        body: 'In the weekly summary, the app can suggest changes: less load if easy runs felt very hard twice in a row, faster paces if hard sessions felt easy 3 times, or repeating the week if you missed 2 or more workouts. You decide whether to accept.',
      },
      {
        id: 'jeda',
        title: 'Pausing the plan and coming back',
        body: 'If you are injured, ill or busy, pause the plan from Profile. After 10 days or more without running, the plan restarts with 1 light week (Return to run): easy running only, short distances.',
      },
    ],
  },
  {
    id: 'jenis',
    title: 'WORKOUT TYPES',
    topics: [
      {
        id: 'easy',
        title: 'Easy run',
        body: 'Running at a pace where you can still talk in full sentences (RPE 3-4). Builds endurance with low risk. Most of the plan (about 80% of running time) is easy running.',
      },
      {
        id: 'recovery',
        title: 'Recovery run',
        body: 'A very slow, short run (about 20-30 minutes), easier than an easy run, usually the day after a hard session or long run. The goal is to help recovery, not to add fitness. The app schedules it for recreational runners who train 5 days or more, on the day after a long run or hard session.',
      },
      {
        id: 'long',
        title: 'Long run',
        body: 'The longest run of the week, at an easy pace. Builds endurance for the race distance. The long run is capped at 10% above your longest run in the last 30 days. It is at most 30% of weekly volume (half marathon 35%, full marathon 45%), and at most 2.5 hours for the half marathon or 3 hours for the full marathon.',
      },
      {
        id: 'tempo',
        title: 'Tempo run',
        body: 'Running at a "comfortably hard" pace for 12-20 minutes or more, with a warm-up before and a cool-down after. Trains your body to hold speed for longer. Starts in the Build phase.',
      },
      {
        id: 'interval',
        title: 'Intervals',
        body: 'Repeated fast running (for example 6 x 800 m) with walking or jogging in between. Trains speed and breathing capacity. Appears in the Build and Peak phases, at most 2 hard sessions a week and never on consecutive days.',
      },
      {
        id: 'progression',
        title: 'Progression run',
        body: 'A run that starts slow and gets faster, usually finishing at tempo pace. In the app: easy running, then the last 10 minutes at marathon pace. Trains a strong finish with less load than a tempo run. Appears in the Build phase for recreational runners, every other week, and never next to a long run or hard session.',
      },
      {
        id: 'strides',
        title: 'Strides',
        body: 'Fast but relaxed running for about 20 seconds, repeated a few times at the end of an easy run, with easy walking in between. Trains technique and turnover without tiring you out.',
      },
      {
        id: 'run-walk',
        title: 'Run-walk',
        body: 'Running with walk breaks, for example 1 minute running and 2 minutes walking, repeated. For beginners who cannot run for long yet. The running portion grows each week until you can run 20 minutes non-stop.',
      },
      {
        id: 'drill',
        title: 'ABC drills',
        body: 'Running technique drills (A-skip, B-skip, C-skip, high knees, carioca) for about 10 minutes after the warm-up, before a tempo or interval session. Help with warming up and running form.',
      },
      {
        id: 'strength',
        title: 'Strength + core',
        body: 'Leg strength (squat, lunge, glute bridge, calf raise) and core (plank, dead bug) without equipment, 15-30 minutes. Optional: switch it on in onboarding or Profile. Shows as a second card on Today and an S mark in the calendar, twice a week in the Base and Build phases, once in Peak, light core only during the taper, and none in race week. Exercises level up every 3 weeks; if a session feels too hard, the next one is made easier. Exercise animations are coming soon.',
      },
      {
        id: 'time-trial',
        title: 'Time trial (test run)',
        body: 'Running as hard as you can over a set distance (for example 5 km) to measure your current fitness. The result is used to update your pace zones and race time estimate.',
      },
      {
        id: 'istirahat',
        title: 'Rest day',
        body: 'A day without running. Adaptation happens while your body recovers, so rest is part of training. An easy walk or light stretching is fine.',
      },
    ],
  },
  {
    id: 'riset',
    title: 'RESEARCH TERMS',
    topics: [
      {
        id: 'tingkat-bukti',
        title: 'Evidence levels (A, B, C, D)',
        body: 'A Strong evidence: many studies combined. B Moderate evidence: one randomised trial or a large study (more than 500 people). C Limited evidence: small studies, models or expert agreement. D Coaching practice: no direct research yet; only used when it is the safer option.',
      },
      {
        id: 'rct',
        title: 'Randomised controlled trial (RCT)',
        body: 'A study that randomly splits participants into two or more groups, then compares the results. The strongest way to test cause and effect in a single study.',
      },
      {
        id: 'kohort',
        title: 'Cohort study',
        body: 'A study that follows a group of people over time without changing their habits. It can show a link (for example running too far and injury), but does not prove cause and effect.',
      },
      {
        id: 'meta-analisis',
        title: 'Meta-analysis',
        body: 'Combining the results of many similar studies to reach a stronger conclusion than any single study.',
      },
      {
        id: 'vo2max',
        title: 'VO2max',
        body: 'The most oxygen your body can use per minute during exercise. A measure of lung and heart capacity; higher usually means fitter.',
      },
    ],
  },
  {
    id: 'aturan',
    title: 'SCIENCE BEHIND THE PLAN',
    topics: [
      {
        id: 'E-01',
        rule: 'E-01',
        title: 'Race time estimate',
        body: 'The app estimates your finish time at another distance from one run result. Example: a 30-minute 5K is estimated at about 1 hour 2 minutes for 10K. Fairly accurate up to the half marathon; for the full marathon the formula is on average 10 minutes too fast, so the app shows a range.',
      },
      {
        id: 'E-02',
        rule: 'E-02',
        title: 'Pace zones from your fitness',
        body: 'Training paces are worked out from your latest race result converted into a fitness score (VDOT), not guessed. This method is widely used by coaches around the world.',
      },
      {
        id: 'E-20',
        rule: 'E-20',
        title: 'New result, new zones',
        body: 'Every new race or test run result recalculates your pace zones and time estimate, because the latest result best reflects your current fitness.',
      },
      {
        id: 'E-03',
        rule: 'E-03',
        title: 'Plan length',
        body: '5K 8 weeks, 10K 10 weeks, half marathon 12 weeks, full marathon 16-18 weeks, Fitness 8 weeks. These are coaching conventions; no research has compared plan lengths for everyday runners.',
      },
      {
        id: 'E-04',
        rule: 'E-04',
        title: 'Phased build-up',
        body: 'Base, Build, Peak, then Taper. The principle: your body needs load that rises slowly and enough time to recover.',
      },
      {
        id: 'E-05',
        rule: 'E-05',
        title: 'Volume up at most 10% a week',
        body: 'Example: 20 km this week, at most 22 km next week. This is a safety limit, but research has not shown that the 10% figure itself prevents injury, so the app does not promise that.',
      },
      {
        id: 'E-06',
        rule: 'E-06',
        title: 'One run at most +10% of your longest',
        body: 'One session is no more than 10% above your longest run in the last 30 days. Example: longest run 10 km, the next session is at most 11 km. Research on more than 5,000 runners found injury risk rises when this limit is passed.',
      },
      {
        id: 'E-07',
        rule: 'E-07',
        title: 'Lighter week every 4th week',
        body: 'Distance drops 20-30% so your body recovers. This is coaching practice; how often and how much has not been studied specifically.',
      },
      {
        id: 'E-08',
        rule: 'E-08',
        title: 'Long run share and duration limits',
        body: 'The long run is at most 30% of weekly volume for 5K/10K, 35% for the half marathon and 45% for the full marathon, and at most 2.5 hours (HM) or 3 hours (FM). The share is larger for HM/FM because recreational runners rarely run high volume but still need a long enough long run. Example FM: 50 km total, long run at most 22.5 km. The +10% limit above still applies; the stricter one wins.',
      },
      {
        id: 'E-09',
        rule: 'E-09',
        title: 'About 80% of running time is easy',
        body: 'Most running is done slowly enough to chat, the rest is hard training. Safe and builds endurance; its advantage over other patterns for everyday runners has not been proven.',
      },
      {
        id: 'E-10',
        rule: 'E-10',
        title: 'At most 2 hard sessions a week',
        body: 'Beginners 0-1, and never two days in a row. Recovery from hard sessions takes longer, and beginners get injured more easily.',
      },
      {
        id: 'E-11',
        rule: 'E-11',
        title: 'Taper: less distance, same speed',
        body: 'Before a race, distance drops 40-60%, but workouts and their speed stay. This pattern helps performance the most according to a combined analysis of 27 studies.',
      },
      {
        id: 'E-14',
        rule: 'E-14',
        title: 'Run-walk for beginners',
        body: 'Beginners who cannot run for long yet use run-walk until they can run 20 minutes non-stop. In marathon runners, this approach reduced soreness and fatigue without slowing finish times.',
      },
      {
        id: 'E-15',
        rule: 'E-15',
        title: 'Warm-up and drills before hard sessions',
        body: 'Warming up has been shown to help performance. The specific benefit of ABC drills has not been studied.',
      },
      {
        id: 'E-12',
        rule: 'E-12',
        title: 'Health questions',
        body: 'If you answer "Yes" (for example chest pain or heart disease), the plan is built light without hard sessions and you are advised to see a doctor first, in line with international health screening guidelines.',
      },
      {
        id: 'E-13',
        rule: 'E-13',
        title: 'Coming back after a break',
        body: 'After 10 days or more without running, start again with 1 light week, because fitness drops fairly quickly when you stop training.',
      },
      {
        id: 'E-16',
        rule: 'E-16',
        title: 'RPE as a load measure',
        body: 'Rating a workout 1-10 has been shown to measure training load reasonably accurately, close to heart rate devices.',
      },
      {
        id: 'E-17',
        rule: 'E-17',
        title: 'Easy runs feel hard: load reduced',
        body: 'If easy runs feel 8 out of 10 or more twice in a row, next week distance drops 10% and one hard session becomes easy. The 8 and "twice" thresholds have not been tested in research.',
      },
      {
        id: 'E-18',
        rule: 'E-18',
        title: 'Hard sessions feel easy: pace raised',
        body: 'If hard sessions feel 4 out of 10 or less three times in a row, the app offers a slightly faster pace or a test run first. No specific research yet.',
      },
      {
        id: 'E-21',
        rule: 'E-21',
        title: 'Recovery run after a hard day',
        body: 'For recreational runners training 5 days or more, the day after a long run or hard session is a very slow run of at most 30 minutes. Distance not used moves to another easy day. Coaching practice; no specific research on recovery runs yet.',
      },
      {
        id: 'E-22',
        rule: 'E-22',
        title: 'Progression run in the Build phase',
        body: 'Every other week in the Build phase, one easy run becomes a progression run: easy, then the last 10 minutes at marathon pace. Never next to a long run or hard session. Coaching practice; no research yet.',
      },
      {
        id: 'E-23',
        rule: 'E-23',
        title: 'Strength training 1-2 times a week',
        body: 'A combined analysis of 25 randomised trials found strength training lowers sports injury risk, and another review found running economy improves in trained runners. The number of sessions per phase (2 in Base and Build, 1 in Peak) is coaching practice, not directly tested.',
      },
      {
        id: 'E-24',
        rule: 'E-24',
        title: 'When strength is scheduled',
        body: 'Strength goes on an easy day (after the run) or a non-running day, never on the long run day and never the day before a long run or interval, with at least 1 day between strength sessions. So your legs are fresh for key sessions. Coaching practice; no research yet.',
      },
      {
        id: 'E-25',
        rule: 'E-25',
        title: 'Exercises level up gradually',
        body: 'Exercises go up 1 level every 3 weeks, for example squat to split squat to Bulgarian split squat. Beginners stop at level 2. If a session feels too hard, the next session drops 1 level. Coaching practice; no research yet.',
      },
      {
        id: 'E-26',
        rule: 'E-26',
        title: 'Strength during the taper',
        body: 'Taper weeks have light core only, no leg work, and race week has no strength at all, so your legs are fresh on race day. In line with the taper principle (less load), but there is no research on strength specifically.',
      },
      {
        id: 'E-19',
        rule: 'E-19',
        title: 'Missed workouts',
        body: 'Missed 1: carry on as normal. Missed 2 or more in a week: that week is repeated so the build-up stays gradual. Coaching practice; no research yet.',
      },
    ],
  },
];
