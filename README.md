# Zoutvat

-----

## Zeus Online Urenloop Tracking Voor Attente Trackers

### Features
- Supports any track layout given in a svg path format
- Variable amount of Ronnies or teams
- Select which teams to show
- Show Ronnie locations

### .env
| Variable | Explanation                                                                                                                                                                                        | Default        |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| LOXSI_IP | Ip of Loxsi                                                                                                                                                                                        | ws://localhost |
| LOXSI_PORT | Port of Loxsi                                                                                                                                                                                      | 8000           |
| DISTANCE_LAST_STATION_TO_START | Distance of the last Ronnie to the start. E.g. if it's located on the start it's 0, if it's located 10 meters before the start it's 10                                                             | 0              |
| DISTANCE_RONNIE_SIGNAL | The lowest range any of the Ronnies has to detect a baton that is considered valid by the lapper                                                                                                   | 20             |
| OFFSET_MAX | Maximum amount the animation may be in front of the IRL runner. Higher values makes the animation smoother but less accurate (ms)                                                                  | 1000           |
| OFFSET_MIN | Maximum amount the animation may be behind the IRL runner. Higher values makes the animation smoother but less accurate (ms)                                                                       | -1000          |
| OFFSET_MULTIPLIER | Factor for slowing down or speeding up the animation. Higher values will result in more drastic speed differences when the animation is in front or behind (factor at which the animation changes) | 2              |
| RONNIE_MAX_DIFFERENCE | Maximum amount of Ronnies that can be between the IRL runner and the animation before the animation is stopped and reset back to the latest known position of the IRL runner                       | 3 | 

### Animation
**TL:DR**

**The animation looks at the average time a team needs for a segment between 2 Ronnies and mimics that speed**

The person running IRL is called the runner. 
Ronnies can sometimes be called stations and references to the animation are always made with animation.
The track is divided in x amount of segments. Each segment is from one Ronnie to the next one.

When the lapper first starts reporting that a team is at Ronnie 5 it doesn't mean that that team is actually there. 
All it means is that Ronnie 5 is the one with the strongest signal for the last x amount of seconds. 
To compensate for that each Ronnie's locating is moved back either 4/10 its previous segment or *DISTANCE_RONNIE_SIGNAL*, whichever is smaller.

After that is done it starts listening for any updates to a team's position. 
At its core the animation looks at the average time it takes a team to travel one segment and mimics that speed. 
Whenever the runner arrives at a Ronnie it looks where the animation is, calculates the difference, also called offset, and takes that into account for the next segment.
As this results in an animation that isn't very accurate and speeds up / slows down a lot there are a couple of extra methods to make it more smooth.

First, each runner runs usually at speed that is a certain % faster or slower than the average. 
As each team switches their runners at a different position the animation looks at the previous segment for the % difference with the average and applies it to the next segment. 
This is called adjustment inside the code.

Secondly, when the animation arrives at Ronnie 3 before the runner we're waiting for the runner to arrive at Ronnie 3 to calculate the offset. 
Instead of letting the animation continue to run at a certain speed and increasing the offset we're gradually slowing the animation down in an attempt to decrease the resulting offset. 
Gradually slowing down is done by decreasing the speed until the offset reaches the *OFFSET_MIN* * *OFFSET_MULTIPLIER* value or the runner arrives at Ronnie 3. 
It is not recommended to slow down too much as it is possible the lapper might not have detected that the runner arrived at Ronnie 3 and might straight go for Ronnie 4. 
The same principles apply when the runner arrives earlier than the animation.

Lastly, in an attempt to make it smoother in sacrifice for some accuracy the offset is ignored if it's between *OFFSET_MIN* and *OFFSET_MAX*. 
If the offset ever gets outside that interval the animation slows down / speed up in the next segment until the offset is again inside the interval.


### TODO
- [x] Add animations to the runners
- [ ] Allow custom background for the track
- [ ] Svg view box support different sizes of svg paths
- [x] Support broken Ronnies
- [x] Support last station not set at finish
- [ ] Don't make it look like a 5-year-old designed it

### Development
In order to simulate data:
- Run [Loxsi](https://github.com/12urenloop/Loxsi) on the Zoutvat branch
- Run [Telraam](https://github.com/12urenloop/Telraam) on the Zoutvat branch
- Run [Simsalabim](https://github.com/12urenloop/SIMSALABIM)

Run project:
- Configure .env
- Start ZOUTVAT with `npm run dev`