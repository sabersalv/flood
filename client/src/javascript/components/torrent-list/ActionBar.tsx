import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui, Trans} from '@lingui/react';

import {Add, Menu, Remove, Start, Stop, Select} from '@client/ui/icons';
import SettingActions from '@client/actions/SettingActions';
import SettingStore from '@client/stores/SettingStore';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Size from '@client/components/general/Size';
import Action from './Action';
import SortDropdown from './SortDropdown';

const ActionBar: FC = observer(() => {
  const {i18n} = useLingui();
  const {sortTorrents: sortBy, torrentListViewSize} = SettingStore.floodSettings;

  const classes = classnames('action-bar', {
    'action-bar--is-condensed': torrentListViewSize === 'condensed',
  });

  return (
    <nav className={classes}>
      <div className="actions action-bar__item action-bar__item--sidebar-expand-collapse">
        <Action
          label="actionbar.button.sidebar.expand.collapse"
          slug="sidebar-expand-collapse"
          icon={<Menu />}
          clickHandler={() => {
            const view = document.getElementsByClassName('application__view')[0];
            if (view != null) {
              view.classList.toggle('application__view--sidebar-alternative-state');
            }
          }}
          noTip
        />
      </div>
      <div className="actions action-bar__item action-bar__item--sort-torrents">
        <SortDropdown
          direction={sortBy != null ? sortBy.direction : 'desc'}
          onSortChange={(newSortBy) => {
            SettingActions.saveSetting('sortTorrents', newSortBy);
          }}
          selectedProperty={sortBy != null ? sortBy.property : 'dateAdded'}
        />
      </div>
      {TorrentStore.selectedCount > 1 && (
        <div className="actions action-bar__item action-bar__item--selected-status">
          <span>
            <Trans id="actionbar.label.selected.count" values={{count: TorrentStore.selectedCount}} />
          </span>
          <Size className="size" value={TorrentStore.selectedSize} />
        </div>
      )}
      <div className="actions action-bar__item action-bar__item--torrent-operations">
        <div className="action-bar__group">
          <Action
            label={i18n._('actionbar.button.select.torrent')}
            slug="select-torrent"
            icon={<Select />}
            clickHandler={() =>
              TorrentStore.isAllSelected ? TorrentStore.deselectAllTorrents() : TorrentStore.selectAllTorrents()
            }
          />
          <Action
            label={i18n._('actionbar.button.start.torrent')}
            slug="start-torrent"
            icon={<Start />}
            clickHandler={() =>
              TorrentActions.startTorrents({
                hashes: TorrentStore.selectedTorrents,
              })
            }
          />
          <Action
            label={i18n._('actionbar.button.stop.torrent')}
            slug="stop-torrent"
            icon={<Stop />}
            clickHandler={() =>
              TorrentActions.stopTorrents({
                hashes: TorrentStore.selectedTorrents,
              })
            }
          />
        </div>
        <div className="action-bar__group action-bar__group--has-divider">
          <Action
            label={i18n._('actionbar.button.add.torrent')}
            slug="add-torrent"
            icon={<Add />}
            clickHandler={() => UIStore.setActiveModal({id: 'add-torrents'})}
          />
          <Action
            label={i18n._('actionbar.button.remove.torrent')}
            slug="remove-torrent"
            icon={<Remove />}
            clickHandler={() =>
              UIStore.setActiveModal({
                id: 'remove-torrents',
              })
            }
          />
        </div>
      </div>
    </nav>
  );
});

export default ActionBar;
