import { onRouter } from 'react-cosmos-shared2/ui';
import { loadPlugins, resetPlugins } from 'react-plugin';
import {
  popUrlParams,
  pushUrlParams,
  resetUrl,
} from '../../../testHelpers/url';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(() => {
  resetPlugins();
  resetUrl();
});

const fixtureId = { path: 'zwei.js' };

it('emits "fixtureChange" event on "fixtureId" URL param change', () => {
  const { fixtureChange } = onRouter();

  loadPlugins();
  popUrlParams({ fixtureId: JSON.stringify(fixtureId) });

  expect(fixtureChange).toBeCalledWith(expect.any(Object), fixtureId);
});

it('emits "fixtureChange" event on removed "fixtureId" URL param', async () => {
  const { fixtureChange } = onRouter();

  pushUrlParams({ fixtureId: JSON.stringify(fixtureId) });
  loadPlugins();

  // This simulation is akin to going back home after selecting a fixture
  popUrlParams({});

  expect(fixtureChange).toBeCalledWith(expect.any(Object), null);
});
