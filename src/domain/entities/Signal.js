class Signal {
  constructor({ league, teams, scoreboard, time, status }) {
    this.league = league;
    this.teams = teams;
    this.scoreboard = scoreboard;
    this.time = time;
    this.status = status;
  }

  get key() {
    return `${this.teams}-${this.time}-${this.league}`;
  }
}

module.exports = Signal;
