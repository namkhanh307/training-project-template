import ready from '../utilities/_helper';
import renderGrid, { FileItem } from '../components/_grid';

ready(() => {
  const myFiles: FileItem[] = [
    {
      name: 'CAS',
      type: 'folder',
      modified: 'April 30',
      modifiedBy: 'Megan Bowen',
      isNew: false,
    },
    {
      name: 'CoasterAndBargeLoading.xlsx',
      type: 'excel',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
    },
    ,
    {
      name: 'RevenueByServices.xlsx',
      type: 'excel',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
    },
    {
      name: 'RevenueByServices2016.xlsx',
      type: 'excel',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
    },
    {
      name: 'RevenueByServices2017.xlsx',
      type: 'excel',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
    },
  ];
  renderGrid(myFiles);
});
