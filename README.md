# Zoutvat

-----

## Zeus Online Urenloop Tracking Voor Attente Trackers

### Features
- Supports any track layout given in a svg path format
- Variable amount of Ronnies or teams
- Select which teams to show
- Show Ronnie locations

### TODO
- [ ] Add animations to the runners
- [ ] Allow custom background for the track
- [ ] Svg view box support different sizes of svg paths
- [ ] Support broken Ronnies
- [ ] Support last station not set at finish
- [ ] Don't make it look like a 5-year-old designed it

### Development
In order to simulate data:
- Run [Loxsi](https://github.com/12urenloop/Loxsi) on the Zoutvat branch
- Run [Telraam](https://github.com/12urenloop/Telraam) on the Zoutvat branch
- Run [Simsalabim](https://github.com/12urenloop/SIMSALABIM)
- Configure .env
- Run this project with `npm run dev`