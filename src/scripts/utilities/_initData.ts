import { Folder } from "../models/entity";

export let rootFolder: Folder = {
  name: 'Root',
  path: '/',
  subFolders: [
    {
      name: 'CAS',
      path: '/CAS',
      subFolders: [],
      files: [],
      modified: '2026-03-10T10:57:54.553Z',
      modifiedBy: 'Administrator MOD',
      isNew: false,
      type: 'file',
    },
  ],
  files: [
    {
        name: 'CoasterAndBargeLoading.xlsx',
        extension: 'xlsx',
        modified: '2026-03-10T10:57:54.553Z',
        modifiedBy: 'Administrator MOD',
        isNew: true,
        data: '',
        type: 'file',
        path: ""
    },
    {
        name: 'RevenueByServices.xlsx',
        extension: 'xlsx',
        modified: '2026-03-10T10:57:54.553Z',
        modifiedBy: 'Administrator MOD',
        isNew: true,
        data: '',
        type: 'file',
        path: ""
    },
  ],
  modified: '2026-03-10T10:57:54.553Z',
  modifiedBy: 'Administrator MOD',
  isNew: true,
  type: 'folder',
};