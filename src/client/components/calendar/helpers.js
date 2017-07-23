import moment from 'moment';
import momentTz from 'moment-timezone';

const dateTimeFormat = 'YYYY-MM-DDTHH:mm:00';

const getDateTime = (date, time) => {
  const timeSplit = time.split(':');
  const isPm = timeSplit[1].search(/pm/) > -1;
  const hourAsNumber = Number(timeSplit[0]);
  const hour = (() => {
    if (isPm) {
      return hourAsNumber < 12 ? hourAsNumber + 12 : hourAsNumber;
    } else {
      return hourAsNumber < 12 ? hourAsNumber : 0;
    }
  })();
  const minutes = timeSplit[1].substr(0,2);

  return moment(date).hours(hour).minutes(minutes).format(dateTimeFormat);
}

const getSummary = (hostGivenName, hostFamilyName, guestGivenName, guestFamilyName) => `${hostGivenName} ${hostFamilyName} <> ${guestGivenName} ${guestFamilyName} | Good Chat`;

const getDescription = (teamId, meetingGroupId) => `http://www.goodchat.io/#/teams/${teamId}/meetings/${meetingGroupId}`;

const getStartDateTime = (startDate, startTime) => getDateTime(startDate, startTime);

const getEndDateTime = (endDate, endTime) => getDateTime(endDate, endTime);

const getTimeZone = () => moment.tz.guess();

const getOptions = (guestEmail) => ({
  attendees: [
    { email: guestEmail }
  ]
});

export default {
  dateTimeFormat,
  getSummary,
  getDescription,
  getStartDateTime,
  getEndDateTime,
  getTimeZone,
  getOptions
};
