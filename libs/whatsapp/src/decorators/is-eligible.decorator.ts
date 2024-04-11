import { applyMethodMetadata } from '../../../../src/supports/decorator.support';
import { EligibleMetadataKey } from '../constants';

export const IsEligible = () => applyMethodMetadata({}, EligibleMetadataKey);
