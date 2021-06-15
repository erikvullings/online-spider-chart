// import { UIForm } from 'mithril-ui-form';

export type DataModel = {
  version?: number;
  timestamp?: number;
  raw?: string;
  converted?: Array<Record<string, string | number>>;
  /** Name of the column that represents the ID */
  idColumn?: string;
  /** Name of the column that represents additional info */
  infoColumn?: string;
  /** Axis of the spider or radar chart */
  columns?: Array<{
    /** Unique ID */
    id?: string;
    /** Label to display in the chart */
    label?: string;
    /** Names of the columns in Excel. When there are multiple names, it means there are multiple measurements */
    dataColumns?: string[];
  }>;
};

export const exampleModel = {};
