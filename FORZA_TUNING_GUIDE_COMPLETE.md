# Complete Forza Tuning Guide

## Aerodynamics

- Affects top speed and high speed acceleration
- Front may increase oversteer and feel more responsive and snappy, while rear may increase understeer and cornering grip
- Generally leave this alone until final tune
- Front downforce can help drift but not very important

## Damping

- Bump stiffness is how much it compresses, rebound is how much it extends
- Stock rebound stiffness is good for base tune
- Bump stiffness should generally be between 50%-75% of rebound stiffness (to figure out range multiply .5 and .75 by corresponding rebound stiffness setting)
- Bump stiffness should usually be lower, only raise if you notice your car bouncing or feeling unstable
- Start low and work your way up with bump stiffness
- Fairly important
- Increase stiffness on the end of the car that is not losing grip or decrease stiffness on the end that is losing grip
- High bump %=slower compression
- High Front setting = more rear grip and vice versa
- Lower bump is usually better for off-road
- Stock rebound 50% of corresponding rebound for bump to keep tires on road during drift

## Springs

- Low front = oversteer
- Low rear = understeer
- A heavier/lower car should have stiffer springs
- Important
- Softer suspension as a whole will feel less responsive but grippier
- Stiff suspension will feel snappy but less grippier
- FWD and AWD are the most prone to understeering so have slightly lower front stiffnesses for your base tune
- Don't mess with front springs too much but lowering rear can increase rear grip for drift but can be fine to leave alone unless high power

## Ride Height

- Lower is generally better as it lowers center of gravity making your car more stable
- A good base tune is 2 above minimum
- Off-road vehicles need high ride height for clearance on rough terrain
- Minimum for drift

## Antiroll Bars

- ARBs tie your left and right suspension and affect mid turn over/understeer
- Very important
- Softer ARB=Darty feeling in the front (allows body to roll on front outside tire)
- Low front = oversteer
- Low rear = understeer
- Requires a lot of adjustment on FWD and AWD cars
- For front, set ½ between minimum and 50%
- For back, set at 50%
- Leave stock for RWD cars for base tune
- Keep in mind cars generally have stiffer suspension on the opposite side of it
- Don't mess with front arbs too much but lowering rear can increase rear grip but should be fine to leave alone unless high power stiffer on rear can help break out back on low power builds

## Alignment

- Negative camber=bottom pointed out, positive is opposite
- Goal of camber is to have more contact with the road in a corner, or often used as a way for RICErs to identify each other
- Negative camber is almost always better in track racing
- Important
- Knock down front and rear camber a few notches for base tune
- Camber controls corner and braking grip
- Camber needs to be adjusted using telemetry
- Toe is similar to camber, but the horizontal angle of your wheel at rest
- Toe-in means the side of the wheel facing the front of the car is pointed inwards, Toe-out is the opposite
- Toe decreases top speed and tire temperature
- Small adjustments make big changes
- Toe-out can make a car feel less stable
- For FWD and AWD cars for base tune begin with .1-.2 degrees front-toe-out which creates oversteer, if there are still problems you can add some rear toe-out
- Toe is somewhat important
- For RWD start with .1-.2 rear-toe-in to help keep rear end stable in corners
- Caster adjusts suspension vertical angle when facing the side of a car
- Higher caster angles rotate the steering axis towards the back of the car
- Higher caster angles let you run less front negative camber as when you corner your wheels lean into the turn like a motorcycle
- High caster adds camber in a corner without camber on a straight
- Not very important
- Affects how strongly tires want to recenter and how car feels, mostly personal preference
- A good base-tune is 4-7 degrees to start
- Usually max front negative camber for most drift builds, max caster for lower angle and more grip while counter steering, 1-1.5 rear negative camber unless wanting less rear grip, not too much however as it will massively decrease handling, front toe-out gives more effective steering angle and destabilized front wheels making it easier to throw more weight on entries, put as much as comfortable with, 2 is usually good, but higher can help with drift zones, rear toe can help with how the rear of the car will behave in a corner, more toe out will help with wider corner trajectory and make it feel more tight and controlled, start with 1 rear toe in for beginners and work your way out to 1 toe out or more

