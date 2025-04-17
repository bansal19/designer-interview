// Copyright 2017-2024 @polkadot/keyring authors & contributors
// SPDX-License-Identifier: Apache-2.0

// all external
// eslint-disable-next-line deprecation/deprecation
export {decodeAddress, encodeAddress, setSS58Format} from '@util-crypto/src';

// all named
export {Keyring} from './keyring';
export {packageInfo} from './packageInfo';
export {createPair} from './pair/index';
export {createTestKeyring} from './testing';
export {createTestPairs} from './testingPairs';

// all starred
export * from './defaults';
