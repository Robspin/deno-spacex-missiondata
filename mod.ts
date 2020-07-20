import * as log from 'https://deno.land/std/log/mod.ts';
import _ from 'https://deno.land/x/deno_lodash/mod.ts';

interface Launch {
   flightNumber: number;
   mission: string;
   rocket: string;
   customers: Array<string>;
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

export async function downloadLaunchData() {
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
      const payloads = launch['rocket']['second_stage']['payloads'];
      const customers = _.flatMap(payloads, (payload: any) => {
         return payload['customers'];
      });

      const flightData = {
         flightNumber: launch['flight_number'],
         mission: launch['mission_name'],
         rocket: launch['rocket']['rocket_name'],
         customers: customers
      };

      launches.set(flightData.flightNumber, flightData);

      log.info(JSON.stringify(flightData));
   }
}

if (import.meta.main) {
   await downloadLaunchData();
   log.info(JSON.stringify(import.meta));
   log.info(`Downloaded data for ${launches.size} SpaceX launches.`);
}
