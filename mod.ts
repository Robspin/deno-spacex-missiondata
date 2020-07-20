import * as log from 'https://deno.land/std/log/mod.ts';

interface Launch {
   flightNumber: number;
   mission: string;
}

const launches = new Map<number, Launch>();

await log.setup({
   handlers: {
      console: new log.handlers.ConsoleHandler('DEBUG')
   },
   loggers: {
      default: {
         level: 'DEBUG',
         handlers: ['console', 'file']
      }
   }
});

async function downloadLaunchData() {
   log.info('Dowloading launch data...');

   const response = await fetch('https://api.spacexdata.com/v3/launches', {
      method: 'GET'
   });

   if (!response.ok) {
      log.warning('Problem downloading launch data.');
      throw new Error('Failed to download launch data.');
   }

   const launchData = await response.json();
   for (const launch of launchData) {
      const flightData = {
         flightNumber: launch['flight_number'],
         mission: launch['mission_name']
      };

      launches.set(flightData.flightNumber, flightData);

      log.info(JSON.stringify(flightData));
   }
}

downloadLaunchData();
