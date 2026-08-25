'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import { useSessionHydration } from '@/hooks/use-session-hydration';
import { I18nProvider } from '@/components/providers/I18nProvider';

// Hydrates Redux from the server session cookie on first mount. Must live
// inside <Provider> to access the dispatch context.
function SessionHydration({ children }: { children: React.ReactNode }) {
  useSessionHydration();
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionHydration>
        <I18nProvider>{children}</I18nProvider>
      </SessionHydration>
    </Provider>
  );
}
