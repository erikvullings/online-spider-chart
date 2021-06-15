import m from 'mithril';
import { LayoutForm } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';
import { SpiderChartFactory, SpiderColumns, SpiderData, SpiderOptions } from 'svg-spider-chart';
import { excelToJSON } from '../utils';

const SpiderChart = SpiderChartFactory(m);

export const ChartPage: MeiosisComponent = () => {
  const defaultColors = [{ color: '#ffff00' }, { color: '#0000ff' }, { color: '#ff0000' }];

  return {
    oninit: ({
      attrs: {
        state: {
          app: { dataModel = {} },
        },
        actions: { setPage, saveModel },
      },
    }) => {
      const { raw = '' } = dataModel;
      dataModel.converted = raw ? excelToJSON(raw) : undefined;
      if (dataModel.converted) saveModel(dataModel);
      setPage(Dashboards.CHART);
    },
    view: ({
      attrs: {
        state: {
          app: { dataModel = {} },
        },
        actions: { saveModel },
      },
    }) => {
      const {
        idColumn = '',
        columns = [],
        curId = '',
        converted,
        colors = defaultColors,
      } = dataModel;
      if (!idColumn) return m('p.error', 'No ID column defined!');
      if (columns.length === 0) return m('p.error', 'No data column defined!');

      const ids = converted
        ? converted.rows
            .filter((row) => row[idColumn])
            .map((row) => row[idColumn].toString())
            .map((id) => ({ id, label: id }))
        : ([] as Array<{ id: string; label: string }>);
      const spiderColumns = columns
        .filter((cur) => cur.id && cur.label && cur.idColumn && cur.idColumn.length > 0)
        .reduce((acc, cur) => {
          acc['id_' + cur.id] = cur.label || '';
          return acc;
        }, {} as SpiderColumns);

      const clrs = defaultColors.map((c, i) => ({
        color: colors[i] && colors[i].color ? colors[i].color : c,
      }));

      const data =
        curId &&
        converted &&
        converted.rows
          .filter((row) => row[idColumn] === curId)
          .reduce((acc, cur) => {
            acc.push(
              ...[0, 1, 2]
                .map((i) =>
                  columns
                    .filter(
                      (col) =>
                        col.id &&
                        col.idColumn &&
                        col.idColumn.length > i &&
                        typeof cur[col.idColumn[i]] !== undefined
                    )
                    .reduce(
                      (a, col) => {
                        a['id_' + col.id] = +cur[col.idColumn![i]] / 100;
                        return a;
                      },
                      { color: clrs[i].color } as SpiderData
                    )
                )
                .filter(
                  (s) =>
                    Object.keys(s).length >= columns.length &&
                    columns.reduce((a, c) => a + +s['id_' + c.id], 0) > 0
                )
            );
            return acc;
          }, [] as SpiderData[]);
      console.log(data);

      return m('.row', { style: 'height: 95vh;' }, [
        m(LayoutForm, {
          form: [
            { id: 'curId', type: 'select', label: 'Active ID', options: ids, className: 'col s3' },
          ],
          obj: dataModel,
          onchange: () => saveModel(dataModel),
        }),

        data &&
          m(SpiderChart, {
            className: 'spider-chart personas',
            viewBox: '-20 0 140 100',
            columns: spiderColumns,
            data,
            options: {
              size: 100,
              scales: 10,
              scaleType: 'spider',
              shapeProps: (data) => ({
                className: 'shape',
                stroke: data.color as string,
                fill: data.color !== clrs[0].color ? 'transparent' : (data.color as string),
              }),
            } as Partial<SpiderOptions>,
          }),
      ]);
    },
  };
};
