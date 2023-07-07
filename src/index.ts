import flatpickr from 'flatpickr';
import { Swedish } from 'flatpickr/dist/l10n/sv.js';

import type { Event } from './types';

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const events = [...scripts].map((script) => {
    const event: Event = JSON.parse(script.textContent!);
    event.start = new Date(event.start);
    event.end = new Date(event.end);

    return event;
  });

  return events;
};

const getAllBookedDates = (): string[] => {
  return getEvents().flatMap((event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const dates = [];
    const currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  });
};

window.Webflow ||= [];
window.Webflow.push(() => {
  const events = getEvents();
  console.log(events);

  const allLodgesRate = {
    weekdayRate: 2950,
    weekendRate: 4250,
  };

  const fp = flatpickr('#booking-calendar', {
    mode: 'range',
    dateFormat: 'Y-m-d',
    minDate: new Date().fp_incr(14),
    disable: getAllBookedDates(),
    onChange: function (selectedDates) {
      const startDate = selectedDates[0] ? selectedDates[0].toISOString().split('T')[0] : '';
      const endDate = selectedDates[1] ? selectedDates[1].toISOString().split('T')[0] : '';

      const memberDiscount = document.getElementById('member-discount').checked;

      const totalPrice = calculateTotalPrice(startDate, endDate, memberDiscount, allLodgesRate);
      document.getElementById('total-price').textContent = totalPrice.toString();
    },
  });

  const calculateTotalPrice = (startDate, endDate, memberDiscount, allLodgesRate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    let totalPrice = 0;

    const currentDate = new Date(start);
    while (currentDate < end) {
      const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 4;

      const nightlyRate = isWeekend ? allLodgesRate.weekendRate : allLodgesRate.weekdayRate;

      if (memberDiscount) {
        totalPrice += nightlyRate * 0.7;
      } else {
        totalPrice += nightlyRate;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
  };
});

flatpickr.localize(Swedish);
