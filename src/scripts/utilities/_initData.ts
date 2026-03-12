import { File, Folder } from '../models/entity';
import { ROW_TYPE } from '../models/enum';

export let initFolders: Record<string, Folder> = {
  'cb875544839f44fc9947cd55e81b7ade': {
    id: 'cb875544839f44fc9947cd55e81b7ade',
    name: 'Documents',
    parentId: null,
    type: ROW_TYPE.FOLDER,
    maxSize: 1000,
    modified: new Date().toISOString(),
    modifiedBy: 'System',
    isNew: false,
  },
  '22c1a54960c045cfaa0eefe6e966fcb4': {
    id: '22c1a54960c045cfaa0eefe6e966fcb4',
    name: 'Finance',
    parentId: 'cb875544839f44fc9947cd55e81b7ade',
    type: ROW_TYPE.FOLDER,
    maxSize: 500,
    modified: new Date().toISOString(),
    modifiedBy: 'System',
    isNew: true,
  },
};
export let initFiles: Record<string, File> = {
  '33d2b65071d146d0b858f0f0f0f0f0f0': {
    id: '33d2b65071d146d0b858f0f0f0f0f0f0',
    name: 'Report.pdf',
    parentId: '22c1a54960c045cfaa0eefe6e966fcb4',
    type: ROW_TYPE.FILE,
    extension: 'pdf',
    data: '',
    modified: new Date().toISOString(),
    modifiedBy: 'System',
    isNew: true,
  },
  '568cb6dd3e024376b52f4c0e1e475d01': {
    id: '568cb6dd3e024376b52f4c0e1e475d01',
    name: 'Finance',
    parentId: 'cb875544839f44fc9947cd55e81b7ade',
    type: ROW_TYPE.FILE,
    extension: 'txt',
    data: '',
    modified: new Date().toISOString(),
    modifiedBy: 'System',
    isNew: true,
  },
};