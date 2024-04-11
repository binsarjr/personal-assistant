import { EligibleMetadataKey } from '@app/whatsapp/constants';
import { applyMethodMetadata } from 'src/supports/decorator.support';

export const IsEligible = () => applyMethodMetadata({}, EligibleMetadataKey);
