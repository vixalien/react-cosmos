import path from 'path';
import url from 'url';
import { createFixtureTree } from '../../core/fixtureTree/createFixtureTree/index.js';
import { flattenFixtureTree } from '../../core/fixtureTree/flattenFixtureTree.js';
import {
  stringifyPlaygroundUrlQuery,
  stringifyRendererUrlQuery,
} from '../../core/playgroundUrl.js';
import { getFixtureListFromExports } from '../../core/react/getFixtureList.js';
import { getSortedDecoratorsForFixturePath } from '../../core/react/getSortedDecoratorsForFixturePath.js';
import {
  ReactDecorator,
  ReactDecorators,
  ReactFixture,
  ReactFixtureMap,
} from '../../core/react/types.js';
import { FixtureId } from '../../core/types.js';
import { getDecoratedFixtureElement } from '../../renderer/FixtureLoader/getDecoratedFixtureElement/index.js';
import { CosmosConfig } from '../cosmosConfig/types.js';
import { RENDERER_FILENAME } from '../shared/playgroundHtml.js';
import { getUserModules } from '../userDeps/getUserModules.js';

export type FixtureApi = {
  absoluteFilePath: string;
  fileName: string;
  getElement: () => React.ReactElement<any>;
  name: string | null;
  parents: string[];
  playgroundUrl: string;
  relativeFilePath: string;
  rendererUrl: string;
  treePath: string[];
};

export function getFixtures(cosmosConfig: CosmosConfig) {
  const { fixturesDir, fixtureFileSuffix, rootDir } = cosmosConfig;

  const fixtureInfo: FixtureApi[] = [];
  const { fixtures, decorators } = getUserModules(cosmosConfig);
  const fixtureList = getFixtureListFromExports(fixtures);
  const fixtureTree = createFixtureTree({
    fixtures: fixtureList,
    fixturesDir,
    fixtureFileSuffix,
  });
  const flatFixtureTree = flattenFixtureTree(fixtureTree);
  flatFixtureTree.forEach(({ fileName, fixtureId, name, parents }) => {
    const fixtureExport = fixtures[fixtureId.path];
    const fixture: ReactFixture =
      fixtureId.name === undefined
        ? fixtureExport
        : (fixtureExport as ReactFixtureMap)[fixtureId.name];

    const treePath = [...parents, fileName];
    if (name) treePath.push(name);

    fixtureInfo.push({
      absoluteFilePath: path.join(rootDir, fixtureId.path),
      fileName,
      getElement: createFixtureElementGetter(
        fixture,
        fixtureId.path,
        decorators
      ),
      name,
      parents,
      playgroundUrl: getPlaygroundUrl(cosmosConfig, fixtureId),
      relativeFilePath: fixtureId.path,
      rendererUrl: getRendererUrl(cosmosConfig, fixtureId),
      treePath,
    });
  });

  return fixtureInfo;
}

function getPlaygroundUrl(cosmosConfig: CosmosConfig, fixtureId: FixtureId) {
  const host = getPlaygroundHost(cosmosConfig);
  const query = stringifyPlaygroundUrlQuery({ fixtureId });
  return `${host}/?${query}`;
}

function getRendererUrl(cosmosConfig: CosmosConfig, fixtureId: FixtureId) {
  const { publicUrl, experimentalRendererUrl } = cosmosConfig;
  const query = stringifyRendererUrlQuery({ _fixtureId: fixtureId });
  if (experimentalRendererUrl) return `${experimentalRendererUrl}?${query}`;

  const host = getPlaygroundHost(cosmosConfig);
  const urlPath = url.resolve(publicUrl, RENDERER_FILENAME);
  return `${host}${urlPath}?${query}`;
}

function getPlaygroundHost({ hostname, port, https }: CosmosConfig) {
  return `${https ? 'https' : 'http'}://${hostname || 'localhost'}:${port}`;
}

function createFixtureElementGetter(
  fixture: ReactFixture,
  fixturePath: string,
  decoratorsByPath: ReactDecorators
): () => React.ReactElement<any> {
  const decorators: ReactDecorator[] = getSortedDecoratorsForFixturePath(
    fixturePath,
    decoratorsByPath
  );
  return () =>
    getDecoratedFixtureElement(fixture, decorators, {
      fixtureState: {},
      setFixtureState: () => {},
      onErrorReset: () => {},
    });
}