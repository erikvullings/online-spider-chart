import m from 'mithril';
import { Button, Icon } from 'mithril-materialized';
import background from '../assets/background.jpg';
import { dashboardSvc, MeiosisComponent } from '../services';
import { Dashboards } from '../models';
import { formatDate } from '../utils';
import { DataModel } from '../models';

export const HomePage: MeiosisComponent = () => {
  const readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Dashboards.HOME);
    },
    view: ({
      attrs: {
        state: {
          app: { dataModel },
        },
        actions: { saveModel },
      },
    }) => [
      m('div', { style: 'position: relative;' }, [
        m(
          '.overlay.center',
          {
            style: 'position: absolute; width: 100%',
          },
          [m('h3.white-text', 'Online Spider Chart (CAT)')]
        ),
        m('img.responsive-img', { src: background }),
        m('.buttons.center', { style: 'margin: 10px auto;' }, [
          m(Button, {
            iconName: 'clear',
            className: 'btn-large',
            label: 'Start new',
            onclick: () => {
              saveModel({} as DataModel);
              dashboardSvc.switchTo(Dashboards.SETTINGS);
            },
          }),
          typeof dataModel.version === 'number' &&
            m(Button, {
              iconName: 'edit',
              className: 'btn-large',
              label: 'Continue',
              onclick: () => {
                dashboardSvc.switchTo(Dashboards.CHART);
              },
            }),
          m('a#downloadAnchorElem', { style: 'display:none' }),
          m(Button, {
            iconName: 'download',
            className: 'btn-large',
            label: 'Download',
            onclick: () => {
              const dlAnchorElem = document.getElementById('downloadAnchorElem');
              if (!dlAnchorElem) return;
              const version = typeof dataModel.version === 'undefined' ? 1 : dataModel.version++;
              const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify({ version, ...dataModel }, null, 2));
              dlAnchorElem.setAttribute('href', dataStr);
              dlAnchorElem.setAttribute(
                'download',
                `${formatDate()}_v${version}_spider_data_model.json`
              );
              dlAnchorElem.click();
            },
          }),
          m('input#selectFiles[type=file]', { style: 'display:none' }),
          readerAvailable &&
            m(Button, {
              iconName: 'upload',
              className: 'btn-large',
              label: 'Upload',
              onclick: () => {
                const fileInput = document.getElementById('selectFiles') as HTMLInputElement;
                fileInput.onchange = () => {
                  if (!fileInput) return;
                  const files = fileInput.files;
                  if (files && files.length <= 0) {
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (e: ProgressEvent<FileReader>) => {
                    const result =
                      e &&
                      e.target &&
                      e.target.result &&
                      (JSON.parse(e.target.result.toString()) as DataModel);
                    result && result.version && saveModel(result);
                  };
                  const data = files && files.item(0);
                  data && reader.readAsText(data);
                  dashboardSvc.switchTo(Dashboards.CHART);
                };
                fileInput.click();
              },
            }),
        ]),
        m(
          '.section.white',
          m('.row.container.center', [
            m('.row', [
              m(
                '.col.s12.m4',
                m('.icon-block', [
                  m('.center', m(Icon, { iconName: 'dashboard' })),
                  m('h5.center', 'Upload'),
                  m('p.light', 'Upload your Excel-like tabular data..'),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.icon-block', [
                  m('.center', m(Icon, { iconName: 'flash_on' })),
                  m('h5.center', 'Define'),
                  m('p.light', `Define how the spider or radar chart needs to look.`),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.icon-block', [
                  m('.center', m(Icon, { iconName: 'group' })),
                  m('h5.center', 'Analyze'),
                  m('p.light', 'Analyze your data.'),
                ])
              ),
            ]),
          ])
        ),
      ]),
    ],
  };
};
