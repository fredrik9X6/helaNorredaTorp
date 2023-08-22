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
    //remove the two first dates
    dates.shift();
    dates.shift();

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

  let CurrentSelectedDates = []; //to store selected dates

  const fp = flatpickr('#booking-calendar', {
    mode: 'range',
    dateFormat: 'Y-m-d',
    minDate: new Date(),
    disable: getAllBookedDates(),
    onChange: function (selectedDates) {
      const startDate = selectedDates[0] ? selectedDates[0].toISOString().split('T')[0] : '';
      const endDate = selectedDates[1] ? selectedDates[1].toISOString().split('T')[0] : '';

      const memberDiscountBox = document.getElementById('member-discount');
      const memberDiscount = memberDiscountBox ? memberDiscountBox.checked : false;
      const tillaggCheckbox = document.getElementById('tillagg');
      const tillaggChecked = tillaggCheckbox ? tillaggCheckbox.checked : false;

      CurrentSelectedDates = selectedDates;

      const totalPrice = calculateTotalPrice(
        startDate,
        endDate,
        memberDiscount,
        tillaggChecked,
        allLodgesRate
      );
      document.getElementById('total-price').textContent = totalPrice.toString();

      appendPriceInput(totalPrice);
    },
  });

  // updating the price when the member discount checkbox is clicked
  document.getElementById('tillagg').addEventListener('change', function () {
    const startDate = CurrentSelectedDates[0]
      ? CurrentSelectedDates[0].toISOString().split('T')[0]
      : ''; // Get the selected start date
    const endDate = CurrentSelectedDates[1]
      ? CurrentSelectedDates[1].toISOString().split('T')[0]
      : ''; // Get the selected end date
    const memberDiscountBox = document.getElementById('member-discount');
    const memberDiscount = memberDiscountBox ? memberDiscountBox.checked : false;
    const tillaggCheckbox = document.getElementById('tillagg');
    const tillaggChecked = tillaggCheckbox ? tillaggCheckbox.checked : false; // Get the checked state of the checkbox

    const totalPrice = calculateTotalPrice(
      startDate,
      endDate,
      memberDiscount,
      tillaggChecked,
      allLodgesRate
    );

    document.getElementById('total-price').textContent = totalPrice.toString();
    appendPriceInput(totalPrice);
  });
  // updating the total price when member discount is checked
  document.getElementById('member-discount').addEventListener('change', function () {
    const startDate = CurrentSelectedDates[0]
      ? CurrentSelectedDates[0].toISOString().split('T')[0]
      : ''; // Get the selected start date
    const endDate = CurrentSelectedDates[1]
      ? CurrentSelectedDates[1].toISOString().split('T')[0]
      : ''; // Get the selected end date

    const memberDiscountBox = document.getElementById('member-discount');
    const memberDiscount = memberDiscountBox ? memberDiscountBox.checked : false;
    const tillaggCheckbox = document.getElementById('tillagg');
    const tillaggChecked = tillaggCheckbox ? tillaggCheckbox.checked : false; // Get the checked state of the checkbox

    const totalPrice = calculateTotalPrice(
      startDate,
      endDate,
      memberDiscount,
      tillaggChecked,
      allLodgesRate
    );

    document.getElementById('total-price').textContent = totalPrice.toString();
    appendPriceInput(totalPrice);
  });

  function appendPriceInput(totalPrice) {
    const priceInput = document.getElementById('price-input');
    priceInput.value = totalPrice.toString();
  }

  function calculateTotalPrice(startDate, endDate, memberDiscount, tillaggChecked, allLodgesRate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalPrice = 0;

    const currentDate = new Date(start);
    while (currentDate < end) {
      const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 4;
      const nightlyRate = isWeekend ? allLodgesRate.weekendRate : allLodgesRate.weekdayRate;

      totalPrice += nightlyRate;

      if (tillaggChecked) {
        totalPrice += 100; // Add 100 for each day booked
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (memberDiscount) {
      totalPrice *= 0.7; // Add 30% discount
    }
    return totalPrice.toFixed(0); // Return the total price
  }
});

flatpickr.localize(Swedish);
