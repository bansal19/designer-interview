// Copyright 2017-2024 @polkadot/keyring authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {PairInfo} from './types';

import {naclEncrypt, scryptEncode, scryptToU8a} from '@util-crypto/src';
import {u8aConcat} from '@polkadot/util';

import {PAIR_DIV, PAIR_HDR} from './defaults';

/**
 * Encode a pair with the latest generation format (generation 3)
 **/
export function encodePair({publicKey, secretKey}: PairInfo, passphrase?: string): Uint8Array {
  if (!secretKey) {
    throw new Error('Expected a valid secretKey to be passed to encode');
  }

  const encoded = u8aConcat(PAIR_HDR, secretKey, PAIR_DIV, publicKey);

  if (!passphrase) {
    return encoded;
  }

  const {params, password, salt} = scryptEncode(passphrase);
  const {encrypted, nonce} = naclEncrypt(encoded, password.subarray(0, 32));

  return u8aConcat(scryptToU8a(salt, params), nonce, encrypted);
}
