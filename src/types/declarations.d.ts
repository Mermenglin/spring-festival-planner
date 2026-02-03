declare module 'antd' {
  export * from 'antd/es';
}

declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    toDate(): Date;
  }
  
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearShengXiao(): string;
  }
}

declare module '@fullcalendar/react' {
  import { Component } from 'react';
  import { CalendarOptions } from '@fullcalendar/core';
  
  export default class FullCalendar extends Component<CalendarOptions> {}
}

declare module '@fullcalendar/daygrid' {
  import { PluginDef } from '@fullcalendar/core';
  const plugin: PluginDef;
  export default plugin;
}

declare module '@fullcalendar/timegrid' {
  import { PluginDef } from '@fullcalendar/core';
  const plugin: PluginDef;
  export default plugin;
}

declare module '@fullcalendar/interaction' {
  import { PluginDef } from '@fullcalendar/core';
  const plugin: PluginDef;
  export default plugin;
}