## Base Tune Part 2

### Gearing

- Adjusts gear ratios of transmission
- Shift final drive towards speed until the right-most line on the graph at the bottom left of your screen touches just outside of the right side of the graph for the base tune
- On high-powered RWD builds extend the first and second gear towards speed slightly which will help with throttle control and low-speed grip
- You don't need to touch gearing much for drift builds, for whichever gears you're drifting in (1-2 for low power, 3-4 for mid power, etc.), if you are red-lining and not maintaining speed you are in too low of a gear, if you cant stay high in rev range and are bogging out you are in too high of a gear, once you have found the first good drifting gear, move all next gears tighter in to it, this allows you to modulate much easier as you can up and down shift mid drift for extra wheel speed and to tuck into a tighter corner without worrying about losing the drift, default final drive

### Tires

- In horizon you don't have to worry about tire wear so the only concerns are grip, temperature, and feel
- Higher PSI will feel more responsive and have a higher theoretical peak grip usually but will lose grip more suddenly
- Lower PSI will heat up quickly and lose grip more progressively and not as much giving more time to make corrections
- PSI changes the shape of the tire and can lead to more contact with the ground
- Fairly important
- 26-35 PSI for track. Higher front PSI is better for cornering.
- You can leave stock for base tune
- For drift keep front around 30, but lowering can create a AWD type drift effect and bigger entries, rear pressure is where you fine tune rear grip, lower=grippier and smoother, higher=breaking loose more suddenly & less drift grip, run stock or lower rear tire pressure, lower on high power cars, in tandems it's important to run what the other driver is running, even high psi, if you need to increase psi much over stock to stay in the drift chances are you just need a stiffer rear end, thinner tyres (or tires?), or more power

## Identifying & Solving Problems

