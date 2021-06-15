import Stream from 'mithril/stream';
import { dashboardSvc, ModelUpdateFunction } from '..';
import { Dashboards } from '../../models';
import { exampleModel, DataModel } from '../../models';
import { IAppModel, UpdateStream } from '../meiosis';
/** Application state */

const dataModelKey = 'spiderModel';

export interface IAppStateModel {
  app: {
    page?: Dashboards;
    dataModel: DataModel;
  };
}

export interface IAppStateActions {
  setPage: (page: Dashboards) => void;
  update: (model: Partial<ModelUpdateFunction>) => void;
  changePage: (
    page: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) => void;
  createRoute: (
    page: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) => void;
  saveModel: (cat: DataModel) => void;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}

// console.log(`API server: ${process.env.SERVER}`);

const cm = localStorage.getItem(dataModelKey) || JSON.stringify(exampleModel);
const dataModel = JSON.parse(cm) as DataModel;
// TODO: DURING DEV
// catModel.form = defaultCapabilityModel.form;
// catModel.settings = defaultCapabilityModel.settings;
// catModel.data = defaultCapabilityModel.data;

export const appStateMgmt = {
  initial: {
    app: {
      dataModel,
    },
  },
  actions: (update, _states) => {
    return {
      setPage: (page: Dashboards) => update({ app: { page } }),
      update: (model: Partial<ModelUpdateFunction>) => update(model),
      changePage: (page, params, query) => {
        dashboardSvc && dashboardSvc.switchTo(page, params, query);
        update({ app: { page } });
      },
      createRoute: (page, params) => dashboardSvc && dashboardSvc.route(page, params),
      saveModel: (cat) => {
        console.log('Saving');
        localStorage.setItem(dataModelKey, JSON.stringify(cat));
        update({ app: { dataModel: () => cat } });
      },
    };
  },
} as IAppState;
