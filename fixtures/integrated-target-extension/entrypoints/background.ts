import { installExtensionManagerBridge } from '@extension-manager/target';

export default defineBackground(() => {
  installExtensionManagerBridge({
    managerExtensionId: 'gpmlcdigokplenooecjmlphknhaidnjf',
  });
});
