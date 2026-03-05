import ready from '../utilities/_helper';
import renderGrid from '../components/_grid';

ready(() => {
  const myFiles = [
    {
      name: 'Project_Alpha.pdf',
      type: 'PDF',
      modified: 'Mar 05',
      modifiedBy: 'Gemini',
      isNew: true,
    },
    {
      name: 'Old_Backup.zip',
      type: 'Zip',
      modified: 'Jan 01',
      modifiedBy: 'Admin',
      isNew: false,
    },
  ];
  renderGrid('card-container', myFiles);
});
