import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getDayInFuture = (days): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Men Haircut
//
//     slots for the next 7 days, Sunday off.
//     from 08:00-20:00 Monday to Friday.
//     from 10:00-22:00 Saturday.
//     lunch break at 12:00-13:00.
//     cleaning break at 15:00-16:00.
//     max 3 clients per slot.
//     slots every 10 minutes.
//     5 minutes cleanup break between slots.
//     the third day starting from now is a public holiday.
//
// Woman Haircut
//
//     slots for the next 7 days, Sunday off.
//     from 08:00-20:00 Monday to Friday.
//     from 10:00-22:00 Saturday.
//     lunch break at 12:00-13:00.
//     cleaning break at 15:00-16:00.
//     slots every 1 hour.
//     10 minutes cleanup break.
//     max 3 clients per slot.
//     the third day starting from now is a public holiday.

async function main() {
  // Men Haircut
  await prisma.service.create({
    data: {
      name: 'Men Haircut',
      serviceDuration: 10 * 60,
      breakDuration: 5 * 60,
      maxBookableDays: 7,
      maxClientPerSlot: 3,
      ServiceOpeningHours: {
        create: [
          {
            weekDay: 1,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 2,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 3,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 4,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 5,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 6,
            startTime: 10 * 60 * 60,
            endTime: 22 * 60 * 60,
          },
        ],
      },
      ServiceBreak: {
        create: [
          // lunch break at 12:00-13:00.
          {
            name: 'lunch break',
            startTime: 12 * 60 * 60,
            endTime: 13 * 60 * 60,
          },
          // cleaning break at 15:00-16:00.
          {
            name: 'cleaning break',
            startTime: 15 * 60 * 60,
            endTime: 16 * 60 * 60,
          },
        ],
      },
      ServiceOffTime: {
        create: [
          // the third day starting from now is a public holiday.
          {
            name: 'public holiday',
            start: getDayInFuture(3),
            end: getDayInFuture(4),
          },
        ],
      },
    },
  });

  // Woman Haircut
  await prisma.service.create({
    data: {
      name: 'Woman Haircut',
      serviceDuration: 60 * 60,
      breakDuration: 10 * 60,
      maxBookableDays: 7,
      maxClientPerSlot: 3,
      ServiceOpeningHours: {
        create: [
          {
            weekDay: 1,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 2,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 3,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 4,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 5,
            startTime: 8 * 60 * 60,
            endTime: 20 * 60 * 60,
          },
          {
            weekDay: 6,
            startTime: 10 * 60 * 60,
            endTime: 22 * 60 * 60,
          },
        ],
      },
      ServiceBreak: {
        create: [
          // lunch break at 12:00-13:00.
          {
            name: 'lunch break',
            startTime: 12 * 60 * 60,
            endTime: 13 * 60 * 60,
          },
          // cleaning break at 15:00-16:00.
          {
            name: 'cleaning break',
            startTime: 15 * 60 * 60,
            endTime: 16 * 60 * 60,
          },
        ],
      },
      ServiceOffTime: {
        create: [
          // the third day starting from now is a public holiday.
          {
            name: 'public holiday',
            start: getDayInFuture(3),
            end: getDayInFuture(4),
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
