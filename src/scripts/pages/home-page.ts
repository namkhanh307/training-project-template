import ready from '../utilities/_helper';
import renderGrid, { FileItem } from '../components/_grid';

ready(() => {
  const myFiles: FileItem[] = [
    {
      name: 'Project_Alpha.pdf',
      type: 'folder',
      modified: 'Mar 05',
      modifiedBy: 'Gemini',
      isNew: true,
    },
    {
      name: 'Old_Backup.zip',
      type: 'excel',
      modified: 'Jan 01',
      modifiedBy: 'Admin',
      isNew: false,
    },
  ];
  renderGrid(myFiles);
});
