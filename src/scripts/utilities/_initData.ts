import { Folder } from "../models/entity";

export let rootFolder: Folder = {
  name: 'Root',
  path: '/',
  subFolders: [
    {
      name: 'CAS',
      path: '/CAS',
      subFolders: [],
      files: [
        {
          name: 'Internal_Document.xlsx',
          extension: 'xlsx',
          modified: 'May 1',
          modifiedBy: 'Megan Bowen',
          isNew: false,
          data: '',
          type: 'file',
        },
      ],
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: false,
      type: 'file',
    },
  ],
  files: [
    {
      name: 'CoasterAndBargeLoading.xlsx',
      extension: 'xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
      data: '',
      type: 'file',
    },
    {
      name: 'RevenueByServices.xlsx',
      extension: 'xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
      data: '',
      type: 'file',
    },
  ],
  modified: 'A few seconds ago',
  modifiedBy: 'Administrator MOD',
  isNew: true,
  type: 'folder',
};