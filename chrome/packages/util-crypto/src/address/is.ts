// Copyright 2017-2024 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {Prefix} from './types';

import {validateAddress} from './validate';

export function isAddress(
  address?: string | null,
  ignoreChecksum?: boolean,
  ss58Format?: Prefix,
): address is string {
  try {
    return validateAddress(address, ignoreChecksum, ss58Format);
  } catch {
    return false;
  }
}
