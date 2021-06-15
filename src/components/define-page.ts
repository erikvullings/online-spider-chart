import m from 'mithril';
import { LayoutForm, UIForm } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';
import { excelToJSON } from '../utils';

export const DefinePage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => setPage(Dashboards.ABOUT),
    view: ({
      attrs: {
        state: {
          app: { dataModel = {} },
        },
        actions: { saveModel },
      },
    }) => {
      const { raw = '', idColumn = '', infoColumn = '' } = dataModel;
      const converted = raw && excelToJSON(raw);
      const options = converted
        ? converted.headers && converted.headers.map((h) => ({ id: h, label: h }))
        : [];
      const columnOptions = options.filter((o) => o.id !== idColumn && o.id !== infoColumn);
      const rows = converted && converted.rows;

      return [
        m(
          '.row',
          m(LayoutForm, {
            form: [
              {
                id: 'raw',
                required: true,
                label: 'Paste your Excel data',
                type: 'textarea',
                initialValue: raw,
              },
              {
                id: 'rows',
                show: 'raw',
                label: 'Imported data (first 10 rows)',
                type: 'table',
                options,
                max: 10,
              },
              {
                id: 'idColumn',
                required: true,
                label: 'ID field',
                type: 'select',
                options,
                className: 'col s4',
              },
              {
                id: 'infoColumn',
                label: 'Info field',
                type: 'select',
                options: [
                  { id: 'none', label: 'No info field present' },
                  ...options.filter((i) => !idColumn || idColumn !== i.id),
                ],
                className: 'col s4',
              },
              {
                id: 'type',
                required: true,
                label: 'Chart type',
                type: 'select',
                options: [
                  { id: 'spider', label: 'Spider' },
                  { id: 'radar', label: 'Radar' },
                ],
                className: 'col s4',
              },
              {
                id: 'columns',
                label: 'Data axis',
                repeat: true,
                pageSize: 15,
                sortProperty: 'id',
                type: [
                  {
                    id: 'id',
                    required: true,
                    label: 'ID (determines sort order)',
                    type: 'text',
                    className: 'col s3',
                  },
                  {
                    id: 'idColumn',
                    required: true,
                    label: 'ID field',
                    type: 'select',
                    multiple: true,
                    options: columnOptions,
                    className: 'col s3',
                  },
                  {
                    id: 'label',
                    label: 'Axis name',
                    type: 'text',
                    className: 'col s6',
                    required: true,
                  },
                ],
              },
              {
                id: 'colors',
                label: 'Colors of data set',
                repeat: 'true',
                pageSize: 1,
                type: [{ id: 'color', label: 'Color', type: 'color' }],
              },
            ] as UIForm,
            obj: dataModel,
            context: [{ rows }],
            onchange: () => saveModel(dataModel),
          })
        ),
      ];
    },
  };
};
