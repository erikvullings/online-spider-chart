import m from 'mithril';
import { FlatButton } from 'mithril-materialized';
import { LayoutForm } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';
import { SpiderChartFactory, SpiderColumns, SpiderData, SpiderOptions } from 'svg-spider-chart';
import { excelToJSON, formatDate } from '../utils';

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
        type = 'spider',
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
            id: 'spiderchart',
            className: 'spider-chart personas',
            viewBox: '-20 0 140 100',
            columns: spiderColumns,
            data,
            options: {
              scaleType: type,
              size: 100,
              scales: 10,
              // scaleType: 'spider',
              shapeProps: (data) => ({
                className: 'shape',
                stroke: data.color as string,
                fill: data.color !== clrs[0].color ? 'transparent' : (data.color as string),
              }),
              style: `.spider-chart {
                width: 100%;
                max-width: 100%;
              }
              .spider-chart .axis {
                stroke: #555;
                stroke-width: 0.2;
              }
              .spider-chart .scale {
                fill: #eee;
                stroke: #999;
                stroke-width: 0.2;
              }
              .spider-chart .shape {
                fill-opacity: 0.3;
                stroke-width: 0.5;
              }
              .spider-chart:hover .shape {
                fill-opacity: 0.3;
              }
              .spider-chart .shape:hover,
              .spider-chart:hover .shape:hover {
                fill-opacity: 0.6;
              }
              .spider-chart .caption {
                font-size: 3px;
                fill: #444;
                font-weight: normal;
                text-shadow: 1px 1px 0 #fff;
              }`,
            } as Partial<SpiderOptions>,
          }),
        m('.col.s12.right-align', [
          m('a#downloadAnchorElem', { style: 'display:none' }),
          m(FlatButton, {
            iconName: 'download',
            label: 'Download as SVG',
            onclick: () => {
              const svg = document.getElementById('spiderchart');
              if (!svg) return;
              const serializer = new XMLSerializer();
              let source = serializer.serializeToString(svg);

              //add name spaces.
              if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
              }
              if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
              }
              //add xml declaration
              source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

              //convert svg source to URI data scheme.
              const dataStr = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
              const dlAnchorElem = document.getElementById('downloadAnchorElem');
              if (!dlAnchorElem) return;
              dlAnchorElem.setAttribute('href', dataStr);
              dlAnchorElem.setAttribute('download', `${formatDate()}_v${curId}.svg`);
              dlAnchorElem.click();
              console.log(source);
            },
          }),
        ]),
      ]);
    },
  };
};
