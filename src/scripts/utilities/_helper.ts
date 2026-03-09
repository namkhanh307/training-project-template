import { Folder } from "../components/_grid";

const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

export default ready;

export const updateBackButtonVisibility = (navigationHistory: Folder[]): void => {
  const backBtn = document.getElementById('back-btn');
  if (!backBtn) return;

  if (navigationHistory.length > 0) {
    backBtn.classList.remove('d-none');
  } else {
    backBtn.classList.add('d-none');
  }
};