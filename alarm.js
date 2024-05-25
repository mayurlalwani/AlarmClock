const moment = require("moment");
const prompts = require("prompts");

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

class Alarm {
  constructor(time, day, snoozeCount = 0) {
    this.time = time;
    this.day = day;
    this.snoozeCount = snoozeCount;
  }

  isTriggered(currentTime, currentDay) {
    console.log(this.time === currentTime, this.day, currentDay, currentTime);
    return this.time === currentTime && this.day === currentDay;
  }

  snooze() {
    if (this.snoozeCount < 3) {
      this.snoozeCount++;
      console.log(`Alarm snoozed for the ${this.snoozeCount + 1}th time.`);
      return true;
    }
    console.log("Maximum snooze limit reached.");
    return false;
  }
}

class AlarmClock {
  constructor() {
    this.alarms = [];
  }

  addAlarm(time, day) {
    const newAlarm = new Alarm(time, day);
    this.alarms.push(newAlarm);
    console.log(`Alarm set for ${time} on ${day}.`);
  }

  checkAlarms(currentTime, currentDay) {
    const currentMoment = moment();
    const formattedCurrentTime = currentMoment.format("HH:mm");

    const triggeredAlarms = this.alarms.filter((alarm) =>
      alarm.isTriggered(formattedCurrentTime, daysOfWeek[currentDay])
    );
    if (triggeredAlarms.length > 0) {
      console.log("Alarm triggered!");
      triggeredAlarms.forEach((alarm) => {
        this.handleAlarm(alarm);
      });
    } else {
      console.log("No alarms triggered currently.");
    }
  }

  async handleAlarm(alarm) {
    let attempts = 3;

    while (attempts > 0) {
      const { choice } = await prompts({
        type: "select",
        name: "choice",
        message: "Alarm! What do you want to do?",
        choices: [
          { title: "Snooze", value: "snooze" },
          { title: "Dismiss", value: "dismiss" },
        ],
      });
      if (choice === "snooze" && alarm.snooze()) {
        break;
      } else if (choice === "dismiss") {
        this.removeAlarm(alarm);
        break;
      } else {
        attempts--;
      }
    }
    if (attempts === 0) {
      console.log("Maximum attempts reached. Dismissing alarm automatically.");
      this.removeAlarm(alarm);
    }
  }

  removeAlarm(alarm) {
    const index = this.alarms.indexOf(alarm);
    if (index > -1) {
      this.alarms.splice(index, 1);
      console.log("Alarm deleted.");
    } else {
      console.log("Alarm not found.");
    }
  }

  displayMenu() {
    console.log("Alarm Clock Menu:");
    console.log("1. Set Alarm");
    console.log("2. Check Alarms");
    console.log("3. Delete Alarm");
    console.log("4. Exit");
  }

  async start() {
    while (true) {
      this.displayMenu();
      const userChoice = await prompts({
        type: "number",
        name: "choice",
        message: "Enter your choice:",
        validate: (value) =>
          value >= 1 && value <= 4 ? true : "Invalid choice",
      });

      switch (userChoice.choice) {
        case 1:
          const time = await prompts({
            type: "text",
            name: "time",
            message: "Enter alarm time (HH:MM):",
          });
          const day = await prompts({
            type: "select",
            name: "day",
            message: "Select day:",
            choices: [
              { title: "Monday", value: "Monday" },
              { title: "Tuesday", value: "Tuesday" },
              { title: "Wednesday", value: "Wednesday" },
              { title: "Thursday", value: "Thursday" },
              { title: "Friday", value: "Friday" },
              { title: "Saturday", value: "Saturday" },
              { title: "Sunday", value: "Sunday" },
            ],
          });
          this.addAlarm(time.time, day.day);
          break;
        case 2:
          this.checkAlarms(new Date().getHours(), new Date().getDay());
          break;
        case 3:
          if (this.alarms.length === 0) {
            console.log("No alarms to delete.");
          } else {
            const alarmChoices = this.alarms.map((alarm, index) => ({
              title: `${index + 1}. ${alarm.time} on ${alarm.day}`,
              value: alarm,
            }));
            const userChoice = await prompts({
              type: "select",
              name: "alarm",
              message: "Select alarm to delete:",
              choices: alarmChoices,
            });
            this.removeAlarm(userChoice.alarm);
          }
          break;
        case 4:
          console.log("Exiting Alarm Clock...");
          process.exit(0);
        default:
          console.error("Unexpected error.");
      }
    }
  }
}

const alarmClock = new AlarmClock();
alarmClock.start();
