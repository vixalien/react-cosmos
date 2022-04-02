import { waitFor } from '@testing-library/dom';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { FixtureList } from '../../../../../core/types.js';
import {
  mockNotifications,
  mockRouter,
} from '../../../../testHelpers/pluginMocks.js';
import { mockRendererReady } from '../../testHelpers/index.js';

beforeEach(() => jest.isolateModules(() => require('../../index.js')));

afterEach(resetPlugins);

const fixtureId = { path: 'ein.js' };
const fixtures: FixtureList = { [fixtureId.path]: { type: 'single' } };

function registerTestPlugins() {
  const { selectFixture } = mockRouter({
    getSelectedFixtureId: () => null,
  });
  mockNotifications();
  return { selectFixture };
}

function loadTestPlugins() {
  loadPlugins();
}

it('selects initial fixture', async () => {
  const { selectFixture } = registerTestPlugins();

  loadTestPlugins();
  mockRendererReady('mockRendererId', fixtures, { path: 'ein.js' });

  await waitFor(() =>
    expect(selectFixture).toBeCalledWith(expect.any(Object), { path: 'ein.js' })
  );
});