import { getCommunityBinId, hasJsonBinAccessKey } from '../../jsonbin/jsonbinEnv';

export const COMMUNITY_BIN_ID = getCommunityBinId();

export const hasRemoteStore = Boolean(COMMUNITY_BIN_ID && hasJsonBinAccessKey());
