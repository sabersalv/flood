import {applyPatch, Operation} from 'fast-json-patch';
import {computed, makeAutoObservable} from 'mobx';

import filterTorrents from '@client/util/filterTorrents';
import selectTorrents from '@client/util/selectTorrents';
import sortTorrents from '@client/util/sortTorrents';
import termMatch from '@client/util/termMatch';

import type {TorrentProperties, TorrentList} from '@shared/types/Torrent';

import SettingStore from './SettingStore';
import TorrentFilterStore from './TorrentFilterStore';

class TorrentStore {
  selectedTorrents: Array<string> = [];
  torrents: TorrentList = {};

  constructor() {
    makeAutoObservable(this);
  }

  @computed get sortedTorrents(): Array<TorrentProperties> {
    return sortTorrents(Object.values(this.torrents), SettingStore.floodSettings.sortTorrents);
  }

  @computed get filteredTorrents(): Array<TorrentProperties> {
    const {searchFilter, statusFilter, tagFilter, trackerFilter} = TorrentFilterStore;

    let filteredTorrents = Object.assign([], this.sortedTorrents) as Array<TorrentProperties>;

    if (searchFilter !== '') {
      filteredTorrents = termMatch(filteredTorrents, (properties) => properties.name, searchFilter);
    }

    if (statusFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'status',
        filter: statusFilter,
      });
    }

    if (tagFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter,
      });
    }

    if (trackerFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter,
      });
    }

    return filteredTorrents;
  }

  @computed get selectedCount(): number {
    return this.selectedTorrents.length;
  }

  @computed get selectedSize(): number {
    return this.selectedTorrents.reduce((sum, hash) => sum + this.torrents[hash].sizeBytes, 0);
  }

  @computed get isAllSelected(): boolean {
    return this.selectedTorrents.length === this.filteredTorrents.length;
  }

  setSelectedTorrents({event, hash}: {event: React.KeyboardEvent | React.MouseEvent | React.TouchEvent; hash: string}) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents,
    });
  }

  selectAllTorrents() {
    this.selectedTorrents = this.filteredTorrents.map((v) => v.hash);
  }

  deselectAllTorrents() {
    this.selectedTorrents = [];
  }

  handleTorrentListDiffChange(torrentListDiffs: Operation[]) {
    applyPatch(this.torrents, torrentListDiffs);
  }

  handleTorrentListFullUpdate(torrentList: TorrentList) {
    this.torrents = torrentList;
  }
}

export default new TorrentStore();
