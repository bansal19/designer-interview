// Copyright 2017-2024 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {ScryptParams} from './types';

import {scrypt as scryptJs} from '@noble/hashes/scrypt';

import {hasBigInt, objectSpread, u8aToU8a} from '@polkadot/util';
import {isReady, scrypt} from '@polkadot/wasm-crypto';

import {Platform} from 'react-native';
import {randomAsU8a} from '../random/asU8a';
import {DEFAULT_PARAMS} from './defaults';

interface Result {
  params: ScryptParams;
  password: Uint8Array;
  salt: Uint8Array;
}

export function scryptEncode(
  passphrase?: string | Uint8Array,
  salt = randomAsU8a(),
  params = DEFAULT_PARAMS,
  onlyJs?: boolean,
): Result {
  const u8a = u8aToU8a(passphrase);

  return {
    params,
    password:
      Platform.OS === 'ios'
        ? scryptJs(u8a, salt, objectSpread({dkLen: 64}, params))
        : !hasBigInt || (!onlyJs && isReady())
          ? scrypt(u8a, salt, Math.log2(params.N), params.r, params.p)
          : scryptJs(u8a, salt, objectSpread({dkLen: 64}, params)),
    salt,
  };
}
