// Copyright 2017-2024 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {Keypair} from '../types';
import type {DeriveJunction} from './DeriveJunction';

import {sr25519DeriveHard} from '../sr25519/deriveHard';
import {sr25519DeriveSoft} from '../sr25519/deriveSoft';

export function keyHdkdSr25519(keypair: Keypair, {chainCode, isSoft}: DeriveJunction): Keypair {
  return isSoft ? sr25519DeriveSoft(keypair, chainCode) : sr25519DeriveHard(keypair, chainCode);
}
