import m from 'mithril';
import { render } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';

const md = `# About

This online tool allows you to create a radar or spider chart based on Excel (tab-separated) data.

- ■ Copy and paste your Excel data: make sure the data contains a header row, and an ID column. The data range must be between 0 and 100. It may optionally also contain an info column.
- ■ Define your chart: specify the id and info columns, as well as the data columns.
- ■ Analyze your data

## Source code

All code can be found on [Github](https://github.com/erikvullings/online-spider-chart) and was created by Erik Vullings [TNO](https://www.tno.nl).

## Acknowledgements

- Radar Chart by Yohann Berger from the Noun Project.
`;

export const AboutPage: MeiosisComponent = () => ({
  oninit: ({
    attrs: {
      actions: { setPage },
    },
  }) => setPage(Dashboards.ABOUT),
  view: () => {
    return [m('.row', m.trust(render(md)))];
  },
});
