import { hasMembersBinConfigured } from '../../jsonbin/jsonbinEnv';

export function hasMembersRemote(): boolean {
  return hasMembersBinConfigured();
}
