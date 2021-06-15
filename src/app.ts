import m from 'mithril';
import 'material-icons/iconfont/material-icons.css';
import 'materialize-css/dist/css/materialize.min.css';
import './css/style.css';
import { dashboardSvc } from './services/dashboard-service';
import { registerPlugin } from 'mithril-ui-form';
import { tablePlugin } from './components/ui';

registerPlugin('table', tablePlugin);

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable());
