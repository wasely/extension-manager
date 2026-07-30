export default defineBackground(() => {
  const enableActionSidePanel = () => {
    void chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error: unknown) => {
        console.error('Failed to configure side panel behavior', error);
      });
  };

  enableActionSidePanel();
  chrome.runtime.onInstalled.addListener(enableActionSidePanel);
});
