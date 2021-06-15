import { PluginType } from 'mithril-ui-form-plugin';
import m from 'mithril';

export const tablePlugin: PluginType = () => {
  return {
    view: ({ attrs: { field, obj, context } }) => {
      const { id = '', label = '', options = [], max = Number.MAX_SAFE_INTEGER } = field;
      if (obj instanceof Array || !(options instanceof Array)) return;
      const values = (obj[id] ||
        (context instanceof Array ? context[0][id] : context ? context[id] : null)) as Array<
        Record<string, any>
      >;

      return m('table.highlight.responsive-table', { style: 'margin-bottom: 30px' }, [
        label && m('caption', m('strong', label)),
        m(
          'thead',
          m(
            'tr',
            options.map((o) => m('th', o.label))
          )
        ),
        values &&
          m(
            'tbody',
            values
              .filter((_, i) => i < max)
              .map((v) =>
                m(
                  'tr',
                  options.map((o) => m('td', typeof v[o.id] === 'undefined' ? '' : v[o.id]))
                )
              )
          ),
      ]);
    },
  };
};
