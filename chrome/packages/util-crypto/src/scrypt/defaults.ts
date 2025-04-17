// Copyright 2017-2024 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {Platform} from 'react-native';
import type {ScryptParams} from './types';

export const DEFAULT_PARAMS: ScryptParams = {
  N: Platform.OS === 'ios' ? 2 ** 12 : 1 << 15,
  p: 1,
  r: 8,
};