- T opens telemetry on PC
- Navigate to suspension
- The white bars with pink show how much the suspension is compressing/expanding
- Fully pink=Fully compressed (You don't want to see this under normal driving conditions)
- Take a lap around a circuit with this window open to make sure your suspension isn't bottoming out (note: this is different from your body bottoming out)
- Generally the pink bar should remain between 20%-80%
- If it isn't moving much then it needs to be softened and vice versa, however if it isn't moving much but feels good then it should be fine
- If it is good on base tune then it may only slightly be adjusted for final tune for overall feel
- Navigate to tires & misc. Window to check camber
- Watch the outside tire setting on a corner
- This should never go positive under normal cornering circumstances, on a low profile tire it should never go lower than -1 to -.5
- If it goes neutral or positive, lower camber
- Navigate to heat
- Your tires should generally be a mustard color in the middle of the corner
- The inside should be the hottest, the outside the coldest, and the middle of the tire in the middle
- This can be adjusted by tire compounds and dialed in with tire pressure
- Peak grip occurs when you see a clearish mustard color
- The difference between the inside and outside should never be more than 20 degrees
- If it is greater than 20 degrees lessen camber and vice versa
- The temp difference should be within 10-15 degrees (F)
- If your middle is less than inside and outside then you need to increase PSI and vice versa
- These checks being done your base tune should be complete

## Final Tune

- Over/Understeer can occur in Corner entry, mid, and exit
- Keep in mind multiple can happen at the same time
- FWD and AWD tend to understeer and RWD tends to oversteer, especially in the exit of a corner

### Corner Entry Understeer

- If when turning it feels like the car is resisting input, that is corner entry understeer; You can:

* Adjust tire pressure
* Lower front springs/ARBs
* Increase toe-out in front/rear
* Increase front downforce
* Lower diff decel lock
* Increase front bump
* Decrease front rebound

### Corner Mid Understeer

- Corner mid understeer feels like the car won't turn in the middle of a corner; You can:

* Lower front ARBs
* Increase rear ARBs
* Lower front springs
* Increase rear springs
* Increase front toe-out
* Decrease rear toe-in
* Increase front downforce

### Corner Exit Understeer

- Corner exit understeer happens when accelerating out of a corner; You can:

* Lower diff accel lock
* Increase rear springs/ARBs
* Lower front springs/ARBs
* Adjust brake balance forward
* Increase rear downforce

### Corner Entry Oversteer

- Corner entry oversteer makes the rear slide when entering corners; You can:

* Increase front springs/ARBs
* Lower rear springs/ARBs
* Decrease front toe-out
* Increase rear toe-in
* Lower front downforce
* Increase diff decel lock

### Corner Mid Oversteer

- Corner mid oversteer causes rear sliding mid-corner; You can:

* Increase rear ARBs
* Lower front ARBs
* Increase rear springs
* Lower front springs
* Decrease front toe-out
* Increase rear toe-in

### Corner Exit Oversteer

- Corner exit oversteer happens under acceleration; You can:

* Increase diff accel lock
* Lower rear springs/ARBs
* Increase front springs/ARBs
* Adjust brake balance rearward
* Lower rear downforce

## Differential Settings

- Controls how power is distributed between wheels
- Very important for handling characteristics
- Accel lock affects power delivery under acceleration

* Higher values = more locked differential = less wheelspin but more understeer
* Lower values = more open differential = more wheelspin but better turning

- Decel lock affects engine braking distribution

* Higher values = more stability under braking but can cause understeer
* Lower values = less stability but better turn-in

- Start with 50% accel and 20% decel for base tune
- For drift builds, lower accel lock (20-40%) for easier initiation

## Brake Settings

- Brake balance affects front/rear braking distribution
- Brake pressure controls overall braking force
- Forward brake balance increases front braking, can help with turn-in but may cause front lockup
- Rearward brake balance increases rear braking, can help with rotation but may cause rear instability
- Start with 52-55% front brake balance for most cars
- Adjust brake pressure to personal preference (usually 90-100%)
- For drift, slightly rearward balance (48-50%) can help with entries

## Advanced Tuning Tips

- Make small adjustments (1-2 clicks at a time)
- Test changes on familiar tracks
- Keep notes of what works and what doesn't
- Tune for your driving style, not just lap times
- Weather and track conditions affect optimal settings
- Different tracks may require different setups
- Practice with telemetry to understand what the data means
- Don't chase perfect numbers - if it feels good and is fast, it's right

## Drift-Specific Tuning

- Power is king - more power = easier drifting
- Rear tire compound should be 1-2 steps softer than front
- Lower rear tire pressure for more grip and control
- Stiffer rear springs and ARBs for easier breakaway
- Maximum front negative camber for grip while counter-steering
- Front toe-out for more steering angle and easier entries
- Lower diff accel lock for easier initiation
- Tune for the specific drift zone or track layout
- Practice throttle control - smooth inputs are key

## Track-Specific Considerations

### High-Speed Tracks

- Focus on stability and top speed

* Stiffer suspension
* Higher downforce
* Longer gearing

### Technical Tracks

- Focus on agility and braking

* Softer suspension
* Lower downforce
* Shorter gearing

### Weather Conditions

- Wet conditions: Reduce tire pressure, soften suspension
- Off-road: Raise ride height, soften suspension, adjust tire pressure

## Common Mistakes to Avoid

- Making too many changes at once
- Ignoring telemetry data
- Copying someone else's tune without understanding it
- Over-tuning - sometimes stock settings work best
- Not testing in race conditions
- Focusing only on lap times instead of consistency
- Neglecting tire temperatures and pressures
- Not accounting for fuel load changes during races

## Conclusion

- Tuning is an iterative process - be patient
- Understanding the fundamentals is more important than perfect numbers
- Every car and driver combination is different
- Practice and experience are the best teachers
- Have fun and don't be afraid to experiment
- Remember: the best tune is the one that makes you fastest and most comfortable
